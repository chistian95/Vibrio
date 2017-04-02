/*Constructor de los player
=======================================*/
function Player(id, game, local,nombrev){
    this.nombre = nombrev;
	this.id = id;
    this.ratonX = 0;
    this.ratonY = 0;
	this.local = local;
    if(local) this.idsCercanas = [];
    this.bicho = new Bicho(this.id,nombrev);
}

/*====================================================================================*/
/*Render - Pixi
======================================================================================*/
function renderPixi(){
    /*Declarar contenedores de imágenes
    =====================================*/
    this.world = new PIXI.Container();
    this.back = new PIXI.Container();
    this.exp = new PIXI.Container();
    this.borde = new PIXI.Container();
    this.world.addChild(g);
    /*==================================*/
    /*Declarar renderer de imágenes
    =================================================================================================*/
    this.renderer = new PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight, {antialias: false, transparent: true, resolution: 1});
    this.backrenderer = new PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight,null,true,true,false,true,1,false,true,false);
    this.expRenderer = new PIXI.autoDetectRenderer(window.innerWidth/2, window.innerHeight/10, {antialias: false, transparent: true, resolution: 1});
    //Añadirlos al body para que se vean
    document.body.appendChild(this.renderer.view);
    /*===============================================================================================*/
    /*Preparar los renderer (Estilos)
    ==============================================================================*/
    this.backrenderer.view.style.position = "absolute";
    this.backrenderer.view.style.display = "block";

    this.renderer.view.style.position = "absolute";
    this.renderer.view.style.display = "block";

    this.backrenderer.view.style.zIndex = -1;

    document.body.appendChild(this.backrenderer.view);
    document.body.appendChild(this.expRenderer.view);

    this.expRenderer.view.style.position = "absolute";
    this.expRenderer.view.style.display = "block";
    this.expRenderer.view.style.zIndex = 1;
    this.expRenderer.view.style.left = "25%";
    this.expRenderer.view.style.top = "88%";

    this.background = new PIXI.Sprite(backgroundFijo);
    this.background.width = window.innerWidth;
    this.background.height = window.innerHeight;

    this.background.position.x = 0;
    this.background.position.y = 0;
    this.back.addChild(this.back);
    this.backrenderer.render(this.background);

    this.barraExp = new PIXI.Sprite(barraExp);
    this.barraExp.position.x = 0;
    this.barraExp.position.y = 0;
    this.exp.addChild(this.barraExp);
    this.expSpr = new PIXI.Sprite(exp);
    this.expSpr.position.x = 90;
    this.expSpr.position.y = 62;
    this.exp.addChild(this.expSpr);

    var x = this.expRenderer.width/6;
    var y = 60;

    this.spr_uiOjo = declararSpriteDesdeTextura(uiOjo,this.exp,x,y,1);
    this.spr_uiPincho = declararSpriteDesdeTextura(uiPincho,this.exp,x*2,y,1);
    this.spr_uiZise = declararSpriteDesdeTextura(uiZise,this.exp,x*3,y,1);
    this.spr_uiTentaculo =  declararSpriteDesdeTextura(uiTentaculo,this.exp,x*4,y,1);
    this.spr_uiNodos =  declararSpriteDesdeTextura(uiNodos,this.exp,x*5,y,1);
    this.spr_uiCoraza =  declararSpriteDesdeTextura(uiCoraza,this.exp,x*6,y,1);

    //texto,father, x = 0, y = 0 , anchor = 0.5, font= 'Comic Sans MS', size = '20px', color = "#ffff00", z = 0
    addChildrenText("0%",this.expSpr,window.innerWidth/4,window.innerHeight/13.5,0.5,null,35,"#1400ff"); //Exp General
    addChildrenText("Error",this.spr_uiOjo,null,10); //Exp Ojo
    addChildrenText("Error",this.spr_uiPincho,null,10); //Exp Picho
    addChildrenText("Error",this.spr_uiZise,null,10); //Exp Zise
    addChildrenText("Error",this.spr_uiNodos,null,10); //Exp Nodos
    addChildrenText("Error",this.spr_uiTentaculo,null,10); //Exp Tentaculos
    addChildrenText("Error",this.spr_uiCoraza,null,10); //Exp Coraza

    var alturaRectangulo = this.expRenderer.height/2.1;
    var mascara = new PIXI.Graphics();
    mascara.beginFill(0x000000);
    mascara.drawRect(0, 0, 1000, 1000);
    mascara.endFill();
    this.expSpr.mask = mascara;
    this.expSpr.mask.x =  0;
    this.expSpr.mask.y =  0;
    this.expSpr.addChild(mascara);
    this.expSpr.zOrder =10;

    this.expSpr.width =this.expRenderer.width-90;
    this.barraExp.width =this.expRenderer.width;
    this.barraExp.height =this.expRenderer.height;

}
