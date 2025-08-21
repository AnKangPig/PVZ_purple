(()=>{

	const {Sprite,Container,Rectangle,Text} = PIXI;

	
	core.zombienote=function(options){

		const layer=new Container({width:800,height:600});
		core.app.stage.addChild(layer);
		const tl = gsap.timeline();
		core.timelines.push(tl);

        core.sound("paper");

        let blackcurtain=core.set(
            core.fillRect(0/*black*/,0,0,800,600),
            {
                parent:layer,
                zIndex:3
            }
        );
		tl.to(blackcurtain,{alpha:0, duration:1.7},0);

        let background=core.set(
            new Sprite(new PIXI.Texture({
                source:img["background1"].baseTexture,
                frame:new Rectangle(350, 150, 400, 300)
            })),
            {
                parent:layer,
                zIndex:1,
                scale:2
            }
        );
        let bcr=core.set(
            new Container(),
            {
                parent:layer,
                zIndex:2,
                pos:[324,520]
            }
        );
        let button=core.set(
            new Sprite(img["SeedChooser_Button"]),
            {
                parent:bcr,
                zIndex:2,
                interactive:true
            }
        );
        let btext=core.set(
            new Text(core.afont(options.button.first.text,'Font5',15,0xd49e2b,1.5)),
            {
                parent:button,
                pos:[76,22],
                pivot:[23,10],
                zIndex:1
            }
        );
       
        let bglow=core.set(
            new Sprite(img["SeedChooser_Button_Glow"]),
            {
                parent:button,
                zIndex:2,
                blendMode:"screen",
                visible:false
            }
        );

        core.pointer(button,{
			up:{
				over:()=>{
                    Cursor="pointer";
                    bglow.visible=true;
                },
				out:()=>{
                    Cursor=core.cursor;
                    bglow.visible=false;
                }
			},
			down:{
				over:()=>{
                    Cursor="pointer";
                    bglow.visible=true;
                    button.position.set(1);
                },
				out:()=>{
                    Cursor=core.cursor;
                    bglow.visible=false;
                    button.position.set(0);
                },
				down:()=>{
                    core.sound("tap");
                    button.position.set(1);
                },
				up:()=>{
                    Cursor=core.cursor;
                    options.button.first.event(layer);
                },
			}
		});
        let notepaper=core.set(
            new Sprite(img["ZombieNote"]),
            {
                parent:layer,
                zIndex:2,
                pos:[80,80]
            }
        );
        let notetext=core.set(
            new Sprite(img[options.note]),
            {
                parent:layer,
                zIndex:3,
                pos:options.notepos
            }
        );
        //title和second按钮等1-10再做
	}

})();

