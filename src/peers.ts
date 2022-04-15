import { send_format, socket_error } from "./socket";
import { get_ips } from "./db";
import { run_one_client } from "./client";
const version_re = /^0.8.\d$/;

export function receive_hello(hello_data:any, socket:any) {
    console.log(
        `Received hello message from ${socket.remoteAddress}:${socket.remotePort}`
    );
    if (hello_data.type != "hello") {
        socket_error(hello_data, socket, "Received other message types before the initial handshake", true)
        return;
    }

    try {
        if (!version_re.test(hello_data.version)) {
            socket_error(hello_data,socket, "unsupported version number received", true)
            return;
        }
    } catch (e) {
        socket_error(hello_data, socket, "unsupported format of hello message", true)
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
    if (peers == null) return;
    for (let peer of peers) {
        let peer_address = peer.split(":");
        let peer_host = peer_address[0];
        run_one_client(peer_host);
    }
}