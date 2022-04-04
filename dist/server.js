const Net = require('net');
const port = 8080;
const host = "localhost";
const server = new Net.createServer();
function listen_handler() {
    console.log(`Server listening for connection requests on socket localhost:${port}`);
}
server.listen(port, host, listen_handler);
server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
        console.log('Address in use, retrying...');
        setTimeout(() => {
            server.close();
            server.listen(port, host, listen_handler);
        }, 1000);
    }
});
server.on('connection', function (socket) {
    console.log(`A new connection has been established from ${socket.remoteAddress}:${socket.remotePort}`);
    socket.write('Hello, client.');
    socket.on('data', function (chunk) {
        console.log(`Data received from client: ${chunk.toString()}`);
    });
    socket.on('end', function () {
        console.log('Closing connection with the client');
    });
    // Don't forget to catch error, for your own sake.
    socket.on('error', function (err) {
        console.log(`Error: ${err}`);
    });
});
//# sourceMappingURL=server.js.map