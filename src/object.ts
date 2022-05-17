import { has_object, add_object, get_object } from "./db";
import { broadcast, send_format, all_sockets } from "./socket";

import { validate_tx_object } from "./transaction";
import { hash_string } from "./helpers";
import { checking_previd, checking_previd_received, validate_block } from "./block";

export function receive_object(object:string, socket:any){
    console.log(
        `Receivejson.d object message from ${socket.remoteAddress}:${socket.remotePort}`
    );

    let obj_hash = hash_string(object);
    has_object(obj_hash).then(async (result) => {
        if (!<any>result){

            var save = false;

            let json_obj = JSON.parse(object);
            if(json_obj.hasOwnProperty("type")){
                if(json_obj.type == "transaction"){
                    save = await validate_tx_object(json_obj, socket)
                } else if (json_obj.type == "block"){
                    if(checking_previd_received.has(obj_hash)){
                        checking_previd_received.set(obj_hash, true);
                    }

                    save = await validate_block(json_obj, socket)
                    
                    if(!save && checking_previd.has(obj_hash)){
                        checking_previd.delete(obj_hash)
                        checking_previd_received.delete(obj_hash);
                    }
                }
            }

            if(save){
                await add_object(obj_hash, object);
                broadcast(all_sockets, send_format({
                    type: "ihaveobject",
                    objectid: obj_hash
                }));
            }
        }
    });
}

export function send_object(objid:any, socket: any) {
    console.log(
        `Received getobject message from ${socket.remoteAddress}:${socket.remotePort}`
    );
    setTimeout(function(){
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
    }, 500);    
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