
function joinGame(tankName, tankType){
	if(tankName != ''){
		$('#prompt').hide(); //Cache le pop-up
		socket.emit('joinGame', {name: tankName, type: tankType});
	}
}


//Events recu du serveur
function setupSocket(){

	socket.on('addTank', function(tank){
		//Ajoute un tank sur la map (peut être le notre ou un ennemi)
		game.addTank(tank.id, tank.name, tank.type, tank.isLocal, tank.x, tank.y);
	})
	
	.on('sync', function(gameServerData){
		game.receiveData(gameServerData);
	})
	
	.on('killTank', function(tankData){
		game.killTank(tankData);
	})
	
	.on('removeTank', function(tankId){
		game.removeTank(tankId);
	})
	
	.on('addStar', function(coord){
		console.log("Star received");
		game.addStar(coord.x,coord.y);
	});


}


var SKIP_INTRO=true;

var WIDTH = 1100;
var HEIGHT = 580;
// This IP is hardcoded to my server, replace with your own
var socket = io.connect('https://tanks19.herokuapp.com/');

setupSocket();

var game = new Game('#arena', WIDTH, HEIGHT, socket); //From tanks.Js
game.start();

var selectedTank = 1; //Par défaut selectionne le 1er
var tankName = '';



//Code du pop-up screen
$(document).ready( function(){
	
	
	//If press Join button
	$('#join').click( function(){
		tankName = SKIP_INTRO ? "Debug" : $('#tank-name').val();
		joinGame(tankName, selectedTank);
	});
	
	//Trigger can termine de tapper une lettre
	$('#tank-name').keyup( function(e){
		tankName = $('#tank-name').val();
		var k = e.keyCode || e.which;
		if(k == 13){ //If press enter
			joinGame(tankName, selectedTank);
		}
	});

	//If press tank image
	$('ul.tank-selection li').click( function(){
		$('.tank-selection li').removeClass('selected') //Enleve cadre de toutes les classes
		$(this).addClass('selected'); // La case courante recoit le cadre
		selectedTank = $(this).data('tank');
	});
	
	if(SKIP_INTRO){
		$( "#join" ).trigger( "click" );
	}
});

