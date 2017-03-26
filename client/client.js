var game;
var zoom = 1;
var socket = io.connect('http://127.0.0.1:8082');
function empezarJuego(){
    //Conectarse
    //Inicializar el juego
    game = new Game(socket);
    /*Eventos para enviarle al servidor
    ==========================================================================*/
    crearJugadorServer(socket);
    function crearJugadorServer(socket){
        socket.emit('crearJugadorServer', {nombre: nombre});
    }
    /*========================================================================*/
    /*Eventos para recibir del servidor
    ==========================================================================*/
    socket.on('crearPlayerCliente', function(player){
        var repetido = false;
        players.forEach(function(p){
            if(p.id === playerServer.id) repetido = true;
        });

        if(!repetido) {
            var t = new Player(player.id, this, player.local,player.nombre);
            if(player.local) init(player.plantas,player.plantasHitbox,t,player.width,player.height);
            players.push(t);
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
                //if(local) init(servPlantas,pHitbox,t);
                players.push(t);
            }
        });
    });
    socket.on('sync', function(serverInfo){//serverInfo[id "NUM", nodos "Array nodos min", Hitbox, exp]
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
        if(game.localPlayer.bicho.nodos[0]) {
            app.world.pivot.x = game.localPlayer.bicho.nodos[0].sprite.position.x - (window.innerWidth/2)/zoom
            app.world.pivot.y = game.localPlayer.bicho.nodos[0].sprite.position.y - (window.innerHeight/2)/zoom
            app.renderer.render(app.world);
        }
        /*==========================================================================*/
        expActual = serverInfo[serverInfo.length-1][3];
        nivel = serverInfo[serverInfo.length-1][4];
        actualizarExp();
    });
    socket.on('playerDesconectadoCliente', function(info){
        var num = 0;
        players.forEach(function(player) {
            if(player.id === info.id) players.splice(num,1);
            num++;
        });
    });
    socket.on('borrarPlantas', function(info){
        app.world.removeChild(plantasSprites[info.numPlanta][info.numNodo]);
        plantasSprites[info.numPlanta].splice(info.numNodo,1);
        plantas[info.numPlanta].splice(info.numNodo,1);
    });
    socket.on('actualizarPlanta', function(info){
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
    });
    socket.on('borrarNodo',function(info){
       var pl = null;
        players.forEach(function(player){
            if(player.id === info.idPlayer) {
                pl = player;
            }
        });
        var spriteBorrar = pl.bicho.nodos[info.numNodo].sprite;
        app.world.removeChild(spriteBorrar);
        pl.bicho.nodos.splice(info.numNodo,1);
    });
    /*========================================================================*/
}

$(document).ready(function(){
    var keyCodes = [61, 107, 173, 109, 187, 189];

    $(document).keydown(function(event) {
       if (event.ctrlKey==true && (keyCodes.indexOf(event.which) != -1)) {
        event.preventDefault();
        }
    });

    $(window).bind('mousewheel DOMMouseScroll', function (event) {
       if (event.ctrlKey == true) {
         event.preventDefault();
       }
    });
});
