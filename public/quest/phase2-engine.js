// Short Quest (Realms I → II → VI → Epilogue) — host-coordinated Firebase gameplay.
// All authoritative phase transitions, d20 values and timers are host writes at /game.
// Players may write only their own /ballots, /abilities, and /whispers requests.
// The host is not a trusted server; ballot contents are readable to all room members in Firebase.
// Exported and used by the live engine and Node-only Monte Carlo tests.
export function resolveCheck({tags, dc, attempt=0, die=1+Math.floor(Math.random()*20), rollBonus=0, weaknessBonus=0}) {
  const score={STRONG:7,DEFENSIBLE:3,WEAK:-2};
  const modifier=tags.length?Math.floor(tags.reduce((sum,t)=>sum+score[t],0)/tags.length):0;
  const learningBonus=3*attempt;
  const total=die+modifier+learningBonus+rollBonus+weaknessBonus;
  // A unanimously weak argument cannot succeed on luck alone except a natural 20.
  // The arithmetic modifier remains the party average, regardless of party size.
  const reasoningGate=tags.length>0&&(tags.some(tag=>tag==='STRONG'||tag==='DEFENSIBLE')||die===20);
  return {die,modifier,learningBonus,weaknessBonus,total,dc,success:total>=dc&&reasoningGate};
}
export function effectiveTag(stage,option,game) {
  const c=stage?.conditional;
  if(!c||!game?.discoveredStages?.['s'+game.stageIndex]) return option.tag;
  if(option.id===c.strongOptionId)return 'STRONG';
  if(option.id===c.previousStrongOptionId)return 'DEFENSIBLE';
  return option.tag;
}
export function makeEngine({ db, api, getContext, content, realm2Content, realm6Content, epilogueContent, notice }) {
  const {ref, set, update} = api;
  const el = id => document.getElementById(id);
  const realms = [content, realm2Content, realm6Content].filter(Boolean);
  const realmNumbers = [1,2,6];
  const stages = realms.flatMap((chapter, chapterIndex) => [
    ...chapter.encounters.map((x, i) => ({...x, kind:'encounter', localIndex:i, realm:realmNumbers[chapterIndex]})),
    ...chapter.bossPhases.map((x, i) => ({...x, kind:'boss', localIndex:i, realm:realmNumbers[chapterIndex]}))
  ]).map((stage,index) => ({...stage,index}));
  const chapterFor = g => realms[realmNumbers.indexOf(stageFor(g)?.realm || g?.realm || 1)] || content;
  const chapterStart = realm => stages.findIndex(s => s.realm===realm);
  const nextRealm = realm => realmNumbers[realmNumbers.indexOf(realm)+1] || null;
  const chapterEnd = realm => stages.reduce((last, s, i) => s.realm===realm ? i : last, -1);
  const isSpotlight = stage => stage?.kind==='boss' && stage.localIndex===1;
  const hasIdentityTwist = stage => stage?.realm===1 && stage.kind==='boss' && stage.localIndex===0;
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
  // Preserve Spotlight turns under the existing host-writable /game/encounters path.
  // A fresh pool is opened only after every connected member has had a turn.
  function pickSpotlight(members, previous={}) {
    const priorSeen = previous.spotlightSeen || {};
    const last = previous.spotlightLast || '';
    let available = members.filter(uid => !priorSeen[uid]);
    const seen = available.length ? {...priorSeen} : {};
    if(!available.length) available = [...members];
    if(available.length>1 && available.includes(last)) available = available.filter(uid=>uid!==last);
    const chosen = available[rand(available.length)] || getContext().uid;
    seen[chosen] = true;
    return {uid:chosen, seen, last:chosen};
  }
  function newStage(index, grip, abilities, cards, usedCards, attempt=0, bossWins=0, oldMask=null, previousEncounters={}, history={}, carried={}) {
    const stage=stages[index];
    const startedAt=Date.now();
    const eligible=getMembers();
    const spotlight = isSpotlight(stage) ? pickSpotlight(eligible, previousEncounters) : null;
    const encounters = {activeId:stage.id};
    if(spotlight){
      encounters.spotlightSeen=spotlight.seen;
      encounters.spotlightLast=spotlight.last;
    }else{
      if(previousEncounters.spotlightSeen) encounters.spotlightSeen=previousEncounters.spotlightSeen;
      if(previousEncounters.spotlightLast) encounters.spotlightLast=previousEncounters.spotlightLast;
    }
    const duration=Math.min(30,Math.max(15,Math.ceil((stage.scene.length+stage.options.map(o=>o.text).join('').length)/55)));
    const weakness=stage.kind==='boss'?(()=>{const represented=[...new Set(eligible.map(uid=>getContext().room?.players?.[uid]?.class).filter(Boolean))];const previous=carried?.stageIndex===index?carried.bossWeakness:null;const available=represented.filter(k=>eligible.some(uid=>getContext().room?.players?.[uid]?.class===k && !carried?.classUses?.[uid]?.['r'+stage.realm]?.boss));const pool=available.length?available:represented;return represented.includes(previous)?previous:pool.includes(stage.weakness)?stage.weakness:pool[index%pool.length]||stage.weakness;})():'';
    const result={
      readingReady:{},readingDeadline:startedAt+duration*1000,readingSeconds:duration,bossWeakness:weakness,
      phase:'reading', schemaVersion:1, startedAt, realm:stage.realm, stageIndex:index, attempt,
      roundId:`${index}-${attempt}-${startedAt}-${rand(100000)}`,
      deadline:startedAt+duration*1000+((isSpotlight(stage)?45:30)*1000),
      encounters, votes:{}, diceResults:{}, grip:{value:grip}, history,
      insightCards:cards || {}, usedCards:usedCards || {}, abilities:abilities || {}, bossWins,
      classUses:carried.classUses||{}, insightUses:carried.insightUses||{},rerollUses:carried.rerollUses||{},
      abilityEvents:carried.abilityEvents||{},abilityFeedback:carried.abilityFeedback||{},
      abilityReveals:carried.abilityReveals||{},discoveredStages:carried.discoveredStages||{},
      weaknessStages:carried.weaknessStages||{},
      spotlightUid:spotlight?.uid || '',
      whispers:{}, rollBonus:0, rerollUsed:false, eliminated:false, hintVisible:attempt>0,
      optionOrder:shuffle(stage.options.map((_,i)=>i))
    };
    if(hasIdentityTwist(stage)) result.identityMask=oldMask || identityMask();
    return result;
  }
  function eligiblePlayers(g){return isSpotlight(stageFor(g))?[g.spotlightUid]:getMembers();}
  function savedVote(room,g,uid){const b=room.ballots?.[uid]; return b?.roundId===g.roundId ? b.choice : -1;}
  function stageVotes(room,g){return Object.fromEntries(eligiblePlayers(g).map(uid=>[uid,savedVote(room,g,uid)]));}
  const consensus = votes => {
    const values=Object.values(votes).filter(v=>v>=0);
    return values.length>0 && new Set(values).size===1 && values.length===Object.values(votes).length;
  };
  const disagreement = votes => new Set(Object.values(votes).filter(x=>x>=0)).size>1;
  function machineText(g,stage){
    const chapter=chapterFor(g);
    if(g.phase==='realm-complete')return chapter.machine.onVictory;
    if(g.phase==='plugged')return '';
    const grip=g.grip?.value??10;
    const level=grip>=chapter.machine.gripBands.steady.min?'steady':grip>=chapter.machine.gripBands.strained.min?'strained':'critical';
    if(g.phase==='lore')return chapter.machine.betweenStages[stage?.id]?.[level] || '';
    if(['reading','choice'].includes(g.phase) && (g.attempt||0)>0)return chapter.machine.onSecondLook[level];
    if(['reading','choice'].includes(g.phase) && stage?.kind==='boss' && stage.localIndex===0)return chapter.machine.beforeBoss;
    if(['reading','choice'].includes(g.phase) && stage?.localIndex===0)return chapter.machine.opening;
    return '';
  }
  async function begin() {
    if(!isHost())return;
    const room=getContext().room;
    if(room.status!=='lobby'||room.campaign!=='short')return notice('Only a new Short Quest room can start.','error');
    if(Object.values(room.players||{}).filter(p=>p.connected).length<2)return notice('Two connected players are required.','error');
    const abilities=Object.fromEntries(Object.keys(room.players).map(uid=>[uid,false]));
    await set(path(),newStage(0,10,abilities,{},{}));
    await set(ref(db,`rooms/${getContext().code}/status`),'started');
  }
  const pendingVotes=new Map();
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
    pendingVotes.set(uid,{roundId:g.roundId,choice});
    try{await set(ref(db,`rooms/${code}/ballots/${uid}`),ballot);}
    catch(error){pendingVotes.delete(uid);throw error;}
  }
  async function readyToChoose(){
    const {room,uid}=getContext(),g=room?.game;
    if(!['reading','epilogue-reading'].includes(g?.phase)||!room.players?.[uid]?.connected)return false;
    await set(path(`readingReady/${uid}`),true);return true;
  }
  async function giveReason(reason) {
    const {room,uid,code}=getContext(),g=room?.game;
    if(g?.phase!=='debate'||Date.now()>g.debateDeadline||!chapterFor(g).debate.reasons.includes(reason))return;
    if(room.whispers?.[uid]?.roundId===g.roundId)return;
    await set(ref(db,`rooms/${code}/whispers/${uid}`),{roundId:g.roundId,reason});
  }
  async function whisper(emoji) {
    const {room,uid,code}=getContext(),g=room?.game;
    if(g?.phase!=='choice'||!isSpotlight(stageFor(g))||uid===g.spotlightUid||Date.now()>g.deadline)return;
    if(room.whispers?.[uid]?.roundId===g.roundId)return;
    await set(ref(db,`rooms/${code}/whispers/${uid}`),{roundId:g.roundId,emoji});
  }
  const classNames={skeptic:'Interrogate',empiricist:'Observe',rationalist:'Deduce',pragmatist:'Test'};
  // Before the lore reveal, show only the player's action, never an internal id, tag or philosophical stance.
  const shortAction = (value, limit=84) => {
    const text=String(value || '').trim();
    if(text.length<=limit)return text;
    const cut=text.slice(0,limit-1).lastIndexOf(' ');
    return text.slice(0,cut>35?cut:limit-1).trimEnd()+'…';
  };
  function reject(reason){notice(reason,'error');return false;}
  async function submitAbility(type,optionId='',cardId='',intent='method') {
    const {room,uid,code}=getContext(),g=room?.game,stage=stageFor(g);
    if(!g||!stage)return reject('No active philosophical challenge.');
    const allowed=['reading','choice','debate'].includes(g.phase);
    const reroll=intent==='reroll'&&g.phase==='result'&&!g.success;
    if(!allowed&&!reroll)return reject('Abilities can be used during reading, choice or debate; Test rerolls follow a failed result.');
    if(allowed&&Date.now()>(g.phase==='reading'?g.readingDeadline:g.phase==='choice'?g.deadline:g.debateDeadline))return reject('The answer timer has ended.');
    if(!room.players?.[uid]?.connected)return reject('Reconnect before using an ability.');
    if(room.abilities?.[uid]?.roundId===g.roundId)return reject('Your previous request is still pending.');
    const klass=room.players?.[uid]?.class;
    if(intent==='reroll'){
      if(klass!=='pragmatist'||g.rerollUsed||g.rerollUses?.[uid]?.['r'+g.realm])return reject('Your Test reroll is unavailable or already used in this realm.');
    }else if(type==='insight'){
      if(g.insightUses?.[uid])return reject('Your one campaign Insight use is already spent.');
      if(!cardId||!g.insightCards?.[cardId]||g.usedCards?.[cardId])return reject('This Insight card is not available.');
    }else{
      if(type!==klass)return reject('That is not your class method.');
      if(g.classUses?.[uid]?.['r'+g.realm]?.[stage.kind])return reject('Your class method has already been used in this realm section.');
      if((klass==='skeptic'||klass==='pragmatist')&&!stage.options.some(opt=>opt.id===optionId))return reject('Select one option to investigate.');
    }
    const request={roundId:g.roundId,type,requestId:`${uid.slice(0,8)}-${Date.now()}-${rand(100000)}`};
    if(optionId)request.optionId=optionId;
    if(cardId)request.cardId=cardId;
    if(intent==='reroll')request.intent='reroll';
    try { await set(ref(db,`rooms/${code}/abilities/${uid}`),request); }
    catch (error) { return reject('Ability request denied: the choice window may have closed, or another request is still pending. '+error.message); }
    notice('Request sent; the party will see the result when the host processes it.','info');
    return true;
  }
  async function ability(optionId=''){
    const klass=getContext().room?.players?.[getContext().uid]?.class;
    return submitAbility(klass,optionId);
  }
  async function requestReroll(){return submitAbility('pragmatist','','','reroll');}
  async function useCard(){
    const g=getContext().room?.game;
    const cardId=Object.keys(g?.insightCards||{}).find(id=>g.insightCards[id]&&!g.usedCards?.[id]);
    return submitAbility('insight','',cardId);
  }
  const isEpilogue = g => ['epilogue-reading','epilogue-vote','epilogue-tie','epilogue-finished'].includes(g?.phase);
  function epilogueBallots(room,g) {
    // Count all valid ballots already cast, even if a voter disconnected afterward.
    return Object.fromEntries(Object.entries(room.ballots||{})
      .filter(([uid,ballot]) => room.players?.[uid] && ballot.roundId === g.roundId)
      .map(([uid,ballot]) => [uid,ballot.choice]));
  }
  async function epilogueVote(choice) {
    const {room,uid,code}=getContext(),g=room?.game;
    if(g?.phase!=='epilogue-vote'||!room.players?.[uid]?.connected||
       Date.now()>g.epilogue?.deadline||![0,1].includes(choice)||
       room.ballots?.[uid]?.roundId===g.roundId)return;
    await set(ref(db,`rooms/${code}/ballots/${uid}`),{
      roundId:g.roundId,choice,at:Date.now()
    });
  }
  function stageHistory(room,g){
    const stage=stageFor(g);
    if(!stage)return null;
    const choices={};
    for(const [uid,choice] of Object.entries(g.votes||{})){
      const option=stage.options?.[choice];
      if(!option)continue;
      choices[uid]={choice,stance:option.stance||option.text,tag:effectiveTag(stage,option,g)};
    }
    return {realm:stage.realm,stageId:stage.id,title:stage.title,choices};
  }
  async function beginEpilogue(g){
    if(!epilogueContent)return notice('The Epilogue content file is missing.','error');
    const startedAt=Date.now();
    const readSeconds=Math.min(30,Math.max(15,Math.ceil((epilogueContent.opening.length+epilogueContent.options.map(o=>o.text).join('').length)/55)));
    await update(path(),{
      phase:'epilogue-reading',readingReady:{},readingDeadline:startedAt+readSeconds*1000,readingSeconds:readSeconds,roundId:`exit-${startedAt}-${rand(100000)}`,
      epilogue:{startedAt,deadline:startedAt+(epilogueContent.selectionSeconds||75)*1000,
        votes:{},tally:{unplug:0,stay:0},ending:'',decisionMode:''}
    });
  }
  async function resolveTie(choice){
    const {room}=getContext(),g=room?.game;
    if(!isHost()||g?.phase!=='epilogue-tie'||!['unplug','stay'].includes(choice))return;
    await update(path(),{phase:'epilogue-finished',
      'epilogue/ending':choice,'epilogue/decisionMode':'host-tiebreak',
      'epilogue/decidedAt':Date.now()});
  }
  function prepareRoll(room,g){
    const stage=stageFor(g);
    return {phase:'ready-to-roll', votes:stageVotes(room,g), dc:stage.kind==='boss'?16:(stage.dc||10)};
  }
  function makeRoll(room,g){
    const stage=stageFor(g),votes=stageVotes(room,g);
    const tags=Object.values(votes).map(choice=>stage.options[choice]&&effectiveTag(stage,stage.options[choice],g)).filter(Boolean);
    const dc=g.dc||(stage.kind==='boss'?16:(stage.dc||10));
    const weaknessBonus=stage.kind==='boss'&&g.weaknessStages?.['s'+g.stageIndex]?5:0;
    const result=resolveCheck({tags,dc,attempt:g.attempt||0,rollBonus:g.rollBonus||0,weaknessBonus});
    return {phase:'rolling',votes,...result,
      rollRevealAt:Date.now()+(chapterFor(g).dicePresentation.tumbleMilliseconds||2000),
      [`diceResults/${g.roundId}`]:{...result,at:Date.now()}};
  }
  async function processAbility(room,g,uid,request){
    const stage=stageFor(g),klass=room.players?.[uid]?.class;
    const realmKey='r'+g.realm,phase=g.phase;
    const eventId=`e${Date.now()}_${rand(100000)}`;
    const methodNames={skeptic:'Interrogate',empiricist:'Observe',rationalist:'Deduce',pragmatist:'Test',insight:'Insight'};
    let message='',detail='',accepted=false;
    const changes={};
    const initialOrDebate=['reading','choice','debate'].includes(phase);
    const timely=initialOrDebate&&Date.now()<=(phase==='reading'?g.readingDeadline:phase==='choice'?g.deadline:g.debateDeadline);
    if(g.abilityFeedback?.[uid]?.requestId===request.requestId){return;}
    if(!room.players?.[uid]?.connected)message='Ability rejected: your player is disconnected.';
    else if(request.intent==='reroll'){
      if(klass!=='pragmatist'||phase!=='result'||g.success||g.rerollUsed||g.rerollUses?.[uid]?.[realmKey])
        message='Test reroll rejected: no failed check or reroll already spent this realm.';
      else{
        const votes=g.votes||{},tags=Object.values(votes).map(i=>stage.options[i]&&effectiveTag(stage,stage.options[i],g)).filter(Boolean);
        const weaknessBonus=stage.kind==='boss'&&g.weaknessStages?.['s'+g.stageIndex]?5:0;
        const result=resolveCheck({tags,dc:g.dc,attempt:g.attempt||0,rollBonus:g.rollBonus||0,weaknessBonus});
        Object.assign(changes,{phase:'rolling',rerollUsed:true,...result,
          rollRevealAt:Date.now()+(chapterFor(g).dicePresentation.tumbleMilliseconds||2000),
          [`rerollUses/${uid}/${realmKey}`]:true,
          [`diceResults/${g.roundId}-reroll`]:{...result,at:Date.now()}});
        message=`${realName(room,uid)} used Test reroll.`;
        detail='Your one reroll for this realm has been used.';accepted=true;
      }
    }else if(!timely)message='Ability rejected: this challenge is no longer accepting methods.';
    else if(request.type==='insight'){
      if(g.insightUses?.[uid])message='Insight rejected: you have already used Insight this campaign.';
      else if(!request.cardId||!g.insightCards?.[request.cardId]||g.usedCards?.[request.cardId])message='Insight rejected: the card is unavailable or already used.';
      else{
        changes[`insightUses/${uid}`]=true;changes[`usedCards/${request.cardId}`]=true;
        changes.rollBonus=(g.rollBonus||0)+3;
        message=`${realName(room,uid)} used Insight.`;detail='Insight granted +3 to the next roll.';accepted=true;
      }
    }else if(request.type!==klass)message='Ability rejected: request does not match your class.';
    else if(g.classUses?.[uid]?.[realmKey]?.[stage.kind])message='Ability rejected: this class method was already used in this realm section.';
    else{
      const opt=stage.options.find(o=>o.id===request.optionId);
      if(klass==='skeptic'&&!opt)message='Interrogate rejected: choose an available option.';
      else if(klass==='pragmatist'&&!opt)message='Test rejected: choose an available option.';
      else{
        if(klass==='skeptic')detail=`Hidden premise behind “${shortAction(opt.text)}”: ${opt.hiddenPremise}`;
        else if(klass==='empiricist')detail=`Observation: ${stage.observation}`;
        else if(klass==='rationalist')detail=`Argument: ${stage.argumentForm.premises.map((p,i)=>'P'+(i+1)+': '+p).join(' ')} Conclusion: ${stage.argumentForm.conclusion}`;
        else if(klass==='pragmatist')detail=`If the party tries “${shortAction(opt.text)}”: ${opt.consequence}`;
        changes[`classUses/${uid}/${realmKey}/${stage.kind}`]=true;
        changes[`abilityReveals/${uid}`]={stageIndex:g.stageIndex,realm:g.realm,type:klass,
          detail,optionId:request.optionId||'',at:Date.now()};
        if(stage.conditional?.triggerClass===klass){
          changes[`discoveredStages/s${g.stageIndex}`]=true;
          const favored=stage.options.find(o=>o.id===stage.conditional.strongOptionId);
          if(favored)detail+=` New evidence now favors this action: “${favored.text}”. ${stage.evidenceExplanation||''}`;
          changes[`abilityReveals/${uid}`].detail=detail;
        }
        if(stage.kind==='boss'&&g.bossWeakness===klass){
          changes[`weaknessStages/s${g.stageIndex}`]=true;
          detail+=` Boss weakness triggered: +5 to the party check.`;
          changes[`abilityReveals/${uid}`].detail=detail;
        }
        message=`${realName(room,uid)} used ${methodNames[klass]}.`;accepted=true;
      }
    }
    changes[`abilityFeedback/${uid}`]={requestId:request.requestId||'',roundId:g.roundId,
      accepted,message:accepted?detail:message,at:Date.now()};
    changes[`abilityEvents/${eventId}`]={uid,roundId:g.roundId,realm:g.realm,
      message:accepted?message:`${realName(room,uid)}: ${message}`,accepted,at:Date.now()};
    await update(path(),changes);
  }
  let syncing=false;
  async function hostSync() {
    if(!isHost()||syncing)return;
    syncing=true;
    try{await syncOnce();}finally{syncing=false;}
  }
  async function syncOnce() {
    const {room,code}=getContext(),g=room?.game;
    if(!g || !['reading','choice','debate','rolling','result','epilogue-reading','epilogue-vote'].includes(g.phase))return;
    // Process class methods during READING too; do not defer the reveal until CHOOSING.
    const pending=Object.entries(room.abilities||{}).filter(([,r])=>r?.roundId===g.roundId);
    if(pending.length){
      const [playerUid,request]=pending[0];
      await processAbility(room,g,playerUid,request);
      await set(ref(db,`rooms/${code}/abilities/${playerUid}`),null);
      return;
    }
    if(g.phase==='reading'||g.phase==='epilogue-reading'){
      const members=getMembers();
      if(Date.now()<g.readingDeadline && !members.every(uid=>g.readingReady?.[uid]))return;
      if(g.phase==='reading'){await update(path(),{phase:'choice',deadline:Date.now()+(isSpotlight(stageFor(g))?45:30)*1000});}
      else await update(path(),{phase:'epilogue-vote','epilogue/deadline':Date.now()+30*1000});
      return;
    }
    if(g.phase==='epilogue-vote'){
      const members=getMembers(),ballots=epilogueBallots(room,g);
      if(Date.now()<g.epilogue.deadline && members.some(uid=>!(uid in ballots)))return;
      const tally={unplug:Object.values(ballots).filter(choice=>choice===0).length,
        stay:Object.values(ballots).filter(choice=>choice===1).length};
      const tied=tally.unplug===tally.stay;
      await update(path(),{phase:tied?'epilogue-tie':'epilogue-finished',
        'epilogue/votes':ballots,'epilogue/tally':tally,
        'epilogue/ending':tied?'':(tally.unplug>tally.stay?'unplug':'stay'),
        'epilogue/decisionMode':tied?'pending-tiebreak':'majority',
        'epilogue/decidedAt':tied?0:Date.now()});
      return;
    }
    if(g.phase==='choice'){
      const eligible=eligiblePlayers(g);
      const all=eligible.every(uid=>room.ballots?.[uid]?.roundId===g.roundId);
      if(Date.now()<g.deadline && !all)return;
      const votes=stageVotes(room,g);
      if(disagreement(votes)){
        await update(path(),{phase:'debate',votes,debateStartedAt:Date.now(),
          debateDeadline:Date.now()+(chapterFor(g).debate.durationSeconds||30)*1000});
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
    if(g.phase==='realm-complete'){
      if(nextRealm(g.realm)){
        await set(path(),newStage(chapterStart(nextRealm(g.realm)),g.grip?.value??10,g.abilities,g.insightCards,g.usedCards,0,0,null,g.encounters,g.history||{},g));
      } else await beginEpilogue(g);
      return;
    }
    if(g.phase==='ready-to-roll'){
      await update(path(),makeRoll(getContext().room,g));
      return;
    }
    if(g.phase==='result'){
      if(!g.success){
        const grip=Math.max(0,(g.grip?.value??10)-1);
        if(grip===0){
          // Leave the current stage intact. The next host action starts a fresh
          // countdown on this same stage with the existing boss progress.
          await update(path(),{phase:'plugged','grip/value':0});
          return;
        }
        await set(path(),newStage(g.stageIndex,grip,g.abilities,g.insightCards,g.usedCards,(g.attempt||0)+1,g.bossWins||0,g.identityMask,g.encounters,g.history||{},g));
        return;
      }
      const stage=stageFor(g),chapter=chapterFor(g);
      const cards=stage.kind==='boss'&&stage.localIndex===chapter.bossPhases.length-1?
        {...(g.insightCards||{}),[chapter.insight.id]:true}:g.insightCards||{};
      const record=stageHistory(getContext().room,g);
      const changes={phase:'lore',insightCards:cards,bossWins:stage.kind==='boss'?(g.bossWins||0)+1:(g.bossWins||0)};
      if(record)changes[`history/r${record.realm}-s${g.stageIndex}`]=record;
      await update(path(),changes);
      return;
    }
    if(g.phase==='plugged'){await set(path(),newStage(g.stageIndex,6,g.abilities,g.insightCards,g.usedCards,(g.attempt||0)+1,g.bossWins||0,g.identityMask,g.encounters,g.history||{},g));return;}
    if(g.phase!=='lore')return;
    if(g.stageIndex===chapterEnd(g.realm||1)){
      await update(path(),{phase:'realm-complete',completedAt:Date.now()});return;
    }
    await set(path(),newStage(g.stageIndex+1,g.grip?.value??10,g.abilities,g.insightCards,g.usedCards,0,g.bossWins||0,null,g.encounters,g.history||{},g));
  }
  function addText(target,tag,cls,text){
    const node=document.createElement(tag);if(cls)node.className=cls;node.textContent=text;target.append(node);return node;
  }
  // Discussion and Spotlight always identify the real voter. Only the party
  // roster in app.js displays the illusion during Reconstruct.
  function realName(room,uid){return room.players?.[uid]?.name || 'Player';}
  function renderEpilogue(room,g){
    const ep=epilogueContent,{uid}=getContext(),host=isHost();
    const reading=g.phase==='epilogue-reading',voting=g.phase==='epilogue-vote',tie=g.phase==='epilogue-tie',done=g.phase==='epilogue-finished';
    const myVote=room.ballots?.[uid]?.roundId===g.roundId?room.ballots[uid].choice:null;
    const tally=g.epilogue?.tally||{unplug:0,stay:0};
    const clearIds=['game-choices','game-whispers','game-reveal','game-debate','game-die','game-lore','game-abilities'];
    for(const id of clearIds)el(id).replaceChildren();
    for(const id of ['game-identity-taunt','game-machine','game-spotlight','game-conviction','game-roll','game-debate','game-lore'])el(id).hidden=true;
    el('game-panel').dataset.phase=g.phase;el('game-panel').dataset.realm='epilogue';
    el('game-realm-label').textContent='SHORT QUEST · THE EXIT';
    el('game-heading').textContent=ep.title;
    el('game-stage').textContent=ep.subtitle;
    el('game-grip').textContent=`Final Grip: ${g.grip?.value??10}/10`;
    el('game-timer').textContent=reading?`READING ${Math.max(0,Math.ceil((g.readingDeadline-Date.now())/1000))}s`:voting?`CHOOSING ${Math.max(0,Math.ceil((g.epilogue.deadline-Date.now())/1000))}s`:'—';
    el('game-scene').textContent=ep.opening;
    el('game-question').textContent=done?ep.endings[g.epilogue.ending]?.title||'The last choice':ep.question;
    el('game-instructions').textContent=reading?'READING: review both possible endings. Tap Ready when you have considered them; voting unlocks next.':voting?(myVote===null?ep.votingNote:'Your vote is saved. The party’s decision will be revealed together.'):
      tie?ep.tiePrompt:'The party has decided. Both endings are philosophically defensible.';
    const choices=el('game-choices');
    if(voting||reading){
      if(reading)addText(choices,'p','debate-note','READING: review both options; voting unlocks when ready or when the reading timer ends.');
      for(const [i,option] of ep.options.entries()){
        const b=addText(choices,'button','choice',`${option.label} — ${option.text}`);
        if(myVote===i)b.classList.add('selected');
        b.disabled=reading||myVote!==null||!room.players?.[uid]?.connected||Date.now()>g.epilogue.deadline;
        b.addEventListener('click',()=>epilogueVote(i).catch(e=>notice('Exit vote was not saved: '+e.message,'error')));
      }
    }
    if(tie||done){
      const reveal=el('game-reveal');
      addText(reveal,'p','consensus',`Exit vote — UNPLUG ${tally.unplug} · STAY ${tally.stay}`);
      for(const [player,choice] of Object.entries(g.epilogue.votes||{})){
        addText(reveal,'div','reveal',`${realName(room,player)}: ${ep.options[choice]?.label||'No recorded vote'}`);
      }
      if(tie){
        addText(choices,'p','debate-note','A tie means neither ending wins automatically.');
        if(host)for(const option of ep.options){
          const b=addText(choices,'button','choice',`Resolve tie: ${option.label}`);
          b.addEventListener('click',()=>resolveTie(option.id).catch(e=>notice('Unable to resolve tie: '+e.message,'error')));
        }
      }
    }
    const lore=el('game-lore');lore.hidden=!done;
    if(done){
      const ending=ep.endings[g.epilogue.ending];
      addText(lore,'h3','',ending.title);
      addText(lore,'p','',ending.reflection);
      const reasons=addText(lore,'div','exit-reasons','');
      addText(reasons,'h4','','Reasons for this decision');
      const list=addText(reasons,'ul','','');
      for(const reason of ending.reasons)addText(list,'li','',reason);
      addText(lore,'p','exit-objection',ending.strongestObjection);
      addText(lore,'p','exit-decision-note',g.epilogue.decisionMode==='host-tiebreak'?'The vote was tied; the host resolved it in the open.':'The party chose by majority vote.');
      addText(lore,'h3','',ep.closingHeading);
      addText(lore,'p','',ep.closingNote);
      const history=Object.values(g.history||{}).sort((a,b)=>a.realm-b.realm || stages.findIndex(s=>s.id===a.stageId&&s.realm===a.realm)-stages.findIndex(s=>s.id===b.stageId&&s.realm===b.realm));
      if(!history.length)addText(lore,'p','', 'Earlier stage decisions were not recorded in this room. New games will include the full journey.');
      for(const item of history){
        const row=addText(lore,'div','journey-stage','');
        addText(row,'h4','',`Realm ${item.realm} · ${item.title}`);
        for(const [player,choice] of Object.entries(item.choices||{})){
          addText(row,'p','',`${realName(room,player)} — ${choice.stance} (${choice.tag})`);
        }
      }
      const credits=addText(lore,'p','epilogue-credits','');
      const parts=ep.credits.split('*');
      if(parts.length===3){
        addText(credits,'span','',parts[0]);
        addText(credits,'i','',parts[1]);
        addText(credits,'span','',parts[2]);
      }else credits.textContent=ep.credits;
    }
    if(reading){const r=addText(choices,'button','quiet','Ready');r.disabled=!!g.readingReady?.[uid];r.addEventListener('click',()=>readyToChoose().catch(e=>notice(e.message,'error')));}
    const button=el('game-next');button.hidden=true;button.disabled=true;
    button.inert=true;button.tabIndex=-1;button.setAttribute('aria-hidden','true');
  }
  function render(room) {
    const g=room.game||{},stage=stageFor(g),chapter=chapterFor(g),panel=el('game-panel');
    panel.hidden=room.status!=='started'||g.phase==='lobby'||g.phase==='phase1-complete';
    if(panel.hidden)return;
    if(isEpilogue(g)){renderEpilogue(room,g);return;}
    const {uid}=getContext(),host=isHost(),result=g.phase==='result',lore=g.phase==='lore',
      complete=g.phase==='realm-complete',plugged=g.phase==='plugged',debating=g.phase==='debate',rolling=g.phase==='rolling',ready=g.phase==='ready-to-roll';
    const eligible=eligiblePlayers(g).includes(uid);
    const myBallot=room.ballots?.[uid];
    if(myBallot?.roundId===g.roundId)pendingVotes.delete(uid);
    const pending=pendingVotes.get(uid);
    const already=myBallot?.roundId===g.roundId || pending?.roundId===g.roundId;
    panel.dataset.phase=g.phase;
    panel.dataset.realm=String(g.realm||1);
    el('game-realm-label').textContent=`SHORT QUEST · ${String(chapter.realm||'').split(' — ')[0].toUpperCase()}`;
    el('game-heading').textContent=complete?`${chapter.realm} complete`:chapter.realm;
    el('game-stage').textContent=complete?'Victory':stage?`${stage.kind==='boss'?'Boss: ':''}${stage.title}${stage.kind==='boss'?' · Weakness: '+classNames[g.bossWeakness||stage.weakness]:''}`:'Reset';
    el('game-grip').textContent=`Grip: ${g.grip?.value??10}/10`;
    el('game-conviction').textContent=`Boss Conviction: ${Math.max(0,3-(g.bossWins||0))}/3`;
    el('game-conviction').hidden=stage?.kind!=='boss';
    el('game-timer').textContent=g.phase==='reading'?`READING ${Math.max(0,Math.ceil((g.readingDeadline-Date.now())/1000))}s`:g.phase==='choice'?`CHOOSING ${Math.max(0,Math.ceil((g.deadline-Date.now())/1000))}s`:
      debating?`Debate ${Math.max(0,Math.ceil((g.debateDeadline-Date.now())/1000))}s`:'—';
    const represented=[...new Set(getMembers().map(id=>room.players?.[id]?.class).filter(Boolean))];
    const bossWeaknessList=chapter.bossPhases.map((b,i)=>classNames[represented.includes(b.weakness)?b.weakness:represented[(b.index||0)%represented.length]||b.weakness]).join(' → ');
    const chapterIntro=stage?.kind==='encounter' && stage.localIndex===0 && !g.attempt && chapter.opening ? chapter.opening+'\n\nBoss methods to watch for: '+bossWeaknessList+' (phase weaknesses will adapt to present classes).\n\n' : '';
    el('game-scene').textContent=complete?chapter.victory:plugged?'Fully Plugged In. Grip will recover to 6. The host can restart this same challenge; your earlier boss victories remain.':chapterIntro+(stage?.scene||'');
    el('game-question').textContent=complete?`${chapter.realm} complete`:stage?.question||'';
    const spotlightBanner=el('game-spotlight');
    spotlightBanner.hidden=!isSpotlight(stage)||complete||plugged;
    if(!spotlightBanner.hidden){
      const player=room.players?.[g.spotlightUid];
      spotlightBanner.textContent=`In the spotlight: ${realName(room,g.spotlightUid)}${player?.class ? ' · '+player.class.charAt(0).toUpperCase()+player.class.slice(1) : ''}`;
    }
    el('game-identity-taunt').hidden=!(hasIdentityTwist(stage) && !lore && !(result&&g.success));
    el('game-identity-taunt').textContent=chapter.identityTwist?.taunt||'';
    el('game-machine').textContent=machineText(g,stage);
    el('game-machine').hidden=!machineText(g,stage);
    const choices=el('game-choices');choices.replaceChildren();
    if((g.phase==='reading'||g.phase==='choice'||debating)&&stage){
      const order=Array.isArray(g.optionOrder)?g.optionOrder:stage.options.map((_,i)=>i);
      for(const i of order){
        const option=stage.options[i];if(!option)continue;
        const button=document.createElement('button');button.className='choice';button.textContent=option.text;
        
        if(already && (myBallot?.roundId===g.roundId?myBallot.choice:pending?.choice)===i)button.classList.add('selected');
        const canInitial=g.phase==='choice'&&!already&&Date.now()<=g.deadline;
        const canRevise=debating&&already&&myBallot?.roundId===g.roundId&&!myBallot.revised&&myBallot.choice!==i&&Date.now()<=g.debateDeadline;
        button.disabled=!eligible||!(canInitial||canRevise);
        if(g.phase==='reading')button.title='Reading phase: choices are locked';
        button.addEventListener('click',()=>vote(i).catch(e=>notice('Choice was not saved: '+e.message,'error')));
        choices.append(button);
      }
    }
    el('game-instructions').textContent=g.phase==='reading'?'READING: review the situation and use a method. Tap Ready when finished; choices unlock next.':complete?(nextRealm(g.realm)?`The host can open ${realms[realmNumbers.indexOf(nextRealm(g.realm))].realm}.`:'The last challenge is behind you. The host can open the Epilogue.'):plugged?'Host: restart this challenge with Grip 6.':
      lore?'Review each stance and the consequence. The host advances.':
      result?(!Object.values(g.votes||{}).some(choice=>Number.isInteger(choice)&&choice>=0)?'No answers submitted — the check fails automatically.':`The check ${g.success?'passed':'failed'}. The host advances after any reroll.`):
      rolling?`Difficulty Class ${g.dc}. The d20 is tumbling…`:
      ready?`DC ${g.dc} is set. The host may now roll the d20.`:
      debating?chapter.debate.prompt:
      isSpotlight(stage)&&!eligible?`Spotlight: ${realName(room,g.spotlightUid)} answers. Send one whisper.`:
      already?'Your action is locked until the party reveal.':'Choose what your adventurer does.';
    // Publicly reveal initial choices on debate, final choices during the roll and afterward.
    const reveal=el('game-reveal');reveal.replaceChildren();
    if(debating||ready||rolling||result||lore){
      const votes=debating?stageVotes(room,g):(g.votes||{});
      const agrees=consensus(votes);
      addText(reveal,'p','consensus',isSpotlight(stage)?'Spotlight response':(agrees?'Consensus reached':'Party responses revealed'));
      for(const [player,choice] of Object.entries(votes)){
        const option=stage?.options[choice];const label=realName(room,player);
        const div=addText(reveal,'div','reveal',`${label}: ${option?.text||'No answer submitted'}`);
        if(lore&&option){const tag=effectiveTag(stage,option,g);addText(div,'span','stance-tag '+tag.toLowerCase(),tag);}
      }
    }
    const debate=el('game-debate');debate.replaceChildren();debate.hidden=!debating;
    if(debating){
      const reasons=Object.entries(room.whispers||{}).filter(([,v])=>v.roundId===g.roundId && v.reason);
      for(const [player,v] of reasons)addText(debate,'p','debate-reason',`${realName(room,player)}: ${v.reason}`);
      if(room.whispers?.[uid]?.roundId!==g.roundId){
        const row=addText(debate,'div','reason-buttons','');
        for(const reason of chapter.debate.reasons){
          const b=addText(row,'button','reason-button',reason);b.disabled=Date.now()>g.debateDeadline;
          b.addEventListener('click',()=>giveReason(reason).catch(e=>notice('Reason was not saved: '+e.message,'error')));
        }
      }
      addText(debate,'p','debate-note',already && myBallot?.revised?'You have used your one vote revision.':
        already?'You may change your vote once using the action cards above.':'You did not submit an initial vote.');
    }
    const dice=el('game-die');dice.replaceChildren();dice.className='die-stage';
    const rollDisplay=el('game-roll');rollDisplay.textContent='';rollDisplay.hidden=true;
    if(ready||rolling||result||lore){
      addText(dice,'div','dc-display',`DC ${g.dc}`);
      const noAnswers=(rolling||result||lore) && !Object.values(g.votes||{}).some(choice=>Number.isInteger(choice)&&choice>=0);
      if(noAnswers){
        dice.classList.add('failed');
        addText(dice,'p','auto-fail','No answers submitted — the check fails automatically.');
      }else if(rolling && Date.now()<g.rollRevealAt){
        dice.classList.add('tumbling');addText(dice,'div','die-shape','d20');
        addText(dice,'p','roll-caption','Rolling…');
      }else if(Number.isInteger(g.die) && Number.isFinite(g.total) && typeof g.success==='boolean'){
        dice.classList.add(g.success?'passed':'failed');
        addText(dice,'div','roll-outcome',g.success?'PASS':'FAIL');
        const learning=g.learningBonus??3*(g.attempt||0);
        rollDisplay.textContent=`d20 ${g.die} + party average ${g.modifier} + Insight ${g.rollBonus||0} + weakness ${g.weaknessBonus||0} + Second Look ${learning} = ${g.total}`;
        rollDisplay.hidden=false;
      }
    }
    const lorePanel=el('game-lore');lorePanel.replaceChildren();lorePanel.hidden=!lore;
    if(lore){
      addText(lorePanel,'h3','', 'What your actions revealed');
      const chosen=new Set(Object.values(g.votes||{}).filter(v=>v>=0));
      for(const i of chosen){
        const option=stage?.options[i];if(!option)continue;
        const card=addText(lorePanel,'div','lore-stance','');
        const tag=effectiveTag(stage,option,g),lc=option.loreCard;
        addText(card,'div','stance-head',`${tag} · ${option.stance}`);
        addText(card,'p','',`Theory — ${lc.theory.name} (${lc.theory.thinker}, ${lc.theory.work})`);
        addText(card,'p','',`Core principle — ${lc.corePrinciple}`);
        addText(card,'p','',`Here — ${lc.sceneAnalysis}`);
        addText(card,'p','',`Strongest objection — ${lc.strongestObjection}`);
      }
      addText(lorePanel,'p','lore-summary',stage?.lore||'');
      if(stage?.kind==='boss' && stage.localIndex===chapter.bossPhases.length-1 && g.insightCards?.[chapter.insight.id])
        addText(lorePanel,'p','insight-awarded',`Insight earned: ${chapter.insight.title} — ${chapter.insight.description}`);
    }
    const abilities=el('game-abilities');abilities.replaceChildren();
    if(g.phase==='reading'){const readyButton=addText(abilities,'button','quiet',g.readingReady?.[uid]?'Ready ✓':'Ready to choose');readyButton.disabled=!!g.readingReady?.[uid];readyButton.addEventListener('click',()=>readyToChoose().catch(e=>notice(e.message,'error')));}
    if(g.hintVisible)addText(abilities,'p','encounter-hint',`Second Look hint: ${stage?.hint||''}`);
    const klass=room.players?.[uid]?.class;
    const canUse=['reading','choice','debate'].includes(g.phase)&&Date.now()<=(g.phase==='reading'?g.readingDeadline:g.phase==='choice'?g.deadline:g.debateDeadline);
    const classAvailable=canUse&&!g.classUses?.[uid]?.['r'+g.realm]?.[stage.kind];
    if(canUse && stage){
      if(classAvailable){
        if(klass==='skeptic'||klass==='pragmatist'){
          addText(abilities,'p','ability-help',`${classNames[klass]}: choose an option to investigate.`);
          for(const opt of stage.options){
            const b=addText(abilities,'button','quiet',`${classNames[klass]} — ${shortAction(opt.text)}`);
            b.addEventListener('click',()=>ability(opt.id).catch(e=>notice('Ability failed: '+e.message,'error')));
          }
        }else{
          const b=addText(abilities,'button','quiet',`Use ${classNames[klass]||'class method'}`);
          b.addEventListener('click',()=>ability().catch(e=>notice('Ability failed: '+e.message,'error')));
        }
      }else addText(abilities,'p','ability-help',`Class method already used for this realm’s ${stage.kind} section.`);
      const cardId=Object.keys(g.insightCards||{}).find(id=>g.insightCards[id]&&!g.usedCards?.[id]);
      if(cardId && !g.insightUses?.[uid]){
        const card=realms.map(c=>c.insight).find(c=>c.id===cardId);
        const b=addText(abilities,'button','quiet',`Use Insight: ${card?.title||cardId} (+3)`);
        b.addEventListener('click',()=>useCard().catch(e=>notice('Insight failed: '+e.message,'error')));
      }
    }
    if(result&&!g.success&&!g.rerollUsed&&klass==='pragmatist'&&!g.rerollUses?.[uid]?.['r'+g.realm]){
      const b=addText(abilities,'button','quiet','Pragmatist: reroll failed check');
      b.addEventListener('click',()=>requestReroll().catch(e=>notice('Reroll failed: '+e.message,'error')));
    }
    for(const [player,entry] of Object.entries(g.abilityReveals||{})){
      if(entry?.stageIndex===g.stageIndex)addText(abilities,'p','ability-detail',`${realName(room,player)} used ${classNames[entry.type]||entry.type}: ${entry.detail}`);
    }
    const feedback=g.abilityFeedback?.[uid];
    if(feedback?.roundId===g.roundId&&!feedback.accepted)addText(abilities,'p','ability-error',feedback.message);
    const log=Object.entries(g.abilityEvents||{}).sort(([a],[b])=>a.localeCompare(b)).slice(-8);
    if(log.length){
      const logPanel=addText(abilities,'div','ability-log','');
      addText(logPanel,'h4','','Party method log');
      for(const [,entry] of log)addText(logPanel,'p','',entry.message);
    }
    if(stage?.conditional && g.discoveredStages?.['s'+g.stageIndex]){
      const favored=stage.options.find(o=>o.id===stage.conditional.strongOptionId);
      addText(abilities,'p','ability-hint',`New evidence favors: “${favored?.text||''}”. ${stage.evidenceExplanation||''}`);
    }
    const whispers=el('game-whispers');whispers.replaceChildren();
    if(g.phase==='choice'&&isSpotlight(stage)&&uid!==g.spotlightUid){
      const alreadyWhispered=room.whispers?.[uid]?.roundId===g.roundId;
      for(const emoji of ['💡','🤔','🦋']){
        const b=addText(whispers,'button','whisper-button',`Whisper ${emoji}`);
        b.disabled=alreadyWhispered;
        b.addEventListener('click',()=>whisper(emoji).catch(e=>notice(e.message,'error')));
      }
    }
    if(isSpotlight(stage)){
      const messages=Object.values(room.whispers||{}).filter(w=>w.roundId===g.roundId&&w.emoji).map(w=>w.emoji).join(' ');
      if(messages)addText(whispers,'p','whisper-display',messages);
    }
    const nextButton=el('game-next');
    const showNext=host && (['ready-to-roll','result','lore','plugged'].includes(g.phase) || complete);
    nextButton.hidden=!showNext;
    nextButton.disabled=!showNext;
    nextButton.tabIndex=showNext?0:-1;
    nextButton.inert=!showNext;
    nextButton.setAttribute('aria-hidden',showNext?'false':'true');
    el('game-next').textContent=ready?'Roll d20 (host)':result?(g.success?'Reveal lore (host)':'Second Look (host)'):
      plugged?'Retry this challenge (host)':complete?(nextRealm(g.realm)?`Enter ${realms[realmNumbers.indexOf(nextRealm(g.realm))]?.realm} (host)`:'Open the Epilogue (host)'):lore?'Continue (host)':'Continue (host)';
  }
  let lastUiTickPhase='';
  function tick(){
    const {room}=getContext();if(!room||room.status!=='started')return;
    const g=room.game||{};
    if(g.phase==='epilogue-reading'||g.phase==='reading'){el('game-timer').textContent=`READING ${Math.max(0,Math.ceil((g.readingDeadline-Date.now())/1000))}s`;
    }else if(g.phase==='epilogue-vote'){
      el('game-timer').textContent=`CHOOSING ${Math.max(0,Math.ceil((g.epilogue.deadline-Date.now())/1000))}s`;
    }else if(g.phase==='choice'){
      el('game-timer').textContent=`CHOOSING ${Math.max(0,Math.ceil((g.deadline-Date.now())/1000))}s`;
    }else if(g.phase==='debate'){
      el('game-timer').textContent=`Debate ${Math.max(0,Math.ceil((g.debateDeadline-Date.now())/1000))}s`;
    }
    if(g.phase==='rolling'&&Date.now()>=g.rollRevealAt){
      if(lastUiTickPhase!==g.roundId+'-'+g.rollRevealAt){
        lastUiTickPhase=g.roundId+'-'+g.rollRevealAt;
        render(room);
      }
    }
    if(isHost()&&['reading','choice','debate','rolling','result','epilogue-reading','epilogue-vote'].includes(g.phase))hostSync().catch(e=>console.warn('Host sync error',e));
  }
  el('game-next').addEventListener('click',()=>next().catch(e=>notice(e.message,'error')));
  setInterval(tick,350);
  return {begin,readyToChoose,vote,render};
}
