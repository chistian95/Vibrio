var TipoNodo = function(color){
    var color;
    this.color = color;
}

TipoNodo.MAGNA = new TipoNodo([0, 255, 0, 64]); //TAMAÑO
TipoNodo.SPICIS = new TipoNodo([255, 0, 0, 64]); //PINCHOS
TipoNodo.XP = new TipoNodo([0, 255, 255, 64]); //XPAGUETOES (OJOS)
TipoNodo.CORNELISU = new TipoNodo([0, 0, 255, 64]); //CORAZA
TipoNodo.MAGIS = new TipoNodo([145,145,145,64]); //MAGIS CORPUS (MÁS NODOS)

/*
Las plantas van a tener un nodo central del que saldrá una cantidad aleatoria de nodos "grandes", despues, de cada nodo "grande" pueden (o no) salir
otra cantidad aleatoria de nodos "pequeños.

Los bichos pequeños solo podrán comer los nodos "pequeños" de las plantas, y los bichos grandes los nodos "grandes".
*/

var PlantaProto = function(){
    var Nodo = function(tipoNodo, nodoPadre, anguloInicio, radio, planta){
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
