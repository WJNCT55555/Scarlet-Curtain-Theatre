'use strict';
/* WebAudio chip-rock orchestra: sequenced square leads, distorted saw guitars,
   triangle bass, noise drums and theatre effects. No downloaded audio assets. */
var AudioSys=(function(){
  var ctx,master,musicBus,sfxGain,echoIn,muffle,ready=false;
  function init(){
    if(ready)return;
    try{
      ctx=new(window.AudioContext||window.webkitAudioContext)();
      master=ctx.createGain();master.gain.value=.58;master.connect(ctx.destination);
      muffle=ctx.createBiquadFilter();muffle.type='lowpass';muffle.frequency.value=19000;muffle.connect(master);
      musicBus=ctx.createGain();musicBus.gain.value=.46;musicBus.connect(muffle);
      sfxGain=ctx.createGain();sfxGain.gain.value=.65;sfxGain.connect(master);
      echoIn=ctx.createGain();var d=ctx.createDelay(1),fb=ctx.createGain(),lp=ctx.createBiquadFilter(),wet=ctx.createGain();
      d.delayTime.value=.19;fb.gain.value=.24;lp.type='lowpass';lp.frequency.value=2800;wet.gain.value=.18;
      echoIn.connect(d);d.connect(lp);lp.connect(fb);fb.connect(d);lp.connect(wet);wet.connect(musicBus);ready=true;
    }catch(e){}
  }
  function resume(){if(ctx&&ctx.state==='suspended')ctx.resume()}
  function setMuted(v){if(master)master.gain.setTargetAtTime(v?0:.58,ctx.currentTime,.05)}
  function note(freq,dur,type,vol,dest,when,glide,vib){
    if(!ready||!freq)return;var t=ctx.currentTime+(when||0),o=ctx.createOscillator(),g=ctx.createGain();
    o.type=type||'square';o.frequency.setValueAtTime(freq,t);if(glide)o.frequency.exponentialRampToValueAtTime(glide,t+dur);
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol||.06,t+.008);g.gain.setValueAtTime(vol||.06,t+dur*.55);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    o.connect(g);g.connect(dest||sfxGain);
    if(vib&&dur>.2){var l=ctx.createOscillator(),lg=ctx.createGain();l.frequency.value=5.6;lg.gain.value=freq*.012;l.connect(lg);lg.connect(o.frequency);l.start(t+.12);l.stop(t+dur)}
    o.start(t);o.stop(t+dur+.03);
  }
  function noise(dur,vol,dest,when,freq,hp){
    if(!ready)return;var t=ctx.currentTime+(when||0),len=Math.max(1,ctx.sampleRate*dur|0),b=ctx.createBuffer(1,len,ctx.sampleRate),a=b.getChannelData(0);
    for(var i=0;i<len;i++)a[i]=Math.random()*2-1;var s=ctx.createBufferSource(),g=ctx.createGain(),f=ctx.createBiquadFilter();s.buffer=b;f.type=hp?'highpass':'lowpass';f.frequency.value=freq||2000;g.gain.setValueAtTime(vol||.05,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.connect(f);f.connect(g);g.connect(dest||sfxGain);s.start(t);
  }
  var SEMI={C:0,'C#':1,Db:1,D:2,'D#':3,Eb:3,E:4,F:5,'F#':6,Gb:6,G:7,'G#':8,Ab:8,A:9,'A#':10,Bb:10,B:11};
  function N(n){if(typeof n==='number')return n;if(!n||n==='r')return 0;var m=/^([A-G][#b]?)(-?\d)$/.exec(n);return m?440*Math.pow(2,(SEMI[m[1]]-9+(+m[2]-4)*12)/12):0}
  function rep(a,n){var o=[];while(n--)o=o.concat(a);return o}function srep(s,n){var o='';while(n--)o+=s;return o}
  function perc(k,w,v){v=v||1;if(k==='k'){note(92,.12,'sine',.13*v,musicBus,w,42);noise(.035,.035*v,musicBus,w,350)}else if(k==='s'){noise(.13,.075*v,musicBus,w,2200,true);note(180,.06,'triangle',.035*v,musicBus,w)}else if(k==='h')noise(.035,.025*v,musicBus,w,6500,true);else if(k==='o')noise(.2,.035*v,musicBus,w,5200,true);else if(k==='c'){noise(.9,.08*v,musicBus,w,6000,true);noise(.45,.05*v,musicBus,w,2600,true)}else if(k==='t')note(62,.55,'sine',.15*v,musicBus,w,38)}
  function riff(root){return [[root+'2',2],['r',1],[root+'2',1],[root+'3',2],[root+'2',2],[root+'2',2],['r',1],[root+'3',1],[root+'2',2],['r',2]]}
  var Em=['E3','G3','B3'],C=['C3','E3','G3'],D=['D3','F#3','A3'],B=['B2','D#3','F#3'],Am=['A2','C3','E3'];
  var hook=[['E5',2],['G5',2],['A5',4],['G5',2],['E5',2],['D5',4],['E5',2],['G5',2],['B5',4],['A5',2],['G5',2],['E5',4]];
  var SONGS={
    overture:{bpm:78,loop:true,channels:[{wave:'square',vol:.043,vib:true,notes:[['r',16],['E5',8],['D#5',8],['G5',8],['F#5',8],['B4',16]]},{wave:'triangle',vol:.075,notes:rep([['E2',8],['C2',8],['D2',8],['B1',8]],2)},{wave:'sine',vol:.018,notes:[[Em,16],[C,16],[D,16],[B,16]]}],perc:srep('t...............',4)},
    sawmill:{bpm:128,loop:true,channels:[{wave:'sawtooth',vol:.032,notes:rep(riff('E'),4)},{wave:'square',vol:.025,notes:rep([['E4',2],['r',2],['G4',2],['A4',2]],8)},{wave:'triangle',vol:.09,notes:rep([['E2',4],['E2',4],['C2',4],['D2',4]],4)}],perc:srep('k.h.s.h.k.hhshh.',4)},
    desire:{bpm:116,loop:true,channels:[{wave:'square',vol:.052,vib:true,notes:rep(hook,2)},{wave:'sawtooth',vol:.027,notes:rep([[[N('E3'),N('G3'),N('B3')],6],['r',2],[[N('C3'),N('E3'),N('G3')],6],['r',2],[[N('D3'),N('F#3'),N('A3')],6],['r',2],[[N('B2'),N('D#3'),N('F#3')],6],['r',2]],2)},{wave:'triangle',vol:.085,notes:rep([['E2',4],['C2',4],['D2',4],['B1',4]],4)}],perc:srep('k.h.s.h.k.hhsoh.',4)},
    salon:{bpm:142,loop:true,channels:[{wave:'square',vol:.05,vib:true,notes:rep(hook.concat([['C6',2],['B5',2],['A5',2],['G5',2],['F#5',2],['E5',6]]),2)},{wave:'sawtooth',vol:.032,notes:rep(riff('A').concat(riff('E')),2)},{wave:'triangle',vol:.09,notes:rep([['A1',4],['C2',4],['D2',4],['E2',4]],5)}],perc:srep('k.h.soh.k.hhshh.',5)},
    trial:{bpm:64,loop:true,channels:[{wave:'square',vol:.038,vib:true,notes:[['r',8],['B4',6],['A4',2],['G4',8],['F#4',8],['E4',12],['r',4]]},{wave:'triangle',vol:.08,notes:rep([['E2',8],['C2',8],['B1',8],['E2',8]],2)},{wave:'sine',vol:.018,notes:[[Em,16],[C,16],[B,16],[Em,16]]}],perc:srep('t.......t.......',4)},
    finale:{bpm:132,loop:true,channels:[{wave:'square',vol:.055,vib:true,notes:rep(hook,3)},{wave:'sawtooth',vol:.036,notes:rep(riff('E'),6)},{wave:'triangle',vol:.095,notes:rep([['E2',4],['C2',4],['D2',4],['B1',4]],6)}],perc:srep('k.hhsoh.k.hhsocc',6)}
  };
  var seq={song:null,id:null,step:0,nextT:0,timer:null,passes:0};
  function compile(d){var ev={},total=0;d.channels.forEach(function(ch){var p=0;ch.notes.forEach(function(q){if(q[0]&&q[0]!=='r')(ev[p]||(ev[p]=[])).push({ch:ch,n:q[0],d:q[1]});p+=q[1]});total=Math.max(total,p)});total=Math.max(total,d.perc?d.perc.length:0);return{def:d,events:ev,total:total}}
  var compiled={};function stepDur(d){return 60/d.bpm/4}
  function tick(){if(!seq.song||!ready)return;while(seq.nextT<ctx.currentTime+.22){var es=seq.song.events[seq.step],sd=stepDur(seq.song.def);if(es)es.forEach(function(e){var ar=e.n instanceof Array?e.n:[e.n];ar.forEach(function(n){note(N(n),sd*e.d*.88,e.ch.wave,e.ch.vol,musicBus,seq.nextT-ctx.currentTime,0,e.ch.vib)})});var pc=seq.song.def.perc&&seq.song.def.perc[seq.step%seq.song.def.perc.length];if(pc&&pc!=='.')perc(pc,seq.nextT-ctx.currentTime);seq.nextT+=sd;if(++seq.step>=seq.song.total){if(seq.song.def.loop){seq.step=0;seq.passes++}else stopMusic()}}}
  function playMusic(id,o){o=o||{};if(seq.id===id)return;stopMusic();if(!ready||!SONGS[id])return;seq.song=compiled[id]||(compiled[id]=compile(SONGS[id]));seq.id=id;seq.step=0;seq.nextT=ctx.currentTime+.06;musicBus.gain.cancelScheduledValues(ctx.currentTime);if(o.fadeIn){musicBus.gain.setValueAtTime(.001,ctx.currentTime);musicBus.gain.exponentialRampToValueAtTime(.46,ctx.currentTime+o.fadeIn)}else musicBus.gain.value=.46;seq.timer=Sched.iv(tick,35)}
  function stopMusic(f){if(seq.timer){Sched.clearIv(seq.timer);seq.timer=null}if(f&&ready)musicBus.gain.setTargetAtTime(.001,ctx.currentTime,f/3);seq.song=null;seq.id=null}
  function chord(ns,w,v){ns.forEach(function(n,i){note(N(n),.5,'sawtooth',v||.045,null,(w||0)+i*.018)})}
  var S={
    threeKnocks:function(){for(var i=0;i<3;i++){note(82,.2,'sine',.2,null,i*.62,48);noise(.09,.13,null,i*.62,450)}},
    tuning:function(){note(82,1.8,'sawtooth',.025,null,0,110);note(164.8,1.3,'square',.018,null,.35,0,true);noise(.5,.025,null,.1,4200,true)},
    curtainSwish:function(){noise(1.4,.05,null,0,950);noise(.8,.025,null,.2,2400,true)},
    ampOn:function(){noise(.12,.09,null,0,5000,true);note(50,.7,'sawtooth',.1,null,.04,86)},
    pickScrape:function(){note(110,.8,'sawtooth',.06,null,0,2200);noise(.7,.04,null,0,3500,true)},
    saw:function(){noise(1.3,.055,null,0,1500,true);note(92,1.2,'sawtooth',.035,null,0,180)},
    churchBell:function(){[196,392,587].forEach(function(n,i){note(n,2.2-i*.25,'sine',.07-i*.012,null,i*.03)})},
    page:function(){noise(.35,.035,null,0,2800,true)},
    crowd:function(){noise(1.7,.055,null,0,900);for(var i=0;i<9;i++)note(280+Math.random()*500,.09,'square',.01,null,Math.random()*1.2)},
    flashbulbs:function(){for(var i=0;i<5;i++){noise(.025,.08,null,i*.18,6000,true);note(1800,.025,'square',.03,null,i*.18)}},
    gavel:function(){noise(.08,.18,null,0,500);note(72,.3,'sine',.15,null,0,40)},
    gunshot:function(){noise(.16,.32,null,0,5000,true);noise(.8,.12,echoIn,.03,700);note(46,.8,'sine',.16,null,0,32)},
    heartbeat:function(){note(48,.12,'sine',.17);note(44,.14,'sine',.13,null,.2)},
    blade:function(){note(2600,.4,'sawtooth',.03,null,0,3600);noise(.2,.045,null,0,6000,true)},
    stomp:function(){note(68,.13,'sine',.15,null,0,40);noise(.05,.06,null,0,350)},
    applauseLong:function(){for(var i=0;i<100;i++)noise(.025,.025+Math.random()*.03,null,Math.random()*5.5,1200+Math.random()*1800,true)},
    powerChord:function(){chord(['E3','B3','E4'],0,.055);chord(['E3','B3','E4'],.12,.04)},
    feedback:function(){note(880,1.5,'sawtooth',.035,echoIn,0,1320,true)}
  };
  return{init:init,resume:resume,setMuted:setMuted,playMusic:playMusic,stopMusic:stopMusic,setMuffle:function(v,f){if(ready)muffle.frequency.setTargetAtTime(v?(f||650):19000,ctx.currentTime,.3)},musicVol:function(v,r){if(ready)musicBus.gain.setTargetAtTime(v,ctx.currentTime,(r||.5)/3)},curMusic:function(){return seq.id},sfx:S,N:N};
})();
