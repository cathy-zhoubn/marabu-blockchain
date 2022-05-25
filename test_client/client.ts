import { canonicalize } from 'json-canonicalize';
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

    // test3_block();
    // test3_failed()

    test3_failed();

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
    // let genesis = {"object":{"T":"00000002af000000000000000000000000000000000000000000000000000000","created":1624219079,"miner":"dionyziz","nonce":"0000000000000000000000000000000000000000000000000000002634878840","note":"The Economist 2021-06-20: Crypto-miners are probably to blame for the graphics-chip shortage","previd":null as any,"txids":[] as any,"type":"block"},"type":"object"}
    
    // client.write(canonicalize(genesis) + "\n");
    // client.write(canonicalize({"objectid":"00000000a420b7cefa2b7730243316921ed59ffe836e111ca3801f82a4f5360e","type":"getobject"}) + "\n");

    // let block2 = {"object":{"T":"00000002af000000000000000000000000000000000000000000000000000000","created":1650421857102,"miner":"grader","nonce":"d20e849d2e19dc7408b0c02d4dba5a1b3895839a4242660ae8ee18a5a97bcae7","note":"This block has a coinbase transaction","previd":"00000000a420b7cefa2b7730243316921ed59ffe836e111ca3801f82a4f5360e","txids":["2aac601bb784c0de6fdbf47918c9928fb0505eda3174d5cc7790f9b7d27e1963"],"type":"block"},"type":"object"}
    // client.write(JSON.stringify(block2) + "\n");
    // let trans1 = {"object":{"height":1,"outputs":[{"pubkey":"6756c64a8f9cdce26a0c390134a780bedaa04dd74722047f3da6600f141e86d3","value":50000000000000}],"type":"transaction"},"type":"object"}
    // client.write(JSON.stringify(trans1) + "\n");
    // client.write(JSON.stringify({"objectid":"00000002364806bfeafd0af08e88805ce14ea2e0222e0d3aaee3fe1809047482","type":"getobject"}) + "\n");

    // let block3 = {"object":{"T":"00000002af000000000000000000000000000000000000000000000000000000","created":1650433203255,"miner":"grader","nonce":"eab983d7bf941a212915b2155375e5ae308e23fe346155f8c8cb552c4ac98e51","note":"This block has another coinbase and spends earlier coinbase","previd":"00000002364806bfeafd0af08e88805ce14ea2e0222e0d3aaee3fe1809047482","txids":["1db7b7b6a0971aac14cc3a5114864c89c0455c2baebf3050760c30a24964cf7c","314e63a79f51450750282a02bc669d799781b222379930be635d7f2429c0fb36"],"type":"block"},"type":"object"}
    // client.write(JSON.stringify(block3) + "\n");
    // let trans3 = {"object":{"height":2,"outputs":[{"pubkey":"25ecf98703df4843d1dac2754776044cbec63082bf563bf23ccb2a2adf8d93e6","value":51000000000000}],"type":"transaction"},"type":"object"}
    // let trans4={"object":{"inputs":[{"outpoint":{"index":0,"txid":"2aac601bb784c0de6fdbf47918c9928fb0505eda3174d5cc7790f9b7d27e1963"},"sig":"55158c00fd062e2567580bcedf38399807440481b3af74c1959405e4f372d0f487ce742924e5c5ef9e4aefea4083658a0ee0633abb28bbef6e866ac79eb62b02"}],"outputs":[{"pubkey":"4f7a7107ee295c381fea1ffa3c0a20c313f80a88c859eac7a556de9a65407822","value":49000000000000}],"type":"transaction"},"type":"object"}
    // client.write(JSON.stringify(trans3) + "\n");
    // client.write(JSON.stringify(trans4) + "\n");
    // client.write(JSON.stringify({"objectid":"0000000196862be06c7175801855ed2886a97f1b2ac4d35c61235278cc4d9c80","type":"getobject"}) + "\n");
    
    // let block4 = {"object":{"T":"f000000000000000000000000000000000000000000000000000000000000000","created":0,"miner":"grader","nonce":"0000000000000000000000000000000000000000000000000000000000000000","note":"Block with incorrect target","previd":"00000000a420b7cefa2b7730243316921ed59ffe836e111ca3801f82a4f5360e","txids":[] as any,"type":"block"},"type":"object"}
    // client.write(JSON.stringify(block4) + "\n");

    // let block5 = {"object":{"T":"00000002af000000000000000000000000000000000000000000000000000000","created":0,"miner":"grader","nonce":"0000000000000000000000000000000000000000000000000000000000000000","note":"Block with invalid PoW","previd":"00000000a420b7cefa2b7730243316921ed59ffe836e111ca3801f82a4f5360e","txids":[] as any,"type":"block"},"type":"object"}
    // client.write(JSON.stringify(block5) + "\n");

    // let tx60 = {"object":{"height":0,"outputs":[{"pubkey":"2f4737da7c94f08b826ff7b90928809c827b58cfb6a9e3ebfedb641f9bdb1bd8","value":50000000000000}],"type":"transaction"},"type":"object"}
    // let block61={"object":{"T":"00000002af000000000000000000000000000000000000000000000000000000","created":1650360325883,"miner":"grader","nonce":"b55afc8030628c46e7dff949daeee10a492b9c54ad3835967f82bff5f01bc565","note":"First block ","previd":"00000000a420b7cefa2b7730243316921ed59ffe836e111ca3801f82a4f5360e","txids":["6ae846ec1a8c0422ed939f9a64b25093eaf9cb5348ac1365bd9e0b927d710019"],"type":"block"},"type":"object"}
    // let tx61= {"object":{"height":0,"outputs":[{"pubkey":"2f4737da7c94f08b826ff7b90928809c827b58cfb6a9e3ebfedb641f9bdb1bd8","value":50000000000000}],"type":"transaction"},"type":"object"}
    // let tx62 = {"object":{"height":1,"outputs":[{"pubkey":"2f4737da7c94f08b826ff7b90928809c827b58cfb6a9e3ebfedb641f9bdb1bd8","value":80000000000000}],"type":"transaction"},"type":"object"}
    // let tx63 = {"object":{"inputs":[{"outpoint":{"index":0,"txid":"6ae846ec1a8c0422ed939f9a64b25093eaf9cb5348ac1365bd9e0b927d710019"},"sig":"48b558198f958de15c3e486c35a78dc76196a3f5bab3d3951035128e30fa31dceaa6372e1b6a3052d9ad1a3c0c4be761617d3b3d58502de7564621665d821a0e"}],"outputs":[{"pubkey":"2f4737da7c94f08b826ff7b90928809c827b58cfb6a9e3ebfedb641f9bdb1bd8","value":40000000000000}],"type":"transaction"},"type":"object"}
    // let block62={"object":{"T":"00000002af000000000000000000000000000000000000000000000000000000","created":1650374139735,"miner":"grader","nonce":"0a617bf859c8d439c6c67e2758b28a16d2ef013b0594c877fa7a03573d49517a","note":"Law of conservation is violated","previd":"000000016bcb1ff93e5926c9f39e9709ddc537813580d426c332180357bb2faf","txids":["a80b8eeceb87ef7f748bea64653e7f2e95e98915795ad96a8001500b99dd4034","c1a4da505aee98180c3aca1495a3f06840b99ac644311d3998f41c5699c96900"],"type":"block"},"type":"object"}
    // client.write(JSON.stringify(block61) + "\n");
    // client.write(JSON.stringify(tx60) + "\n");
    // client.write(JSON.stringify(block62) + "\n");
    // client.write(JSON.stringify(tx61) + "\n");
    // client.write(JSON.stringify(tx62) + "\n");
    // client.write(JSON.stringify(tx63) + "\n");

    // let block7 = {"object":{"T":"00000002af000000000000000000000000000000000000000000000000000000","created":1650348668065,"miner":"grader","nonce":"0f7f45ae349d078a53ff585d5a799948e08667acf63c8d6188e8d1a7abaa0e55","note":"Invalid transaction","previd":"00000000a420b7cefa2b7730243316921ed59ffe836e111ca3801f82a4f5360e","txids":["6ae846ec1a8c0422ed939f9a64b25093eaf9cb5348ac1365bd9e0b927d710019","ff534ea7bc01239d7b5b5118fefee2e981147745237e9e75f64b8d563979927b"],"type":"block"},"type":"object"}
    // client.write(JSON.stringify(block7) + "\n");

    // let block8 = {"object":{"T":"00000002af000000000000000000000000000000000000000000000000000000","created":1650421590750,"miner":"grader","nonce":"104069820c2eab27b8ffe14fb9cb52ed97ee1257acd7971f3b4be864622a4586","note":"Two coinbase transactions","previd":"00000000a420b7cefa2b7730243316921ed59ffe836e111ca3801f82a4f5360e","txids":["6ae846ec1a8c0422ed939f9a64b25093eaf9cb5348ac1365bd9e0b927d710019","6ae846ec1a8c0422ed939f9a64b25093eaf9cb5348ac1365bd9e0b927d710019"],"type":"block"},"type":"object"}
    // client.write(JSON.stringify(block8) + "\n");

    // let block91 = {"object":{"T":"00000002af000000000000000000000000000000000000000000000000000000","created":1650429488757,"miner":"grader","nonce":"b03e884410b399d5e741a406a563247987f6b481ccfaf888cf1da1bc8652f13d","note":"This block has a coinbase transaction","previd":"00000000a420b7cefa2b7730243316921ed59ffe836e111ca3801f82a4f5360e","txids":["48c2ae2fbb4dead4bcc5801f6eaa9a350123a43750d22d05c53802b69c7cd9fb"],"type":"block"},"type":"object"}
    // let tx91 = {"object":{"height":1,"outputs":[{"pubkey":"62b7c521cd9211579cf70fd4099315643767b96711febaa5c76dc3daf27c281c","value":50000000000000}],"type":"transaction"},"type":"object"}
    // let block92 = {"object":{"T":"00000002af000000000000000000000000000000000000000000000000000000","created":1650443872692,"miner":"grader","nonce":"3bb79b0f01194f3fc93c1ad5ae581255290928382d43c310de23061187cfb3b9","note":"This block spends coinbase transaction twice","previd":"000000001b4a28cba15006342f40004aba3038c9d04489ffd0f6454eed80fad1","txids":["d33ac384ea704025a6cac53f669c8e924eff7205b0cd0d6a231f0881b6265a8e","b00a4ef2e9a9985700d9b31f84e18b56fdcd7d824e450b276031e53d20a441fe"],"type":"block"},"type":"object"}
    // let tx92 = {"object":{"inputs":[{"outpoint":{"index":0,"txid":"48c2ae2fbb4dead4bcc5801f6eaa9a350123a43750d22d05c53802b69c7cd9fb"},"sig":"d51e82d5c121c5db21c83404aaa3f591f2099bccf731208c4b0b676308be1f994882f9d991c0ebfd8fdecc90a4aec6165fc3440ade9c83b043cba95b2bba1d0a"}],"outputs":[{"pubkey":"228ee807767047682e9a556ad1ed78dff8d7edf4bc2a5f4fa02e4634cfcad7e0","value":49000000000000}],"type":"transaction"},"type":"object"}
    // let tx93 = {"object":{"inputs":[{"outpoint":{"index":0,"txid":"48c2ae2fbb4dead4bcc5801f6eaa9a350123a43750d22d05c53802b69c7cd9fb"},"sig":"5719653765e9a541ba9e6e1173ed05023091294190fc4f21ebc997935d09baf66b6b051368473480d84fb644671aca63e2ad0999c57266098e959b092ea06a0b"}],"outputs":[{"pubkey":"59fe88f36b19b95267f18cf6ad5879afa9fca3b9fec3953d93d3efade5abe294","value":48000000000000}],"type":"transaction"},"type":"object"}
    // client.write(JSON.stringify(block91) + "\n");
    // client.write(JSON.stringify(tx91) + "\n");
    // client.write(JSON.stringify(block92) + "\n");
    // client.write(JSON.stringify(tx92) + "\n");
    // client.write(JSON.stringify(tx93) + "\n");
    
    // let tx101 = {"object":{"height":1,"outputs":[{"pubkey":"2564e783d664c41cee6cd044f53eb7a79f09866a7c66d47e1ac0747431e8ea7d","value":50000000000000}],"type":"transaction"},"type":"object"}
    // let block102 = {"object":{"T":"00000002af000000000000000000000000000000000000000000000000000000","created":1650416900867,"miner":"grader","nonce":"f17f634c8662a18c7f74b36ebbdded2210e66eb07b9c7b47e38e5ab47be7aa88","note":"This block spends a coinbase transaction not in its prev blocks","previd":"00000000a420b7cefa2b7730243316921ed59ffe836e111ca3801f82a4f5360e","txids":["869676c06de441f83e7437db7ad0804bb5b2342f12dd9bbd12ee562d1486f7aa"],"type":"block"},"type":"object"}
    // let tx102 = {"object":{"inputs":[{"outpoint":{"index":0,"txid":"535c47f49925a6a64f9fa98f012db3b8d6afebad2029cfa3341abe16abda5d29"},"sig":"774c44c33ffe5727fd9d45a2bfb13415b395eca2ec9fc6e9ea896315a3c0fb4f49f77c497a3a1f7cf7e93b4c844c1aa9e7cd428c077e396f9458850f7dc89e02"}],"outputs":[{"pubkey":"be49ae0682fc38da5c981a36a405a4031ff1b5d3acb541d80e9c8e645b77b340","value":49000000000000}],"type":"transaction"},"type":"object"}
    // client.write(JSON.stringify(tx101) + "\n");
    // client.write(JSON.stringify(block102) + "\n");
    // client.write(JSON.stringify(tx102) + "\n");


    // client.write(canonicalize({"object": block1_transaction, "type":"object"}) + "\n");
    // // client.write(canonicalize({"object": block1_fake_transaction, "type":"object"}) + "\n");
    // client.write(canonicalize({"object": trans_2, "type":"object"}) + "\n");
    // client.write(canonicalize({"object": fake_block_1, "type":"object"}) + "\n");
}

