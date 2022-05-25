import { send_object, send_getobject, receive_object} from './object';
import {receive_hello, receive_getpeers, receive_peers} from './peers';
import { send_chaintip, receive_chaintip} from './block';
import { canonicalize } from 'json-canonicalize';
import { get_objects_in_mempool } from './mempool';

export const hello = { type: "hello", version: "0.8.0", agent: "Old Peking" };
export const get_peers = { type: "getpeers" };
export const get_chaintip = { type: "getchaintip"}
export const get_mempool = { type: "getmempool" };

export const all_sockets = new Set();
export function broadcast(all_sockets:Set<any>, data: any){
    all_sockets.forEach((socket) => {
        socket.write(data);
    });
}

export function send_format(dict: any): string {
    return canonicalize(dict) + "\n";
}

export function data_handler(
    chunk: any,
    leftover: any,
    socket: any,
    initialized: any
) {
    //processing the input
    let original: string = chunk.toString();
    let tokenized = original.split("\n");
    tokenized[0] = leftover.value + tokenized[0];
    leftover.value = tokenized.pop();
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
                socket_error(parsed, socket);
                return;
            }
            json_data_array.push(parsed);
        } catch (e) {
            socket_error(token, socket);
            return;
        }
    }

    if (json_data_array.length == 0) return;

    //initial handshake
    if (!initialized.init) {
        let hello_data = json_data_array.shift();
        receive_hello(hello_data, socket)
        initialized.init = true;
    }

    for (let data of json_data_array) {
        process_data(data, socket);
    }
}

export async function process_data(data:any, socket:any){
    if (data.type == "hello") {}
    if (data.type == "getpeers") {
        receive_getpeers(data, socket);
    } else if (data.type == "peers") {
        receive_peers(data, socket);
    } else if (data.type == "getobject") {
        if (!data.hasOwnProperty("objectid")) {
            socket_error(data, socket, "getobject message does not contain 'objectid' field");
            return;
        }
        send_object(data.objectid, socket);
    } else if (data.type == "object") {
        if (!data.hasOwnProperty("object")) {
            socket_error(data, socket, "object message does not contain 'object' field");
            return;
        }
        receive_object(canonicalize(data.object), socket);
    } else if (data.type == "ihaveobject") {
        if (!data.hasOwnProperty("objectid")) {
            socket_error(data, socket, "ihaveobject message does not contain 'objectid' field");
            return;
        }
        let objid = data.objectid;
        console.log(
            `Received ihaveobject message from ${socket.remoteAddress}:${socket.remotePort}`
        );
        send_getobject(objid, socket);
    } else if (data.type == "getchaintip") {
        send_chaintip(socket);
    } else if (data.type == "chaintip") {
        if (!data.hasOwnProperty("blockid")) {
            socket_error(data, socket, "getchaintip message does not contain 'blockid' field");
            return;
        }
        await receive_chaintip(data.blockid, socket);
    } else if (data.type == "mempool") {
        if (!data.hasOwnProperty("txids")) {
            socket_error(data, socket, "mempool message does not contain 'txid' field");
            return;
        }
        get_objects_in_mempool(data.txids);
    } 
    else if (data.type == "error") {
    }
    else {
        socket_error(data, socket);
    }
}

export function socket_error(data:any, socket:any, message:string = "Unsupported message type received", kill:boolean = false){

    console.log(
        `Error {${message}} from ${socket.remoteAddress}:${socket.remotePort}. Closing the socket.`
    );
    console.log(data)
    let send_message = send_format({
        type: "error",
        error: message,
    })
    console.log(send_message) 

    if(kill){
        socket.end(send_message);
        socket.destroy();
        all_sockets.delete(socket);
    } else {
        socket.write(send_message);
    }
}

export function socket_handler(socket: any) {
    var initialized = {init: false};
    var leftover = { value: ""};

    console.log(
        `A new socket connection has been established from ${socket.remoteAddress}:${socket.remotePort}`
    );
    all_sockets.add(socket);

    //add_ip(socket.remoteAddress);socket.write
    socket.write(send_format(hello));
    socket.write(send_format(get_peers));
    socket.write(send_format(get_chaintip));
    socket.write(send_format(get_mempool));

    socket.on("data", function (chunk: any) {
        data_handler(chunk, leftover, socket, initialized)
    });

    socket.on("end", function (chunk: any) {
        console.log(
            `Closing connection with the client ${socket.remoteAddress}:${socket.remotePort}"`
        );
    });

    socket.on("error", function (err: any) {
        // console.log(`Error: ${err}`);
    });
}
