type ProductionId=string;
type SetShellStyle='proscenium'|'blackbox'|'electric';
interface LanguageOption{id:string;label:string}
interface ProductionManifest{id:ProductionId;title:string;latinTitle:string;subtitle:string;description:string;entry:string;accent:string;initialSet:string;defaultLanguage:string;languages:LanguageOption[]}
interface TheatreMessage{type?:string;progress?:number;play?:ProductionId}

const shellOptions:Array<{id:SetShellStyle;label:string}>=[{id:'proscenium',label:'歌剧院'},{id:'blackbox',label:'黑匣外壳'},{id:'electric',label:'电子台口'}];
let catalog:ProductionManifest[]=[];
let current:ProductionManifest|null=null;
let selectedShell:SetShellStyle='proscenium';
let selectedLanguage='zh';
let revision=0;
let progress=0;

function element<T extends HTMLElement>(id:string):T{const node=document.getElementById(id);if(!node)throw new Error(`Missing #${id}`);return node as T}
const frame=element<HTMLIFrameElement>('theatreFrame');
const grid=element<HTMLElement>('productionGrid');
const shellSelector=element<HTMLElement>('shellSelector');
const languageSelector=element<HTMLElement>('languageSelector');
const progressSlider=element<HTMLInputElement>('progressSlider');

function setStatus(text:string,state:'idle'|'running'='idle'):void{element('statusText').textContent=text;element('statusDot').className=state==='running'?'running':''}
function setProgress(value:number):void{progress=Math.max(0,Math.min(1,value));const percent=Math.round(progress*100);progressSlider.value=String(Math.round(progress*1000));progressSlider.style.setProperty('--progress',`${percent}%`);element('progressPercent').textContent=`${percent}%`}
function productionUrl(production:ProductionManifest,preview=false):string{const query=new URLSearchParams({embed:'1',set:selectedShell,lang:selectedLanguage,revision:String(revision)});if(preview)query.set('preview','1');return `${production.entry}?${query}`}
function buttonGroup<T extends string>(container:HTMLElement,items:Array<{id:T;label:string}>,selected:T,onSelect:(id:T)=>void):void{container.replaceChildren();items.forEach(item=>{const button=document.createElement('button');button.type='button';button.textContent=item.label;button.dataset.value=item.id;button.setAttribute('aria-pressed',String(item.id===selected));button.addEventListener('click',()=>{if(item.id===selected)return;onSelect(item.id)});container.append(button)})}
function refreshControls():void{buttonGroup(shellSelector,shellOptions,selectedShell,id=>{selectedShell=id;loadCurrent()});if(current)buttonGroup(languageSelector,current.languages,selectedLanguage,id=>{selectedLanguage=id;loadCurrent()})}
function loadCurrent():void{if(!current)return;revision+=1;setProgress(0);element('timelineState').textContent='装台中';setStatus('装台中');refreshControls();frame.src=productionUrl(current)}
function openProduction(production:ProductionManifest):void{current=production;selectedShell='proscenium';selectedLanguage=production.defaultLanguage;document.body.dataset.view='player';document.documentElement.style.setProperty('--red',production.accent);element('playerTitle').textContent=production.title;element('playerLatinTitle').textContent=production.latinTitle;element('playerSubtitle').textContent=production.subtitle;loadCurrent()}
function showHome():void{current=null;frame.src='about:blank';document.body.dataset.view='home';document.documentElement.style.setProperty('--red','#c72540');setStatus('剧目厅');setProgress(0)}

function renderCatalog():void{grid.replaceChildren();element('productionCount').textContent=`${catalog.length} 部剧目`;const template=element<HTMLTemplateElement>('productionTemplate');catalog.forEach((production,index)=>{const fragment=template.content.cloneNode(true) as DocumentFragment;const item=fragment.querySelector<HTMLElement>('.production-item')!;item.style.setProperty('--production-accent',production.accent);const preview=fragment.querySelector<HTMLIFrameElement>('iframe')!;preview.src=productionUrl(production,true);preview.title=`${production.title}舞台预览`;fragment.querySelector<HTMLElement>('.production-latin')!.textContent=production.latinTitle;fragment.querySelector<HTMLElement>('.production-title')!.textContent=production.title;fragment.querySelector<HTMLElement>('.production-subtitle')!.textContent=production.subtitle;fragment.querySelector<HTMLElement>('.production-description')!.textContent=production.description;fragment.querySelector<HTMLButtonElement>('.enter-button')!.addEventListener('click',()=>openProduction(production));grid.append(fragment);if(index===0)preview.dataset.first='true'})}

async function loadCatalog():Promise<void>{try{const list=await fetch('../productions.json').then(response=>{if(!response.ok)throw new Error('Cannot load production list');return response.json() as Promise<string[]>});catalog=await Promise.all(list.map(path=>fetch(`../${path}`).then(response=>{if(!response.ok)throw new Error(`Cannot load ${path}`);return response.json() as Promise<ProductionManifest>})));renderCatalog();setStatus('剧目厅')}catch(error){console.error(error);grid.innerHTML='<div class="empty-state">剧目清单加载失败</div>';setStatus('载入失败')}}

element('homeButton').addEventListener('click',showHome);element('brandLink').addEventListener('click',event=>{event.preventDefault();showHome()});element('reloadButton').addEventListener('click',loadCurrent);progressSlider.addEventListener('input',()=>{progressSlider.value=String(Math.round(progress*1000))});frame.addEventListener('load',()=>{if(current){element('timelineState').textContent='等待开演';setStatus('等待开演')}});
window.addEventListener('message',event=>{if(event.origin!==location.origin||event.source!==frame.contentWindow||!current)return;const message=event.data as TheatreMessage;if(message.play!==current.id||!message.type?.startsWith('pocket-theatre:'))return;if(typeof message.progress==='number')setProgress(message.progress);if(message.type==='pocket-theatre:ready'){element('timelineState').textContent='等待开演';setStatus('等待开演')}else if(message.type==='pocket-theatre:started'){element('timelineState').textContent='演出中';setStatus('演出中','running')}else if(message.type==='pocket-theatre:done'){element('timelineState').textContent='演出结束';setStatus('演出结束')}});
loadCatalog();
