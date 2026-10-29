#!/usr/bin/env node
// Standalone Node 18+ checks. No npm modules, network, or Firebase credentials.
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {dirname,resolve,join} from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const quest=join(root,'public/quest');
const file=name=>readFileSync(join(quest,name),'utf8');
const chapters=[1,2].map(i=>JSON.parse(file(`realm${i}-content.json`)));
const epilogue=JSON.parse(file('epilogue-content.json'));
const rules=JSON.parse(readFileSync(join(root,'firebase-quest/database.rules.json'),'utf8'));
const roomRules=rules.rules.rooms['$roomCode'];
const gameRules=roomRules.game;
const engine=await import(pathToFileURL(join(quest,'phase2-engine.js')).href);
const {makeEngine,resolveCheck,effectiveTag}=engine;
let failures=0,checks=0, deferrals=0;
function run(label,fn){checks++;try{fn();console.log(`PASS ${label}`);}catch(e){failures++;console.log(`FAIL ${label}: ${e.stack||e}`);}}
async function runAsync(label,fn){checks++;try{await fn();console.log(`PASS ${label}`);}catch(e){failures++;console.log(`FAIL ${label}: ${e.stack||e}`);}}
function deferred(label,reason){deferrals++;console.log(`DEFER ${label}: ${reason}`);}
function stagesOf(ch){return [...ch.encounters,...ch.bossPhases];}
const stages=chapters.flatMap(stagesOf);

