const Net = require('net');
const port = 8080;

const server = new Net.createServer();
server.listen(port, function() {
    console.log('Server listening for connection requests on socket localhost:${port}.');
});

server.on('connection', function(socket : any) {
    console.log('A new connection has been established.');

    socket.write('Hello, client.');

    socket.on('data', function(chunk  : any) {
        console.log('Data received from client: ${chunk.toString().}');
    });


    socket.on('end', function() {
        console.log('Closing connection with the client');
    });

    socket.on('error', function(err  : any) {
        console.log(`Error: ${err}`);
    });
});