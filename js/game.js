$(document).ready(function() {
    // --- SOCKET IO HANDLERS ---
    var socket = io.connect('http://localhost:8080');
    socket.on('status', function(data) {
	$('#game').text(data['p']);
    });
});