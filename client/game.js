/*Crear juego
=========================================================*/
function Game(socket){
    reiniciarVariables();
    app = new renderPixi();
    this.mXtentaculos = 3.3;
    this.mYtentaculos = 0;
    this.movimiento = true;
    this.playerToDebug = 0;
    this.NodoToDebug = 0;
    this.vTentaculos = .8;
    this.playerDebug = false;
    this.debugNodosLength = 0;
	this.socket = socket;
    var count = 0;

    if(!respawn) {
        window.addEventListener("keydown", teclitas, true);
        window.addEventListener("keyup", teclitasUp, true);
        window.addEventListener('mousemove', actualizarRaton, true);
        window.addEventListener('touchstart', actualizarTouch, true);
        window.addEventListener('touchmove', actualizarTouch, true);
        window.addEventListener('mousedown', usarHabilidad, true);
        window.addEventListener('touchstart', checkUsarHabilidad, true);
    }
    this.bucle0 = setInterval(function(){
        if(game.localPlayer && game.localPlayer.bicho.nodos[0]) {
            this.actuColas();
        }
    }.bind(this),10);
    setInterval(function(){
        //actualizarZ();
    },500);
    this.bucle1 = setInterval(function(){
        if(game.localPlayer && game.localPlayer.bicho.nodos[0]) {
            count += this.vTentaculos;
            this.bucle();
            modifOjosTemp = 0.4;
            players.forEach(function(player){
                player.bicho.nodos.forEach(function(nodo){
                    if(nodo.tipoNodo.nombre === "TENTACULO") {
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
        }
        app.backrenderer.render(app.back);
	}.bind(this), 40);
    this.bucle2 = setInterval(function() {
        if(game.localPlayer && game.localPlayer.bicho.hitbox) {
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

var timerHabilidad = 0;
function checkUsarHabilidad() {
    if(timerHabilidad == 0) {
        timerHabilidad = 1;
        timerHabilidad = setTimeout(function(){ timerHabilidad = 0 }, 600);
    } else {
        usarHabilidad();
    }
}

Game.prototype = {
    evoZise: function() {this.socket.emit('evole',{id:game.localPlayer.id,opc: "zise"});this.emitirEvoTrampa();},
    evoPinchus: function() {this.socket.emit('evole',{id:game.localPlayer.id,opc: "pinchus"});this.emitirEvoTrampa();},
    evoTientaculos: function() {this.socket.emit('evole',{id:game.localPlayer.id,opc: "tientaculos"});this.emitirEvoTrampa();},
    evoEie: function() {this.socket.emit('evole',{id:game.localPlayer.id,opc: "eie"});this.emitirEvoTrampa();},
    evoCorza: function() {this.socket.emit('evole',{id:game.localPlayer.id,opc: "corza"});this.emitirEvoTrampa();},
    evoNodos: function() {this.socket.emit('evole',{id:game.localPlayer.id,opc: "nodos"});this.emitirEvoTrampa();},
    meMato: function() {this.socket.emit('meMato',{id:game.localPlayer.id});},
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

    actuColas: function(){
        players.forEach(function(player){
            if(player.bicho.sprite) {
                player.bicho.actualizarSprite();
            }
        });
    },

    resetGui: function() {
        debug.gui.__controllers[1].__max = Math.round(players.length-1);
        debug.gui.__controllers[2].__max = players[Math.round(this.playerToDebug)].bicho.nodos.length-1;
        debug.playerToDebug = Math.min(this.playerToDebug,this.gui.__controllers[1].__max);
        debug.NodoToDebug = Math.min(this.NodoToDebug,this.gui.__controllers[2].__max);
        debug.playerToDebug = Math.round(this.playerToDebug);
        debug.NodoToDebug = Math.round(this.NodoToDebug);
        debug.gui.__controllers[2].updateDisplay();
        debug.gui.__controllers[1].updateDisplay();
    },

    /*BUCLE - BUCLE - BUCLE - BUCLE - BUCLE - BUCLE - BUCLE*/
    reescalar: function () {
        var widthR = window.innerWidth/modifOjos, heightR = window.innerHeight/modifOjos;
        var resc = Math.max(Math.min(Math.max(widthR/w,heightR/h),3),maxZoom);
        app.renderer.resize(window.innerWidth, window.innerHeight);
        app.expRenderer.resize(window.innerWidth/2, Math.min(window.innerHeight/10),26);
        app.backrenderer.resize(window.innerWidth, window.innerHeight);
        zoomObj = resc;
        app.backrenderer.render(app.background);
        app.renderer.render(app.world);
        game.localPlayer.socket.emit("updateBounds",{height: window.innerHeight/zoom, width: window.innerWidth/zoom,id: game.localPlayer.id});
        actualizarUi();
        actualizarExp();
    },
    reescalarContainers: function(){
        app.back.scale.set(zoom);
        app.world.scale.set(zoom);
        app.back.scale.set(zoom);
        app.borde.scale.set(zoom);
        actualizarUi();
        var h = window.innerHeight/zoom;
        var w = window.innerWidth/zoom;
        app.parallax1.width = w;
        app.parallax1.height = h;
        app.parallax2.width = w;
        app.parallax2.height = h;
        app.background.width = w;
        app.background.height = h;
    },
    calcularExpTotal(exp){
        if(exp){
            var exp = exp.nodos+exp.ojos+exp.tentaculos+exp.size+exp.pinchos+exp.coraza;
            if(exp>((nivel+1)*100)){
                this.socket.emit('evo', game.localPlayer.id);
                expAntigua = 0;
            }
        }
        return exp || -1;
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
    /*Colisión
    ====================================================*/
    cerca: function(){
		players.forEach(function(player) {
            if(player.id === game.localPlayer.id) {
                return true;
            }
            var encontrado = false;
            game.localPlayer.idsCercanas.forEach(function(idcercana){
                if(idcercana === player.id) {
                    encontrado = true;
                    console.log(idcercana+" encontrado.");
                }
            });
            if(!encontrado) {
                console.log("no encontrado")
                player.bicho.nodos.forEach(function(nodo){
                    app.world.removeChild(nodo.sprite);
                    nodo.sprite.destroy();
                });
                if(player.bicho.sprite)app.world.removeChild(player.bicho.sprite);
                if(player.bicho.sprite) {
					player.bicho.sprite.destroy(true,true,true);
				}
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
        var numNodo = false;
        var test = false;
        var plantasAcheckear = [];
        //console.log("=====================")
        //console.log(game.localPlayer.bicho.hitbox);
		plantas.forEach(function(planta) {
            test = false;
            var hPlayer = game.localPlayer.bicho.hitbox;
            var hTarget = plantas[plantas.indexOf(planta)].hitbox;
            //0: xMin,1: yMin,2: xMax,3: yMax
            //if(hPlayer[2] >= hTarget[0] && hTarget[2] >= hPlayer[0]) {
              // if(hPlayer[3] >= hTarget[1] && hTarget[3] >= hPlayer[1]) {
                    numNodos = game.localPlayer.bicho.chocarPlanta(planta, this.socket, plantas.indexOf(planta),game.localPlayer.id);
                    numNodos.forEach(function(numNodo){
                        plantasAcheckear.push([game.localPlayer.id, plantas.indexOf(planta),numNodo]);
                    });
                //}
            //}
        });
        if(plantasAcheckear.length >=1) socket.emit('chocarPlanta',plantasAcheckear);
	},
    /*===================================================*/

    pintarHitboxPlanta0: function(){
        if(plantas[1] && plantas[1].spr){
            app.world.removeChild(plantas[1].spr);
        }
        var graphics2 = new PIXI.Graphics();
        graphics2.lineStyle(1,0xff0000,1);
        graphics2.beginFill(0x555555, 0.1);
        graphics2.drawRect(0,0,plantas[1].hitbox[2]-plantas[1].hitbox[0],plantas[1].hitbox[3]-plantas[1].hitbox[1]);
        plantas[1].spr = new PIXI.Sprite(graphics2.generateCanvasTexture());
        plantas[1].spr.position.x = plantas[1].hitbox[0];
        plantas[1].spr.position.y = plantas[1].hitbox[1];
        app.world.addChild(plantas[1].spr);
        graphics2.endFill();
    }

}
