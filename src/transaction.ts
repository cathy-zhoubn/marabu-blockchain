import { send_format, socket_error} from "./socket";
import { has_object, get_object } from "./db";
import { is_hex } from "./helpers";
import * as ed from '@noble/ed25519';
import { canonicalize } from "json-canonicalize";
import { update_mempool } from "./mempool";
import { max_height } from "./block";
var nacl = require('tweetnacl');
nacl.util = require('tweetnacl-util');

export const privateKey = ed.utils.randomPrivateKey();

export async function validate_tx_object(tx:any, socket:any) {
    if (!tx.hasOwnProperty("outputs")){
        if (socket != null){
            socket_error(tx, socket, "Transaction object does not have outputs");
        }
        return false;
    }
    for(let output of tx.outputs){
        if (!output.hasOwnProperty("pubkey") || !validate_key(output.pubkey, socket) || 
            !output.hasOwnProperty("value") || !(typeof output.value == "number") || output.value < 0){
            console.log("output: " + output.value);
            console.log("type: " + typeof output.value);
            console.log(validate_key(output.pubkey, socket))
            if (socket != null){
                socket_error(tx, socket, "Some transaction output does not have correct pubkey or value");
            }
            return false;
        }
    }

    if (!tx.hasOwnProperty("inputs") && tx.hasOwnProperty("height")){
        return validate_coinbase(tx, socket);
    } 

    else if (tx.hasOwnProperty("inputs")){
        if(tx.inputs.length == 0){
            if (socket != null){
                socket_error(tx, socket, "Transaction does not have any inputs");
            }
            return false;
        }
        if(await validate_transaction(tx, socket)){
            update_mempool(tx);
            return true;
        } else {
            return false;
        }
    }
    
    if (socket != null){
        socket_error(socket, "Transaction object does not include required keys");
    }
    return false;
}

export function validate_coinbase(tx: any, socket:any) {
    //check if coinbase has correct format
    if (!tx.hasOwnProperty("height") || !(typeof tx.height == "number") || tx.height < 0){
        socket_error(tx, socket, "Coinbase does not have a valid height");
        return false;
    }

    if (!tx.hasOwnProperty("outputs")){
        socket_error(tx, socket, "Coinbase does not have any outputs");
        return false;
    }
    // check if output is correct
    if (tx.outputs.length != 1){
        socket_error(tx, socket, "Coinbase has more than one output");
        return false;
    }
    let out = tx.outputs[0];
    if (!out.hasOwnProperty("value") || !(typeof out.value == "number") || out.value < 0){
        socket_error(tx, socket, "Coinbase output does not have a valid value");
        return false;
    }
    if (!out.hasOwnProperty("pubkey") || !validate_key(out.pubkey, socket)){
        socket_error(tx, socket, "Coinbase output does not have a valid pubkey");
        return false;
    }

    return true;
}

export async function validate_transaction(object: any, socket:any){
    let input_sum = 0;
    let outpoints = [] as any;
    for (let input of object.inputs){
        // if input's outpoint is duplicated, error
        if (outpoints.indexOf(input.outpoint.txid) != -1){
            socket_error(object, socket, "Transaction has duplicate inputs of the same outpoint");
            return false;
        }
        outpoints.push(input.outpoint.txid);

        // validate input tx
        let val = await validate_tx_input(object, input, socket);
        if (val == -1){
            return false
        }
        input_sum += val;
    }
    // validate output tx
    var output_sum = validate_tx_output(object.outputs, socket);
    if(output_sum == -1){
        return false;
    }
    
    // validate weak law of conservation
    if (input_sum < output_sum){
        socket_error(object, socket, "Transaction input sum is less than output sum");
        return false;
    }
    return true;
}

async function validate_tx_input(object:any, input:any, socket:any){
    if (!input.hasOwnProperty("outpoint") || !input.hasOwnProperty("sig")){
        socket_error(object, socket, "Some transaction input does not have outpoint or sig");
        return -1;
    }
    if (!input.outpoint.hasOwnProperty("txid") || !input.outpoint.hasOwnProperty("index")
        || !(typeof input.outpoint.index == "number") || !(input.outpoint.index >= 0) || !validate_key(input.outpoint.txid, socket)){
        socket_error(object, socket, "Some transaction input outpoint does not have valid txid or index");
        return -1;
    }

    //check if outpoint txid exists
    let [key, val] = await get_key_val(input.outpoint.txid, input.outpoint.index, socket);
    let no_sig = JSON.parse(canonicalize(object))
    for (let i = 0; i < no_sig.inputs.length; i++){
        no_sig.inputs[i].sig = null;
    }

    if (key == -1 || val == -1 || !await validate_signature(input, no_sig, key, socket)){
        return -1;
    }
    return val;
}

async function validate_signature(input:any, no_sig:any, key:string, socket:any){
    if (!is_hex(input.sig, socket)){
        socket_error(input, socket, "Signature does not have a valid format");
        return false;
    }
    let sig = Uint8Array.from(Buffer.from(input.sig, 'hex'));
    let mes = nacl.util.decodeUTF8(canonicalize(no_sig));
    let isValid = false;
    try {
        isValid = await ed.verify(sig, mes, key);
    } catch (error) {
        socket_error(input, socket, "Signature is not valid");
        return false;
    }
    
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
                    socket_error(txid, socket, "Transaction input index exeeds limit");
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
    let sum = 0;
    for(let output of outputs){
        if (!validate_key(output.pubkey, socket)){
            return -1;
        }
        sum += output.value;
    }

    return sum;
}

function validate_key(key:string, socket:any){
    if (!is_hex(key, socket) || key.length != 64){
        socket_error(key, socket, "Key does not have a valid format");
        return false;
    }
    return true;
}

