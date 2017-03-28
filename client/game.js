var app;
var players = [];
var playerReady = false;
var plantas = [];
var plantasSprites = [];
var plantasHitbox = [];
var numPlantas = 0;
var nivel = 0;
var lengthTentaculo = 2;
var expActual = null;
var expAntigua = null;

var zoomObj = 1;
var maxW = 1920;
var maxH = 1920;
var w = 1920;
var h = 1080;
var modifOjos = 0;
var maxZoom = 0.25;

/*Crear juego
=========================================================*/
function Game(socket){
    app = new app();
    this.mXtentaculos = 2;
    this.mYtentaculos = 5;
    this.movimiento = true;
    this.playerToDebug = 0;
    this.NodoToDebug = 0;
    this.vTentaculos = 0.2;
    this.playerDebug = false;
    this.debugNodosLength = 0;
	this.socket = socket;
    var count = 0;

    window.addEventListener("keydown", teclitas, true);
    window.addEventListener("keyup", teclitasUp, true);
    window.addEventListener('mousemove', actualizarRaton, true);
    window.addEventListener('touchstart', actualizarTouch, true);
    window.addEventListener('touchmove', actualizarTouch, true);

    setInterval(function(){
        count += this.vTentaculos;
		this.bucle();
        modifOjosTemp = 0.4;
        players.forEach(function(player){
            player.bicho.nodos.forEach(function(nodo){
                if(nodo.tipoNodo.nombre === "TENTACULO") {
                    nodo.sprite.zOrder = -10;
                    if(!nodo.tentaculines || !nodo.tentaculines.length) return;
                    nodo.tentaculines[1].x = -5;
                    for (var i = 2; i <nodo.tentaculines.length; i++) {
                        nodo.tentaculines[i].y = Math.sin((i * 0.5) + count) * this.mXtentaculos;
                        nodo.tentaculines[i].x = (i * lengthTentaculo + Math.cos((i * 0.3) + count) * this.mYtentaculos)-5;
                    }
                    player.bicho.nodos[player.bicho.nodos.indexOf(nodo)].sprite.rotation = player.bicho.nodos[player.bicho.nodos.indexOf(nodo)].anguloActual*Math.PI/180;
                } else if(nodo.tipoNodo.nombre === "OJO" && modifOjosTemp<1 && player.id === game.localPlayer.id) {
                    modifOjosTemp += 0.1;
                }
            }.bind(this));
        }.bind(this));
        if(modifOjos!=modifOjosTemp){
            modifOjos = modifOjosTemp;
            this.reescalar();
        }
	}.bind(this), 40);
    setInterval(function() {
        if(this.localPlayer) {
            this.cerca();
            this.colisionPlantas();
            var exp = this.calcularExpTotal(expActual);
            if(exp !== expAntigua){
                expAntigua = exp;
                actualizarExp();
            }
        }
    }.bind(this), 100);
}
/*=======================================================*/

