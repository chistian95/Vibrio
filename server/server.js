/*Abrir el server
=================================================================*/
var express = require('express');
var app = express();
var width = 10000;
var height = 10000;
app.use(express.static(__dirname));
var server = app.listen(process.env.PORT || 8082, function () {
	var puerto = server.address().port;
	console.log('Servidor abierto en el puerto %s', puerto);
});
var io = require('socket.io')(server);
/*==============================================================*/

var b = require('./bicho');
var Bicho = b.Bicho;
var p = require('./plantas');
var Planta = p.Planta;
var plantasMundo = [];
var plantasHitbox = [];
var plantas = [];

players = [];
ids = [];
//idPlantas = [];

for(var i=0;i<=1000;i++) ids[i]=false;
/* Nueva conexion
====================================================================================*/
io.on('connection', function(client) {
    console.log('Nueva conexión.');
    this.playerid;
    client.on('crearJugadorServer', function(player){
        var nombre = player.nombre;
        var initX = Math.random()*(width-200)+100;
        var initY = Math.random()*(height-200)+100;
        /*Crear al cliente su jugador*/
        this.playerid = 0;
        var id = false;
        while(!id) {
            if(ids[this.playerid]) {
                this.playerid++
            } else {
                ids[this.playerid] = true;
                id = true;
            }
        }
        console.log(nombre + ' se ha conectado Id: '+this.playerid);
        /*Enviarle al nuevo player los jugadores existentes.*/
        players.forEach(function(player){
            client.emit('crearPlayerCliente', {id: player.id, local: false, nombre: player.nombre});
        });
        client.emit('crearPlayerCliente', { id: this.playerid, local: true,nombre: nombre,width:width,height:height, plantas: plantasMundo, plantasHitbox: plantasHitbox});
        /*Enviar a todos los clientes "broadcast" la información del nuevo juegador*/
        client.broadcast.emit('crearPlayerCliente', { id: this.playerid, local: false,nombre: nombre})
        new Player(this.playerid,initX,initY,nombre,client);
    });
    /*Función para recibir información del cliente, en este caso la dirección si ha cambiado*/
    client.on('sync', function(info){
		if(info.player != undefined){
            /*Actualizar la dirección según lo que ha enviado el cliente*/
            players.forEach( function(player){
                if(player.id == info.player.id){
                    player.bicho.arriba = info.player.arriba;
                    player.bicho.izquierda = info.player.izquierda;
                    player.bicho.derecha = info.player.derecha;
                }
            });
		}
	});

    /*===============================*/
    /*Chocar (entre players)
    =================================*/
    client.on('chocar', function(info){
        var numPlayerAtacante = 0;
        var numPlayerAtacado = 0;
        var num = 0;
        players.forEach(function(playeros) {
            if(info.idAtacante == playeros.id) {
                numPlayerAtacante = num;
            } else if(info.idAtacado == playeros.id) {
                atacado = playeros.nombre;
                numPlayerAtacado = num;
            }
            num++;
        });
        try {
            try {
                var distanciaX = players[numPlayerAtacante].bicho.nodos[info.numNodoAtacante].x - players[numPlayerAtacado].bicho.nodos[info.numNodoAtacado].x;
                var distanciaY = players[numPlayerAtacante].bicho.nodos[info.numNodoAtacante].y - players[numPlayerAtacado].bicho.nodos[info.numNodoAtacado].y;
             } catch(err) {
                 console.log("Error en xy");
             }
            try {
                var sumaRadios = players[numPlayerAtacado].bicho.nodos[info.numNodoAtacado].radio +  players[numPlayerAtacante].bicho.nodos[info.numNodoAtacante].radio;
            } catch(err) {
                console.log("Error en radio");
            }
            if(distanciaX * distanciaX + distanciaY * distanciaY <= sumaRadios * sumaRadios) {
                matarNodos(players[numPlayerAtacado].bicho, players[numPlayerAtacado].bicho.nodos[info.numNodoAtacado]);
            }
        } catch(err) {
            console.log("=======================================")
            console.log("Error: "+players[numPlayerAtacante].bicho.nodos[info.numNodoAtacante]);
            console.log("Error: "+players[numPlayerAtacado].bicho.nodos[info.numNodoAtacado]);
            console.log("Error: "+players[numPlayerAtacante].bicho.nodos[info.numNodoAtacante].radio);
            console.log("Error: "+players[numPlayerAtacado].bicho.nodos[info.numNodoAtacado].radio);
            console.log(players[numPlayerAtacante].bicho.nodos[info.numNodoAtacante].x+" "+players[numPlayerAtacado].bicho.nodos[info.numNodoAtacado].x)
            console.log(players[numPlayerAtacante].bicho.nodos[info.numNodoAtacante].y+" "+players[numPlayerAtacado].bicho.nodos[info.numNodoAtacado].y)
            console.log("=======================================")
        }
    });

    /*===============================*/
    /*ChocarPlantas (entre plantas)
    =================================*/
    client.on('chocarPlanta', function(info){
        var atacante = "Null";
        var numPlayer = 0;
        var numPlanta = info.idAtacado;
        var num = 0;
        players.forEach(function(player) {
            if(info.idAtacante == player.id) {
                atacante = player.nombre;
                numPlayer = num;
                //break;
            }
            num++;
        });

        try {
            try {
                var distanciaX = players[numPlayer].bicho.nodos[info.numNodoAtacante].x - plantas[numPlanta].nodos[info.numNodoAtacado].x;
                var distanciaY = players[numPlayer].bicho.nodos[info.numNodoAtacante].y - plantas[numPlanta].nodos[info.numNodoAtacado].y;
                //console.log("DISTANCIA X: "+distanciaX +" ========== XPLAYER: "+players[numPlayer].bicho.nodos[info.numNodoAtacante].x+ " XPLANTAS: "+plantas[numPlanta].nodos[info.numNodoAtacado].x);
                //console.log("DISTANCIA Y: "+distanciaY +" ========== YPLAYER: "+players[numPlayer].bicho.nodos[info.numNodoAtacante].y+ " YPLANTAS: "+plantas[numPlanta].nodos[info.numNodoAtacado].y);
             } catch(err) {
                 console.log("Error en xy");
             }
            try {
                var sumaRadios = plantas[numPlanta].nodos[info.numNodoAtacado].radio +  players[numPlayer].bicho.nodos[info.numNodoAtacante].radio;
            } catch(err) {
                console.log("Error en radio");
            }
            if(distanciaX * distanciaX + distanciaY * distanciaY <= sumaRadios * sumaRadios) {
                matarNodosPlanta(plantas[numPlanta], plantas[numPlanta].nodos[info.numNodoAtacado]);
                plantasMundo[numPlanta].splice(info.numNodoAtacado, 1);
                client.emit('borrarPlantas', { numPlanta: numPlanta, numNodo: info.numNodoAtacado});
                client.broadcast.emit('borrarPlantas', { numPlanta: numPlanta, numNodo: info.numNodoAtacado})
            }
        } catch(err) {
            console.log("=======================================")
            console.log("Error: "+players[numPlayer].bicho.nodos[info.numNodoAtacante]);
            console.log("Error: "+players[numPlanta].bicho.nodos[info.numNodoAtacado]);
            console.log("Error: "+players[numPlayer].bicho.nodos[info.numNodoAtacante].radio);
            console.log("Error: "+players[numPlanta].bicho.nodos[info.numNodoAtacado].radio);
            console.log(players[numPlayer].bicho.nodos[info.numNodoAtacante].x+" "+planta[numPlanta].nodos[info.numNodoAtacado].x)
            console.log(players[numPlayer].bicho.nodos[info.numNodoAtacante].y+" "+planta[numPlanta].nodos[info.numNodoAtacado].y)
            console.log("=======================================")
        }
    });

    /*Al desconecarse el cliente*/
    client.on('disconnect', function(){
        for(var i=0;i<players.length;i++){
            if(players[i].id === this.playerid){
                console.log(players[i].nombre+" desconectado.")
                client.broadcast.emit("playerDesconectadoCliente",{id: players[i].id})
                players.splice(i, 1);
            }
        }
    });

    /*Al evolucionar*/
    client.on('evolucionar', function(info) {
        if(info.player != undefined){
            /*Actualizar la dirección según lo que ha enviado el cliente*/
            players.forEach( function(player){
                if(player.id == info.player.id){
                    player.bicho.evolucionar();
                }
            });
		}
    });
    /*Al involucionar*/
    client.on('involucionar', function(info) {
        if(info.player != undefined){
            /*Actualizar la dirección según lo que ha enviado el cliente*/
            players.forEach( function(player){
                if(player.id == info.player.id){
                    if(player.bicho.contFase>=1) {
                        var ang = player.bicho.nodoCentral.anguloActual;
                        player.bicho.nodos = [];
                        player.bicho.involucionar(player.bicho.contFase-1,ang);
                    }
                }
            });
		}
    });
});
/*==============================================================================*/
/*Coger la información para mandarsela al cliente
==================================================*/
function getInfo(){
    var info = []
    info[0] = [];
    for(i=0;i<players.length;i++) info[0][i] = [];
    var num = 0;
    players.forEach( function(player){
        var num2 = 0;
        info[0][num][0] = [];
        player.bicho.nodos.forEach( function(nodo){
            info[0][num][0].push(player.bicho.crearNodoMin(num2, nodo));
            num2++;
        });
        info[0][num][1] = player.bicho.hitbox;
        num++;
    });
    return info;
}
/*================================================*/
/*Constructor de los player
==================================================*/

