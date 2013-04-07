// --- DECLARE VARIABLES ---
var PORT = 8080;

// --- DECLARE EXCEPTIONS ---
function InvalidUrlException(message) {
    this.message = message;
    this.name = "InvalidUrlException";
};

// --- HANDLE NON-SOCKET HTTP REQUESTS ---

var fs = require('fs');
var http = require('http');
var app = http.createServer(function(request, response) {
    switch (request.url) {
    case '/':
	response.writeHead(200, {'Content-Type':'text/html'});
	var fileStream = fs.createReadStream('./index.html');
	break;
    default:
	try {
	    stats = fs.lstatSync('.'+request.url);
	    if(!stats.isFile()) {throw new InvalidUrlException("URL IS DIR");}
	    // Handle Content Type
	    switch (request.url.split('.').pop()) {
	    case 'js':
		response.writeHead(200, {'Content-Type':'application/javascript'});
		break;
	    case 'css':
		response.writeHead(200, {'Content-Type':'text/css'});
		break;
	    case 'jpg':
		response.writeHead(200, {'Content-Type':'image/jpg'});
		break;
	    case 'png':
		response.writeHead(200, {'Content-Type':'image/png'});
		break;
	    default:
		response.writeHead(200, {'Content-Type':'text/html'});
	    }
	    var fileStream = fs.createReadStream('.'+request.url);
	} catch (e) {
	    // Handle Invalid URL
	    response.writeHead(404, {'Content-Type':'text/html'});
	    var fileStream = fs.createReadStream('./404.html');
	}
    }
    fileStream.end = function(){response.end();};
    fileStream.pipe(response);
}).listen(PORT);

function Game() {
    this.Creature = function() {
	// Constructor for Creature
	var health = 5000;
	this.getHealth = function() { return health; };
	this.isDead = function() { return (health <= 0); };
	this.hit = function(damage) {
	    health -= damage;
	};
	this.heal = function(damage) {
	    health += damage;
	};
	this.registerHit = function(data) {
	    console.log('registering hit');
	    // TODO validate data contents damage, location, etc...
	    var damage = undefined;
	    // associate a part with a damage value
	    switch (data['part']) {
	    case 'body' :
	    case 'head' :
	    case 'larm' :
	    case 'rarm' :
	    case 'lleg' :
	    case 'rleg' :
		damage = 1;
	    }
	    // an undefined body part means trouble
	    if (damage == undefined) {
		return null;
	    }
	    // only add to the hits if there are not too many hits yet
	    if(hits.length < MAX_HITS) {
		creature.hit(damage);
		if (creature.isDead()) {
		    endGame();
		}
		hits.push(data);
	    } 
	    return {damage:damage};
	};
    };
    this.end_game = function() {
	//    if (game_over) {return;}
	//    game_over = true;
	console.log('Start Game');
	//    io.sockets.emit('win',{h:win_key});
    };
    this.start_game = function() {
	console.log('End Game');
    };
    var PLAYER_COUNT = 0;
    this.add_player = function() { PLAYER_COUNT++; };
    this.remove_player = function() { PLAYER_COUNT--; };
    this.get_player_count = function() { return PLAYER_COUNT; };
};
var GAME = new Game();

// --- HANDLE SOCKET HTTP REQUESTS ---
var io = require('socket.io').listen(app);
io.sockets.on('connection', function(socket) {
    GAME.add_player();
    socket.emit('status', {p:GAME.get_player_count()});
    socket.on('engage', function(data) {
	console.log('engage');
    });
    socket.on('disengage', function(data) {
	console.log('engage');
    });
    socket.on('attack', function(data) {
	console.log('engage');
    });
    socket.on('disconnect', function() {
	GAME.remove_player();
    });
    
});

setInterval(function() {
    io.sockets.emit('status', {p:GAME.get_player_count()});
}, 1000);