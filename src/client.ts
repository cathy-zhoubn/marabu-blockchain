const client_host_port = 18018;
const Net = require("net");
import {getIPs} from './db';

import { send_format, data_handler, hello, get_peers} from "./server";

export function run_client(){
	getIPs().then((ips) => {
		for(let i=0; i<ips.rows.length; i++){
			run_one_client(ips.rows[i]["ip"]);
		}
	})
}

export function run_one_client(host: string, port: number = client_host_port){
	const client = new Net.Socket();
	var initialized = false;
	var leftover = "";

	client.connect({ port: client_host_port, host: host }, function() {
		console.log(`A new server connection has been established with ${client.remoteAddress}:${client.remotePort}`);
		client.write(send_format(hello));
		client.write(send_format(get_peers));
	});
	
	client.on('data', function(chunk : any) {
		leftover = data_handler(chunk, leftover, client, initialized);
		//console.log(leftover)
		initialized = true;
	});

	client.on('end', function() {
		console.log(`Closing connection with the client ${client.remoteAddress}:${client.remotePort}"`);
	});

	client.on('error', function(err : any) {
		console.log(`Error: ${err}`);
	});
}
