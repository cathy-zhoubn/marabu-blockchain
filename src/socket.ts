import {get_ips, has_object, add_object, get_object} from './db';
import { send_object, send_getobject, hash_object} from './object';
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
                receive_unsupported(socket);
                socket.destroy();
                return;
            }
            json_data_array.push(parsed);
        } catch (e) {
            receive_unsupported(socket);
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
                receive_unsupported(socket);
            }
        }
    }

    return leftover;
}


export function receive_unsupported( socket:any){
    console.log(
        `Unsupported message format received from ${socket.remoteAddress}:${socket.remotePort}. Closing the socket.`
    );
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