Game.prototype = {
    evoZise: function() {this.socket.emit('evole',{id:game.localPlayer.id,opc: "zise"});this.emitirEvoTrampa();},
    evoPinchus: function() {this.socket.emit('evole',{id:game.localPlayer.id,opc: "pinchus"});this.emitirEvoTrampa();},
    evoTientaculos: function() {this.socket.emit('evole',{id:game.localPlayer.id,opc: "tientaculos"});this.emitirEvoTrampa();},
    evoEie: function() {this.socket.emit('evole',{id:game.localPlayer.id,opc: "eie"});this.emitirEvoTrampa();},
    evoCorza: function() {this.socket.emit('evole',{id:game.localPlayer.id,opc: "corza"});this.emitirEvoTrampa();},
    evoNodos: function() {this.socket.emit('evole',{id:game.localPlayer.id,opc: "nodos"});this.emitirEvoTrampa();},
    emitirEvoTrampa(){
        this.socket.emit('evo', game.localPlayer.id);
        expAntigua = 0;
    },
    /*BUCLE - BUCLE - BUCLE - BUCLE - BUCLE - BUCLE - BUCLE*/
	bucle: function(){
        if(Math.abs(zoomObj-zoom) > 0.01) {
            if(Math.floor(zoomObj*100)/100 > zoom) {
            zoom+=0.01;
            this.reescalarContainers();
            }
            else if(Math.floor(zoomObj*100)/100 < zoom) {
                zoom-=0.01;
                this.reescalarContainers();
            }
        }

        if(game.localPlayer)posicionRaton();
		if(this.localPlayer != undefined) this.enviarInfo();
	},
    /*BUCLE - BUCLE - BUCLE - BUCLE - BUCLE - BUCLE - BUCLE*/
    reescalar: function () {
        var widthR = window.innerWidth/modifOjos, heightR = window.innerHeight/modifOjos;
        console.log("wr: "+widthR+" hr: "+heightR+" mod: "+modifOjos)
        var resc = Math.max(Math.min(Math.max(widthR/w,heightR/h),3),maxZoom);
        app.renderer.resize(window.innerWidth, window.innerHeight);
        app.expRenderer.resize(window.innerWidth/2, Math.min(window.innerHeight/10),26);
        app.backrenderer.resize(window.innerWidth, window.innerHeight);

        app.background.width = Math.max(window.innerWidth,500);
        app.background.height = Math.max(window.innerHeight,300);
        zoomObj = resc;
        app.backrenderer.render(app.background);
        app.renderer.render(app.world);
        actualizarUi();
        actualizarExp();
    },
    reescalarContainers: function(){
        app.back.scale.set(zoom);
        app.world.scale.set(zoom);
        app.back.scale.set(zoom);
        app.borde.scale.set(zoom);
        actualizarUi();
    },
    calcularExpTotal(exp){
        var exp = exp.nodos+exp.ojos+exp.tentaculos+exp.size+exp.pinchos+exp.coraza;
        if(exp>((nivel+1)*100)){
            this.socket.emit('evo', game.localPlayer.id);
            expAntigua = 0;
        }
        return exp;
    },
    /*===================================================*/
    /*Eventos para enviar al server
    ====================================================*/
    enviarInfo: function(){
		var info = {};
		var t = {
			id: this.localPlayer.id,
            arriba: this.localPlayer.arriba,
            izquierda: this.localPlayer.izquierda,
            derecha: this.localPlayer.derecha,
		};
		info.player = t;
		this.socket.emit('sync', info);
	},
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
    /*===================================================================*/
    /*Debug
    =====================================================================*/
    debugInit: function(){
        this.gui = new dat.GUI();
        this.gui.add(this, 'mXtentaculos',0,10);
        this.gui.add(this, 'mYtentaculos',0,10);
        this.gui.add(this, 'vTentaculos',0,2);
        this.gui.add(this, 'movimiento');
        this.gui.add(game, 'evoZise');
        this.gui.add(game, 'evoPinchus');
        this.gui.add(game, 'evoTientaculos');
        this.gui.add(game, 'evoEie');
        this.gui.add(game, 'evoCorza');
        this.gui.add(game, 'evoNodos');
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
    /*====================================*/
    /*Colisión
    ====================================================*/
    cerca: function(){
		players.forEach(function(player) {
            if(player.id === game.localPlayer.id) {
                return true;
            }
            var encontrado = false;
            game.localPlayer.idsCercanas.forEach(function(idcercana){
                if(idcercana === player.id) encontrado = true;
            });
            if(!encontrado) {
                player.bicho.nodos.forEach(function(nodo){
                    app.world.removeChild(nodo.sprite);
                });
                players.splice(players.indexOf(player),1);
                return;
            }
            var hPlayer = game.localPlayer.bicho.hitbox;
            var hTarget = player.bicho.hitbox;

            try {
               if(hPlayer[2] >= hTarget[0] && hTarget[2] >= hPlayer[0]) {
                    if(hPlayer[3] >= hTarget[1] && hTarget[3] >= hPlayer[1]) {
                        game.localPlayer.bicho.chocar(player.bicho,this.socket,player.id,game.localPlayer.id);
                    }
                }
            } catch(err) {}
        });
	},
    colisionPlantas: function(){
		plantas.forEach(function(planta) {
            var hPlayer = game.localPlayer.bicho.hitbox;
            var hTarget = plantas[plantas.indexOf(planta)].hitbox;
            if(hPlayer[2] >= hTarget[0] && hTarget[2] >= hPlayer[0]) {
                if(hPlayer[3] >= hTarget[1] && hTarget[3] >= hPlayer[1]) {
                    game.localPlayer.bicho.chocarPlanta(planta, this.socket, plantas.indexOf(planta),game.localPlayer.id);
                }
            }
        });
	},
    /*===================================================*/
}
