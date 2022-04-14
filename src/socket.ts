import {get_ips, has_object, add_object, get_object} from './db';
import { send_object, send_getobject } from './object';
import {receive_hello, receive_getpeers, receive_peers} from './peers'
import object_receiver from './object';

export const hello = { type: "hello", version: "0.8.0", agent: "Old Peking" };
export const get_peers = { type: "getpeers" };

require('events').defaultMaxListeners = Infinity;

let event_target = new EventTarget();
const obj_rec = new object_receiver();

export function send_format(dict: any): string {
    return JSON.stringify(dict) + "\n";
}

export function data_handler(
    chunk: any,
    leftover: string,
    socket: any,
    initialized: boolean
): string {
    //processing the input
    let original: string = chunk.toString();
    // console.log(`Data received from ${socket.remoteAddress}:${socket.remotePort}: ${original}`);
    let tokenized = original.split("\n");
    tokenized[0] = leftover + tokenized[0];
    leftover = tokenized.pop();
    var json_data_array = [];
    for (let i = 0; i < tokenized.length; i++) {
        let token = tokenized[i];
        try {
            let parsed = JSON.parse(token); //check if it can be parsed into json
            if (!parsed.hasOwnProperty("type")) {
                //check if message contains 'type' field
                console.log(
                    `JSON message received from ${socket.remoteAddress}:${socket.remotePort} does not contain "type". Closing the socket.`
                );
                socket.end(
                    send_format({
                        type: "error",
                        error: "Unsupported message format received",
                    })
                );
                socket.destroy();
                return;
            }
            json_data_array.push(parsed);
        } catch (e) {
            console.log(
                `Unsupported message format received from ${socket.remoteAddress}:${socket.remotePort}. Closing the socket.`
            );
            socket.end(
                send_format({
                    type: "error",
                    error: "Unsupported message format received",
                })
            );
            socket.destroy();
            return;
        }
    }

    if (json_data_array.length == 0) return leftover;

    //initial handshake
    if (!initialized) {
        let hello_data = json_data_array.shift();
        receive_hello(hello_data, socket)
    }

    for (let data of json_data_array) {
        for (let data of json_data_array) {
            if (data.type == "getpeers") {
                receive_getpeers(data, socket);
            } else if (data.type == "peers") {
                receive_peers(data, socket);
            } else if (data.type == "getobject") {
                send_object(data.objectid, socket);
            } else if (data.type == "object") {
                obj_rec.receive_object(JSON.stringify(data.object));
            } else if (data.type == "ihaveobject") {
                let objid = data.objectid;
                send_getobject(objid, socket);
            }
            else {
                receive_unsupported(data, socket);
            }
        }
    }

    return leftover;
}


export function receive_unsupported(data:any, socket:any){
    socket.end(
        send_format({
            type: "error",
            error: "Unsupported message type received",
        })
    );
}



export function socket_handler(socket: any) {
    var initialized = false;
    var leftover = "";

    console.log(
        `A new socket connection has been established from ${socket.remoteAddress}:${socket.remotePort}`
    );

    //add_ip(socket.remoteAddress);
    socket.write(send_format(hello));
    socket.write(send_format(get_peers));

    socket.on("data", function (chunk: any) {
        //receiving logic
        leftover = data_handler(chunk, leftover, socket, initialized);
        initialized = true;
    });

    socket.on("end", function (chunk: any) {
        console.log(
            `Closing connection with the client ${socket.remoteAddress}:${socket.remotePort}"`
        );
    });

    socket.on("error", function (err: any) {
        //console.log(`Error: ${err}`);
    });
    
    event_target.addEventListener('received_object', ((event: CustomEvent) => {
        socket.write({
            "type": "ihaveobject", 
            "objectid": hash_object(event.detail.object)
        });
      }) as EventListener);
}




// we have an object


function validate_object(object:any, socket:any) {
    if (object.hasOwnProperty("height")){
        return validate_coinbase(object, socket);
    }
    if (object.hasOwnProperty("inputs")){
        return validate_transaction(object, socket);
    }
    if (!object.hasOwnProperty("outputs")){
        socket.end(
            send_format({
                type: "error",
                error: "Unsupported message type received",
            })
        );
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


function validate_coinbase(object: any, socket:any) {
    //TODO: implement in next assignments
    return true;
}

function validate_transaction(object: any, socket:any){
    
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