import {run_server} from './server';
import {run_client} from './client';
import { expose } from "threads/worker"
import { parentPort, Worker } from 'worker_threads';
  

// expose(async function server (){
//     console.log("Starting server...");
//     run_server();
//     console.log("Server started.");
//     console.log("Client started.");
// })

run_server();
parentPort.postMessage({"type": "mes", "mes": "server started"});
run_client();
parentPort.postMessage({"type": "mes", "mes": "client started"});