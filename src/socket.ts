import {get_ips, has_object, add_object, get_object} from './db';
import { send_object, send_getobject, hash_object, receive_object} from './object';
import {receive_hello, receive_getpeers, receive_peers} from './peers'

export const hello = { type: "hello", version: "0.8.0", agent: "Old Peking" };
export const get_peers = { type: "getpeers" };

export const all_sockets = new Set();
export function broadcast(all_sockets:Set<any>, data: any){
    all_sockets.forEach((socket) => {
        socket.write(data);
    });
}

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
                socket_error(socket);
                return;
            }
            json_data_array.push(parsed);
        } catch (e) {
            socket_error(socket);
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
                console.log(JSON.stringify(data.object));
                receive_object(JSON.stringify(data.object), socket);
            } else if (data.type == "ihaveobject") {
                let objid = data.objectid;
                send_getobject(objid, socket);
            }
            else {
                socket_error(socket);
            }
        }
    }

    return leftover;
}

export function socket_error(socket:any, message:string = "Unsupported message type received"){
    console.log(
        `Error {${message}} from ${socket.remoteAddress}:${socket.remotePort}. Closing the socket.`
    );
    socket.end(
        send_format({
            type: "error",
            error: message,
        })
    );
    socket.destroy();
}

export function socket_handler(socket: any) {
    var initialized = false;
    var leftover = "";

    console.log(
        `A new socket connection has been established from ${socket.remoteAddress}:${socket.remotePort}`
    );
    all_sockets.add(socket);

    //add_ip(socket.remoteAddress);socket.write
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
}
