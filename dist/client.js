"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.run_client = void 0;
const client_host_port = 18018;
const Net = require("net");
const db_1 = require("./db");
const server_1 = require("./server");
function run_client() {
    (0, db_1.getIPs)().then((ips) => {
        for (let i = 0; i < ips.rows.length; i++) {
            run_one_client(ips.rows[i]["ip"]);
        }
    });
}
exports.run_client = run_client;
function run_one_client(host) {
    const client = new Net.Socket();
    var initialized = false;
    var leftover = "";
    client.connect({ port: client_host_port, host: host }, function () {
        console.log(`A new server connection has been established with ${client.remoteAddress}:${client.remotePort}`);
        client.write((0, server_1.send_format)(server_1.hello));
    });
    client.on('data', function (chunk) {
        (0, server_1.data_handler)(chunk, leftover, client, initialized);
        initialized = true;
    });
    client.on('end', function () {
        console.log(`Closing connection with the client ${client.remoteAddress}:${client.remotePort}"`);
    });
    client.on('error', function (err) {
        console.log(`Error: ${err}`);
    });
}
//# sourceMappingURL=client.js.map