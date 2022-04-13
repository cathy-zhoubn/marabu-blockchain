const Net = require("net");
import { socket_handler } from "./socket";
import config from './config.json';

const server_port = 18018;
const host = config.server.host;
const server = new Net.createServer();

function listen_handler() {
  console.log(
    `Server listening for connection requests on socket localhost:${server_port}`
  );
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
    socket_handler(socket)
  });
}

