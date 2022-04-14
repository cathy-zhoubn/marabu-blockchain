import { send_format } from "./socket";
import { get_ips } from "./db";
import { run_one_client } from "./client";
const version_re = /^0.8.\d$/;

export function receive_hello(hello_data:any, socket:any) {
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

    try {
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
    } catch (e) {
        console.log(
            `Received unsupported format of hello message from ${socket.remoteAddress}:${socket.remotePort}. Closing the socket.`
        );
        socket.end(
            send_format({
                type: "error",
                error: "unsupported format of hello message",
            })
        );
        socket.destroy();
    }
}

export function receive_getpeers(data:any, socket:any){
    console.log(
        `Received getpeers message from ${socket.remoteAddress}:${socket.remotePort}`
    );
    send_peers(socket);
}

export function receive_peers(data:any, socket:any){
    console.log(
        `Received peers message from ${socket.remoteAddress}:${socket.remotePort}`
    );
    connect_to_peers(data.peers);
}


export function send_peers(socket: any) {
    get_ips().then((ips) => {
        let peer_addresses: string[] = [];
        for (let i = 0; i < ips.rows.length; i++) {
            peer_addresses.push(ips.rows[i]["ip"].concat(":18018"));
        }
        socket.write(
            send_format({
                type: "peers",
                peers: peer_addresses,
            })
        );
    });
}

export function connect_to_peers(peers: string[]) {
    for (let peer of peers) {
        let peer_address = peer.split(":");
        let peer_host = peer_address[0];
        run_one_client(peer_host);
    }
}