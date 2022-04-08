"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run_server = exports.send_format = exports.connect_to_peers = exports.send_peers = exports.data_handler = exports.get_peers = exports.hello = void 0;
const Net = require("net");
const db_1 = require("./db");
const client_1 = require("./client");
const server_port = 18018;
const max_peers = 8;
const max_total_peers = max_peers * 16;
const host = "localhost";
const server = new Net.createServer();
const version_re = /^0.8.\d$/;
exports.hello = { type: "hello", version: "0.8.0", agent: "Old Peking" };
exports.get_peers = { type: "getpeers" };
function listen_handler() {
    console.log(`Server listening for connection requests on socket localhost:${server_port}`);
}
function data_handler(chunk, leftover, socket, initialized) {
    //processing the input
    let original = chunk.toString();
    //console.log(`Data received from ${socket.remoteAddress}:${socket.remotePort}: ${original}`);
    let tokenized = original.split("\n");
    tokenized[0] = leftover + tokenized[0];
    leftover = tokenized.pop();
    var json_data_array = [];
    console.log(tokenized.length);
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
        return leftover;
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
    }
    if (initialized) {
        for (let data of json_data_array) {
            if (data.type == "getpeers") {
                console.log(`Received getpeers message from ${socket.remoteAddress}:${socket.remotePort}`);
                send_peers(socket);
            }
            else if (data.type == "peers") {
                console.log(`Received peers message from ${socket.remoteAddress}:${socket.remotePort}`);
                //connect_to_peers(data.peers);
            }
        }
    }
    return leftover;
}
exports.data_handler = data_handler;
function send_peers(socket) {
    let peer_addresses = [];
    let count = 0;
    (0, db_1.getIPs)().then((ips) => {
        for (let i = 0; i < ips.rows.length; i++) {
            peer_addresses.push(ips.rows[i]["ip"].concat(":18018"));
            count++;
            if (count == max_peers)
                break;
        }
    });
    socket.write(send_format({
        type: "peers",
        peers: peer_addresses
    }));
}
exports.send_peers = send_peers;
function connect_to_peers(peers) {
    let count = 0;
    for (let peer of peers) {
        if (count >= max_peers)
            break; // connect to at most 8 peers in one round
        if ((0, client_1.num_clients)() > max_total_peers)
            break; // if num_clients > max_total_peers, then stop connecting
        // if peer not in database, add it
        (0, db_1.IP_in_db)(peer).then((ips) => __awaiter(this, void 0, void 0, function* () {
            if (ips.rows.length == 0) { // if peer not in database
                let peer_address = peer.split(":");
                let peer_host = peer_address[0];
                let status = (0, client_1.run_one_client)(peer_host);
                if (status) {
                    console.log(`Connected to ${peer_host}:${server_port}`);
                    let temp = yield (0, db_1.addIP)(peer_host); // TODO: uncomment
                }
            }
        }));
    }
}
exports.connect_to_peers = connect_to_peers;
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
        //addIP(socket.remoteAddress);
        socket.write(send_format(exports.hello));
        socket.write(send_format(exports.get_peers));
        socket.on("data", function (chunk) {
            //receiving logic
            leftover = data_handler(chunk, leftover, socket, initialized);
            initialized = true;
            console.log("hi" + leftover);
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