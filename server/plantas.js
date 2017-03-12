var TipoNodo = function(tipo, colorHex){ //0=MAGNA, 1=SPICIS, 2=XP, 3=CORNELISU, 4=MAGIS
    this.tipo = tipo;
    this.colorHex = colorHex;
}

TipoNodo.MAGNA = new TipoNodo(0, "0x00ff00"); //TAMAÑO
TipoNodo.SPICIS = new TipoNodo(1, "0x42c8f4"); //PINCHOS
TipoNodo.XP = new TipoNodo(2, [0, "0x9ba1a3"]); //XPAGUETOES (OJOS)
TipoNodo.CORNELISU = new TipoNodo(3, "0xb4e22b"); //CORAZA
TipoNodo.MAGIS = new TipoNodo(4, "0xe27a2f"); //MAGIS CORPUS (MÁS NODOS)

/*
Las plantas van a tener un nodo central del que saldrá una cantidad aleatoria de nodos "grandes", despues, de cada nodo "grande" pueden (o no) salir
otra cantidad aleatoria de nodos "pequeños.

Los bichos pequeños solo podrán comer los nodos "pequeños" de las plantas, y los bichos grandes los nodos "grandes".
*/

var PlantaProto = function(){
    var Nodo = function(tipoNodo, nodoPadre, anguloInicio, radio, planta, clase){
        this.x = 0;
        this.y = 0;
        this.tipoNodo = tipoNodo;
        this.nodoPadre = nodoPadre;
        this.anguloInicio = anguloInicio;
        this.anguloActual = 0;
        this.radio = radio;
        this.clase = clase;
        this.nodos = [];
        if(this.nodoPadre !== null) {
            //nodoPadre.nodos.push(this);
        } else {
            this.x = planta.x;
            this.y = planta.y;
        }
        this.visible = true;
        planta.nodos.push(this);

        planta.generarHijos(this);

        this.update = function() {
            if(nodoPadre === null) {
                return;
            }
            var centroX = this.nodoPadre.x;
            var centroY = this.nodoPadre.y;
            this.anguloActual = this.anguloInicio + this.nodoPadre.anguloActual;
            var angulo = this.anguloActual * Math.PI / 180.0;
            var radioPadre = this.nodoPadre.radio;
            this.x = Math.cos(angulo) * radioPadre + centroX;
            this.y = Math.sin(angulo) * radioPadre + centroY;
        }
    }

    this.generar = function(){ //Función que genera la planta
        if(this.tipo == 0) { //MAGNA
            this.nodoPadre = new Nodo(TipoNodo.MAGNA, null, 0, 50, this, 0);
        } else if(this.tipo == 1) {//SPICIS
            this.nodoPadre = new Nodo(TipoNodo.SPICIS, null, 0, 30, this, 0);
        } else if(this.tipo == 2) {//CORNELISU
            this.nodoPadre = new Nodo(TipoNodo.CORNELISU, null, 0, 50, this, 0);
        }
        this.update();
    }

    this.generarHijos = function(nodo) {
        if(nodo.tipoNodo === TipoNodo.MAGNA) {
            if(nodo.clase === 0) {
                for(var i=0; i<4; i++) {
                    if(Math.random() * 100 < 90) {
                        var angulo = i*90;
                        var radio = Math.random() * 4 + 28;
                        new Nodo(TipoNodo.MAGNA, nodo, angulo, radio, this, 2);
                    }
                }
                for(var i=0; i<4; i++) {
                    if(Math.random() * 100 < 90) {
                        var angulo = i*90 + 45;
                        var radio = Math.random() * 4 + 28;
                        new Nodo(TipoNodo.MAGNA, nodo, angulo, radio, this, 1);
                    }
                }
            } else if(nodo.clase === 1) {
                if(Math.random() * 100 < 75) {
                    var radio = Math.random() * 4 + 28;
                    new Nodo(TipoNodo.MAGNA, nodo, 0, radio, this, 3);
                }
            } else if(nodo.clase === 2) {
                if(Math.random() * 100 < 75) {
                    var radio = Math.random() * 4 + 8;
                    new Nodo(TipoNodo.MAGNA, nodo, 0, radio, this, 4);
                }
            } else if(nodo.clase === 3) {
                if(Math.random() * 100 < 75) {
                    var radio = Math.random() * 4 + 8;
                    new Nodo(TipoNodo.MAGNA, nodo, 0, radio, this, 4);
                }
                if(Math.random() * 100 < 75) {
                    var radio = Math.random() * 4 + 8;
                    new Nodo(TipoNodo.MAGNA, nodo, 90, radio, this, 4);
                }
                if(Math.random() * 100 < 75) {
                    var radio = Math.random() * 4 + 8;
                    new Nodo(TipoNodo.MAGNA, nodo, 270, radio, this, 4);
                }
            }
        } else if(nodo.tipoNodo === TipoNodo.SPICIS) {
            if(nodo.clase === 0) {
                for(var i=0; i<4; i++) {
                    var angulo = i*90;
                    new Nodo(TipoNodo.SPICIS, nodo, angulo, 30, this, 1);
                }
            } else if(nodo.clase === 1) {
                if(Math.random() * 100 < 50) {
                    new Nodo(TipoNodo.SPICIS, nodo, 0, 30, this, 1);
                } else {
                    new Nodo(TipoNodo.SPICIS, nodo, 0, 10, this, 2);
                }
                new Nodo(TipoNodo.SPICIS, nodo, 90, 10, this, 2);
                new Nodo(TipoNodo.SPICIS, nodo, 270, 10, this, 2);
            }
        } else if(nodo.tipoNodo === TipoNodo.CORNELISU) {
            if(nodo.clase === 0) {
                for(var i=0; i<4; i++) {
                    var angulo = i*90;
                    var suma = angulo + (Math.random() * 40 - 20);
                    new Nodo(TipoNodo.CORNELISU, nodo, suma, 30, this, 1);
                }
            } else if(nodo.clase === 1) {
                if(Math.random() * 100 < 50) {
                    var angulo = 90 + (Math.random() * 40 - 20);
                    new Nodo(TipoNodo.CORNELISU, nodo, angulo, 10, this, 2);
                }
                if(Math.random() * 100 < 50) {
                    var angulo = 270 + (Math.random() * 40 - 20);
                    new Nodo(TipoNodo.CORNELISU, nodo, angulo, 10, this, 2);
                }
                var angulo = Math.random() * 40 - 20;
                if(Math.random() * 100 < 50) {
                    new Nodo(TipoNodo.CORNELISU, nodo, angulo, 10, this, 2);
                } else {
                    new Nodo(TipoNodo.CORNELISU, nodo, angulo, 30, this, 1);
                }
            } else if(nodo.clase === 2) {
                if(Math.random() * 100 < 50) {
                    var angulo = Math.random() * 40 - 20;
                    new Nodo(TipoNodo.CORNELISU, nodo, angulo, 10, this, 2);
                }
            }
        } else if(nodo.tipoNodo === TipoNodo.XP) {

        }
    }

    this.crearNodoMin = function(nodo) {
        return [nodo.x, nodo.y, nodo.visible, nodo.tipoNodo, nodo.radio];
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

    this.update = function() {
        this.nodos.forEach(function(nodo) {
            nodo.update();
        });
    }
}

var Planta = function(x,y,tipo) {
    PlantaProto.call(this);
    this.x = x;
    this.y = y;
    this.tipo = tipo;
    this.nodos = [];
    this.nodoCentral = null;
    this.hitbox = [];
    this.generar();
}
Planta.prototype = Object.create(PlantaProto.prototype);

module.exports = {
    Planta: Planta,
    TipoNodo: TipoNodo,
};
/* */