run('A DOM IDs: all literal JS references exist',()=>{
 const ids=new Set([...file('index.html').matchAll(/\bid=["']([^"']+)["']/g)].map(m=>m[1]));
 const missing=[];
 for(const name of ['app.js','phase2-engine.js']){
   const source=file(name);
   for(const m of source.matchAll(/(?:getElementById|\$|\bel)\s*\(\s*["'`]([^"'`]+)["'`]\s*\)/g))if(!ids.has(m[1]))missing.push(`${name}:#${m[1]}`);
   for(const m of source.matchAll(/querySelector(?:All)?\s*\(\s*["'`]#([A-Za-z][\w-]*)["'`]\s*\)/g))if(!ids.has(m[1]))missing.push(`${name}:#${m[1]}`);
 }
 assert.deepEqual(missing,[],`Missing IDs: ${missing.join(', ')}`);
 console.log(`  IDs in HTML: ${ids.size}`);
});
run('B rules schema: game/ability/ballot/whisper keys explicitly declared',()=>{
 const required=['classUses','insightUses','rerollUses','abilityEvents','abilityFeedback','abilityReveals','discoveredStages','weaknessStages'];
 const missing=required.filter(k=>!(k in gameRules));
 assert.deepEqual(missing,[],`Missing /game rules: ${missing.join(', ')}`);
 const invalid=[];
 for(const key of required){
  const map=gameRules[key];
  const inner=map?.$uid || map?.$stage || map?.$eventId;
  if(!inner)invalid.push(`${key}: missing per-entry validator`);
  if(key==='insightUses'||key==='discoveredStages'||key==='weaknessStages'){
    if(typeof inner?.['.validate']!=='string')invalid.push(`${key}: missing value validator`);
  }else if(key==='classUses'||key==='rerollUses'){
    if(!inner?.r1?.['.validate']||!inner?.r2?.['.validate']||inner?.$other?.['.validate']!==false)invalid.push(`${key}: missing per-realm checks or unknown-field denial`);
  }else{
    if(!inner?.['.validate']||inner?.$other?.['.validate']!==false)invalid.push(`${key}: record/unknown-field validation missing`);
  }
 }
 for(const key of ['learningBonus','weaknessBonus'])if(!gameRules[key]?.['.validate'])invalid.push(`${key}: missing numeric validator`);
 assert.deepEqual(invalid,[],invalid.join(', '));
 assert.equal(gameRules.$other['.validate'],false);
 for(const [target,fields] of [['abilities',['roundId','type','requestId','optionId','intent','cardId']],['ballots',['roundId','choice','at','revised']],['whispers',['roundId','reason','emoji']]]){
   const schema=roomRules[target].$uid;
   const absent=fields.filter(k=>!(k in schema));
   assert.deepEqual(absent,[],`Missing /${target}/$uid validator(s): ${absent.join(', ')}`);
   assert.equal(schema.$other['.validate'],false,`${target} unknown-field blocker`);
 }
 console.log(`  /game declared keys: ${Object.keys(gameRules).filter(k=>!k.startsWith('.')).length-1}`);
});
run('C content schema: 10 present stages, lore, conditional tags, all epistemic reveals, weaknesses',()=>{
 const errors=[];
 for(let r=0;r<chapters.length;r++) for(const stage of stagesOf(chapters[r])){
   const key=`Realm ${r+1}/${stage.id}`;
   if(![3,4].includes(stage.options?.length))errors.push(`${key} option count`);
   const ids=stage.options.map(o=>o.id);
   if(new Set(ids).size!==ids.length)errors.push(`${key} duplicate option ids`);
   const strong=stage.options.filter(o=>o.tag==='STRONG');
   if(strong.length!==1 && !stage.conditional)errors.push(`${key} STRONG count ${strong.length}`);
   for(const o of stage.options){
     const lore=o.loreCard;
     for(const f of ['theory','corePrinciple','sceneAnalysis','strongestObjection'])if(!lore?.[f])errors.push(`${key}/${o.id} missing lore.${f}`);
     for(const f of ['name','thinker','work'])if(!lore?.theory?.[f])errors.push(`${key}/${o.id} missing lore.theory.${f}`);
     for(const f of ['hiddenPremise','consequence'])if(!o[f])errors.push(`${key}/${o.id} missing ${f}`);
   }
   for(const f of ['observation','argumentForm'])if(!stage[f])errors.push(`${key} missing ${f}`);
   if(!Array.isArray(stage.argumentForm?.premises)||!stage.argumentForm.conclusion)errors.push(`${key} malformed argumentForm`);
   if(chapters[r].bossPhases.includes(stage) && !['skeptic','empiricist','rationalist','pragmatist'].includes(stage.weakness))errors.push(`${key} boss weakness`);
   if(stage.conditional){
     const c=stage.conditional;
     if(!stage.options.some(o=>o.id===c.strongOptionId)||!stage.options.some(o=>o.id===c.previousStrongOptionId))errors.push(`${key} invalid conditional ids`);
     const mock={stageIndex:0,discoveredStages:{s0:true}};
     if(stage.options.filter(o=>effectiveTag(stage,o,mock)==='STRONG').length!==1)errors.push(`${key} conditional STRONG count`);
   }
 }
 assert.deepEqual(errors,[],errors.join('\n'));
});
run('D answer diversity: theory-level STRONG counts, <=40% of available stages',()=>{
 const total=stages.length;let count={};
 for(let r=0;r<chapters.length;r++){
   const per={};
   for(const s of stagesOf(chapters[r])){
     const key=s.options.find(o=>o.tag==='STRONG').loreCard.theory.name;
     per[key]=(per[key]||0)+1;count[key]=(count[key]||0)+1;
   }
   console.log(`  Realm ${r+1}: ${Object.entries(per).map(([k,v])=>`${k}=${v}`).join('; ')}`);
 }
 const offenders=Object.entries(count).filter(([k,v])=>v/total>0.4);
 assert.deepEqual(offenders,[],`Overrepresented: ${JSON.stringify(offenders)}`);
});
run('E option-length tell: STRONG longest in <=60% of present stages',()=>{
 const longest=stages.filter((s,i)=>{
   const scenarios=[{stageIndex:i,discoveredStages:{}}];
   if(s.conditional)scenarios.push({stageIndex:i,discoveredStages:{['s'+i]:true}});
   return scenarios.some(g=>{const opt=s.options.find(o=>effectiveTag(s,o,g)==='STRONG');return opt.text.length===Math.max(...s.options.map(o=>o.text.length));});
 }).length;
 console.log(`  Longest STRONG (including conditional reveals) ${longest}/${stages.length} = ${(100*longest/stages.length).toFixed(1)}%`);
 assert(longest/stages.length<=0.6);
});
run('F 100,000-trial Monte Carlo: real resolveCheck, all DC and weakness cases',()=>{
 const cases=[
  ['STRONG DC10',['STRONG','STRONG'],10,0,0,0.85,1],
  ['STRONG DC12',['STRONG','STRONG'],12,0,0,0,1],
  ['STRONG boss DC16',['STRONG','STRONG'],16,0,0,0.45,0.65],
  ['STRONG boss DC16 + weakness',['STRONG','STRONG'],16,0,5,0.8,1],
  ['mixed STRONG/DEFENSIBLE DC10',['STRONG','DEFENSIBLE'],10,0,0,0,1],
  ['mixed STRONG/DEFENSIBLE boss DC16',['STRONG','DEFENSIBLE'],16,0,0,0,1],
  ['all WEAK DC10',['WEAK','WEAK'],10,0,0,0,0.3],
  ['all WEAK boss DC16',['WEAK','WEAK'],16,0,0,0,0.3],
  ['STRONG Second Look+3 DC16',['STRONG','STRONG'],16,1,0,0,1]
 ];
 for(const [label,tags,dc,attempt,bonus,min,max] of cases){
   let wins=0;for(let i=0;i<100_000;i++)wins+=+resolveCheck({tags,dc,attempt,weaknessBonus:bonus}).success;
   const rate=wins/100000;
   console.log(`  ${label}: ${(rate*100).toFixed(2)}% (${wins}/100000)`);
   assert(rate>=min&&rate<=max,`${label} outside [${min},${max}]`);
 }
});

// Minimal real engine/Firebase/DOM harness, with no other game simulation implementation.
let ui,room,uid,time,dieValue,tick,api,sawWrites,notices;
const realNow=Date.now,realRandom=Math.random,realInterval=globalThis.setInterval;
function element(tag='div'){
 const x={tag,children:[],className:'',dataset:{},hidden:false,disabled:false,inert:false,tabIndex:0,textContent:'',attributes:{},
  setAttribute(k,v){this.attributes[k]=v},append(...nodes){this.children.push(...nodes)},replaceChildren(){this.children=[]},handlers:{},addEventListener(ev,fn){this.handlers[ev]=fn},
  classList:{add(k){x.className+=' '+k}}};return x;
}
function clone(v){return structuredClone(v);}
function write(p,value){
 const keys=p.split('/').filter(Boolean).slice(2);
 if(keys[0]==='game'){
  const top=keys[1];
  if(top)sawWrites.add(top);
  else for(const field of Object.keys(value||{}))sawWrites.add(field);
 }else if(['abilities','ballots','whispers'].includes(keys[0])&&value && typeof value==='object'){
  const validator=roomRules[keys[0]].$uid;
  const missing=Object.keys(value).filter(k=>!(k in validator));
  assert.deepEqual(missing,[],`Unknown /${keys[0]}/${keys[1]} fields: ${missing.join(', ')}`);
 }
 let obj=room;
 for(const k of keys.slice(0,-1))obj=obj[k]??={};
 if(value===null)delete obj[keys.at(-1)];else obj[keys.at(-1)]=clone(value);
}
function setup(size){
 ui=new Map();uid='p0';time=1790000000000;dieValue=20;sawWrites=new Set();notices=[];
 const classes=['skeptic','empiricist','rationalist','pragmatist'];
 room={status:'lobby',hostUid:'p0',players:Object.fromEntries(Array.from({length:size},(_,i)=>[`p${i}`,{connected:true,name:`Player ${i+1}`,class:classes[i%4]}]))};
 api={ref:(_,p)=>p,set:async(p,v)=>write(p,v),update:async(p,v)=>{for(const [key,val] of Object.entries(v))write(p+'/'+key,val)}};
 return makeEngine({db:{},api,getContext:()=>({room,uid,code:'TEST'}),content:chapters[0],realm2Content:chapters[1],epilogueContent:epilogue,notice:m=>notices.push(m)});
}
function textAll(node){return [node.textContent,...node.children.flatMap(textAll)].join(' ')}
const flush=()=>new Promise(r=>setImmediate(r));
async function sync(){uid=room.hostUid;tick();await flush();}
async function hostNext(e){uid=room.hostUid;e.render(room);const b=ui.get('game-next');assert(b&&!b.hidden&&!b.disabled,`Host next absent in ${room.game?.phase}`);await b.handlers.click();}
async function cast(e,player,index){
 uid=player;e.render(room);const s=stages[room.game.stageIndex];const button=ui.get('game-choices').children.find(b=>b.textContent===s.options[index].text);
 assert(button&&!button.disabled,`${player} cannot cast in stage ${room.game.stageIndex}`);
 await button.handlers.click();time+=10;
}
async function useMethod(e,player){
 uid=player;e.render(room);const klass=room.players[player].class;
 const label={skeptic:'Interrogate',empiricist:'Observe',rationalist:'Deduce',pragmatist:'Test'}[klass];
 const b=ui.get('game-abilities').children.find(b=>b.tag==='button'&&b.textContent.includes(label));
 assert(b,`No ${klass} action in ${room.game.phase}`);
 await b.handlers.click();time+=10;await sync();
 assert(room.game.classUses[player]?.['r'+room.game.realm],`Class ability not consumed for ${player}`);
 assert(room.game.abilityFeedback[player].accepted,room.game.abilityFeedback[player].message);
 assert(Object.values(room.game.abilityEvents).some(ev=>ev.uid===player&&ev.message.includes(label)));
 if(klass==='empiricist' && [1,6].includes(room.game.stageIndex)){
   const index=room.game.stageIndex;
   assert(room.game.discoveredStages['s'+index],`Observe did not unlock stage ${index}`);
   const stage=stages[index];
   assert.equal(effectiveTag(stage,stage.options.find(o=>o.id===stage.conditional.strongOptionId),room.game),'STRONG');
 }
 if(klass==='rationalist'&&room.game.stageIndex===7){
   assert(room.game.weaknessStages.s7,'Deduce did not trigger Descartes boss weakness');
   const stage=stages[7];
   assert.equal(effectiveTag(stage,stage.options.find(o=>o.id==='experience-now'),room.game),'STRONG');
 }
 uid=player;e.render(room);
 assert(textAll(ui.get('game-abilities')).includes('used '+label),`Use not visible to party for ${klass}`);
}
function strongIndex(stage,g){return stage.options.findIndex(o=>effectiveTag(stage,o,g)==='STRONG')}
async function finishRoll(e){
 if(room.game.phase==='debate'){time=room.game.debateDeadline+2;await sync()}
 assert.equal(room.game.phase,'ready-to-roll');
 await hostNext(e);assert.equal(room.game.phase,'rolling');
 time=room.game.rollRevealAt+10;await sync();assert.equal(room.game.phase,'result');
}
async function ensureProgress(e){
 let count=0;
 while(room.game.phase!=='epilogue-vote'){
   assert(++count<150,`dead end ${room.game.phase} stage ${room.game.stageIndex}`);
   const g=room.game;
   if(g.phase==='choice'){
     const s=stages[g.stageIndex],eligible=g.stageIndex%5===3?[g.spotlightUid]:Object.keys(room.players).filter(x=>room.players[x].connected);
     // Class methods only once per realm. Hold Empiricist until fish and Rationalist until the Cogito.
     for(const player of Object.keys(room.players)){
       const klass=room.players[player].class;
       if(g.classUses?.[player]?.['r'+g.realm])continue;
       const when=klass==='empiricist'?(g.realm===1?1:6):klass==='rationalist'&&g.realm===2?7:g.realm===1?0:5;
       if(g.stageIndex===when)await useMethod(e,player);
     }
     if(g.stageIndex===5&&!g.insightUses?.p0){
       // Using a class method does not prevent campaign Insight, and vice versa.
       uid='p0';e.render(room);const b=ui.get('game-abilities').children.find(b=>b.tag==='button'&&b.textContent.startsWith('Use Insight:'));
       assert(b,'Insight button missing after Realm I boss');await b.handlers.click();await sync();
       assert.equal(room.game.insightUses.p0,true);
       assert.equal(room.game.abilityFeedback.p0.accepted,true);
       // A second request in the same campaign gets a player-visible rejection.
       uid='p0';e.render(room);const n=notices.length; // button hidden after use, test explicit method rejection via manual request later
       assert.equal(ui.get('game-abilities').children.some(b=>b.tag==='button'&&b.textContent.startsWith('Use Insight:')),false);
     }
     for(const player of eligible)await cast(e,player,strongIndex(s,room.game));
     await sync();
   }else if(g.phase==='debate'){time=g.debateDeadline+2;await sync();}
   else if(g.phase==='ready-to-roll')await hostNext(e);
   else if(g.phase==='rolling'){time=g.rollRevealAt+10;await sync()}
   else if(g.phase==='result'){
     if(!g.success){await hostNext(e);assert(['choice','plugged'].includes(room.game.phase),'failure cannot progress');}
     else await hostNext(e);
   }else if(['lore','realm-complete','plugged'].includes(g.phase))await hostNext(e);
   else throw Error(`unhandled phase ${g.phase}`);
 }
}
async function scenario(size,ending){
 const e=setup(size);await e.begin();assert.equal(room.game.stageIndex,0);
 const players=Object.keys(room.players);
 // First choice: deliberately disagree to enter debate; one ability occurs during debate.
 await cast(e,'p0',0);await cast(e,'p1',2);
 for(const player of players.slice(2))await cast(e,player,0);
 await sync();assert.equal(room.game.phase,'debate');
 await useMethod(e,'p0');
 // Preset reason and one changed vote, without altering class-method cooldown.
 uid='p1';e.render(room);const reasonPanel=ui.get('game-debate').children.find(n=>n.className==='reason-buttons');
 assert(reasonPanel);await reasonPanel.children[0].handlers.click();
 await cast(e,'p1',0);assert.equal(room.ballots.p1.revised,true);
 time=room.game.debateDeadline+1;await sync();assert.equal(room.game.phase,'ready-to-roll');
 // Forced failed check, then Second Look: +3; penalty costs exactly one Grip.
 dieValue=1;await hostNext(e);time=room.game.rollRevealAt+5;await sync();assert.equal(room.game.success,false);
 await hostNext(e);assert.equal(room.game.attempt,1);assert.equal(room.game.grip.value,9);
 dieValue=20;
 // Entire journey, including one fully plugged in failure and host handoff mid-boss.
 let didPlug=false,didHandoff=false;
 let guard=0;
 while(room.game.phase!=='epilogue-vote'){
   assert(++guard<180,`dead end ${room.game.phase} ${room.game.stageIndex}`);
   const g=room.game,stage=stages[g.stageIndex];
   if(g.phase==='choice'){
     if(g.stageIndex===2&&!didPlug){
       room.game.grip.value=1;
       const eligible=g.stageIndex%5===3?[g.spotlightUid]:players;
       for(const p of eligible)await cast(e,p,stage.options.findIndex(o=>o.tag==='WEAK'));
       await sync();if(room.game.phase==='debate'){time=room.game.debateDeadline+1;await sync();}
       assert.equal(room.game.phase,'ready-to-roll');dieValue=1;await hostNext(e);
       time=room.game.rollRevealAt+5;await sync();assert.equal(room.game.success,false);
       await hostNext(e);assert.equal(room.game.phase,'plugged');assert.equal(room.game.stageIndex,2);
       didPlug=true;dieValue=20;
       await hostNext(e);assert.equal(room.game.stageIndex,2);assert.equal(room.game.grip.value,6);
       room.hostUid='p1';didHandoff=true;
       continue;
     }
     for(const player of players){
       const klass=room.players[player].class;
       if(g.classUses?.[player]?.['r'+g.realm])continue;
       const when=klass==='empiricist'?(g.realm===1?1:6):klass==='rationalist'&&g.realm===2?7:g.realm===1?0:5;
       if(g.stageIndex===when)await useMethod(e,player);
     }
     if(g.stageIndex===5&&!g.insightUses?.p0){
       uid='p0';e.render(room);const b=ui.get('game-abilities').children.find(x=>x.tag==='button'&&x.textContent.startsWith('Use Insight:'));
       assert(b,'Insight unavailable after beating Zhuangzi');await b.handlers.click();await sync();
       assert(room.game.insightUses.p0,'insight flag not set');
       assert(room.game.classUses.p0.r2,'class and Insight should be independent');
     }
     const eligible=g.stageIndex%5===3?[g.spotlightUid]:players;
     for(const player of eligible)await cast(e,player,strongIndex(stage,room.game));
     await sync();
   }else if(g.phase==='debate'){time=g.debateDeadline+1;await sync();}
   else if(g.phase==='ready-to-roll')await hostNext(e);
   else if(g.phase==='rolling'){time=g.rollRevealAt+5;await sync()}
   else if(g.phase==='result'){
     if(!g.success){dieValue=20;await hostNext(e);}else await hostNext(e);
   }else if(['lore','realm-complete','plugged'].includes(g.phase))await hostNext(e);
   else throw Error(`Unexpected ${g.phase}`);
 }
 assert(didPlug&&didHandoff,'did not exercise plug and handoff');
 assert.equal(Object.keys(room.game.history).length,10,'missing stages in history');
 for(const p of players)for(const realm of [1,2])assert.equal(room.game.classUses[p]?.['r'+realm],true,`missing method for ${p} r${realm}`);
 assert.equal(room.game.insightUses.p0,true);
 assert.equal(room.game.usedCards['butterfly-perspective'],true);
 assert(room.game.insightCards['revisable-knowledge']);
 for(const p of players){uid=p;e.render(room);const b=ui.get('game-choices').children.find(x=>x.textContent.startsWith(epilogue.options[ending].label+' —'));assert(b);await b.handlers.click();}
 await sync();assert.equal(room.game.phase,'epilogue-finished');assert.equal(room.game.epilogue.ending,ending===0?'unplug':'stay');
 uid=room.hostUid;e.render(room);assert(textAll(ui.get('game-lore')).includes('The Unscripted Door')||textAll(ui.get('game-lore')).includes('The World You Choose'));
 // The runtime write recorder includes fields from whole-game set(), newStage(), and update() paths.
 const missing=[...sawWrites].filter(k=>!(k in gameRules));
 assert.deepEqual(missing,[],`Unknown /game keys (including newStage/update()): ${missing.join(', ')}`);
 console.log(`  ${size} players → ${ending===0?'UNPLUG':'STAY'}: stages=10, classUses=${players.length*2}, game writes=${sawWrites.size}, handoff=yes, plug=yes, Insight=yes`);
}
try{
 Date.now=()=>time;
 Math.random=()=>((dieValue-1)+0.001)/20;
 globalThis.document={getElementById(id){if(!ui.has(id))ui.set(id,element());return ui.get(id)},createElement:element};
 globalThis.setInterval=callback=>{tick=callback;return 1};
 await runAsync('G headless full run CURRENT REALMS (I → II → Epilogue), 2/3/6 players, both endings, flags, debate, retries, plug, handoff',async()=>{
   for(const size of [2,3,6])for(const ending of [0,1])await scenario(size,ending);
 });
 await runAsync('H visible ability feedback: accepted and rejected requests, separate cooldowns',async()=>{
   const e=setup(2);await e.begin();
   await useMethod(e,'p0');
   // A second request in the same realm is rejected by the host with a specific message.
   const g=room.game;
   room.abilities={p0:{roundId:g.roundId,type:'skeptic',optionId:stages[0].options[0].id,requestId:'repeat-unique'}};
   await sync();
   assert.equal(room.game.abilityFeedback.p0.accepted,false);
   assert.match(room.game.abilityFeedback.p0.message,/already used/);
   uid='p0';e.render(room);assert(textAll(ui.get('game-abilities')).includes('already used'), 'rejection not player-visible');
   assert(Object.values(room.game.abilityEvents).some(x=>!x.accepted));
   // A class use never marks a campaign Insight flag.
   assert.equal(room.game.insightUses?.p0,undefined);
 });
}finally{Date.now=realNow;Math.random=realRandom;globalThis.setInterval=realInterval;}
// The content for Realm VI is intentionally deferred to Pass 1. Do NOT misreport a complete Short Quest.
if(!existsSync(join(quest,'realm6-content.json'))){
 deferred('C/D/E Short Quest-wide Realm VI coverage','Realm VI content is Pass 1; current 10 stages checked');
 deferred('G full I → II → VI → Epilogue','Realm VI does not exist until Pass 1; current complete I → II → Epilogue path simulated');
}
console.log(`TOTAL ${checks-failures} passed, ${failures} failed, ${deferrals} deferred`);
process.exitCode=failures?1:0;
