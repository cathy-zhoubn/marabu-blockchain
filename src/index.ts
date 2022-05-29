import {run_server} from './server';
import {run_client} from './client';
import { spawn, Thread, Worker } from "threads"
import { expose } from "threads/worker"
  

expose(function server (){
    run_server();
    run_client();
})

async function main() {
    const mine = await spawn(new Worker("./workers/mine"));
    const server = await spawn(new Worker("./workers/server"))
    await mine();
    await server();
  
    await Thread.terminate(mine);
    await Thread.terminate(server);
  }
  
  main().catch(console.error)