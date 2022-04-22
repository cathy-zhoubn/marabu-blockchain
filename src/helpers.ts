
import { socket_error } from "./socket";
import sha256 from 'fast-sha256'
var nacl = require('tweetnacl');
nacl.util = require('tweetnacl-util');

export function is_hex(key:string, socket:any){
    if (!(typeof key == "string")){
        return false;
    }
    for (let letter of key){
        if (!(letter >= '0' && letter <= '9') && !(letter >= 'a' && letter <= 'f')){
            return false;
        }
    }
    return true;
}

export function hash_string(str: string) {
    let hashed = sha256(nacl.util.decodeUTF8(str));
    return Buffer.from(hashed).toString('hex');
}