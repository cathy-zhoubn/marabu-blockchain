
// import { spawn, Thread, Worker } from "threads"

// async function main() {
//     const mine = await spawn(new Worker("./mine_block.ts"));
//     const server = await spawn(new Worker("./index.ts"))
    
//     await mine();
//     await server();
  
//     await Thread.terminate(mine);
//     await Thread.terminate(server);
// }
  
// main().catch(console.error)

import { parentPort, workerData } from 'worker_threads';
 
function factorial(n: number): number {
  if(n === 1 || n === 0){
    return 1;
  }
  return factorial(n - 1) * n;
}
 
parentPort.postMessage(
  factorial(workerData.value)
);