function test3_failed(){
    let gen = {"object":{"T":"00000002af000000000000000000000000000000000000000000000000000000","created":1624219079,"miner":"dionyziz","nonce":"0000000000000000000000000000000000000000000000000000002634878840","note":"The Economist 2021-06-20: Crypto-miners are probably to blame for the graphics-chip shortage","previd":null as any,"txids":[] as any,"type":"block"},"type":"object"}
    let block1 = {"object":{"height":1,"outputs":[{"pubkey":"2545c0cf0d68a55f224e6d997b90295f5dc811204f3296aad761b14245b8011f","value":50000000000000}],"type":"transaction"},"type":"object"}
    let block2 = {"object":{"T":"00000002af000000000000000000000000000000000000000000000000000000","created":1650650324705,"miner":"grader","nonce":"0000000000000000000000000000000000000000000000000000000048d3978f","note":"This block has a coinbase transaction","previd":"00000000a420b7cefa2b7730243316921ed59ffe836e111ca3801f82a4f5360e","txids":["a8dce60f89fba3cfcc8bef6a16c80c9b0a0b178eaf378589d62b8e5354867425"],"type":"block"},"type":"object"}
    let block3 = {"object":{"inputs":[{"outpoint":{"index":0,"txid":"a8dce60f89fba3cfcc8bef6a16c80c9b0a0b178eaf378589d62b8e5354867425"},"sig":"3f86c5b33355d67329bed01a1ff5fcb05643a686ee6f7326328d2a5f616b1d992e89fbcaf54a572bd4f79fdb97f3442b49ee6b46190ac8b2fe17242f1de5ad07"}],"outputs":[{"pubkey":"8606c53f1e5efa6cad2db6b009a4429274ede8f0dab321ebfbb55bfb0efb1bb7","value":49000000000000}],"type":"transaction"},"type":"object"}
    let block4 = {"object":{"height":2,"outputs":[{"pubkey":"1a2f8b8698c467643ffe59902e0eeab0989b723605da8de70378eb85d59dff54","value":51000000000000}],"type":"transaction"},"type":"object"}
    let block5 = {"object":{"T":"00000002af000000000000000000000000000000000000000000000000000000","created":1650650324705,"miner":"grader","nonce":"0000000000000000000000000000000000000000000000000000000020c5e20f","note":"This block has another coinbase and spends earlier coinbase","previd":"000000017c4ecb9f44f2003ec3b47dd4335bff5a84bb0f464193e4cca700f7e4","txids":["72dc0438756e7b32e849e495e2252a4a6b4fd699c705ffee7d27342ed135fde1","f67b65f34c00f7d7293bc6b58194739fb38848ebab78099c2c51d8abefdb3c99"],"type":"block"},"type":"object"}
    let block6 = {"object":{"height":1,"outputs":[{"pubkey":"a1f947ad8bdacb2ce828001f53114a114877c7f544d6648f68b1ad498699492e","value":50000000000000}],"type":"transaction"},"type":"object"}
    let block7 = {"object":{"T":"00000002af000000000000000000000000000000000000000000000000000000","created":1650650324705,"miner":"grader","nonce":"0000000000000000000000000000000000000000000000000000000002122f9f","note":"This block has a coinbase transaction","previd":"00000000a420b7cefa2b7730243316921ed59ffe836e111ca3801f82a4f5360e","txids":["cd60a35605170d6fbad30843416d01e3e3716b39dbc3dc47962c920ad47a094a"],"type":"block"},"type":"object"}
    let block8 = {"object":{"inputs":[{"outpoint":{"index":0,"txid":"cd60a35605170d6fbad30843416d01e3e3716b39dbc3dc47962c920ad47a094a"},"sig":"70fc79646486dfdc938e6a03839dc1fd09aebce8a04c64e2ccb5b52676579dfa4f6ae671950dbf8ef08d1330670761839bc3cd9c310064d8e7492b312b92cc00"}],"outputs":[{"pubkey":"a1f947ad8bdacb2ce828001f53114a114877c7f544d6648f68b1ad498699492e","value":40000000000000}],"type":"transaction"},"type":"object"}
    let block9 = {"object":{"T":"00000002af000000000000000000000000000000000000000000000000000000","created":1650650324705,"miner":"grader","nonce":"000000000000000000000000000000000000000000000000000000008514b524","note":"This block has a transaction spending the coinbase","previd":"00000000a420b7cefa2b7730243316921ed59ffe836e111ca3801f82a4f5360e","txids":["cd60a35605170d6fbad30843416d01e3e3716b39dbc3dc47962c920ad47a094a","5dbf776d4227962fef8fc877143401196a98f401827b40b3f2971c8ed3fa8d9c"],"type":"block"},"type":"object"}

    client.write(JSON.stringify(gen) + "\n");
    client.write(JSON.stringify(block1) + "\n");
    client.write(JSON.stringify(block2) + "\n");
    client.write(JSON.stringify(block3) + "\n");
    client.write(JSON.stringify(block4) + "\n");
    client.write(JSON.stringify(block5) + "\n");
    client.write(JSON.stringify(block6) + "\n");
    client.write(JSON.stringify(block7) + "\n");
    client.write(JSON.stringify(block8) + "\n");
    client.write(JSON.stringify(block9) + "\n");
    
}

