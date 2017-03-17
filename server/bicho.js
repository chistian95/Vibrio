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

var BichoProto = function(){
    this.update = function() {
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

    this.evolucionar = function() {
        if(this.contFase === 0) {
            var cuerpo = new Nodo(TipoNodo.ESTATICO, null, 0, 50, this);
            var ojo1 = new Nodo(TipoNodo.OJO, cuerpo, 120, 15, this);
            var ojo2 = new Nodo(TipoNodo.OJO, cuerpo, 240, 15, this);
            this.nodoCentral = cuerpo;
        } else if(this.contFase === 1) {
            var cola1 = new Nodo(TipoNodo.MOTOR, this.nodoCentral, 0, 35, this);
            var cola2 = new Nodo(TipoNodo.FLEXIBLE, this.nodos[3], 0, 25, this);
            var cola3 = new Nodo(TipoNodo.FLEXIBLE, cola2, 0, 20, this);
            var cola4 = new Nodo(TipoNodo.MOTOR, cola3, 0, 18, this); //Cola4
        }
        else if(this.contFase === 2) {
            var cola1 = this.nodos[3];
            cola1.tipoNodo = TipoNodo.ESTATICO;
            cola1.anguloActual = 0;
            cola1.anguloGiro = 0;

            var cola2 = this.nodos[4];
            cola2.tipoNodo = TipoNodo.ESTATICO;
            cola2.anguloActual = 0;
            cola2.anguloGiro = 0;

            var cola3 = this.nodos[5];
            cola3.tipoNodo = TipoNodo.ESTATICO;
            cola3.anguloActual = 0;
            cola3.anguloGiro = 0;

            var cola4 = this.nodos[6];
            new Nodo(TipoNodo.PINCHO, cola4, 30, 7, this); //Pincho1
            new Nodo(TipoNodo.PINCHO, cola4, -30, 7, this);//Pincho2

            var pataIzq1 = new Nodo(TipoNodo.MOTOR, cola1, 90, 7, this);

            var pataDrc1 = new Nodo(TipoNodo.MOTOR, cola1, -90, 7, this);
            new Nodo(TipoNodo.FLEXIBLE, pataIzq1, 0, 7, this);
            new Nodo(TipoNodo.FLEXIBLE, pataDrc1, 0, 7, this);

            var pataIzq2 = new Nodo(TipoNodo.MOTOR, cola2, 90, 7, this);
            var pataDrc2 = new Nodo(TipoNodo.MOTOR, cola2, -90, 7, this);
            new Nodo(TipoNodo.FLEXIBLE, pataIzq2, 0, 7, this);
            new Nodo(TipoNodo.FLEXIBLE, pataDrc2, 0, 7, this);

            var pataIzq3 = new Nodo(TipoNodo.MOTOR, cola3, 90, 7, this);
            var pataDrc3 = new Nodo(TipoNodo.MOTOR, cola3, -90, 7, this);
            new Nodo(TipoNodo.FLEXIBLE, pataIzq3, 0, 7, this);
            new Nodo(TipoNodo.FLEXIBLE, pataDrc3, 0, 7, this);
        }
        else if(this.contFase === 3) {
            new Nodo(TipoNodo.OJO, this.nodoCentral, 100, 15, this);//Ojo3
            new Nodo(TipoNodo.OJO, this.nodoCentral, 260, 15, this);//Ojo4
            new Nodo(TipoNodo.PINCHO, this.nodoCentral, 200, 7, this);//Pincho3
            new Nodo(TipoNodo.PINCHO, this.nodoCentral, 160, 7, this);//Pincho4

            var pataIzq1_1 = this.nodos[11];
            var pataDrc1_1 = this.nodos[12];
            pataIzq1_1.tipoNodo = TipoNodo.ESTATICO;
            pataIzq1_1.anguloActual = 0;
            pataIzq1_1.anguloGiro = 0;
            pataDrc1_1.tipoNodo = TipoNodo.ESTATICO;
            pataDrc1_1.anguloActual = 0;
            pataDrc1_1.anguloGiro = 0;

            var pataIzq2_1 = this.nodos[15];
            var pataDrc2_1 = this.nodos[16];
            pataIzq2_1.tipoNodo = TipoNodo.ESTATICO;
            pataIzq2_1.anguloActual = 0;
            pataIzq2_1.anguloGiro = 0;
            pataDrc2_1.tipoNodo = TipoNodo.ESTATICO;
            pataDrc2_1.anguloActual = 0;
            pataDrc2_1.anguloGiro = 0;

            var pataIzq3_1 = this.nodos[19];
            var pataDrc3_1 = this.nodos[20];
            pataIzq3_1.tipoNodo = TipoNodo.ESTATICO;
            pataIzq3_1.anguloActual = 0;
            pataIzq3_1.anguloGiro = 0;
            pataDrc3_1.tipoNodo = TipoNodo.ESTATICO;
            pataDrc3_1.anguloActual = 0;
            pataDrc3_1.anguloGiro = 0;

            var pataIzq1_2 = new Nodo(TipoNodo.FLEXIBLE, pataIzq1_1, 0, 7, this);
            var pataIzq1_3 = new Nodo(TipoNodo.MOTOR, pataIzq1_2, 0, 7, this);
            var pataIzq1_4 = new Nodo(TipoNodo.FLEXIBLE, pataIzq1_3, 0, 7, this);
            new Nodo(TipoNodo.ESTATICO, pataIzq1_4, 0, 7, this);
            var pataDrc1_2 = new Nodo(TipoNodo.FLEXIBLE, pataDrc1_1, 0, 7, this);
            var pataDrc1_3 = new Nodo(TipoNodo.MOTOR, pataDrc1_2, 0, 7, this);
            var pataDrc1_4 = new Nodo(TipoNodo.FLEXIBLE, pataDrc1_3, 0, 7, this);
            new Nodo(TipoNodo.ESTATICO, pataDrc1_4, 0, 7, this);

            var pataIzq2_2 = new Nodo(TipoNodo.FLEXIBLE, pataIzq2_1, 0, 7, this);
            var pataIzq2_3 = new Nodo(TipoNodo.MOTOR, pataIzq2_2, 0, 7, this);
            var pataIzq2_4 = new Nodo(TipoNodo.FLEXIBLE, pataIzq2_3, 0, 7, this);
            new Nodo(TipoNodo.ESTATICO, pataIzq2_4, 0, 7, this);
            var pataDrc2_2 = new Nodo(TipoNodo.FLEXIBLE, pataDrc2_1, 0, 7, this);
            var pataDrc2_3 = new Nodo(TipoNodo.MOTOR, pataDrc2_2, 0, 7, this);
            var pataDrc2_4 = new Nodo(TipoNodo.FLEXIBLE, pataDrc2_3, 0, 7, this);
            new Nodo(TipoNodo.ESTATICO, pataDrc2_4, 0, 7, this);

            var pataIzq3_2 = new Nodo(TipoNodo.FLEXIBLE, pataIzq3_1, 0, 7, this);
            var pataIzq3_3 = new Nodo(TipoNodo.MOTOR, pataIzq3_2, 0, 7, this);
            var pataIzq3_4 = new Nodo(TipoNodo.FLEXIBLE, pataIzq3_3, 0, 7, this);
            new Nodo(TipoNodo.ESTATICO, pataIzq3_4, 0, 7, this);
            var pataDrc3_2 = new Nodo(TipoNodo.FLEXIBLE, pataDrc3_1, 0, 7, this);
            var pataDrc3_3 = new Nodo(TipoNodo.MOTOR, pataDrc3_2, 0, 7, this);
            var pataDrc3_4 = new Nodo(TipoNodo.FLEXIBLE, pataDrc3_3, 0, 7, this);
            new Nodo(TipoNodo.ESTATICO, pataDrc3_4, 0, 7, this);
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
            temp.push([nodos.indexOf(nodo), nodo.x, nodo.y, nodo.tipoNodo, nodo.radio, nodo.anguloActual]);
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
}
Bicho.prototype = Object.create(BichoProto.prototype);

module.exports = {
    Bicho: Bicho,
    TipoNodo: TipoNodo,
};


/*======================================================================================*/
/*Funciones comunes entre nodos y bicho
========================================================================================*/
matarNodos = function(bicho, nodo){
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
        nodo.vida = 0
    }
    nodo.nodos.forEach(function(nodoHijo) {
        matarNodos(bicho, nodoHijo);
    });
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
