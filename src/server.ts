const Net = require("net");
import {addIP} from './db';

const server_port = 18018;
const host = "localhost";
const server = new Net.createServer();
const version_re = /^0.8.\d$/;

export const hello = { type: "hello", version: "0.8.0", agent: "Old Peking" };

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
) {
  //processing the input
  let original: string = chunk.toString();
  console.log(`Data received from ${socket.remoteAddress}:${socket.remotePort}: ${original}`);
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

  if (json_data_array.length == 0) return;

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
    initialized = true;
  }

  //TODO: handle other commands. loop through json_data_array and handle the command. the only other command should be the "getpeers" message at this stage
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

    addIP(socket.remoteAddress);

    socket.write(send_format(hello));

    socket.on("data", function (chunk: any) {
      //receiving logic
      data_handler(chunk, leftover, socket, initialized);
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