function test4_chain(){
    let genesis = {"object":{"T":"00000002af000000000000000000000000000000000000000000000000000000","created":1624219079,"miner":"dionyziz","nonce":"0000000000000000000000000000000000000000000000000000002634878840","note":"The Economist 2021-06-20: Crypto-miners are probably to blame for the graphics-chip shortage","previd":null as any,"txids":[] as any,"type":"block"},"type":"object"}
    
    client.write(canonicalize(genesis) + "\n");
    client.write(canonicalize({"objectid":"00000000a420b7cefa2b7730243316921ed59ffe836e111ca3801f82a4f5360e","type":"getobject"}) + "\n");

    let block2 = {"object":{"T":"00000002af000000000000000000000000000000000000000000000000000000","created":1652772747,"miner":"grader","nonce":"d20e849d2e19dc7408b0c02d4dba5a1b3895839a4242660ae8ee18a5a97bcae7","note":"This block has a coinbase transaction","previd":"00000000a420b7cefa2b7730243316921ed59ffe836e111ca3801f82a4f5360e","txids":["2aac601bb784c0de6fdbf47918c9928fb0505eda3174d5cc7790f9b7d27e1963"],"type":"block"},"type":"object"}
    client.write(JSON.stringify(block2) + "\n");
    let trans1 = {"object":{"height":1,"outputs":[{"pubkey":"6756c64a8f9cdce26a0c390134a780bedaa04dd74722047f3da6600f141e86d3","value":50000000000000}],"type":"transaction"},"type":"object"}
    client.write(JSON.stringify(trans1) + "\n");
    client.write(JSON.stringify({"objectid":"00000002364806bfeafd0af08e88805ce14ea2e0222e0d3aaee3fe1809047482","type":"getobject"}) + "\n");

    let block3 = {"object":{"T":"00000002af000000000000000000000000000000000000000000000000000000","created":1652772748,"miner":"grader","nonce":"eab983d7bf941a212915b2155375e5ae308e23fe346155f8c8cb552c4ac98e51","note":"This block has another coinbase and spends earlier coinbase","previd":"00000002364806bfeafd0af08e88805ce14ea2e0222e0d3aaee3fe1809047482","txids":["1db7b7b6a0971aac14cc3a5114864c89c0455c2baebf3050760c30a24964cf7c","314e63a79f51450750282a02bc669d799781b222379930be635d7f2429c0fb36"],"type":"block"},"type":"object"}
    client.write(JSON.stringify(block3) + "\n");
    let trans3 = {"object":{"height":2,"outputs":[{"pubkey":"25ecf98703df4843d1dac2754776044cbec63082bf563bf23ccb2a2adf8d93e6","value":51000000000000}],"type":"transaction"},"type":"object"}
    let trans4={"object":{"inputs":[{"outpoint":{"index":0,"txid":"2aac601bb784c0de6fdbf47918c9928fb0505eda3174d5cc7790f9b7d27e1963"},"sig":"55158c00fd062e2567580bcedf38399807440481b3af74c1959405e4f372d0f487ce742924e5c5ef9e4aefea4083658a0ee0633abb28bbef6e866ac79eb62b02"}],"outputs":[{"pubkey":"4f7a7107ee295c381fea1ffa3c0a20c313f80a88c859eac7a556de9a65407822","value":49000000000000}],"type":"transaction"},"type":"object"}
    client.write(JSON.stringify(trans3) + "\n");
    client.write(JSON.stringify(trans4) + "\n");
    client.write(JSON.stringify({"objectid":"0000000196862be06c7175801855ed2886a97f1b2ac4d35c61235278cc4d9c80","type":"getobject"}) + "\n");
    
    client.write(JSON.stringify({"type": "getchaintip"}) + "\n");
}
