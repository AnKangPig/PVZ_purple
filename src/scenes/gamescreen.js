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

        
        let wn=core.animate(core.ani["wnut"],layer);
        wn.cr.zIndex=3;wn.repeat=-1;wn.play();
        wn.cr.position.set(500,300);
        let wnb=core.animate(core.ani["wnblink"],wn.get("anim_face"));
        wnb.cr.zIndex=4;wnb.cr.position.set(2,1);
        let wnbtwicetl=gsap.timeline({paused:true});
        wnbtwicetl.add(()=>{wnb.play();},0.333);
        wnbtwicetl.add(()=>{wnb.play();},0.666);
        let wnbthricetl=gsap.timeline({paused:true});
        wnbthricetl.add(()=>{wnb.play();},0.333);
        wnbthricetl.add(()=>{wnb.play();},0.666);
        wnbthricetl.add(()=>{wnb.play();},1);
        let wnt=core.animate(core.ani["wntwitch"],wn.get("anim_face"));
        wnt.cr.zIndex=4;wnt.cr.position.set(2,7);
        window.aaa=[wnb,wnbtwicetl,wnbthricetl,wnt]
        const wnbf=()=>{
            let ra=Math.floor((Math.random()*3));
            switch(ra){
                case 0:wnbtwicetl.restart();return;
                case 1:wnbthricetl.restart();return;
                case 2:wnt.play();return;
            }
        };

        let wntl=gsap.timeline({repeat:-1});
        wntl.timeScale(core.random(0.6,1.4));
        wntl.add(()=>{
            wnbf();
            sfbtl.timeScale(core.random(0.6,1.4));
        },12);


    }

})();

