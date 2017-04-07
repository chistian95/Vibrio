function actualizarExp() {
    if(expActual) {
        //0=size, 1=pinchos, 2=tentaculos, 3=coraza, 4=nodos, 5=ojos
        var widthRect = app.expSpr.width*.5;
        var expTotal = expActual.nodos+expActual.ojos+expActual.tentaculos+expActual.size+expActual.pinchos+expActual.coraza;
        var TempExp = (expTotal/((nivel+1)*100))*widthRect;
        app.expSpr.mask.width = Math.min(TempExp,widthRect);
        app.expPorc.text = Math.min(Math.floor((expTotal/((nivel+1)*100))*100),100)+'%';
        app.spr_uiZise.children[0].text = Math.floor((expActual.size/((nivel+1)*100))*100)+'%';
        app.spr_uiOjo.children[0].text = Math.floor((expActual.ojos/((nivel+1)*100))*100)+'%';
        app.spr_uiPincho.children[0].text = Math.floor((expActual.pinchos/((nivel+1)*100))*100)+'%';
        app.spr_uiTentaculo.children[0].text = Math.floor((expActual.tentaculos/((nivel+1)*100))*100)+'%';
        app.spr_uiNodos.children[0].text = Math.floor((expActual.nodos/((nivel+1)*100))*100)+'%';
        app.spr_uiCoraza.children[0].text = Math.floor((expActual.coraza/((nivel+1)*100))*100)+'%';
        app.expRenderer.render(app.exp);
    }
}
function declararSpriteDesdeTextura(textura,container, x,y,anchor, z) {
    var spriteTemp = new PIXI.Sprite(textura);
    spriteTemp.position.x = x || 0;
    spriteTemp.position.y = y || 0;
    spriteTemp.anchor.set(anchor || 0.5);
    spriteTemp.z = z;
    container.addChild(spriteTemp);
    return spriteTemp;
}
function addChildrenText(texto,father, x = 0, y = 0 , anchor = 1, font= 'Comic Sans MS', size = '25px', color = "#ffff00", z = 0) {
    var tempText = new PIXI.Text(texto, {font : 'Arial', fontSize:size, fill:color});
    tempText.position.x = x;
    tempText.position.y = y;
    tempText.anchor.set(anchor);
    father.addChild(tempText);
}
function init(servPlantas, pHitbox,t,ancho,alto) {
    plantas = [];
    plantasHitbox = [];
    plantasSprites = [];
    game.localPlayer = t;
    var nodosSprites = [];
    var cont = 0;
    servPlantas.forEach(function(p) {
        nodosSprites = [];
        ndSprites = [];
        p.forEach(function(nodoPlanta) {
            //nodo.x, nodo.y, nodo.visible, nodo.tipoNodo, nodo.radio
            var graphics = new PIXI.Graphics();
            graphics.lineStyle(0);
            graphics.beginFill(nodoPlanta[3].colorHex, 0.8);
            graphics.drawCircle(nodoPlanta[4], nodoPlanta[4], nodoPlanta[4]);
            graphics.endFill();
            var sprite = new PIXI.Sprite(graphics.generateCanvasTexture());
            sprite.anchor.set(0.5);
            sprite.position.x = nodoPlanta[0];
            sprite.position.y = nodoPlanta[1];
            sprite.z = zPlantas+cont;
            cont++;
            sprite.displayGroup = app.general;
            app.world.addChild(sprite);
            ndSprites.push(sprite);

            var datos = {
                x: nodoPlanta[0],
                y: nodoPlanta[1],
                radio: nodoPlanta[4],
            }
            nodosSprites.push(datos);
        });
        plantas.push(nodosSprites);
        if(p[0]) plantas[plantas.length-1].tipo = p[0][3].tipo;
        else {
            console.log("p[0] no existe.");
            console.log(p);
        }
        plantas[plantas.length-1].hitbox = pHitbox[plantas.length-1];

        plantasSprites.push(ndSprites);
        //actualizarZ();
    });

    app.bordeGraphics = new PIXI.Graphics();
    app.bordeGraphics.lineStyle(30, 0x8d8dc9, 30);
    app.bordeGraphics.drawRect(0, 0, ancho, alto);
    app.bordeSprite = new PIXI.Sprite(app.bordeGraphics.generateCanvasTexture());
    app.bordeSprite.z =10;
    app.bordeSprite.x = 0;
    app.bordeSprite.y = 0;
    app.world.addChild(app.bordeSprite);
}
/*=================================================*/
/*Inputs
==================================================*/
function teclitas(e) {
    if(e.keyCode === 27) game.meMato();
    if(e.keyCode === 13) game.evoZise();
    if(e.keyCode === 87) game.localPlayer.arriba = true;
    if(e.keyCode === 83) game.localPlayer.abajo = true;
    if(e.keyCode === 65) game.localPlayer.izquierda = true;
    if(e.keyCode === 68) game.localPlayer.derecha = true;
}
function teclitasUp(e) {
    if(e.keyCode === 87) game.localPlayer.arriba = false;
    if(e.keyCode === 83) game.localPlayer.abajo = false;
    if(e.keyCode === 65) game.localPlayer.izquierda = false;
    if(e.keyCode === 68) game.localPlayer.derecha = false;
}
function actualizarRaton(e) {
    if(game.localPlayer) {
        game.localPlayer.ratonX = e.clientX;
        game.localPlayer.ratonY = e.clientY;
    }
}
function usarHabilidad() {
    console.log("USAR HABILIDAD");
    if(game.localPlayer) {
        game.socket.emit('usarHabilidad',{id:game.localPlayer.id})
    }
}
function actualizarTouch(e) {
    if(game.localPlayer) {
        game.localPlayer.ratonX = e.touches[0].clientX;
        game.localPlayer.ratonY = e.touches[0].clientY;
    }
}
function posicionRaton() {
    if(game.movimiento) {
        var relX = game.localPlayer.ratonX - window.innerWidth/2;
        var relY = game.localPlayer.ratonY - window.innerHeight/2;
        var anguloBicho = game.localPlayer.bicho.nodos[0].anguloActual;
        var relAngulo = Math.atan2(relY, relX) * 180 / Math.PI + 180;
        var difAngulo = relAngulo - anguloBicho;
        if(difAngulo > -170 && (difAngulo < -10 || difAngulo > 190)) {
            game.localPlayer.derecha =  false;
            game.localPlayer.izquierda = true;
        } else if(difAngulo > 10 || difAngulo < -190) {
            game.localPlayer.derecha = true;
            game.localPlayer.izquierda = false;
        } else {
            game.localPlayer.derecha = false;
            game.localPlayer.izquierda = false;
        }
        var distancia = Math.sqrt(Math.pow(relX, 2) + Math.pow(relY, 2));
        var diametro = game.localPlayer.bicho.nodos[0].radio;
        if(distancia > diametro*zoom) {
            game.localPlayer.arriba = true;
        } else {
            game.localPlayer.arriba = false;
        }
    }else {
        game.localPlayer.derecha = false;
        game.localPlayer.izquierda = false;
        game.localPlayer.arriba = false;
    }
}
/*===============================================*/
function rgb2hex(rgb){
 rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
 return (rgb && rgb.length === 4) ? "0x" +
  ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
  ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
  ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
}

