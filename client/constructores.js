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
function app(){
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
    this.renderer = new PIXI.autoDetectRenderer(256, 256, {antialias: false, transparent: true, resolution: 1});
    this.backrenderer = new PIXI.autoDetectRenderer(400, 50,null,true,true,false,true,1,false,true,false);
    this.expRenderer = new PIXI.autoDetectRenderer(800, 600, {antialias: false, transparent: true, resolution: 1});
    //Añadirlos al body para que se vean
    document.body.appendChild(this.renderer.view);
    /*===============================================================================================*/
    /*Preparar los renderer (Estilos)
    ==============================================================================*/
    this.backrenderer.resize(window.innerWidth, window.innerHeight);
    this.backrenderer.view.style.position = "absolute";
    this.backrenderer.view.style.display = "block";

    this.renderer.resize(window.innerWidth, window.innerHeight);
    this.renderer.view.style.position = "absolute";
    this.renderer.view.style.display = "block";

    this.backrenderer.view.style.zIndex = -1;

    document.body.appendChild(this.backrenderer.view);
    document.body.appendChild(this.expRenderer.view);

    this.expRenderer.resize(window.innerWidth/2, window.innerHeight/10);
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

    this.expSprite = new PIXI.Graphics();
    this.background.position.x = 0;
    this.background.position.y = 0;
    this.exp.addChild(this.expSprite);

    var x = this.expRenderer.width/7;
    this.spr_uiOjo = declararSpriteDesdeTextura(uiOjo,this.exp,x,25,1);
    this.spr_uiPincho = declararSpriteDesdeTextura(uiPincho,this.exp,x*2,25,1);
    this.spr_uiZise = declararSpriteDesdeTextura(uiZise,this.exp,x*3,25,1);
    this.spr_uiTentaculo =  declararSpriteDesdeTextura(uiTentaculo,this.exp,x*4,25,1);
    this.spr_uiNodos =  declararSpriteDesdeTextura(uiNodos,this.exp,x*5,25,1);
    this.spr_uiCoraza =  declararSpriteDesdeTextura(uiCoraza,this.exp,x*6,25,1);

    //texto,father, x = 0, y = 0 , anchor = 0.5, font= 'Comic Sans MS', size = '20px', color = "#ffff00", z = 0
    addChildrenText("0%",this.expSprite,window.innerWidth/4,window.innerHeight/13.5,0.5,null,35,"#1400ff"); //Exp General
    addChildrenText("Error",this.spr_uiOjo,null,10); //Exp Ojo
    addChildrenText("Error",this.spr_uiPincho,null,10); //Exp Picho
    addChildrenText("Error",this.spr_uiZise,null,10); //Exp Zise
    addChildrenText("Error",this.spr_uiNodos,null,10); //Exp Nodos
    addChildrenText("Error",this.spr_uiTentaculo,null,10); //Exp Tentaculos
    addChildrenText("Error",this.spr_uiCoraza,null,10); //Exp Coraza

    var alturaRectangulo = this.expRenderer.height/2.1;
    var mascara = new PIXI.Graphics();
    mascara.beginFill(0x000000);
    mascara.drawRect(0, alturaRectangulo, window.innerWidth/2, window.innerHeight/20);
    mascara.endFill();
    this.expSprite.mask = mascara;
    this.expSprite.mask.x = 0;
    this.expSprite.mask.y = 0;
    this.expSprite.addChild(mascara);
    this.expSprite.zOrder =10;

}
