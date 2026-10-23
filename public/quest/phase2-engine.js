// Phase 2 is deliberately host-coordinated: Firebase Spark has no trusted dice/timer server.
// All clients observe the same persisted game snapshot. A malicious host can manipulate results.
export function makeEngine({ db, api, getContext, content, notice, elements }) {
  const {ref, set, update, runTransaction} = api;
  const el = id => document.getElementById(id);
  const stages = [...content.encounters.map((x,i)=>({...x,kind:'encounter',index:i})),...content.bossPhases.map((x,i)=>({...x,kind:'boss',index:i}))];
  let timerHandle=null, lastAutoKey='', syncing=false;
  const path = (suffix='') => {const {code}=getContext(); return ref(db,`rooms/${code}/game${suffix?'/'+suffix:''}`)};
  const isHost=()=>{const c=getContext();return !!c.room && c.room.hostUid===c.uid};
  const myUid=()=>getContext().uid;
  const stageFor=g=>stages[g.stageIndex] || null;
  const activeMembers=()=>Object.entries(getContext().room?.players||{}).filter(([,p])=>p.connected).map(([uid])=>uid);
  const rand=n=>Math.floor(Math.random()*n);
  const startStage=(index, grip, abilities, cards, usedCards, retry=0, bossWins=0)=>({
    phase:'choice',schemaVersion:1,startedAt:Date.now(),realm:1,stageIndex:index,attempt:retry,
    roundId:`${index}-${retry}-${Date.now()}`,deadline:Date.now()+45000,
    encounters:{activeId:stages[index].id},votes:{},diceResults:{},grip:{value:grip},
    insightCards:cards||{},usedCards:usedCards||{},abilities:abilities||{},bossWins,
    spotlightUid:index===3?activeMembers()[rand(activeMembers().length)]||myUid():'',
    whispers:{},revealed:false,rollBonus:0,rerollUsed:false,eliminated:false,hintVisible:retry>0
  });
  async function begin(){
    if(!isHost())return;
    const room=getContext().room;
    if(Object.keys(room.players||{}).length<2)return notice('Two players are required.','error');
    const ability=Object.fromEntries(Object.keys(room.players).map(uid=>[uid,false]));
    await set(path(),startStage(0,10,ability,{},{}));
    await set(ref(db,`rooms/${getContext().code}/status`),'started');
  }
  async function vote(index){
    const {room,uid,code}=getContext(),g=room?.game,stage=stageFor(g||{});
    if(!g||g.phase!=='choice'||Date.now()>g.deadline||!stage||!stage.options[index])return;
    if(stage.id==='spotlight' && g.spotlightUid!==uid)return;
    // Writes go to each user's own /ballots path, never to the host-owned game path.
    // These choices are not cryptographically private because room members can read the room.
    await set(ref(db,`rooms/${code}/ballots/${uid}`),{roundId:g.roundId,choice:index,at:Date.now()});
  }
  async function whisper(emoji){
    const {room,uid,code}=getContext(),g=room?.game;
    if(!g||g.phase!=='choice'||g.stageIndex!==3||uid===g.spotlightUid||Date.now()>g.deadline)return;
    await set(ref(db,`rooms/${code}/whispers/${uid}`),{roundId:g.roundId,emoji});
  }
  async function ability(){
    const {room,uid}=getContext(),g=room?.game;
    if(!g||g.phase!=='choice'||g.abilities?.[uid]||Date.now()>g.deadline)return;
    const klass=room.players?.[uid]?.class;
    if(klass==='skeptic'||klass==='empiricist'){
      // Host applies these publicly; each player has a dedicated request slot.
      await set(ref(db,`rooms/${getContext().code}/abilities/${uid}`),{roundId:g.roundId,type:klass});
    } else if(klass==='rationalist'){
      await set(ref(db,`rooms/${getContext().code}/abilities/${uid}`),{roundId:g.roundId,type:klass});
    } else if(klass==='pragmatist'){
      notice('Pragmatist reroll becomes available after a failed roll.','info');
    }
  }
  async function requestReroll(){
    const {room,uid,code}=getContext(),g=room?.game;
    if(!g||g.phase!=='result'||g.success||g.rerollUsed||g.abilities?.[uid]||room.players?.[uid]?.class!=='pragmatist')return;
    await set(ref(db,`rooms/${code}/abilities/${uid}`),{roundId:g.roundId,type:'pragmatist'});
  }
  async function useCard(){
    const {room,uid,code}=getContext(),g=room?.game;
    if(!g||g.phase!=='choice'||!g.insightCards?.[content.insight.id]||g.usedCards?.[content.insight.id])return;
    await set(ref(db,`rooms/${code}/abilities/${uid}`),{roundId:g.roundId,type:'insight'});
  }
  async function hostSync(){
    if(!isHost() || syncing)return;
    syncing=true;
    try { await syncOnce(); } finally { syncing=false; }
  }
  async function syncOnce(){
    const {room,code}=getContext(),g=room.game;
    if(!g||!['choice','result'].includes(g.phase))return;
    const pending=Object.entries(room.abilities||{}).filter(([uid,r])=>r.roundId===g.roundId && !g.abilities?.[uid]);
    if(pending.length){
      const [uid,request]=pending[0];const klass=room.players?.[uid]?.class;
      if(request.type==='pragmatist' && klass==='pragmatist' && g.phase==='result' && !g.success && !g.rerollUsed){
        const die=1+rand(20), total=die+g.modifier+(g.rollBonus||0),success=total>=g.dc;
        await update(path(),{rerollUsed:true,success,die,total,[`abilities/${uid}`]:true,[`diceResults/${g.roundId}-reroll`]:{die,total,dc:g.dc,success}});
      } else if(g.phase==='choice' && Date.now()<g.deadline && (request.type===klass || request.type==='insight')){
        const change={[`abilities/${uid}`]:true};
        if(klass==='skeptic')change.eliminated=true;
        if(klass==='empiricist')change.clueVisible=true;
        if(klass==='rationalist')change.rollBonus=(g.rollBonus||0)+3;
        if(request.type==='insight' && g.insightCards?.[content.insight.id] && !g.usedCards?.[content.insight.id]){
          change.rollBonus=(g.rollBonus||0)+3;change[`usedCards/${content.insight.id}`]=true;
        }
        await update(path(),change);
      }
      // Requests are transient and can be overwritten on a new round.
      await set(ref(db,`rooms/${code}/abilities/${uid}`),null);
      return;
    }
    if(g.phase==='choice'){
      const eligible=g.stageIndex===3?[g.spotlightUid]:activeMembers();
      const all=eligible.every(uid=>room.ballots?.[uid]?.roundId===g.roundId);
      if(Date.now()<g.deadline&&!all)return;
      const stage=stageFor(g);let modifier=0;const votes={};
      for(const uid of eligible){
        const ballot=room.ballots?.[uid];const choice=ballot?.roundId===g.roundId?ballot.choice:null;
        votes[uid]=choice===null?-1:choice;
        const tag=stage.options[choice]?.tag;
        modifier+=tag==='STRONG'?2:tag==='DEFENSIBLE'?1:tag==='WEAK'?-1:0;
      }
      const dc=g.stageIndex===0?10:g.stageIndex===1?12:12;
      const die=1+rand(20),total=die+modifier+(g.rollBonus||0),success=total>=dc;
      await update(path(),{phase:'result',votes,die,total,modifier,dc,success,revealed:true,
        [`diceResults/${g.roundId}`]:{die,total,modifier,dc,success,at:Date.now()}});
    }
  }
  async function next(){
    if(!isHost())return;
    const g=getContext().room?.game;if(!g)return;
    if(g.phase==='result'){
      if(!g.success){
        const grip=Math.max(0,(g.grip?.value??10)-2);
        if(grip===0){await set(path(),{...startStage(0,6,Object.fromEntries(Object.keys(getContext().room.players||{}).map(uid=>[uid,false])),g.insightCards||{},g.usedCards||{},0,0),phase:'plugged',failureText:content.failure});return;}
        await set(path(),startStage(g.stageIndex,grip,g.abilities,g.insightCards,g.usedCards,(g.attempt||0)+1,g.bossWins||0));return;
      }
      await update(path(),{phase:'lore',bossWins:g.stageIndex>=2?(g.bossWins||0)+1:(g.bossWins||0)});return;
    }
    if(g.phase==='plugged'){await update(path(),{phase:'choice'});return;}
    if(g.phase!=='lore')return;
    if(g.stageIndex===4){
      await update(path(),{phase:'realm-complete',insightCards:{[content.insight.id]:true},completedAt:Date.now()});return;
    }
    await set(path(),startStage(g.stageIndex+1,g.grip?.value??10,g.abilities,g.insightCards,g.usedCards,0,g.bossWins||0));
  }
  function render(room){
    const g=room.game||{},stage=stageFor(g),panel=el('game-panel');
    panel.hidden=room.status!=='started'||g.phase==='lobby'||g.phase==='phase1-complete';
    if(panel.hidden)return;
    const uid=myUid(),host=isHost(),result=g.phase==='result',lore=g.phase==='lore',complete=g.phase==='realm-complete',plugged=g.phase==='plugged';
    const key=`${g.roundId}/${g.phase}/${g.deadline}`;
    el('game-heading').textContent=complete?'Realm I complete':content.realm;
    el('game-stage').textContent=complete?'Victory':stage?`${stage.kind==='boss'?'Boss: ':''}${stage.title}`:'Reset';
    el('game-grip').textContent=`Grip: ${g.grip?.value??10}/10`;
    el('game-conviction').textContent=`Boss Conviction: ${Math.max(0,3-(g.bossWins||0))}/3`;
    el('game-timer').textContent=g.phase==='choice'?`${Math.max(0,Math.ceil((g.deadline-Date.now())/1000))}s`:'—';
    el('game-scene').textContent=complete?content.victory:plugged?content.failure:stage?.scene||'';
    el('game-question').textContent=complete?'Insight unlocked: '+content.insight.title:stage?.question||'';
    const choices=el('game-choices');choices.replaceChildren();
    const eligible=g.stageIndex!==3||g.spotlightUid===uid;
    const myBallot=room.ballots?.[uid];const already=myBallot?.roundId===g.roundId;
    if(g.phase==='choice'&&stage){
      stage.options.forEach((option,i)=>{
        const button=document.createElement('button');button.className='choice';button.textContent=option.text;
        if(g.eliminated&&option.tag==='WEAK')button.classList.add('eliminated');
        if(already&&myBallot.choice===i)button.classList.add('selected');
        button.disabled=!eligible||already||Date.now()>g.deadline;
        button.addEventListener('click',()=>vote(i).catch(e=>notice('Your choice could not be saved: '+e.message,'error')));choices.append(button);
      });
    }
    el('game-instructions').textContent=complete?'Realm I is finished. Realm II will arrive in Phase 3.':plugged?'Host: continue to retry Realm I.':lore?'Read the teaching card, then host advances.':result?'Review the simultaneous choices and dice result. Host: continue.':g.stageIndex===3&&!eligible?`Spotlight: ${room.players?.[g.spotlightUid]?.name||'another player'} answers. Send one whisper.`:already?'Choice locked. Waiting for the party or timer.':'Choose the strongest philosophical response.';
    const reveal=el('game-reveal');reveal.replaceChildren();
    if(result||lore){Object.entries(g.votes||{}).forEach(([player,choice])=>{
      const div=document.createElement('div');div.className='reveal';div.textContent=`${room.players?.[player]?.name||'Player'}: ${stage?.options[choice]?.text||'No answer'} (${stage?.options[choice]?.tag||'No vote'})`;reveal.append(div);
    });}
    el('game-roll').textContent=result||lore?`d20: ${g.die} + choice modifier ${g.modifier} + ability ${g.rollBonus||0} = ${g.total} vs DC ${g.dc} — ${g.success?'PASS':'FAIL — Second Look'}`:'';
    el('game-lore').hidden=!lore;el('game-lore').textContent=lore?stage?.lore||'':'';
    const abilities=el('game-abilities');abilities.replaceChildren();
    if(g.phase==='choice'&&stage){
      if(g.hintVisible){const p=document.createElement('p');p.textContent=`Second Look hint: ${stage.hint}`;abilities.append(p);}
      if(g.clueVisible){const p=document.createElement('p');p.textContent=`Empiricist clue: ${stage.clue}`;abilities.append(p);}
      if(!g.abilities?.[uid]){
        const b=document.createElement('button');b.textContent=`Use ${room.players?.[uid]?.class||'class'} ability`;
        b.addEventListener('click',()=>ability().catch(e=>notice(e.message,'error')));abilities.append(b);
      }
      if(g.insightCards?.[content.insight.id]&&!g.usedCards?.[content.insight.id]){
        const b=document.createElement('button');b.textContent=`Use Insight: ${content.insight.title} (+3)`;b.addEventListener('click',()=>useCard().catch(e=>notice(e.message,'error')));abilities.append(b);
      }
    }
    if(result&&!g.success&&!g.rerollUsed&&room.players?.[uid]?.class==='pragmatist'&&!g.abilities?.[uid]){
      const b=document.createElement('button');b.textContent='Pragmatist: reroll failed check';b.addEventListener('click',()=>requestReroll().catch(e=>notice(e.message,'error')));abilities.append(b);
    }
    const whispers=el('game-whispers');whispers.replaceChildren();
    if(g.phase==='choice'&&g.stageIndex===3&&uid!==g.spotlightUid){
      for(const emoji of ['💡','🤔','🦋']){const b=document.createElement('button');b.textContent=`Whisper ${emoji}`;b.addEventListener('click',()=>whisper(emoji).catch(e=>notice(e.message,'error')));whispers.append(b);}
    }
    if(g.stageIndex===3){const p=document.createElement('p');p.textContent=Object.values(room.whispers||{}).filter(w=>w.roundId===g.roundId).map(w=>w.emoji).join(' ')||'';whispers.append(p);}
    el('game-next').hidden=!host||!['result','lore','plugged'].includes(g.phase);
    if(host&&g.phase==='choice'&&key!==lastAutoKey){lastAutoKey=key;hostSync().catch(console.warn);}
  }
  function tick(){
    const {room}=getContext();if(!room||room.status!=='started')return;
    const g=room.game;if(g?.phase==='choice'){
      el('game-timer').textContent=`${Math.max(0,Math.ceil((g.deadline-Date.now())/1000))}s`;
      if(isHost())hostSync().catch(console.warn);
    }else if(g?.phase==='result'&&isHost())hostSync().catch(console.warn);
  }
  el('game-next').addEventListener('click',()=>next().catch(e=>notice(e.message,'error')));
  timerHandle=setInterval(tick,1100);
  return {begin,render};
}