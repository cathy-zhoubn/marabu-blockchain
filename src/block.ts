import { socket_error, send_format } from "./socket";
import { canonicalize } from 'json-canonicalize';
import { hash_string, is_ascii, is_hex} from "./helpers";
import { has_object, get_object } from "./db";
import { send_getobject } from "./object";
import { validate_coinbase } from "./transaction";
import { validate_UTXO } from "./utxo";
import { reorg_mempool } from "./mempool";

const coinbase_reward = 50e12;
export const checking_previd = new Set();
export const checking_previd_received = new Map<string, boolean>();

export let chain_tip:any = "00000000a420b7cefa2b7730243316921ed59ffe836e111ca3801f82a4f5360e"; // blockid of the chain tip
export let max_height:number = 0; // length of the longest chain

export async function validate_block(data:any, socket:any){
    let blockid = hash_string(canonicalize(data));
    if(blockid == "00000000a420b7cefa2b7730243316921ed59ffe836e111ca3801f82a4f5360e") return true;

    if (!data.hasOwnProperty("T") || data.T != "00000002af000000000000000000000000000000000000000000000000000000"){
        socket_error(data, socket, "Block does not have valid target.");
        return false;
    }
    // Check proof of work
    if (!valid_pow(data, blockid, socket)) return false; 
    if (!data.hasOwnProperty("created") || typeof data.created != "number"){
        socket_error(data, socket, "Block does not have a valid timestamp.");
        return false;
    }

    if (!data.hasOwnProperty("txids") || !Array.isArray(data.txids)){
        socket_error(data, socket, "Block does not have a valid list of txids.");
        return false;
    }
    if (!data.hasOwnProperty("nonce") || !is_hex(data.nonce, socket) || data.nonce.length != 64){
        socket_error(data, socket, "Block does not have a valid nonce.");
        return false;
    }
    if (!data.hasOwnProperty("previd")){
        socket_error(data, socket, "Block does not have a valid previd.");
        return false;
    } 
    if (data.previd == null){
        if (!validate_genesis(data, socket)) return false;
    } else {
        if ((!is_hex(data.previd, socket) || data.previd.length != 64)){
            socket_error(data, socket, "Block does not have a valid previd.");
            return false;
        } 
    
        if(!await validate_previd(data.previd, socket)) {  //recursively check previd
            socket_error(data, socket, "Some previous blocks are invalid");
            return false;
        }

        if (!await check_timestamp(data.created, data.previd)){
            socket_error(data, socket, "Invalid creation time");
            return false;
        }
    }

    if (data.hasOwnProperty("miner") && (!is_ascii(data.miner) || data.miner.length > 128)){

        socket_error(data, socket, "Block has an invalid miner.");
        return false;
    }
    if (data.hasOwnProperty("note") && (!is_ascii(data.note) || data.note.length > 128)){
        socket_error(data, socket, "Block has an invalid note.");
        return false;
    }
    // validate all txids
    if (!await validate_txids(data, socket)) return false;

    if (! await validate_UTXO(data.previd, blockid, data.txids, socket)){
        return false;
    }
    
    // update chain tip if all checks pass
    await update_chain_tip(data, blockid, socket);
    return true;

}

function valid_pow(block: any, blockid:string, socket: any) {
    let blockid_num = parseInt(blockid, 16);
    let target_num = parseInt(block.T, 16);
    if (blockid_num >= target_num){
        socket_error(block, socket, "Block does not meet proof of work requirements.");
        return false;
    }
    return true;
}

async function validate_txids(block:any, socket:any) {
    // send getobject if txid is not in db
    for (let txid of block.txids){
        await send_getobject(txid, socket);
    }
    // confirm all txids are in the database
    for (let txid of block.txids){
        if (!await has_object(txid)){
            socket_error(block, socket, "Block contains an invalid txid.");
            return false;
        }
    }
    let coinbase = null;
    let coinbase_id = null;
    //check if first is a coinbase
    for (let i=0; i<block.txids.length; i++){
        let txid = block.txids[i];
        let tx = JSON.parse(await get_object(txid));
        // this coinbase should be the first
        if ((!tx.hasOwnProperty("inputs")) && (tx.hasOwnProperty("height"))){
            // if coinbase is not the first
            if (i != 0){
                socket_error(block, socket, "Coinbase transaction is not the first transaction in the block.");
                return false;
            }
            // coinbase is the first -> validate
            if (!validate_coinbase(tx, socket)) return false;
            if (tx.height != await get_block_height(block.previd)) {
                socket_error(block, socket, "Incorrect coinbase height");
                return false;
            }
            if (!await validate_coinbase_conservation(block, tx, socket)) return false;
            coinbase = tx;
            coinbase_id = txid;
        }
        // check all other tx does not spend from coinbase
        if (coinbase != null && txid != coinbase_id){
            for (let txin of tx.inputs){
                if (txin.outpoint.txid == coinbase_id){
                    socket_error(block, socket, "Block contains transaction that spends from coinbase.");
                    return false;
                }
            }
        }
    }
    return true;
}

