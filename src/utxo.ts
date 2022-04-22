import { has_object, get_object, get_UTXO_table, save_to_UTXO_table } from "./db"
import { validate_tx_object } from "./transaction"
import { socket_error} from "./socket";


export async function validate_UTXO(previd: string, currentid: string, txids: [string], socket: any){

	//get the previous UTXO set
	//for each of current tx's
	//get the transaction object
	//validate each input outpoints in UTXO
	//remove each input
	//add each output's index to UTXO
	const utxo = await get_UTXO_table(previd)	
	if(utxo == 0){
		socket_error(previd, socket, "cannot find a utxo set associated with the previous blockid");
		return false
	}

	const added_utxo = new Set()

	for(let txid of txids){
		let tx_string = await get_object(txid)
		if(tx_string == 0){
			socket_error(txid, socket, "cannot find a transaction with a txid in validate_UTXO");
			return false
		}
		let tx = JSON.parse(tx_string)

		if (tx.hasOwnProperty("inputs")){
			for(let input of tx.inputs){
				let outpoint = input.outpoint
				if(!utxo.has(outpoint)){
					socket_error(txid, socket, "previous UTXO does not contain a transaction input");
					return false
				}
				utxo.delete(outpoint)
			}
		}

		for(let i=0; i<tx.outputs.length; i++){
			added_utxo.add({"txid": txid, "index": i})
		}
	}

	added_utxo.forEach((i) => {
		utxo.add(i)
	})
	save_to_UTXO_table(currentid, utxo)

	return true;
}


// let [key, val] = await get_object(txid).then((prev_tx) => {
// 	prev_tx = JSON.parse(prev_tx);
// 	if (index >= prev_tx.outputs.length){
// 		socket_error(txid, socket, "Transaction input index exeeds limit");
// 		return [-1, -1];
// 	}
// 	return [prev_tx.outputs[index].pubkey, prev_tx.outputs[index].value];
// });