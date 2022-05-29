

import { spawn, Thread, Worker } from "threads"

async function main() {
    const mine = await spawn(new Worker("./mine_block.ts"));
    const server = await spawn(new Worker("./index.ts"))
  
    await Thread.terminate(mine);

    await Thread.terminate(server);
}
  
main().catch(console.error)