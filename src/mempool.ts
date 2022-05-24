import { get_object, has_object } from "./db";
import { all_sockets, broadcast, send_format } from "./socket";
import { hash_string } from "./helpers";
import { canonicalize } from "json-canonicalize";


export const mempool = new Set<string>(); //txids
export const temp_utxo = new Set(); //outpoints in canonicalized string format

export function update_mempool(tx: any) {
    //for each outpoint see if temp_utxo has it

    let txid = hash_string(canonicalize(tx));
    
    for(let input of tx.inputs){
        let outpoint = input.outpoint
        if(!temp_utxo.has(canonicalize(outpoint))){
            return
        }
    }

    // if it reaches here it means it is a valid mempool transaction wrt temp_utxo
    // remove inputs from temp_utxo, add outpoints to temp_utxo
    // add txid to mempool

    for(let input of tx.inputs){
        let outpoint = input.outpoint
        temp_utxo.delete(canonicalize(outpoint))
    }

    for(let i=0; i<tx.outputs.length; i++){
        temp_utxo.add(canonicalize({"txid": txid, "index": i}))
    }

    mempool.add(txid)
}

export function get_objects_in_mempool(txids:any) {
    for (let txid of txids) {
        has_object(txid).then((result) => {
            if (!<any>result){
                broadcast(all_sockets, send_format({
                    type: "getobject",
                    objectid: txid
                }));
            } else {
                get_object(txid).then((result) => {
                    update_mempool(JSON.parse(result));
                });
            }
        });
    }
}