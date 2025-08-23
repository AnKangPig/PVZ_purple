(()=>{

	const {Sprite,Container,Text,Rectangle} = PIXI;

	
	core.startscreen=function(){

		const layer=new Container({width:800,height:600});
		core.app.stage.addChild(layer);
		const tl = gsap.timeline();
		core.timelines.push(tl);

		//背景
		const ts = core.set(
			new Sprite(img["titlescreen"]),
			{
				parent:layer,
				anchor:0.5,
				pos:[400,300]
			}
		);
		
		//上方logo
		const logo = core.set(
			new Sprite(img["PvZ_Logo"]),
			{
				parent:layer,
				anchor:[0.5,1],
				pos:[400,0]
			}
		);
		
		tl.to(logo,{y:130, duration: 0.2},0.16);
		tl.to(logo,{y:127, duration: 0.14},">");

		//下面加载栏
		const loadbar=new Container();
		loadbar.position.set(400,704);
		layer.addChild(loadbar);

		tl.to(loadbar,{y:585, duration: 0.567},0.33);
		tl.to(loadbar,{y:588, duration: 0.066},">");

		//泥土部分
		const loaddirt = core.set(
			new Sprite(img["LoadBar_dirt"]),
			{
				parent:loadbar,
				anchor:[0.5,1]
			}
		);

		//文字部分
		const loadtext = core.set(
			new Text(core.afont("载入中……",'Font3',18,0xd8b721,1.5)),
			{
				parent:loadbar,
				anchor:[0.5,1],
				pos:[1,-18]
			}
		);

		tl.set(loadtext,{text:"点击开始"},2.463);

		//碰撞箱部分
		const dirttouch=core.set(
			new Container(),
			{
				parent:loadbar,
				hitArea:new Rectangle(0, 0, 305, 37),
				interactive:true,
				zIndex:1,pos:[-159,-49]
			}
		);
		dirttouch.on("pointerover",()=>{Cursor="pointer";loadtext.style.fill=0xf8590f;});
		dirttouch.on("pointerout",()=>{Cursor=core.cursor;loadtext.style.fill=0xd8b721;});

		//草卷
		const cap=core.set(
			new Sprite(img["SodRollCap"]),
			{
				parent:loadbar,
				zIndex:4,anchor:0.5,
				pos:[-155,-75]
			}
		);

		//一圈二分之一+转一半 360+180+45  585 1500ms
		tl.to(cap,{angle:580,x:134,y:-58,pixi:{scaleX:0.53,scaleY:0.53},duration:1.5},0.963);
		tl.set(cap,{alpha:0},">");

		//草坪
		const grass=core.set(
			new Sprite(img["LoadBar_grass"]),
			{
				parent:loadbar,
				zIndex:2,anchor:[0,0.5],
				pos:[-165,-54]
			}
		);

		//遮罩（靠遮罩伸展实现草坪部分显示）
		const mask = new PIXI.Graphics();
		mask.beginFill(0xffffff);
		mask.drawRect(0,0,314,53);
		mask.endFill();
		
		core.set(mask,{
			parent:grass,
			pivot:[0,20],
			scale:[0,1]
		});

		grass.mask=mask;
		tl.to(mask,{pixi:{scaleX:1},duration:1.5},0.963);

		//四朵花+一个僵尸头
		const sproutA=core.animate(core.ani["sprout"],loadbar);
		core.set(sproutA.cr,{pos:[-148,-77],zIndex:3});
		sproutA.delay=1.1;sproutA.play();
		core.sound("loadingbar_flower",1.17,tl);

		const sproutB=core.animate(core.ani["sprout"],loadbar);
		core.set(sproutB.cr,{pos:[-79,-77],zIndex:3,scale:[-1,1]});
		sproutB.delay=1.4;sproutB.play();
		core.sound("loadingbar_flower",1.47,tl);

		const sproutC=core.animate(core.ani["sprout"],loadbar);
		core.set(sproutC.cr,{pos:[-12,-83],zIndex:3,scale:[1.32,1.32]});
		sproutC.delay=1.7;sproutC.play();
		core.sound("loadingbar_flower",1.77,tl);

		const sproutD=core.animate(core.ani["sprout"],loadbar);
		core.set(sproutD.cr,{pos:[47,-76],zIndex:3,scale:[-1,1]});
		sproutD.delay=2;sproutD.play();
		core.sound("loadingbar_flower",2.07,tl);

		const zomhead=core.animate(core.ani["zomhead"],loadbar);
		core.set(zomhead.cr,{pos:[84,-78],zIndex:3});
		zomhead.delay=2.3;zomhead.play();
		core.sound("loadingbar_flower",2.37,tl);
		core.sound("loadingbar_zombie",2.37,tl);

		//加载是假的，点击屏幕直接进游戏
		layer.interactive=true;
		layer.on("pointerdown",()=>{
			core.killTimelines()
			layer.destroy();
			core.sound("bleep");
			core.selectorscreen();
		})
	}
    
})();

