(()=>{

	const {Sprite,Container,Rectangle,Polygon} = PIXI;

	const MAP = {
		buttons: ["StartAdventure", "Survival", "Challenges", "Vasebreaker"],
		pos: [[[405,65],[406,173],[410,257],[413,328]],[[398,66],[407,177],[411,260],[412,330]]],
		hitArea: [
			[[9,32],[66,28],[81,4],[228,6],[246,41],[326,56],[317,140],[1,98]],[[5,5],[310,51],[293,125],[8,73]],
			[[5,3],[279,56],[267,118],[5,59]],[[8,1],[264,59],[249,118],[7,55]],
		],
		nameMap: {
			button:{
				StartAdventure:"StartAdventure_Button1"//大写B，多1
			},
			highlight:{
				StartAdventure:"StartAdventure_Highlight",//大写H
				Vasebreaker:"vasebreaker_highlight"//小写v
			},
			Shadow:{
				Challenges:"Challenge",//无s
				Vasebreaker:"ZenGarden"//ZenGarden！
			}
		},
	};
	core.selectorscreen=function(){

		const sanoshadow=false;//是否启用一个渲染bug，切存档会导致第一个按钮阴影消失

		const layer=new Container({width:800,height:600});
		core.app.stage.addChild(layer);
		const tl = gsap.timeline();
		core.timelines.push(tl);

		core.sound("roll_in");

		//最底层背景
		const ssbg=core.set(
			new Sprite(img["SelectorScreen_BG"]),
			{
				parent:layer,
				zIndex:1,size:[800,600]
			}
		);

		//房子背景
		const sscen=core.set(
			new Sprite(img["SelectorScreen_BG_Center"]),
			{
				parent:layer,
				zIndex:3,pos:[80,310]
			}
		);
		tl.to(sscen,{y:250, duration: 0.6},0);

		//1背景 2云 3房子 4左树 5木牌/墓碑 6墓碑上东西的阴影/摆着的其他东西 墓碑上的东西 10设置

		//云（不存在3云）
        for(let i of [1,2,4,5,6,7]){
            const cloud=core.animate(core.ani["ssc"+i],layer);
            cloud.cr.zIndex=2;cloud.repeat=-1;
			//随机起始，无限重复
            cloud.start=core.fixed(cloud.timeline._dur*Math.random());
            cloud.play();
        }

		//左边的树
		const ssle=core.set(
			new Sprite(img["SelectorScreen_BG_Left"]),
			{parent:layer,zIndex:4}
		);
		tl.to(ssle,{y:-80, duration: 0.6},0);

		//下面的一堆东西
		const ssgroup=core.set(
			new Container(),
			{
				parent:layer,
				zIndex:5,pos:[0,560]
			}
		);
		tl.to(ssgroup,{y:0, duration: 0.6},0);

		//墓碑
		const ssri=core.set(
			new Sprite(img["SelectorScreen_BG_Right"]),
			{
				parent:ssgroup,
				zIndex:1,anchor:1,
				pos:[800+1,600+1]
			}
		);

		//木牌
		const woodsign=core.animate(core.ani["WoodSign"],layer);
		woodsign.cr.zIndex=5;woodsign.play();

		//交互部分
		const wbutton=woodsign.get("woodsign2");
		const bimg=[img["SelectorScreen_WoodSign2"],img["SelectorScreen_WoodSign2_press"]];
		//碰撞箱
		const wbtouch=core.set(
			new Container(),
			{
				parent:woodsign.cr,
				hitArea:new Rectangle(0,0,244,26),
				interactive:true,
				zIndex:6,pos:[54,137]
			}
		);
		wbtouch.on("pointerover",()=>{Cursor="pointer";wbutton.texture=bimg[1];});
		wbtouch.on("pointerout",()=>{Cursor=core.cursor;wbutton.texture=bimg[0];});
		
		//底下的叶子
		const ssleaves=core.animate(core.ani["ssleaves"],ssgroup);
		ssleaves.cr.zIndex=6;ssleaves.repeat=-1;
		ssleaves.play();

		//1~2倍变速（变调）
		let flowerpop=()=>core.pitchedsound("limbs_pop",core.fixed(core.random(1,2),2));
		//右下角能被点掉的三朵小花（彩蛋）
		const flowerA=core.animate(core.ani["ssf1"],ssgroup);
		flowerA.cr.zIndex=5;flowerA.frf();
		flowerA.cr.interactive=true;
		flowerA.cr.addEventListener("pointerdown",()=>{flowerpop();flowerA.play();},{once:true});

		const flowerB=core.animate(core.ani["ssf2"],ssgroup);
		flowerB.cr.zIndex=5;flowerB.frf();
		flowerB.cr.interactive=true;
		flowerB.cr.addEventListener("pointerdown",()=>{flowerpop();flowerB.play();},{once:true});

		const flowerC=core.animate(core.ani["ssf3"],ssgroup);
		flowerC.cr.zIndex=5;flowerC.frf();
		flowerC.cr.interactive=true;
		flowerC.cr.addEventListener("pointerdown",()=>{flowerpop();flowerC.play();},{once:true});

		createCornerButton(ssgroup, {
			pos: [565, 490],
			normal: img["SelectorScreen_Options1"],
			pressed: img["SelectorScreen_Options2"],
			onClick: () => core.optionsmenu(layer, 10),
		});
		createCornerButton(ssgroup, {
			pos: [647, 529],
			normal: img["SelectorScreen_Help1"],
			pressed: img["SelectorScreen_Help2"],
			onClick: () => openHelp(layer),
		});
		//web某些情况下无法真退
		createCornerButton(ssgroup, {
			pos: [720, 515],
			normal: img["SelectorScreen_Quit1"],
			pressed: img["SelectorScreen_Quit2"],
			onClick: () => openQuit(layer),
		});
		//let buttontypes=["button","highlight","Shadow"];
		const gbname=(name,type)=>{
			const shadow=(type==="Shadow");
			let ft="SelectorScreen_",lt=MAP.nameMap[type][name];
			if(shadow)ft+="Shadow_";
			if(!lt){lt=name;if(!shadow)lt+="_"+type;}
			return img[ft+lt];
		}
		const gbdialog=(name)=>{
			core.dialog({
				title:"未解锁！",
				text:["进行更多新冒险来解锁"+name],
				button:{
					first:{
						text:"确定",
						event:(slayer)=>{
							slayer.destroy();
						}
					}
				}
			},layer,10);
		}
		let gbspmap=[];

		let startad=true;
		if(!startad){
			MAP.buttons[0]="Adventure";MAP.pos[0][0]=[405,79];MAP.pos[1][0]=[406,80];
			MAP.hitArea[0]=[[8,4],[324,32],[316,114],[207,101],[196,113],[103,101],[90,83],[3,72]];
		}
		const gbeventmap=[
			{
				event:()=>enterAdventure(layer, ssgroup, gbspmap)
			},
			{
				event:()=>{
					gbdialog("abc");
				},forbid:()=>{
					gbdialog("迷你游戏");
				},
			},
			{
				event:()=>{
					gbdialog("abc");
				},forbid:()=>{
					gbdialog("解谜模式");
				},
			},
			{
				event:()=>{
					gbdialog("abc");
				},forbid:()=>{
					gbdialog("生存模式");
				},
			},
		];
		let gbforbidmap=[false,true,true,true];
		
		for(let ni=0;ni<4;ni++){
			let gbcr=core.set(
				new Container(),
				{
					parent:ssgroup,
					zIndex:4,
					pos:MAP.pos[0][ni]
				}
			);
			let gbutton=core.set(
				new Sprite(gbname(MAP.buttons[ni],"button")),
				{
					parent:gbcr,
					interactive:true,
					hitArea:new Polygon(MAP.hitArea[ni].flat())
				}
			);
			let gbshadow=core.set(
				new Sprite(gbname(MAP.buttons[ni],"Shadow")),
				{
					parent:ssgroup,
					zIndex:3,
					pos:MAP.pos[1][ni]
				}
			);
			let gbfilter=new PIXI.ColorMatrixFilter();
			gbutton.filters=[gbfilter];
			if(gbforbidmap[ni])gbfilter.brightness(0.5);
			core.pointer(gbutton,{
				up:{
					over:()=>{
						Cursor="pointer";
						if(!gbforbidmap[ni]){
							gbutton.texture=gbname(MAP.buttons[ni],"highlight");
							core.sound("bleep");
						}
					},
					out:()=>{
						Cursor=core.cursor;
						if(!gbforbidmap[ni])gbutton.texture=gbname(MAP.buttons[ni],"button");
					},
					up:()=>{
						if(!gbforbidmap[ni])gbutton.texture=gbname(MAP.buttons[ni],"button");
					}
				},down:{
					down:()=>{
						gbutton.position.set(1);core.sound("gravebutton");
					},
					up:()=>{
						gbutton.position.set(0);
						Cursor=core.cursor;
						if(!gbforbidmap[ni])gbutton.texture=gbname(MAP.buttons[ni],"button");
						gbeventmap[ni][gbforbidmap[ni]?"forbid":"event"]();
					},
					over:()=>{
						gbutton.position.set(1);Cursor="pointer";
						if(!gbforbidmap[ni])core.sound("bleep");
					},
					out:()=>{
						gbutton.position.set(0);Cursor=core.cursor;
					}
	
				}
			});

			gbspmap[ni]=[gbcr,gbutton,gbshadow,gbfilter];
		}
	}
	function createCornerButton(parent, { pos, normal, pressed, onClick }) {
		const btn = core.set(new Sprite(normal), {
			parent, zIndex: 4, pos, interactive: true
		});
		const imgs = [normal, pressed];
	
		core.pointer(btn, {
			up: {
				over: () => { Cursor = "pointer"; btn.texture = imgs[1]; core.sound("bleep"); },
				out:  () => { Cursor = core.cursor; btn.texture = imgs[0]; },
				up:   () => { btn.texture = imgs[0]; }
			},
			down: {
				down: () => { btn.position.set(pos[0] + 1, pos[1] + 1); core.sound("tap"); },
				up:   () => { btn.position.set(pos[0], pos[1]); Cursor = core.cursor; btn.texture = imgs[0]; onClick(); },
				over: () => { btn.position.set(pos[0] + 1, pos[1] + 1); Cursor = "pointer"; core.sound("bleep"); },
				out:  () => { btn.position.set(pos[0], pos[1]); Cursor = core.cursor; }
			}
		});
		return btn;
	}
	function openHelp(layer){
		core.killTimelines();
		layer.destroy();
		core.bgm.stop();
		core.zombienote({
			note:"ZombieNoteHelp",
			notepos:[131,132],
			button:{
				first:{
					text:"主菜单",
					event:(zlayer)=>{
						core.killTimelines()
						zlayer.destroy();
						core.bgm.play("CrazyDave");
						core.selectorscreen();
					}
				}
			}
		});
	}
	function openQuit(layer){
		core.dialog({
			title:"退出",
			text:["确定要退出游戏吗？"],
			button:{
				first:{
					text:"退出游戏",
					event:()=>{
						window.close();
						window.setTimeout(()=>{
							//能够执行到这里说明关闭未成功，那就把界面删除吧，就当是关了
							alert("若想关闭，请手动关闭！");
							document.getElementById("gameGroup").remove();
						},4);
					}
				},
				second:{
					text:"取消",
					event:(slayer)=>{
						slayer.destroy();
					}
				}
			}
		},layer,10);
	}
	function enterAdventure(layer, ssgroup, gbspmap) {
		const hand = core.animate(core.ani["zomhand"], ssgroup);
		hand.cr.zIndex = 5;
		hand.play();
	
		core.wall(20, layer);
	
		const glimmer = gsap.timeline({ repeat: -1 });
		core.timelines.push(glimmer);
		let gl = false;
		glimmer.add(() => {
			gbspmap[0][3].brightness(gl ? 1 : 0.5);
			gl = !gl;
		}, 0.1);
	
		const stl = gsap.timeline();
		core.timelines.push(stl);
		core.bgm.stop();
		core.sound("losemusic", 0, stl);
		core.sound("evillaugh", 1333, stl);
		stl.add(() => {
			core.killTimelines();
			layer.destroy();
			//core.gamescreen();
			core.selectorscreen();
		}, 5.1);
	}
})();

