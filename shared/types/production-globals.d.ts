declare const THREE:any;
declare const G:{RW:number;RH:number;muted:boolean};
declare const Theater:any;
declare const TheatreShell:any;
declare const Actors:any;
declare const AudioSys:any;
declare const Play:any;
declare const Director:any;
declare const Sched:any;
declare const Script:any;
declare const FONT:string;
declare const FONT_SERIF:string;

type Done=()=>void;
type ScriptStep=(next:Done)=>void;
declare function clamp(value:number,low:number,high:number):number;
declare function clamp01(value:number):number;
declare function lerp(from:number,to:number,amount:number):number;
declare function easeIn(value:number):number;
declare function easeOut(value:number):number;
declare function easeInOut(value:number):number;
declare function rand(low:number,high:number):number;
declare function makeCanvas(width:number,height:number):HTMLCanvasElement;
declare function txt(...args:any[]):void;
declare function txtOutline(...args:any[]):void;

interface SetsApi {
  build():void;show(name:string):void;update(delta:number):void;tint(name:string,color:string,duration?:number):void;
  setCurtain(value:number,duration?:number,done?:Done):void;snapCurtain(value:number):void;getCurtain():number;
  roots:Record<string,any>;fx:Record<string,any>;cur():string|null;shellStyle():string;
}
