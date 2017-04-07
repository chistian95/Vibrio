var width = 0;
var height = 0;

var TipoNodo = function(nombre, color, vidaBase){
    this.nombre = nombre;
    this.color = color;
    this.vidaBase = vidaBase;
}

TipoNodo.ESTATICO = new TipoNodo("ESTATICO", [0, 255, 0, 64], 1.5);
TipoNodo.MOTOR = new TipoNodo("MOTOR", [255, 0, 0, 64], 1.5);
TipoNodo.FLEXIBLE = new TipoNodo("FLEXIBLE", [0, 255, 255, 64], 1.3);
TipoNodo.PINCHO = new TipoNodo("PINCHO", [0, 0, 255, 64], 1.6);
TipoNodo.OJO = new TipoNodo("OJO", [255, 255, 0, 64], 1);
TipoNodo.CORAZA = new TipoNodo("CORAZA", [145,145,145,64], 2);
TipoNodo.TENTACULO = new TipoNodo("TENTACULO", [0,0,0,64], 1);
TipoNodo.HIJOTENTACULO = new TipoNodo("HIJOTENTACULO", [0,0,0,64], 1);

var BichoProto = function(){
    this.update = function() {
        if(this.bufoVelocidad > 0) {
            this.bufoVelocidad -= 0.1;
        }
        if(this.nodoCentral.vida>0) {
            var anguloRad = this.nodoCentral.anguloActual * Math.PI / 180.0;
            var tempx = this.x;
            var tempy = this.y;
            this.calcularVelocidadMovimiento()
            if(this.arriba) {
                tempx -= Math.cos(anguloRad) * this.velocidadMovimiento;
                tempy -= Math.sin(anguloRad) * this.velocidadMovimiento;
            }
            if(this.abajo) {
                tempx += Math.cos(anguloRad) * this.velocidadMovimiento;
                tempy += Math.sin(anguloRad) * this.velocidadMovimiento;
            }
            if(tempx<0) tempx=0;
            else if(tempx>width) tempx=width;
            this.x = tempx;

            if(tempy<0) tempy=0;
            else if(tempy>height) tempy=height;
            this.y = tempy;

            var angulo = this.nodoCentral.anguloActual;
            if(this.izquierda) {
                angulo = angulo - this.velocidadGiro < 0 ? 360 : angulo - this.velocidadGiro;
            }
            if(this.derecha) {
                angulo = angulo + this.velocidadGiro > 360 ? 0 : angulo + this.velocidadGiro;
            }
            this.nodoCentral.anguloActual=angulo;
            this.nodoCentral.x = this.x
            this.nodoCentral.y = this.y
            mover(this, this.nodoCentral);
        }
    }

    this.bichoInicial = function(nodo){
        var cuerpo = null;
        if(nodo === 3){ //3=coraza
            cuerpo = new Nodo(TipoNodo.CORAZA, null, 0, 50, this);
        } else {
            cuerpo = new Nodo(TipoNodo.ESTATICO, null, 0, 50, this);
        }
        var ojo1 = new Nodo(TipoNodo.OJO, cuerpo, 120, 15, this);
        var ojo2 = new Nodo(TipoNodo.OJO, cuerpo, 240, 15, this);
        //var pincho = new Nodo(TipoNodo.PINCHO, cuerpo, 180, 7, this);
        if(nodo === 0){ //ojo
            new Nodo(TipoNodo.OJO, cuerpo, 180, 15, this);
        }else if(nodo === 1){ //1=pincho
            new Nodo(TipoNodo.PINCHO, cuerpo, 180, 7, this);
        }else if(nodo === 2){ //2=tentaculo
            var tamCentral = cuerpo.radio * 0.14;
            new Nodo(TipoNodo.TENTACULO, cuerpo, 0, tamCentral, this);
        }else if(nodo === 4){ //4=cuerpo
            new Nodo(TipoNodo.MOTOR, cuerpo, 0, 35, this);
        }
        this.nodoCentral = cuerpo;
    }

    var Nodo = function(tipoNodo, nodoPadre, anguloInicio, radio, bicho){
        this.x = 0;
        this.y = 0;
        this.anguloActual = 0;
        this.anguloGiro = 0;
        this.anguloBajar = 0;
        this.visible = false;
        this.tipoNodo = tipoNodo;
        this.nodoPadre = nodoPadre;
        this.anguloInicio = anguloInicio;
        this.radio = radio;
        this.vida = tipoNodo.vidaBase * radio;
        this.coraza = false;
        this.anguloTope = 7;
        this.nodos = [];
        if(this.nodoPadre !== null) {
            nodoPadre.nodos.push(this);
        }else{
            this.vida*=2;
        }
        this.visible = true;
        bicho.nodos.push(this);
    }

    this.crearNodoMin = function(posicion, nodo) {
        return [posicion, nodo.x, nodo.y, nodo.tipoNodo, nodo.radio, nodo.anguloActual];
    }

    this.crearNodosMin = function(log) {
        var temp = [];
        var nodos = this.nodos;
        this.nodos.forEach(function(nodo){
            temp.push([nodos.indexOf(nodo), nodo.x, nodo.y, nodo.tipoNodo, nodo.radio, nodo.anguloActual, nodo.vida]);
        });
        return temp;
    }

    this.calcularHitbox = function() {
        var xMin = this.nodoCentral.x;
        var xMax = this.nodoCentral.x;
        var yMin = this.nodoCentral.y;
        var yMax = this.nodoCentral.y;
        this.nodos.forEach(function(nodo) {
            if(nodo.x < xMin)
                xMin = nodo.x;
            if(nodo.x > xMax)
                xMax = nodo.x;
            if(nodo.y < yMin)
                yMin = nodo.y;
            if(nodo.y > yMax)
                yMax = nodo.y;
        });
        xMin = xMin - this.nodoCentral.radio * 2;
        yMin = yMin - this.nodoCentral.radio * 2;
        xMax = xMax + this.nodoCentral.radio * 2;
        yMax = yMax + this.nodoCentral.radio * 2;
        this.hitbox = [xMin, yMin, xMax, yMax];
    }

    this.calcularDaño = function() {
        var daño = 0;
        this.nodos.forEach(function(nodo) {
            if(nodo.tipoNodo === TipoNodo.PINCHO) {
                daño += 4;
            }
        });
        return daño;
    }

    this.evo = function() {
        //console.log("EVO");
        //console.log(this.exp);
        var self = this;
        var pesoTotal = 0;
        Object.keys(this.exp).forEach(function(clave) {
            pesoTotal += self.exp[clave];
        });
        for(var i = 0; i < this.nivel / 16; i++) {
            var numRandom = Math.random() * pesoTotal;
            var sumaPesos = 0;
            var tipoSeleccionado;
            Object.keys(this.exp).forEach(function(clave) {
                sumaPesos += self.exp[clave];
                if(numRandom <= sumaPesos && tipoSeleccionado == undefined) {
                    tipoSeleccionado = clave;
                }
            });
            //console.log(tipoSeleccionado);
            if(tipoSeleccionado == "size") { //Aumentar el radio de todos sus nodos
                this.nodos.forEach(function(nodo) {
                    var deltaRadio = nodo.radio * 0.05;
                    nodo.radio += deltaRadio;
                });
            } else if(tipoSeleccionado == "pinchos") { //Colocar uno o mas pinchos por ahí
                //Intentar colocar el pincho en la cabeza
                var nodosPinchos = [];
                var nodosAngulos = [];
                this.nodoCentral.nodos.forEach(function(nodo) {
                    if(nodo.vida > 0) {
                        if(nodo.tipoNodo === TipoNodo.PINCHO) {
                            nodosPinchos.push(nodo.anguloInicio);
                        }
                        nodosAngulos.push(nodo.anguloInicio);
                    }
                });
                var tamCentral = this.nodoCentral.radio * 0.14;

                if(!nodosAngulos.includes(180)) { //Si no tiene pinchos, poner uno en la parte delantera
                    new Nodo(TipoNodo.PINCHO, this.nodoCentral, 180, tamCentral, this);
                } else if(!nodosAngulos.includes(200) || !nodosPinchos.includes(160)) { //Comprobar si aún no tiene pinchos a los costados
                    if(!nodosAngulos.includes(200)) {
                        new Nodo(TipoNodo.PINCHO, this.nodoCentral, 200, tamCentral, this);
                    }
                    if(!nodosAngulos.includes(160)) {
                        new Nodo(TipoNodo.PINCHO, this.nodoCentral, 160, tamCentral, this);
                    }
                } else { //Si no, intentar colocarlo por la parte trasera del bicho
                    var saltar = false;
                    for(var posNodo=this.nodos.length-1; posNodo>=0; posNodo--) {
                        var nodo = this.nodos[posNodo];
                        if(nodo == this.nodoCentral || saltar) { //Saltarse el nodo central
                            continue;
                        }
                        var tamNodo = nodo.radio * 0.14;
                        if(nodo.tipoNodo === TipoNodo.ESTATICO || nodo.tipoNodo === TipoNodo.CORAZA || nodo.tipoNodo === TipoNodo.FLEXIBLE || nodo.tipoNodo === TipoNodo.MOTOR) { //Solo poner los pinchos si el nodo es estatico o coraza
                            var nodosPinchos = [];
                            var angulosHijos = [];
                            nodo.nodos.forEach(function(nodoHijo) {
                                if(nodoHijo.vida > 0) {
                                    if(nodoHijo.tipoNodo === TipoNodo.PINCHO) {
                                        nodosPinchos.push(nodoHijo.anguloInicio);
                                    }
                                    angulosHijos.push(nodoHijo.anguloInicio);
                                }
                            });
                            if(nodosPinchos.length <= 0) { //Si no tiene nada detrás intentar poner uno ahí
                                if(angulosHijos.length <= 0 || !angulosHijos.includes(0)) {
                                    new Nodo(TipoNodo.PINCHO, nodo, 0, tamNodo, this);
                                    saltar = true;
                                }
                            }
                            if(!angulosHijos.includes(270) || !angulosHijos.includes(90)) { //Mirar si se pueden poner a los costados
                                if(!angulosHijos.includes(270)) {
                                    new Nodo(TipoNodo.PINCHO, nodo, 270, tamNodo, this);
                                }
                                if(!angulosHijos.includes(90)) {
                                    new Nodo(TipoNodo.PINCHO, nodo, 90, tamNodo, this);
                                }
                                saltar = true;
                            }
                            //Si llega aquí significa que no ha podido poner pinchos, así que evaluará otro posible nodo
                        }
                    }
                }
            } else if(tipoSeleccionado == "tentaculos") { //Poner tentaculillos
                //console.log("Poner tentaculo");
                var angulosHijos = [];
                var nodosTentaculos = [];
                this.nodoCentral.nodos.forEach(function(nodo) {
                    if(nodo.vida > 0) {
                        angulosHijos.push(nodo.anguloInicio);
                        if(nodo.tipoNodo === TipoNodo.TENTACULO) {
                            nodosTentaculos.push(nodo.anguloInicio);
                        }
                    }
                });
                var tamCentral = this.nodoCentral.radio * 0.14;
                //Mirar a ver si hay que poner los tentaculos en la cabeza o no
                if(angulosHijos.length <= 0 || !angulosHijos.includes(0)) { //Si no tiene nodos hijos o no tiene ninguno detrás
                    new Nodo(TipoNodo.TENTACULO, this.nodoCentral, 0, tamCentral, this);
                } else { //Buscar algún nodo en el que poner los tentaculos
                    var saltar = false;
                    for(var posNodo=this.nodos.length-1; posNodo>=0; posNodo--) {
                        var nodo = this.nodos[posNodo];
                        if(nodo == this.nodoCentral || saltar) { //Saltarse el nodo central
                            continue;
                        }
                        var tamNodo = nodo.radio * 0.14;
                        if(nodo.tipoNodo === TipoNodo.ESTATICO || nodo.tipoNodo === TipoNodo.CORAZA || nodo.tipoNodo === TipoNodo.FLEXIBLE || nodo.tipoNodo === TipoNodo.MOTOR) { //Solo poner los tentaculos si el nodo es estatico o coraza
                            var nodosTentatuclos = [];
                            var angulosHijos = [];
                            nodo.nodos.forEach(function(nodoHijo) {
                                if(nodoHijo.vida > 0) {
                                    if(nodoHijo.tipoNodo === TipoNodo.TENTACULO) {
                                        nodosTentatuclos.push(nodoHijo.anguloInicio);
                                    }
                                    angulosHijos.push(nodoHijo.anguloInicio);
                                }
                            });
                            if(angulosHijos.length <= 0) { //Si no tiene nada detrás intentar poner uno ahí
                                if(angulosHijos.length <= 0 || !angulosHijos.includes(0)) {
                                    new Nodo(TipoNodo.TENTACULO, nodo, 0, tamNodo, this);
                                    saltar = true;
                                }
                            }
                            if(!angulosHijos.includes(270) || !angulosHijos.includes(90)) { //Mirar si se pueden poner a los costados
                                if(!angulosHijos.includes(270)) {
                                    new Nodo(TipoNodo.TENTACULO, nodo, 270, tamNodo, this);
                                }
                                if(!angulosHijos.includes(90)) {
                                    new Nodo(TipoNodo.TENTACULO, nodo, 90, tamNodo, this);
                                }
                                saltar = true;
                            }
                            //Si llega aquí significa que no ha podido poner tentaculos, así que evaluará otro posible nodo
                        }
                    }
                }
            } else if(tipoSeleccionado == "coraza") { //Poner corazas
                //Recorrerse todos los nodos y si son de tipo estático, cambiarlos a coraza
                var saltar = false;
                for(var posNodo = 0; posNodo < this.nodos.length; posNodo++) {
                    if(saltar) {
                        continue;
                    }
                    var nodo = this.nodos[posNodo];
                    if(nodo.tipoNodo === TipoNodo.ESTATICO && !nodo.coraza) {
                        nodo.tipoNodo = TipoNodo.CORAZA;
                        nodo.coraza = true;
                        saltar = true;
                    } else if(nodo.tipoNodo === TipoNodo.FLEXIBLE || nodo.tipoNodo == TipoNodo.MOTOR) {
                        if(nodo.tipoNodo === TipoNodo.FLEXIBLE) {
                            nodo.tipoNodo = TipoNodo.ESTATICO;
                        } else if(nodo.tipoNodo === TipoNodo.MOTOR) {
                            nodo.tipoNodo = TipoNodo.FLEXIBLE;
                        }
                        nodo.anguloActual = 0;
                        nodo.anguloGiro = 0;
                        nodo.anguloBajar = 0;
                        saltar = true;
                    }
                }
            } else if(tipoSeleccionado == "nodos") { //Poner nodos
                var angulos = [];
                var posicionesReales = [];
                var posicionReal = 0;
                this.nodoCentral.nodos.forEach(function(nodo) {
                    if(nodo.vida > 0) {
                        angulos.push(nodo.anguloInicio);
                        posicionesReales.push(posicionReal);
                    }
                    posicionReal++;
                });
                var tamCentral = this.nodoCentral.radio * 0.7;
                var posicion = angulos.lastIndexOf(0);
                if(posicion != -1) {
                    posicionReal = posicionesReales[posicion];
                    var nodoMover = this.nodoCentral.nodos[posicionReal];
                    //this.nodoCentral.nodos[posicionReal].tipoNodo = TipoNodo.FLEXIBLE;
                    new Nodo(TipoNodo.MOTOR, this.nodoCentral, 0, tamCentral, this);
                    var nodoNuevo = this.nodoCentral.nodos[this.nodoCentral.nodos.length - 1];
                    nodoNuevo.nodos.push(nodoMover);
                    nodoMover.nodoPadre = nodoNuevo;
                    if(nodoMover.tipoNodo.nombre != TipoNodo.TENTACULO.nombre) {
                        //console.log(nodoMover.tipoNodo);
                        nodoMover.tipoNodo = TipoNodo.FLEXIBLE;
                        nodoMover.anguloActual = 0;
                        nodoMover.anguloGiro = 0;
                        nodoMover.anguloBajar = 0;
                    }
                } else {
                    new Nodo(TipoNodo.MOTOR, this.nodoCentral, 0, tamCentral, this);
                }
            } else if(tipoSeleccionado == "ojos") { //Poner ojos
                //Los ojos solo van a poder ir en la cabeza. Dando prioridad a los que más cerca están del frente.
                var nodosOjos = [];
                this.nodoCentral.nodos.forEach(function(nodo) {
                    if(nodo.tipoNodo === TipoNodo.OJO && nodo.vida > 0) {
                        nodosOjos.push(nodo.anguloInicio);
                    }
                });
                var tamCentral = this.nodoCentral.radio * 0.3;
                if(!nodosOjos.includes(120) || !nodosOjos.includes(240)) {
                    if(!nodosOjos.includes(120)) {
                        new Nodo(TipoNodo.OJO, this.nodoCentral, 120, tamCentral, this);
                    }
                    if(!nodosOjos.includes(240)) {
                        new Nodo(TipoNodo.OJO, this.nodoCentral, 240, tamCentral, this);
                    }
                } else if(!nodosOjos.includes(100) || !nodosOjos.includes(260)) {
                    if(!nodosOjos.includes(100)) {
                        new Nodo(TipoNodo.OJO, this.nodoCentral, 100, tamCentral, this);
                    }
                    if(!nodosOjos.includes(260)) {
                        new Nodo(TipoNodo.OJO, this.nodoCentral, 260, tamCentral, this);
                    }
                } else if(!nodosOjos.includes(80) || !nodosOjos.includes(280)) {
                    if(!nodosOjos.includes(80)) {
                        new Nodo(TipoNodo.OJO, this.nodoCentral, 80, tamCentral, this);
                    }
                    if(!nodosOjos.includes(280)) {
                        new Nodo(TipoNodo.OJO, this.nodoCentral, 280, tamCentral, this);
                    }
                }
            }
        }
        this.nodos.forEach(function(nodo) {
            var deltaRadio = nodo.radio * 0.03;
            nodo.radio += deltaRadio;
        });
        this.lv++;
    }
    this.calcularVelocidadMovimiento = function() {
        this.velocidadMovimiento = 4.0;
        var self = this;
        this.nodos.forEach(function(nodo) {
            self.velocidadMovimiento -= nodo.radio * 0.0025;
            if(nodo.tipoNodo === TipoNodo.TENTACULO) {
                self.velocidadMovimiento += 0.3;
            }
        });
        if(this.bufoVelocidad > 0) {
            this.velocidadMovimiento += 4.0;
        }
        //this.velocidadMovimento = this.velocidadMovimiento + this.bufoVelocidad;
        //console.log("VELOCIDAD: " + this.velocidadMovimiento + ", BUFO: " + this.bufoVelocidad);
        this.velocidadGiro = this.velocidadMovimiento / 2.0;
    }
    this.usarHabilidad = function() {
        if(this.cooldownHabilidad <= 0) {
            this.cooldownHabilidad = 20;
            this.bufoVelocidad = 20.0;
        }
    }
}

