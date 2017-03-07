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
	}, 40);
    window.addEventListener("keydown", this.teclitas, true);
    window.addEventListener("keyup", this.teclitasUp, true);
}
/*=======================================================*/

Game.prototype = {
    /*Eventos recibidos del server
    ======================================================*/
	crearPlayerCliente: function(id, local, x, y){
		var t = new Player(id, this, local, x, y);
		if(local) {this.localPlayer = t;} //Si es el player propio.
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
        var num2 = -1;
        var numserver = 0;
		serverInfo.forEach(function(serverPlayer){ //Cada player del server info[]
            num2 +=3;
            var num = 0;
            serverPlayer.forEach(function(nodoServer) { //Cada nodo del player del server info[][]
                if(nodoServer != undefined && numserver<=players.length-1) {
                    players[numserver].bicho.parsearNodo(nodoServer);
                }
                num++;
            });
            numserver++;
		});
	},
    /*===================================================*/
    /*Eventos para enviar al server
    ====================================================*/
    enviarInfo: function(){
		var info = {};
		var t = {
			id: this.localPlayer.id,
            arriba: this.localPlayer.arriba,
            abajo: this.localPlayer.abajo,
            izquierda: this.localPlayer.izquierda,
            derecha: this.localPlayer.derecha,
		};
		info.player = t;
		this.socket.emit('sync', info);
	},
    /*===================================================*/
    /*Prueba de evolucionar
    ====================================================*/
    evolucionar: function(){
		var info = {};
		var t = {
			id: this.localPlayer.id
		};
		info.player = t;
		this.socket.emit('evolucionar', info);
	},
    /*=================================================*/
    /*Inputs
    ==================================================*/
    teclitas: function (e) {
        if(e.keyCode === 13 && canvasJuego.style.display === "none") empezarJuego();

        if(e.keyCode === 87) game.localPlayer.arriba = true;
        if(e.keyCode === 83) game.localPlayer.abajo = true;
        if(e.keyCode === 65) game.localPlayer.izquierda = true;
        if(e.keyCode === 68) game.localPlayer.derecha = true;
        if(e.keyCode === 32) game.evolucionar();
    },
    teclitasUp: function(e) {
        if(e.keyCode === 87) game.localPlayer.arriba = false;
        if(e.keyCode === 83) game.localPlayer.abajo = false;
        if(e.keyCode === 65) game.localPlayer.izquierda = false;
        if(e.keyCode === 68) game.localPlayer.derecha = false;
    },
    /*===============================================*/
    /*BUCLE - BUCLE - BUCLE - BUCLE - BUCLE - BUCLE - BUCLE*/
	bucle: function(){
        ctx.clearRect(0, 0, canvas.width, canvas.height); //Limpiar el canvas

		if(this.localPlayer != undefined) this.enviarInfo();

        players.forEach(function(player){
            player.bicho.pintar(ctx)
            ctx.font = "20px Comic Sans MS";
            ctx.fillStyle = 'black';
            ctx.textAlign = "center";
            ctx.font = "20px Comic Sans MS";
            ctx.fillStyle = 'blue';
            ctx.fillText(nombre,player.bicho.nodos[0].x-30,player.bicho.nodos[0].y+20);
        });
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
}
/*====================================*/

