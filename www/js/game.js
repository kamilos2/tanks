//the client script listens to keyboard and mouse events to update the status of the tanks and projectiles. 

var DEBUG = true;
var INTERVAL = 50; //main loop executed every 50 ms

var ARENA_MARGIN = 30;
var tankID;
function Game(arenaId, w, h, socket){
	this.otherTanks = []; //Tanks (other than the local tank)
	this.balls = [];
	this.width = w;
	this.height = h;
	this.$arena = $(arenaId);
	this.$arena.css('width', w);
	this.$arena.css('height', h);
	this.socket = socket;
	this.localTank;
}


Game.prototype = {
	
	addStar: function(x,y){
		if(this.localTank != undefined){//Peut s'être connecté mais pas encore choisi de tank, dans ce cas apparait pas (en fait si)
			this.localTank.addStar(x,y);
		}
	},
	
	start: function(){ // equiv to this.start = function () {
		var g = this;
		setInterval(function(){
			g.mainLoop();
		}, INTERVAL);
	},
	
	//Main loop of the client
	mainLoop: function(){
		
		if(this.localTank != undefined){ //Tant que tank pas choisi par le joueur, on fait rien
			this.sync(); //send data to server about local tank
			this.localTank.move(); //move local tank
		}
	},
	
	addTank: function(id, name, type, isLocal, x, y, hp){
		var t = new Tank(id, name, type, this.$arena, this, isLocal, x, y, hp); //Création du tank
		t.materialize();

		if(isLocal){//Si c'est notre tank	
			this.localTank = t;
			tankID=id;
		}else{//Si c'est un tank d'un autre joeurs
			this.otherTanks.push(t);
		}
	},
	
	sync: function(){
		//Send local data to server
		var gameData = {};

		//Send tank data
		var t = {
			id: this.localTank.id,
			x: this.localTank.x,
			y: this.localTank.y,
			baseAngle: this.localTank.baseAngle,
			cannonAngle: this.localTank.cannonAngle
		};
		gameData.tank = t;
		//Client game does not send any info about balls,
		//the server controls that part
		this.socket.emit('sync', gameData);
	},

	

	removeTank: function(tankId){
		//Remove tank object
		this.otherTanks = this.otherTanks.filter( function(t){return t.id != tankId} );
		//remove tank from dom
		$('#' + tankId).remove();
		$('#info-' + tankId).remove();
	},

	killTank: function(tank){
		tank.dead = true;
		this.removeTank(tank.id);
		//place explosion
		this.$arena.append('<img id="expl' + tank.id + '" class="explosion" src="./img/explosion.gif">');
		$('#expl' + tank.id).css('left', (tank.x - 50)  + 'px');
		$('#expl' + tank.id).css('top', (tank.y - 100)  + 'px');

		setTimeout(function(){
			$('#expl' + tank.id).remove(); //Remove animation
		}, 1000);

	},

	//Receive data from server (ball & tanks)
	receiveData: function(serverData){
		var game = this;

		//Sync des tanks
		serverData.tanks.forEach( function(serverTank){
			//Update local tank stats
			if(game.localTank !== undefined && serverTank.id == game.localTank.id){
				game.localTank.hp = serverTank.hp; //MAJ de la vie de mon tank
				if(game.localTank.hp <= 0){
					game.killTank(game.localTank);
				}
			}

			//Update foreign tanks
			var found = false;
			game.otherTanks.forEach( function(clientTank){
				//update foreign tanks
				if(clientTank.id === serverTank.id){
					clientTank.x = serverTank.x;
					clientTank.y = serverTank.y;
					clientTank.baseAngle = serverTank.baseAngle;
					clientTank.cannonAngle = serverTank.cannonAngle;
					clientTank.hp = serverTank.hp;
					if(clientTank.hp <= 0){
						game.killTank(clientTank);
					}
					clientTank.refresh();
					found = true;
				}
			});
			//Si tank pas trouvé, on c'est que c'est un nouveau et on le rajoute
			if(!found &&
				(game.localTank == undefined || serverTank.id != game.localTank.id)){
				
				game.addTank(serverTank.id, serverTank.name, serverTank.type, false, serverTank.x, serverTank.y, serverTank.hp);
			}
		});

		//Render balls
		game.$arena.find('.cannon-ball').remove();//On enlève toutes les balles
		
		serverData.balls.forEach( function(serverBall){
			//Crée les nouvelles balles
			var b = new Ball(serverBall.id, serverBall.ownerId, game.$arena, serverBall.x, serverBall.y);
			b.exploding = serverBall.exploding;
			if(b.exploding){
				b.explode();
			}
		});
	}
}

//Quand quitte la page
$(window).on('beforeunload', function(){
	socket.emit('leaveGame', tankID);
});

function debug(msg){
	if(DEBUG){
		console.log(msg);
	}
}



function getGreenToRed(percent){
	r = percent<50 ? 255 : Math.floor(255-(percent*2-100)*255/100);
	g = percent>50 ? 255 : Math.floor((percent*2)*255/100);
	return 'rgb('+r+','+g+',0)';
}
