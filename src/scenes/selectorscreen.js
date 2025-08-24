(()=>{

	const {Sprite,Container,Rectangle} = PIXI;

	
	core.selectorscreen=function(){

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

		//1背景 2云 3房子 4左树 5木牌/墓碑 6墓碑上的东西 10设置

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
				pos:[800,600]
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
		ssleaves.cr.zIndex=2;ssleaves.repeat=-1;
		ssleaves.play();

		//1~2倍变速（变调）
		let flowerpop=()=>core.pitchedsound("limbs_pop",core.fixed(core.random(1,2),2));
		//右下角能被点掉的三朵小花（彩蛋）
		const flowerA=core.animate(core.ani["ssf1"],ssgroup);
		flowerA.cr.zIndex=7;flowerA.frf();
		flowerA.cr.interactive=true;
		flowerA.cr.addEventListener("pointerdown",()=>{flowerpop();flowerA.play();},{once:true});

		const flowerB=core.animate(core.ani["ssf2"],ssgroup);
		flowerB.cr.zIndex=7;flowerB.frf();
		flowerB.cr.interactive=true;
		flowerB.cr.addEventListener("pointerdown",()=>{flowerpop();flowerB.play();},{once:true});

		const flowerC=core.animate(core.ani["ssf3"],ssgroup);
		flowerC.cr.zIndex=7;flowerC.frf();
		flowerC.cr.interactive=true;
		flowerC.cr.addEventListener("pointerdown",()=>{flowerpop();flowerC.play();},{once:true});

		//选项
		const buttonoptions=core.set(
			new Sprite(img["SelectorScreen_Options1"]),
			{
				parent:ssgroup,
				zIndex:6,
				pos:[564,489],
				interactive:true
			}
		);
		const bopimg=[img["SelectorScreen_Options1"],img["SelectorScreen_Options2"]];

		core.pointer(buttonoptions,{
			up:{
				over:()=>{Cursor="pointer";buttonoptions.texture=bopimg[1];core.sound("bleep");},
				out:()=>{Cursor=core.cursor;buttonoptions.texture=bopimg[0];},
				up:()=>{buttonoptions.texture=bopimg[0];}
			},down:{
				down:()=>{
					buttonoptions.position.set(564+1,489+1);core.sound("tap");
				},
				up:()=>{
					buttonoptions.position.set(564,489);
					Cursor=core.cursor;buttonoptions.texture=bopimg[0];
					core.optionsmenu(layer,10);
				},
				over:()=>{
					buttonoptions.position.set(564+1,489+1);Cursor="pointer";core.sound("bleep");
				},
				out:()=>{
					buttonoptions.position.set(564,489);Cursor=core.cursor;
				}

			}
		});

		//帮助
		const buttonhelp=core.set(
			new Sprite(img["SelectorScreen_Help1"]),
			{
				parent:ssgroup,
				zIndex:6,
				pos:[647,529],
				interactive:true
			}
		);
		const bhpimg=[img["SelectorScreen_Help1"],img["SelectorScreen_Help2"]];

		core.pointer(buttonhelp,{
			up:{
				over:()=>{Cursor="pointer";buttonhelp.texture=bhpimg[1];core.sound("bleep");},
				out:()=>{Cursor=core.cursor;buttonhelp.texture=bhpimg[0];},
				up:()=>{buttonhelp.texture=bhpimg[0];}
			},down:{
				down:()=>{
					buttonhelp.position.set(647+1,529+1);core.sound("tap");
				},
				up:()=>{
					buttonhelp.position.set(647,529);
					Cursor=core.cursor;buttonhelp.texture=bhpimg[0];
					core.killTimelines()
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
				},
				over:()=>{
					buttonhelp.position.set(647+1,529+1);Cursor="pointer";core.sound("bleep");
				},
				out:()=>{
					buttonhelp.position.set(647,529);Cursor=core.cursor;
				}

			}
		});

		//退出（web某些情况下无法真退）
		const buttonquit=core.set(
			new Sprite(img["SelectorScreen_Quit1"]),
			{
				parent:ssgroup,
				zIndex:6,
				pos:[720,515],
				interactive:true
			}
		);
		const bqtimg=[img["SelectorScreen_Quit1"],img["SelectorScreen_Quit2"]];
		
		core.pointer(buttonquit,{
			up:{
				over:()=>{Cursor="pointer";buttonquit.texture=bqtimg[1];core.sound("bleep");},
				out:()=>{Cursor=core.cursor;buttonquit.texture=bqtimg[0];},
				up:()=>{buttonquit.texture=bqtimg[0];}
			},down:{
				down:()=>{
					buttonquit.position.set(720+1,515+1);core.sound("tap");
				},
				up:()=>{
					buttonquit.position.set(720,515);
					Cursor=core.cursor;buttonquit.texture=bqtimg[0];
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
				},
				over:()=>{
					buttonquit.position.set(720+1,515+1);Cursor="pointer";core.sound("bleep");
				},
				out:()=>{
					buttonquit.position.set(720,515);Cursor=core.cursor;
				}
			}
		});
		let gamebuttons=["StartAdventure","Adventure","Survival","Challenges","Vasebreaker"];
		let buttontypes=["button","highlight","Shadow"];
		const gbname=(name,type)=>{
			const map={
				Shadow:{
					Challenges:"Challenge",//无s
					Vasebreaker:"ZenGarden"//ZenGarden！
				},
				button:{
					StartAdventure:"StartAdventure_Button1"//大写B，多1
				},
				highlight:{
					StartAdventure:"StartAdventure_Highlight",//大写H
					Vasebreaker:"vasebreaker_highlight"//小写v
				}
			}
			const shadow=(type==="Shadow");
			let ft="SelectorScreen_",lt=map[type][name];
			if(shadow)ft+="Shadow_";
			if(!lt){
				lt=name;if(!shadow)lt+="_"+type;
			}
			return img[ft+lt];
		}
		
	}


})();

