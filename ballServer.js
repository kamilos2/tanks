
var BALL_SPEED = 10;
function Ball(ownerId, alpha, x, y,game){
	this.id = game.lastBallId;
	game.increaseLastBallId();
	this.ownerId = ownerId;
	this.alpha = alpha; //angle of shot in radians
	this.x = x;
	this.y = y;
	this.out = false;
}

Ball.prototype = {
	//To calculate the trajectory of each projectile
	
	
	//Each instance of the Ball object contains the angle the cannon had when it was shot. 
	//And we use the sin and cos functions to get the speed for each one of the vector components.
	//This way we can update the position of each cannon ball every 50ms and detect collisions with any of the tanks.
	fly: function(){
		//move to trayectory
		var speedX = BALL_SPEED * Math.sin(this.alpha);
		var speedY = -BALL_SPEED * Math.cos(this.alpha);
		this.x += speedX;
		this.y += speedY;
	}

};

module.exports = Ball;