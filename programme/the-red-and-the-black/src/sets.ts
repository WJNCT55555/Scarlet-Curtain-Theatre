/* 《红与黑》专属换景层。永久剧场、幕布与台口机械沿用参考引擎，
   三套景片则作为可推入的实体舞台模型叠加。 */
var Sets:SetsApi=(function(){
  var T=Theater,roots:Record<string,any>={},fx:Record<string,any>={},cur:string|null='mill';
  function tex(w,h,paint){var c=makeCanvas(w,h),x=c.getContext('2d');if(!x)throw new Error('Canvas 2D context is unavailable');paint(x,w,h);var t=new THREE.CanvasTexture(c);t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;return t}
  function backdrop(paint){var p=new THREE.Mesh(new THREE.PlaneGeometry(156,62),new THREE.MeshBasicMaterial({map:tex(320,128,paint)}));p.position.set(0,31,-33.7);return p}
  function label(text,w,h,bg,fg,size){return new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tex(192,48,function(x,W,H){x.fillStyle=bg;x.fillRect(0,0,W,H);x.strokeStyle=fg;x.lineWidth=3;x.strokeRect(4,4,W-8,H-8);x.fillStyle=fg;x.font='bold '+(size||22)+'px Georgia';x.textAlign='center';x.textBaseline='middle';x.fillText(text,W/2,H/2+1)})}))}
  function speck(x,w,h,c,n,a){x.globalAlpha=a||.2;x.fillStyle=c;for(var i=0;i<n;i++)x.fillRect(Math.random()*w|0,Math.random()*h|0,1,1);x.globalAlpha=1}
  function buildMill(){
    var r=new THREE.Group();roots.mill=r;T.scene().add(r);fx.mill={};
    var bd=backdrop(function(x,w,h){
      x.fillStyle='#10131a';x.fillRect(0,0,w,h);for(var i=0;i<6;i++){x.fillStyle=['#181c24','#20242c','#2b292d'][i%3];x.fillRect(0,i*11,w,11)}
      x.fillStyle='#0a0a0d';x.fillRect(0,72,w,56);x.fillStyle='#303239';for(var m=0;m<12;m++){var xx=m*29-8;x.fillRect(xx,42,18,38);x.fillStyle='#54111d';x.fillRect(xx+3,47,12,5);x.fillStyle='#303239'}
      x.fillStyle='#dad4c7';x.fillRect(226,18,48,54);x.fillStyle='#19191c';x.fillRect(234,28,32,5);x.fillRect(234,39,26,3);x.fillRect(234,49,30,3);x.fillStyle='#a31629';x.fillRect(234,60,25,4);
      x.fillStyle='#5d171c';x.fillRect(0,83,w,3);speck(x,w,h,'#e2c6ad',260,.1);
    });r.add(bd);fx.mill.tintables=[bd.material];
    var saw=new THREE.Group(),table=T.box(54,3,13,'#5a3b27');table.position.y=6;saw.add(table);for(var l=0;l<4;l++){var leg=T.box(2,7,2,'#30251e');leg.position.set(-22+l%2*44,2,-4+l%3*8);saw.add(leg)}
    var blade=new THREE.Mesh(new THREE.CylinderGeometry(7,7,.45,18),T.mat('#9da1a7'));blade.rotation.x=Math.PI/2;blade.position.set(0,11,0);saw.add(blade);for(var b=0;b<8;b++){var tooth=T.box(1.2,2,.5,'#c2c3c4');tooth.position.set(Math.cos(b*Math.PI/4)*7,11+Math.sin(b*Math.PI/4)*7,0);tooth.rotation.z=b*Math.PI/4;saw.add(tooth)}saw.position.set(-33,0,-17);r.add(saw);fx.mill.blade=blade;
    var church=new THREE.Group(),body=T.box(26,35,3,'#2a292d');body.position.y=17.5;church.add(body);var roof=T.cone(18,18,4,'#16151a');roof.position.y=44;roof.rotation.y=Math.PI/4;church.add(roof);var win=T.plane(6,14,'#b5162b');win.position.set(0,21,1.6);church.add(win);var crossV=T.box(1.2,8,1,'#b99b63');crossV.position.set(0,52,0);church.add(crossV);var crossH=T.box(6,1.2,1,'#b99b63');crossH.position.set(0,53,0);church.add(crossH);church.position.set(48,0,-29);r.add(church);
    var logs=new THREE.Group();for(var j=0;j<7;j++){var log=T.cyl(2,2,25,8,j%2?'#704326':'#5c341f');log.rotation.z=Math.PI/2;log.position.set((j%3)*4,j*2,0);logs.add(log)}logs.position.set(20,0,-12);r.add(logs);
    var dust=new THREE.Group();for(var d=0;d<28;d++){var q=T.plane(.45,.45,d%4?'#d6aa72':'#d72b3c',{transparent:true,opacity:.35});q.position.set(rand(-65,65),rand(3,43),rand(-27,5));q.userData={p:rand(0,6),s:rand(.3,1)};dust.add(q)}r.add(dust);fx.mill.dust=dust;
  }
  function makeAmp(x,z){var g=new THREE.Group(),cab=T.box(14,15,7,'#141418');cab.position.y=7.5;g.add(cab);var grill=T.plane(11,9,'#29282e');grill.position.set(0,7.3,3.55);g.add(grill);for(var i=0;i<2;i++){var sp=new THREE.Mesh(new THREE.CircleGeometry(3,10),T.flat('#09090b'));sp.position.set(-3.2+i*6.4,7.3,3.65);g.add(sp)}var stripe=T.box(14.2,1.2,7.2,'#a91629');stripe.position.y=13;g.add(stripe);g.position.set(x,0,z);return g}
  function buildSalon(){
    var r=new THREE.Group();roots.salon=r;T.scene().add(r);r.visible=false;fx.salon={};
    var bd=backdrop(function(x,w,h){x.fillStyle='#08080c';x.fillRect(0,0,w,h);x.fillStyle='#1a171e';for(var i=0;i<10;i++)x.fillRect(i*34,0,18,128);x.fillStyle='#971226';x.fillRect(0,14,w,4);x.fillRect(0,68,w,3);x.fillStyle='#bc9a62';for(var j=0;j<7;j++){x.fillRect(j*52,20,2,42);x.fillRect(j*52+3,24,38,2);x.fillRect(j*52+3,57,38,2)}x.fillStyle='#efe4d4';x.fillRect(132,24,58,34);x.fillStyle='#111117';x.fillRect(138,29,46,24);x.fillStyle='#ba1830';x.fillRect(154,29,15,24);speck(x,w,h,'#e2c8a2',180,.09)});r.add(bd);fx.salon.tintables=[bd.material];
    var riser=T.box(96,2.8,25,'#24151b');riser.position.set(0,1.4,-21);r.add(riser);r.add(makeAmp(-49,-24));r.add(makeAmp(49,-24));
    var drums=new THREE.Group();for(var i=0;i<3;i++){var dm=T.cyl(3.4,3.4,3.7,10,i===1?'#a7162b':'#24232a');dm.rotation.x=Math.PI/2;dm.position.set(-6+i*6,6,i===1?0:2);drums.add(dm)}var cym=T.cyl(4,4,.25,12,'#b99b58');cym.position.set(9,11,0);drums.add(cym);var stand=T.cyl(.18,.18,9,5,'#67636a');stand.position.set(9,5,0);drums.add(stand);drums.position.set(0,0,-27);r.add(drums);fx.salon.cym=cym;
    var sign=label('LE ROUGE / LE NOIR',46,7,'#08080b','#df1e39',18);sign.position.set(0,38,-32.8);r.add(sign);
    fx.salon.bulbs=[];for(var q=0;q<14;q++){var bulb=T.sph(.8,q%2?'#ef233f':'#eee8d8',7,5);bulb.material=T.flat(q%2?'#ef233f':'#eee8d8');bulb.position.set(-58+q*9,45-(q%3),-29);r.add(bulb);fx.salon.bulbs.push(bulb)}
    var audience=new THREE.Group();for(var a=0;a<18;a++){var head=T.sph(1.5,a%3?'#1b171a':'#5d1723');head.position.set(-62+(a*19)%124,2+(a%3)*2,5+(a%4)*3);audience.add(head)}r.add(audience);fx.salon.audience=audience;
  }
  function buildTrial(){
    var r=new THREE.Group();roots.trial=r;T.scene().add(r);r.visible=false;fx.trial={};
    var bd=backdrop(function(x,w,h){x.fillStyle='#09090d';x.fillRect(0,0,w,h);x.fillStyle='#201e24';for(var i=0;i<12;i++)x.fillRect(i*28,0,15,128);x.fillStyle='#4a111c';x.fillRect(0,61,w,5);x.fillStyle='#b9a06e';for(var j=0;j<8;j++){x.fillRect(j*45+10,15,22,2);x.fillRect(j*45+20,17,2,39)}x.fillStyle='#ded4c6';x.beginPath();x.arc(160,33,17,0,Math.PI*2);x.fill();x.fillStyle='#111116';x.beginPath();x.arc(160,33,13,0,Math.PI*2);x.fill();x.fillStyle='#9e1426';x.fillRect(158,18,4,30);x.fillRect(145,31,30,4);speck(x,w,h,'#e0d2bd',150,.06)});r.add(bd);fx.trial.tintables=[bd.material];
    var bench=T.box(82,12,9,'#3b2721');bench.position.set(0,6,-25);r.add(bench);var rail=T.box(74,3,3,'#7b5231');rail.position.set(0,10,-5);r.add(rail);for(var i=0;i<7;i++){var post=T.box(1.4,9,1.4,'#5a3a27');post.position.set(-32+i*11,5,-5);r.add(post)}
    var cage=new THREE.Group();for(var b=0;b<7;b++){var bar=T.cyl(.32,.32,27,6,'#25242a');bar.position.set(-9+b*3,13.5,0);cage.add(bar)}var top=T.box(21,1,2,'#25242a');top.position.y=27;cage.add(top);cage.position.set(42,0,-22);r.add(cage);
    var blade=new THREE.Group(),upr1=T.box(2,34,2,'#17171b');upr1.position.set(-7,17,0);blade.add(upr1);var upr2=upr1.clone();upr2.position.x=7;blade.add(upr2);var steel=T.box(13,9,.8,'#babcc2');steel.position.set(0,25,0);steel.rotation.z=-.16;blade.add(steel);blade.position.set(-47,0,-28);r.add(blade);fx.trial.blade=steel;
    var red=T.plane(176,60,'#b20e25',{transparent:true,opacity:0});red.position.set(0,30,-20);red.visible=false;r.add(red);fx.trial.redDrop=red;
  }
  function build(){TheatreShell.build();roots.theatre=TheatreShell.root();fx.theatre=TheatreShell.fx();buildMill();buildSalon();buildTrial()}
  function show(n){cur=n;['mill','salon','trial'].forEach(function(k){roots[k].visible=k===n})}
  function update(dt){TheatreShell.update(dt);var t=performance.now()/1000;if(cur==='mill'){fx.mill.blade.rotation.z-=dt*7;fx.mill.dust.children.forEach(function(q){q.position.x+=Math.sin(t+q.userData.p)*dt; q.position.y+=dt*q.userData.s;if(q.position.y>45)q.position.y=2})}if(cur==='salon'){fx.salon.bulbs.forEach(function(b,i){b.visible=Math.sin(t*8+i*1.7)>-.15});fx.salon.cym.rotation.y=t*2;fx.salon.audience.children.forEach(function(h,i){h.position.y=2+(i%3)*2+Math.abs(Math.sin(t*4+i))*.7})}if(cur==='trial')fx.trial.blade.position.y=25+Math.sin(t*.8)*.4}
  function tint(n,c,d){var f=fx[n];if(!f||!f.tintables)return;f.tintables.forEach(function(m){var from=m.color.clone(),to=new THREE.Color(c),t=0;T.animate(function(dt){t+=dt/(d||2);if(t>=1){m.color.copy(to);return true}m.color.copy(from).lerp(to,easeInOut(t))})})}
  return{build:build,show:show,update:update,tint:tint,setCurtain:TheatreShell.setCurtain,snapCurtain:TheatreShell.snapCurtain,getCurtain:TheatreShell.getCurtain,roots:roots,fx:fx,cur:function(){return cur},shellStyle:TheatreShell.style};
})();
