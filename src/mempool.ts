import { Stack } from "stack-typescript";
import { get_object, has_object } from "./db";
import { all_sockets, broadcast, send_format } from "./socket";
import { hash_string } from "./helpers";
import { canonicalize } from "json-canonicalize";


export async function reorg_mempool(ctid_new:any, ctid_old:any, h_new:any, h_old:any, socket:any){
    let h_diff = h_new - h_old;
    let ct_new = JSON.parse(await get_object(ctid_new));
    let ct_old = JSON.parse(await get_object(ctid_old));
    let curr_new = ct_new; // pointer tracing back from new chain
    // blocks that are in the new chain, encountered in the backtracking
    let forward_stack = new Stack(); // stack for blocks in the new chain

    // trace back h_diff steps to before
    for (let i = 0; i < h_diff; i++){
        forward_stack.push(curr_new);
        curr_new = JSON.parse(await get_object(curr_new.previd));
    }
    // no reorg, just tupdate
    if (canonicalize(curr_new) == canonicalize(ct_old)){
        while(forward_stack.size){
            let temp_block:any = forward_stack.pop();
            for (let txid of temp_block.txids){
                update_mempool(txid, socket);
            }
        }
        return;
    }

    // needs chain reorg
    let backward_stack = new Stack(); // stack for blocks in the old chain
    let curr_old = ct_old; // pointer tracing back from old chain
    // trace back to the common ancestor
    while (canonicalize(curr_old) != canonicalize(curr_new)){
        forward_stack.push(curr_new);
        backward_stack.push(curr_old);
        curr_new = JSON.parse(await get_object(curr_new.previd));
        curr_old = JSON.parse(await get_object(curr_old.previd));
    }
    

    var previous = 0;
    while(true){
        let prev_block = JSON.parse(await get_object(previd));
        if(prev_block.previd == null){ //genesis
            return previous;
        }
        if(prev_block.txids.length > 0){
            let tx = JSON.parse(await get_object(prev_block.txids[0]));
            if(tx.hasOwnProperty("height")){
                return previous + tx.height;
            }
        }
        previd = prev_block.previd;
        previous++;
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