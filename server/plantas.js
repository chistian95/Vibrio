var TipoNodo = function(tipo, color){ //0=MAGNA, 1=SPICIS, 2=XP, 3=CORNELISU, 4=MAGIS
    this.tipo = tipo;
    this.color = color;
}

TipoNodo.MAGNA = new TipoNodo(0, [0, 255, 0, 64]); //TAMAÑO
TipoNodo.SPICIS = new TipoNodo(1, [255, 0, 0, 64]); //PINCHOS
TipoNodo.XP = new TipoNodo(2, [0, 255, 255, 64]); //XPAGUETOES (OJOS)
TipoNodo.CORNELISU = new TipoNodo(3, [0, 0, 255, 64]); //CORAZA
TipoNodo.MAGIS = new TipoNodo(4, [145,145,145,64]); //MAGIS CORPUS (MÁS NODOS)

/*
Las plantas van a tener un nodo central del que saldrá una cantidad aleatoria de nodos "grandes", despues, de cada nodo "grande" pueden (o no) salir
otra cantidad aleatoria de nodos "pequeños.

Los bichos pequeños solo podrán comer los nodos "pequeños" de las plantas, y los bichos grandes los nodos "grandes".
*/

var PlantaProto = function(){
    var Nodo = function(tipoNodo, nodoPadre, radio, planta){
        this.x = 0;
        this.y = 0;
        this.tipoNodo = tipoNodo;
        this.nodoPadre = nodoPadre;
        this.radio = radio;
        this.nodos = [];
        if(this.nodoPadre !== null) {
            nodoPadre.nodos.push(this);
        }
        this.visible = true;
        planta.nodos.push(this);
    }

    this.generar = function(){ //Función que genera la planta
        if(Nodo.tipoNodo.tipo === 0){ //MAGNA
            var centro = new Nodo(TipoNodo.MAGNA, null, 50, this);
            var r = Math.round(Math.random()*5)+3;
            var r2 = Math.round(Math.random()*5)+3;
            for(var i=0; i<r;i++){//Nodos "GRANDES" de la planta
                var p = new Nodo(TipoNodo.MAGNA, centro, 50, this);
                for(var n=0; n<r2;n++){ //Nodos "PEQUEÑOS" de la planta
                    new Nodo(TipoNodo.MAGNA, p, 15, this);
                }
            }
            this.nodoCentral = centro;
        }else if(Nodo.tipoNodo.tipo === 1){ //SPICIS
            var centro = new Nodo(TipoNodo.SPICIS, null, 50, this);
            var r = Math.round(Math.random()*5)+3;
            var r2 = Math.round(Math.random()*5)+3;
            for(var i=0; i<r;i++){//Nodos "GRANDES" de la planta
                var p = new Nodo(TipoNodo.SPICIS, centro, 50, this);
                for(var n=0; n<r2;n++){ //Nodos "PEQUEÑOS" de la planta
                    new Nodo(TipoNodo.SPICIS, p, 15, this);
                }
            }
            this.nodoCentral = centro;
        }else if(Nodo.tipoNodo.tipo === 2){ //XP
            var centro = new Nodo(TipoNodo.XP, null, 50, this);
            var r = Math.round(Math.random()*5)+3;
            var r2 = Math.round(Math.random()*5)+3;
            for(var i=0; i<r;i++){//Nodos "GRANDES" de la planta
                var p = new Nodo(TipoNodo.XP, centro, 50, this);
                for(var n=0; n<r2;n++){ //Nodos "PEQUEÑOS" de la planta
                    new Nodo(TipoNodo.XP, p, 15, this);
                }
            }
            this.nodoCentral = centro;
        }else if(Nodo.tipoNodo.tipo === 3){ //CORNELISU
            var centro = new Nodo(TipoNodo.CORNELISU, null, 50, this);
            var r = Math.round(Math.random()*5)+3;
            var r2 = Math.round(Math.random()*5)+3;
            for(var i=0; i<r;i++){//Nodos "GRANDES" de la planta
                var p = new Nodo(TipoNodo.CORNELISU, centro, 50, this);
                for(var n=0; n<r2;n++){ //Nodos "PEQUEÑOS" de la planta
                    new Nodo(TipoNodo.CORNELISU, p, 15, this);
                }
            }
            this.nodoCentral = centro;
        }else if(Nodo.tipoNodo.tipo === 4){ //MAGIS
            var centro = new Nodo(TipoNodo.MAGIS, null, 50, this);
            var r = Math.round(Math.random()*5)+3;
            var r2 = Math.round(Math.random()*5)+3;
            for(var i=0; i<r;i++){//Nodos "GRANDES" de la planta
                var p = new Nodo(TipoNodo.MAGIS, centro, 50, this);
                for(var n=0; n<r2;n++){ //Nodos "PEQUEÑOS" de la planta
                    new Nodo(TipoNodo.MAGIS, p, 15, this);
                }
            }
            this.nodoCentral = centro;
        }
    }

    this.crearNodoMin = function(posicion, nodo) {
        return [posicion, nodo.x, nodo.y, nodo.visible, nodo.tipoNodo, nodo.radio];
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

var Planta = function(x,y) {
    PlantaProto.call(this);
    this.x = x;
    this.y = y;
    this.nodos = [];
    this.nodoCentral = null;
    this.hitbox = [];
}
Planta.prototype = Object.create(PlantaProto.prototype);

module.exports = {
    Planta: Planta,
    TipoNodo: TipoNodo,
};
/* */
