import { send_format, socket_error} from "./socket";
import { has_object, get_object } from "./db";
import * as ed from '@noble/ed25519';
var nacl = require('tweetnacl');
nacl.util = require('tweetnacl-util');

export const privateKey = ed.utils.randomPrivateKey();

export async function validate_tx_object(tx:any, socket:any) {
    if (!tx.hasOwnProperty("outputs")){
        socket_error(tx, socket, "Transaction object does not have outputs");
        return false;
    }
    for(let output of tx.outputs){
        if (!output.hasOwnProperty("pubkey") || !output.hasOwnProperty("value")){
            socket_error(tx, socket, "Some transaction output does not have pubkey or value");
            return false;
        }
    }

    if (tx.hasOwnProperty("height")){
        return validate_coinbase(tx, socket);
    } 

    else if (tx.hasOwnProperty("inputs")){
        if(tx.inputs.length == 0){
            socket_error(tx, socket, "Transaction does not have any inputs");
            return false;
        }
        return await validate_transaction(tx, socket);
    }
    
    socket_error(socket, "Transaction object does not include required keys");
    return false;
}



export function validate_coinbase(object: any, socket:any) {
    //TODO: implement in next assignments
    return true;
}

export async function validate_transaction(object: any, socket:any){
    let input_sum = 0;
    for (let input of object.inputs){
        let val = await validate_tx_input(object, input, socket);
        if (val == -1){
            return false
        }
        input_sum += val;
    }
    var output_sum = validate_tx_output(object.outputs, socket);
    if(output_sum == -1){
        return false;
    }
    console.log("output_sum: " + output_sum);
    return input_sum >= output_sum;
}

async function validate_tx_input(object:any, input:any, socket:any){
    if (!input.hasOwnProperty("outpoint") || !input.hasOwnProperty("sig")){
        socket_error(object, socket, "Some transaction input does not have outpoint or sig");
        return -1;
    }
    if (!input.outpoint.hasOwnProperty("txid") || !input.outpoint.hasOwnProperty("index")){
        socket_error(object, socket, "Some transaction input outpoint does not have txid or index");
        return -1;
    }

    //check if outpoint txid exists
    let [key, val] = await get_key_val(input.outpoint.txid, input.outpoint.index, socket);
    let no_sig = JSON.parse(JSON.stringify(object))
    for (let i = 0; i < no_sig.inputs.length; i++){
        no_sig.inputs[i].sig = null;
    }

    if (key == -1 || val == -1 || !await validate_signature(input, no_sig, key, socket)){
        return -1;
    }
    return val;
}

async function validate_signature(input:any, no_sig:any, key:string, socket:any){
    let sig = Uint8Array.from(Buffer.from(input.sig, 'hex'));
    let mes = nacl.util.decodeUTF8(JSON.stringify(no_sig));
    let isValid = await ed.verify(sig, mes, key);
    if (!isValid){
        socket_error(input, socket, "Some transaction input does not have a valid signature");
        return false;
    }
    return true;
}

async function get_key_val(txid:string, index:number, socket:any){
    let [key, val] = await has_object(txid).then(async (val) => {
        if (<any>val){
            let [key, val] = await get_object(txid).then((prev_tx) => {
                prev_tx = JSON.parse(prev_tx);
                if (index >= prev_tx.outputs.length){
                    socket_error(txid, socket, "Transaction input pubkey does not match previous transaction output pubkey");
                    return [-1, -1];
                }
                return [prev_tx.outputs[index].pubkey, prev_tx.outputs[index].value];
            });
            return [key, val];
        }
        else{ 
            socket_error(txid, socket, "Some transaction input outpoint does not have a valid txid");
                return [-1, -1];
        }
    });
    return [key, val];
}

function validate_tx_output(outputs: [any], socket:any) : number{
    console.log("outputs: " + outputs);
    let sum = 0;
    for(let output of outputs){
        if(output.pubkey.length != 64){
            socket_error(output.pubkey, socket, "Some transaction output pubkey does not have a valid format");
            return -1;
        }
        sum += output.value;
    }

    return sum;
}
