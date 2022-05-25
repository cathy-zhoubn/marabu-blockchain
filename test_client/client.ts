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

    // test3_failed();

    test5_1();
    test5_2();
    // test5_3();
    // test5_4();
    // test5_5();
    // test5_6();


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


function test5_1() {
    let block1 = {"object":{"T":"00000002af000000000000000000000000000000000000000000000000000000","created":1653114410,"miner":"grader","nonce":"000000000000000000000000000000000000000000000000000000006fba3415","note":"First block","previd":"00000000a420b7cefa2b7730243316921ed59ffe836e111ca3801f82a4f5360e","txids":["3838027f66729e4d9408eef6460d64b7fb81a861ee9012a1549ecd7866a04097"],"type":"block"},"type":"object"}
    let tx1 = {"object":{"height":1,"outputs":[{"pubkey":"433ea9cedb21d2acf4efad3b864431ffeb66187bd2527a1d2523f5db3654cb36","value":400}],"type":"transaction"},"type":"object"}
    let block2 = {"object":{"T":"00000002af000000000000000000000000000000000000000000000000000000","created":1653164132,"miner":"grader","nonce":"00000000000000000000000000000000000000000000000000000000058fccdc","note":"Second block","previd":"00000001508fe4581e508492cc5d46911c03160c221f4edab73dd0ab2e474dfb","txids":["aa82e97e2eaab8d4d455312c8626e0af86844a3b91b42729be14822048223455"],"type":"block"},"type":"object"}
    let tx2 = {"object":{"height":2,"outputs":[{"pubkey":"433ea9cedb21d2acf4efad3b864431ffeb66187bd2527a1d2523f5db3654cb36","value":600}],"type":"transaction"},"type":"object"}
    let block3 = {"object":{"T":"00000002af000000000000000000000000000000000000000000000000000000","created":1653164322,"miner":"grader","nonce":"00000000000000000000000000000000000000000000000000000001b8db7343","note":"Third block","previd":"000000016dc7aee35b78c658b05e0caf4057958d2ce0208424b03e91192a312d","txids":["090365b8931464e4a5a36e3a1eb0096a6e256ef82c629e7ddf5bae344e96fe51"],"type":"block"},"type":"object"}
    let tx3 = {"object":{"inputs":[{"outpoint":{"index":0,"txid":"3838027f66729e4d9408eef6460d64b7fb81a861ee9012a1549ecd7866a04097"},"sig":"04e7892df0baf874f97afa4cbe8b4222ad1dc01045b3ae30c6b91777b113c3f4e2e899ab795bfdec82b3cbd02e9b1bdd01c09f14c7a5ebe3f8ec5e04a5b8cf07"},{"outpoint":{"index":0,"txid":"aa82e97e2eaab8d4d455312c8626e0af86844a3b91b42729be14822048223455"},"sig":"04e7892df0baf874f97afa4cbe8b4222ad1dc01045b3ae30c6b91777b113c3f4e2e899ab795bfdec82b3cbd02e9b1bdd01c09f14c7a5ebe3f8ec5e04a5b8cf07"}],"outputs":[{"pubkey":"433ea9cedb21d2acf4efad3b864431ffeb66187bd2527a1d2523f5db3654cb36","value":10}],"type":"transaction"},"type":"object"}
    let message3 = {"objectid":"000000029c6411250ae74efcfbc83a16588d55d98b49d7540e284cdb4b7ab6ac","type":"getobject"}

    client.write(JSON.stringify(block1) + "\n");
    client.write(JSON.stringify(tx1) + "\n");
    client.write(JSON.stringify(block2) + "\n");
    client.write(JSON.stringify(tx2) + "\n");
    client.write(JSON.stringify(block3) + "\n");
    client.write(JSON.stringify(tx3) + "\n");
    client.write(JSON.stringify(message3) + "\n");
    /* 
    expect    
    Grader received message: {"object":{"T":"00000002af000000000000000000000000000000000000000000000000000000","created":1653164322,"miner":"grader","nonce":"00000000000000000000000000000000000000000000000000000001b8db7343","note":"Third block","previd":"000000016dc7aee35b78c658b05e0caf4057958d2ce0208424b03e91192a312d","txids":["090365b8931464e4a5a36e3a1eb0096a6e256ef82c629e7ddf5bae344e96fe51"],"type":"block"},"type":"object"}
    */
}

