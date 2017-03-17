/*Abrir el server
=================================================================*/
var express = require('express');
var app = express();
var width = 2000;
var height = 2000;
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
        var playersTemp = [];
        players.forEach(function(player){
            playersTemp.push({id: player.id, local: false, nombre: player.nombre});
        });
        var plantasMin = [];
        plantas.forEach(function(planta){
            plantasMin.push(planta.crearNodosMin());
        });
        client.emit('crearPlayerCliente', { id: this.playerid, local: true,nombre: nombre,width:width,height:height, plantas: plantasMin, plantasHitbox: plantasHitbox,players: playersTemp});
        /*Enviar a todos los clientes "broadcast" la información del nuevo juegador*/
        client.broadcast.emit('crearPlayerCliente', {id: this.playerid, local: false,nombre: nombre})
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

    /*==================================================================================*/
    /*Chocar (entre players):
    /************************************************************************************
    /*Llamada:
        Se llama desde bicho.js del cliente cuando éste detecta colisión, esta
        función comprueba que la colisión realmente es válida para que los usuarios
        no puedan hacer exploitear el sistema ya sea por trucos o lag.
    /*Pasos:
        1.- Busca el player que tiene la id que envia el cliente en info
        2.- declara variables con cada nodo cocado de cada uno (del atacado y el atacante)
        3.- prepara variables para usarlas en el checkeo de distancia.
        4.- checkea distancia y si choca mata el nodo con la función matar nodos en bicho.js
            internamente esta función mata también todos los hijos de ese nodo.
    ====================================================================================*/
    client.on('chocar', function(info){
        var numPlayerAtacante = 0;
        var numPlayerAtacado = 0;
        var num = 0;
        //1.- Busca el player que tiene la id que envia el cliente en info
        players.forEach(function(playeros) {
            if(info.idAtacante == playeros.id) {
                numPlayerAtacante = num;
            } else if(info.idAtacado == playeros.id) {
                atacado = playeros.nombre;
                numPlayerAtacado = num;
            }
            num++;
        });
        //================================================================
        try {
            try {
                //2.- declara variables con cada nodo cocado de cada uno (del atacado y el atacante)
                var atacante = players[numPlayerAtacante].bicho.nodos[info.numNodoAtacante];
                var atacado = players[numPlayerAtacado].bicho.nodos[info.numNodoAtacado];
            } catch(err) {
                console.log("==============================================")
                console.log("Error al declarar el atacante y el atacado.")
            }
            //3.- prepara variables para usarlas en el checkeo de distancia.
            try {
                var distanciaX = atacante.x - atacado.x;
                var distanciaY = atacante.y - atacado.y;
             } catch(err) {
                 console.log("==============================================")
                 console.log("Error en xy");
             }
            try {
                var sumaRadios = atacado.radio +  atacante.radio;
            } catch(err) {
                console.log("==============================================")
                console.log("Error en radio");
            }
            /*4.- checkea distancia y si choca mata el nodo con la función matar nodos en bicho.js
              internamente esta función mata también todos los hijos de ese nodo.*/
            if(distanciaX * distanciaX + distanciaY * distanciaY <= sumaRadios * sumaRadios) {
                dañarNodo(players[numPlayerAtacante].bicho, atacado);
            }
        } catch(err) {console.log(err.message);}
    });

    /*===============================*/
    /*ChocarPlantas (entre plantas)
    =================================*/
    client.on('chocarPlanta', function(info){
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
                var player = players[numPlayer].bicho.nodos[info.numNodoAtacante];
                var planta = plantas[numPlanta].nodos[info.numNodoAtacado];
            } catch(err) {
                console.log("==================");
                console.log("Error al declarar el player o la planta.");
            }
            try {
                var distanciaX =player.x - planta.x;
                var distanciaY = player.y - planta.y;
             } catch(err) {
                 console.log("===================")
                 console.log("Error en xy");
             }
            try {
                var sumaRadios = planta.radio +  player.radio;
            } catch(err) {
                console.log("===================")
                console.log("Error en sumaRadios");
            }
            if(distanciaX * distanciaX + distanciaY * distanciaY <= sumaRadios * sumaRadios) {
                matarNodosPlanta(plantas[numPlanta], planta);
                io.sockets.emit('borrarPlantas', { numPlanta: numPlanta, numNodo: info.numNodoAtacado});
            }
        } catch(err) {console.log(err.message);}
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

/*===============================================================================================
/*Bucle nº1:
/************************************************************************************************
/*Función:
        Mueve todos los player.
        Envía a intérvalos la información a cada player de los otros player que tiene cerca.
/*Pasos:
        1.- Mueve los player.
        2.-
*/
setInterval(function(){
    //1.- Mueve los player.
    players.forEach( function(player){
        player.bicho.update();
    });
    var info = [];
    players.forEach(function(player) {
        if(player.nombre != 'bot') {
            player.idsCercanas.forEach(function(id) {
                players.forEach(function(playerCercano) {
                    if(playerCercano.id == id) info.push([playerCercano.id,playerCercano.bicho.crearNodosMin(),playerCercano.bicho.hitbox]);
                });
            });
            info.push([player.id,player.bicho.crearNodosMin(false),player.bicho.hitbox]);
            player.socket.emit('sync', info);
        }
    });
}, 20);

setInterval(function() {
    players.forEach(function(player) {
        player.bicho.calcularHitbox();
    });
}, 500);

setInterval(function() {
    regenerarMapa()
}, 5000);

setInterval(function() {
    actualizarPlayersCercanos();
}, 100);

function actualizarPlayersCercanos() {
    players.forEach(function(player) {
        if(player.nombre != 'bot') {
            player.idsCercanas = [];
            var hPlayer = player.bicho.hitbox;
            players.forEach(function(playerTarget) {
                if(player.id != playerTarget.id) {
                    var hTarget = playerTarget.bicho.hitbox;
                    if(hPlayer[2] >= hTarget[0]-500 && hTarget[2]+500 >= hPlayer[0]) {
                        if(hPlayer[3] >= hTarget[1]-300 && hTarget[3]+300 >= hPlayer[1]) {
                            player.idsCercanas.push(playerTarget.id);
                        }
                    }
                }
            });
        }
    });
}

function regenerarMapa() {
    plantas.forEach(function(planta){
        planta.regenerar(io,plantas.indexOf(planta));
        console.log(planta.hitbox)
    });
}


/* GENERAR PLANTAS - GENERAR PLANTAS - GENERAR PLANTAS - GENERAR PLANTAS */
function generarPlantas() {
    for(var i=0; i<30; i++) {
        var tipoPlanta = Math.round(Math.random() * 4);
        var x = Math.random()*(width-200)+100;
        var y = Math.random()*(width-200)+100;
        var planta = new p.Planta(x, y, tipoPlanta);
        var nodosPlanta = [];
        planta.nodos.forEach(function(nodo) {
            nodosPlanta.push(planta.crearNodoMin(nodo));
        });
        plantas.push(planta);
        plantasHitbox.push(planta.hitbox);
    }
}
generarPlantas();
for(var i=0;i<5;i++) {
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
