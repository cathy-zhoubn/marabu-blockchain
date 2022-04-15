import { send_format, socket_error} from "./socket";
import { has_object, get_object } from "./db";
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
    for (let input of object.inputs){
        if (!validate_input(object, input, socket)){
            return false;
        }
    }

    return true;
}

let ob = {
    "object":{
        "inputs":[{
            "outpoint":{"index":0,
                "txid":"1bb37b637d07100cd26fc063dfd4c39a7931cc88dae3417871219715a5e374af"
            },
            "sig":"1d0d7d774042607c69a87ac5f1cdf92bf474c25fafcc089fe667602bfefb0494726c519e92266957429ced875256e6915eb8cea2ea66366e739415efc47a6805"
        }],    
        "outputs":[{
            "pubkey":"8dbcd2401c89c04d6e53c81c90aa0b551cc8fc47c0469217c8f5cfbae1e911f9",
            "value":10
        }],
        "type":"transaction"
    },
    "type":"object"
}

async function validate_input(object:any, input:any, socket:any){
    if (!input.hasOwnProperty("outpoint") || !input.hasOwnProperty("sig")){
        socket_error(object, socket, "Some transaction input does not have outpoint or sig");
        return -1;
    }
    if (!input.outpoint.hasOwnProperty("txid") || !input.outpoint.hasOwnProperty("index")){
        socket_error(object, socket, "Some transaction input outpoint does not have txid or index");
        return -1;
    }
    //check if outpoint txid exists
    let key = await has_object(input.outpoint.txid).then(async (val) => {
            if (<any>val){
                let key:any = await get_object(input.outpoint.txid).then((prev_tx) => {
                    if (input.outpoint.index >= prev_tx.outputs.length){
                        socket_error(object, socket, "Transaction input pubkey does not match previous transaction output pubkey");
                        return -1;
                    }
                    return key = prev_tx.outputs[input.outpoint.index].pubkey;
                });
                return key;
            }
            else{ 
                socket_error(object, socket, "Some transaction input outpoint does not have a valid txid");
                    return -1;
            }
    });

    if (key == -1){
        return false;
    }
    let input_copy = JSON.parse(JSON.stringify(input));
    let sig = Uint8Array.from(Buffer.from(input_copy.sig, 'hex'))
    delete input_copy.sig;
    let mes = nacl.util.decodeUTF8(JSON.stringify(input_copy));
    let isValid = await ed.verify(sig, mes, key);
    if (!isValid){
        socket_error(object, socket, "Some transaction input does not have a valid signature");
        return false;
    }
}