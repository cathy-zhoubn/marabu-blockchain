"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.run_one_client = exports.run_client = exports.num_clients = void 0;
const client_host_port = 18018;
const Net = require("net");
const db_1 = require("./db");
const server_1 = require("./server");
let max_client_count = 20;
let client_count = 0;
let connected_peers = new Set();
function num_clients() { return client_count; }
exports.num_clients = num_clients;
function run_client() {
    client_count = 0;
    (0, db_1.getIPs)().then((ips) => {
        for (let i = 0; i < Math.min(ips.rows.length, 8); i++) {
            run_one_client(ips.rows[i]["ip"]);
        }
    });
}
exports.run_client = run_client;
function run_one_client(host) {
    if (connected_peers.size >= max_client_count || connected_peers.has(host))
        return;
    connected_peers.add(host);
    const client = new Net.Socket();
    var initialized = false;
    var leftover = "";
    client.connect({ port: client_host_port, host: host }, function () {
        console.log(`A new server connection has been established with ${client.remoteAddress}:${client.remotePort}`);
        (0, db_1.addIP)(host);
        client.write((0, server_1.send_format)(server_1.hello));
        client.write((0, server_1.send_format)(server_1.get_peers));
    });
    client.on('data', function (chunk) {
        leftover = (0, server_1.data_handler)(chunk, leftover, client, initialized);
        //console.log(leftover)
        initialized = true;
    });
    client.on('end', function () {
        console.log(`Closing connection with the client ${client.remoteAddress}:${client.remotePort}"`);
        connected_peers.delete(host);
    });
    client.on('error', function (err) {
        console.log(`Error: ${err}`);
        connected_peers.delete(host);
        return;
    });
}
exports.run_one_client = run_one_client;
//# sourceMappingURL=client.js.map