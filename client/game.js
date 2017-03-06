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
        var num2 = -1;
        var numserver = 0;
		serverInfo.forEach(function(serverPlayer){ //Cada player del server info[]
            num2 +=3;
            var num = 0;
            serverPlayer.forEach(function(nodoServer) { //Cada nodo del player del server info[][]
                if(nodoServer != undefined && numserver<=players.length-1) {
                    var nump = 0;
                    players[numserver].bicho.nodos[num].x = nodoServer[0]
                    players[numserver].bicho.nodos[num].y = nodoServer[1]
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
			dir: this.localPlayer.dir,
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
            var num = 0;
            player.bicho.pintar(ctx)
            ctx.font = "20px Comic Sans MS";
            ctx.fillStyle = 'black';
            ctx.textAlign = "center";
            player.bicho.nodos.forEach(function(nodo){
                ctx.fillText("Nº: "+num,nodo.x-10,nodo.y-10);
                num++;
            });
            ctx.font = "20px Comic Sans MS";
            ctx.fillStyle = 'blue';
            ctx.fillText(nombre,player.bicho.nodoCentral.x-30,player.bicho.nodoCentral.y+20);
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
    this.bicho.reiniciarNodos();
}
/*====================================*/

