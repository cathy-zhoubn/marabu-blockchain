
var nacl = require('tweetnacl');
nacl.util = require('tweetnacl-util');
import sha256 from "fast-sha256";

// Include Nodejs' net module.
const Net = require('net');
// The port number and hostname of the server.
const port = 18018;
const host = 'localhost';

// Create a new TCP client.
const client = new Net.Socket();
console.log("created new socket")
// Send a connection request to the server.
client.connect({ port: port, host: host }, function() {
    // If there is no error, the server has accepted the request and created a new 
    // socket dedicated to us.
    
    // test1();

    test2_object_grader1();
    // test2_object_grader2();
    // test2_object_self();

});

// The client can also receive data from the server by reading from its socket.
client.on('data', function(chunk : any) {
    console.log(`Data received from the server: ${chunk.toString()}.`);
});

client.on('end', function() {
    console.log('Requested an end to the TCP connection');
});

function test1() {
    // testing message before hello
    // client.write(JSON.stringify({"type": "getpeers"}) + "\n");
    
    // testing hello
    client.write(JSON.stringify({"type": "hello", "version": "0.8.0", "agent": "Old Peking"}) + "\n");
    
    // testing getpeers
    // client.write(JSON.stringify({"type": "getpeers"}) + "\n");
    
    // testing separated message
    // client.write("{\"type\": \"ge");
    // for (let i = 0; i < 1000000; i++) {
    // }
    // client.write("tpeers\"}" + "\n");

    // // testing errors
    // console.log("1");
    // client.write("Wbgygvf7rgtyv7tfbgy{{{" + "\n");
    // console.log("2");
    // client.write(JSON.stringify({"type":"diufygeuybhv"}) + "\n");
    // console.log("3");
    // client.write(JSON.stringify({"type":"hello"}) + "\n");gi
    // console.log("4");
    // client.write(JSON.stringify({"type":"hello","version":"jd3.x"}) + "\n");
    // console.log("5");
    // client.write(JSON.stringify({"type":"hello","version":"5.8.2"}) + "\n");
}

function test2_object_grader1() {
    client.write(JSON.stringify({"type": "hello", "version": "0.8.0", "agent": "Old Peking"}) + "\n");
    
    let ob = { "type": 
        "block", 
        "txids": [ "740bcfb434c89abe57bb2bc80290cd5495e87ebf8cd0dadb076bc50453590104" ], 
        "nonce": "a26d92800cf58e88a5ecf37156c031a4147c2128beeaf1cca2785c93242a4c8b", 
        "previd": "0024839ec9632d382486ba7aac7e0bda3b4bda1d4bd79be9ae78e7e1e813ddd8", 
        "created": "1622825642", 
        "T": "003a000000000000000000000000000000000000000000000000000000000000" 
    };
    var objstr = JSON.stringify(ob);
    let obid = hash_object(objstr);
    objstr += "\n";
    client.write(JSON.stringify({ 
        "type": "object", 
        "object": ob 
    }) + "\n");

    // client.write(JSON.stringify({ 
    //     "type": "getobject", 
    //     "objectid": obid
    // }) + "\n");
    
}

function test2_object_grader2(){

}

function test2_object_self(){

}

function hash_object(object: string) {
    let hashed = sha256(nacl.util.decodeUTF8(object));
    return Buffer.from(hashed).toString('hex');;
}