function Player(id, x, y,nombre,socket){
    this.nombre = nombre;
	this.id = id;
    this.socket = socket;
    this.bicho = new Bicho(x,y,width,height);
    players.push(this);
    //===========================================
    var hPlayer = this.bicho.hitbox;
    var idsTemp = [];
    players.forEach(function(player) {
        if(player.id === id) return;
        var hTarget = player.bicho.hitbox;
        if(hPlayer[2] >= hTarget[0] && hTarget[2] >= hPlayer[0]) {
            if(hPlayer[3] >= hTarget[1] && hTarget[3] >= hPlayer[1]) {
                idsTemp.push(player.id);
            }
        }
    });
    this.idsCercanas = idsTemp;
}
/*BUCLE - BUCLE - BUCLE - BUCLE - BUCLE - BUCLE - BUCLE*/
setInterval(function(){
    moverPlayers();
    var info = [];
    var clients = io.sockets.clients(); // This returns an array with all connected clients
    /*Enviarle a todos los clientes el arraylist de players y de playersDesconectadosd (y mas cosas, pero por ahora solo eso)*/
    players.forEach(function(player) {
        if(player.nombre === 'bot') return;
        player.idsCercanas = calcularCercanos(player.bicho.hitbox,player.id);
        player.idsCercanas.forEach(function(id) {
            players.forEach(function(playerCercano) {
                if(playerCercano.id == id) info.push([playerCercano.id,playerCercano.bicho.crearNodosMin(),playerCercano.bicho.hitbox]);
            });
        });
        info.push([player.id,player.bicho.crearNodosMin(),player.bicho.hitbox]);
        player.socket.emit('sync', info);
    });

    //io.sockets.emit('sync', getInfo());
}, 20);

