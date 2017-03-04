var canvas = document.getElementById('canvasJuego');
var ctx = canvas.getContext("2d");
var alto;
reescalar();
var bicho = new Bicho();
setInterval(function() {
    bicho.update();
    bicho.pintar(ctx);
}, 20);
function reescalar() {
    alto = window.innerHeight;
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = alto;
}

function Game(socket){
	this.socket = socket;
	var g = this;
	setInterval(function(){
		g.bucle();
	}, 20);
    window.addEventListener("keydown", this.teclitas, true);
}
var players = [];
Game.prototype = {

	crearPlayerCliente: function(id, local, x, y){
		var t = new Player(id, this, local, x, y);
		if(local) {t.dir = 1;this.localPlayer = t;}
		players.push(t);
	},

	bucle: function(){
		if(this.localPlayer != undefined) this.enviarInfo();

        players.forEach(function(player){
            //player.bicho.update();
            //player.bicho.pintar(ctx);
            ctx.fillRect(player.x,player.y,20,20);
        });
		if(this.localPlayer != undefined){
			//this.move();
		}

	},

	enviarInfo: function(){
		var info = {};
		var t = {
			id: this.localPlayer.id,
			dir: this.localPlayer.dir,
            //x: this.localPlayer.x,
			//y: this.localPlayer.y,
		};
		info.player = t;
		this.socket.emit('sync', info);
	},

	recibirInfo: function(serverInfo){

		serverInfo.players.forEach( function(serverPlayer){

			if(game.localPlayer !== undefined && serverPlayer.id == game.localPlayer.id){
			}
			var found = false;
			players.forEach( function(player){
				if(player.id == serverPlayer.id){
					player.x = serverPlayer.x;
					player.y = serverPlayer.y;
					found = true;
				}
			});
			if(!found &&
				(this.localPlayer == undefined || serverPlayer.id != this.localPlayer.id)){
				this.nuevoPlayer(serverPlayer.id, serverPlayer.type, false, serverPlayer.x, serverPlayer.y, serverPlayer.hp);
			}
		});
	},
    teclitas: function (e) {
        if(e.keyCode === 87) game.localPlayer.dir = 0;
        if(e.keyCode === 83) game.localPlayer.dir = 1;
        if(e.keyCode === 65) game.localPlayer.dir = 2;
        if(e.keyCode === 68) game.localPlayer.dir = 3;
    }
}

function Player(id, game, local, x, y){
	this.id = id;
	this.x = x;
	this.y = y;
	this.game = game;
	this.local = local;
    this.bicho = new Bicho();
}

