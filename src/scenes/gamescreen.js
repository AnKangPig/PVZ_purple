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
        let sfb=core.animate(core.ani["sfblink"],sf.get("anim_idle"));
        sfb.cr.zIndex=4;
        let sfbtl=gsap.timeline({repeat:-1});
        sfbtl.timeScale(core.random(0.6,1.4));
        sfbtl.add(()=>{
            sfb.play();
            sfbtl.timeScale(core.random(0.6,1.4));
        },5);
        
        window.sfc=sfb.cr

    }

})();

