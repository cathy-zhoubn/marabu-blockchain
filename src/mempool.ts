import { has_object } from "./db";
import { all_sockets, broadcast, send_format } from "./socket";





export function get_objects_in_mempool(txids:any) {
    for (let txid of txids) {
        has_object(txid).then((result) => {
            if (!<any>result){
                broadcast(all_sockets, send_format({
                    type: "getobject",
                    objectid: txid
                }));
            }
        });
    }
}