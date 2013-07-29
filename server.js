// GLOBAL CONSTs
const PORT = 8080;
const MAX_HITS = 20;
const MAX_DAMAGE = 100;

// REQUIREs
var app = require('http').createServer(handler);
var io = require('socket.io').listen(app);
var fs = require('fs');
var crypto = require('crypto');


// Creature
function Creature() {
    var health = 5000;
    this.getHealth = function() { return health; };
    this.isDead = function() { return (health <= 0); };
    this.hit = function(damage) {
	console.log('creature - registering hit');
	health -= damage;
    };
    this.heal = function(damage) {
	console.log('creature - registering heal');
	health += damage;
    };
}
var creature = new Creature();

var shasum = crypto.createHash('sha1');
var hits = [];
var win_key = '';
var game_over = false;
var count_players = 0;


// Socket.IO Configuration
io.sockets.on('connection', function(socket) {
    count_players++;
    socket.on('status', function(data) {
	console.log('User asked for status');
	console.log(creature.getHealth());
	socket.emit('status',{
	    'id':socket.id,
	    'h':creature.getHealth(),
	    'c':count_players,
	    'hits':[]});
    });
    socket.on('hit', function(data) {
	if(game_over){return;}
	data['client'] = socket.id;
	var verified_hit = registerHit(data);
	if (verified_hit) {
	    socket.emit('status',{
		'h':creature.getHealth(),
		'c':count_players,
		'd':verified_hit.damage,
		'hits':[]});
	} else {
	    socket.disconnect();
	}
    });
    socket.on('disconnect', function() {
	count_players--;
    });
});

// Server setup
io.set('log level', 2);
app.listen(PORT);


// Update Loop
setInterval(function(){
    if (game_over) { return; }
    io.sockets.emit('status', {
	'h':creature.getHealth(),
	'c':count_players,
	'hits':hits
    });
    hits = [];
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

function registerHit(data) {
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
        return {damage:damage};
    } 
    return {damage:0};
}


// Web server handler
function handler(req, res) {
    res.writeHead(200, {'Content-Type':'text/plain'});
    res.end('You found our Node.js port!');
}