function test5_2(){
    let block1 = {"object":{"T":"00000002af000000000000000000000000000000000000000000000000000000","created":1653128470,"miner":"grader","nonce":"0000000000000000000000000000000000000000000000000000000019457a6a","note":"First block","previd":"00000000a420b7cefa2b7730243316921ed59ffe836e111ca3801f82a4f5360e","txids":["87b88433cba3876d5a43447b214c7dfd34e4418a5e0ac1ddd5d284f3808ccd19"],"type":"block"},"type":"object"}
    let tx1 = {"object":{"height":1,"outputs":[{"pubkey":"c4a19efd87ff220307c667e775b032089b5c6ac2abc35887d5540268d00f54e2","value":400}],"type":"transaction"},"type":"object"}
    let block2 = {"object":{"T":"00000002af000000000000000000000000000000000000000000000000000000","created":1653129342,"miner":"grader","nonce":"0000000000000000000000000000000000000000000000000000000146804072","note":"Second block","previd":"000000027fca01c43084fff5a050b28cdc20d69ac7b88e549aa6345e7c121c22","txids":["f3fb9aad35939b6ee4313e44e5b4dfc69e3b92656c69a5027f30ac3bb4a784ff"],"type":"block"},"type":"object"}
    let tx2 = {"object":{"height":2,"outputs":[{"pubkey":"c4a19efd87ff220307c667e775b032089b5c6ac2abc35887d5540268d00f54e2","value":600}],"type":"transaction"},"type":"object"}
    let block3 = {"object":{"T":"00000002af000000000000000000000000000000000000000000000000000000","created":1653140604,"miner":"grader","nonce":"000000000000000000000000000000000000000000000000000000003ab77c19","note":"Third block","previd":"00000000f5f5b0d8b556257f205e9dc9e6c59bd1ca885e46811d32f9f9a5bff9","txids":["1d3b01349053811c44b0312020f0b0f97504b977a78204adf2adefcbb8f1b9c2"],"type":"block"},"type":"object"}
    let tx3 = {"object":{"inputs":[{"outpoint":{"index":0,"txid":"87b88433cba3876d5a43447b214c7dfd34e4418a5e0ac1ddd5d284f3808ccd19"},"sig":"86defafef965e6960d9ce4bd5d1a488666dc0b70b26378fc03534e3404ef1544c53d2377e7e7566502a6e81984dcb0f94df951495f34f6a8f0d8a05f49626604"},{"outpoint":{"index":0,"txid":"f3fb9aad35939b6ee4313e44e5b4dfc69e3b92656c69a5027f30ac3bb4a784ff"},"sig":"86defafef965e6960d9ce4bd5d1a488666dc0b70b26378fc03534e3404ef1544c53d2377e7e7566502a6e81984dcb0f94df951495f34f6a8f0d8a05f49626604"}],"outputs":[{"pubkey":"c4a19efd87ff220307c667e775b032089b5c6ac2abc35887d5540268d00f54e2","value":10}],"type":"transaction"},"type":"object"}
    let message = {"objectid":"00000000c06249202135071c3662ed9d9e26d924ba9dd29d61af4b8e55e2dcdb","type":"getobject"}
    
    client.write(JSON.stringify(block1) + "\n");
    client.write(JSON.stringify(tx1) + "\n");
    client.write(JSON.stringify(block2) + "\n");
    client.write(JSON.stringify(tx2) + "\n");
    client.write(JSON.stringify(block3) + "\n");
    client.write(JSON.stringify(tx3) + "\n");
    client.write(JSON.stringify(message) + "\n");
    /* 
    Expect
    {"object":{"T":"00000002af000000000000000000000000000000000000000000000000000000","created":1653140604,"miner":"grader","nonce":"000000000000000000000000000000000000000000000000000000003ab77c19","note":"Third block","previd":"00000000f5f5b0d8b556257f205e9dc9e6c59bd1ca885e46811d32f9f9a5bff9","txids":["1d3b01349053811c44b0312020f0b0f97504b977a78204adf2adefcbb8f1b9c2"],"type":"block"},"type":"object"}
    */
}

function test5_3(){
    let block1 = {"object":{"T":"00000002af000000000000000000000000000000000000000000000000000000","created":1653179285,"miner":"grader","nonce":"000000000000000000000000000000000000000000000000000000007f41b71e","note":"First block","previd":"00000000a420b7cefa2b7730243316921ed59ffe836e111ca3801f82a4f5360e","txids":["45b83ca1f7d6d083bd5116866f006b3979d15bc11ee32546e6cf7c84e4c3eee6"],"type":"block"},"type":"object"}
    let tx1 = {"object":{"height":1,"outputs":[{"pubkey":"5f0b5847953fdd1c3db2f4622b9d507fdcc16b96a33557ea51ac189d772a8697","value":400}],"type":"transaction"},"type":"object"}
    let block2 = {"object":{"inputs":[{"outpoint":{"index":0,"txid":"45b83ca1f7d6d083bd5116866f006b3979d15bc11ee32546e6cf7c84e4c3eee6"},"sig":"f64a8fb07971588ff438fa5a4e7df694ce978e9ccbb92c22fb36c6ed4b7e434b19fa04f01027903f49d0222111229fa924a0edecb07a7f120a19221ce42e6d0b"},{"outpoint":{"index":0,"txid":"45b83ca1f7d6d083bd5116866f006b3979d15bc11ee32546e6cf7c84e4c3eee6"},"sig":"f64a8fb07971588ff438fa5a4e7df694ce978e9ccbb92c22fb36c6ed4b7e434b19fa04f01027903f49d0222111229fa924a0edecb07a7f120a19221ce42e6d0b"}],"outputs":[{"pubkey":"5f0b5847953fdd1c3db2f4622b9d507fdcc16b96a33557ea51ac189d772a8697","value":10}],"type":"transaction"},"type":"object"}
    
    client.write(JSON.stringify(block1) + "\n");
    client.write(JSON.stringify(tx1) + "\n");
    client.write(JSON.stringify(block2) + "\n");

    /* 
    expect: error, not gossip
    */
}

