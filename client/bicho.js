var texturas = {
}

var Bicho = function(z,nombre) {
    this.z = z;
    this.nodos = [];
    this.arriba = false;
    this.izquierda = false;
    this.derecha = false;
    this.nombre = nombre;

    this.parsearNodo = function(nodoMin) {
        var pos = nodoMin[0];
        if(pos === undefined) return;
        if(this.nodos.length > pos) {
            var nodo = this.nodos[pos];
            nodo.sprite.position.x = nodoMin[1];
            nodo.sprite.position.y = nodoMin[2];
            //nodo.tipoNodo = nodoMin[3];
            //nodo.radio = nodoMin[4];
            nodo.anguloActual = nodoMin[5]; //Solo al player local
        } else {
            var nodo = new Nodo(nodoMin[1], nodoMin[2], nodoMin[3], nodoMin[4], nodoMin[5],this.z);
            if(pos===0) nodo.sprite.addChild(new PIXI.Text(this.nombre, {fontFamily:'Arial', fontSize:"20px", fill:"#c327b7"}));
            this.nodos.push(nodo);
        }
    }

    this.chocar = function(target,socket,idTarget,idLocal) {
        var numNodoLocalPlayer = 0;
        this.nodos.forEach(function(nodo) { //LocalPlayer
            if(nodo.tipoNodo.nombre === TipoNodo.PINCHO.nombre) {
                var numNodoEnemigo = 0;
                target.nodos.forEach(function(nodoTarget) {
                    var distanciaX = nodo.sprite.position.x - nodoTarget.sprite.position.x;
                    var distanciaY = nodo.sprite.position.y - nodoTarget.sprite.position.y;
                    var sumaRadios = nodoTarget.radio + nodo.radio;
                    if(distanciaX * distanciaX + distanciaY * distanciaY <= sumaRadios * sumaRadios) {
                        socket.emit('chocar',{idAtacante: idLocal, numNodoAtacante: numNodoLocalPlayer, idAtacado: idTarget, numNodoAtacado: numNodoEnemigo});
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
                        //console.log("PLANTA X: "+nodoTarget.x+"     PLANTA Y: "+nodoTarget.y);
                    }
                    numNodoEnemigo++;
                });
            }
            numNodoLocalPlayer++;
        });
    }
}

var Nodo = function(x, y, tipoNodo, radio, anguloActual,z){
    var graphics = new PIXI.Graphics();
    graphics.lineStyle(0);
    graphics.beginFill(rgb2hex('rgba(' + tipoNodo.color[0] + ', ' + tipoNodo.color[1] + ', ' + tipoNodo.color[2]), 0.5);
    graphics.drawCircle(radio, radio,radio);
    graphics.endFill();
    //this.sprite = new PIXI.Sprite(graphics.generateCanvasTexture());
    this.sprite = new PIXI.extras.TilingSprite(PIXI.Texture.fromImage(texturas[0]), radio*2,radio*2);
    this.sprite.anchor.set(0.5);
    this.sprite.interactive = true;
    this.sprite.zOrder =z;
    var mascara = new PIXI.Graphics();
    mascara.beginFill();
    mascara.drawCircle(0, 0, 300);
    mascara.endFill();
    mascara.lineStyle(0);
    this.sprite.mask = mascara;
    app.bichos.addChild(this.sprite);
    this.sprite.position.x = x;
    this.sprite.position.y = y;
    this.tipoNodo = tipoNodo;
    this.radio = radio;
    this.anguloActual = anguloActual;
}

var TipoNodo = function(nombre, color){
    this.nombre = nombre;
    this.color = color;
}

TipoNodo.ESTATICO = new TipoNodo("ESTATICO", [0, 255, 0, 64]);
TipoNodo.MOTOR = new TipoNodo("MOTOR", [255, 0, 0, 64]);
TipoNodo.FLEXIBLE = new TipoNodo("FLEXIBLE", [0, 255, 255, 64]);
TipoNodo.PINCHO = new TipoNodo("PINCHO", [0, 0, 255, 64]);
TipoNodo.OJO = new TipoNodo("OJO", [255, 255, 0, 64]);
TipoNodo.BOCA = new TipoNodo("BOCA", [255, 100, 150, 25]);

function rgb2hex(rgb){
 rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
 return (rgb && rgb.length === 4) ? "0x" +
  ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
  ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
  ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
}
