const client_host_port = 18018;
const Net = require("net");
import {addIP, getIPs} from './db';
import {socket_handler} from './socket';


let max_client_count = 2000;
let client_count = 0;
let connected_peers = new Set<string>();

export function num_clients() {return client_count;}

export function run_client(){
	client_count = 0;
	getIPs().then((ips) => {
		for(let i=0; i<Math.min(ips.rows.length, 8); i++){
			run_one_client(ips.rows[i]["ip"]);
		}
	})

}

export function run_one_client(host: string){
	if(connected_peers.size >= max_client_count || connected_peers.has(host)) return;

	connected_peers.add(host);
	const client = new Net.Socket();
	var initialized = false;
	var leftover = "";

	client.connect({ port: client_host_port, host: host }, function() {
		//console.log(`A new server connection has been established with ${client.remoteAddress}:${client.remotePort}`);
		addIP(host);
		socket_handler(client);
	});

	client.on('end', function() {
		connected_peers.delete(host);
	});

	client.on('error', function(err : any) {
		connected_peers.delete(host);
		return;
	});
}
