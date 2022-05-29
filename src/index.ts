import {run_server} from './server';
import {run_client} from './client';
import { expose } from "threads/worker"
  

expose(function server (){
    console.log("Starting server...");
    run_server();
    console.log("Server started.");
    run_client();
    console.log("Client started.");
})


// run_server();
// console.log('server started');
// run_client();
// console.log('client started');
// mine();
// console.log('miner started');