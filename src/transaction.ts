import { send_format, socket_error} from "./socket";

export function validate_tx_object(object:any, socket:any) {
    if (!object.hasOwnProperty("outputs")){
        socket_error(socket, "Transaction object does not have outputs");
        return false;
    }
    for(let output of object.outputs){
        if (!output.hasOwnProperty("pubkey") || !output.hasOwnProperty("value")){
            socket_error(socket, "Some transaction output does not have pubkey or value");
            return false;
        }
    }

    if (object.hasOwnProperty("height")){
        return validate_coinbase(object, socket);
    } else if (object.hasOwnProperty("inputs")){
        if(object.inputs.length == 0){
            socket_error(socket, "Transaction does not have any inputs");
            return false;
        }
        for(let input of object.inputs){
            if (!input.hasOwnProperty("outpoint") || !input.hasOwnProperty("sig")){
                socket_error(socket, "Some transaction input does not have outpoint or sig");
                return false;
            }
            if(!input.outpoint.hasOwnProperty("index") || !input.outpoint.hasOwnProperty("txid")){
                socket_error(socket, "Some transaction input outpoint does not have index or txid");
                return false;
            }
        }
        return validate_transaction(object, socket);
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

export function validate_transaction(object: any, socket:any){
    
}


// {
//     "object":{
//         "inputs":[{
//             "outpoint":{"index":0,
//                 "txid":"1bb37b637d07100cd26fc063dfd4c39a7931cc88dae3417871219715a5e374af"
//             },
//             "sig":"1d0d7d774042607c69a87ac5f1cdf92bf474c25fafcc089fe667602bfefb0494726c519e92266957429ced875256e6915eb8     cea2ea66366e739415efc47a6805"
//         }],    
//         "outputs":[{
//             "pubkey":"8dbcd2401c89c04d6e53c81c90aa0b551cc8fc47c0469217c8f5cfbae1e911f9",
//             "value":10
//         }],
//         "type":"transaction"
//     },
//     "type":"object"
// }