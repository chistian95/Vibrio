var g = new PIXI.Graphics();
var BichoProto = function(){
    this.parsearNodo = function(nodoMin) {
        var pos = nodoMin[0];
        if(pos === undefined) return;
        if(this.nodos.length > pos) {
            var nodo = this.nodos[pos];
            if(nodo === undefined || nodo.sprite === undefined) return;
            nodo.sprite.position.x = nodoMin[1];
            nodo.sprite.position.y = nodoMin[2];
            nodo.tipoNodo = nodoMin[3];
            nodo.anguloActual = nodoMin[5]; //Solo al player local
            nodo.vida = nodoMin[6];
            if(nodo.radio != nodoMin[4]) {
                nodo.radio = nodoMin[4];
                if(nodo.sprite.mask) {
                    nodo.sprite.mask.width = nodoMin[4]*2;
                    nodo.sprite.mask.height = nodoMin[4]*2;
                    nodo.sprite.mask.x = nodoMin[4];
                    nodo.sprite.mask.y = nodoMin[4];
                } else {
                    nodo.sprite.width = nodoMin[4] * 2;
                    nodo.sprite.height = nodoMin[4] * 2;
                }
            }
        } else {
            var nodo = new Nodo(nodoMin[1], nodoMin[2], nodoMin[3], nodoMin[4], nodoMin[5],this.z);
            if(pos===0) {
                var texto = new PIXI.Text(this.nombre, {fontFamily:'Arial', fontSize:"20px", fill:"#1f27f2"});
                texto.anchor.set(0.5);
                nodo.sprite.addChild(texto);
            }
            this.nodos.push(nodo);
        }
    }

    this.chocar = function(target,socket,idTarget,idLocal) {
        var numNodoLocalPlayer = 0;
        var self = this;
        this.nodos.forEach(function(nodo) { //LocalPlayer
            if(nodo.tipoNodo.nombre === TipoNodo.PINCHO.nombre || nodo === self.nodos[0]) {
                var numNodoEnemigo = 0;
                var borrarNodos = [];
                target.nodos.forEach(function(nodoTarget) {
                    var distanciaX = nodo.sprite.position.x - nodoTarget.sprite.position.x;
                    var distanciaY = nodo.sprite.position.y - nodoTarget.sprite.position.y;
                    var sumaRadios = nodoTarget.radio + nodo.radio;
                    if(distanciaX * distanciaX + distanciaY * distanciaY <= sumaRadios * sumaRadios) {
                        if(nodo.tipoNodo.nombre === TipoNodo.PINCHO.nombre) {
                            socket.emit('chocar',{idAtacante: idLocal, numNodoAtacante: numNodoLocalPlayer, idAtacado: idTarget, numNodoAtacado: numNodoEnemigo});
                        } else {
                            socket.emit('comerBicho',{idAtacante: idLocal, numNodoAtacante: numNodoLocalPlayer, idAtacado: idTarget, numNodoAtacado: numNodoEnemigo});
                        }
                    }
                    numNodoEnemigo++;
                });
            }
            numNodoLocalPlayer++;
        });
    }

    this.chocarPlanta = function(target,socket,idTarget,idLocal) {
        var numNodoLocalPlayer = 0;
        var central = this.nodos[0];
        this.nodos.forEach(function(nodo) { //LocalPlayer
            if(central===nodo) {
                var numNodoEnemigo = 0;
                target.forEach(function(nodoTarget) {
                    var distanciaX = nodo.sprite.position.x - nodoTarget.x;
                    var distanciaY = nodo.sprite.position.y - nodoTarget.y;
                    var sumaRadios = nodoTarget.radio + nodo.radio;
                    if(distanciaX * distanciaX + distanciaY * distanciaY <= sumaRadios * sumaRadios) {
                        socket.emit('chocarPlanta',{idAtacante: idLocal, numNodoAtacante: numNodoLocalPlayer, idAtacado: idTarget, numNodoAtacado: numNodoEnemigo});
                    }
                    numNodoEnemigo++;
                });
            }
            numNodoLocalPlayer++;
        });
    }
}
var Bicho = function(z,nombre) {
    BichoProto.call(this);
    this.z = z;
    this.nodos = [];
    this.arriba = false;
    this.izquierda = false;
    this.derecha = false;
    this.nombre = nombre;
}
Bicho.prototype = Object.create(BichoProto.prototype);

var Nodo = function(x, y, tipoNodo, radio, anguloActual,z){
    if(tipoNodo.nombre === "TENTACULO"){ //Tentaculo
        this.tentaculines = [];
        for (var i = 0; i < 25; i++) {
            this.tentaculines.push(new PIXI.Point(i * lengthTentaculo, 0));
        }
        this.sprite = new PIXI.mesh.Rope(tentaculo, this.tentaculines);
        this.sprite.position.x = x;
        this.sprite.position.y = y;
        app.world.addChild(this.sprite);
    } else if(tipoNodo.nombre ==="OJO") {
        this.sprite = declararSpriteDesdeTextura(ojo,app.world,x,y,0.5,z,x,y);
    } else {
        this.sprite = generarDibujoCircular(radio,tipoNodo.color,true,0.7,z,x,y);
    }
    this.tipoNodo = tipoNodo;
    this.radio = radio;
    this.anguloActual = anguloActual;
    this.vida = 0;
}
var TipoNodo = function(nombre, color){
    this.nombre = nombre;
    this.color = color;
}
var TipoNodo = function(nombre, color){
    this.nombre = nombre;
    this.color = color;
}

TipoNodo.ESTATICO = new TipoNodo("ESTATICO", [0, 255, 0, 64]);
TipoNodo.MOTOR = new TipoNodo("MOTOR", [255, 0, 0, 64]);
TipoNodo.FLEXIBLE = new TipoNodo("FLEXIBLE", [0, 255, 255, 64]);
TipoNodo.PINCHO = new TipoNodo("PINCHO", [0, 0, 255, 100]);
TipoNodo.OJO = new TipoNodo("OJO", [255, 255, 0, 64]);
TipoNodo.BOCA = new TipoNodo("BOCA", [255, 100, 150, 25]);
TipoNodo.TENTACULO = new TipoNodo("TENTACULO", [0,0,0,64]);
TipoNodo.HIJOTENTACULO = new TipoNodo("HIJOTENTACULO", [0,0,0,64]);
