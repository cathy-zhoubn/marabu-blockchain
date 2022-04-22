import { has_object, add_object, get_object } from "./db";
import { broadcast, send_format, all_sockets } from "./socket";

import { validate_tx_object } from "./transaction";
import { hash_string } from "./helpers";
import { validate_block } from "./block";

export async function receive_object(object:string, socket:any){
    console.log(
        `Receivejson.d object message from ${socket.remoteAddress}:${socket.remotePort}`
    );
    await has_object(hash_string(object)).then(async (result) => {
        if (!<any>result){

            var save = true;

            let json_obj = JSON.parse(object);
            if(json_obj.hasOwnProperty("type")){
                if(json_obj.type == "transaction"){
                    save = await validate_tx_object(json_obj, socket)
                } else if (json_obj.type == "block"){
                    save = await validate_block(json_obj, socket);
                }
            }

            if(save){
                await add_object(hash_string(object), object);
                broadcast(all_sockets, send_format({
                    type: "ihaveobject",
                    objectid: hash_string(object)
                }));
            }
        }
    });
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

export function send_getobject(objid: any, socket: any) {
    has_object(objid).then((result) => {
        if (!<any>result){
            socket.write(send_format({
                type: "getobject",
                objectid: objid
            }));
        }
    });
}