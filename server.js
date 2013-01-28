// variables
var app = require('http').createServer(handler);
var io = require('socket.io').listen(app);
var fs = require('fs');
var crypto = require('crypto');
var shasum = crypto.createHash('sha1');
var health = 5000;
var hits = [];
var win_key = '';
var game_over = false;
var count_players = 0;

// const
var MAX_HITS = 20;
var MAX_DAMAGE = 100;

// config
app.listen(8080);
io.set('log level', 2);

// io
io.sockets.on('connection', function(socket) {
    count_players++;
    socket.on('status', function(data) {
	console.log('User asked for status');
	socket.emit('status',{'h':health,'c':count_players});
    });
    socket.on('hit', function(data) {
	if(game_over){return;}
	registerHit(data);
	socket.emit('status',{'h':health,'c':count_players});
    });
    socket.on('disconnect', function() {
	count_players--;
    });
});

// periodic
setInterval(function(){
    if(game_over){return;}
    io.sockets.emit('status',{'h':health,'c':count_players});
    if(hits.length > 0) {
	sendHits();
    }
}, 500);


// functions
function endGame() {
    if (game_over) {return;}
    game_over = true;
    console.log('winner found!');
//    shasum.update('abcde');
//    win_key = shasum.digest('hex');
//    console.log('win key: '+win_key);
    io.sockets.emit('win',{h:win_key});
}

function sendHits() {
    console.log('sending hits');
    io.sockets.emit('hits',hits);
    hits = [];
}

function registerHit(data) {
    console.log('registering hit');
    // TODO validate data contents damage, location, etc...
    if(hits.length < MAX_HITS) {
	if(data['d'] > MAX_DAMAGE) {
	    data['d'] = 1;
	}
	health -= data['d'];
	if(health <= 0) {
	    endGame();
	}

	hits.push(data);
    } 
}

function handler(req, res) {
    res.writeHead(200, {'Content-Type':'text/html'});
    res.end('You found our Node.js port!');
}