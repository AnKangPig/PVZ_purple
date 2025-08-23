(()=>{

	const {Sprite,Container,Text,Rectangle} = PIXI;

	//对话框
	core.dialog=function(options,parent,zIndex=0){
		
		const slayer=new Container({width:800,height:600,zIndex});
		if(parent)parent.addChild(slayer);
		slayer.interactive=true;
		slayer.hitArea=new Rectangle(0,0,800,600);
		const cr=new Container();
		const textcr=new Container({width:335});
		let title;
		//标题文字
		if(options.title){
			title=core.set(
				new Text({
					...core.afont(options.title,'Font3',24,0xdeba61,1.5),
					align:"center"
				}),
				{
					parent:textcr,
					pos:[162,7],
					anchor:[0.5,0]
				}
			)
		}
		let texts;
		//正文
		if(options.text){
			const alltext=options.text.join("\n");
			texts=core.set(
				new Text({
					...core.afont(alltext,'Font5',16,0xdeba61,1.5),
					align:"center"
				}),
				{
					parent:textcr,
					pos:[334/2,((options.title)?7+title.height:0)+5],
					anchor:[0.5,0]
				}
			)
		}
		//文字高度
		let height=((options.title)?7+title.height:0)+((options.text)?5+texts.height:0);
		//高度拓展格数（对话框抻多高）
		let eh=Math.ceil(Math.max((height-77)/54,0));
		//首行
		let top=dialog_line(cr,"top",45);
		//上边的骷髅头
		let dheader=core.set(
			new Sprite(img["dialog_header"]),
			{
				parent:cr,
				pos:[108,0],
				zIndex:1
			}
		)
		//中间行（可能多个）
		for(let i=0;i<eh;i++){
			let cen=dialog_line(cr,"center",142+i*54);
		}
		//底行
		let bottom=dialog_line(cr,"bottom",142+eh*54);
		core.set(textcr,
			{
				parent:cr,
				pos:[34,78],
				zIndex:2
			}
		);
		core.set(cr,
			{
				parent:slayer,
				pos:[400,300],
				//+1，-1为校准值
				pivot:[parseInt(cr.width/2)+1,parseInt(cr.height/2)-1],
				interactive:true
			}
		);
		//设置拖动
		core.setDrag(cr,slayer);
		if(options.button.second){
			//左右两个按钮
			let buttona=core.set(
				dialogbutton(options.button.first.text,()=>{
					options.button.first.event(slayer);
				}),
				{
					parent:cr,
					pos:[31,174]
				}
			);
			let buttonb=core.set(
				dialogbutton(options.button.second.text,()=>{
					options.button.second.event(slayer);
				}),
				{
					parent:cr,
					pos:[207,174]
				}
			);
		}else{
			//单个按钮
			let buttona=core.set(
				dialogbutton(options.button.first.text,()=>{
					options.button.first.event(slayer);
				},5),
				{
					parent:cr,
					pos:[50,174]
				}
			);
		}
		
		return slayer;
	}

	function dialog_line(cr,key,Y){
		let left=core.set(
			new Sprite(img["dialog_"+key+"left"]),
			{parent:cr,pos:[0,Y]}
		)
		let ma=core.set(
			new Sprite(img["dialog_"+key+"middle"]),
			{parent:cr,pos:[107,Y]}
		)
		let mb=core.set(
			new Sprite(img["dialog_"+key+"middle"]),
			{parent:cr,pos:[200,Y]}
		)
		let right=core.set(
			new Sprite(img["dialog_"+key+"right"]),
			{parent:cr,pos:[293,Y]}
		)
		return [left,ma,mb,right];
	}
	function dialogbutton(text,event,mnum=2){
		const cr=core.set(new Container(),{
			zIndex:2,
			interactive:true
		});
		//图片容器
		const icr=core.set(new Container(),{
			parent:cr,
			zIndex:0
		});
		const bimgs={
			left:[img["button_left"],img["button_down_left"]],
			middle:[img["button_middle"],img["button_down_middle"]],
			right:[img["button_right"],img["button_down_right"]]
		};
		let left=core.set(new Sprite(bimgs.left[0]),{parent:icr,pos:[0,0]});
		let middles=[];
		for(let i=0;i<mnum;i++){
			middles.push(core.set(new Sprite(bimgs.middle[0]),{parent:icr,pos:[36+i*46,0]}));
		}
		let right=core.set(new Sprite(bimgs.right[0]),{parent:icr,pos:[36+mnum*46,0]});
		
		let ttext=core.set(
			new Text(core.afont(text,'Font6',19,0x00d600,-2.5)),{
				parent:cr,
				anchor:[0.5,0.5],
				pos:[34+mnum*23,20],
				zIndex:1
			}
		);
		//一个负责按下时偏移的函数
		const tt=n=>{
			ttext.position.set(34+mnum*23+n,20+n);
			icr.position.set(n,0);
			left.texture=bimgs.left[n];
			middles.forEach(middle => {
				middle.texture=bimgs.middle[n];
			});
			right.texture=bimgs.right[n];
		}
		core.pointer(cr,{
			up:{
				over:()=>{Cursor="pointer";},
				out:()=>{Cursor=core.cursor;}
			},
			down:{
				over:()=>{tt(1);},
				out:()=>{tt(0);},
				down:()=>{tt(1);core.sound("gravebutton");},
				up:()=>{event();Cursor=core.cursor;},
			}
		});

		return cr;
	}
    
})();