var Bicho = function(x,y,w,h, nodoInicial) {
    BichoProto.call(this);
    width = w;
    height = h;
    this.x = x;
    this.y = y;
    this.lv = 1;
    this.velocidadGiro = 2.0;
    this.velocidadMotor = 0.6;
    this.velocidadMovimiento = 1.0;
    this.nodos = [];
    this.nodoCentral = null;
    this.arriba = false;
    this.abajo = false;
    this.izquierda = false;
    this.derecha = false;
    this.bichoInicial(nodoInicial);
    this.hitbox = [];
    this.cooldownHabilidad = 0;
    this.bufoVelocidad = 0;

    this.nivel = 0; /*La experiencia necesaria para subir de nivel es igual a (nivelASubir*100), es decir, para subir del nivel 1 al nivel 2 necesitas 200 de experiencia.*/
    this.exp = {
            //0=size, 1=pinchos, 2=tentaculos, 3=coraza, 4=nodos, 5=ojos
            size: 0,
            pinchos: 0,
            tentaculos: 0,
            coraza: 0,
            nodos: 0,
            ojos: 0
        }
}
Bicho.prototype = Object.create(BichoProto.prototype);

module.exports = {
    Bicho: Bicho,
    TipoNodo: TipoNodo,
};

function mover(bicho, nodo) { //No sé si está bien del todo*
    if(nodo === undefined || (nodo.nodoPadre === null && bicho.nodoCentral!==nodo)) {
        return;
    }
    if(nodo.tipoNodo === TipoNodo.MOTOR) {
        if(nodo.anguloBajar) {
            nodo.anguloGiro = nodo.anguloGiro - (bicho.velocidadMotor / 2) <= -nodo.anguloTope ? -nodo.anguloTope : nodo.anguloGiro - (bicho.velocidadMotor / 2);
            nodo.anguloBajar = nodo.anguloGiro > -nodo.anguloTope;
        } else {
            nodo.anguloGiro = nodo.anguloGiro + (bicho.velocidadMotor / 2) >= nodo.anguloTope ? nodo.anguloTope : nodo.anguloGiro + (bicho.velocidadMotor / 2);
            nodo.anguloBajar = nodo.anguloGiro >= nodo.anguloTope;
        }
    } else if(nodo.tipoNodo === TipoNodo.FLEXIBLE) {
        if(nodo.nodoPadre.anguloBajar) {
            nodo.anguloGiro = nodo.nodoPadre.anguloGiro - (bicho.velocidadMotor / 2);
        } else {
            nodo.anguloGiro = nodo.nodoPadre.anguloGiro + (bicho.velocidadMotor / 2);
        }
    }

    if(nodo.nodoPadre === null) {
        nodo.x = bicho.x;
        nodo.y = bicho.y;
    } else {
        var centroX = nodo.nodoPadre.x;
        var centroY = nodo.nodoPadre.y;
        nodo.anguloActual = nodo.nodoPadre.anguloActual + nodo.nodoPadre.anguloGiro + nodo.anguloInicio;
        var angulo = nodo.anguloActual * Math.PI / 180.0;
        var radioPadre = nodo.nodoPadre.radio;
        nodo.x = Math.cos(angulo) * radioPadre + centroX;
        nodo.y = Math.sin(angulo) * radioPadre + centroY;
    }

    nodo.nodos.forEach(function(nodoHijo) {
        mover(bicho, nodoHijo);
    });
}
