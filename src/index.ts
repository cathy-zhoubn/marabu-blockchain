import {run_server} from './server';
import {run_client} from './client';
import { expose } from "threads/worker"
import { mine } from './mine_block';
  

// expose(function server (){
//     run_server();
//     run_client();
// })

run_server();
run_client();
mine();