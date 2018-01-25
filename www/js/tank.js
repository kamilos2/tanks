var ROTATION_SPEED = 5;

function Tank(id, name, type, $arena, game, isLocal, x, y, hp){
	this.id = id;
	this.name= name;
	this.type = type;
	this.speed = 5;
	this.$arena = $arena;
	this.w = 60; //80 // 60
	this.h = 80; //60//80
	this.baseAngle = getRandomInt(0, 360);// L'angle de rotation de la base du tank
	//Make multiple of rotation amount
	this.baseAngle -= (this.baseAngle % ROTATION_SPEED);
	this.cannonAngle = 0;
	this.x = x;
	this.y = y;
	this.mx = null;
	this.my = null;
	this.dir = {
		up: false,
		down: false,
		left: false,
		right: false
	};
	this.game = game;
	this.isLocal = isLocal;
	this.hp = hp;
	this.dead = false;
	this.body;

}

Tank.prototype = {

	addStar: function(x,y){
		this.$arena.append('<div id="Star-' + this.id + '" class="star starBackground"</div>');
		this.$starHTML = $('#Star-' + this.id);
		this.$starHTML.css('left', x + 'px');
		this.$starHTML.css('top', y + 'px');
		this.$starHTML.css('width', '280px');
		this.$starHTML.css('height', '280px');
		this.$starHTML.css('transform', 'scale(0.7)');
		console.log("Star added");
	},
	
	materialize: function(){
		

		/*a
		//Append au div : style=
		
		*/
		//Create TANK
		this.$arena.append(' <div id="' + this.id + '" class="tank tank' + this.type + '"></div>');
		this.$body = $('#' + this.id);
		
		this.$body.css('width', this.w);
		this.$body.css('height', this.h);

		//this.$body.css('-webkit-transform', 'rotateZ(' + this.baseAngle + 'deg)');
		//this.$body.css('-moz-transform', 'rotateZ(' + this.baseAngle + 'deg)');
		//this.$body.css('-o-transform', 'rotateZ(' + this.baseAngle + 'deg)');
		this.$body.css('transform', 'rotate(' + this.baseAngle + 'deg)');

		this.$body.append('<div id="cannon-' + this.id + '" class="tank-cannon"></div>');
		this.$cannon = $('#cannon-' + this.id);

		this.$arena.append('<div id="info-' + this.id + '" class="info"></div>');
		this.$info = $('#info-' + this.id);
		this.$info.append('<div class="label">' + this.name + '</div>');
		this.$info.append('<div class="hp-bar"></div>');

		this.refresh();

		if(this.isLocal){
			this.setAutoControls();
		}
	},

	isMoving: function(){
		return this.dir.up || this.dir.down || this.dir.left || this.dir.right;
	},

	refresh: function(){
		
		this.$body.css('left', Math.trunc(this.x) - 30 + 'px');
		this.$body.css('top', Math.trunc(this.y) - 40 + 'px');
		//this.$body.css('-webkit-transform', 'rotateZ(' + this.baseAngle + 'deg)');
		//this.$body.css('-moz-transform', 'rotateZ(' + this.baseAngle + 'deg)');
		//this.$body.css('-o-transform', 'rotateZ(' + this.baseAngle + 'deg)');
		this.$body.css('transform', 'rotate(' + this.baseAngle + 'deg)');

		var cannonAbsAngle = this.cannonAngle - this.baseAngle;
		//this.$cannon.css('-webkit-transform', 'rotateZ(' + cannonAbsAngle + 'deg)');
		//this.$cannon.css('-moz-transform', 'rotateZ(' + cannonAbsAngle + 'deg)');
		//this.$cannon.css('-o-transform', 'rotateZ(' + cannonAbsAngle + 'deg)');
		//this.$cannon.css('transform', 'rotateZ(' + cannonAbsAngle + 'deg)');

		this.$info.css('left', (this.x) + 'px');
		this.$info.css('top', (this.y) + 'px');
		if(this.isMoving()){
			this.$info.addClass('fade');
		}else{
			this.$info.removeClass('fade');
		}

		this.$info.find('.hp-bar').css('width', this.hp + 'px');
		this.$info.find('.hp-bar').css('background-color', getGreenToRed(this.hp));
	},

	setAutoControls: function(){
		var t = this;
		
		/* Detect both keypress and keyup to allow multiple keys
		 and combined directions */
		
		$(document).bind('keydown', function(e){
			var k = e.keyCode || e.which; //Some browsers use keyCode, others use which
			switch(k){
				case 90: //W
					t.dir.up = true;
					break;
				case 83: //S
					t.dir.down = true;
					break;
				case 81: //A
					t.dir.left = true;
					break;
				case 68: //D
					t.dir.right = true;
					break;
					
			}
		}).bind('keyup', function(e){
			var k = e.keyCode || e.which;
			switch(k){
				case 90: //W
					t.dir.up = false;
					break;
				case 83: //S
					t.dir.down = false;
					break;
				case 81: //A
					t.dir.left = false;
					break;
				case 68: //D
					t.dir.right = false;
					break;
				case 13: //A
					t.shoot();
					break;
			}
		})
		/*.bind('mousemove',function(e){ //Detect mouse for aiming
			//TODO quand mouse move, ca tire
			t.mx = e.pageX - t.$arena.offset().left;
			t.my = e.pageY - t.$arena.offset().top;
			t.setCannonAngle();
		})*/
		
		$( document.body ).bind('click',function(){
			console.log("click")
			t.shoot();
		});
		
		
		$('body').bind('click', function(){
			//alert("The paragraph was clicked.");
			t.shoot();
		});
		
		
		$( "#arena" ).css( "border", "13px solid red" );

	},

	move: function(){
		if(this.dead){
			return;
		}

		var moveX = 0;
		var moveY = 0;
		//console.log("Base Angle:"+this.baseAngle);
		
		//deplace le tank selon les flèche à une vitesse donnée
		baseAngleCorrected = this.baseAngle-90;
		if(baseAngleCorrected<0){
			baseAngleCorrected = 360 - (-baseAngleCorrected);
		}
			
		if (this.dir.up) {
			moveX = Math.cos(baseAngleCorrected * Math.PI / 180);
			moveY = Math.sin(baseAngleCorrected * Math.PI / 180);
		} else if (this.dir.down) {
			moveX = -Math.cos(baseAngleCorrected * Math.PI / 180);
			moveY = -Math.sin(baseAngleCorrected * Math.PI / 180);
		}
		
		moveX = this.speed * moveX;
		moveY = this.speed * moveY;

		if(this.x + moveX > (0 + ARENA_MARGIN) && (this.x + moveX) < (this.$arena.width() - ARENA_MARGIN)){
			this.x += moveX;
		}
		if(this.y + moveY > (0 + ARENA_MARGIN) && (this.y + moveY) < (this.$arena.height() - ARENA_MARGIN)){
			this.y += moveY;
		}
		this.rotateBase();
		this.setCannonAngle();
		this.refresh();
	},

	/* Rotate base of tank to match movement direction */
	rotateBase: function(){
		
		if( (this.dir.left && this.dir.up) || (this.dir.right && this.dir.down ) ){
			
			if(this.baseAngle  == 0){
				this.baseAngle=360;
			}
			this.baseAngle -= ROTATION_SPEED;
			if(this.baseAngle < 0){ //Si ex on est passé de 2 à -3 --> 357
				this.baseAngle = 360 - (-baseAngle);
			}
			
		}else if( (this.dir.right && this.dir.up)  || (this.dir.left && this.dir.down ) ){ 
			
			if(this.baseAngle  == 360){
				this.baseAngle=0;
			}
			this.baseAngle += ROTATION_SPEED;
			if(this.baseAngle  > 360){ //Si ex on est passé de 358 à 363 --> 3
				this.baseAngle = baseAngle-360;
			}
		}
	},
	
	

	//calculate the angle of the cannon and the trajectory of the projectile
	setCannonAngle: function(){
		//Every time the mouse moves we need to update the angle of the cannon, mx and my represent the coordinates of the mouse pointer
		var tank = { x: this.x , y: this.y};
		var deltaX = this.mx - tank.x;
		var deltaY = this.my - tank.y;
		//calculate the angle between the mouse coordinates point, and the center of the tank.
		this.cannonAngle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
		this.cannonAngle += 90;
	},

	shoot: function(){
		if(this.dead){
			return;
		}

		//Emit ball to server
		var serverBall = {};
		//Just for local balls who have owner
		serverBall.alpha = this.baseAngle * Math.PI / 180; //angle of shot in radians
		//Set init position
		var cannonLength = 60;
		var deltaX = cannonLength * Math.sin(serverBall.alpha);
		var deltaY = cannonLength * Math.cos(serverBall.alpha);

		serverBall.ownerId = this.id;
		serverBall.x = this.x + deltaX - 5;
		serverBall.y = this.y - deltaY - 5;

		this.game.socket.emit('shoot', serverBall);
	}

}

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}