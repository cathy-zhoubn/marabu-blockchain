import { get_object, get_UTXO_table, save_to_UTXO_table } from "./db"
import { socket_error} from "./socket";
import { canonicalize } from 'json-canonicalize';



export async function validate_UTXO(previd: string, currentid: string, txids: [string], socket: any){
	//get the previous UTXO set
	//for each of current tx's
	//get the transaction object
	//validate each input outpoints in UTXO
	//remove each input
	//add each output's index to UTXO
	const utxo = await get_UTXO_table(previd)

	for(let txid of txids){
		let tx_string = await get_object(txid)
		if(tx_string == 0){
			socket_error(txid, socket, "cannot find a transaction with a txid in validate_UTXO");
			return false
		}
		let tx = JSON.parse(tx_string)

		if (tx.hasOwnProperty("inputs")){
			for(let input of tx.inputs){
				let outpoint = canonicalize(input.outpoint)
				if(!utxo.has(outpoint)){
					socket_error(txid, socket, "previous UTXO does not contain a transaction input");
					return false
				}
				utxo.delete(outpoint)
			}
		}

		for(let i=0; i<tx.outputs.length; i++){
			utxo.add(canonicalize({"txid": txid, "index": i}))
		}
	}


	save_to_UTXO_table(currentid, utxo)

	return true;
}
