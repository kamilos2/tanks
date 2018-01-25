
//Partie Serveur

var Ball = require("./ballServer.js");
var GameServer = require("./gameServer.js");

var express = require('express');
var app = express();

var NoTanksOnline = 0;
var sockets = {};

var TANK_INIT_HP = 100;

//Set up server
app.use(express.static(__dirname + '/www'));

var server = app.listen(process.env.PORT || 8082, function () {
	var port = server.address().port;
	var host = server.address().address;
	host = (host == '::')? 'localhost':host;
	console.log("Server started");

	console.log('Server running on %s:%s',host,port);
});

//Creating the WebSockets needed to communicate asynchronously with the clients, using socket.io
var io = require('socket.io')(server);


function generateUID() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}

var game = new GameServer(); //MUST BE BEFORE IO


/* Connection events */
// IO enables the communication between the server and the client, based on events
//Quand est client s'est connecté
io.on('connection', function(socket) {
	console.log('User connected');

	//joinGame event : triggered from the client, when a new user goes to the website

	socket.on('joinGame', function(tank){
		//Tank = Name & type
		console.log(tank.name + ' joined the game');
		
		//Génerate random X_Y
		var initX = getRandomInt(40, 900);
		var initY = getRandomInt(40, 500);
		var tankId = generateUID();
		
		//Emit to current client
		socket.emit('addTank', { id: tankId, name: tank.name, type: tank.type, isLocal: true, x: initX, y: initY, hp: TANK_INIT_HP });
		//Emit to all client exept the current one
		socket.broadcast.emit('addTank', { id: tankId, name: tank.name, type: tank.type, isLocal: false, x: initX, y: initY, hp: TANK_INIT_HP} );

		//server adds a new Tank to the game,
		game.addTank({ id: tankId, name: tank.name, type: tank.type, hp: TANK_INIT_HP});
		NoTanksOnline ++;
		console.log("Adding: "+tankId);
		sockets[tankId]=socket;

	});

	socket.on('sync', function(data){
		
		
		//Receive data from client
		if(data.tank != undefined){ //Si tank est connu
			game.syncTank(data.tank);
		}
		
		//update ball positions
		game.syncBalls();
		//Broadcast data to clients
		socket.emit('sync', game.getData());
		socket.broadcast.emit('sync', game.getData());

		//I do the cleanup after sending data, so the clients know
		//when the tank dies and when the balls explode
		game.cleanDeadTanks();
		game.cleanDeadBalls();
	});

	socket.on('shoot', function(ball){
		var ball = new Ball(ball.ownerId, ball.alpha, ball.x, ball.y,game );
		game.addBall(ball);
	});

	socket.on('leaveGame', function(tankId){
		console.log(tankId + ' has left the game');
		game.removeTank(tankId);
		socket.broadcast.emit('removeTank', tankId);
		NoTanksOnline--;
		console.log("Removing: "+tankId);

		sockets[tankId].data="toDelete";
		delete sockets[tankId];
	});

});



function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}



function gameloop(){
	
	//game.generateStar();
	var XRandom = getRandomInt(40, 900);
	var YRandom = getRandomInt(40, 500);

	for(var key in sockets) {
		sockets[key].emit("addStar", { x: XRandom, y: YRandom});
		console.log("Sockets");
	}
	console.log("Emited");
  // do something with "key" and "value" variables
 
}
		
setInterval(gameloop, 5000);


function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}
