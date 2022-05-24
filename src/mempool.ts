import { Stack } from "stack-typescript";
import { get_object, get_UTXO_table, has_object } from "./db";
import { all_sockets, broadcast, send_format } from "./socket";
import { hash_string } from "./helpers";
import { canonicalize } from "json-canonicalize";


export let mempool : Array<string> = []; //txids
export let temp_utxo = new Set(); //outpoints in canonicalized string format

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

    mempool.push(txid)
}

export async function reorg_mempool(ctid_new:any, ctid_old:any, h_new:any, h_old:any, socket:any){
    let old_mempool = mempool
    mempool = new Array<string>();
    temp_utxo = new Set();
    
    // update utxo
    let utxo = await get_UTXO_table(ctid_new);
    for(let tx of utxo){
        temp_utxo.add(tx);
    }
    
    let h_diff = h_new - h_old;
    let ct_new = JSON.parse(await get_object(ctid_new));
    let ct_old = JSON.parse(await get_object(ctid_old));
    let curr_new = ct_new; // pointer tracing back from new chain
    
    // no reorg, just update
    if (canonicalize(curr_new) == canonicalize(ct_old)){
        for (let txid of old_mempool){
            update_mempool(txid);
        }
        return;
    }

    // needs chain reorg
    let backward_stack = new Stack(); // stack for blocks in the old chain
    let curr_old = ct_old; // pointer tracing back from old chain
    
    // trace back to the common ancestor
    while (canonicalize(curr_old) != canonicalize(curr_new)){
        backward_stack.push(curr_old);
        curr_new = JSON.parse(await get_object(curr_new.previd));
        curr_old = JSON.parse(await get_object(curr_old.previd));
    }

    // add tx in reorged blocks into mempool
    while(backward_stack.size){
        let temp_block:any = backward_stack.pop();
        for (let txid of temp_block.txids){
            update_mempool(txid);
        }
    }
    // add old mempool to mempool
    for (let txid of old_mempool){
        update_mempool(txid);
    }   
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