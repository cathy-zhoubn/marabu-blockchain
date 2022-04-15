const client_host_port = 18018;
const Net = require("net");
import {add_ip, get_ips} from './db';
import {socket_handler} from './socket';


let max_client_count = 2000;
let client_count = 0;
let connected_peers = new Set<string>();

export function num_clients() {return client_count;}

export function run_client(){
	client_count = 0;
	get_ips().then((ips) => {
		for(let i=0; i<Math.min(ips.rows.length, 8); i++){
			run_one_client(ips.rows[i]["ip"]);
		}
	})

}

export function run_one_client(host: string){
	if(connected_peers.size >= max_client_count || connected_peers.has(host)) return;

	connected_peers.add(host);
	const client = new Net.Socket();

	client.connect({ port: client_host_port, host: host }, function() {
		//console.log(`A new server connection has been established with ${client.remoteAddress}:${client.remotePort}`);
		add_ip(host);
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
