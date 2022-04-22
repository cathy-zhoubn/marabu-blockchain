import { canonicalize, canonicalizeEx } from 'json-canonicalize';
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

    client.write(JSON.stringify({"type": "hello", "version": "0.8.0", "agent": "Old Peking"}) + "\n");
    // If there is no error, the server has accepted the request and created a new 
    // socket dedicated to us.
    
    // test1();

    // test2_object_grader1();
    // test2_object_grader2();

    // test2_tx_grader1();
    // test2_tx_grader2();

    test3_block();

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
    let ob = { 
        "txids": [ "740bcfb434c89abe57bb2bc80290cd5495e87ebf8cd0dadb076bc50453590104" ], 
        "nonce": "a26d92800cf58e88a5ecf37156c031a4147c2128beeaf1cca2785c93242a4c8b", 
        "previd": "0024839ec9632d382486ba7aac7e0bda3b4bda1d4bd79be9ae78e7e1e813ddd8", 
        "created": "1622825642", 
        "T": "003a000000000000000000000000000000000000000000000000000000000000",
        "type": "block"
    };
    
    var objstr = JSON.stringify(ob);
    let obid = hash_object(objstr);

    // client.write(JSON.stringify({ 
    //     "type": "object", 
    //     "object": ob 
    // }) + "\n");

    
    // client.write(JSON.stringify({ 
    //     "type": "getobject", 
    //     "objectid": obid
    // }) + "\n");

    client.write(JSON.stringify({ 
        "type": "ihaveobject", 
        "objectid": obid
    }) + "\n");
}

function test2_object_grader2(){
    let ob = { 
        "txids": [ "740bcfb434c89abe57bb2bc80290cd5495e87ebf8cd0dadb076bc50453590104" ], 
        "nonce": "a26d92800cf58e88a5ecf37156c031a4147c2128beeaf1cca2785c93242a4c8b", 
        "previd": "0024839ec9632d382486ba7aac7e0bda3b4bda1d4bd79be9ae78e7e1e813ddd8", 
        "created": "1622825642", 
        "T": "003a000000000000000000000000000000000000000000000000000000000000",
        "type": "block"
    };
    
    var objstr = JSON.stringify(ob);
    let obid = hash_object(objstr);

    client.write(JSON.stringify({ 
        "type": "getobject", 
        "objectid": obid
    }) + "\n");

}


let coinbase = {
    "object":{
        "height":0,
        "outputs":[{
            "pubkey":"8dbcd2401c89c04d6e53c81c90aa0b551cc8fc47c0469217c8f5cfbae1e911f9",
            "value":50000000000
        }],
        "type":"transaction"
    },
    "type":"object"
};

let tx = {
    "object":{
        "inputs":[{
            "outpoint":{
                "index": 0,
                "txid":"1bb37b637d07100cd26fc063dfd4c39a7931cc88dae3417871219715a5e374af"
            },
            "sig":"1d0d7d774042607c69a87ac5f1cdf92bf474c25fafcc089fe667602bfefb0494726c519e92266957429ced875256e6915eb8cea2ea66366e739415efc47a6805"
        }],
        "outputs":[{
            "pubkey":"8dbcd2401c89c04d6e53c81c90aa0b551cc8fc47c0469217c8f5cfbae1e911f9",
            "value": 10
        }],
        "type":"transaction"
    },
    "type":"object"
};

function test2_tx_grader1() {
    client.write(JSON.stringify(coinbase) + "\n");
    console.log("coinbase sent" + hash_object(JSON.stringify(coinbase.object)));
    client.write(JSON.stringify(tx) + "\n");
    console.log("transaction sent" + hash_object(JSON.stringify(tx.object)));

}

function hash_object(object: string) {
    let hashed = sha256(nacl.util.decodeUTF8(object));
    return Buffer.from(hashed).toString('hex');;
}

