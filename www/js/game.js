// init
enchant();

// variables
var socket = io.connect('http://localhost:8080');//io.connect('http://ec2-50-17-25-51.compute-1.amazonaws.com:8080');
var game = new Game(1300,700);
var damage = 0;

socket.emit('status');

// preload
game.preload('img/body.png','img/head1.png','img/head2.png','img/hand1.png','img/hand2.png','img/leg1.png','img/leg2.png');
game.preload('aud/tank-shot.wav');

game.onload = function() {
    var scene = new Scene();
    var s_body = new Sprite(677,633);
    var s_head = new Sprite(310,324);
    var s_larm = new Sprite(176,168);
    var s_rarm = new Sprite(220,178);
    var s_lleg = new Sprite(247,341);
    var s_rleg = new Sprite(174,339);
    var l_heal = new Label("Health: ?????");
    var l_onli = new Label("Online: ?????");
    this.l_dama = new Label("Damage: 0");

    socket.on('status', function(data) {
	console.log(data);
	l_heal.text = "Health: " + data['h'];
	l_onli.text = "Online: " + data['c'];
	console.log(damage);
	if (data['d']) {
	    damage += data['d'];
	    game.l_dama.text = "Damage: " + damage;
	    $('#damage').html(damage);
	}

	for (var i = 0; i < data.hits.length; i++) {
    	    $('#bam'+i).css('left',data.hits[i]['l'][0]-75+'px');
	    $('#bam'+i).css('top',data.hits[i]['l'][1]-75+'px');
	    $('#bam'+i).show();
	    $('#bam'+i).fadeOut(1200);
	    setTimeout(function() {
		game.assets['aud/tank-shot.wav'].play();
	    }, i*70);
	}
    });
    
    // My Character Skeleton
    var sk = {
	h:[600,10],
	b:[400,20],
	la:[350,200],
	ra:[950,200],
	ll:[400,400],
	rl:[900,400]
    };

    s_body.image = game.assets['img/body.png'];
    s_head.image = game.assets['img/head1.png'];
    s_larm.image = game.assets['img/hand1.png'];
    s_rarm.image = game.assets['img/hand2.png'];
    s_lleg.image = game.assets['img/leg1.png'];
    s_rleg.image = game.assets['img/leg2.png'];

    // set to initial position
    s_head.x = sk['h'][0];
    s_head.y = sk['h'][1];
    s_body.x = sk['b'][0];
    s_body.y = sk['b'][1];
    s_larm.x = sk['la'][0];
    s_larm.y = sk['la'][1];
    s_rarm.x = sk['ra'][0];
    s_rarm.y = sk['ra'][1];
    s_lleg.x = sk['ll'][0];
    s_lleg.y = sk['ll'][1];
    s_rleg.x = sk['rl'][0];
    s_rleg.y = sk['rl'][1];
    l_heal.x = 10;
    l_heal.y = 30;
    l_heal.font = '25px monospace';
    l_heal.color = '#d33';
    l_onli.x = 10;
    l_onli.y = 60;
    l_onli.font = '25px monospace';
    this.l_dama.x = 10;
    this.l_dama.y = 90;
    this.l_dama.font = '25px monospace';
    // idle animation
    s_head.tl.moveTo(sk['h'][0],sk['h'][1], 20)
        .moveTo(sk['h'][0], sk['h'][1]-10, 30)
        .loop();
    s_body.tl.moveTo(sk['b'][0],sk['b'][1], 20)
        .moveTo(sk['b'][0], sk['b'][1]+5, 30)
        .loop();
    s_larm.tl.moveTo(sk['la'][0],sk['la'][1], 20)
        .moveTo(sk['la'][0]-7, sk['la'][1]+7, 30)
        .loop();
    s_rarm.tl.moveTo(sk['ra'][0],sk['ra'][1], 20)
        .moveTo(sk['ra'][0]+7, sk['ra'][1]+7, 30)
        .loop();
    s_lleg.tl.moveTo(sk['ll'][0],sk['ll'][1], 20)
        .moveTo(sk['ll'][0], sk['ll'][1]-5, 30)
        .loop();
    s_rleg.tl.moveTo(sk['rl'][0],sk['rl'][1], 20)
        .moveTo(sk['rl'][0], sk['rl'][1]-5, 30)
        .loop();
   
    s_body.addEventListener('touchstart', function() {
	dealDamage('body');
	console.log('hit body!');
	s_body.moveBy(0,-5,1);
    });
    s_head.addEventListener('touchstart', function() {
	dealDamage('head');
	console.log('hit head!');
	s_head.moveBy(0,-5);
    });
    s_larm.addEventListener('touchstart', function() {
	dealDamage('larm');
	console.log('hit larm!');
	s_larm.moveBy(-5,0);
    });
    s_rarm.addEventListener('touchstart', function() {
	dealDamage('rarm');
	console.log('hit rarm!');
	s_rarm.moveBy(5,0);
    });
    s_lleg.addEventListener('touchstart', function() {
	dealDamage('lleg');
	console.log('hit lleg!');
	s_lleg.moveBy(0,5);
    });
    s_rleg.addEventListener('touchstart', function() {
	dealDamage('rleg');
	console.log('hit rleg!');
	s_rleg.moveBy(0,5);
    });

    scene.addChild(s_lleg);
    scene.addChild(s_rleg);
    scene.addChild(s_body);
    scene.addChild(s_head);
    scene.addChild(s_larm);
    scene.addChild(s_rarm);

    scene.addChild(l_heal);
    scene.addChild(l_onli);
    scene.addChild(this.l_dama);

    game.pushScene(scene);
};
game.fps = 30;
game.start();
// functions

function dealDamage(part) {
    socket.emit('hit',{part:part,l:[mouseX,mouseY]});
}
