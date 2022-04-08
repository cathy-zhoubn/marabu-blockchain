const Net = require("net");
import {getIPs} from './db';
import { run_one_client, num_clients} from './client';

const server_port = 18018;
const host = "localhost";
const server = new Net.createServer();
const version_re = /^0.8.\d$/;
const max_send_peers = 8;

export const hello = { type: "hello", version: "0.8.0", agent: "Old Peking" };
export const get_peers = { type: "getpeers" };


function listen_handler() {
  console.log(
    `Server listening for connection requests on socket localhost:${server_port}`
  );
}

export function data_handler(
  chunk: any,
  leftover: string,
  socket: any,
  initialized: boolean
) : string{
  //processing the input
  let original: string = chunk.toString();
  //console.log(`Data received from ${socket.remoteAddress}:${socket.remotePort}: ${original}`);
  let tokenized = original.split("\n");
  tokenized[0] = leftover + tokenized[0];
  leftover = tokenized.pop();
  var json_data_array = [];
  for (let i = 0; i < tokenized.length; i++) {
    let token = tokenized[i];
    try {
      let parsed = JSON.parse(token); //check if it can be parsed into json
      if (!parsed.hasOwnProperty("type")) {
        //check if message contains 'type' field
        console.log(
          `JSON message received from ${socket.remoteAddress}:${socket.remotePort} does not contain "type". Closing the socket.`
        );
        socket.end(
          send_format({
            type: "error",
            error: "Unsupported message format received",
          })
        );
        socket.destroy();
        return;
      }
      json_data_array.push(parsed);
    } catch (e) {
      console.log(
        `Unsupported message format received from ${socket.remoteAddress}:${socket.remotePort}. Closing the socket.`
      );
      socket.end(
        send_format({
          type: "error",
          error: "Unsupported message format received",
        })
      );
      socket.destroy();
      return;
    }
  }

  if (json_data_array.length == 0) return leftover;

  //initial handshake
  if (!initialized) {
    let hello_data = json_data_array.shift();

    if (hello_data.type != "hello") {
      console.log(
        `Received other message types before the initial handshake from ${socket.remoteAddress}:${socket.remotePort}. Closing the socket.`
      );
      socket.end(
        send_format({
          type: "error",
          error: "Received other message types before the initial handshake",
        })
      );
      socket.destroy();
      return;
    }
    if (!version_re.test(hello_data.version)) {
      console.log(
        `Received unsupported version number from ${socket.remoteAddress}:${socket.remotePort}. Closing the socket.`
      );
      socket.end(
        send_format({
          type: "error",
          error: "unsupported version number received",
        })
      );
      socket.destroy();
      return;
    }
  }

  for (let data of json_data_array){
    if (data.type == "getpeers") {
      console.log(`Received getpeers message from ${socket.remoteAddress}:${socket.remotePort}`);
      send_peers(socket);
    }
    else if (data.type == "peers") {
      console.log(`Received peers message from ${socket.remoteAddress}:${socket.remotePort}`);
      connect_to_peers(data.peers);
    }
    else{
      socket.end(
        send_format({
          type: "error",
          error: "Unsupported message type received",
        })
      );
    }
  }
    

  return leftover;
}

export function send_peers(socket: any) {

  getIPs().then((ips) => {
    let peer_addresses : string[] = [];
    for(let i=0; i<ips.rows.length; i++){
      if (!peer_addresses.includes(ips.rows[i].ip)){
        peer_addresses.push(ips.rows[i]["ip"].concat(":18018"));
      }
      if(peer_addresses.length >= max_send_peers) break;
    }
    socket.write(
      send_format({
        type: "peers",
        peers: peer_addresses
      })
    );
  })
  
}

export function connect_to_peers(peers: string[]) {
  let count  = 0;
  for (let peer of peers) {
    let peer_address = peer.split(":");
    let peer_host = peer_address[0];
    run_one_client(peer_host);
  }
}

export function send_format(dict: any): string {
  return JSON.stringify(dict) + "\n";
}

export function run_server() {
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
    var initialized = false;
    var leftover = "";

    console.log(
      `A new client connection has been established from ${socket.remoteAddress}:${socket.remotePort}`
    );

    //addIP(socket.remoteAddress);

    socket.write(send_format(hello));
    socket.write(send_format(get_peers));

    socket.on("data", function (chunk: any) {
      //receiving logic
      leftover = data_handler(chunk, leftover, socket, initialized);
      initialized = true;
    });

    socket.on("end", function (chunk: any) {
      console.log(
        `Closing connection with the client ${socket.remoteAddress}:${socket.remotePort}"`
      );
    });

    socket.on("error", function (err: any) {
      console.log(`Error: ${err}`);
    });
  });
}
