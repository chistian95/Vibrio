var canvas = document.getElementById('canvasJuego');
var ctx = canvas.getContext("2d");
var alto;
var players = []
reescalar();
function reescalar() {
    alto = window.innerHeight;
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = alto;
}

/*Crear juego
=========================================================*/
function Game(socket){
    this.playerToDebug = 0;
    this.NodoToDebug = 0;
    this.playerDebug = false;
    this.debugNodosLength = 0;
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
	crearPlayerCliente: function(id, local,nombrev){
		var t = new Player(id, this, local,nombrev);
		if(local) {
            this.localPlayer = t
        ;} //Si es el player propio.
		players.push(t);
        if(players.length==1) this.debugInit();
        if(players.length>1) this.resetGui();
	},

    recibirInfo: function(serverInfo){
        //Borramos players desconectados
        if(serverInfo.playersDesc != undefined){
            for(var i = 0; i < serverInfo.playersDesc.length; i++)
                for(var j=0;j < players.length;j++)
                    if(players[j].id === serverInfo.playersDesc[i].id) players.splice(j, 1);
        }
        //Por cada player recibido del servidor
        var numserver = 0;
		serverInfo.forEach(function(serverPlayer){ //Cada player del server info[]
            if(serverPlayer.length>players[numserver].bicho.nodos.length) players[numserver].bicho.nodos.slice(0,serverPlayer.length-1)
            serverPlayer.forEach(function(nodoServer) { //Cada nodo del player del server info[][]
                if(nodoServer != undefined && numserver<=players.length-1) {
                    players[numserver].bicho.parsearNodo(nodoServer);
                }
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
    involucionar: function(){
		var info = {};
		var t = {
			id: this.localPlayer.id
		};
		info.player = t;
		this.socket.emit('involucionar', info);
	},

    playerDesconectadoCliente: function(info) {
        var num = 0;
        players.forEach(function(player) {
            if(player.id === info.id) players.splice(num,1);
            num++;
        });
    },
    /*=================================================*/
    /*Inputs
    ==================================================*/
    teclitas: function (e) {
        if(e.keyCode === 87) game.localPlayer.arriba = true;
        if(e.keyCode === 83) game.localPlayer.abajo = true;
        if(e.keyCode === 65) game.localPlayer.izquierda = true;
        if(e.keyCode === 68) game.localPlayer.derecha = true;
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
            ctx.fillText(player.nombre,player.bicho.nodos[0].x-30,player.bicho.nodos[0].y+20);
        });

        if(this.playerDebug) {
           var ok = false;
            for(var i=1;i<=2;i++) {
                if(!ok)this.gui.__controllers[i].onFinishChange(function(value) {
                    game.resetGui();
                    ok = true
                });
            }
            players[Math.round(this.playerToDebug)].bicho.nodos[Math.round(this.NodoToDebug)].debug(ctx);
            ctx.fillText(""+players[Math.round(this.playerToDebug)].id,270,30);
        }
	},
    /*BUCLE - BUCLE - BUCLE - BUCLE - BUCLE - BUCLE - BUCLE*/
    debugInit: function(){
        this.gui = new dat.GUI();
        this.gui.add(this, 'playerDebug');
        this.gui.add(this, 'playerToDebug',0,players.length-1)
        this.gui.add(this, 'NodoToDebug',0,this.debugNodosLength-1);
        this.gui.add(game, 'evolucionar');
        this.gui.add(game, 'involucionar');
    },

    resetGui: function() {
        this.gui.__controllers[1].__max = Math.round(players.length-1);
        this.gui.__controllers[2].__max = players[Math.round(this.playerToDebug)].bicho.nodos.length-1;
        this.playerToDebug = Math.min(this.playerToDebug,this.gui.__controllers[1].__max);
        this.NodoToDebug = Math.min(this.NodoToDebug,this.gui.__controllers[2].__max);
        this.playerToDebug = Math.round(this.playerToDebug);
        this.NodoToDebug = Math.round(this.NodoToDebug);
        this.gui.__controllers[2].updateDisplay();
        this.gui.__controllers[1].updateDisplay();
    }
}

/*Constructor de los player
=======================================*/
function Player(id, game, local,nombrev){
    console.log("id: "+id+" local: "+local+" nombre: "+nombrev)
    this.nombre = nombrev;
	this.id = id;
	this.game = game;
	this.local = local;
    this.bicho = new Bicho();
}
/*====================================*/

