import { send_format, socket_error} from "./socket";
import { has_object } from "./db";
import * as ed from '@noble/ed25519';
var nacl = require('tweetnacl');
nacl.util = require('tweetnacl-util');

export const privateKey = ed.utils.randomPrivateKey();

//TODO: socket error should not close socket
//TODO: check if object has txid : has_txid; returns: (bool: found or not; index: index of txid; object)))

export async function validate_tx_object(object:any, socket:any) {
    if (!object.hasOwnProperty("outputs")){
        socket_error(object, socket, "Transaction object does not have outputs");
        return false;
    }
    for(let output of object.outputs){
        if (!output.hasOwnProperty("pubkey") || !output.hasOwnProperty("value")){
            socket_error(object, socket, "Some transaction output does not have pubkey or value");
            return false;
        }
    }

    if (object.hasOwnProperty("height")){
        return validate_coinbase(object, socket);
    } 

    else if (object.hasOwnProperty("inputs")){
        if(object.inputs.length == 0){
            socket_error(object, socket, "Transaction does not have any inputs");
            return false;
        }
        return await validate_transaction(object, socket);
    }
    
    socket_error(socket, "Transaction object does not include required keys");
    return false;
}

// {
//     "object":{
//         "height":0,
//         "outputs":[{
//             "pubkey":"8dbcd2401c89c04d6e53c81c90aa0b551cc8fc47c0469217c8f5cfbae1e911f9",
//             "value":50000000000
//         }],
//         "type":"transaction"
//     },
//     "type":"object"
// }


export function validate_coinbase(object: any, socket:any) {
    //TODO: implement in next assignments
    return true;
}

export async function validate_transaction(object: any, socket:any){
    let keys = [];
    for (let input of object.inputs){
        if (!input.hasOwnProperty("outpoint") || !input.hasOwnProperty("sig")){
            socket_error(object, socket, "Some transaction input does not have outpoint or sig");
            return false;
        }
        if (!input.outpoint.hasOwnProperty("txid") || !input.outpoint.hasOwnProperty("index")){
            socket_error(object, socket, "Some transaction input outpoint does not have txid or index");
            return false;
        }
        //check if outpoint txid exists
        let key = await has_object(input.outpoint.txid).then(async (in_db, prev_object) => {
            if (!<any>in_db){
                socket_error(object, socket, "Some transaction input outpoint does not have a valid txid");
                return false;
            }
            
        });
        // TODO: which should this be?
        // if (input.outpoint.index < ){
        //     socket_error(object, socket, "Some transaction input outpoint has an invalid index");
        //     return false;
        // }
    }
    let message = JSON.parse(JSON.stringify(object))
    for (let input of message.inputs){
        let sig = Uint8Array.from(Buffer.from(input.sig, 'hex'))
        delete input.sig;
        let mes = nacl.util.decodeUTF8(JSON.stringify(input));
        let isValid = await ed.verify(sig, message, publicKey);
    }
    
}

let ob = {
    "object":{
        "inputs":[{
            "outpoint":{"index":0,
                "txid":"1bb37b637d07100cd26fc063dfd4c39a7931cc88dae3417871219715a5e374af"
            },
            "sig":"1d0d7d774042607c69a87ac5f1cdf92bf474c25fafcc089fe667602bfefb0494726c519e92266957429ced875256e6915eb8     cea2ea66366e739415efc47a6805"
        }],    
        "outputs":[{
            "pubkey":"8dbcd2401c89c04d6e53c81c90aa0b551cc8fc47c0469217c8f5cfbae1e911f9",
            "value":10
        }],
        "type":"transaction"
    },
    "type":"object"
}

(async () => {
    // keys, messages & other inputs can be Uint8Arrays or hex strings
    // Uint8Array.from([0xde, 0xad, 0xbe, 0xef]) === 'deadbeef'
    const message = Uint8Array.from([0xab, 0xbc, 0xcd, 0xde]);
    const publicKey = await ed.getPublicKey(privateKey);
    const signature = await ed.sign(message, privateKey);
    const isValid = await ed.verify(signature, message, publicKey);
  })();