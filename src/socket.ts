import { send_object, send_getobject, receive_object} from './object';
import {receive_hello, receive_getpeers, receive_peers} from './peers';
import {receive_block} from './block';
import { send } from 'process';
import { canonicalize } from 'json-canonicalize';

export const hello = { type: "hello", version: "0.8.0", agent: "Old Peking" };
export const get_peers = { type: "getpeers" };

export const all_sockets = new Set();
export function broadcast(all_sockets:Set<any>, data: any){ //TODO: conditions to delete from set
    all_sockets.forEach((socket) => {
        socket.write(data);
    });
}

export function send_format(dict: any): string {
    return canonicalize(dict) + "\n";
}

export async function data_handler(
    chunk: any,
    leftover: string,
    socket: any,
    initialized: boolean
) {
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
                socket_error(parsed, socket);
                return;
            }
            json_data_array.push(parsed);
        } catch (e) {
            socket_error(token, socket);
            return;
        }
    }

    if (json_data_array.length == 0) return leftover;

    //initial handshake
    if (!initialized) {
        let hello_data = json_data_array.shift();
        receive_hello(hello_data, socket)
        initialized = true;
    }

    for (let data of json_data_array) {
        await process_data(data, socket);
    }
    return leftover;

}

export async function process_data(data:any, socket:any){
    if (data.type == "hello") {}
    if (data.type == "getpeers") {
        receive_getpeers(data, socket);
    } else if (data.type == "peers") {
        receive_peers(data, socket);
    } else if (data.type == "getobject") {
        send_object(data.objectid, socket);
    } else if (data.type == "object") {
        await receive_object(await canonicalize(data.object), socket);
    } else if (data.type == "ihaveobject") {
        let objid = data.objectid;
        console.log(
            `Received ihaveobject message from ${socket.remoteAddress}:${socket.remotePort}`
        );
        send_getobject(objid, socket);
    } else if (data.type == "block") {
        await receive_block(data, socket); 
    }
    else {
        socket_error(data, socket);
    }

}

export function socket_error(data:any, socket:any, message:string = "Unsupported message type received", kill:boolean = false){

    // console.log(
    //     `Error {${message}} from ${socket.remoteAddress}:${socket.remotePort}. Closing the socket.`
    // );
    console.log(data)
    let send_message = send_format({
        type: "error",
        error: message,
    })
    console.log(send_message) // TODO: remove

    // TODO: get this back!!!
    // if(kill){
    //     socket.end(send_message);
    //     socket.destroy();
    //     all_sockets.delete(socket);
    // } else {
    //     socket.write(send_message);
    // }
}

export async function socket_handler(socket: any) {
    var initialized = false;
    var leftover = "";

    console.log(
        `A new socket connection has been established from ${socket.remoteAddress}:${socket.remotePort}`
    );
    all_sockets.add(socket);

    //add_ip(socket.remoteAddress);socket.write
    socket.write(send_format(hello));
    socket.write(send_format(get_peers));

    await socket.on("data", async function (chunk: any) {
        //receiving logic
        if(!initialized){
            initialized = true
            leftover = await data_handler(chunk, leftover, socket, false)
        } else {
            leftover = await data_handler(chunk, leftover, socket, initialized)
        }
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
