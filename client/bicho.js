var xP = 0;
var BichoProto = function(){
    this.parsearNodo = function(nodoMin) {
        var pos = nodoMin[0];
        if(pos === undefined) return;
        if(this.nodos.length > pos) {
            var nodo = this.nodos[pos];
            if(nodo === undefined) return;
            if(!nodo.sprite){
                nodo = new Nodo(nodoMin[1], nodoMin[2], nodoMin[3], nodoMin[4], nodoMin[5],this.z,null,true);
            }
            nodo.sprite.position.x = nodoMin[1];
            nodo.sprite.position.y = nodoMin[2];
            nodo.tipoNodo = nodoMin[3];
            nodo.anguloActual = nodoMin[5]; //Solo al player local
            nodo.sprite.rotation = nodoMin[5]*0.0174533; //Solo al player local
            //nodo.vida = nodoMin[6];
            if(nodo.radio != nodoMin[4]) {
                nodo.radio = nodoMin[4];
                if(nodo.tipoNodo.nombre === "TENTACULO") {
                    nodo.sprite.width = nodoMin[4]*8;
                    nodo.sprite.height = nodoMin[4]*2;
                } else if(nodo.tipoNodo.nombre === "PINCHO") {
                    nodo.sprite.width = nodoMin[4]*8;
                    nodo.sprite.height = nodoMin[4]*2;
                } else {
                    nodo.sprite.width = nodoMin[4] * 2;
                    nodo.sprite.height = nodoMin[4] * 2;
                }
                if(this)this.calcularSprite();
            }
        } else {
            if(pos===0) {
                var nodo = new Nodo(nodoMin[1], nodoMin[2], nodoMin[3], nodoMin[4], nodoMin[5],this.z,null,true);
                var texto = new PIXI.Text(this.nombre, {fontFamily:'Arial', fontSize:"20px", fill:"#1f27f2"});
                texto.anchor.set(0.5);
                texto.rotation = Math.PI/2;
                nodo.sprite.addChild(texto);
            } else {
                var nodo = new Nodo(nodoMin[1], nodoMin[2], nodoMin[3], nodoMin[4], nodoMin[5],this.z);
                if(this === game.localPlayer.bicho){
                    sonidoEvolucion.play();
                }
            }
            this.nodos.push(nodo);
            if(nodo.tipoNodo.nombre === "MOTOR" || nodo.tipoNodo.nombre === "ESTATICO" || nodo.tipoNodo.nombre === "FLEXIBLE" || nodo.tipoNodo.nombre === "CORAZA") {
                if(this.cuerpo.length > 1) {
                    var ok = false;
                   for(var i = 0; i<=this.cuerpo.length-1;i++) {
                        if(nodoAnodo(this.cuerpo[i],nodo)) ok = true;
                   }
                   if(!ok) return;
                }
                this.cuerpo.push(nodo);
                xP+= nodo.radio;
                if(this)this.calcularSprite();
            } else if(nodo.tipoNodo.nombre === "OJO"){
                this.contOjos++;
            }
            //actualizarZ();
        }
    }

    this.calcularSprite = function(){
        if(this.cuerpo.lenght <= 1) {
            this.sprite.destroy(true,true,true);
            app.world.removeChild(this.sprite);
            this.spriteReady = false;
            return;
        }
        if(this.cuerpo && this.cuerpo[0] && this.cuerpo[0].sprite) {
            var gSpriteBichos = new PIXI.Graphics();
            var nodo = this.cuerpo[0];
            var ultimoNodo = null;
            var acumDif = 0;
            acumDif+= this.cuerpo[0].radio;
            if(this.cuerpo.length === 1) ultimoNodo = this.cuerpo[0];
            else {
                ultimoNodo = this.cuerpo[1];
            }
            var y = this.cuerpo[0].radio//this.cuerpo[0].sprite.position.y;
            var x = xP//this.cuerpo[0].sprite.position.x;
            gSpriteBichos.beginFill(0x24c191);
            gSpriteBichos.lineStyle(0);
            /*INICIO - CABEZA
            ===================================================================*/
            var coord = calcularPuntoEnCirculo(x,y,ultimoNodo.radio,0);
            var init = coord;
            if(coord)gSpriteBichos.moveTo(coord[0],coord[1]);
            else {
                return;
            }
            coord = calcularPuntoEnCirculo(x,y,ultimoNodo.radio,-Math.PI/2);
            gSpriteBichos.lineTo(coord[0],coord[1]); //Arco inicial
            /*===============================================================*/
            /*CUERPO LADO
            ================================================================*/
            for(i=1;i<this.cuerpo.length-1;i++){acumDif+= this.cuerpo[i].radio;}
            /*=============================================================*/
            /*FINAL - CUERPO: ÚLTIMO NODO
            ====================================================================*/
            coord = calcularPuntoEnCirculo(x-acumDif,y,this.cuerpo[0].radio,-Math.PI/2);
            gSpriteBichos.lineTo(coord[0],coord[1]);
            var inicioArco1 = coord;
            coord = calcularPuntoEnCirculo(x-acumDif,y,this.cuerpo[0].radio,(Math.PI+Math.PI/2));
            gSpriteBichos.lineTo(coord[0],coord[1]); //Arco
            var inicioArco2 = coord;
            coord = calcularPuntoEnCirculo(x-acumDif,y,this.cuerpo[0].radio,(Math.PI*1.5+Math.PI));
            gSpriteBichos.lineTo(coord[0],coord[1]); //Ultimo arco culo
            /*========================================================================*/
            //FIN - CABEZA
            //===========================================================================
            coord = calcularPuntoEnCirculo(x,y,ultimoNodo.radio,-Math.PI/2+Math.PI);
            gSpriteBichos.lineTo(coord[0],coord[1]); //Última recta
            gSpriteBichos.lineTo(init[0],init[1]); //Arco inicial
            gSpriteBichos.endFill();
            coord = calcularPuntoEnCirculo(init[0],init[1],ultimoNodo.radio,-Math.PI);
            gSpriteBichos.beginFill(0x24c191);
            gSpriteBichos.lineStyle(0);
            gSpriteBichos.drawCircle(coord[0],coord[1],ultimoNodo.radio)
            gSpriteBichos.endFill();
            var tempTentaculines = [];
            for (var i = 1; i <= this.cuerpo.length; i++) {
                tempTentaculines.push(new PIXI.Point(i*ultimoNodo.radio, 0));
            }
            this.cosas = tempTentaculines;
            this.texture = gSpriteBichos.generateCanvasTexture();
            //if(this.sprite) app.world.removeChild(this.sprite);
            if(!this.spriteReady) {
                this.sprite = new PIXI.mesh.Rope(this.texture,this.cosas);
                this.sprite.canvasPadding = 1;
                this.sprite.z = this.nodos[0].sprite.z-1;
                this.sprite.displayGroup = app.general;
                app.world.addChild(this.sprite);
                this.spriteReady = true;
            } else {
                this.sprite.points = this.cosas;
                this.sprite.texture = this.texture;
            }
            gSpriteBichos.destroy(true,true,true);
        } else {
            console.log("no hay sprite inicial.");
            console.log(this.cuerpo[0]);
        }
    }

    this.actualizarSprite = function(){
        if(this.cuerpo.length <=1) return;
        if(this.cuerpo && this.cuerpo[0] && this.cosas && this.cosas[0]){
            this.cuerpoOrdenado = [];
            this.cuerpoOrdenado[0] = this.cuerpo[0];
            var cont2 = this.cuerpo.length-1;
            for(var cont = 1;cont<=this.cuerpo.length-1;cont++){
                this.cuerpoOrdenado[cont] = this.cuerpo[cont2];
                cont2--;
            }
            var cosasTemp = this.cosas;
            for(var cont = 0;cont<=cosasTemp.length-2;cont++){
                cosasTemp[cont].x = this.cuerpoOrdenado[cont].sprite.position.x;
                cosasTemp[cont].y = this.cuerpoOrdenado[cont].sprite.position.y;
            };
            var coord = calcularPuntoEnCirculo(this.cuerpoOrdenado[this.cuerpoOrdenado.length-1].sprite.position.x,this.cuerpoOrdenado[this.cuerpoOrdenado.length-1].sprite.position.y,this.cuerpoOrdenado[this.cuerpoOrdenado.length-1].radio,this.cuerpoOrdenado[this.cuerpoOrdenado.length-1].anguloActual*0.0174533);
            cosasTemp[cosasTemp.length-1].x = coord[0];
            cosasTemp[cosasTemp.length-1].y = coord[1];
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
                    var dist = distanciaX * distanciaX + distanciaY * distanciaY;
                    if(distanciaX * distanciaX + distanciaY * distanciaY <= sumaRadios * sumaRadios) {
                        if(nodo.tipoNodo.nombre === TipoNodo.PINCHO.nombre) {
                            socket.emit('chocar',{idAtacante: idLocal, numNodoAtacante: numNodoLocalPlayer, idAtacado: idTarget, numNodoAtacado: numNodoEnemigo});
                        } else {
                            socket.emit('comerBicho',{idAtacante: idLocal, numNodoAtacante: numNodoLocalPlayer, idAtacado: idTarget, numNodoAtacado: numNodoEnemigo});
                            sonidoComer.play();
                        }
                    } else {
                        //console.log("Planta no choca dist: "+dist)
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
        var distancias = [];
        var numNodosEnemigo = [];
        this.nodos.forEach(function(nodo) { //LocalPlayer
            if(central===nodo) {
                target.forEach(function(nodoTarget) {
                    var distanciaX = nodo.sprite.position.x - nodoTarget.x;
                    var distanciaY = nodo.sprite.position.y - nodoTarget.y;
                    var sumaRadios = nodoTarget.radio + nodo.radio;
                    if(distanciaX * distanciaX + distanciaY * distanciaY <= sumaRadios * sumaRadios) {
                        //console.log("chocar planta: "+numNodoEnemigo)
                        numNodosEnemigo.push(target.indexOf(nodoTarget));
                        //sonidoComer.play();
                        return;
                    } else {
                        distancias.push((distanciaX * distanciaX + distanciaY * distanciaY),sumaRadios * sumaRadios);

                    }
                });
            }
            numNodoLocalPlayer++;
        });
        return numNodosEnemigo;
        //console.log("================")
        //console.log(distancias);
    }
}
var Bicho = function(z,nombre) {
    BichoProto.call(this);
    this.cuerpo = [];
    this.sprite = null;
    this.z = z;
    this.contOjos = 0;
    this.spriteReady = false;
    this.nodos = [];
    this.arriba = false;
    this.izquierda = false;
    this.derecha = false;
    this.nombre = nombre;
}
Bicho.prototype = Object.create(BichoProto.prototype);

var Nodo = function(x, y, tipoNodo, radio, anguloActual,z,anguloInicio,master){
    if(z)z*= 3;
    if(tipoNodo.nombre === "TENTACULO"){ //Tentaculo
        this.tentaculines = [];
        for (var i = 0; i < 25; i++) {
            this.tentaculines.push(new PIXI.Point(i * lengthTentaculo, 0));
        }
        this.sprite = new PIXI.mesh.Rope(tentaculo, this.tentaculines);
        this.sprite.position.x = x;
        this.sprite.position.y = y;
        this.sprite.z = z-2;
        this.sprite.width = radio*8;
        this.sprite.height = radio*2;
        app.world.addChild(this.sprite);
    } else if(tipoNodo.nombre ==="OJO") {
        this.sprite = declararSpriteDesdeTextura(ojo,app.world,x,y,0.5,z+1,x,y);
        this.sprite.width = radio*2;
        this.sprite.height = radio*2;
    } else if(tipoNodo.nombre ==="PINCHO"){
        //VITOR NECESITO QUE AQUI HAGAS QUE LOS PINCHOS SE VEAN UN POCO DESPLAZADOS A LA IZQUIERDA PARA QUE QUEDEN BIEN!!
        //Ok, ahora lo hago. :p mentira
        this.sprite = declararSpriteDesdeTextura(pincho,app.world,x,y,0.0,z-2,x,y);
        this.sprite.width = radio*8;
        this.sprite.height = radio*2;
    } else {
        this.sprite = generarDibujoCircular(radio,'rgba(36, 193, 145,1)',true,0.7,z,x,y);
    }
    this.tipoNodo = tipoNodo;
    this.radio = radio;
    this.anguloActual = anguloActual;
    this.vida = 0;
    this.sprite.displayGroup = app.general;
    //actualizarZ();
}
var TipoNodo = function(nombre, color){
    this.nombre = nombre;
    this.color = color;
}
var TipoNodo = function(nombre, color){
    this.nombre = nombre;
    this.color = color;
}

var sprite = function(x,y){
    this.position = {x: x, y: y};
}

TipoNodo.ESTATICO = new TipoNodo("ESTATICO", [0, 255, 0, 64]);
TipoNodo.MOTOR = new TipoNodo("MOTOR", [255, 0, 0, 64]);
TipoNodo.FLEXIBLE = new TipoNodo("FLEXIBLE", [0, 255, 255, 64]);
TipoNodo.PINCHO = new TipoNodo("PINCHO", [0, 0, 255, 100]);
TipoNodo.OJO = new TipoNodo("OJO", [255, 255, 0, 64]);
TipoNodo.BOCA = new TipoNodo("BOCA", [255, 100, 150, 25]);
TipoNodo.TENTACULO = new TipoNodo("TENTACULO", [0,0,0,64]);
TipoNodo.HIJOTENTACULO = new TipoNodo("HIJOTENTACULO", [0,0,0,64]);
