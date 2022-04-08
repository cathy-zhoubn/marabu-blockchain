import {run_server} from './server';
import {run_client} from './client';

import {IP_in_db, addIP, getIPs} from './db';
import {run_one_client} from './client';

// let peer = "100";
// addIP("100").then((ips) => {
//     IP_in_db(peer).then((ips) => {
//         if (ips.rows.length == 0) { // if peer not in database
//           let peer_address = peer.split(":");
//           let peer_host = peer_address[0];
//           let status = run_one_client(peer_host);
//           if (status){
//             console.log(`Connected to ${peer_host}:${18018}`);
//             addIP(peer_host);
//           } 
//         }
//         else {
//             console.log('Failed to connect to ');
//         }
//       });
// });


  

run_server();
run_client();

//TODO: thorough testing please! There is a simple client that can connect to our server in the test_client folder for testing purposes only. 