function generarDibujoCircular(radio,color,tiponodoColor,alpha,z,x,y,anchor) {
    var colorTemp = []; //"rgba(199, 64, 64, 0.93)"
    if(tiponodoColor) {
        colorTemp = rgb2hex(color);
    } else {
        colorTemp = color;
    }
    var grap = new PIXI.Graphics();
    grap.beginFill(colorTemp);
    grap.drawCircle(radio, radio,radio);
    grap.endFill();
    var sprite = new PIXI.Sprite(grap.generateCanvasTexture());
    if(x)sprite.position.x = x;
    if(y)sprite.position.y = y;
    if(z)sprite.z = z;
    sprite.anchor.set(anchor || 0.5);
    app.world.addChild(sprite);
    return sprite;
}

function actualizarUi() {
    var num = Math.min(app.expRenderer.width/app.barraExp.width,app.expRenderer.height/app.barraExp.height);
    app.exp.scale.set(num);
    app.expRenderer.view.style.top = window.innerHeight-app.expRenderer.height+"px";
}

function calcularPuntoEnCirculo(x = 0,y = 0,r,a){
    if(!r && r != 0|| !a && a != 0) {
        console.log("Faltan atributos obligatorios: ")
        if(!a)console.log("Ángulo: "+a);
        if(!r)console.log("Radio: "+r);
        return;
    }
    var coord = [];
    coord.push(x + r * Math.cos(a));
    coord.push(y + r * Math.sin(a));
    return coord;
}

function nodoAnodo(nodo,nodoTarget){
    if(!nodo || ! nodoTarget) {console.log("wtf");return}
    var distanciaX = nodo.sprite.position.x - nodoTarget.sprite.position.x;
    var distanciaY = nodo.sprite.position.y - nodoTarget.sprite.position.y;
    var sumaRadios = nodoTarget.radio + nodo.radio;
    var dist = distanciaX * distanciaX + distanciaY * distanciaY;
    if(distanciaX * distanciaX + distanciaY * distanciaY <= sumaRadios * sumaRadios) {
        return true;
    } else{
        console.log((distanciaX * distanciaX + distanciaY * distanciaY)+" radios: "+sumaRadios * sumaRadios);
        return false;
    }
}
