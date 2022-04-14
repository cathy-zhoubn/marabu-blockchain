import {get_ips, has_object, add_object, get_object} from './db';
import { run_one_client } from './client';
import { send } from 'process';
import sha256 from 'fast-sha256'
import { decodeBase64, encodeUTF8} from 'tweetnacl-util';
import { encode } from 'punycode';

const version_re = /^0.8.\d$/;
export const hello = { type: "hello", version: "0.8.0", agent: "Old Peking" };
export const get_peers = { type: "getpeers" };

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
                send_object(data.object, socket);
            } else if (data.type == "object") {
                obj_rec.receive_object(data.object);
            } else if (data.type == "ihaveobject") {
                let object = data.object;
                send_getobject(object, socket);
            }
            else {
                receive_unsupported(data, socket);
            }
        }
    }

    return leftover;
}

export function receive_hello(hello_data:any, socket:any) {
    if (hello_data.type != "hello") {
        console.log(
            `Received other message types before the initial handshake from ${socket.remoteAddress}:${socket.remotePort}. Closing the socket.`
        );
        socket.end(
            send_format({
                type: "error",
                error: "Received other message types before the initial handshake",
            })
        );
        socket.destroy();
        return;
    }

    try {
        if (!version_re.test(hello_data.version)) {
            console.log(
                `Received unsupported version number from ${socket.remoteAddress}:${socket.remotePort}. Closing the socket.`
            );
            socket.end(
                send_format({
                    type: "error",
                    error: "unsupported version number received",
                })
            );
            socket.destroy();
            return;
        }
    } catch (e) {
        console.log(
            `Received unsupported format of hello message from ${socket.remoteAddress}:${socket.remotePort}. Closing the socket.`
        );
        socket.end(
            send_format({
                type: "error",
                error: "unsupported format of hello message",
            })
        );
        socket.destroy();
    }
}

export function receive_getpeers(data:any, socket:any){
    console.log(
        `Received getpeers message from ${socket.remoteAddress}:${socket.remotePort}`
    );
    send_peers(socket);
}

export function receive_peers(data:any, socket:any){
    console.log(
        `Received peers message from ${socket.remoteAddress}:${socket.remotePort}`
    );
    connect_to_peers(data.peers);
}

export function receive_unsupported(data:any, socket:any){
    socket.end(
        send_format({
            type: "error",
            error: "Unsupported message type received",
        })
    );
}

export function send_peers(socket: any) {
    get_ips().then((ips) => {
        let peer_addresses: string[] = [];
        for (let i = 0; i < ips.rows.length; i++) {
            peer_addresses.push(ips.rows[i]["ip"].concat(":18018"));
        }
        socket.write(
            send_format({
                type: "peers",
                peers: peer_addresses,
            })
        );
    });
}

export function connect_to_peers(peers: string[]) {
    for (let peer of peers) {
        let peer_address = peer.split(":");
        let peer_host = peer_address[0];
        run_one_client(peer_host);
    }
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
    
    window.addEventListener('received_object', ((event: CustomEvent) => {
        socket.write({
            "type": "ihaveobject", 
            "objectid": hash_object(event.detail.object)
        });
      }) as EventListener);
}

function send_object(object:any, socket: any) {
    has_object(object).then((result) => {
        if (!<any>result){
            socket.write(send_format({
                type: "object",
                objectid: hash_object(object)
            }
        ))}
    });
}

async function send_getobject(object: any, socket: any) {
    has_object(object).then((result) => {
        if (<any>result){
            socket.write(send_format({
                type: "getobject",
                objectid: object
            }));
        }
    });
}

export default class object_receiver{
    constructor(){
    }

    public receive_new_object(object:any){
        const obj = new CustomEvent('received_object', {
            detail: {
                object: object //TODO: more specific fields?
            }
        });
        // dispatch the event obj
        window.dispatchEvent(obj);
    }
    public receive_object(object:any){
        has_object(object).then((result) => {
            if (!<any>result){
                add_object(hash_object(object), object);
                this.receive_new_object(object)
            }
        });
    }
}

function hash_object(object: any) {
    let hashed = sha256(decodeBase64(object));
    return encodeUTF8(hashed);
}