function calcularCercanos(hitbox,id) {
    var idsTemp = [];
    var hPlayer = hitbox;
    players.forEach(function(player) {
        if(player.id === id) return;
        var hTarget = player.bicho.hitbox;
        if(hPlayer[2] >= hTarget[0]-400 && hTarget[2]+400 >= hPlayer[0]) {
            if(hPlayer[3] >= hTarget[1]-200 && hTarget[3]+200 >= hPlayer[1]) {
                idsTemp.push(player.id);
            }
        }
    });
    return idsTemp;
}
function moverPlayers() {
    players.forEach( function(player){
        player.bicho.update();
    });
}
setInterval(function() {
    calcularHitbox();
    regenerarMapa();
}, 500);
function calcularHitbox() {
    players.forEach(function(player) {
        player.bicho.calcularHitbox();
    });
}
function regenerarMapa() {

}
/*BUCLE - BUCLE - BUCLE - BUCLE - BUCLE - BUCLE - BUCLE*/
/* GENERAR PLANTAS - GENERAR PLANTAS - GENERAR PLANTAS - GENERAR PLANTAS */
function generarPlantas() {
    for(var i=0; i<100; i++) {
        var tipoPlanta = Math.round(Math.random() * 4);
        var x = Math.random()*(width-200)+100;
        var y = Math.random()*(width-200)+100;
        var planta = new p.Planta(x, y, tipoPlanta);
        var nodosPlanta = [];
        planta.nodos.forEach(function(nodo) {
            nodosPlanta.push(planta.crearNodoMin(nodo));
        });
        plantas.push(planta);
        plantasMundo.push(nodosPlanta);
        plantasHitbox.push(planta.hitbox);
    }
}
generarPlantas();
for(var i=0;i<100;i++) {
    var p = new Player(i,Math.random()*width,Math.random()*height,"bot");
    var derechizqr = Math.round(Math.random()*1);
    if(derechizqr==0)p.bicho.derecha = true;
    else p.bicho.izquierda = true;
    var arribabajo = Math.round(Math.random()*1);
    if(arribabajo==0)p.bicho.arriba = true;
    else p.bicho.atras = true;
    var evolucion = Math.round(Math.random()*3);
    if(evolucion!=0) for(var x=evolucion;x>0;x--) p.bicho.evolucionar();
    ids[i] = true;
}
/* GENERAR PLANTAS - GENERAR PLANTAS - GENERAR PLANTAS - GENERAR PLANTAS */