//  validate law of conservation for the coinbase
async function validate_coinbase_conservation(block: any, coinbase_tx:any, socket: any) {
    
    let max = coinbase_reward;
    for (let i=1; i<block.txids.length; i++){
        let txid = block.txids[i];
        let tx = JSON.parse(await get_object(txid));
        if (tx.hasOwnProperty("inputs")){
            for (let input of tx.inputs){
                let prev_tx = JSON.parse(await get_object(input.outpoint.txid));
                let prev_output = prev_tx.outputs[input.outpoint.index];
                max += prev_output.value;
            }
            for (let output of tx.outputs){
                max -= output.value;
            }
        }
    }
    if (coinbase_tx.outputs[0].value > max){
        socket_error(block, socket, "Coinbase transaction does not meet conservation requirements.");
        return false;
    }
    return true;
}

function validate_genesis(data: any, socket: any) {
    return (hash_string(canonicalize(data)) == "00000000a420b7cefa2b7730243316921ed59ffe836e111ca3801f82a4f5360e")
}

async function validate_previd(previd: string, socket: any){
    if(await has_object(previd)){
        return true
    }

    send_getobject(previd, socket);
    checking_previd.add(previd);
    checking_previd_received.set(previd, false)

    var valid = false;
    let start = Date.now()
    while(checking_previd.has(previd) && (checking_previd_received.get(previd)? true : Date.now() - start < 3000)){
        valid = await has_object(previd);
        if(valid) {
            checking_previd.delete(previd);
            checking_previd_received.delete(previd);
            break;
        }
    }

    if(!checking_previd_received.get(previd) && checking_previd.has(previd)){ //if the message is never sent
        checking_previd.delete(previd);
        checking_previd_received.delete(previd);
    }

    return valid;
}

export async function get_block_height(previd: string){
    var previous = 1;
    while(true){
        let has_ob = await has_object(previd);
        console.log("has_ob", has_ob); // TODO
        let prev_block = JSON.parse(await get_object(previd));
        console.log("prev_block" + JSON.stringify(prev_block))
        if(prev_block.previd == null){ //genesis
            return previous;
        }
        // if(prev_block.txids.length > 0){
        //     let tx = JSON.parse(await get_object(prev_block.txids[0]));
        //     if(tx.hasOwnProperty("height")){
        //         return previous + tx.height;
        //     }
        // }
        previd = prev_block.previd;
        previous++;
    }
}

async function check_timestamp(created: number, previd: string){
    var currentTime = + new Date();
    let prev_block = JSON.parse(await get_object(previd));
    return (created > prev_block.created && created < currentTime);
}

async function update_chain_tip(block: any, blockid:any, socket:any) {
    // if height is larger than previous, then it's a new chaintip!

    let block_height = await get_block_height(block.previd);
    if (block_height > max_height){
        reorg_mempool(blockid, chain_tip, block_height, max_height, socket);
        max_height = block_height;
        chain_tip = blockid;
        console.log("New chain tip to update: " + blockid);
        return true;
    }
    return false;
}

export function send_chaintip(socket: any) {
    socket.write(send_format({
            type: "chaintip",
            blockid: chain_tip,
        })
    );
}

export async function receive_chaintip(blockid:any, socket:any){
    // if chaintip is not the same as the current chain tip, then update
    console.log("IN RECEIED CHAINITP FUNC");
    console.log(blockid)
    console.log(chain_tip)
    if (blockid != chain_tip){
        console.log("has this chaintip?" + await has_object(blockid));
        if (await has_object(blockid)){
            let block = JSON.parse(await get_object(blockid));
            console.log("Received chaintip: " + JSON.stringify(block));
            await update_chain_tip(block, blockid, socket);
        }
        else {
            send_getobject(blockid, socket);
        }
        // await has_object(blockid).then(async (val) => {
        //     if (<any>val){
        //         // if we have object, then check if chain tip is up to date
        //         await get_object(blockid).then(async (result) => {
        //             let block = JSON.parse(result);
        //             await update_chain_tip(block, blockid, socket);
        //         });
        //     } else {
        //         // if we don't have object, then send getobject and validate
        //         send_getobject(blockid, socket);
        //     }
        // });
    }
}
