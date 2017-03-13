/*var canvas = document.getElementById('canvasJuego');
var ctx = canvas.getContext("2d");*/
var app;
var players = [];
var numPlantas = 0;
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

	var g = this;
	setInterval(function(){
		g.bucle();
	}, 40);
    setInterval(function() {
        g.colision();
    }, 100);
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
      app.ContenedorMinimapa.resize(window.innerWidth/10, window.innerHeight/10);
    },
    /*Eventos recibidos del server
    ======================================================*/
	crearPlayerCliente: function(id, local,nombrev, plantas){
		var t = new Player(id, this, local,nombrev,app.bichos);
		if(local) {
            this.localPlayer = t
            plantas.forEach(function(planta) {
                planta.forEach(function(nodoPlanta) {
                    //nodo.x, nodo.y, nodo.visible, nodo.tipoNodo, nodo.radio
                    var graphics = new PIXI.Graphics();
                    graphics.lineStyle(0);
                    graphics.beginFill(nodoPlanta[3].colorHex, 0.75);
                    graphics.drawCircle(nodoPlanta[4], nodoPlanta[4], nodoPlanta[4]);
                    graphics.endFill();
                    var sprite = new PIXI.Sprite(graphics.generateCanvasTexture());

                    sprite.anchor.set(0.5);
                    sprite.position.x = nodoPlanta[0];
                    sprite.position.y = nodoPlanta[1];
                    sprite.interactive = true;
                    app.world.addChild(sprite);
                });
            });
        ;} //Si es el player propio.
		players.push(t);
        if(players.length==1) this.debugInit();
        if(players.length>1) this.resetGui();
	},

    recibirInfo: function(serverInfo){
        //Borramos players desconectados
        if(serverInfo[0].playersDesc != undefined){
            for(var i = 0; i < serverInfo[0].playersDesc.length; i++)
                for(var j=0;j < players.length;j++)
                    if(players[j].id === serverInfo[0].playersDesc[i].id) players.splice(j, 1);
        }
        //Por cada player recibido del servidor
        var numserver = 0;
        if(players.length>=1) {
            serverInfo[0].forEach(function(serverPlayer){ //Cada player del server info[]
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
        /*==========================================================================*/
        /* Pixi - Mover la cámara y pintarlo todo
        ============================================================================*/
        if(this.localPlayer.bicho.nodos[0]) {
            app.world.pivot.x = this.localPlayer.bicho.nodos[0].x - window.innerWidth/2
            app.world.pivot.y = this.localPlayer.bicho.nodos[0].y - window.innerHeight/2
            app.renderer.render(app.world);
            app.cameraMinimapa.proxyContainer(app.world);
            app.ContenedorMinimapa.render(app.cameraMinimapa);
        }

        /*==========================================================================*/
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

        this.posicionRaton();
        //ctx.clearRect(0, 0, canvas.width, canvas.height); //Limpiar el canvas
		if(this.localPlayer != undefined) this.enviarInfo();
        /*if(this.playerDebug) {
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
	},
    /*BUCLE - BUCLE - BUCLE - BUCLE - BUCLE - BUCLE - BUCLE*/
    /*===================================================================*/
    /*Debug
    =====================================================================*/
    debugInit: function(){
        this.gui = new dat.GUI();
        this.gui.add(this, 'playerDebug');
        this.gui.add(this, 'playerToDebug',0,Math.max(players.length-1,0))
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
    /*================================================================*/
    /*Mirar en que dirección girar el bicho
    ==================================================================*/
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

    crearBorde: function(ancho,alto) { //Se llama desde client.js al crear el player local.
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
                    game.localPlayer.bicho.chocar(player.bicho,this.socket,player.id,game.localPlayer.id);
                }
            }
        });
	},
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

/*====================================================================================*/
/*Render - Pixi
======================================================================================*/
function app(){
    /*Declarar contenedores de imágenes
    =====================================*/
    this.bichos = new PIXI.Container();
    this.world = new PIXI.Container();
    this.borde = new PIXI.Container();
    /*==================================*/
    /*Declarar renderer de imágenes
    =================================================================================================*/
    this.renderer = new PIXI.CanvasRenderer(800, 600,{backgroundColor : 0x3498db});
    this.ContenedorMinimapa = new PIXI.CanvasRenderer(250, 200, {backgroundColor : 0x1099bb}, true)
    /*===============================================================================================*/
    /*Preparar los renderer (Estilos)
    ==============================================================================*/
    this.renderer.resize(window.innerWidth, window.innerHeight);
    this.ContenedorMinimapa.resize(window.innerWidth/10, window.innerHeight/7);

    this.renderer.view.style.position = "absolute";
    this.ContenedorMinimapa.view.style.position = "absolute";

    this.renderer.view.style.display = "block";
    this.ContenedorMinimapa.view.style.display = "block";

    this.ContenedorMinimapa.view.style.border= "5px solid black";
    this.ContenedorMinimapa.view.style.borderRadius= "10px";
    this.ContenedorMinimapa.view.style.zIndex = 1; //ContenedorMinimapa se ve por encima del renderer normal si no no se vería

    //Añadirlos al body para que se vean
    document.body.appendChild(this.renderer.view);
    document.body.appendChild(this.ContenedorMinimapa.view);
    /*========================================================================= */
    /*Que se autoajusten cuando se les cambie de tamaño en reescalar
    ===========================================================================*/
    this.renderer.autoResize = true;
    this.autoResize = true;
    /*=========================================================================*/
    /*Cámera
    =============================================*/
    this.cameraMinimapa = new PIXI.Camera2d();
    this.cameraMinimapa.position.x = 0;
    this.cameraMinimapa.position.y = 0;
    //Quitarle escala al minimapa para que sea un mundo en miniatura.
    this.cameraMinimapa.scale.x = .1;
    this.cameraMinimapa.scale.y = .1;
    /*=======================================================================*/
    /*Añadir los bichos al mundo
    =========================================================================*/
    this.world.addChild(this.bichos);
}
/*=============================================================s==============*/


