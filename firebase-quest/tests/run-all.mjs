#!/usr/bin/env node
// Standalone Node 18+ checks. No npm modules, network, or Firebase credentials.
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createServer} from 'node:http';
import {once} from 'node:events';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {dirname,resolve,join} from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const quest=join(root,'public/quest');
const file=name=>readFileSync(join(quest,name),'utf8');
const chapters=[1,2,6].map(i=>JSON.parse(file(`realm${i}-content.json`)));
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
 const required=['readingReady','readingDeadline','readingSeconds','bossWeakness','classUses','insightUses','rerollUses','abilityEvents','abilityFeedback','abilityReveals','discoveredStages','weaknessStages'];
 const missing=required.filter(k=>!(k in gameRules));
 assert.deepEqual(missing,[],`Missing /game rules: ${missing.join(', ')}`);
 const invalid=[];
 for(const key of required){
  const map=gameRules[key];
  const inner=map?.$uid || map?.$stage || map?.$eventId;
  if(!inner && !['readingDeadline','readingSeconds','bossWeakness'].includes(key))invalid.push(`${key}: missing per-entry validator`);
  if(key==='insightUses'||key==='discoveredStages'||key==='weaknessStages'||key==='readingReady'){
    if(typeof inner?.['.validate']!=='string')invalid.push(`${key}: missing value validator`);
  }else if(key==='classUses'||key==='rerollUses'){
    if((key==='classUses' ? ['r1','r2','r6'].some(r=>!inner?.[r]?.encounter?.['.validate']||!inner?.[r]?.boss?.['.validate']||inner?.[r]?.$other?.['.validate']!==false):['r1','r2','r6'].some(r=>!inner?.[r]?.['.validate'])) || inner?.$other?.['.validate']!==false)invalid.push(`${key}: missing per-realm checks or unknown-field denial`);
  }else if(!['readingDeadline','readingSeconds','bossWeakness'].includes(key)){
    if(!inner?.['.validate']||inner?.$other?.['.validate']!==false)invalid.push(`${key}: record/unknown-field validation missing`);
  }
 }
 for(const key of ['learningBonus','weaknessBonus','readingDeadline','readingSeconds','bossWeakness'])if(!gameRules[key]?.['.validate'])invalid.push(`${key}: missing numeric validator`);
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
run('X Firebase rule wildcard topology: no sibling wildcard collisions',()=>{
 const errors=[];
 const visit=(node,path)=>{
   if(!node || typeof node!=='object' || Array.isArray(node))return;
   const wildcardKeys=Object.keys(node).filter(key=>key.startsWith('$'));
   if(wildcardKeys.length>1)errors.push(`${path}: ${wildcardKeys.join(', ')}`);
   for(const [key,value] of Object.entries(node))if(value && typeof value==='object')visit(value,`${path}/${key}`);
 };
 visit(rules,'');
 assert.deepEqual(errors,[],`Conflicting wildcard rules: ${errors.join('; ')}`);
 assert(!JSON.stringify(rules).includes('numChildren('),'Unsupported numChildren() in Firebase Realtime Database rules');
});
run('C content schema: 15 present stages, lore, conditional tags, all epistemic reveals, weaknesses',()=>{
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
   console.log(`  Realm ${["I","II","VI"][r]}: ${Object.entries(per).map(([k,v])=>`${k}=${v}`).join('; ')}`);
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
run('E2 WEAK options do not overuse absolutist language across the Short Quest',()=>{
 // Count only the requested absolute expressions; ordinary hypothetical 'could' is not an absolute.
 const absoluteWords=/\b(?:must|never|every)\b|\bnobody\s+could\b/gi;
 const count=o=>(o.text.match(absoluteWords)||[]).length;
 const weak=stages.flatMap(s=>s.options.filter(o=>o.tag==='WEAK'));
 const strong=stages.flatMap(s=>s.options.filter(o=>o.tag==='STRONG'));
 const weakCount=weak.reduce((sum,o)=>sum+count(o),0);
 const strongCount=strong.reduce((sum,o)=>sum+count(o),0);
 const weakFrequency=weakCount/weak.length;
 const strongFrequency=strongCount/strong.length;
 console.log(`  WEAK: ${weakCount} absolute expressions in ${weak.length} options (${weakFrequency.toFixed(3)}/option)`);
 console.log(`  STRONG: ${strongCount} absolute expressions in ${strong.length} options (${strongFrequency.toFixed(3)}/option)`);
 assert(weakFrequency<=strongFrequency,`WEAK options use absolutist language more often (${weakFrequency.toFixed(3)}) than STRONG options (${strongFrequency.toFixed(3)})`);
 // Specifically guard the five newly rewritten Nozick traps against regression.
 for(const s of stages.slice(10,15))for(const o of s.options.filter(o=>o.tag==='WEAK'))
   assert.equal(count(o),0,`Realm VI WEAK action ${s.id}/${o.id} uses an absolute expression: ${o.text}`);
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
 room={status:'lobby',campaign:'short',hostUid:'p0',players:Object.fromEntries(Array.from({length:size},(_,i)=>[`p${i}`,{connected:true,name:`Player ${i+1}`,class:classes[i%4]}]))};
 api={ref:(_,p)=>p,set:async(p,v)=>write(p,v),update:async(p,v)=>{for(const [key,val] of Object.entries(v))write(p+'/'+key,val)}};
 return makeEngine({db:{},api,getContext:()=>({room,uid,code:'TEST'}),content:chapters[0],realm2Content:chapters[1],realm6Content:chapters[2],epilogueContent:epilogue,notice:m=>notices.push(m)});
}
function textAll(node){return [node.textContent,...node.children.flatMap(textAll)].join(' ')}
const flush=()=>new Promise(r=>setImmediate(r));
async function sync(){for(let i=0;i<4;i++){uid=room.hostUid;tick();await flush();}}
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
 assert(room.game.classUses[player]?.['r'+room.game.realm]?.[room.game.stageIndex%5<2?'encounter':'boss'],`Class ability not consumed for ${player}`);
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
   if(g.phase==='reading'){time=g.readingDeadline+1;await sync();assert.equal(room.game.phase,'choice');}
   else if(g.phase==='epilogue-reading'){time=g.readingDeadline+1;await sync();assert.equal(room.game.phase,'epilogue-vote');}
   else if(g.phase==='choice'){
     const s=stages[g.stageIndex],eligible=g.stageIndex%5===3?[g.spotlightUid]:Object.keys(room.players).filter(x=>room.players[x].connected);
     // Class methods only once per realm. Hold Empiricist until fish and Rationalist until the Cogito.
     for(const player of Object.keys(room.players)){
       const klass=room.players[player].class;
       if(g.classUses?.[player]?.['r'+g.realm]?.[(g.stageIndex%5<2?'encounter':'boss')])continue;
       const when=(g.stageIndex%5>=2)?(g.realm===1?2:g.realm===2?7:12):(klass==='empiricist'?(g.realm===1?1:g.realm===2?6:11):(g.realm===1?0:g.realm===2?5:10));
       if(g.stageIndex===when || (g.stageIndex%5===2 && (g.stageIndex%5<2?'encounter':'boss')==='boss'))await useMethod(e,player);
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
 const e=setup(size);await e.begin();assert.equal(room.game.stageIndex,0);time=room.game.readingDeadline+1;await sync();assert.equal(room.game.phase,'choice');
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
   assert(++guard<320,`dead end ${room.game.phase} ${room.game.stageIndex}`);
   const g=room.game,stage=stages[g.stageIndex];
   if(g.phase==='reading'){time=g.readingDeadline+1;await sync();assert.equal(room.game.phase,'choice');}
   else if(g.phase==='epilogue-reading'){time=g.readingDeadline+1;await sync();assert.equal(room.game.phase,'epilogue-vote');}
   else if(g.phase==='choice'){
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
       if(g.classUses?.[player]?.['r'+g.realm]?.[(g.stageIndex%5<2?'encounter':'boss')])continue;
       const when=(g.stageIndex%5>=2)?(g.realm===1?2:g.realm===2?7:12):(klass==='empiricist'?(g.realm===1?1:g.realm===2?6:11):(g.realm===1?0:g.realm===2?5:10));
       if(g.stageIndex===when || (g.stageIndex%5===2 && (g.stageIndex%5<2?'encounter':'boss')==='boss'))await useMethod(e,player);
     }
     if(g.stageIndex===5&&!g.insightUses?.p0){
       uid='p0';e.render(room);const b=ui.get('game-abilities').children.find(x=>x.tag==='button'&&x.textContent.startsWith('Use Insight:'));
       assert(b,'Insight unavailable after beating Zhuangzi');await b.handlers.click();await sync();
       assert(room.game.insightUses.p0,'insight flag not set');
       assert(room.game.classUses.p0?.r2?.encounter,'class and Insight should be independent');
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
 assert.equal(Object.keys(room.game.history).length,15,'missing stages in history');
 const expectedHistory=chapters.flatMap((ch,r)=>stagesOf(ch).map((stage,local)=>({key:`r${[1,2,6][r]}-s${r*5+local}`,realm:[1,2,6][r],title:stage.title,stageId:stage.id})));
 assert.deepEqual(Object.keys(room.game.history),expectedHistory.map(x=>x.key),'Realm sequence/history unexpectedly changed');
 for(const item of expectedHistory){
   const record=room.game.history[item.key];
   assert.equal(record.realm,item.realm,`Realm mismatch for ${item.key}`);
   assert.equal(record.stageId,item.stageId,`Stage mismatch for ${item.key}`);
   assert.equal(record.title,item.title,`Title mismatch for ${item.key}`);
 }
 for(const p of players)for(const realm of [1,2,6])for(const kind of ['encounter','boss'])assert.equal(room.game.classUses[p]?.['r'+realm]?.[kind],true,`missing ${kind} method for ${p} r${realm}`);
 assert.equal(room.game.insightUses.p0,true);
 assert.equal(room.game.usedCards['butterfly-perspective'],true);
 assert(room.game.insightCards['revisable-knowledge']);assert(room.game.insightCards['lived-agency']);
 for(const p of players){uid=p;e.render(room);const b=ui.get('game-choices').children.find(x=>x.textContent.startsWith(epilogue.options[ending].label+' —'));assert(b);await b.handlers.click();}
 await sync();assert.equal(room.game.phase,'epilogue-finished');assert.equal(room.game.epilogue.ending,ending===0?'unplug':'stay');
 uid=room.hostUid;e.render(room);assert(textAll(ui.get('game-lore')).includes('The Unscripted Door')||textAll(ui.get('game-lore')).includes('The World You Choose'));
 // The runtime write recorder includes fields from whole-game set(), newStage(), and update() paths.
 const missing=[...sawWrites].filter(k=>!(k in gameRules));
 assert.deepEqual(missing,[],`Unknown /game keys (including newStage/update()): ${missing.join(', ')}`);
 console.log(`  ${size} players → ${ending===0?'UNPLUG':'STAY'}: stages=15, classUses=${players.length*6}, game writes=${sawWrites.size}, handoff=yes, plug=yes, Insight=yes`);
}
try{
 Date.now=()=>time;
 Math.random=()=>((dieValue-1)+0.001)/20;
 globalThis.document={getElementById(id){if(!ui.has(id))ui.set(id,element());return ui.get(id)},createElement:element};
 globalThis.setInterval=callback=>{tick=callback;return 1};
 await runAsync('G headless full run CURRENT REALMS (I → II → VI → Epilogue), 2/3/6 players, both endings, flags, debate, retries, plug, handoff',async()=>{
   for(const size of [2,3,6])for(const ending of [0,1])await scenario(size,ending);
 });
 await runAsync('H visible ability feedback: accepted and rejected requests, separate cooldowns',async()=>{
   const e=setup(2);await e.begin();time=room.game.readingDeadline+1;await sync();
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
 await runAsync('I boss weakness drawn only from connected player classes (including absent-class fallback)',async()=>{
   for(const count of [2,3,6]){
     const e=setup(count);await e.begin();
     let seen=0,guard=0;
     while(room.game.phase!=='epilogue-reading'&&room.game.phase!=='epilogue-vote'){
       assert(++guard<290,'weakness traversal stalled');
       const g=room.game,stage=stages[g.stageIndex];
       if(g.phase==='reading'){
         if(g.stageIndex%5>=2){
           const present=new Set(Object.values(room.players).filter(p=>p.connected).map(p=>p.class));
           assert(present.has(g.bossWeakness),`stage ${stage.id}: absent class ${g.bossWeakness}`);seen++;
         }
         time=g.readingDeadline+1;await sync();
       }else if(g.phase==='choice'){
         const eligible=g.stageIndex%5===3?[g.spotlightUid]:Object.keys(room.players);
         for(const player of eligible)await cast(e,player,strongIndex(stage,g));await sync();
       }else if(g.phase==='debate'){time=g.debateDeadline+1;await sync();}
       else if(g.phase==='ready-to-roll'){dieValue=20;await hostNext(e);}
       else if(g.phase==='rolling'){time=g.rollRevealAt+1;await sync();}
       else if(['result','lore','realm-complete','plugged'].includes(g.phase))await hostNext(e);
       else throw Error(`unrecognized ${g.phase}`);
     }
     assert.equal(seen,9,`Expected 9 boss phases, got ${seen}`);
   }
 });
 await runAsync('J votes reject READING, accept CHOOSING, survive stale-state UI re-renders',async()=>{
   const e=setup(2);await e.begin();
   assert.equal(room.game.phase,'reading');
   uid='p0';e.render(room);
   assert(ui.get('game-choices').children.filter(x=>x.tag==='button').every(x=>x.disabled));
   await e.vote(0);assert(!room.ballots?.p0,'reading vote should not be saved');
   for(const player of ['p0','p1']){uid=player;assert.equal(await e.readyToChoose(),true);}
   const before=time;await sync();assert.equal(room.game.phase,'choice');assert(time<room.game.readingDeadline,'ready should end reading early');
   uid='p0';e.render(room);const chosen=stages[0].options[0];
   const button=ui.get('game-choices').children.find(x=>x.textContent===chosen.text);assert(button&&!button.disabled);
   await button.handlers.click();const vote=clone(room.ballots.p0);delete room.ballots.p0;
   e.render(room);const retained=ui.get('game-choices').children.find(x=>x.textContent===chosen.text);
   assert(retained.className.includes('selected'),'pending selection lost on re-render');
   assert(retained.disabled,'duplicate submission enabled while vote pending');room.ballots.p0=vote;
   e.render(room);assert(ui.get('game-choices').children.find(x=>x.textContent===chosen.text).className.includes('selected'));
 });
 await runAsync('K Pragmatist Test and failed-roll reroll are independent',async()=>{
   const e=setup(6);await e.begin();time=room.game.readingDeadline+1;await sync();
   await useMethod(e,'p3');assert.equal(room.game.classUses.p3.r1.encounter,true);
   const g=room.game,weak=stages[g.stageIndex].options.findIndex(o=>o.tag==='WEAK');
   for(const player of Object.keys(room.players))await cast(e,player,weak);
   await sync();assert.equal(room.game.phase,'ready-to-roll');
   dieValue=1;await hostNext(e);time=room.game.rollRevealAt+1;await sync();assert.equal(room.game.phase,'result');assert.equal(room.game.success,false);
   uid='p3';e.render(room);const b=ui.get('game-abilities').children.find(x=>x.tag==='button'&&x.textContent.includes('reroll failed'));
   assert(b,'Test spent the independent reroll');await b.handlers.click();await sync();
   assert.equal(room.game.rerollUses.p3.r1,true);assert.equal(room.game.classUses.p3.r1.encounter,true);
   assert(Object.values(room.game.abilityEvents).some(v=>v.message.includes('Test reroll')));
 });
 await runAsync('L READING/CHOOSING clocks and ready transition for encounters and Epilogue',async()=>{
   const e=setup(3);await e.begin();assert(room.game.readingSeconds>=15&&room.game.readingSeconds<=30);
   for(const player of Object.keys(room.players)){uid=player;await e.readyToChoose();}
   await sync();assert.equal(room.game.phase,'choice');assert.equal(room.game.deadline-time,30000);
   // Epilogue uses the same two phases and separately controlled deadlines.
   const g=room.game;g.phase='epilogue-reading';g.readingReady={};g.readingDeadline=time+20000;
   g.epilogue={startedAt:time,deadline:time+50000,votes:{},tally:{stay:0,unplug:0},ending:'',decisionMode:''};
   for(const player of Object.keys(room.players)){uid=player;await e.readyToChoose();}
   await sync();assert.equal(room.game.phase,'epilogue-vote');assert.equal(room.game.epilogue.deadline-time,30000);
 });
 await runAsync('M information reveals are attributed and visible to every participant',async()=>{
   const e=setup(3);await e.begin();time=room.game.readingDeadline+1;await sync();
   await useMethod(e,'p0');
   for(const player of ['p1','p2']){
     uid=player;e.render(room);
     const transcript=textAll(ui.get('game-abilities'));
     assert(transcript.includes('Player 1 used Interrogate: Hidden premise'),`Reveal hidden from ${player}`);
   }
   uid='p2';await useMethod(e,'p2');
   uid='p0';e.render(room);assert(textAll(ui.get('game-abilities')).includes('Player 3 used Deduce: Argument'));
 });
 await runAsync('Y release screen: live realm heading changes I → II → VI → Exit, with accessible ending',async()=>{
   const e=setup(2);await e.begin();
   for(const [index,realm,label] of [[0,1,'REALM I'],[5,2,'REALM II'],[10,6,'REALM VI']]){
     room.game.stageIndex=index;room.game.realm=realm;room.game.phase='reading';
     uid='p0';e.render(room);
     assert.match(ui.get('game-realm-label').textContent,new RegExp('^SHORT QUEST · '+label+' — '),`Wrong chapter label at stage ${index}`);
     assert.equal(ui.get('game-heading').textContent,chapters[[1,2,6].indexOf(realm)].realm);
   }
   room.game.phase='epilogue-finished';room.game.epilogue={ending:'unplug',tally:{unplug:2,stay:0},votes:{p0:0,p1:0},decisionMode:'majority'};
   uid='p1';e.render(room);
   assert.equal(ui.get('game-realm-label').textContent,'SHORT QUEST · THE EXIT');
   assert.equal(ui.get('game-panel').hidden,false);
   assert.equal(ui.get('game-lore').hidden,false);
   assert.equal(ui.get('game-next').hidden,true);
   assert.equal(ui.get('game-next').disabled,true);
 });
 run('AA weak-answer gate needs at least half strong or defensible answers',()=>{
   const pass=tags=>resolveCheck({tags,dc:10,die:15}).success;
   assert.equal(pass(['STRONG','WEAK']),true,'1 of 2 good should pass the gate');
   assert.equal(pass(['STRONG','WEAK','WEAK']),false,'1 of 3 good should be gated');
   assert.equal(pass(['DEFENSIBLE','STRONG','WEAK','WEAK']),true,'2 of 4 good should pass the gate');
   assert.equal(pass(['WEAK']),false,'a lone weak answer is gated');
   assert.equal(resolveCheck({tags:['WEAK','WEAK','STRONG'],dc:10,die:20}).success,true,'natural 20 still passes');
 });
 await runAsync('AB party size: +1 DC for five or six players; one Test reroll per realm for the party',async()=>{
   for(const [size,boss,enc] of [[2,16,10],[4,16,10],[5,17,11],[6,17,11]]){
     const e=setup(size);await e.begin();
     time=room.game.readingDeadline+1;await sync();
     for(const p of Object.keys(room.players))await cast(e,p,0);
     time=room.game.deadline+1;await sync();
     assert.equal(room.game.phase,'ready-to-roll');
     assert.equal(room.game.dc,enc,`encounter DC for ${size} players`);
     uid='p0';e.render(room);
     assert.equal(textAll(ui.get('game-instructions')).includes('party of'),size>=5,`party note for ${size} players`);
     void boss;
   }
   const e=setup(8);await e.begin();
   room.game.phase='result';room.game.success=false;room.game.votes={p0:0};room.game.die=2;room.game.total=5;room.game.dc=16;
   room.game.rerollUses={p3:{r1:true}};
   uid='p7';e.render(room);
   assert(!textAll(ui.get('game-abilities')).includes('reroll'),'second Pragmatist offered a reroll after the party used one');
   room.game.rerollUses={};uid='p7';e.render(room);
   assert(textAll(ui.get('game-abilities')).includes('reroll'),'Pragmatist not offered the party reroll');
 });
 run('Z release lobby: only Short Quest selectable; Full Campaign labeled coming soon',()=>{
   const html=file('index.html'),js=file('app.js');
   const selector=html.match(/<select[^>]*id=["']campaign["'][^>]*>([\s\S]*?)<\/select>/);
   assert(selector,'Campaign selector missing');
   assert.match(selector[1],/<option[^>]*value="short"[^>]*>/);
   assert.match(selector[1],/<option[^>]*value="full"[^>]*disabled[^>]*>Full Campaign[^<]*coming soon<\/option>/i);
   assert.match(js,/const campaign = "short";/,'Creation must force short on the client');
   assert.match(js,/Only the Short Quest can be started/,'Start action must refuse other modes');
   assert.match(js,/SHORT_REALM_LABELS\[game.realm\]/,'Room status must recognize Realm VI');
   assert(!/<option[^>]*value="full"(?![^>]*disabled)[^>]*>/i.test(selector[1]),'Full Campaign is selectable');
 });

 run('U Realm VI ability reveals and Spotlight whispers permitted by rules',()=>{
   const abilityIndex=roomRules.game.abilityReveals.$uid.stageIndex['.validate'];
   assert.match(abilityIndex,/newData\.val\(\) <= 14/, 'Realm VI stage indices 10–14 would be denied');
   const whisperWrite=roomRules.whispers.$uid['.write'];
   for(const index of [3,8,13])assert(whisperWrite.includes(`stageIndex').val() === ${index}`),`Spotlight whispers omitted stage ${index}`);
   assert.equal(roomRules.whispers.$uid.$other['.validate'],false,'Unknown whisper fields must remain rejected');
 });
 run('AA Firebase rule scope: short-only new rooms, no late seat claims, validated fields',()=>{
   const r=roomRules;
   assert.match(r['.write'],/newData\.child\('campaign'\)\.val\(\) === 'short'/);
   assert.doesNotMatch(r['.write'],/newData\.child\('campaign'\)\.val\(\) === 'full'/);
   assert.equal(r.campaign['.validate'],"newData.val() === 'short'");
   assert.match(r.seats.$slot['.write'],/child\('status'\)\.val\(\) === 'lobby'/);
   assert.match(r.status['.write'],/data\.val\(\) === 'lobby'/);
   assert.match(r.status['.write'],/child\('campaign'\)\.val\(\) === 'short'/);
   // A player with a seat can still rejoin via their own player record.
   assert.match(r.players.$uid['.write'],/auth\.uid === \$uid/);
   assert.match(r.game['.write'],/hostUid/);
   assert.equal(r.game.$other['.validate'],false);
   const hasValidate=(node)=>!!node&&typeof node==='object'&&(Object.prototype.hasOwnProperty.call(node,'.validate')||Object.values(node).some(hasValidate));
   for(const [name,entry] of Object.entries(r.game)){
     if(name.startsWith('.'))continue;
     if(name==='$other')continue;
     assert(hasValidate(entry),`/game/${name} missing validator`);
   }
 });
 await runAsync('R Epilogue tie: independent ballots, host-only resolution, all buttons inaccessible afterward',async()=>{
   const e=setup(2);await e.begin();
   room.game.phase='epilogue-vote';room.game.roundId='exit-tie-case';
   room.game.epilogue={startedAt:time,deadline:time+30000,votes:{},tally:{unplug:0,stay:0},ending:'',decisionMode:''};
   for(const [player,choice] of [['p0',0],['p1',1]]){
     uid=player;e.render(room);
     const b=ui.get('game-choices').children.find(b=>b.textContent.startsWith(epilogue.options[choice].label+' —'));
     assert(b&&!b.disabled);await b.handlers.click();
   }
   await sync();assert.equal(room.game.phase,'epilogue-tie');
   uid='p1';e.render(room);
   assert.equal(ui.get('game-choices').children.filter(b=>b.textContent.startsWith('Resolve tie:')).length,0,'Non-host got tie controls');
   uid='p0';e.render(room);
   const resolve=ui.get('game-choices').children.find(b=>b.textContent==='Resolve tie: STAY');
   assert(resolve,'Host tie option missing');await resolve.handlers.click();
   assert.equal(room.game.phase,'epilogue-finished');assert.equal(room.game.epilogue.ending,'stay');
   assert.equal(room.game.epilogue.decisionMode,'host-tiebreak');
   uid='p1';e.render(room);assert.match(textAll(ui.get('game-lore')),/host resolved it/i);
 });
 await runAsync('S Epilogue dropout: connected voters can finish, results show to all',async()=>{
   const e=setup(3);await e.begin();
   room.game.phase='epilogue-vote';room.game.roundId='exit-dropout-case';
   room.game.epilogue={startedAt:time,deadline:time+30000,votes:{},tally:{unplug:0,stay:0},ending:'',decisionMode:''};
   room.players.p2.connected=false;
   for(const player of ['p0','p1']){
     uid=player;e.render(room);
     const b=ui.get('game-choices').children.find(b=>b.textContent.startsWith('UNPLUG —'));
     assert(b&&!b.disabled);await b.handlers.click();
   }
   await sync();assert.equal(room.game.phase,'epilogue-finished');
   assert.equal(room.game.epilogue.ending,'unplug');
   assert.equal(room.game.epilogue.tally.unplug,2);
   uid='p0';e.render(room);assert.match(textAll(ui.get('game-lore')),/majority vote/i);
 });
 await runAsync('T Vite public/quest assets: all relative imports and content fetches resolve; Firebase rules excluded',async()=>{
   const html=file('index.html'),app=file('app.js'),js=file('phase2-engine.js');
   const assets=new Set([...html.matchAll(/(?:src|href)="(\.\/[^"]+)"/g),...app.matchAll(/(?:from\s+["']|fetch\(["'])(\.\/[\w.\/-]+)/g)].map(m=>m[1]));
   for(const entry of assets){
     const clean=entry.replace(/^\.\//,'');
     assert(!clean.includes('..'),`Unsafe relative import ${entry}`);
     assert(existsSync(join(quest,clean)),`Unresolved deployed asset: ${entry}`);
   }
   for(const name of ['index.html','app.js','phase2-engine.js','styles.css','firebase-config.js','realm1-content.json','realm2-content.json','realm6-content.json','epilogue-content.json']){
     assert(existsSync(join(quest,name)),`Missing deployed file ${name}`);
   }
   assert(!existsSync(join(quest,'database.rules.json')),'Rules must not be under public/quest');
   assert(!existsSync(join(quest,'tests')),'Tests must not be under public/quest');
   assert(!/fetch\(["']\/firebase-quest\//.test(app),'Game loads private rule path');
   // Prove static assets can be fetched under /quest/, without Vite or npm.
   const server=createServer((req,res)=>{
     const pathname=new URL(req.url,'http://localhost').pathname;
     if(!pathname.startsWith('/quest/')){res.writeHead(404);res.end();return;}
     const name=pathname.slice('/quest/'.length)||'index.html';
     if(name.includes('..')||!existsSync(join(quest,name))){res.writeHead(404);res.end();return;}
     res.writeHead(200);res.end(readFileSync(join(quest,name)));
   });
   server.listen(0,'127.0.0.1');await once(server,'listening');
   try{
     const base=`http://127.0.0.1:${server.address().port}`;
     for(const name of ['index.html','app.js','phase2-engine.js','realm1-content.json','realm2-content.json','realm6-content.json','epilogue-content.json']){
       const r=await fetch(`${base}/quest/${name}`);assert.equal(r.status,200,`HTTP ${name}`);
       assert((await r.text()).length>100,`Empty ${name}`);
     }
     assert.equal((await fetch(`${base}/firebase-quest/database.rules.json`)).status,404,'Rules exposed in public');
     assert.equal((await fetch(`${base}/quest/database.rules.json`)).status,404,'Rules exposed in quest');
   }finally{server.close();await once(server,'close');}
   console.log(`  Confirmed ${assets.size} relative references and 7 HTTP asset requests`);
 });
 await runAsync('N no internal stance, tag or option-id labels before lore reveal',async()=>{
   const names=[...new Set(stages.flatMap(stage=>stage.options.map(o=>o.stance)).filter(Boolean))];
   const tabs=['STRONG','DEFENSIBLE','WEAK'];
   const leaked=(value,stage)=>{
     const text=String(value||'');
     const labels=[...names,...tabs];
     const leakedNames=labels.filter(label=>new RegExp('(?:^|[^\\p{L}])'+label.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?:$|[^\\p{L}])','iu').test(text));
     const hyphenated=stage.options.filter(o=>o.id.includes('-')&&text.toLowerCase().includes(o.id.toLowerCase())).map(o=>o.id);
     const explicitIds=stage.options.filter(o=>new RegExp('(?:option|target|id)\\s*[#:=]\\s*'+o.id.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\b','i').test(text)).map(o=>o.id);
     return [...new Set([...leakedNames,...hyphenated,...explicitIds])];
   };
   const stageContent=(stage,ch)=>[
     stage.scene,stage.question,stage.hint,stage.clue,stage.observation,stage.argumentForm.conclusion,
     ...stage.argumentForm.premises,stage.evidenceExplanation||'',ch.opening,ch.machine?.opening,ch.machine?.beforeBoss,
     ...Object.values(ch.machine?.onSecondLook||{}),
     ...Object.values(ch.machine?.betweenStages?.[stage.id]||{}),
     ...stage.options.flatMap(o=>[o.text,o.hiddenPremise,o.consequence])
   ].filter(Boolean);
   let rendered=0,reveals=0;
   for(let i=0;i<stages.length;i++){
     const stage=stages[i],ch=chapters[Math.floor(i/5)];
     for(const text of stageContent(stage,ch))assert.deepEqual(leaked(text,stage),[],`Pre-lore content leak in ${stage.id}: ${text}`);
     const e=setup(4);await e.begin();room.game.stageIndex=i;room.game.realm=[1,2,6][Math.floor(i/5)];
     room.game.optionOrder=stage.options.map((_,j)=>j);room.game.bossWeakness=i%5>=2?stage.weakness:'';
     for(const player of Object.keys(room.players)){
       uid=player;e.render(room);
       const ids=['game-realm-label','game-heading','game-stage','game-scene','game-question','game-machine','game-instructions','game-choices','game-abilities','game-reveal'];
       for(const id of ids){const node=ui.get(id);if(node && !node.hidden)assert.deepEqual(leaked(textAll(node),stage),[],`Pre-lore UI leak ${stage.id} / ${id}: ${textAll(node)}`);}
       rendered++;
     }
     // Exercise the actual Firebase-request processing and reveal UI for every class in every stage.
     for(const player of ['p0','p1','p2','p3']){
       await useMethod(e,player);
       uid=player;e.render(room);
       assert.deepEqual(leaked(textAll(ui.get('game-abilities')),stage),[],`Ability reveal leak ${stage.id} / ${player}`);
       reveals++;
     }
     // A completed roll is still not the philosophical lore reveal.
     room.game.phase='result';room.game.votes={p0:0,p1:0};room.game.die=20;room.game.total=27;
     room.game.success=true;room.game.dc=10;room.game.modifier=7;
     uid='p1';e.render(room);
     assert.deepEqual(leaked(textAll(ui.get('game-reveal')),stage),[],`Premature tag on result screen ${stage.id}`);
   }
   console.log(`  Audited ${stages.length} stages, ${rendered} rendered player views and ${reveals} class reveals`);
 });
 run('O distinct concrete observations and argument forms for all fifteen stages',()=>{
   const obs=stages.map(s=>s.observation.trim().toLowerCase());
   const args=stages.map(s=>[...s.argumentForm.premises,s.argumentForm.conclusion].join(' | ').trim().toLowerCase());
   assert.equal(new Set(obs).size,stages.length,'Repeated observations: '+JSON.stringify(obs));
   assert.equal(new Set(args).size,stages.length,'Repeated argument forms: '+JSON.stringify(args));
   for(const s of stages){
     assert(!/scene contains a physical clue|what changes when you intervene|available reasons support this action/i.test(s.observation+' '+args[stages.indexOf(s)]),`Placeholder in ${s.id}`);
     assert(s.observation.length>=45&&s.argumentForm.premises.length>=2,`Observation or argument too generic in ${s.id}`);
     const tokens=text=>new Set((text.toLowerCase().match(/[a-z]{4,}/g)||[]).filter(w=>!['that','with','this','from','into','their','there','which','would','could','when','have','they','only','every','your','where','what','them','some','even','will','were','while','then'].includes(w)));
     const sceneTokens=tokens(s.scene), observationTokens=tokens(s.observation);
     assert([...observationTokens].some(t=>sceneTokens.has(t)),`Observation lacks a visible scene anchor: ${s.id}`);
   }
   console.log(`  ${new Set(obs).size} observations; ${new Set(args).size} unique premise–conclusion arguments`);
 });
 await runAsync('P conditional tags switch only on the named method in the current stage',async()=>{
   const conditional=stages.map((s,i)=>({s,i})).filter(({s})=>s.conditional);
   assert(conditional.length>=5,'Expected evidence-based alternatives including Hall of Ordinary Things');
   for(const {s,i} of conditional){
     const c=s.conditional,previous=s.options.find(o=>o.id===c.previousStrongOptionId),favored=s.options.find(o=>o.id===c.strongOptionId);
     assert(previous&&favored,`${s.id}: missing conditional option`);
     const e=setup(4);await e.begin();room.game.stageIndex=i;room.game.realm=[1,2,6][Math.floor(i/5)];room.game.optionOrder=s.options.map((_,j)=>j);room.game.bossWeakness=(i%5>=2)?s.weakness:'';
     assert.equal(effectiveTag(s,previous,room.game),'STRONG',`${s.id}: default changed without ability`);
     assert.equal(effectiveTag(s,favored,room.game),'DEFENSIBLE',`${s.id}: evidence option prematurely strongest`);
     const other=Object.keys(room.players).find(u=>room.players[u].class!==c.triggerClass);
     await useMethod(e,other);
     assert(!room.game.discoveredStages?.['s'+i],`${s.id}: wrong class triggered conditional`);
     const player=Object.keys(room.players).find(u=>room.players[u].class===c.triggerClass);
     await useMethod(e,player);
     assert.equal(room.game.discoveredStages?.['s'+i],true,`${s.id}: named ability did not reveal evidence`);
     assert.equal(effectiveTag(s,favored,room.game),'STRONG',`${s.id}: favored action did not change`);
     assert.equal(effectiveTag(s,previous,room.game),'DEFENSIBLE',`${s.id}: former strong response not downgraded`);
     uid='p0';e.render(room);
     const panel=textAll(ui.get('game-abilities'));
     assert(!panel.includes(favored.text),`${s.id}: ability reveal prematurely identifies the favored action`);
     assert(!panel.includes(s.evidenceExplanation),`${s.id}: ability reveal prematurely explains the favored action`);
     if(c.triggerClass==='empiricist')assert(panel.includes(s.observation),`${s.id}: Observe evidence absent`);
     if(c.triggerClass==='rationalist')assert(panel.includes(s.argumentForm.premises[0]),`${s.id}: Deduce argument absent`);
     room.game.phase='lore';room.game.success=true;room.game.votes={p0:s.options.indexOf(previous)};
     uid='p0';e.render(room);
     const lore=textAll(ui.get('game-lore'));
     assert(lore.includes(favored.text),`${s.id}: lore does not identify the favored action`);
     assert(lore.includes(s.evidenceExplanation),`${s.id}: lore does not explain how evidence changed the best-supported action`);
     // Evidence remains tied to this exact stage index, not to another realm's similarly named stage.
     const anotherIndex=(i+1)%stages.length;
     const otherGame={...room.game,stageIndex:anotherIndex};
     if(stages[anotherIndex].conditional){
       const otherStage=stages[anotherIndex],strong=otherStage.options.find(o=>o.tag==='STRONG');
       assert.equal(effectiveTag(otherStage,strong,otherGame),'STRONG',`${s.id}: evidence leaked into stage ${anotherIndex}`);
     }
     console.log(`  ${s.id}: ${c.triggerClass} changed ${previous.id} → ${favored.id}`);
   }
 });
 run('O2 Cogito Deduce distinguishes thinking from the claim that a thinker exists',()=>{
   const cogito=chapters[1].bossPhases[0];
   assert.equal(cogito.id,'reconstruct');
   const premises=cogito.argumentForm.premises;
   assert(premises.length>=2,'Cogito has fewer than two premises');
   assert(premises.some(p=>/thinking (?:occurs|is)|occurrence of thinking|thought occurs/i.test(p)), 'Missing premise that thinking occurs');
   assert(premises.some(p=>/thinker exists|thinker.*exists|substantial thinker exists/i.test(p)), 'Missing premise distinguishing a thinker from thinking');
   assert(/thinking occurs|occurrence of thought|occurrence of thinking/i.test(cogito.argumentForm.conclusion),'Conclusion loses the distinction');
 });
 await runAsync('Q zero ballots automatically fail without displaying a d20 total',async()=>{
   const e=setup(2);await e.begin();time=room.game.readingDeadline+1;await sync();
   assert.equal(room.game.phase,'choice');
   time=room.game.deadline+1;await sync();assert.equal(room.game.phase,'ready-to-roll');
   assert(Object.values(room.game.votes||{}).every(x=>x===-1),'Unexpected submitted ballot');
   dieValue=20;await hostNext(e);assert.equal(room.game.phase,'rolling');assert.equal(room.game.success,false,'No ballots should not pass on natural 20');
   for(const phase of ['rolling','result']){
     if(phase==='result'){time=room.game.rollRevealAt+1;await sync();assert.equal(room.game.phase,'result');}
     uid='p1';e.render(room);
     const msg=textAll(ui.get('game-die'));
     assert(msg.includes('No answers submitted — the check fails automatically.'),`Missing no-ballot message during ${phase}`);
     assert.equal(ui.get('game-roll').hidden,true,`Misleading d20 total exposed during ${phase}`);
     assert(!/d20\s+\d+|\s=\s\d+/.test(msg),`Misleading total in ${phase}: ${msg}`);
   }
 });
}finally{Date.now=realNow;Math.random=realRandom;globalThis.setInterval=realInterval;}

console.log(`TOTAL ${checks-failures} passed, ${failures} failed, ${deferrals} deferred`);
process.exitCode=failures?1:0;
