import { send_format, socket_error} from "./socket";

export function validate_tx_object(object:any, socket:any) {
    if (!object.hasOwnProperty("outputs")){
        socket_error(socket, "Transaction object does not have outputs");
    }

    if (object.hasOwnProperty("height")){
        return validate_coinbase(object, socket);
    } else if (object.hasOwnProperty("inputs")){
        return validate_transaction(object, socket);
    } else {
        socket_error(socket, "Transaction object does not include required keys");
    }

    return true;
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