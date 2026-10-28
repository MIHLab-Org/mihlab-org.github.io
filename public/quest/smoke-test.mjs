import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {pathToFileURL, fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';
const dir=join(dirname(fileURLToPath(import.meta.url)),'quest');
const chapters=[1,2].map(n=>JSON.parse(readFileSync(`${dir}/realm${n}-content.json`,'utf8')));
const {makeEngine}=await import(pathToFileURL(`${dir}/phase2-engine.js`).href);
let ui,uid,room,tick,time,dieValue;
function element(tag='div'){
  return {tag,children:[],className:'',dataset:{},hidden:false,disabled:false,inert:false,tabIndex:0,textContent:'',attributes:{},
    classList:{add(){}},setAttribute(k,v){this.attributes[k]=v},append(...nodes){this.children.push(...nodes)},
    replaceChildren(){this.children=[]},handlers:{},addEventListener(event,fn){this.handlers[event]=fn}};
}
const actualNow=Date.now, actualRandom=Math.random, actualInterval=globalThis.setInterval;
Date.now=()=>time;
Math.random=()=>dieValue===null?0.99:((dieValue-1)+0.001)/20;
globalThis.document={getElementById(id){if(!ui.has(id))ui.set(id,element());return ui.get(id)},createElement:element};
globalThis.setInterval=cb=>{tick=cb;return 1};
function clone(x){return structuredClone(x)}
function setup(names=['Host','Guest']){
  ui=new Map();uid='p0';time=1_790_000_000_000;dieValue=20;
  const players=Object.fromEntries(names.map((name,i)=>[`p${i}`,{connected:true,name,class:['skeptic','empiricist','rationalist','pragmatist'][i%4]}]));
  room={hostUid:'p0',status:'lobby',players};
  function write(p,value){const parts=p.split('/').filter(Boolean).slice(2);let obj=room;
    for(const key of parts.slice(0,-1))obj=obj[key]??={};
    const key=parts.at(-1); if(value===null)delete obj[key];else obj[key]=clone(value);
  }
  const api={ref:(db,p)=>p,set:async(p,val)=>write(p,val),update:async(p,changes)=>{
    for(const [sub,val] of Object.entries(changes))write(p+'/'+sub,val);
  }};
  const e=makeEngine({db:{},api,getContext:()=>({room,uid,code:'DEMO'}),content:chapters[0],realm2Content:chapters[1],notice:m=>{throw Error(m)}});
  return e;
}
function textAll(node){return [node.textContent,...node.children.flatMap(textAll)].join(' ')}
async function flush(){await new Promise(r=>setImmediate(r))}
async function sync(){uid='p0';tick();await flush()}
function selectedOptionText(stage,choice){const index=stage%5;return chapters[Math.floor(stage/5)][index<2?'encounters':'bossPhases'][index<2?index:index-2].options[choice].text}
async function cast(e,player,choice){uid=player;e.render(room);const button=ui.get('game-choices').children.find(b=>b.textContent===selectedOptionText(room.game.stageIndex,choice));
  assert(button && !button.disabled,`player ${player} should be able to vote`);await button.handlers.click();}
async function next(e){uid='p0';e.render(room);const b=ui.get('game-next');assert(!b.hidden&&!b.disabled,`host action should be enabled at ${room.game.phase}`);await b.handlers.click();}
async function progressTo(e,target){while(room.game.stageIndex<target){
  const i=room.game.stageIndex;
  const eligible=i%5===3?[room.game.spotlightUid]:Object.keys(room.players);
  for(const voter of eligible)await cast(e,voter,0);
  await sync();assert.equal(room.game.phase,'ready-to-roll');
  await next(e); time=room.game.rollRevealAt+1;await sync();assert.equal(room.game.phase,'result');
  assert.equal(room.game.success,true,`strong party should pass stage ${i}`);
  await next(e);assert.equal(room.game.phase,'lore');
  await next(e);
  if(room.game.phase==='realm-complete')await next(e);
}}
try{
  // Mathematical correctness: one, two, or six STRONG voters must all yield +7.
  for(const count of [2,3,6]){
    const e=setup(Array.from({length:count},(_,i)=>`Person ${i}`));await e.begin();
    for(let i=0;i<count;i++)await cast(e,`p${i}`,0);
    await sync();assert.equal(room.game.phase,'ready-to-roll');
    e.render(room);const dice=ui.get('game-die');
    assert.equal(textAll(dice).includes('FAIL'),false,'no pre-roll FAIL');
    assert.equal(ui.get('game-roll').hidden,true,'pre-roll result line stays hidden');
    await next(e);assert.equal(room.game.modifier,7,`${count}-player unanimous STRONG average`);
    assert.equal(room.game.learningBonus,0);
    assert.equal(room.game.dc,10);
    assert.equal(room.game.total,27);
  }
  // DC 10 requires 3+ (18 outcomes); DC 12 requires 5+ (16 outcomes).
  for(const [dc,expected] of [[10,18],[12,16]]){
    let wins=0;for(let die=1;die<=20;die++)wins+=(die+7>=dc);
    assert.equal(wins,expected);
  }
  // Mixed ballots are floored, never summed, and a retry adds +3 each time.
  {
    const e=setup(); await e.begin();dieValue=1;
    await cast(e,'p0',0);await cast(e,'p1',2);await sync();
    assert.equal(room.game.phase,'debate');
    const debate=ui.get('game-reveal');
    e.render(room);assert(textAll(ui.get('game-reveal')).includes('Host'));
    time=room.game.debateDeadline+1;await sync();
    assert.equal(room.game.phase,'ready-to-roll');
    await next(e);assert.equal(room.game.modifier,2,'floor((7 + -2)/2)=2');
    time=room.game.rollRevealAt+1;await sync();
    assert.equal(room.game.success,false);
    await next(e);assert.equal(room.game.grip.value,9,'failed roll costs one Grip');
    assert.equal(room.game.attempt,1);
    await cast(e,'p0',2);await cast(e,'p1',2);await sync();await next(e);
    assert.equal(room.game.modifier,-2);
    assert.equal(room.game.learningBonus,3);
    assert.equal(room.game.total,2,'1 + -2 + 3 = 2');
    time=room.game.rollRevealAt+1;await sync();await next(e);
    assert.equal(room.game.attempt,2);assert.equal(room.game.grip.value,8);
    await cast(e,'p0',2);await cast(e,'p1',2);await sync();await next(e);
    assert.equal(room.game.learningBonus,6,'each Second Look adds +3 cumulatively');
  }
  // Insight is earned only after defeating the entire boss, in each realm.
  {
    const e=setup();await e.begin();dieValue=20;
    await progressTo(e,4);assert.equal(room.game.stageIndex,4);
    assert.equal(room.game.insightCards['butterfly-perspective'],undefined,'not earned at encounter or early boss phases');
    for(const p of Object.keys(room.players))await cast(e,p,0);
    await sync();await next(e);time=room.game.rollRevealAt+1;await sync();await next(e);
    assert.equal(room.game.phase,'lore');assert(room.game.insightCards['butterfly-perspective']);
    e.render(room);assert(textAll(ui.get('game-lore')).includes('Insight earned: Butterfly Perspective'));
    await next(e);await next(e);
    await progressTo(e,9);assert.equal(room.game.stageIndex,9);
    assert.equal(room.game.insightCards['revisable-knowledge'],undefined);
    for(const p of Object.keys(room.players))await cast(e,p,0);
    await sync();await next(e);time=room.game.rollRevealAt+1;await sync();await next(e);
    assert(room.game.insightCards['revisable-knowledge']);
  }
  // Name swaps affect roster only; vote/reason reveals show real names.
  {
    const e=setup(['Alice','Bob']);await e.begin();dieValue=20;await progressTo(e,2);
    assert.equal(room.game.stageIndex,2);
    assert.equal(room.game.identityMask.p0,'p1');assert.equal(room.game.identityMask.p1,'p0');
    await cast(e,'p0',0);await cast(e,'p1',2);await sync();assert.equal(room.game.phase,'debate');
    e.render(room);const reveal=textAll(ui.get('game-reveal'));
    assert(reveal.includes('Alice: '+selectedOptionText(2,0)));
    assert(reveal.includes('Bob: '+selectedOptionText(2,2)));
    uid='p1';e.render(room);const reasons=ui.get('game-debate').children.find(n=>n.className==='reason-buttons');
    await reasons.children[0].handlers.click();
    e.render(room);assert(textAll(ui.get('game-debate')).includes('Bob: too strong a conclusion'));
  }
  // Spotlight banner, no false consensus, and round-robin without repeats.
  {
    const e=setup(['Alice','Bob']);await e.begin();await progressTo(e,3);
    assert.equal(room.game.stageIndex,3);
    const first=room.game.spotlightUid;
    e.render(room);assert(!ui.get('game-spotlight').hidden);
    assert(textAll(ui.get('game-spotlight')).includes(room.players[first].name));
    await cast(e,first,0);await sync();e.render(room);
    assert.equal(room.game.phase,'ready-to-roll');
    assert(textAll(ui.get('game-reveal')).includes('Spotlight response'));
    assert(!textAll(ui.get('game-reveal')).includes('Consensus reached'));
    await next(e);time=room.game.rollRevealAt+1;await sync();await next(e);await next(e);
    await progressTo(e,8);assert.notEqual(room.game.spotlightUid,first,'Realm II Spotlight rotates to unselected member');
  }
  // Four members must cycle through Spotlight before any repeat, including Second Looks.
  {
    const e=setup(['A','B','C','D']);await e.begin();await progressTo(e,3);
    const selected=[];
    dieValue=1;
    for(let i=0;i<5;i++){
      selected.push(room.game.spotlightUid);
      if(i===4)break;
      await cast(e,room.game.spotlightUid,2);
      await sync();await next(e);time=room.game.rollRevealAt+1;await sync();
      assert.equal(room.game.success,false);
      await next(e);
    }
    assert.equal(new Set(selected.slice(0,4)).size,4,'each member selected once before repeats');
    assert(selected.slice(0,4).includes(selected[4]),'repeat is permitted after complete cycle');
    assert.notEqual(selected[4],selected[3],'do not immediately repeat the last player after a cycle');
  }
  // A fully plugged-in party retries this exact boss phase with fresh time and retained wins.
  {
    const e=setup();await e.begin();await progressTo(e,3);
    const spotlight=room.game.spotlightUid,origStage=room.game.stageIndex;
    room.game.grip.value=1;dieValue=1;
    await cast(e,spotlight,2);await sync();await next(e);time=room.game.rollRevealAt+1;await sync();
    assert.equal(room.game.success,false);
    await next(e);assert.equal(room.game.phase,'plugged');assert.equal(room.game.stageIndex,origStage);
    assert.equal(room.game.grip.value,0);assert.equal(room.game.bossWins,1);
    time+=500000;await next(e);
    assert.equal(room.game.phase,'choice');assert.equal(room.game.stageIndex,origStage);
    assert.equal(room.game.grip.value,6);assert.equal(room.game.bossWins,1);
    assert.equal(room.game.attempt,1);
    assert.equal(room.game.deadline-time,45000,'fresh 45-second boss timer');
    assert.notEqual(room.game.spotlightUid,spotlight,'failed spotlight turn rotates after restart');
  }
  // Host button unavailable to keyboard and assistive technology during choices.
  {
    const e=setup();await e.begin();e.render(room);
    const b=ui.get('game-next');
    assert.equal(b.hidden,true);assert.equal(b.disabled,true);
    assert.equal(b.inert,true);assert.equal(b.tabIndex,-1);
    assert.equal(b.attributes['aria-hidden'],'true');
    assert.equal(ui.get('game-roll').hidden,true);
  }
  // Check markup and content fidelity.
  const ids=new Set([...readFileSync(`${dir}/index.html`,'utf8').matchAll(/id="([^"]+)"/g)].map(x=>x[1]));
  for(const source of ['app.js','phase2-engine.js']){
    const js=readFileSync(`${dir}/${source}`,'utf8');
    for(const [,id] of js.matchAll(/(?:\$|el)\(['"]([^'"]+)['"]\)/g))assert(ids.has(id),`Missing element ${id}`);
  }
  const stylesheet=readFileSync(`${dir}/styles.css`,'utf8');
  assert(stylesheet.includes('#game-next[hidden]'));
  console.log('PASS: average modifiers for 2/3/6, DC success rates, cumulative Second Look, 1 Grip loss, current-stage plugged retry, delayed dice, real-name reveal, Spotlight naming/rotation, boss-only Insight, inaccessible hidden host control, HTML consistency.');
}finally {Date.now=actualNow;Math.random=actualRandom;globalThis.setInterval=actualInterval;}
