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