function test5_4(){
    let block1 = {"object":{"T":"00000002af000000000000000000000000000000000000000000000000000000","created":1653183619,"miner":"grader","nonce":"0000000000000000000000000000000000000000000000000000000020bb67aa","note":"This block contains a long note which is more than 128 characters. Therefore, this block is an invalid block. You should ensure that the note and miner fields in a block are ASCII-printable strings up to 128 characters long each.","previd":"00000000a420b7cefa2b7730243316921ed59ffe836e111ca3801f82a4f5360e","txids": [] as any,"type":"block"},"type":"object"}
    
    client.write(JSON.stringify(block1) + "\n");
    /* 
    expect
    error, not gossip
    */
}

function test5_5(){
    let block1 = {"object":{"T":"00000002af000000000000000000000000000000000000000000000000000000","created":1653205905,"miner":"grader","nonce":"000000000000000000000000000000000000000000000000000000000e7566c5","note":"First block","previd":"0000000170ca89f3c6d0a4a6bf336f7bc3de0d3d68732c3ee671e4a200ecb6f1","txids":["046cf1a7a2c705f006f530168b629dbc7952ecc9cc663a9e282bfe1875ae9ca0"],"type":"block"},"type":"object"}
    let block2 = {"object":{"T":"00000002af000000000000000000000000000000000000000000000000000000","created":1653206398,"miner":"grader","nonce":"0000000000000000000000000000000000000000000000000000000000c60bb8","note":"Second block","previd":"00000000bda06a6703b85aebdf0414e618b6a0b140adf52b502380bc376215df","txids":["87630141045652f4e6c809255782b0b14dd4f9a3af9cdd148d8eede4a3c2092c"],"type":"block"},"type":"object"}
    let block3 = {"object":{"T":"00000002af000000000000000000000000000000000000000000000000000000","created":1653206425,"miner":"grader","nonce":"0000000000000000000000000000000000000000000000000000000030b2db05","note":"Third block","previd":"00000000fe27cb3cc34e69e09c188193eb5cbf611fe5f046c6e90e0fdb23eec1","txids":["7bd03919d576151b784eb122980bacd5d8697fd04c36e2dcb8b8f84774e3e7cf","bd06ef629aac4b94973c6ce42a02dc1e14b381f57d13575b568a23a453f41d2b"],"type":"block"},"type":"object"}
    let block4 = {"object":{"T":"00000002af000000000000000000000000000000000000000000000000000000","created":1653208558,"miner":"grader","nonce":"00000000000000000000000000000000000000000000000000000000e0864f3a","note":"Forth block","previd":"00000002237c6615963f45247b3b36a74f393003750ce1e158d955e2f470b97a","txids":["74aae585e415533324eeac643ea2f9b5a18db0e1a72b69b0dae4faf6db6df844","25b6ec987babf38fa650d09f11aac3c4a2e3bba3b5510d6046bc1a91eb51a8c0"],"type":"block"},"type":"object"}
    let block5 = {"object":{"T":"00000002af000000000000000000000000000000000000000000000000000000","created":1653218390,"miner":"grader","nonce":"000000000000000000000000000000000000000000000000000000000d9cf310","note":"Fifth block","previd":"00000001963d459d45da3e507f41dfbb627d947f4f9a19693ec3802239c7f77d","txids":["73bf949f48cb9e1e128d25ffa1b2b5babee495c2efddcb07ffdfdfeb28236015","4eb4d5ae8554b43013c4131c2bed33acc442c1888cdb72b53053ce5d607cdb65"],"type":"block"},"type":"object"}
    let tx1 = {"object":{"inputs":[{"outpoint":{"index":0,"txid":"74aae585e415533324eeac643ea2f9b5a18db0e1a72b69b0dae4faf6db6df844"},"sig":"349726132894913859562c4e39b318585631b7cfa81cb5d200c71d84036c509a4020732b30364c0f45a425c8bc509233a14a72342440168cc6db797111abf904"}],"outputs":[{"pubkey":"d5d0f667344c38fe28838f181cd5041c18e52f63acbbfd9af6b766c1c36fc132","value":10}],"type":"transaction"},"type":"object"}
    let tx2 = {"object":{"inputs":[{"outpoint":{"index":0,"txid":"73bf949f48cb9e1e128d25ffa1b2b5babee495c2efddcb07ffdfdfeb28236015"},"sig":"9eed9c0bd8ab5979c335ff7d3536441dd09491780d92da8983a51faeb8e76ef53ceb5a03a1da620f63650926032d1e7b2bfcfec8c6224e6afffdb22c0d636b08"}],"outputs":[{"pubkey":"4eee49a809e959b0169634598a2d57ed5bbc038880c54f6d6e5cf8cdbf387f9e","value":10}],"type":"transaction"},"type":"object"}
    let tx3 = {"object":{"inputs":[{"outpoint":{"index":0,"txid":"046cf1a7a2c705f006f530168b629dbc7952ecc9cc663a9e282bfe1875ae9ca0"},"sig":"cdcc3bbede3ef0c55c93e9d2eb75da2a1e8bf55cc55467f386ec9b7aa01352f7f000e711c0acd9ac4eb4de01c0af610c585f926a812ec162aba5463c96151b02"}],"outputs":[{"pubkey":"102485c802d15a228ac9865632e181546c0372e3cc33fcc6d93c5a3eaff1dd00","value":20}],"type":"transaction"},"type":"object"}
    let tx4 = {"object":{"inputs":[{"outpoint":{"index":0,"txid":"87630141045652f4e6c809255782b0b14dd4f9a3af9cdd148d8eede4a3c2092c"},"sig":"8c3b77b75f25ec8771b25226bf52325f6de0db49fc29d47ebaa6c34d3091ee402de03de9c2aa6143cf31b80a5b78d01bf2352cf815a9c7d803161961bbf75600"}],"outputs":[{"pubkey":"db7e2816d787d252d81248fdbf8696686dde9a0aa16931b400c5d21412c273b7","value":20}],"type":"transaction"},"type":"object"}
    let tx5 = {"object":{"height":17,"outputs":[{"pubkey":"30dd2e554fe1a9db05b58bf3b96b9aaa2b503e566347ec0a50bf73a4c339a05d","value":400}],"type":"transaction"},"type":"object"}
    let message = {"type":"getmempool"}
    
    client.write(JSON.stringify(block1) + "\n");
    client.write(JSON.stringify(block2) + "\n");
    client.write(JSON.stringify(block3) + "\n");
    client.write(JSON.stringify(block4) + "\n");
    client.write(JSON.stringify(block5) + "\n");
    client.write(JSON.stringify(tx1) + "\n");
    client.write(JSON.stringify(tx2) + "\n");
    client.write(JSON.stringify(tx3) + "\n");
    client.write(JSON.stringify(tx4) + "\n");
    client.write(JSON.stringify(tx5) + "\n");
    client.write(JSON.stringify(message) + "\n");


    /* 
    expect correct mempool */

}