function test3_block(){
    let genesis = {"object":{"T":"00000002af000000000000000000000000000000000000000000000000000000","created":1624219079,"miner":"dionyziz","nonce":"0000000000000000000000000000000000000000000000000000002634878840","note":"The Economist 2021-06-20: Crypto-miners are probably to blame for the graphics-chip shortage","previd":null as any,"txids":[] as any,"type":"block"},"type":"object"}
    
    // client.write(canonicalize(genesis) + "\n");
    // client.write(canonicalize({"objectid":"00000000a420b7cefa2b7730243316921ed59ffe836e111ca3801f82a4f5360e","type":"getobject"}) + "\n");

    // TODO
    // let block1 = {"object":{"T":"00000002af000000000000000000000000000000000000000000000000000000","created":1650421857102,"miner":"grader","nonce":"d20e849d2e19dc7408b0c02d4dba5a1b3895839a4242660ae8ee18a5a97bcae7","note":"This block has a coinbase transaction","previd":"00000000a420b7cefa2b7730243316921ed59ffe836e111ca3801f82a4f5360e","txids":["2aac601bb784c0de6fdbf47918c9928fb0505eda3174d5cc7790f9b7d27e1963"],"type":"block"},"type":"object"}
    // client.write(JSON.stringify(block1) + "\n");
    // let trans1 = {"object":{"height":1,"outputs":[{"pubkey":"6756c64a8f9cdce26a0c390134a780bedaa04dd74722047f3da6600f141e86d3","value":50000000000000}],"type":"transaction"},"type":"object"}
    // client.write(JSON.stringify(trans1) + "\n");
    // client.write(JSON.stringify({"objectid":"00000002364806bfeafd0af08e88805ce14ea2e0222e0d3aaee3fe1809047482","type":"getobject"}) + "\n");

    // TODO
    // let block3 = {"object":{"T":"00000002af000000000000000000000000000000000000000000000000000000","created":1650433203255,"miner":"grader","nonce":"eab983d7bf941a212915b2155375e5ae308e23fe346155f8c8cb552c4ac98e51","note":"This block has another coinbase and spends earlier coinbase","previd":"00000002364806bfeafd0af08e88805ce14ea2e0222e0d3aaee3fe1809047482","txids":["1db7b7b6a0971aac14cc3a5114864c89c0455c2baebf3050760c30a24964cf7c","314e63a79f51450750282a02bc669d799781b222379930be635d7f2429c0fb36"],"type":"block"},"type":"object"}
    // client.write(JSON.stringify(block3) + "\n");
    // let trans3 = {"object":{"height":2,"outputs":[{"pubkey":"25ecf98703df4843d1dac2754776044cbec63082bf563bf23ccb2a2adf8d93e6","value":51000000000000}],"type":"transaction"},"type":"object"}
    // let trans4={"object":{"inputs":[{"outpoint":{"index":0,"txid":"2aac601bb784c0de6fdbf47918c9928fb0505eda3174d5cc7790f9b7d27e1963"},"sig":"55158c00fd062e2567580bcedf38399807440481b3af74c1959405e4f372d0f487ce742924e5c5ef9e4aefea4083658a0ee0633abb28bbef6e866ac79eb62b02"}],"outputs":[{"pubkey":"4f7a7107ee295c381fea1ffa3c0a20c313f80a88c859eac7a556de9a65407822","value":49000000000000}],"type":"transaction"},"type":"object"}
    // client.write(JSON.stringify(trans3) + "\n");
    // client.write(JSON.stringify(trans4) + "\n");
    // client.write(JSON.stringify({"objectid":"0000000196862be06c7175801855ed2886a97f1b2ac4d35c61235278cc4d9c80","type":"getobject"}) + "\n");
    
    // let block4 = {"object":{"T":"f000000000000000000000000000000000000000000000000000000000000000","created":0,"miner":"grader","nonce":"0000000000000000000000000000000000000000000000000000000000000000","note":"Block with incorrect target","previd":"00000000a420b7cefa2b7730243316921ed59ffe836e111ca3801f82a4f5360e","txids":[] as any,"type":"block"},"type":"object"}
    // client.write(JSON.stringify(block4) + "\n");

    let block5 = {"object":{"T":"00000002af000000000000000000000000000000000000000000000000000000","created":0,"miner":"grader","nonce":"0000000000000000000000000000000000000000000000000000000000000000","note":"Block with invalid PoW","previd":"00000000a420b7cefa2b7730243316921ed59ffe836e111ca3801f82a4f5360e","txids":[] as any,"type":"block"},"type":"object"}
    client.write(JSON.stringify(block5) + "\n");

    // client.write(canonicalize({"object": block1_transaction, "type":"object"}) + "\n");
    // // client.write(canonicalize({"object": block1_fake_transaction, "type":"object"}) + "\n");
    // client.write(canonicalize({"object": trans_2, "type":"object"}) + "\n");
    // client.write(canonicalize({"object": fake_block_1, "type":"object"}) + "\n");
}






