const Net = require("net");
import { socket_handler } from "./socket";
import config from './config.json';
import { add_object } from "./db";
import { canonicalize } from "json-canonicalize";
import { hash_string } from "./helpers";
import hash from "fast-sha256";

const server_port = 18018;
const host = config.server.host;
const server = new Net.createServer();

function listen_handler() {
  console.log(
    `Server listening for connection requests on socket localhost:${server_port}`
  );
}



export async function run_server() {
  let genesis = JSON.parse(JSON.stringify({ 
    "T": "00000002af000000000000000000000000000000000000000000000000000000", 
    "created": 1624219079, 
    "miner": "dionyziz", 
    "nonce": "0000000000000000000000000000000000000000000000000000002634878840", 
    "note": "The Economist 2021-06-20: Crypto-miners are probably to blame for the graphics-chip shortage", 
    "previd": null as any, 
    "txids": [] as any, 
    "type": "block" 
  }));
  let gen_hash = hash_string(canonicalize(genesis));

  await add_object(gen_hash, canonicalize(genesis));
  server.listen(server_port, host, listen_handler);

  server.on("error", (e: any) => {
    if (e.code === "EADDRINUSE") {
      console.log("Address in use, retrying...");
      setTimeout(() => {
        server.close();
        server.listen(server_port, host, listen_handler);
      }, 1000);
    }
  });

  server.on("connection", function (socket: any) {
    socket_handler(socket)
  });
}


// let tx1 = {"object":{"height":1,"outputs":[{"pubkey":"433ea9cedb21d2acf4efad3b864431ffeb66187bd2527a1d2523f5db3654cb36","value":400}],"type":"transaction"},"type":"object"}
// let tx2 = {"object":{"height":2,"outputs":[{"pubkey":"433ea9cedb21d2acf4efad3b864431ffeb66187bd2527a1d2523f5db3654cb36","value":600}],"type":"transaction"},"type":"object"}
// let tx3 = {"object":{"inputs":[{"outpoint":{"index":0,"txid":"3838027f66729e4d9408eef6460d64b7fb81a861ee9012a1549ecd7866a04097"},"sig":"04e7892df0baf874f97afa4cbe8b4222ad1dc01045b3ae30c6b91777b113c3f4e2e899ab795bfdec82b3cbd02e9b1bdd01c09f14c7a5ebe3f8ec5e04a5b8cf07"},{"outpoint":{"index":0,"txid":"aa82e97e2eaab8d4d455312c8626e0af86844a3b91b42729be14822048223455"},"sig":"04e7892df0baf874f97afa4cbe8b4222ad1dc01045b3ae30c6b91777b113c3f4e2e899ab795bfdec82b3cbd02e9b1bdd01c09f14c7a5ebe3f8ec5e04a5b8cf07"}],"outputs":[{"pubkey":"433ea9cedb21d2acf4efad3b864431ffeb66187bd2527a1d2523f5db3654cb36","value":10}],"type":"transaction"},"type":"object"}
    
// let tx4 = {"object":{"height":1,"outputs":[{"pubkey":"c4a19efd87ff220307c667e775b032089b5c6ac2abc35887d5540268d00f54e2","value":400}],"type":"transaction"},"type":"object"}
// let tx5 = {"object":{"height":2,"outputs":[{"pubkey":"c4a19efd87ff220307c667e775b032089b5c6ac2abc35887d5540268d00f54e2","value":600}],"type":"transaction"},"type":"object"}
// let tx6 = {"object":{"inputs":[{"outpoint":{"index":0,"txid":"87b88433cba3876d5a43447b214c7dfd34e4418a5e0ac1ddd5d284f3808ccd19"},"sig":"86defafef965e6960d9ce4bd5d1a488666dc0b70b26378fc03534e3404ef1544c53d2377e7e7566502a6e81984dcb0f94df951495f34f6a8f0d8a05f49626604"},{"outpoint":{"index":0,"txid":"f3fb9aad35939b6ee4313e44e5b4dfc69e3b92656c69a5027f30ac3bb4a784ff"},"sig":"86defafef965e6960d9ce4bd5d1a488666dc0b70b26378fc03534e3404ef1544c53d2377e7e7566502a6e81984dcb0f94df951495f34f6a8f0d8a05f49626604"}],"outputs":[{"pubkey":"c4a19efd87ff220307c667e775b032089b5c6ac2abc35887d5540268d00f54e2","value":10}],"type":"transaction"},"type":"object"}

