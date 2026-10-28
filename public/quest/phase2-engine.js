// Realm I — host-coordinated, Firebase Spark-friendly gameplay.
// All authoritative phase transitions, d20 values and timers are host writes at /game.
// Players may write only their own /ballots, /abilities, and /whispers requests.
// The host is not a trusted server; ballot contents are readable to all room members in Firebase.
export function makeEngine({ db, api, getContext, content, notice }) {
  const {ref, set, update} = api;
  const el = id => document.getElementById(id);
  const stages = [
    ...content.encounters.map((x, i) => ({...x, kind: 'encounter', index: i})),
    ...content.bossPhases.map((x, i) => ({...x, kind: 'boss', index: i}))
  ];
  const rand = n => Math.floor(Math.random() * n);
  const roll = () => 1 + rand(20);
  const path = (suffix = '') => ref(db, `rooms/${getContext().code}/game${suffix ? '/' + suffix : ''}`);
  const isHost = () => {const c = getContext(); return !!c.room && c.room.hostUid === c.uid;};
  const getMembers = () => Object.entries(getContext().room?.players || {}).filter(([,p]) => p.connected).map(([uid]) => uid);
  const stageFor = g => stages[g?.stageIndex] || null;
  const shuffle = arr => {
    const values = [...arr];
    for(let i=values.length-1; i>0; i--){const j=rand(i+1); [values[i],values[j]]=[values[j],values[i]];}
    return values;
  };
  function identityMask() {
    // Sattolo's algorithm creates a single cycle, with no identity left in its own slot.
    const members = Object.keys(getContext().room?.players || {}).sort();
    if(members.length < 2) return {};
    const permuted = [...members];
    for(let i=permuted.length-1; i>0; i--){const j=rand(i); [permuted[i],permuted[j]]=[permuted[j],permuted[i]];}
    return Object.fromEntries(members.map((uid,i) => [uid,permuted[i]]));
  }
  function newStage(index, grip, abilities, cards, usedCards, attempt=0, bossWins=0, oldMask=null) {
    const stage=stages[index];
    const startedAt=Date.now();
    const eligible=getMembers();
    const result={
      phase:'choice', schemaVersion:1, startedAt, realm:1, stageIndex:index, attempt,
      roundId:`${index}-${attempt}-${startedAt}-${rand(100000)}`, deadline:startedAt+45000,
      encounters:{activeId:stage.id}, votes:{}, diceResults:{}, grip:{value:grip},
      insightCards:cards || {}, usedCards:usedCards || {}, abilities:abilities || {}, bossWins,
      spotlightUid:index===3?(eligible[rand(eligible.length)] || getContext().uid):'',
      whispers:{}, rollBonus:0, rerollUsed:false, eliminated:false, hintVisible:attempt>0,
      optionOrder:shuffle(stage.options.map((_,i)=>i))
    };
    if(index===2) result.identityMask=oldMask || identityMask();
    return result;
  }
  function eligiblePlayers(g){return g.stageIndex===3?[g.spotlightUid]:getMembers();}
  function savedVote(room,g,uid){const b=room.ballots?.[uid]; return b?.roundId===g.roundId ? b.choice : -1;}
  function stageVotes(room,g){return Object.fromEntries(eligiblePlayers(g).map(uid=>[uid,savedVote(room,g,uid)]));}
  const consensus = votes => {
    const values=Object.values(votes).filter(v=>v>=0);
    return values.length>0 && new Set(values).size===1 && values.length===Object.values(votes).length;
  };
  const disagreement = votes => new Set(Object.values(votes).filter(x=>x>=0)).size>1;
  const band = grip => grip>=content.machine.gripBands.steady.min?'steady':grip>=content.machine.gripBands.strained.min?'strained':'critical';
  function machineText(g,stage){
    if(g.phase==='realm-complete')return content.machine.onVictory;
    if(g.phase==='plugged')return '';
    const level=band(g.grip?.value??10);
    if(g.phase==='lore')return content.machine.betweenStages[stage?.id]?.[level] || '';
    if(g.phase==='choice' && (g.attempt||0)>0)return content.machine.onSecondLook[level];
    if(g.phase==='choice' && g.stageIndex===2)return content.machine.beforeBoss;
    if(g.phase==='choice' && g.stageIndex===0)return content.machine.opening;
    return '';
  }
  async function begin() {
    if(!isHost())return;
    const room=getContext().room;
    if(Object.keys(room.players||{}).length<2)return notice('Two players are required.','error');
    const abilities=Object.fromEntries(Object.keys(room.players).map(uid=>[uid,false]));
    await set(path(),newStage(0,10,abilities,{},{}));
    await set(ref(db,`rooms/${getContext().code}/status`),'started');
  }
  async function vote(choice) {
    const {room,uid,code}=getContext(), g=room?.game,stage=stageFor(g);
    if(!g || !stage?.options[choice] || !eligiblePlayers(g).includes(uid))return;
    const current=room.ballots?.[uid];
    const initial=g.phase==='choice' && Date.now()<=g.deadline && current?.roundId!==g.roundId;
    const revision=g.phase==='debate' && Date.now()<=g.debateDeadline &&
      current?.roundId===g.roundId && current.revised!==true && current.choice!==choice;
    if(!initial && !revision)return;
    const ballot={roundId:g.roundId,choice,at:Date.now()};
    if(revision)ballot.revised=true;
    await set(ref(db,`rooms/${code}/ballots/${uid}`),ballot);
  }
  async function giveReason(reason) {
    const {room,uid,code}=getContext(),g=room?.game;
    if(g?.phase!=='debate'||Date.now()>g.debateDeadline||!content.debate.reasons.includes(reason))return;
    if(room.whispers?.[uid]?.roundId===g.roundId)return;
    await set(ref(db,`rooms/${code}/whispers/${uid}`),{roundId:g.roundId,reason});
  }
  async function whisper(emoji) {
    const {room,uid,code}=getContext(),g=room?.game;
    if(g?.phase!=='choice'||g.stageIndex!==3||uid===g.spotlightUid||Date.now()>g.deadline)return;
    if(room.whispers?.[uid]?.roundId===g.roundId)return;
    await set(ref(db,`rooms/${code}/whispers/${uid}`),{roundId:g.roundId,emoji});
  }
  async function ability() {
    const {room,uid,code}=getContext(),g=room?.game;
    if(g?.phase!=='choice'||g.abilities?.[uid]||Date.now()>g.deadline)return;
    const klass=room.players?.[uid]?.class;
    if(['skeptic','empiricist','rationalist'].includes(klass)){
      await set(ref(db,`rooms/${code}/abilities/${uid}`),{roundId:g.roundId,type:klass});
    } else if(klass==='pragmatist')notice('Pragmatist reroll becomes available after a failed roll.','info');
  }
  async function requestReroll() {
    const {room,uid,code}=getContext(),g=room?.game;
    if(g?.phase!=='result'||g.success||g.rerollUsed||g.abilities?.[uid]||room.players?.[uid]?.class!=='pragmatist')return;
    await set(ref(db,`rooms/${code}/abilities/${uid}`),{roundId:g.roundId,type:'pragmatist'});
  }
  async function useCard() {
    const {room,uid,code}=getContext(),g=room?.game;
    if(g?.phase!=='choice'||!g.insightCards?.[content.insight.id]||g.usedCards?.[content.insight.id])return;
    await set(ref(db,`rooms/${code}/abilities/${uid}`),{roundId:g.roundId,type:'insight'});
  }
  function prepareRoll(room,g){
    return {phase:'ready-to-roll', votes:stageVotes(room,g), dc:g.stageIndex===0?10:12};
  }
  function makeRoll(room,g){
    const stage=stageFor(g),votes=stageVotes(room,g);
    let modifier=0;
    for(const choice of Object.values(votes)){
      const tag=stage.options[choice]?.tag;
      modifier+=tag==='STRONG'?2:tag==='DEFENSIBLE'?1:tag==='WEAK'?-1:0;
    }
    const dc=g.dc || (g.stageIndex===0?10:12);
    const die=roll(),total=die+modifier+(g.rollBonus||0),success=total>=dc;
    return {phase:'rolling',votes,dc,die,total,modifier,success,
      rollRevealAt:Date.now()+(content.dicePresentation.tumbleMilliseconds||2000),
      [`diceResults/${g.roundId}`]:{die,total,modifier,dc,success,at:Date.now()}};
  }
  let syncing=false;
  async function hostSync() {
    if(!isHost()||syncing)return;
    syncing=true;
    try{await syncOnce();}finally{syncing=false;}
  }
  async function syncOnce() {
    const {room,code}=getContext(),g=room?.game;
    if(!g || !['choice','debate','rolling','result'].includes(g.phase))return;
    const pending=Object.entries(room.abilities||{}).filter(([uid,r])=>r.roundId===g.roundId && !g.abilities?.[uid]);
    if(pending.length){
      const [uid,request]=pending[0],klass=room.players?.[uid]?.class;
      if(request.type==='pragmatist'&&klass==='pragmatist'&&g.phase==='result'&&!g.success&&!g.rerollUsed){
        const die=roll(),total=die+g.modifier+(g.rollBonus||0),success=total>=g.dc;
        await update(path(),{phase:'rolling',rerollUsed:true,die,total,success,
          rollRevealAt:Date.now()+(content.dicePresentation.tumbleMilliseconds||2000),
          [`abilities/${uid}`]:true,[`diceResults/${g.roundId}-reroll`]:{die,total,dc:g.dc,success,at:Date.now()}});
      }else if(g.phase==='choice' && Date.now()<g.deadline && (request.type===klass || request.type==='insight')){
        const changes={[`abilities/${uid}`]:true};
        if(klass==='skeptic')changes.eliminated=true;
        if(klass==='empiricist')changes.clueVisible=true;
        if(klass==='rationalist')changes.rollBonus=(g.rollBonus||0)+3;
        if(request.type==='insight'&&g.insightCards?.[content.insight.id]&&!g.usedCards?.[content.insight.id]){
          changes.rollBonus=(g.rollBonus||0)+3;changes[`usedCards/${content.insight.id}`]=true;
        }
        await update(path(),changes);
      }
      await set(ref(db,`rooms/${code}/abilities/${uid}`),null);
      return;
    }
    if(g.phase==='choice'){
      const eligible=eligiblePlayers(g);
      const all=eligible.every(uid=>room.ballots?.[uid]?.roundId===g.roundId);
      if(Date.now()<g.deadline && !all)return;
      const votes=stageVotes(room,g);
      if(disagreement(votes)){
        await update(path(),{phase:'debate',votes,debateStartedAt:Date.now(),
          debateDeadline:Date.now()+(content.debate.durationSeconds||30)*1000});
      } else {
        await update(path(),prepareRoll(room,g));
      }
      return;
    }
    if(g.phase==='debate' && Date.now()>=g.debateDeadline){
      await update(path(),prepareRoll(room,g));
      return;
    }
    if(g.phase==='rolling' && Date.now()>=g.rollRevealAt){
      await update(path(),{phase:'result'});
    }
  }
  async function next() {
    if(!isHost())return;
    const g=getContext().room?.game;if(!g)return;
    if(g.phase==='ready-to-roll'){
      await update(path(),makeRoll(getContext().room,g));
      return;
    }
    if(g.phase==='result'){
      if(!g.success){
        const grip=Math.max(0,(g.grip?.value??10)-2);
        if(grip===0){
          const abilities=Object.fromEntries(Object.keys(getContext().room.players||{}).map(uid=>[uid,false]));
          await set(path(),{...newStage(0,6,abilities,g.insightCards||{},g.usedCards||{}),phase:'plugged',failureText:content.failure});
          return;
        }
        await set(path(),newStage(g.stageIndex,grip,g.abilities,g.insightCards,g.usedCards,(g.attempt||0)+1,g.bossWins||0,g.identityMask));
        return;
      }
      const cards=g.stageIndex===0?{...(g.insightCards||{}),[content.insight.id]:true}:g.insightCards||{};
      await update(path(),{phase:'lore',insightCards:cards,bossWins:g.stageIndex>=2?(g.bossWins||0)+1:(g.bossWins||0)});
      return;
    }
    if(g.phase==='plugged'){await update(path(),{phase:'choice'});return;}
    if(g.phase!=='lore')return;
    if(g.stageIndex===4){
      await update(path(),{phase:'realm-complete',insightCards:{...(g.insightCards||{}),[content.insight.id]:true},completedAt:Date.now()});return;
    }
    await set(path(),newStage(g.stageIndex+1,g.grip?.value??10,g.abilities,g.insightCards,g.usedCards,0,g.bossWins||0));
  }
  function addText(target,tag,cls,text){
    const node=document.createElement(tag);if(cls)node.className=cls;node.textContent=text;target.append(node);return node;
  }
  function displayName(room,g,uid){
    const mask=g.stageIndex===2 && !(g.phase==='lore'||g.phase==='realm-complete'||(g.phase==='result'&&g.success)) && g.identityMask;
    const showUid=mask?.[uid] || uid;
    return room.players?.[showUid]?.name || 'Player';
  }
  function render(room) {
    const g=room.game||{},stage=stageFor(g),panel=el('game-panel');
    panel.hidden=room.status!=='started'||g.phase==='lobby'||g.phase==='phase1-complete';
    if(panel.hidden)return;
    const {uid}=getContext(),host=isHost(),result=g.phase==='result',lore=g.phase==='lore',
      complete=g.phase==='realm-complete',plugged=g.phase==='plugged',debating=g.phase==='debate',rolling=g.phase==='rolling',ready=g.phase==='ready-to-roll';
    const eligible=eligiblePlayers(g).includes(uid);
    const myBallot=room.ballots?.[uid];const already=myBallot?.roundId===g.roundId;
    panel.dataset.phase=g.phase;
    el('game-heading').textContent=complete?'Realm I complete':content.realm;
    el('game-stage').textContent=complete?'Victory':stage?`${stage.kind==='boss'?'Boss: ':''}${stage.title}`:'Reset';
    el('game-grip').textContent=`Grip: ${g.grip?.value??10}/10`;
    el('game-conviction').textContent=`Boss Conviction: ${Math.max(0,3-(g.bossWins||0))}/3`;
    el('game-timer').textContent=g.phase==='choice'?`${Math.max(0,Math.ceil((g.deadline-Date.now())/1000))}s`:
      debating?`Debate ${Math.max(0,Math.ceil((g.debateDeadline-Date.now())/1000))}s`:'—';
    el('game-scene').textContent=complete?content.victory:plugged?content.failure:stage?.scene||'';
    el('game-question').textContent=complete?'Insight unlocked: '+content.insight.title:stage?.question||'';
    el('game-identity-taunt').hidden=!(g.stageIndex===2 && !lore && !(result&&g.success));
    el('game-identity-taunt').textContent=content.identityTwist.taunt;
    el('game-machine').textContent=machineText(g,stage);
    el('game-machine').hidden=!machineText(g,stage);
    const choices=el('game-choices');choices.replaceChildren();
    if((g.phase==='choice'||debating)&&stage){
      const order=Array.isArray(g.optionOrder)?g.optionOrder:stage.options.map((_,i)=>i);
      for(const i of order){
        const option=stage.options[i];if(!option)continue;
        const button=document.createElement('button');button.className='choice';button.textContent=option.text;
        if(g.eliminated&&option.tag==='WEAK')button.classList.add('eliminated');
        if(already && myBallot.choice===i)button.classList.add('selected');
        const canInitial=g.phase==='choice'&&!already&&Date.now()<=g.deadline;
        const canRevise=debating&&already&&!myBallot.revised&&myBallot.choice!==i&&Date.now()<=g.debateDeadline;
        button.disabled=!eligible||!(canInitial||canRevise);
        button.addEventListener('click',()=>vote(i).catch(e=>notice('Choice was not saved: '+e.message,'error')));
        choices.append(button);
      }
    }
    el('game-instructions').textContent=complete?'Realm I is finished.':plugged?'Host: continue to retry Realm I.':
      lore?'Review each stance and the consequence. The host advances.':
      result?`The check ${g.success?'passed':'failed'}. The host advances after any reroll.`:
      rolling?`Difficulty Class ${g.dc}. The d20 is tumbling…`:
      ready?`DC ${g.dc} is set. The host may now roll the d20.`:
      debating?content.debate.prompt:
      g.stageIndex===3&&!eligible?`Spotlight: ${displayName(room,g,g.spotlightUid)} answers. Send one whisper.`:
      already?'Your action is locked until the party reveal.':'Choose what your adventurer does.';
    // Publicly reveal initial choices on debate, final choices during the roll and afterward.
    const reveal=el('game-reveal');reveal.replaceChildren();
    if(debating||ready||rolling||result||lore){
      const votes=debating?stageVotes(room,g):(g.votes||{});
      const agrees=consensus(votes);
      addText(reveal,'p','consensus',agrees?'Consensus reached':'Party responses revealed');
      for(const [player,choice] of Object.entries(votes)){
        const option=stage?.options[choice];const label=displayName(room,g,player);
        const div=addText(reveal,'div','reveal',`${label}: ${option?.text||'No answer submitted'}`);
        if((result||lore)&&option)addText(div,'span','stance-tag '+option.tag.toLowerCase(),option.tag);
      }
    }
    const debate=el('game-debate');debate.replaceChildren();debate.hidden=!debating;
    if(debating){
      const reasons=Object.entries(room.whispers||{}).filter(([,v])=>v.roundId===g.roundId && v.reason);
      for(const [player,v] of reasons)addText(debate,'p','debate-reason',`${displayName(room,g,player)}: ${v.reason}`);
      if(room.whispers?.[uid]?.roundId!==g.roundId){
        const row=addText(debate,'div','reason-buttons','');
        for(const reason of content.debate.reasons){
          const b=addText(row,'button','reason-button',reason);b.disabled=Date.now()>g.debateDeadline;
          b.addEventListener('click',()=>giveReason(reason).catch(e=>notice('Reason was not saved: '+e.message,'error')));
        }
      }
      addText(debate,'p','debate-note',already && myBallot.revised?'You have used your one vote revision.':
        already?'You may change your vote once using the action cards above.':'You did not submit an initial vote.');
    }
    const dice=el('game-die');dice.replaceChildren();dice.className='die-stage';
    const rollDisplay=el('game-roll');rollDisplay.textContent='';
    if(ready||rolling||result||lore){
      addText(dice,'div','dc-display',`DC ${g.dc}`);
      if(rolling && Date.now()<g.rollRevealAt){
        dice.classList.add('tumbling');addText(dice,'div','die-shape','d20');
        addText(dice,'p','roll-caption','Rolling…');
      }else{
        dice.classList.add(g.success?'passed':'failed');
        addText(dice,'div','roll-outcome',g.success?'PASS':'FAIL');
        rollDisplay.textContent=`d20 ${g.die} + actions ${g.modifier} + ability ${g.rollBonus||0} = ${g.total}`;
      }
    }
    const lorePanel=el('game-lore');lorePanel.replaceChildren();lorePanel.hidden=!lore;
    if(lore){
      addText(lorePanel,'h3','', 'What your actions revealed');
      const chosen=new Set(Object.values(g.votes||{}).filter(v=>v>=0));
      for(const i of chosen){
        const option=stage?.options[i];if(!option)continue;
        const card=addText(lorePanel,'div','lore-stance','');
        addText(card,'div','stance-head',`${option.tag} · ${option.stance}`);
        addText(card,'p','',option.reflection);
      }
      addText(lorePanel,'p','lore-summary',stage?.lore||'');
      if(g.stageIndex===0)addText(lorePanel,'p','insight-awarded',`Insight earned: ${content.insight.title} — ${content.insight.description}`);
    }
    const abilities=el('game-abilities');abilities.replaceChildren();
    if(g.phase==='choice' && stage){
      if(g.hintVisible)addText(abilities,'p','encounter-hint',`Second Look hint: ${stage.hint}`);
      if(g.clueVisible)addText(abilities,'p','encounter-hint',`Empiricist clue: ${stage.clue}`);
      if(!g.abilities?.[uid]){
        const b=addText(abilities,'button','quiet','Use class ability');
        b.addEventListener('click',()=>ability().catch(e=>notice(e.message,'error')));
      }
      if(g.insightCards?.[content.insight.id]&&!g.usedCards?.[content.insight.id]){
        const b=addText(abilities,'button','quiet',`Use Insight: ${content.insight.title} (+3)`);
        b.addEventListener('click',()=>useCard().catch(e=>notice(e.message,'error')));
      }
    }
    if(result&&!g.success&&!g.rerollUsed&&room.players?.[uid]?.class==='pragmatist'&&!g.abilities?.[uid]){
      const b=addText(abilities,'button','quiet','Pragmatist: reroll failed check');
      b.addEventListener('click',()=>requestReroll().catch(e=>notice(e.message,'error')));
    }
    const whispers=el('game-whispers');whispers.replaceChildren();
    if(g.phase==='choice'&&g.stageIndex===3&&uid!==g.spotlightUid){
      const alreadyWhispered=room.whispers?.[uid]?.roundId===g.roundId;
      for(const emoji of ['💡','🤔','🦋']){
        const b=addText(whispers,'button','whisper-button',`Whisper ${emoji}`);
        b.disabled=alreadyWhispered;
        b.addEventListener('click',()=>whisper(emoji).catch(e=>notice(e.message,'error')));
      }
    }
    if(g.stageIndex===3){
      const messages=Object.values(room.whispers||{}).filter(w=>w.roundId===g.roundId&&w.emoji).map(w=>w.emoji).join(' ');
      if(messages)addText(whispers,'p','whisper-display',messages);
    }
    el('game-next').hidden=!host||!['ready-to-roll','result','lore','plugged'].includes(g.phase);
    el('game-next').textContent=ready?'Roll d20 (host)':result?(g.success?'Reveal lore (host)':'Second Look (host)'):
      plugged?'Restart Realm I (host)':lore?'Continue (host)':'Continue (host)';
  }
  let lastUiTickPhase='';
  function tick(){
    const {room}=getContext();if(!room||room.status!=='started')return;
    const g=room.game||{};
    if(g.phase==='choice'){
      el('game-timer').textContent=`${Math.max(0,Math.ceil((g.deadline-Date.now())/1000))}s`;
    }else if(g.phase==='debate'){
      el('game-timer').textContent=`Debate ${Math.max(0,Math.ceil((g.debateDeadline-Date.now())/1000))}s`;
    }
    if(g.phase==='rolling'&&Date.now()>=g.rollRevealAt){
      if(lastUiTickPhase!==g.roundId+'-'+g.rollRevealAt){
        lastUiTickPhase=g.roundId+'-'+g.rollRevealAt;
        render(room);
      }
    }
    if(isHost()&&['choice','debate','rolling','result'].includes(g.phase))hostSync().catch(e=>console.warn('Host sync error',e));
  }
  el('game-next').addEventListener('click',()=>next().catch(e=>notice(e.message,'error')));
  setInterval(tick,350);
  return {begin,render};
}
