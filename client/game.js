var app;
textura = PIXI.Texture.fromImage('assets/img/t10.jpg');
tentaculo = PIXI.Texture.fromImage('assets/img/tentacle.png');
var players = [];
var playerReady = false;
var plantas = [];
var plantasSprites = [];
var plantasHitbox = [];
var numPlantas = 0;
var nivel = 0;
var expActual = null;
var expAntigua = null;
var ropeLength = 2;
var movimientoXtentaculos = 5;
var movimientoYtentaculos = 5;

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
    var count = 0;
	var g = this;
	setInterval(function(){
        count += 0.2;
		g.bucle();
        players.forEach(function(player){
            player.bicho.nodos.forEach(function(nodo){
                if(nodo.tipoNodo.nombre === "TENTACULO") {
                    if(!nodo.tentaculines || !nodo.tentaculines.length) return;
                    for (var i = 2; i <nodo.tentaculines.length; i++) {
                        nodo.tentaculines[i].y = Math.sin((i * 0.5) + count) * movimientoXtentaculos;
                        nodo.tentaculines[i].x = i * ropeLength + Math.cos((i * 0.3) + count) * movimientoYtentaculos;
                    }
                    player.bicho.nodos[player.bicho.nodos.indexOf(nodo)].sprite.rotation = player.bicho.nodos[player.bicho.nodos.indexOf(nodo)].anguloActual*Math.PI/180;
                }
            });
        });
	}, 40);
    setInterval(function() {
        if(game.localPlayer) {
            g.cerca();
            g.colisionPlantas();
            var exp = g.calcularExpTotal(expActual);
            if(exp !== expAntigua){
                expAntigua = exp;
            }
        }
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
    },

    calcularExpTotal(exp){
        var exp = exp.nodos+exp.ojos+exp.tentaculos+exp.size+exp.pinchos+exp.coraza;
        if(exp>((nivel+1)*100)){
            this.socket.emit('evo', game.localPlayer.id);
            expAntigua = 0;
        }
        return exp;
    },
    /*Eventos recibidos del server
    ======================================================*/
	crearPlayerCliente: function(id, local,nombrev, servPlantas, pHitbox){
        var repetido = false;
        players.forEach(function(p){
            if(p.id === id) repetido = true;
        });
        if(!repetido) {
            var t = new Player(id, this, local,nombrev);
            if(local) {
                this.localPlayer = t;
                var nodosSprites = [];
                var t1 = PIXI.Texture.fromImage('assets/img/t1.png');
                var t2 = PIXI.Texture.fromImage('assets/img/t1.png');
                var t3 = PIXI.Texture.fromImage('assets/img/t1.png');
                servPlantas.forEach(function(p) {
                    nodosSprites = [];
                    ndSprites = [];
                    p.forEach(function(nodoPlanta) {
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

                        ndSprites.push(sprite);

                        var datos = {
                            x: nodoPlanta[0],
                            y: nodoPlanta[1],
                            radio: nodoPlanta[4],
                        }
                        nodosSprites.push(datos);
                    });
                    plantas.push(nodosSprites);
                    plantas[plantas.length-1].tipo = p[0][3].tipo;
                    plantas[plantas.length-1].hitbox = pHitbox[plantas.length-1];
                    plantasSprites.push(ndSprites);
                });
            }
            players.push(t);
            if(players.length==1) this.debugInit();
            if(players.length>1) this.resetGui();
        }
	},

    recibirInfo: function(serverInfo){ //serverInfo[id "NUM", nodos "Array nodos min", Hitbox, exp]
        //Borramos players desconectados
        if(serverInfo[0].playersDesc != undefined){
            for(var i = 0; i < serverInfo[0].playersDesc.length; i++)
                for(var j=0;j < players.length;j++)
                    if(players[j].id === serverInfo[0].playersDesc[i].id) players.splice(j, 1);
        }
        //Por cada player recibido del servidor
        var numserver = 0;
        if(players.length>=1) {
            game.localPlayer.idsCercanas = [];
            serverInfo.forEach(function(serverPlayer){ //Cada player del server info[]
                game.localPlayer.idsCercanas.push(serverPlayer[0]);
                players.forEach(function(player){
                    if(player.id === serverPlayer[0]) {
                        player.bicho.hitbox = serverPlayer[2];
                        serverPlayer[1].forEach(function(nodo){
                            player.bicho.parsearNodo(nodo);
                        });
                    }
                });
            });
        }
        /*==========================================================================*/
        /* Pixi - Mover la cámara y pintarlo todo
        ============================================================================*/
        if(this.localPlayer.bicho.nodos[0]) {
            app.world.pivot.x = this.localPlayer.bicho.nodos[0].sprite.position.x - window.innerWidth/2
            app.world.pivot.y = this.localPlayer.bicho.nodos[0].sprite.position.y - window.innerHeight/2
            app.renderer.render(app.world);
        }
        /*==========================================================================*/
        expActual = serverInfo[serverInfo.length-1][3];
        nivel = serverInfo[serverInfo.length-1][4];
        actualizarExp();
        //console.log(serverInfo[serverInfo.length-1]);
	},

    /*===================================================*/
    /*PLANTAS A BORRAR
    ====================================================*/
    borrarPlantas: function(info){
        app.world.removeChild(plantasSprites[info.numPlanta][info.numNodo]);
        plantasSprites[info.numPlanta].splice(info.numNodo,1);
        plantas[info.numPlanta].splice(info.numNodo,1);
    },

    borrarNodos: function(info) {
        var pl = null;
        players.forEach(function(player){
            if(player.id === info.idPlayer) {
                pl = player;
            }
        });
        var spriteBorrar = pl.bicho.nodos[info.numNodo].sprite;
        app.world.removeChild(spriteBorrar);
        pl.bicho.nodos.splice(info.numNodo,1);

        //delete target.nodos[target.nodos.indexOf(nodo)];
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
        if(game.localPlayer)this.posicionRaton();
		if(this.localPlayer != undefined) this.enviarInfo();
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
            var relX = game.localPlayer.ratonX - game.localPlayer.bicho.nodos[0].sprite.position.x+app.world.pivot.x;
            var relY = game.localPlayer.ratonY - game.localPlayer.bicho.nodos[0].sprite.position.y+app.world.pivot.y;
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
            } catch(err) {} //*
        });
	},
    /*====================================*/
    /*Colision las plantas
    ====================================================*/
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
    actualizarPlanta: function(info) {
        var num = 0;
        info.nodos.forEach(function(nodoPlanta){
            app.world.removeChild(plantasSprites[info.id][num]);
            num++;
        });
        delete plantas[info.id];
        delete plantasSprites[info.id];

        var nodosSprites = [];
        var ndSprites = [];
        info.nodos.forEach(function(nodoPlanta){
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

            ndSprites.push(sprite);

            var datos = {
                x: nodoPlanta[0],
                y: nodoPlanta[1],
                radio: nodoPlanta[4],
            }
            nodosSprites.push(datos);
        });
        plantas[info.id] = nodosSprites;
        plantas[info.id].tipo = info.nodos[0][3].tipo;
        plantas[info.id].hitbox = info.hitbox;
        plantasSprites[info.id]=ndSprites;
    }
}

