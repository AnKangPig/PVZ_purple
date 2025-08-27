(()=>{

	const {Sprite,Container,Rectangle} = PIXI;

	
	core.gamescreen=function(){
        
		const layer=new Container({width:800,height:600});
		core.app.stage.addChild(layer);
		const tl = gsap.timeline();
		core.timelines.push(tl);

        let sf=core.animate(core.ani["sunflower"],layer);
        sf.cr.zIndex=3;sf.repeat=-1;sf.play();
        sf.cr.position.set(400,300);
        /*let sfb=core.animate(core.ani["sfblink"],layer);
        sfb.cr.zIndex=4;sfb.repeat=-1;sfb.play();
        sfb.cr.position.set(400,300);*/

    }

})();

