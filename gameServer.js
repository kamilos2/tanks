
var WIDTH = 1100;
var HEIGHT = 580;

function GameServer(){
	this.tanks = [];
	this.balls = [];
	this.lastBallId = 0;
}

GameServer.prototype = {
	
	generateStar: function(){
		
		var XRandom = getRandomInt(40, 900);
		var YRandom = getRandomInt(40, 500);
	},
	
	syncTank: function(newTankData){
		//Update les données du tank dans notre liste
		//Trouve le tank et maj sa position + son canon
		this.tanks.forEach( function(tank){
			
			if(tank.id == newTankData.id){//Trouve le tank a sync
				tank.x = newTankData.x;
				tank.y = newTankData.y;
				tank.baseAngle = newTankData.baseAngle;
				tank.cannonAngle = newTankData.cannonAngle;
			}
		});
	},

	addTank: function(tank){
		this.tanks.push(tank);
	},

	addBall: function(ball){
		this.balls.push(ball);
	},

	removeTank: function(tankId){
		//Remove tank object
		console.log("removeTank");
		this.tanks = this.tanks.filter( function(t){console.log("T.id: "+t.id) ; console.log("tankID: "+tankId) ; return t.id != tankId} );
	},

	

	//The app has absolute control of the balls and their movement
	syncBalls: function(){
		var self = this;
		//Detect when ball is out of bounds
		this.balls.forEach( function(ball){
			self.detectCollision(ball);

			if(ball.x < 0 || ball.x > WIDTH
				|| ball.y < 0 || ball.y > HEIGHT){
				ball.out = true;
			}else{
				ball.fly();
			}
		});
	},

	//Detect if ball collides with any tank
	detectCollision: function(ball){
		var self = this;
		this.tanks.forEach( function(tank){
			if(tank.id != ball.ownerId
				&& Math.abs(tank.x - ball.x) < 30
				&& Math.abs(tank.y - ball.y) < 30){
				//Hit tank
				self.hurtTank(tank);
				ball.out = true;
				ball.exploding = true;
			}
		});
	},

	hurtTank: function(tank){
		tank.hp -= 2;
	},

	getData: function(){
		var gameData = {};
		gameData.tanks = this.tanks;
		gameData.balls = this.balls;

		return gameData;
	},

	cleanDeadTanks: function(){
		this.tanks = this.tanks.filter(function(t){
			return t.hp > 0;
		});
	},

	cleanDeadBalls: function(){
		this.balls = this.balls.filter(function(ball){
			return !ball.out;
		});
	},

	increaseLastBallId: function(){
		this.lastBallId ++;
		if(this.lastBallId > 1000){
			this.lastBallId = 0;
		}
	}

}

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

module.exports = GameServer;