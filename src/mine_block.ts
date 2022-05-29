import { canonicalize } from "json-canonicalize";
import { chain_tip, max_height, valid_pow } from "./block";
import { add_mined_object } from "./db";
import { hash_string } from "./helpers";
import { mempool } from "./mempool";
import { receive_object } from "./object";
import { all_sockets, broadcast, send_format } from "./socket";
import { Worker } from 'worker_threads';

let MAX = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF;
let nonce_curr = Math.floor(Math.random() * (MAX + 1));
let chain_tip_mine = chain_tip;

export const worker = new Worker('./src/index.ts');
console.log("working")
worker.on('message', (result) => {
    console.log(result)
    if(result.type == "chaintip"){
        chain_tip_mine = result.blockid;
    } else {
        console.log(result);
    }
  });

function create_mining_coinbase(height: number) {
	return JSON.stringify({ 
        "type": "transaction", 
        "height": height, 
        "outputs": [ 
            { "pubkey": "e0eaa0c60d40b357361be9155dfc125d68512bed2143474a4eb3242fdc2ed571", "value": 50000000000 } 
        ] 
    })
}



while (true){
    // console.log(
    //     'Mining block ' + nounce_curr + '...'
    // )
    let coinbase:string = create_mining_coinbase(max_height + 1);
    let block_curr = { 
        "type": "block", 
        "txids": [coinbase].concat(mempool), 
        "nonce": nonce_curr, 
        "previd": chain_tip_mine, 
        "created": Date.now() / 1000, 
        "T": "00000002af000000000000000000000000000000000000000000000000000000", 
        "miner": "lzjbyn", 
        "note": "text 650-709-6507 to buy" 
    };

    let blockid = hash_string(canonicalize(block_curr));
    if (valid_pow(block_curr, blockid, null)){
        console.log("BLOCK MINED: " + blockid);
        broadcast(all_sockets, send_format({
            "type": "object", 
            "object":block_curr
        }));
        add_mined_object(blockid, canonicalize(block_curr));
        add_mined_object(blockid, canonicalize(coinbase));
        receive_object(JSON.stringify(block_curr), null);
    }
    nonce_curr++;
    if (nonce_curr > MAX){
        nonce_curr = 0;
    }
}

// expose(async function mine(){
//     while (true){
//         console.log("Mining...");
//         let coinbase:string = create_mining_coinbase(max_height + 1);
//         let block_curr = { 
//             "type": "block", 
//             "txids": [coinbase].concat(mempool), 
//             "nonce": nounce_curr, 
//             "previd": chain_tip_mine, 
//             "created": Date.now() / 1000, 
//             "T": "00000002af000000000000000000000000000000000000000000000000000000", 
//             "miner": "lzjbyn", 
//             "note": "text 650-709-6507 to buy" 
//         };

//         let blockid = hash_string(canonicalize(block_curr));
//         if (valid_pow(block_curr, blockid, null)){
//             console.log("BLOCK MINED: " + blockid);
//             broadcast(all_sockets, send_format({
//                 "type": "object", 
//                 "object":block_curr
//             }));
//             add_mined_object(blockid, canonicalize(block_curr));
//             add_mined_object(blockid, canonicalize(coinbase));
//             receive_object(JSON.stringify(block_curr), null);
//         }
//         nounce_curr++;
//         if (nounce_curr > MAX){
//             nounce_curr = 0;
//         }
//     }
// })

// export async function mine(){
//     while (true){
//         let coinbase:string = create_mining_coinbase(max_height + 1);
//         let block_curr = { 
//             "type": "block", 
//             "txids": [coinbase].concat(mempool), 
//             "nonce": nounce_curr, 
//             "previd": chain_tip, 
//             "created": Date.now() / 1000, 
//             "T": "00000002af000000000000000000000000000000000000000000000000000000", 
//             "miner": "lzjbyn", 
//             "note": "text 650-709-6507 to buy" 
//         };

//         let blockid = hash_string(canonicalize(block_curr));
//         if (valid_pow(block_curr, blockid, null)){
//             console.log("BLOCK MINED: " + blockid);
//             broadcast(all_sockets, send_format({
//                 "type": "object", 
//                 "object":block_curr
//             }));
//             add_mined_object(blockid, canonicalize(block_curr));
//             add_mined_object(blockid, canonicalize(coinbase));
//             receive_object(JSON.stringify(block_curr), null);
//         }
//         nounce_curr++;
//         if (nounce_curr > MAX){
//             nounce_curr = 0;
//         }
//     }
// }


