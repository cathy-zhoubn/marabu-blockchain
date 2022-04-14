"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run_server = void 0;
const Net = require("net");
const socket_1 = require("./socket");
const config_json_1 = __importDefault(require("./config.json"));
const server_port = 18018;
const host = config_json_1.default.server.host;
const server = new Net.createServer();
function listen_handler() {
    console.log(`Server listening for connection requests on socket localhost:${server_port}`);
}
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
        (0, socket_1.socket_handler)(socket);
    });
}
exports.run_server = run_server;
//# sourceMappingURL=server.js.map