function test5_6(){
    let block1 = {"object":{"T":"00000002af000000000000000000000000000000000000000000000000000000","created":1653218978,"miner":"grader","nonce":"0000000000000000000000000000000000000000000000000000000003ee64f4","note":"New forth block","previd":"00000002237c6615963f45247b3b36a74f393003750ce1e158d955e2f470b97a","txids":["59a84565d9ce94fc44309715055859e21d53a89217fd151b7ba6369ac89da823"],"type":"block"},"type":"object"}
    let block2 = {"object":{"T":"00000002af000000000000000000000000000000000000000000000000000000","created":1653219130,"miner":"grader","nonce":"00000000000000000000000000000000000000000000000000000000008e23df","note":"New fifth block","previd":"00000001b5d7cce513920e64f3d4ed0d21b0a1c99004803ba219f4941f61adc1","txids":[] as any,"type":"block"},"type":"object"}
    let block3 = {"object":{"T":"00000002af000000000000000000000000000000000000000000000000000000","created":1653219149,"miner":"grader","nonce":"00000000000000000000000000000000000000000000000000000000f17794a4","note":"New sixth block","previd":"00000000bff3ae7c1b919013557f000e6e46e36ff06e44cafcc6205d1be0258d","txids":[] as any,"type":"block"},"type":"object"}
    let message = {"type":"getmempool"}

    client.write(JSON.stringify(block1) + "\n");
    client.write(JSON.stringify(block2) + "\n");
    client.write(JSON.stringify(block3) + "\n");
    client.write(JSON.stringify(message) + "\n");

}