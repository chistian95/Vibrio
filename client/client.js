var plantas,plantasSprites,plantasHitbox,numPlantas;
var respawn = false,respawn2 = false;
var game,socket;
var app,zoom,g,zoomObj,modifOjos;
var players, playerReady,nivel;
var lengthTentaculo;
var expActual,expAntigua;
var debug;

/*===========================================================*/
/*Constantes
============================================================*/
var sonidoEvolucion = new Audio('assets/snd/evolucion.wav');
sonidoEvolucion.loop = false;
var maxW = 1920,maxH = 1920;
var w = 1920,h=1080;
var maxZoom = 0.25;
var zPlantas = -500;
/*=========================================================*/

function empezarJuego(){
    if(debug && debug.gui) debug.gui.destroy(true,true,true)
    socket = null;
    socket = io.connect('http://127.0.0.1:8082');

    //Conectarse
    //Inicializar el juego
    g = new PIXI.Graphics();
    game = new Game(socket);

    function crearJugadorServer(socket){
        console.log("Creando player: "+nombre);
        console.log("NODO INICAL DESEADO: "+nodoInicial);
        socket.emit('crearJugadorServer', {nombre: nombre, nodoInicial: nodoInicial});
    }
    /*Eventos para enviarle al servidor
    ==========================================================================*/
    crearJugadorServer(socket);
    /*========================================================================*/
    /*Eventos para recibir del servidor
    ==========================================================================*/
    socket.on('crearPlayerCliente', function(player){
        var repetido = false;
        players.forEach(function(p){
            if(p.id === player.id) repetido = true;
        });

        if(!repetido) {
            var t = new Player(player.id, this, player.local,player.nombre);
            if(player.local) {
                console.log("Creando player local: "+player.nombre);
                init(player.plantas,player.plantasHitbox,t,player.width,player.height);
                players.push(t);
                debug = new debugo();
                if(!respawn) {
                    respawn = true;
                } else return;
            }
        }
    });
    socket.on('crearPlayersCliente', function(player){
        player.players.forEach(function(playerServer){
            var repetido = false;
            players.forEach(function(p){
                if(p.id === playerServer.id) repetido = true;
            });
            if(!repetido) {
                var t = new Player(playerServer.id, this, false,playerServer.nombre);
                players.push(t);
            }
        });
    });
    socket.on('sync', function(serverInfo){//serverInfo[id "NUM", nodos "Array nodos min", Hitbox, exp]
        if(game.localPlayer) {
            var initxy;
            if(game.localPlayer.bicho.nodos[0])initxy = [game.localPlayer.bicho.nodos[0].sprite.position.x,game.localPlayer.bicho.nodos[0].sprite.position.y];
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
                        player.bicho.actualizarSprite();
                    });
                });
            }
            /*==========================================================================*/
            /* Pixi - Mover la cámara y pintarlo todo
            ============================================================================*/
            if(game.localPlayer.bicho.nodos[0]) {
                app.world.pivot.x = game.localPlayer.bicho.nodos[0].sprite.position.x - (window.innerWidth/2)/zoom
                app.world.pivot.y = game.localPlayer.bicho.nodos[0].sprite.position.y - (window.innerHeight/2)/zoom
                app.renderer.render(app.world);

                if(initxy){
                    initxy[0] -= game.localPlayer.bicho.nodos[0].sprite.position.x;
                    initxy[1] -= game.localPlayer.bicho.nodos[0].sprite.position.y;
                    app.parallax1.tilePosition.x += initxy[0]*.5;
                    app.parallax1.tilePosition.y += initxy[1]*.5;
                    app.parallax2.tilePosition.x += initxy[0]*.8;
                    app.parallax2.tilePosition.y += initxy[1]*.8;
                }
            }
            /*==========================================================================*/
            expActual = serverInfo[serverInfo.length-1][3];
            nivel = serverInfo[serverInfo.length-1][4];
            actualizarExp();
        }
    });
    socket.on('playerDesconectadoCliente', function(info){
        var num = 0;
        players.forEach(function(player) {
            if(player.id === info.id) players.splice(num,1);
            num++;
        });
    });
    socket.on('borrarPlantas', function(info){
        if(plantasSprites && plantasSprites[info.numPlanta] && plantasSprites[info.numPlanta][info.numNodo]){
            app.world.removeChild(plantasSprites[info.numPlanta][info.numNodo]);
            plantasSprites[info.numPlanta].splice(info.numNodo,1);
            plantas[info.numPlanta].splice(info.numNodo,1);
        }
    });
    socket.on('actualizarPlanta', function(info){
        var num = 0;
        var cont = 0;
        info.nodos.forEach(function(nodoPlanta){
            app.world.removeChild(plantasSprites[info.id][num]);
            if(plantasSprites[info.id][num])plantasSprites[info.id][num].destroy();
            num++;
        });
        var nodosSprites = [];
        var ndSprites = [];
        var cont = 0;
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
            //sprite.zOrder = zPlantas+cont;
            app.world.addChild(sprite);

            ndSprites.push(sprite);

            var datos = {
                x: nodoPlanta[0],
                y: nodoPlanta[1],
                radio: nodoPlanta[4],
            }
            nodosSprites.push(datos);
            cont++;
        });
        plantas[info.id] = nodosSprites;
        plantas[info.id].tipo = info.nodos[0][3].tipo;
        plantas[info.id].hitbox = info.hitbox;
        plantasSprites[info.id]=ndSprites;
    });
    socket.on('borrarNodo',function(info){
       var pl = null;
        players.forEach(function(player){
            if(player.id === info.idPlayer) {
                pl = player;
            }
        });
        var spriteBorrar = pl.bicho.nodos[info.numNodo].sprite;
        console.log("borrando")
        app.world.removeChild(spriteBorrar);
        if(info.numNodo === 0){
            if(pl === game.localPlayer) gameOver();
        }
        var nodo = pl.bicho.nodos[info.numNodo];
        if(nodo.tipoNodo.nombre === "MOTOR" || nodo.tipoNodo.nombre === "ESTATICO" || nodo.tipoNodo.nombre === "FLEXIBLE" || nodo.tipoNodo.nombre === "CORAZA") {
            if(pl.bicho.cuerpo.indexOf(nodo)===0) {
                pl.bicho.cuerpo = [];
                pl.bicho.calcularSprite();
                return;
            }
            if(pl.bicho.cuerpo.indexOf(nodo)===1) {
                pl.bicho.cuerpo = [pl.bicho.cuerpo[0]];
                pl.bicho.calcularSprite();
                return;
            }
            for(var i = pl.bicho.cuerpo.indexOf(nodo)-1; i >= 1; i--) {
                console.log("borrado: "+pl.bicho.cuerpo.indexOf(nodo)+" actualidadRealidad: "+i)
                pl.bicho.cuerpo.splice(i,1);
            }
            pl.bicho.cuerpo.splice(pl.bicho.cuerpo.indexOf(nodo),1);
            pl.bicho.calcularSprite();
        }
        pl.bicho.nodos.splice(info.numNodo,1);

    });
    socket.on('evolucion', function(info){
        game.lv = info.lv;
        app.barraExp.children[0].text = game.lv;
    });
    /*========================================================================*/
}

function gameOver(){
    respawn = true;
    document.body.removeChild(app.backrenderer.view);
    document.body.removeChild(app.expRenderer.view);
    document.body.removeChild(app.renderer.view);
    menu.style.display = "block";
}

function reiniciarVariables(){
    if(game) {
        if(game.localPlayer)game.localPlayer = null;
        clearInterval(game.bucle1);
        clearInterval(game.bucle2);
    }
    app = null;
    players = [];
    playerReady = false;
    plantas = [];
    plantasSprites = [];
    plantasHitbox = [];
    numPlantas = 0;
    nivel = 0;
    lengthTentaculo = 2;
    expActual = null;
    expAntigua = null;
    zoomObj = 1;
    zoom = 1;
    modifOjos = 0
}


