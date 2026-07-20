interface ShellPalette {
  floor:[string,string,string]; edge:string; skirt:string; trim:string; panel:string; pit:string;
  footShell:string; footGlow:[string,string]; curtain:[string,string,string,string]; fringe:string;
  base:string; shaft:string; flute:string; cap:string; header:string; headerTrim:[string,string];
  crest:[string,string]; wall:[string,string]; boxFloor:string; boxFront:string; boxRail:[string,string]; boxBack:string; back:string;
}

interface TheatreShellApi {
  build():void;
  update(delta:number):void;
  setCurtain(value:number,duration?:number,done?:Done):void;
  snapCurtain(value:number):void;
  getCurtain():number;
  root():any;
  fx():Record<string,any>;
  style():SetStyle;
}

const TheatreShell: TheatreShellApi = (() => {
  const value = new URLSearchParams(location.search).get('set');
  const active: SetStyle = value === 'blackbox' || value === 'electric' ? value : 'proscenium';
  const palettes: Record<SetStyle,ShellPalette> = {
    proscenium:{floor:['#6a4c2e','#755636','#7e5c3a'],edge:'#a8823e',skirt:'#3a1c26',trim:'#8a6a34',panel:'#48242e',pit:'#070509',footShell:'#2e2018',footGlow:['#ffd9a0','#ffd9a0'],curtain:['#48101e','#5c1628','#6a1c2c','#722230'],fringe:'#8a6a34',base:'#5c4020',shaft:'#8a6a34',flute:'#6e5228',cap:'#a8823e',header:'#7a5a2c',headerTrim:['#a8823e','#a8823e'],crest:['#a8823e','#c8a050'],wall:['#160d14','#120b10'],boxFloor:'#2c1620',boxFront:'#4a2432',boxRail:['#8a6a34','#8a6a34'],boxBack:'#1e1018',back:'#0c0810'},
    blackbox:{floor:['#242428','#2b2b30','#323238'],edge:'#68666c',skirt:'#101014',trim:'#3d3c42',panel:'#18181d',pit:'#020204',footShell:'#1a1a1f',footGlow:['#d9dce2','#d9dce2'],curtain:['#0d0d11','#15151a','#202027','#292930'],fringe:'#45444a',base:'#222229',shaft:'#303038',flute:'#45454e',cap:'#55545c',header:'#27272e',headerTrim:['#66656c','#66656c'],crest:['#55545c','#85848b'],wall:['#08080b','#050507'],boxFloor:'#15151a',boxFront:'#24242b',boxRail:['#66666d','#66666d'],boxBack:'#0d0d11',back:'#030305'},
    electric:{floor:['#29232c','#332530','#3a2934'],edge:'#d42443',skirt:'#171018',trim:'#a51c35',panel:'#23141d',pit:'#030205',footShell:'#17151b',footGlow:['#f12a49','#1ea3ad'],curtain:['#2a0712','#48101f','#71152a','#8d1b34'],fringe:'#1ea3ad',base:'#20232a',shaft:'#343842',flute:'#1ea3ad',cap:'#d42443',header:'#242730',headerTrim:['#1ea3ad','#d42443'],crest:['#1ea3ad','#d42443'],wall:['#0b0710','#07050b'],boxFloor:'#18131d',boxFront:'#32202d',boxRail:['#1ea3ad','#d42443'],boxBack:'#100b14',back:'#050308'}
  };
  const palette = palettes[active];
  let shellRoot:any = null;
  const state:Record<string,any> = {footGlows:[]};
  let curtainValue = 0;
  let curtainTween:{done:boolean}|null = null;

  function curtainPanel(side:number):any {
    const group = new THREE.Group();
    for(let index=0;index<20;index+=1){
      const x = side<0 ? -82+index*4.15+2 : 2+index*4.15;
      const pleat = Theater.box(4.4,56,2.4,index%2?palette.curtain[1]:palette.curtain[0]);
      pleat.position.set(x,28,(index%2)*.5); pleat.userData={bz:(index%2)*.5,ph:index*.8}; group.add(pleat);
      const highlight = Theater.box(1.7,56,2.6,index%2?palette.curtain[3]:palette.curtain[2]);
      highlight.position.set(x-1,28,(index%2)*.5+.15); highlight.userData={bz:(index%2)*.5+.15,ph:index*.8+.4}; group.add(highlight);
    }
    const fringe=Theater.box(83,active==='blackbox'?.7:1.6,2.9,palette.fringe);
    fringe.position.set(side<0?-40.5:42.5,.9,.6); group.add(fringe); group.position.set(0,0,5); return group;
  }

  function column(x:number):any {
    const group=new THREE.Group();
    const baseWidth=active==='blackbox'?9:12;
    const shaftWidth=active==='blackbox'?6.5:9;
    const base=Theater.box(baseWidth,active==='blackbox'?3:5,8,palette.base); base.position.y=active==='blackbox'?1.5:2.5; group.add(base);
    const shaft=Theater.box(shaftWidth,active==='blackbox'?50:46,6,palette.shaft); shaft.position.y=28; group.add(shaft);
    for(let line=0;line<(active==='blackbox'?1:2);line+=1){
      const flute=Theater.box(active==='blackbox'?.7:1.2,active==='blackbox'?48:44,6.4,palette.flute);
      flute.position.set(active==='blackbox'?0:-2.4+line*4.8,28,.1); group.add(flute);
    }
    const cap=Theater.box(baseWidth,active==='blackbox'?2:4,8,palette.cap); cap.position.y=53; group.add(cap);
    group.position.set(x,0,13); return group;
  }

  function sideCurtain(x:number):any {
    const group=new THREE.Group();
    for(let index=0;index<5;index+=1){
      const pleat=Theater.box(2.6,50,3,index%2?palette.curtain[1]:palette.curtain[0]);
      pleat.position.set(index*2.5-5,25,(index%2)*.8); group.add(pleat);
    }
    group.position.set(x,0,4); return group;
  }

  function boxSeat(x:number):any {
    const group=new THREE.Group();
    const floor=Theater.box(22,3,14,palette.boxFloor); floor.position.y=-1; group.add(floor);
    const front=active==='blackbox'
      ? Theater.box(22,5,2.5,palette.boxFront)
      : new THREE.Mesh(new THREE.CylinderGeometry(9,9,7,12,1,true,-Math.PI/2,Math.PI),Theater.mat(palette.boxFront));
    front.position.set(0,active==='blackbox'?2.5:3,7); group.add(front);
    const rail=new THREE.Mesh(new THREE.TorusGeometry(9,.7,5,12,Math.PI),Theater.mat(x<0?palette.boxRail[0]:palette.boxRail[1]));
    rail.rotation.x=Math.PI/2; rail.position.set(0,6.6,7); group.add(rail);
    const back=Theater.box(22,18,2,palette.boxBack); back.position.set(0,8,-6); group.add(back);
    group.position.set(x,16,24); return group;
  }

  function build():void {
    if(shellRoot) return;
    document.body.dataset.setShell=active;
    shellRoot=new THREE.Group(); Theater.scene().add(shellRoot);
    for(let index=0;index<25;index+=1){
      const plank=Theater.box(8.2,1.2,58,index%4===0?palette.floor[0]:(index%2?palette.floor[1]:palette.floor[2]));
      plank.position.set(-98.4+index*8.2,-.6,-11); shellRoot.add(plank);
    }
    const edge=Theater.box(200,.5,1.2,palette.edge); edge.position.set(0,.1,17.5); shellRoot.add(edge);
    const skirt=Theater.box(204,15,2.4,palette.skirt); skirt.position.set(0,-7.5,17.6); shellRoot.add(skirt);
    const trim=Theater.box(204,1.4,2.6,palette.trim); trim.position.set(0,-1.2,17.7); shellRoot.add(trim);
    for(let index=0;index<7;index+=1){const panel=Theater.box(20,9,.5,palette.panel);panel.position.set(-84+index*28,-8,18.9);shellRoot.add(panel);}
    const pit=Theater.plane(300,60,palette.pit); pit.rotation.x=-Math.PI/2; pit.position.set(0,-15.8,48); shellRoot.add(pit);
    for(let index=0;index<9;index+=1){
      const x=-64+index*16;
      const lampShell=new THREE.Mesh(new THREE.SphereGeometry(2.1,8,4,0,Math.PI),Theater.mat(palette.footShell));
      lampShell.rotation.x=-Math.PI/2.2; lampShell.position.set(x,.9,15.8); shellRoot.add(lampShell);
      const glow=new THREE.Mesh(new THREE.CircleGeometry(1.15,8),Theater.flat(palette.footGlow[index%2],{transparent:true,opacity:active==='blackbox'?.46:.85}));
      glow.position.set(x,1.5,15.4); shellRoot.add(glow); state.footGlows.push(glow);
    }
    state.curtL=curtainPanel(-1); state.curtR=curtainPanel(1); shellRoot.add(state.curtL); shellRoot.add(state.curtR);
    shellRoot.add(column(-79)); shellRoot.add(column(79));
    const header=Theater.box(174,active==='blackbox'?6:10,6,palette.header); header.position.set(0,active==='blackbox'?58:60,13); shellRoot.add(header);
    const headerTrim=Theater.box(174,active==='blackbox'?1:2,6.6,palette.headerTrim[1]); headerTrim.position.set(0,55.6,13); shellRoot.add(headerTrim);
    if(active==='electric'){
      const left=Theater.box(82,.65,6.9,palette.headerTrim[0]); left.position.set(-43,56.9,13.2); shellRoot.add(left);
      const right=Theater.box(82,.65,6.9,palette.headerTrim[1]); right.position.set(43,56.9,13.2); shellRoot.add(right);
    }
    const crest=new THREE.Group();
    const crestBase=Theater.cyl(active==='blackbox'?2.8:4.6,active==='blackbox'?2.8:4.6,1.2,active==='blackbox'?6:12,palette.crest[0]);crestBase.rotation.x=Math.PI/2;crest.add(crestBase);
    const crestInner=Theater.cyl(active==='blackbox'?1.6:3.4,active==='blackbox'?1.6:3.4,1.4,active==='blackbox'?6:12,palette.crest[1]);crestInner.rotation.x=Math.PI/2;crest.add(crestInner);
    const glyphV=Theater.box(active==='blackbox'?.7:1,active==='blackbox'?3:4.4,1.6,palette.flute);crest.add(glyphV);
    const glyphH=Theater.box(active==='blackbox'?2.4:3.6,active==='blackbox'?.7:1,1.6,palette.flute);glyphH.position.y=1;crest.add(glyphH);
    crest.position.set(0,60,16.4); shellRoot.add(crest);
    shellRoot.add(sideCurtain(-71)); shellRoot.add(sideCurtain(71));
    for(let index=0;index<26;index+=1){const height=12+(index%2)*2.6;const top=Theater.box(5.6,height,3,index%2?palette.curtain[1]:palette.curtain[0]);top.position.set(-70+index*5.6,58-height/2,6);shellRoot.add(top);}
    const wallL=Theater.plane(70,160,palette.wall[0]);wallL.position.set(-120,40,12.5);shellRoot.add(wallL);const wallR=wallL.clone();wallR.position.x=120;shellRoot.add(wallR);
    const wallTop=Theater.plane(300,80,palette.wall[1]);wallTop.position.set(0,105,12.5);shellRoot.add(wallTop);
    shellRoot.add(boxSeat(-88)); shellRoot.add(boxSeat(88));
    const back=Theater.plane(240,100,palette.back);back.position.set(0,40,-38);shellRoot.add(back);
    snapCurtain(0);
  }

  function applyCurtain():void { if(state.curtL){state.curtL.position.x=-84*easeInOut(curtainValue);state.curtR.position.x=84*easeInOut(curtainValue);} }
  function setCurtain(value:number,duration=2.6,done?:Done):void {
    const from=curtainValue;let elapsed=0;if(curtainTween)curtainTween.done=true;const token={done:false};curtainTween=token;
    if(Math.abs(from-value)>.02)AudioSys.sfx.curtainSwish();
    Theater.animate((delta:number)=>{if(token.done)return true;elapsed+=delta/duration;if(elapsed>=1){curtainValue=value;applyCurtain();done?.();curtainTween=null;return true;}curtainValue=lerp(from,value,easeInOut(elapsed));applyCurtain();return false;});
  }
  function snapCurtain(value:number):void {if(curtainTween){curtainTween.done=true;curtainTween=null;}curtainValue=value;applyCurtain();}
  function update(_delta:number):void {
    const time=performance.now()/1000;
    const base=active==='blackbox'?.28:(active==='electric'?.82:.72);
    state.footGlows.forEach((glow:any,index:number)=>{glow.material.opacity=base+Math.sin(time*5+index*1.9)*.12;});
    if(state.curtL&&curtainValue<.98){[state.curtL,state.curtR].forEach((panel:any,panelIndex:number)=>panel.children.forEach((pleat:any)=>{if(pleat.userData&&pleat.userData.bz!==undefined)pleat.position.z=pleat.userData.bz+Math.sin(time*.9+pleat.userData.ph+panelIndex*2)*.22;}));}
  }
  return {build,update,setCurtain,snapCurtain,getCurtain:()=>curtainValue,root:()=>shellRoot,fx:()=>state,style:()=>active};
})();
