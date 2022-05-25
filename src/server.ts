const Net = require("net");
import { socket_handler } from "./socket";
import config from './config.json';
import { add_object } from "./db";
import { canonicalize } from "json-canonicalize";
import { hash_string } from "./helpers";

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


let x = {"object":{"inputs":[{"outpoint":{"index":0,"txid":"45b83ca1f7d6d083bd5116866f006b3979d15bc11ee32546e6cf7c84e4c3eee6"},"sig":"f64a8fb07971588ff438fa5a4e7df694ce978e9ccbb92c22fb36c6ed4b7e434b19fa04f01027903f49d0222111229fa924a0edecb07a7f120a19221ce42e6d0b"},{"outpoint":{"index":0,"txid":"45b83ca1f7d6d083bd5116866f006b3979d15bc11ee32546e6cf7c84e4c3eee6"},"sig":"f64a8fb07971588ff438fa5a4e7df694ce978e9ccbb92c22fb36c6ed4b7e434b19fa04f01027903f49d0222111229fa924a0edecb07a7f120a19221ce42e6d0b"}],"outputs":[{"pubkey":"5f0b5847953fdd1c3db2f4622b9d507fdcc16b96a33557ea51ac189d772a8697","value":10}],"type":"transaction"},"type":"object"}
    
console.log(hash_string(canonicalize(x)))