"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.run_server = exports.send_format = exports.data_handler = exports.hello = void 0;
const Net = require("net");
const db_1 = require("./db");
const server_port = 18018;
const host = "localhost";
const server = new Net.createServer();
const version_re = /^0.8.\d$/;
exports.hello = { type: "hello", version: "0.8.0", agent: "Old Peking" };
function listen_handler() {
    console.log(`Server listening for connection requests on socket localhost:${server_port}`);
}
function data_handler(chunk, leftover, socket, initialized) {
    //processing the input
    let original = chunk.toString();
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
                console.log(`JSON message received from ${socket.remoteAddress}:${socket.remotePort} does not contain "type". Closing the socket.`);
                socket.end(send_format({
                    type: "error",
                    error: "Unsupported message format received",
                }));
                socket.destroy();
                return;
            }
            json_data_array.push(parsed);
        }
        catch (e) {
            console.log(`Unsupported message format received from ${socket.remoteAddress}:${socket.remotePort}. Closing the socket.`);
            socket.end(send_format({
                type: "error",
                error: "Unsupported message format received",
            }));
            socket.destroy();
            return;
        }
    }
    if (json_data_array.length == 0)
        return;
    //initial handshake
    if (!initialized) {
        let hello_data = json_data_array.shift();
        if (hello_data.type != "hello") {
            console.log(`Received other message types before the initial handshake from ${socket.remoteAddress}:${socket.remotePort}. Closing the socket.`);
            socket.end(send_format({
                type: "error",
                error: "Received other message types before the initial handshake",
            }));
            socket.destroy();
            return;
        }
        if (!version_re.test(hello_data.version)) {
            console.log(`Received unsupported version number from ${socket.remoteAddress}:${socket.remotePort}. Closing the socket.`);
            socket.end(send_format({
                type: "error",
                error: "unsupported version number received",
            }));
            socket.destroy();
            return;
        }
        initialized = true;
    }
    //TODO: handle other commands. loop through json_data_array and handle the command. the only other command should be the "getpeers" message at this stage
}
exports.data_handler = data_handler;
function send_format(dict) {
    return JSON.stringify(dict) + "\n";
}
exports.send_format = send_format;
function run_server() {
    server.listen(server_port, host, listen_handler);
    server.on("error", (e) => {
        if (e.code === "EADDRINUSE") {
            console.log("Address in use, retrying...");
            setTimeout(() => {
                server.close();
                server.listen(server_port, host, listen_handler);
            }, 1000);
        }
    });
    server.on("connection", function (socket) {
        var initialized = false;
        var leftover = "";
        console.log(`A new client connection has been established from ${socket.remoteAddress}:${socket.remotePort}`);
        (0, db_1.addIP)(socket.remoteAddress);
        socket.write(send_format(exports.hello));
        socket.on("data", function (chunk) {
            //receiving logic
            data_handler(chunk, leftover, socket, initialized);
            initialized = true;
        });
        socket.on("end", function (chunk) {
            console.log(`Closing connection with the client ${socket.remoteAddress}:${socket.remotePort}"`);
        });
        socket.on("error", function (err) {
            console.log(`Error: ${err}`);
        });
    });
}
exports.run_server = run_server;
//# sourceMappingURL=server.js.map