// let tx7 = {"object":{"height":1,"outputs":[{"pubkey":"5f0b5847953fdd1c3db2f4622b9d507fdcc16b96a33557ea51ac189d772a8697","value":400}],"type":"transaction"},"type":"object"}
    
// let tx1 = {"object":{"inputs":[{"outpoint":{"index":0,"txid":"74aae585e415533324eeac643ea2f9b5a18db0e1a72b69b0dae4faf6db6df844"},"sig":"349726132894913859562c4e39b318585631b7cfa81cb5d200c71d84036c509a4020732b30364c0f45a425c8bc509233a14a72342440168cc6db797111abf904"}],"outputs":[{"pubkey":"d5d0f667344c38fe28838f181cd5041c18e52f63acbbfd9af6b766c1c36fc132","value":10}],"type":"transaction"},"type":"object"}
// let tx2 = {"object":{"inputs":[{"outpoint":{"index":0,"txid":"73bf949f48cb9e1e128d25ffa1b2b5babee495c2efddcb07ffdfdfeb28236015"},"sig":"9eed9c0bd8ab5979c335ff7d3536441dd09491780d92da8983a51faeb8e76ef53ceb5a03a1da620f63650926032d1e7b2bfcfec8c6224e6afffdb22c0d636b08"}],"outputs":[{"pubkey":"4eee49a809e959b0169634598a2d57ed5bbc038880c54f6d6e5cf8cdbf387f9e","value":10}],"type":"transaction"},"type":"object"}
// let tx3 = {"object":{"inputs":[{"outpoint":{"index":0,"txid":"046cf1a7a2c705f006f530168b629dbc7952ecc9cc663a9e282bfe1875ae9ca0"},"sig":"cdcc3bbede3ef0c55c93e9d2eb75da2a1e8bf55cc55467f386ec9b7aa01352f7f000e711c0acd9ac4eb4de01c0af610c585f926a812ec162aba5463c96151b02"}],"outputs":[{"pubkey":"102485c802d15a228ac9865632e181546c0372e3cc33fcc6d93c5a3eaff1dd00","value":20}],"type":"transaction"},"type":"object"}
// let tx4 = {"object":{"inputs":[{"outpoint":{"index":0,"txid":"87630141045652f4e6c809255782b0b14dd4f9a3af9cdd148d8eede4a3c2092c"},"sig":"8c3b77b75f25ec8771b25226bf52325f6de0db49fc29d47ebaa6c34d3091ee402de03de9c2aa6143cf31b80a5b78d01bf2352cf815a9c7d803161961bbf75600"}],"outputs":[{"pubkey":"db7e2816d787d252d81248fdbf8696686dde9a0aa16931b400c5d21412c273b7","value":20}],"type":"transaction"},"type":"object"}
// let tx5 = {"object":{"height":17,"outputs":[{"pubkey":"30dd2e554fe1a9db05b58bf3b96b9aaa2b503e566347ec0a50bf73a4c339a05d","value":400}],"type":"transaction"},"type":"object"}
    

// console.log(hash_string(canonicalize(tx1)))
// console.log(hash_string(canonicalize(tx2)))
// console.log(hash_string(canonicalize(tx3)))
// console.log(hash_string(canonicalize(tx4)))
// console.log(hash_string(canonicalize(tx5)))
// console.log(hash_string(canonicalize(tx1.object))))););
// console.log(hash_string(canonicalize(tx2.object)));
// console.log(hash_string(canonicalize(tx3.object)));
// console.log(hash_string(canonicalize(tx4.object)));
// console.log(hash_string(canonicalize(tx5.object)));
// console.log(hash_string(canonicalize(tx6.object)));
// console.log(hash_string(canonicalize(tx7.object

add_object()

"046cf1a7a2c705f006f530168b629dbc7952ecc9cc663a9e282bfe1875ae9ca0"
"87630141045652f4e6c809255782b0b14dd4f9a3af9cdd148d8eede4a3c2092c"
"7bd03919d576151b784eb122980bacd5d8697fd04c36e2dcb8b8f84774e3e7cf"
"bd06ef629aac4b94973c6ce42a02dc1e14b381f57d13575b568a23a453f41d2b"
"74aae585e415533324eeac643ea2f9b5a18db0e1a72b69b0dae4faf6db6df844"
"25b6ec987babf38fa650d09f11aac3c4a2e3bba3b5510d6046bc1a91eb51a8c0"
"73bf949f48cb9e1e128d25ffa1b2b5babee495c2efddcb07ffdfdfeb28236015"
"4eb4d5ae8554b43013c4131c2bed33acc442c1888cdb72b53053ce5d607cdb65"

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
    
