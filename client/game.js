/*var canvas = document.getElementById('canvasJuego');
var ctx = canvas.getContext("2d");*/
var app;
var players = [];
/*Crear juego
=========================================================*/
function Game(socket){
    app = new app();
    this.movimiento = true
    this.playerToDebug = 0;
    this.NodoToDebug = 0;
    this.playerDebug = false;
    this.debugNodosLength = 0;
	this.socket = socket;
    for(var i=0;i<100;i++)this.generarCirculoPrueba()

	var g = this;
	setInterval(function(){
		g.bucle();
	}, 40);
    setInterval(function() {
        g.colision();
    }, 350);
    window.addEventListener("keydown", this.teclitas, true);
    window.addEventListener("keyup", this.teclitasUp, true);
    window.addEventListener('mousemove', this.actualizarRaton, true);
    window.addEventListener('touchstart', this.actualizarTouch, true);
    window.addEventListener('touchmove', this.actualizarTouch, true);
}
/*=======================================================*/

Game.prototype = {
    reescalar: function () {
      app.renderer.resize(window.innerWidth, window.innerHeight);
    },
    /*Eventos recibidos del server
    ======================================================*/
	crearPlayerCliente: function(id, local,nombrev){
		var t = new Player(id, this, local,nombrev,app.bichos);
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
        if(players.length>=1) {
            serverInfo.forEach(function(serverPlayer){ //Cada player del server info[]
                if(serverPlayer.length>players[numserver].bicho.nodos.length) players[numserver].bicho.nodos.slice(0,serverPlayer.length-1)
                serverPlayer[0].forEach(function(nodoServer) { //Cada nodo del player del server info[][]
                    if(nodoServer != undefined && numserver<=players.length-1) {
                        players[numserver].bicho.parsearNodo(nodoServer);
                    }
                });
                players[numserver].bicho.hitbox = serverPlayer[1];
                numserver++;
            });
        }


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
    actualizarRaton: function(e) {
        if(game.localPlayer) {
            game.localPlayer.ratonX = e.clientX;
            game.localPlayer.ratonY = e.clientY;
        }
    },
    actualizarTouch: function(e) {
        if(game.localPlayer) {
            game.localPlayer.ratonX = e.touches[0].clientX;
            game.localPlayer.ratonY = e.touches[0].clientY;
        }
	},
    /*===============================================*/
    /*BUCLE - BUCLE - BUCLE - BUCLE - BUCLE - BUCLE - BUCLE*/
	bucle: function(){
        app.renderer.view.getContext("2d").fillRect(0,0,1500,1500)
        var temp = Math.abs(app.world.pivot.y);
        app.world.pivot.x = this.localPlayer.bicho.nodos[0].x - window.innerWidth/2
        app.world.pivot.y = this.localPlayer.bicho.nodos[0].y - window.innerHeight/2
        this.posicionRaton();
        //ctx.clearRect(0, 0, canvas.width, canvas.height); //Limpiar el canvas
		if(this.localPlayer != undefined) this.enviarInfo();
        players.forEach(function(player){
            /*player.bicho.pintar(ctx)
            ctx.font = "20px Comic Sans MS";
            ctx.fillStyle = 'black';
            ctx.textAlign = "center";
            ctx.font = "20px Comic Sans MS";
            ctx.fillStyle = 'blue';
            ctx.fillText(player.nombre,player.bicho.nodos[0].x-30,player.bicho.nodos[0].y+20);*/
        });
        /*
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
        }*/
        app.camera.proxyContainer(app.world);
        app.renderer.render(app.world);
        app.camRender.render(app.camera);
	},
    /*BUCLE - BUCLE - BUCLE - BUCLE - BUCLE - BUCLE - BUCLE*/
    debugInit: function(){
        this.gui = new dat.GUI();
        this.gui.add(this, 'playerDebug');
        this.gui.add(this, 'playerToDebug',0,players.length-1)
        this.gui.add(this, 'NodoToDebug',0,0);
        this.gui.add(game, 'evolucionar');
        this.gui.add(game, 'involucionar');
        this.gui.add(this, 'movimiento');

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
    },
    /*Mirar en que dirección girar el bicho
    =======================================*/
    posicionRaton: function() {
        if(this.movimiento) {
            var relX = game.localPlayer.ratonX - game.localPlayer.bicho.nodos[0].x+app.world.pivot.x;
            var relY = game.localPlayer.ratonY - game.localPlayer.bicho.nodos[0].y+app.world.pivot.y;
            var anguloBicho = game.localPlayer.bicho.nodos[0].anguloActual;
            var relAngulo = Math.atan2(relY, relX) * 180 / Math.PI + 180;
            var difAngulo = relAngulo - anguloBicho;
            if(difAngulo > -170 && (difAngulo < -10 || difAngulo > 190)) {
                game.localPlayer.derecha =  false;
                game.localPlayer.izquierda = true;
            } else if(difAngulo > 10 || difAngulo < -190) {
                game.localPlayer.derecha = true;
                game.localPlayer.izquierda = false;
            } else {
                game.localPlayer.derecha = false;
                game.localPlayer.izquierda = false;
            }
            var distancia = Math.sqrt(Math.pow(relX, 2) + Math.pow(relY, 2));
            var diametro = game.localPlayer.bicho.nodos[0].radio;
            if(distancia > diametro) {
                game.localPlayer.arriba = true;
            } else {
                game.localPlayer.arriba = false;
            }
        }else {
            game.localPlayer.derecha = false;
            game.localPlayer.izquierda = false;
            game.localPlayer.arriba = false;
        }
    },

    crearBorde: function(ancho,alto) {
        app.bordeGraphics = new PIXI.Graphics();
        app.bordeGraphics.lineStyle(30, 0x8d8dc9, 30);
        app.bordeGraphics.drawRect(0, 0, ancho, alto);
        app.bordeSprite = new PIXI.Sprite(app.bordeGraphics.generateCanvasTexture());
        app.bordeSprite.interactive = true;
        app.bordeSprite.zOrder =5;
        app.bordeSprite.x = 0;
        app.bordeSprite.y = 0;
        app.world.addChild(app.bordeSprite);
    },
    /*====================================*/
    /*Colision con otros players
    ====================================================*/
    colision: function(){
		players.forEach(function(player) {
            if(player.id === game.localPlayer.id) {
                return true;
            }
            var hPlayer = game.localPlayer.bicho.hitbox;
            var hTarget = player.bicho.hitbox;
            if(hPlayer[2] >= hTarget[0] && hTarget[2] >= hPlayer[0]) {
                if(hPlayer[3] >= hTarget[1] && hTarget[3] >= hPlayer[1]) {
                    game.localPlayer.bicho.chocar(player.bicho);
                }
            }
        });
	},

    generarCirculoPrueba: function(){
        var graphics = new PIXI.Graphics();
        graphics.lineStyle(0);
        graphics.beginFill(0xffffff, 0.5);
        graphics.drawCircle(100, 100,100);
        graphics.endFill();
        var sprite = new PIXI.Sprite(graphics.generateCanvasTexture());

        sprite.anchor.set(0.5);
        sprite.position.x = Math.random()*2800+100;
        sprite.position.y = Math.random()*2800+100;
        sprite.interactive = true;
        app.bichos.addChild(sprite);
    }
    /*===================================================*/
}

/*Constructor de los player
=======================================*/
function Player(id, game, local,nombrev,bichos){
    this.nombre = nombrev;
	this.id = id;
    this.ratonX = 0;
    this.ratonY = 0;
	this.game = game;
	this.local = local;
    this.bicho = new Bicho(bichos,this.id,nombrev);
}
/*====================================*/
function app(){
    this.bichos = new PIXI.Container();
    this.renderer = new PIXI.CanvasRenderer(800, 600,{backgroundColor : 0x1099bb});
    this.world = new PIXI.Container();
    this.borde = new PIXI.Container();
    this.stage = new PIXI.Container();
    this.camRender = new PIXI.CanvasRenderer(250, 200, {backgroundColor : 0x1099bb}, true)
    this.camRender.view.style.position = "absolute";
    this.camRender.view.style.border= "5px solid black";
    this.camRender.view.style.borderRadius= "10px";
    this.camRender.view.style.display = "block";
    this.camRender.view.style.zIndex = 1;
    this.camRender.view.style.margin = 10;

    this.autoResize = true;
    this.renderer.backgroundColor = 0x3498db;
    this.renderer.view.style.position = "absolute";
    this.renderer.view.style.display = "block";
    this.renderer.autoResize = true;
    this.renderer.resize(window.innerWidth, window.innerHeight);

    this.camera = new PIXI.Camera2d();
    this.stage.addChild(this.world);
    this.world.addChild(this.bichos);
    this.camera.scale.x = .1;
    this.camera.scale.y = .1;
    this.stage.addChild(this.camera);
    this.camera.position.x = 30;
    this.camera.position.y = 50;
    document.body.appendChild(this.renderer.view);
    document.body.appendChild(this.camRender.view);

}