/*Constructor de los player
=======================================*/
function Player(id, game, local,nombrev){
    this.nombre = nombrev;
	this.id = id;
    this.ratonX = 0;
    this.ratonY = 0;
	this.local = local;
    if(local)this.idsCercanas = [];
    this.bicho = new Bicho(this.id,nombrev);
}

/*====================================================================================*/
/*Render - Pixi
======================================================================================*/
function app(){
    /*Declarar contenedores de imágenes
    =====================================*/
    this.world = new PIXI.Container();
    this.exp = new PIXI.Container();
    this.borde = new PIXI.Container();
    this.world.addChild(g);
    /*==================================*/
    /*Declarar renderer de imágenes
    =================================================================================================*/
    this.renderer = new PIXI.autoDetectRenderer(400, 50,null,false,true,false,true,1,false,true,false);
    this.expRenderer = new PIXI.autoDetectRenderer(800, 600,null,true,true,false,true,1,false,true,false);
    this.renderer.backgroundColor = 0x3498db;
    this.expRenderer.backgroundColor = 0x2c3e50;
    //Añadirlos al body para que se vean
    document.body.appendChild(this.renderer.view);
    /*===============================================================================================*/
    /*Preparar los renderer (Estilos)
    ==============================================================================*/
    this.renderer.resize(window.innerWidth, window.innerHeight);
    this.renderer.view.style.position = "absolute";
    this.renderer.view.style.display = "block";
    document.body.appendChild(this.expRenderer.view);
    this.expRenderer.resize(window.innerWidth/2, window.innerHeight/20);
    this.expRenderer.view.style.position = "absolute";
    this.expRenderer.view.style.display = "block";
    this.expRenderer.view.style.zIndex = 1;
    this.expRenderer.view.style.left = "25%";
    this.expRenderer.view.style.top = "90%";
    this.expRenderer.view.style.border = "5px solid black";
    this.expRenderer.view.style.borderRadius = "50px";

    this.expSprite = new PIXI.Graphics();
    this.exp.addChild(this.expSprite);
    this.expText = new PIXI.Text(expActual, {fontFamily:'Arial', fontSize:"50px", fill:"#1f27f2"});
    this.expText.position.x = window.innerWidth/4;
    this.expText.position.y = window.innerWidth/80;
    this.expText.anchor.set(0.5);
    this.expSprite.addChild(this.expText);
    this.expRenderer.render(this.exp);
}

function actualizarExp() {
    app.expSprite.clear();
    app.expSprite.lineStyle(0);
    app.expSprite.beginFill(0x16a085, 0.75);
    app.expSprite.drawRoundedRect(0, 0, (expAntigua/((nivel+1)*100))*window.innerWidth/2, window.innerHeight/20, 15);
    app.expSprite.endFill();
    app.expText.text = expAntigua+" / "+ ((nivel+1)*100);
    app.expRenderer.render(app.exp);
}
/*=============================================================s==============*/



