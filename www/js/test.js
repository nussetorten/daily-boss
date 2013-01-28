var socket = new io.Socket(null, {port: 8080, remomberTransport: false});
socket.connect();

socket.emit('status');
socket.on('status', function(data) {
    console.log(data);
});