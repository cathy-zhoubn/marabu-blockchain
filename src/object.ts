import { has_object, add_object, get_object } from "./db";
import { send_format } from "./socket";
import sha256 from 'fast-sha256'
var nacl = require('tweetnacl');
nacl.util = require('tweetnacl-util');

export default class object_receiver{
    constructor(){
    }

    public receive_new_object(object:string){
        const obj = new CustomEvent('received_object', {
            detail: {
                object: object //TODO: more specific fields?
            }
        });
        // dispatch the event obj
        window.dispatchEvent(obj);
    }
    public receive_object(object:string, socket: any){
        console.log(
            `Received object message from ${socket.remoteAddress}:${socket.remotePort}`
        );
        has_object(hash_object(object)).then((result) => {
            if (!<any>result){
                add_object(hash_object(object), object);
                this.receive_new_object(object)
            }
        });
    }
}

export function send_object(objid:any, socket: any) {
    console.log(
        `Received getobject message from ${socket.remoteAddress}:${socket.remotePort}`
    );
    has_object(objid).then((val) => {
        if (<any>val){
            get_object(objid).then((result) => {
                    socket.write(send_format({
                        type: "object",
                        object: JSON.parse(result)
                    }))
            });
        }
    });
    
}

export async function send_getobject(objid: any, socket: any) {
    console.log(
        `Received ihaveobject message from ${socket.remoteAddress}:${socket.remotePort}`
    );
    has_object(objid).then((result) => {
        if (!<any>result){
            socket.write(send_format({
                type: "getobject",
                objectid: objid
            }));
        }
    });
}

export function hash_object(object: string) {
    let hashed = sha256(nacl.util.decodeUTF8(object));
    return Buffer.from(hashed).toString('hex');;
}