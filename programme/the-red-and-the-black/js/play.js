'use strict';
/* 《红与黑》三章摇滚小剧场。镜头始终承认台口与景片，仅在情绪破裂点推进。 */
var Play=(function(){
  var A=Actors,T=Theater,D=Director.D,props={};
  var CAM={
    master:function(d){return{pos:[0,25,238],look:[0,17,-3],fov:28,dur:d||2.4,drift:.12}},
    pan:function(x,d){x=clamp(x,-38,38);return{pos:[x*.72,23,188],look:[x,15,-8],fov:26,dur:d||2,drift:.16}},
    med:function(x,d,y){return{pos:[x*.84,19,112],look:[x,y||13,-10],fov:25,dur:d||1.5,drift:.2}},
    close:function(x,d,y){return{pos:[x,15,61],look:[x,y||11,-12],fov:23,dur:d||.85,drift:.28}},
    low:function(x,d){return{pos:[x*.65,9,128],look:[x,16,-12],fov:28,dur:d||1.3,drift:.3}}
  };
  function actor(name,def){var a=A.makeActor(name,def);a.root.position.set(240,0,-10);a.root.visible=false;return a}
  function guitar(color){var g=A.makeGuitar();g.children.forEach(function(c){if(c.material&&c.material.color)c.material.color.set(color)});return g}
  function buildCast(){
    actor('julien',{skin:'#e0b58e',hair:'#17151a',coat:'#171820',body:'#2b2c35',sash:'#b7172c',pants:'#171820',boots:'#101014',eye:'#101014',brow:'angry',scale:1.01});
    actor('renale',{skin:'#e8bea0',hair:'#4b3027',bun:true,body:'#e5d7cc',dress:{tiers:['#e5d7cc','#cdbdb4','#b7aaa6'],len:8.3},sash:'#a51a2e',earring:'#c8a45f',lips:'#9f2838',brow:'soft',scale:.97});
    actor('mathilde',{skin:'#e5b996',hair:'#d0a766',hairLong:true,body:'#9c1328',dress:{tiers:['#9c1328','#74101f','#15151a'],len:8.2},sash:'#d7b253',earring:'#d7b253',lips:'#a21b31',brow:'soft',scale:1.0});
    actor('mayor',{skin:'#dfb28a',hair:'#4b3d34',coat:'#293a50',body:'#293a50',sash:'#a7192e',buttons:'#c7a25d',pants:'#d2c8ba',shoe:'#17151a',beard:'#50443a',brow:'angry',scale:1.08});
    actor('abbe',{skin:'#d8ae89',hair:'#aaa39c',body:'#181820',coat:'#181820',pants:'#141419',shoe:'#0c0c10',brow:'soft',scale:1.03});
    actor('judge',{skin:'#dbb08b',hair:'#ddd6cc',body:'#251d24',coat:'#131318',sash:'#a91a30',pants:'#111116',shoe:'#0b0b0d',brow:'angry',scale:1.06});
    actor('guitarist',{skin:'#c9926c',hair:'#171418',body:'#64101d',coat:'#64101d',pants:'#17171c',shoe:'#0b0b0e',brow:'soft',scale:.98});
    actor('bassist',{skin:'#d8aa84',hair:'#262127',body:'#25242c',coat:'#25242c',sash:'#bd1d34',pants:'#16161c',shoe:'#0a0a0c',brow:'soft',scale:1.04});
    actor('drummer',{skin:'#c58f6b',hair:'#111116',body:'#b21830',pants:'#17171c',shoe:'#0a0a0c',brow:'soft',scale:.96});
    actor('worker1',{skin:'#cf9c73',hair:'#30241d',body:'#544535',pants:'#2d2925',shoe:'#151310',brow:'soft',scale:1.04});
    actor('worker2',{skin:'#dfad85',hair:'#211a18',hat:{type:'brim',color:'#3d3024'},body:'#6b5740',pants:'#302b25',shoe:'#17130f',brow:'soft',scale:.98});
    actor('lady',{skin:'#e2b792',hair:'#38241e',bun:true,body:'#66506e',dress:{tiers:['#66506e','#4a394f'],len:7.8},sash:'#b99e6a',brow:'soft',scale:.94});
    props.redBook=T.box(2.5,3.6,.6,'#a8162b');props.redBook.visible=false;A.cast.julien.armL.grip.add(props.redBook);props.redBook.position.set(0,-.8,0);props.redBook.rotation.z=-.2;
    props.jGuitar=guitar('#a9152a');props.jGuitar.visible=false;A.cast.julien.armR.grip.add(props.jGuitar);props.jGuitar.position.set(-1,-1,1.6);props.jGuitar.rotation.set(.15,0,1.05);
    props.guitar=guitar('#6d1522');A.cast.guitarist.armL.grip.add(props.guitar);props.guitar.position.set(1.2,0,1.2);props.guitar.rotation.set(.2,0,-1.15);
    props.bass=guitar('#1a1a21');A.cast.bassist.armL.grip.add(props.bass);props.bass.scale.set(1.08,1.08,1.08);props.bass.position.set(1.2,0,1.2);props.bass.rotation.set(.2,0,-1.15);
    props.pistol=A.makeKnife();props.pistol.visible=false;props.pistol.scale.set(.8,.8,.65);props.pistol.rotation.z=Math.PI/2;A.cast.julien.armR.grip.add(props.pistol);
  }
  function resetCast(){for(var k in A.cast){A.cast[k].root.visible=false;A.cast[k].root.rotation.y=0;A.stopDance(A.cast[k],'idle')}props.jGuitar.visible=false;props.pistol.visible=false;props.redBook.visible=false}
  function rock(actorName,intensity){var a=A.cast[actorName],t=0;a.pose=null;a._dance=true;T.animate(function(dt){if(!a._dance)return true;t+=dt*(intensity||1);var b=t*5.3;a.hips.position.y=a.baseHipY+Math.abs(Math.sin(b))*.45;a.hips.rotation.z=Math.sin(b*.5)*.08;a.neck.rotation.x=.18+Math.sin(b)*.18;a.armR.shoulder.rotation.x=-1.0+Math.sin(b*.5)*.25;a.armL.shoulder.rotation.x=-.55+Math.sin(b*.5+2)*.2;return false})}
  function stopRock(name,pose){A.cast[name]._dance=false;A.setPose(A.cast[name],pose||'idle')}
  function reveal(names,positions){names.forEach(function(n,i){var a=A.cast[n],p=positions[i];a.root.position.set(p[0],0,p[1]);a.root.visible=true;if(p[2]!==undefined)a.root.rotation.y=p[2]})}
  function bandOn(){reveal(['guitarist','bassist','drummer'],[[-46,-23],[46,-23],[0,-28]]);A.setPose(A.cast.guitarist,'confront');A.setPose(A.cast.bassist,'confront');A.setPose(A.cast.drummer,'flamencoUp');rock('guitarist',1.2);rock('bassist',.8);rock('drummer',1.45)}
  function pulseLights(sec){var t=0;T.animate(function(dt){t+=dt;var q=(Math.sin(t*8)>0)?1:.2;T.spot('A',{color:'#ff1838',intensity:1.2*q,at:[-30,10,-18],dur:.08});T.spot('B',{color:'#e9e4dc',intensity:.8*(1.2-q),at:[30,10,-18],dur:.08});return t>sec})}
  function prologue(){return[
    D.sfx('threeKnocks'),wait(2.1),D.sfx('ampOn'),D.sfx('tuning'),D.music('overture',{fadeIn:1.8}),D.letterbox(1,1.4),
    D.subBg('narrator','一八三〇年。一个木匠的儿子，把拿破仑藏在拉丁文下面。','Verrières, 1830.',4.2),
    D.card('红 与 黑','一部关于欲望、阶级与命运的摇滚叙事诗',4.2),D.sfx('powerChord'),D.flash('#b8122a',.42),D.letterbox(0,1),wait(.4)
  ]}
  function act1(){return[
    call(function(){resetCast();Sets.show('mill');T.shot(CAM.master(0));T.mood({amb:.34,ambColor:'#6d707c',hemi:.15,key:.55,keyColor:'#d8d1c3',keyPos:[-55,75,80],rim:.55,rimColor:'#bd1730',foot:.24,footColor:'#d45040'},.1)}),
    D.card('第 一 章','锯木厂 · 红色野心',3.2),D.curtainOpen(2.5),D.stamp('维里耶尔 · 锯木厂',4),D.music('sawmill',{fadeIn:1}),D.sfx('saw'),
    call(function(){reveal(['worker1','worker2'],[[-48,-9],[-27,-13]]);rock('worker1',.7);rock('worker2',.8);var j=A.cast.julien;j.root.position.set(28,0,-8);j.root.visible=true;props.redBook.visible=true;A.setPose(j,'sitSlump')}),
    D.shotWait(CAM.pan(-10,2.6)),D.sub('chorus','锯齿咬住木头，镇上的每个人都知道自己的位置。','',3.8),D.sfx('churchBell'),
    D.sub('julien','可我听见的不是锯声。是军鼓，是世界在叫我的名字。','',4.4),D.pose('julien','reachOne'),D.spot('A',{follow:A.cast.julien,color:'#d91d38',intensity:1.25,angle:.25,dur:1}),D.shotWait(CAM.close(28,1.3,11)),
    D.subBg('julien','红，是军装，是血，是向上的路！','',3.2),D.sfx('powerChord'),call(function(){props.redBook.visible=false;props.jGuitar.visible=true;rock('julien',1.25);pulseLights(5)}),D.music('desire'),D.shot(CAM.low(22,1.2)),wait(3.6),
    D.subBg('band','别把野心低声念——把它唱到屋顶碎裂！','',3.3),D.sfx('pickScrape'),D.shake(1.3,.7),wait(1.4),
    call(function(){stopRock('julien','shock');props.jGuitar.visible=false;var a=A.cast.abbe;a.root.position.set(72,0,-18);a.root.visible=true;A.walkTo(a,48,{speed:10,z:-15,pose:'attention'})}),D.stopMusic(1),D.muffle(true,580),D.sub('abbe','于连。德·雷纳尔家需要一位家庭教师。黑袍，也能成为梯子。','',4.7),D.muffle(false),
    D.sub('julien','黑袍遮住出身，红心保留火焰。我要走。','',4),D.pose('julien','confront'),D.sfx('powerChord'),
    call(function(){A.walkTo(A.cast.julien,80,{speed:18,z:-20,pose:'attention'});A.walkTo(A.cast.abbe,74,{speed:10,z:-22});stopRock('worker1');stopRock('worker2')}),D.shotWait(CAM.master(3)),D.curtainClose(2.4),wait(.5)
  ]}
  function act2(){return[
    call(function(){resetCast();Sets.show('salon');T.shot(CAM.master(0));T.mood({amb:.28,ambColor:'#6c5360',hemi:.18,key:.68,keyColor:'#f2d6b8',keyPos:[35,85,95],rim:.7,rimColor:'#e31937',foot:.5,footColor:'#cf2438'},.1)}),
    D.card('第 二 章','沙龙 · 爱与攀登',3.2),D.curtainOpen(2.5),D.stamp('巴黎 · 拉莫尔府邸 / 摇滚现场',4),D.sfx('crowd'),D.music('salon',{fadeIn:1}),call(function(){bandOn();pulseLights(22);reveal(['julien','mathilde','renale','mayor','lady'],[[0,-5],[-23,-8],[35,-14],[54,-18],[-55,-16]]);props.jGuitar.visible=true;rock('julien',1.2)}),
    D.shot(CAM.low(0,1.3)),D.subBg('band','红色欲望！黑色礼服！今晚，阶级也得跟着鼓点跳！','',4),D.sfx('flashbulbs'),D.shake(.8,.45),wait(3.5),
    D.spot('A',{follow:A.cast.mathilde,color:'#e21d3a',intensity:1.35,angle:.24,dur:.8}),D.shotWait(CAM.med(-15,1.6,12)),D.sub('mathilde','你不是他们。你的沉默里有刀锋——所以我看见你。','',4.2),D.pose('mathilde','sassHalf'),D.sub('julien','你看见的是你想反抗的世界，小姐。','',3.7),D.pose('julien','torero'),
    D.sfx('powerChord'),call(function(){A.spinOnce(A.cast.mathilde,.9);}),wait(1.1),D.subBg('mathilde','那就让我成为红，让你不敢退回黑暗！','',3.6),D.emote('mathilde','heart'),
    D.spot('B',{follow:A.cast.renale,color:'#eee3da',intensity:1.1,angle:.22,dur:1}),D.musicVol(.22,1),D.shotWait(CAM.pan(24,2)),D.sub('renale','于连……你把我们的罪写成了歌，却忘了它会伤人。','',4.4),D.pose('renale','grief'),
    D.sub('julien','我爱过你。也许那是我一生唯一没有算计的事。','',4.3),call(function(){stopRock('julien','plead');props.jGuitar.visible=false}),D.emote('julien','brokenHeart',{dur:2}),
    D.sfx('page'),D.sub('mayor','一封信，足够让所有梯子断裂。野心家，你的名字到此为止！','',4.3),D.pose('mayor','confront'),D.sfx('crowd'),
    call(function(){A.setPose(A.cast.lady,'shock');A.setPose(A.cast.mathilde,'shock');A.setPose(A.cast.renale,'refuse')}),D.stopMusic(1),D.flash('#fff',.35),D.sub('julien','既然世界只肯给我坠落——我就让坠落也发出巨响。','',4.3),D.pose('julien','despair'),D.sfx('feedback'),
    D.mood({amb:.12,key:.16,rim:1.1,rimColor:'#e01632',foot:.08},1.5),D.shotWait(CAM.close(0,1.4,10)),D.curtainClose(2),wait(.5)
  ]}
  function act3(){return[
    call(function(){resetCast();Sets.show('mill');T.shot(CAM.master(0));T.mood({amb:.22,ambColor:'#525663',hemi:.08,key:.34,keyColor:'#d4d0c8',rim:.62,rimColor:'#a91328',foot:.12},.1)}),
    D.card('第 三 章','枪声 · 审判 · 终曲',3.5),D.curtainOpen(2.4),D.stamp('维里耶尔教堂 · 礼拜日',3.6),D.music('trial',{fadeIn:1.5}),D.sfx('churchBell'),
    call(function(){reveal(['renale','abbe','lady'],[[22,-11],[40,-19],[-28,-18]]);A.setPose(A.cast.renale,'kneel');var j=A.cast.julien;j.root.position.set(-72,0,-12);j.root.visible=true;props.pistol.visible=true;A.walkTo(j,-16,{speed:8,z:-10,pose:'knife'})}),
    D.shotWait(CAM.pan(-8,2.5)),D.sub('narrator','礼拜的钟声盖住脚步。于连把判决握在手里。','',3.8),D.sfx('heartbeat'),D.sub('julien','不是恨你。是恨那个借你的手，把我按回尘土的世界。','',4.5),D.pose('julien','knife'),
    D.shot(CAM.close(-14,.8,11)),wait(.8),D.stopMusic(.25),D.sfx('gunshot'),D.flash('#fff',1),D.shake(2.4,.9),call(function(){A.setPose(A.cast.renale,'lieSide');A.setPose(A.cast.abbe,'shock');props.pistol.visible=false}),wait(1.8),
    D.curtainClose(1.8),wait(.4),call(function(){resetCast();Sets.show('trial');T.shot(CAM.master(0));T.mood({amb:.22,ambColor:'#59545e',hemi:.1,key:.48,keyColor:'#d9d2c7',rim:.45,rimColor:'#a61529',foot:.1},.1);reveal(['julien','judge','mathilde','renale','lady'],[[34,-17],[0,-26],[-31,-8],[50,-24],[-50,-20]]);A.setPose(A.cast.julien,'attention');A.setPose(A.cast.renale,'sitSlump')}),D.curtainOpen(2.1),D.stamp('贝桑松 · 重罪法庭',3.8),D.sfx('gavel'),D.music('trial',{fadeIn:1.2}),
    D.sub('judge','于连·索雷尔，你是否请求宽恕？','',3.2),D.shotWait(CAM.med(25,1.4,12)),D.sub('julien','不。我被审判，不是因为开枪——而是因为我从下面闯了上来。','',4.8),D.pose('julien','confront'),
    D.sub('julien','陪审席上没有我的同类。你们惩罚的，是一个越界的人。','',4.4),D.spot('A',{follow:A.cast.julien,color:'#e51b38',intensity:1.5,angle:.2,dur:1}),D.sfx('powerChord'),D.flash('#a90e24',.28),
    D.sub('mathilde','我可以买通守卫，我能把你带走！','',3.3),D.pose('mathilde','plead'),D.emote('mathilde','brokenHeart',{dur:2}),D.sub('julien','不要把我的最后一刻，也变成一次攀登。','',3.8),D.pose('julien','refuse'),
    D.sub('renale','我活着，于连。我原谅你。','',3.4),D.emote('renale','heart'),D.sub('julien','那么我终于知道：爱不是红，也不是黑。它没有制服。','',4.6),D.pose('julien','plead'),
    D.stopMusic(1),D.sfx('blade'),D.mood({amb:.04,key:.05,rim:.08,foot:.02},1),D.shotWait(CAM.close(34,1.7,11)),D.subBg('julien','我不后悔活得太响。','',3),wait(1.2),D.sfx('heartbeat'),
    call(function(){var red=Sets.fx.trial.redDrop;red.visible=true;red.material.opacity=1;A.setPose(A.cast.julien,'kneelDown',true)}),D.flash('#df1735',.75),D.shake(1.7,.7),wait(2),
    D.music('finale',{fadeIn:1.8}),call(function(){var red=Sets.fx.trial.redDrop,t=0;T.animate(function(dt){t+=dt/3.2;red.material.opacity=Math.max(0,1-t);if(t>=1){red.visible=false;return true}});T.mood({amb:.3,ambColor:'#704d59',key:.62,keyColor:'#ead6c2',rim:.86,rimColor:'#db1733',foot:.32,footColor:'#c92b3d'},2.5);bandOn();props.jGuitar.visible=true;A.setPose(A.cast.julien,'torero');pulseLights(12)}),
    D.shotWait(CAM.master(3)),D.subBg('band','红会熄灭，黑会褪去——但反抗的和弦仍在回响！','',4.2),D.sfx('powerChord'),D.sfx('applauseLong'),wait(4),D.curtainClose(3),D.stopMusic(2),wait(.7)
  ]}
  function curtainCall(){return[
    call(function(){resetCast();Sets.show('salon');T.shot(CAM.master(0));T.mood({amb:.42,ambColor:'#76636d',hemi:.2,key:.75,keyColor:'#f1ddc3',rim:.65,rimColor:'#d61a34',foot:.5},.1)}),D.curtainOpen(2.5),D.music('finale',{fadeIn:1}),D.stamp('谢幕',3),D.sfx('applauseLong'),
    call(function(){var order=['worker1','worker2','abbe','mayor','judge','lady','guitarist','drummer','bassist','renale','mathilde','julien'],pos=[-62,62,-51,51,-40,40,-29,29,18,-16,0,16];order.forEach(function(n,i){Sched.to(function(){var a=A.cast[n];a.root.position.set(pos[i]<0?-90:90,0,i>8?-5:-17);a.root.visible=true;A.walkTo(a,pos[i],{speed:24,z:i>8?-5:-17,pose:'bow'});Sched.to(function(){A.setPose(a,'bow')},1700)},i*300)})}),D.shotWait(CAM.master(5)),D.sfx('powerChord'),wait(3.5),D.curtainClose(2.8),D.stopMusic(2),wait(.7),
    D.credits([{t:'LE ROUGE ET LE NOIR',h:true},{t:'摇滚红与黑 · 三章小剧场'},{t:''},{t:'原作',h:true},{t:'司汤达 Stendhal (1830)'},{t:''},{t:'舞台',h:true},{t:'锯木厂 / 巴黎沙龙 / 重罪法庭'},{t:'红色追光 / 黑色景片 / 芯片摇滚乐队'},{t:''},{t:'主演',h:true},{t:'于连·索雷尔'},{t:'德·雷纳尔夫人 / 玛蒂尔德'},{t:'谢朗神父 / 德·雷纳尔先生 / 审判长'},{t:''},{t:'声音',h:true},{t:'方波主唱 · 锯齿吉他 · 三角波贝司 · 噪声鼓组'},{t:''},{t:'致敬 NDS 世代的掌上剧场'},{t:''},{t:'谢谢观赏',h:true}]),D.finCard(),wait(3)
  ]}
  function fullShow(){return[].concat(prologue(),act1(),act2(),act3(),curtainCall())}
  return{buildCast:buildCast,fullShow:fullShow,props:props};
})();
