const Net = require('net');

const port = 18018;
const host = "localhost";
const server = new Net.createServer();
const version_re = /^0.8.\d$/;

const hello = {"type": "hello", "version": "0.8.0", "agent": "Old Peking"};

function listen_handler(){
  console.log(`Server listening for connection requests on socket localhost:${port}`);
}

function send_format(dict : any): string{
  return JSON.stringify(dict) + "\n"
}

server.listen(port, host, listen_handler);

server.on('error', (e : any) => { 
  if (e.code === 'EADDRINUSE') { 
    console.log('Address in use, retrying...'); 
    setTimeout(() => { 
      server.close(); 
      server.listen(port, host, listen_handler);
    }, 1000); 
  } 
}); 

server.on('connection', function(socket : any) {
    var initialized = false;
    var leftover = "";

    console.log(`A new connection has been established from ${socket.remoteAddress}:${socket.remotePort}`);
    socket.write(send_format(hello));

    socket.on('data', function(chunk : any) { //receiving logic

        //processing the input
        let original : string = chunk.toString();
        //console.log(`Data received from client: ${original}`);
        let tokenized = original.split("\n");
        tokenized[0] = leftover + tokenized[0];
        leftover = tokenized.pop();
        var json_data_array = [];
        for(let i=0; i<tokenized.length; i++){
          let token = tokenized[i]
          try {
            let parsed = JSON.parse(token);  //check if it can be parsed into json
            if(!parsed.hasOwnProperty('type')){  //check if message contains 'type' field
              console.log(`JSON message received from ${socket.remoteAddress}:${socket.remotePort} does not contain "type". Closing the socket.`);
              socket.end(send_format({"type": "error", "error": "Unsupported message format received"}));
              socket.destroy();
              return;
            }
            json_data_array.push(parsed);
          } catch(e){
            console.log(`Unsupported message format received from ${socket.remoteAddress}:${socket.remotePort}. Closing the socket.`);
            socket.end(send_format({"type": "error", "error": "Unsupported message format received"}));
            socket.destroy();
            return;
          }
        }

        if(json_data_array.length == 0) return;

        //initial handshake
        if(!initialized){
          let hello_data = json_data_array.shift();

          if(hello_data.type != "hello"){
            console.log(`Received other message types before the initial handshake from ${socket.remoteAddress}:${socket.remotePort}. Closing the socket.`);
            socket.end(send_format({"type": "error", "error": "Received other message types before the initial handshake"}));
            socket.destroy();
            return
          }
          if(!version_re.test(hello_data.version)){
            console.log(`Received unsupported version number from ${socket.remoteAddress}:${socket.remotePort}. Closing the socket.`);
            socket.end(send_format({"type": "error", "error": "unsupported version number received"}));
            socket.destroy();
            return;
          }
          initialized = true;
        }

        //handling json data
        console.log("good shit")

    });

    socket.on('end', function(chunk : any) {
        console.log(`Closing connection with the client ${socket.remoteAddress}:${socket.remotePort}"`);
    });
    
    socket.on('error', function(err : any) {
        console.log(`Error: ${err}`);
    });
});