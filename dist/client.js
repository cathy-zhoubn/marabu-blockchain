const Net = require('net');
const port = 8080;
const host = 'localhost';
const client = new Net.Socket();
client.connect(({ port: port, host: host }), function () {
    console.log('TCP connection established with the server.');
    client.write('Hello, server.');
});
// The client can also receive data from the server by reading from its socket.
client.on('data', function (chunk) {
    console.log("Data received from the server: ${chunk.toString()}.");
    // Request an end to the connection after the data has been received.
    client.end();
});
client.on('end', function () {
    console.log('Requested an end to the TCP connection');
});
//# sourceMappingURL=client.js.map