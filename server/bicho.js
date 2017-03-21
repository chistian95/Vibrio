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
        if(this.nodoCentral.vida>0) {
            var anguloRad = this.nodoCentral.anguloActual * Math.PI / 180.0;
            var tempx = this.x;
            var tempy = this.y;
            if(this.arriba) {
                tempx -= Math.cos(anguloRad) * 4;
                tempy -= Math.sin(anguloRad) * 4;
            }
            if(this.abajo) {
                tempx += Math.cos(anguloRad) * 4;
                tempy += Math.sin(anguloRad) * 4;
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

    this.evolucionar = function() {
        if(this.contFase === 0) {
            var cuerpo = new Nodo(TipoNodo.ESTATICO, null, 0, 50, this);
            var ojo1 = new Nodo(TipoNodo.OJO, cuerpo, 120, 15, this);
            var ojo2 = new Nodo(TipoNodo.OJO, cuerpo, 240, 15, this);

            var Tentaculo2 = new Nodo(TipoNodo.TENTACULO, cuerpo, 180, 7, this);


            this.nodoCentral = cuerpo;
        } else if(this.contFase === 1) {
            var cola1 = new Nodo(TipoNodo.MOTOR, this.nodoCentral, 0, 35, this);
            this.indexCola1 = (this.nodos.indexOf(cola1));
            var cola2 = new Nodo(TipoNodo.FLEXIBLE, cola1, 0, 25, this);
            var cola3 = new Nodo(TipoNodo.FLEXIBLE, cola2, 0, 20, this);
            var cola4 = new Nodo(TipoNodo.MOTOR, cola3, 0, 18, this); //Cola4
        }
        else if(this.contFase === 2) {
            var cola1 = this.nodos[this.indexCola1];
            cola1.tipoNodo = TipoNodo.ESTATICO;
            cola1.anguloActual = 0;
            cola1.anguloGiro = 0;

            var cola2 = this.nodos[this.indexCola1+1];
            cola2.tipoNodo = TipoNodo.ESTATICO;
            cola2.anguloActual = 0;
            cola2.anguloGiro = 0;

            var cola3 = this.nodos[this.indexCola1+2];
            cola3.tipoNodo = TipoNodo.ESTATICO;
            cola3.anguloActual = 0;
            cola3.anguloGiro = 0;

            var cola4 = this.nodos[this.indexCola1+3];
            new Nodo(TipoNodo.PINCHO, cola4, 30, 7, this); //Pincho1
            new Nodo(TipoNodo.PINCHO, cola4, -30, 7, this);//Pincho2

        }
        else if(this.contFase === 3) {
            new Nodo(TipoNodo.OJO, this.nodoCentral, 100, 15, this);//Ojo3
            new Nodo(TipoNodo.OJO, this.nodoCentral, 260, 15, this);//Ojo4
            new Nodo(TipoNodo.PINCHO, this.nodoCentral, 200, 7, this);//Pincho3
            new Nodo(TipoNodo.PINCHO, this.nodoCentral, 160, 7, this);//Pincho4
        }
        this.contFase++;
    }

    this.involucionar = function(faseInvolucion) {
        this.contFase = 0;
        var ang = this.nodoCentral.anguloActual;
        while(this.contFase<faseInvolucion) {
            this.evolucionar();
        }
        this.nodoCentral.anguloActual = ang;
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
        this.anguloTope = 15;
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
        console.log("DAÑO: " + daño);
        return daño;
    }
}

var Bicho = function(x,y,w,h) {
    BichoProto.call(this);
    width = w;
    height = h;
    this.x = x;
    this.y = y;
    this.velocidadGiro = 2.0;
    this.contFase = 0;
    this.nodos = [];
    this.nodoCentral = null;
    this.arriba = false;
    this.abajo = false;
    this.izquierda = false;
    this.derecha = false;
    this.evolucionar();
    this.hitbox = [];

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


/*======================================================================================*/
/*Funciones comunes entre nodos y bicho
========================================================================================*/
matarNodos = function(nodo){
    if(nodo === undefined){
        return;
    }
    if(nodo.vida <= 0){
        if(nodo.nodoPadre === null){
            //MATAR BICHO
        }else{
            nodo.nodoPadre = null;
        }
    }else{
        nodo.vida = 0;
    }
    nodo.nodos.forEach(function(nodoHijo) {
        matarNodos(nodoHijo);
    });
}

dañarNodo = function(bicho, nodo) {
    nodo.vida -= bicho.calcularDaño();
    if(nodo.vida <= 0) {
        matarNodos(nodo);
    }
}

mover = function(bicho, nodo) { //No sé si está bien del todo*
    if(nodo === undefined || (nodo.nodoPadre === null && bicho.nodoCentral!==nodo)) {
        return;
    }
    if(nodo.tipoNodo === TipoNodo.MOTOR) {
        if(nodo.anguloBajar) {
            nodo.anguloGiro = nodo.anguloGiro - (bicho.velocidadGiro / 2) <= -nodo.anguloTope ? -nodo.anguloTope : nodo.anguloGiro - (bicho.velocidadGiro / 2);
            nodo.anguloBajar = nodo.anguloGiro > -nodo.anguloTope;
        } else {
            nodo.anguloGiro = nodo.anguloGiro + (bicho.velocidadGiro / 2) >= nodo.anguloTope ? nodo.anguloTope : nodo.anguloGiro + (bicho.velocidadGiro / 2);
            nodo.anguloBajar = nodo.anguloGiro >= nodo.anguloTope;
        }
    } else if(nodo.tipoNodo === TipoNodo.FLEXIBLE) {
        if(nodo.nodoPadre.anguloBajar) {
            nodo.anguloGiro = nodo.nodoPadre.anguloGiro - (bicho.velocidadGiro / 2);
        } else {
            nodo.anguloGiro = nodo.nodoPadre.anguloGiro + (bicho.velocidadGiro / 2);
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
