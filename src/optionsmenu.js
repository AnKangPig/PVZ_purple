(()=>{

	const {Sprite,Container,Text,Rectangle} = PIXI;

	/**
	 * 
	 * @param {*} parent 
	 * @param {*} zIndex 
	 * @returns 
	 */
	core.optionsmenu= function(parent,zIndex=0){
		const olayer=new Container({width:800,height:600,zIndex});
		if(parent)parent.addChild(olayer);
		olayer.interactive=true;
		olayer.hitArea=new Rectangle(0,0,800,600);
		const cr=new Container();
		let menu=core.set(
			new Sprite(img["options_menuback"]),
			{parent:cr}
		);
		core.set(cr,
			{
				parent:olayer,
				pos:[400,300],
				pivot:[parseInt(cr.width/2)+1,parseInt(cr.height/2)],
				interactive:true
			}
		);
		core.setDrag(cr,olayer);
		
		let bbcr=core.set(
			new Container(),
			{
				parent:cr,
				pos:[30,381],
				zIndex:1,
				interactive:true
			}
		)
		let bbutton=core.set(
			new Sprite(img["options_backtogamebutton0"]),
			{
				parent:bbcr,
				pos:[0,0]
			}
		);
		let bt=core.set(
			new Text({
				text:"确定",
				style: {
					fontFamily: 'Font3',
					fontSize: 35,
					fill: 0x00d600,
					dropShadow:{
						distance:-2.5
					}
				}
			}),
			{
				parent:bbcr,
				pos:[145,27]
			}
		);
		
		core.pointer(bbcr,{
			up:{
				over:()=>{Cursor="pointer";},
				out:()=>{Cursor=core.cursor;}
			},
			down:{
				over:()=>{
					bt.position.set(145,27+1);
					bbutton.texture=img["options_backtogamebutton2"];
				},
				out:()=>{
					bt.position.set(145,27);
					bbutton.texture=img["options_backtogamebutton0"];
				},
				down:()=>{
					bt.position.set(145,27+1);
					bbutton.texture=img["options_backtogamebutton2"];
					core.sound("gravebutton");
				},
				up:()=>{
					olayer.destroy();
					Cursor=core.cursor;
					core.sound("buttonclick");
					//处理全屏
					localStorage.setItem("full",full);
					if((!full)&&core.isFullscreen()){document.exitFullscreen();}
					core.resize();
					document.removeEventListener('fullscreenchange',updateStatus);
				},
			}
		});
		let mtext=core.set(
			new Text(core.afont("音乐",'Font6',20,0x6a6c90,1.5)),
			{parent:cr,zIndex:1,pos:[141,124]}
		);
		let stext=core.set(
			new Text(core.afont("音效",'Font6',20,0x6a6c90,1.5)),
			{parent:cr,zIndex:1,pos:[114,156]}
		);
		let ftext=core.set(
			new Text(core.afont("全屏",'Font6',20,0x6a6c90,1.5)),
			{parent:cr,zIndex:1,pos:[176,190]}
		);
		let full=localStorage.getItem('full')==="true";
		let cbfull=()=>img["options_checkbox"+(full?1:0)];
		let fullco=()=>img["full"+(core.isFullscreen()?"close":"open")];
		let fcheck=core.set(
			new Sprite(cbfull()),
			{
				parent:cr,
				pos:[285,188],
				interactive:true,
				zIndex:1
			}
		);
		fcheck.on("pointerdown",e=>{
			e.stopPropagation();
			core.sound("buttonclick");
			full=!full;fcheck.texture=cbfull();
			updateVisibility();
		});
		let fb=core.set(
			new Sprite(fullco()),
			{
				parent:cr,
				pos:[242,186],
				scale:[0.8,0.8],
				zIndex:1
			}
		)
		const updateVisibility=()=>{
			core.set(fb,{
				interactive:full,
				visible:full
			});
		}
		updateVisibility();
		fb.on("pointerdown",e=>{e.stopPropagation();});
		fb.on("pointerup",e=>{
			e.stopPropagation();
			core.sound("buttonclick");
			full=true;localStorage.setItem("full",true);
			core.resize();
			if(core.isFullscreen()){
				document.exitFullscreen();
			}else{
				core.gdom.requestFullscreen();
			}
		});
		const updateStatus=()=>{fb.texture=fullco();};
		document.addEventListener('fullscreenchange',updateStatus);

		let mslot=core.set(
			new Sprite(img["options_sliderslot"]),
			{
				parent:cr,
				pos:[199,136],
				zIndex:1
			}
		)

		let sslot=core.set(
			new Sprite(img["options_sliderslot"]),
			{
				parent:cr,
				pos:[199,168],
				zIndex:1
			}
		)
		let mvolume=Number(localStorage.getItem("BGM_Volume"));
		let mknob=core.set(
			new Sprite(img["options_sliderknob2"]),
			{
				parent:cr,
				pos:[199*(1-mvolume)+312*mvolume,126],
				interactive:true,
				zIndex:2
			}
		)
		core.setSlide(mknob,olayer,{
			start:[199,126],end:[312,126]
		},{
			move:function(ratio){
				let volume=core.fixed(ratio,2);
				core.bgm.audio.volume=volume*core.soundlist.factor;
			},finish:function(ratio){
				let volume=core.fixed(ratio,2);
				localStorage.setItem("BGM_Volume",volume);
				core.bgm.audio.volume=volume*core.soundlist.factor;
			},
		});
		let svolume=Number(localStorage.getItem("Sound_Volume"));
		let sknob=core.set(
			new Sprite(img["options_sliderknob2"]),
			{
				parent:cr,
				pos:[199*(1-svolume)+312*svolume,158],
				interactive:true,
				zIndex:2
			}
		)
		core.setSlide(sknob,olayer,{
			start:[199,158],end:[312,158]
		},{
			finish:function(ratio){
				let volume=core.fixed(ratio,2);
				localStorage.setItem("Sound_Volume",volume);
				core.soundlist.volume=volume*core.soundlist.factor;
				core.soundlist.sounds.forEach(sound=>{sound.volume=volume*core.soundlist.factor;});
				core.sound("buttonclick");
			}
		});



		
		return olayer;
	}
    
})();