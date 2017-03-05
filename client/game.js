var canvas = document.getElementById('canvasJuego');
var ctx = canvas.getContext("2d");
var alto;
var players = [];
reescalar();

function reescalar() {
    alto = window.innerHeight;
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = alto;
}

/*Crear juego
=========================================================*/
function Game(socket){
	this.socket = socket;
	var g = this;
	setInterval(function(){
		g.bucle();
	}, 20);
    window.addEventListener("keydown", this.teclitas, true);
}
/*=======================================================*/

Game.prototype = {
    /*Eventos recibidos del server
    ======================================================*/
	crearPlayerCliente: function(id, local, x, y){
		var t = new Player(id, this, local, x, y);
		if(local) {t.dir = 1;this.localPlayer = t;} //Si es el player propio.
		players.push(t);
	},

    recibirInfo: function(serverInfo){
        //Borramos players desconectados
        if(serverInfo.playersDesc != undefined){
            for(var i = 0; i < serverInfo.playersDesc.length; i++)
                for(var j=0;j < players.length;j++)
                    if(players[j].id === serverInfo.playersDesc[i].id) players.splice(j, 1);
        }

        //Por cada player recibido del servidor
		serverInfo.players.forEach( function(serverPlayer){
			var ok = false; //Variable para saber si existe el player localmente
			players.forEach( function(player){ //Por cada player local
				if(player.id === serverPlayer.id){//Comprobar si existe
					player.x = serverPlayer.x;
					player.y = serverPlayer.y;
					ok = true;
				}
			});
            //Si el jugador recibido del server no existe localmente crearlo.
			//if(!ok && (this.localPlayer == undefined || serverPlayer.id != this.localPlayer.id))
				//this.nuevoPlayer(serverPlayer.id, serverPlayer.type, false, serverPlayer.x, serverPlayer.y, serverPlayer.hp);
		});
	},
    /*===================================================*/
    /*Eventos para enviar al server
    ====================================================*/
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
    /*=================================================*/
    /*Inputs
    ==================================================*/
    teclitas: function (e) {
        if(e.keyCode === 87) game.localPlayer.dir = 0;
        if(e.keyCode === 83) game.localPlayer.dir = 1;
        if(e.keyCode === 65) game.localPlayer.dir = 2;
        if(e.keyCode === 68) game.localPlayer.dir = 3;

        if(e.keyCode === 13 && canvasJuego.style.display === "none") empezarJuego();
    },
    /*===============================================*/

    /*BUCLE - BUCLE - BUCLE - BUCLE - BUCLE - BUCLE - BUCLE*/
	bucle: function(){
        ctx.clearRect(0, 0, canvas.width, canvas.height); //Limpiar el canvas

		if(this.localPlayer != undefined) this.enviarInfo();

        players.forEach(function(player){
            //console.log(player.id);
            player.bicho.update();
            player.bicho.pintar(ctx);
            ctx.font = "30px Comic Sans MS";
            ctx.textAlign = "center";
            ctx.fillText(nombre,player.x,player.y-10);
            ctx.fillRect(player.x,player.y,20,20);
        });

		if(this.localPlayer != undefined){
			//this.move();
		}
	},
    /*BUCLE - BUCLE - BUCLE - BUCLE - BUCLE - BUCLE - BUCLE*/
}

/*Constructor de los player
=======================================*/
function Player(id, game, local, x, y){
	this.id = id;
	this.x = x;
	this.y = y;
	this.game = game;
	this.local = local;
    this.bicho = new Bicho();
    this.bicho.reiniciarNodos();
}
/*====================================*/