let block1 = {
    "nonce": "c5ee71be4ca85b160d352923a84f86f44b7fc4fe60002214bc1236ceedc5c615",
    "T": "00000002af000000000000000000000000000000000000000000000000000000",
    "created": 1649827795114,
    "miner": "svatsan",
    "note": "First block. Yayy, I have 50 bu now!!",
    "previd": "00000000a420b7cefa2b7730243316921ed59ffe836e111ca3801f82a4f5360e",
    "txids": [
    "1bb37b637d07100cd26fc063dfd4c39a7931cc88dae3417871219715a5e374af"
    ],
    "type": "block"
}

let block1_transaction = {
    "height": 0,
    "outputs": [{
        "pubkey": "8dbcd2401c89c04d6e53c81c90aa0b551cc8fc47c0469217c8f5cfbae1e911f9",
        "value": 50000000000
    }],
    "type": "transaction"
}

let block1_fake_transaction = {
    "height": 1,
    "outputs": [{
        "pubkey": "8dbcd2401c89c04d6e53c81c90aa0b551cc8fc47c0469217c8f5cfbae1e911f9",
        "value": 500000000000000000000000000000000000
    }],
    "type": "transaction"
}

let block1_fake_id = "64b96bc22b1c7692ce8f176200f0f8bae14a1693ce6ae53f0597c384d30533d3"

let fake_noncb_tx = { "type": "transaction", "inputs": [ { "outpoint": { "txid": "f71408bf847d7dd15824574a7cd4afdfaaa2866286910675cd3fc371507aa196", "index": 0 }, "sig": "3869a9ea9e7ed926a7c8b30fb71f6ed151a132b03fd5dae764f015c98271000e7da322dbcfc97af7931c23c0fae060e102446ccff0f54ec00f9978f3a69a6f0f" } ], "outputs": [ { "pubkey": "077a2683d776a71139fd4db4d00c16703ba0753fc8bdc4bd6fc56614e659cde3", "value": 5100000000 } ] }

let fake_block_1 = {
    "nonce": "c5ee71be4ca85b160d352923a84f86f44b7fc4fe60002214bc1236ceedc5c615",
    "T": "ee000002af000000000000000000000000000000000000000000000000000000",
    "created": 1649827795114,
    "miner": "svatsan",
    "note": "First block. Yayy, I have 50 bu now!!",
    "previd": "00000000a420b7cefa2b7730243316921ed59ffe836e111ca3801f82a4f5360e",
    "txids": [
        "1bb37b637d07100cd26fc063dfd4c39a7931cc88dae3417871219715a5e374af", 
        "fe4bfc1abba7ef4c3f32f261a4b6f948ce4388be6ef7deed62f9186b896e9e29"
    ],
    "type": "block"
}

let trans_2 = { 
    "type": "transaction", 
    "inputs": [ { 
        "outpoint": { 
            "txid": "1bb37b637d07100cd26fc063dfd4c39a7931cc88dae3417871219715a5e374af", 
            "index": 0 
        }, 
        "sig": "3869a9ea9e7ed926a7c8b30fb71f6ed151a132b03fd5dae764f015c98271000e7da322dbcfc97af7931c23c0fae060e102446ccff0f54ec00f9978f3a69a6f0f" } ], 
        "outputs": [ { "pubkey": "077a2683d776a71139fd4db4d00c16703ba0753fc8bdc4bd6fc56614e659cde3", "value": 51000 } ] }
