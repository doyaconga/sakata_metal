const c=document.querySelector('#game'),x=c.getContext('2d'),W=960,H=540,G=440;
const zangiefImg=new Image();zangiefImg.src='assets/zangief.png';
function renderDebugSettings(){
  const fields=document.querySelector('#debugFields');fields.innerHTML='';
  for(const def of DEBUG_SETTING_DEFS){
    const label=document.createElement('label');label.className='debugLabel';label.htmlFor='debug-'+def.key;label.textContent=def.label;
    const input=document.createElement('input');input.className='debugInput';input.id='debug-'+def.key;input.type='number';input.min=def.min;input.max=def.max;input.step=def.step;input.value=Number(def.get().toFixed(2));
    fields.append(label,input);
  }
  const checks=document.querySelector('#debugAnimalChecks');checks.innerHTML='';
  for(const [type,labelText] of ANIMAL_OPTIONS){
    const label=document.createElement('label');label.className='debugAnimalCheck';
    const input=document.createElement('input');input.type='checkbox';input.className='debugAnimalInput';input.value=type;input.checked=debugEnabledAnimals.has(type);
    label.append(input,document.createTextNode(labelText));checks.append(label);
  }
}
function collectDebugInputValues(){
  const values={};
  for(const def of DEBUG_SETTING_DEFS){const input=document.querySelector('#debug-'+def.key);if(input)values[def.key]=input.value}
  const animalInputs=[...document.querySelectorAll('.debugAnimalInput')];
  if(animalInputs.length>0)values.enabledAnimals=animalInputs.filter(input=>input.checked).map(input=>input.value);
  return values;
}
function setDebugStatus(message,isError=false){
  const status=document.querySelector('#debugStatus');
  status.textContent=message;
  status.classList.toggle('error',isError);
}
function commitDebugInputs(showStatus=true){
  const values=collectDebugInputValues();
  if(Object.keys(values).length>0){
    applyDebugValues(values);
    try{localStorage.setItem(DEBUG_STORAGE_KEY,JSON.stringify(currentDebugValues()))}catch(err){}
  }
  const hasAnimal=debugEnabledAnimals.size>0;
  if(showStatus)setDebugStatus(hasAnimal?'自動保存しました。次のSTARTから反映されます。':'出現する動物を1匹以上選択してください。',!hasAnimal);
  return hasAnimal;
}
let run=false,dist=0,cleared=0,stage=1,speed=6,spawnTimer=100,obs=[],dusts=[],bannerT=0,bannerGapT=0,pendingSeasonBanner='',patternSeq=0,passedPatterns=new Set(),animalSpawnCounts={},rafId=null,gameToken=0,groundOffset=0,lariatTimer=0,lariatCooldown=0,lariatEndInvuln=0;
let paused=false,pauseConfirmAction=null,pauseRankingOpen=false;
let debugHitboxes=false;
let items=[],meatShield=0,rescueInvuln=0,itemChancePending=false,itemChanceActive=false,itemChanceChosen=false,itemChanceChosenAt=0,nextItemChanceAt=600+Math.random()*200,nextChargeAt=250+Math.random()*200;
let gameOverFragments=[],gameOverExplosionTimer=0,gameOverMessageTimeout=null,playerExploded=false,gameOverRetryReady=false;
let scoreState={bonus:0,defeated:0,bestCombo:0,lariatCombo:0,lariatBonus:0};
let scoreEffects=[];
const p={x:150,y:G-62,w:58,h:62,vy:0,jumps:0,on:true,rot:0};

// Run game simulation at the original 60 updates per second regardless of
// whether the display refreshes at 60, 120, 144 Hz, or another rate.
const FIXED_STEP_MS=1000/60;
const MAX_CATCH_UP_STEPS=5;
let lastFrameTime=0;
let frameAccumulator=0;
function resetFrameClock(now=performance.now()){
 lastFrameTime=now;
 frameAccumulator=0;
}

let thunderLatch=false;
function getTotalScore(){return Math.floor(dist)+scoreState.bonus}
function itemChanceInterval(atDistance=dist){
  const range=GAME_CONFIG.itemChanceRanges.find(r=>atDistance>=r[0]&&atDistance<r[1])||GAME_CONFIG.itemChanceRanges[GAME_CONFIG.itemChanceRanges.length-1];
  return range[2]+Math.random()*(range[3]-range[2]);
}
function chargeInterval(){
  return GAME_CONFIG.chargeIntervalMin+Math.random()*(GAME_CONFIG.chargeIntervalMax-GAME_CONFIG.chargeIntervalMin);
}
function updateItemHud(){
  const parts=[];
  if(meatShield>0)parts.push(`🛡 GUARD ×${meatShield}`);
  document.querySelector('#meatHud').textContent=parts.join('　');
}
function syncLariatReadyUi(){
  if(lariatCooldown>0 || lariatTimer>0)return;
  const lb=document.querySelector('#lariatBtn');
  lb.disabled=false;
  document.querySelector('#lariatFill').style.transform='scaleX(1)';
  document.querySelector('#lariatStatus').textContent='READY';
}
function beginItemChance(){
  itemChancePending=false;itemChanceActive=true;itemChanceChosen=false;itemChanceChosenAt=0;
  const group='choice-'+Math.floor(dist);
  items.push({type:'shield',group,x:W+80,y:G-185,w:46,h:46,taken:false,bob:0});
  items.push({type:'speedDown',group,x:W+80,y:G-70,w:46,h:46,taken:false,bob:Math.PI});
  const b=document.querySelector('#banner');b.textContent='ITEM CHANCE';b.classList.add('show');bannerT=105;
}
function finishItemChance(){
  itemChancePending=false;itemChanceActive=false;itemChanceChosen=false;itemChanceChosenAt=0;
  nextItemChanceAt=dist+itemChanceInterval(dist);
  spawnTimer=360;
}

function reset(){
 titleMode=false;
 paused=false;pauseConfirmAction=null;pauseRankingOpen=false;
 document.querySelector('#pauseOverlay').classList.add('hidden');
 document.body.classList.remove('titleOnly');document.body.classList.add('gameOnly');
 gameToken++;
 if(rafId!==null){cancelAnimationFrame(rafId);rafId=null;}
 if(gameOverMessageTimeout!==null){clearTimeout(gameOverMessageTimeout);gameOverMessageTimeout=null;}
 run=true;
 dist=0;cleared=0;stage=GAME_CONFIG.startStage;speed=GAME_CONFIG.initialSpeed;spawnTimer=100;groundOffset=0;lariatTimer=0;lariatCooldown=0;lariatEndInvuln=0;thunderLatch=false;
 items=[];meatShield=0;rescueInvuln=0;itemChancePending=false;itemChanceActive=false;itemChanceChosen=false;itemChanceChosenAt=0;nextItemChanceAt=itemChanceInterval(0);nextChargeAt=chargeInterval();
 obs=[];dusts=[];bannerT=0;bannerGapT=0;pendingSeasonBanner='';patternSeq=0;passedPatterns=new Set();animalSpawnCounts=Object.fromEntries(ANIMAL_TYPES.map(type=>[type,0]));
 gameOverFragments=[];gameOverExplosionTimer=0;playerExploded=false;gameOverRetryReady=false;
 scoreState={bonus:0,defeated:0,bestCombo:0,lariatCombo:0,lariatBonus:0};scoreEffects=[];
 Object.assign(p,{y:G-p.h,vy:0,jumps:0,on:true,rot:0});
 document.querySelector('#msg').classList.add('hidden');
 document.querySelector('#banner').classList.remove('show');
 document.querySelector('#score').textContent='TOTAL SCORE 0';
 document.querySelector('#sub').innerHTML=DEBUG_BUILD?`<span style="color:#9ff7ff">DEBUG STAGE ${stage} / SPEED ${speed.toFixed(2)}</span><br><span style="color:#ffe45c">DEBUG ITEM NEXT ${fmt(nextItemChanceAt)}m</span>`:'';
 updateItemHud();
 const lb=document.querySelector('#lariatBtn');
 lb.disabled=false;
 document.querySelector('#pauseBtn').classList.remove('hidden');
 
 document.querySelector('#lariatLabel').textContent='ダブルラリアット';
 document.querySelector('#lariatStatus').textContent='READY';
 document.querySelector('#lariatFill').style.transform='scaleX(1)';
 document.querySelector('#activeFill').style.transform='scaleX(1)';
 lb.classList.remove('activeNow');
 spawnPattern();
 const token=gameToken;
 resetFrameClock();
 rafId=requestAnimationFrame(now=>loop(token,now));
}
function jump(){
 if(titleMode||paused)return;
 if(!run){
   if(!gameOverRetryReady)return;
   gameOverRetryReady=false;initAudio();sfxStart();startBgm('game');reset();return;
 }
 if(p.jumps<2){p.vy=p.jumps? -13.0:-14.8;p.jumps++;sfxJump();p.on=false;makeDust(p.x+10,p.y+p.h,3)}
}
function useLariat(){
 if(!run || paused || lariatCooldown>0 || lariatTimer>0)return;
 lariatTimer=GAME_CONFIG.lariatDurationFrames;
  lariatCooldown=GAME_CONFIG.lariatCooldownFrames;updateItemHud();
 lariatEndInvuln=0;
 scoreState.lariatCombo=0;scoreState.lariatBonus=0;
 sfxLariat();
 startBgm('lariat');
 const lb=document.querySelector('#lariatBtn');
 lb.disabled=true;
 lb.classList.add('activeNow');
 document.querySelector('#lariatStatus').textContent='発動中！';
 document.querySelector('#lariatFill').style.transform='scaleX(0)';
 document.querySelector('#activeFill').style.transform='scaleX(1)';
}
function registerLariatDefeat(o){
  if(o.defeated)return;
  o.defeated=true;
  scoreState.lariatCombo++;
  const index=scoreState.lariatCombo-1;
  const points=index<GAME_CONFIG.comboScores.length?GAME_CONFIG.comboScores[index]:GAME_CONFIG.comboScoreCap;
  scoreState.lariatBonus+=points;
  scoreState.bonus+=points;
  scoreState.defeated++;
  scoreState.bestCombo=Math.max(scoreState.bestCombo,scoreState.lariatCombo);
  scoreEffects=scoreEffects.filter(e=>e.type!=='combo');
  scoreEffects.push({type:'combo',combo:scoreState.lariatCombo,points,life:68,maxLife:68});
}
function finishLariatScoring(){
  if(scoreState.lariatCombo>0){
    scoreEffects=scoreEffects.filter(e=>e.type!=='combo');
    scoreEffects.push({type:'lariatResult',combo:scoreState.lariatCombo,bonus:scoreState.lariatBonus,life:125,maxLife:125});
  }
  scoreState.lariatCombo=0;scoreState.lariatBonus=0;
}
function updateScoreEffects(){
  for(const effect of scoreEffects)effect.life--;
  scoreEffects=scoreEffects.filter(effect=>effect.life>0);
}
c.addEventListener('pointerdown',e=>{
  // Left click / touch = jump. Right click is handled by contextmenu below.
  if(e.button===2)return;
  e.preventDefault();jump();
});
c.addEventListener('contextmenu',e=>{
  e.preventDefault();
  useLariat();
});
document.querySelector('#lariatBtn').addEventListener('pointerdown',e=>{e.stopPropagation();e.preventDefault();useLariat()});

function makeDust(px,py,n){for(let i=0;i<n;i++)dusts.push({x:px,y:py,vx:-Math.random()*2,vy:-1-Math.random()*2,life:30})}
function rect(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y}
function playerHitbox(){return {x:p.x+11,y:p.y+9,w:p.w-20,h:p.h-15}}
function obstacleHitboxes(o){
  const oy=o.y??G-o.h;
  if(o.type==='birds')return [{x:o.x+26,y:oy+6,w:o.w-34,h:o.h-12}];
  if(o.type==='bats')return [{x:o.x+7,y:oy+3,w:o.w-14,h:o.h-7}];
  if(o.type==='cow')return [
    {x:o.x+5,y:oy+20,w:47,h:51},
    {x:o.x+40,y:oy+37,w:52,h:15},
    {x:o.x+27,y:oy+49,w:76,h:32},
    {x:o.x+38,y:oy+80,w:56,h:15},
    {x:o.x+43,y:oy+88,w:14,h:19},
    {x:o.x+75,y:oy+88,w:14,h:19}
  ];
  return [{x:o.x,y:oy,w:o.w,h:o.h}];
}

function phase(){return (stage-1)%4}
function season(){return Math.floor((stage-1)/4)%4}
function advance(){
 stage++;speed=Math.min(GAME_CONFIG.maxSpeed,speed+GAME_CONFIG.speedStep);
 let b=document.querySelector('#banner');b.textContent=`STAGE ${stage}`;b.classList.add('show');bannerT=85;
 pendingSeasonBanner=(stage-1)%4===0?SEASON_NAMES[season()]:'';
}

/* Every pattern is hand-spaced to leave a valid route.
   New patterns unlock as stages increase. */
function spawnPattern(){
 let base=W+50;
 const easy=[
  [{d:0,t:'pig',w:64,h:48}],
  [{d:0,t:'turtle',w:58,h:34}],
  [{d:0,t:'pig',w:64,h:48},{d:285,t:'turtle',w:58,h:34}]
 ];
 const mid=[
  // Bird flock: long, low obstacle that forces a jump.
  [{d:0,t:'birds',w:175,h:42,y:G-70}],
  // Ground animal followed by birds.
  [{d:0,t:'pig',w:64,h:48},{d:210,t:'birds',w:170,h:42,y:G-72}],
  // Frog periodically hops; the timing is predictable.
  [{d:0,t:'frog',w:46,h:36,move:'hop',amp:105,period:110}],
  // Snake periodically raises its head, changing required jump height.
  [{d:0,t:'snake',w:86,h:18,move:'rear',amp:70,period:150}],
  // Rabbit jumps when the player gets close.
  [{d:0,t:'rabbit',w:44,h:38,move:'react',trigger:250,jumpV:-12.5}]
 ];
 const hard=[
  // Two ground animals, then a long flock.
  [{d:0,t:'pig',w:64,h:48},{d:290,t:'turtle',w:58,h:34},{d:535,t:'birds',w:185,h:42,y:G-72}],
  // Dog patrol.
  [{d:0,t:'dog',w:58,h:42,move:'rush',extra:1.6}],
  // Cow: large obstacle intended to require a two-stage jump.
  [{d:0,t:'cow',w:115,h:107}],
  // Rabbit then snake: reaction plus height-read, spaced safely.
  [{d:0,t:'rabbit',w:44,h:38,move:'react',trigger:260,jumpV:-12.5},{d:320,t:'snake',w:86,h:18,move:'rear',amp:70,period:150}]
 ];
 const compound=[
  // Clear the cow with one jump and land to run under the bats. A needless
  // second jump keeps the player airborne long enough to collide with them.
  [{d:0,t:'cow',w:115,h:107},{d:200,t:'bats',w:175,h:58,y:G-210,move:'bob',amp:8,period:78}],
  // Turtle into low birds: two readable jumps with a full landing window.
  [{d:0,t:'turtle',w:58,h:34},{d:370,t:'birds',w:175,h:42,y:G-72}],
  // Pig into hopping frog: the wide gap preserves a reaction window even
  // when the frog happens to be at the most awkward point of its cycle.
  [{d:0,t:'pig',w:64,h:48},{d:430,t:'frog',w:46,h:36,move:'hop',amp:105,period:110}],
  // Patrolling dog into high bats: clear the dog, then stay on the ground.
  // A needless late double jump is risky, but a normal route always exists.
  [{d:0,t:'dog',w:58,h:42,move:'rush',extra:1.6},{d:200,t:'bats',w:175,h:58,y:G-210,move:'bob',amp:8,period:78}]
 ];
 const expert=[
  // Fast cat: a compact late-game obstacle with a shorter reaction window.
  [{d:0,t:'cat',w:52,h:40}],
  // Fast cat into low birds: react quickly to the cat, then extend the jump
  // only as much as needed to clear the flock.
  [{d:0,t:'cat',w:52,h:40},{d:300,t:'birds',w:175,h:42,y:G-72}]
 ];
 // A pattern becomes available as soon as every animal in it has reached its
 // unlock stage. Once unlocked it remains in the draw pool for later stages.
 let pool=[...easy,...mid,...hard,...compound,...expert].filter(pattern=>
   pattern.every(entry=>debugEnabledAnimals.has(entry.t)&&stage>=(ANIMAL_UNLOCK_STAGE[entry.t]||1))
 );
 if(pool.length===0){spawnTimer=180;return}
 // Soft equalization: patterns containing animals seen less often this run
 // receive more weight, while every unlocked pattern keeps a chance to appear.
 const weights=pool.map(pattern=>pattern.reduce((sum,entry)=>
   sum+1/Math.pow(1+(animalSpawnCounts[entry.t]||0),1.25),0)/pattern.length);
 let roll=Math.random()*weights.reduce((sum,weight)=>sum+weight,0);
 let pat=pool[pool.length-1];
 for(let i=0;i<pool.length;i++)if((roll-=weights[i])<=0){pat=pool[i];break}
 // Keep dog patterns in the draw. If birds are still on screen, delay the dog
 // far enough to preserve a safe landing window instead of discarding the draw.
 if(pat.some(entry=>entry.t==='dog')){
   const activeBirds=obs.filter(o=>o.type==='birds'&&!o.flying);
   if(activeBirds.length){
     const rightmostBird=Math.max(...activeBirds.map(o=>o.x+o.w));
     base=Math.max(base,rightmostBird+460);
   }
 }
 let max=0;
 const pid=patternSeq++;
 for(const q of pat){
   animalSpawnCounts[q.t]=(animalSpawnCounts[q.t]||0)+1;
   obs.push({
     x:base+q.d,type:q.t,w:q.w,h:q.h,y:q.y,passed:false,pid,
     move:q.move||null,amp:q.amp||0,
     period:q.move==='hop' ? q.period*(0.88+Math.random()*0.24) :
       (q.move==='rear' ? GAME_CONFIG.snakeCycleMinFrames+Math.random()*(GAME_CONFIG.snakeCycleMaxFrames-GAME_CONFIG.snakeCycleMinFrames) : (q.period||1)),
     extra:q.extra||0,
     trigger:q.trigger||0,
     jumpV:q.jumpV||0,
     reacted:false,
     localVy:0,
     speedMul:q.t==='turtle'?0.82:(q.t==='pig'?1.02:(q.t==='cat'?GAME_CONFIG.catSpeedMultiplier:1)),
     patrolAmp:q.t==='dog'?42:0,
     patrolPeriod:q.t==='dog'?115:1,
     dogDir:q.t==='dog'?-1:0,
     dogTurnLeft:q.t==='dog'?250:0,
     dogTurnRight:q.t==='dog'?430:0,
     baseY:q.y??(G-q.h),
     age:q.move==='hop' ? Math.random()*(q.period||110) : Math.floor(Math.random()*60),
     prevPatrol:0,
      flying:false,flyVx:0,flyVy:0,flyRot:0,defeated:false
   });
   max=Math.max(max,q.d+q.w)
 }
 spawnTimer=(base-(W+50))+max+220+Math.random()*90;
}

function die(){
 if(lariatTimer>0 || rescueInvuln>0)return;
 if(meatShield>0){
   meatShield--;
   rescueInvuln=90;
   p.vy=-7;
   p.y=Math.min(p.y,G-p.h-6);
   sfxDamage();
   updateItemHud();
   return;
 }
  gameOverRetryReady=false;
  document.querySelector('#pauseBtn').classList.add('hidden');
  stopBgm();sfxDamage();setTimeout(sfxGameOver,240);
  run=false;
  const score=Math.floor(dist);
  const totalScore=getTotalScore();
  if(score>best){best=score;localStorage.setItem('jumpRunnerBest',String(best));}
  if(totalScore>bestTotal){bestTotal=totalScore;localStorage.setItem('zangiefAnimalBestTotalV2',String(bestTotal));}
  saveScoreRecord({totalScore,distance:score,defeated:scoreState.defeated,bestCombo:scoreState.bestCombo,bonus:scoreState.bonus,savedAt:new Date().toISOString()});
  document.querySelector('#gameOverContent').innerHTML=`
    <b class="gameOverTitle">GAME OVER</b>
    <div class="gameOverTotalLabel">TOTAL SCORE</div>
    <div class="gameOverTotal">${fmt(totalScore)}</div>
    <div class="gameOverStats">DISTANCE　${fmt(score)}m<br>BEST COMBO　${scoreState.bestCombo}</div>`;
  startGameOverExplosion();
  gameOverMessageTimeout=setTimeout(()=>{
    document.querySelector('#msg').classList.remove('hidden');
    gameOverRetryReady=true;
    gameOverMessageTimeout=null;
  },650);
}
function startGameOverExplosion(){
  gameOverFragments=[];gameOverExplosionTimer=72;playerExploded=true;
  const size=76,cols=4,rows=4,piece=size/cols;
  const left=p.x+p.w/2-size/2,top=p.y+p.h/2-size/2-4;
  for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
    const px=left+col*piece+piece/2,py=top+row*piece+piece/2;
    const angle=Math.atan2(py-(p.y+p.h/2),px-(p.x+p.w/2))+(Math.random()-.5)*.7;
    const force=4.5+Math.random()*6.5;
    gameOverFragments.push({
      x:px,y:py,vx:Math.cos(angle)*force,vy:Math.sin(angle)*force-2.5,
      rot:0,vr:(Math.random()-.5)*.42,row,col,size:piece,life:72
    });
  }
  for(let i=0;i<22;i++){
    const angle=Math.random()*Math.PI*2,force=3+Math.random()*9;
    gameOverFragments.push({
      spark:true,x:p.x+p.w/2,y:p.y+p.h/2,
      vx:Math.cos(angle)*force,vy:Math.sin(angle)*force-1,
      size:3+Math.random()*6,life:30+Math.random()*25
    });
  }
}
function updateGameOverExplosion(){
  if(gameOverExplosionTimer>0)gameOverExplosionTimer--;
  for(const f of gameOverFragments){
    f.x+=f.vx;f.y+=f.vy;f.vx*=.992;f.vy+=f.spark?.18:.34;
    if(!f.spark){f.rot+=f.vr;f.vr*=.99}
    f.life--;
  }
  gameOverFragments=gameOverFragments.filter(f=>f.life>0&&f.y<H+80);
}
function update(){
 dist+=speed/12;groundOffset=(groundOffset+speed)%10000;if(!itemChanceActive&&!itemChancePending)spawnTimer-=speed;
 updateScoreEffects();
 if(rescueInvuln>0)rescueInvuln--;
 if(lariatEndInvuln>0)lariatEndInvuln--;
 if(dist>=nextItemChanceAt-GAME_CONFIG.itemChanceLeadMeters&&!itemChanceActive)itemChancePending=true;
 if(itemChancePending&&dist>=nextItemChanceAt&&obs.length===0&&items.length===0)beginItemChance();
 if(!itemChanceActive&&!itemChancePending&&lariatCooldown>0&&dist>=nextChargeAt&&!items.some(it=>it.type==='roadCharge')){
   items.push({type:'roadCharge',group:null,x:W+80,y:G-125,w:46,h:46,taken:false,bob:0});
   nextChargeAt=dist+chargeInterval();
 }
 for(const it of items){it.x-=speed;it.bob+=.08*Math.max(1,speed/6)}
 items=items.filter(it=>!it.taken && it.x+it.w>-60);
 if(itemChanceActive&&!itemChanceChosen&&items.length===0){itemChanceChosen=true;itemChanceChosenAt=dist}
 if(itemChanceActive&&itemChanceChosen&&dist-itemChanceChosenAt>=GAME_CONFIG.itemChanceExitMeters)finishItemChance();
     if(lariatTimer>0){
   lariatTimer--;
   const activeFill=document.querySelector('#activeFill');
   activeFill.style.transform='scaleX('+Math.max(0,lariatTimer/GAME_CONFIG.lariatDurationFrames)+')';
   if(lariatTimer===0){
     lariatEndInvuln=GAME_CONFIG.lariatEndInvulnFrames;
     finishLariatScoring();
     const lb=document.querySelector('#lariatBtn');
     lb.classList.remove('activeNow');
     activeFill.style.transform='scaleX(0)';
     if(lariatCooldown>0)document.querySelector('#lariatStatus').textContent='COOLDOWN';
     else syncLariatReadyUi();
     if(!titleMode && run)startBgm('game');
   }
 }
 if(lariatCooldown>0){
   lariatCooldown--;
   const lb=document.querySelector('#lariatBtn');
   const fill=document.querySelector('#lariatFill');
   const ready=1-(lariatCooldown/GAME_CONFIG.lariatCooldownFrames);
   fill.style.transform='scaleX('+Math.max(0,Math.min(1,ready))+')';
   if(lariatCooldown>0){
     lb.disabled=true;
     if(lariatTimer<=0){
       
       document.querySelector('#lariatStatus').textContent='COOLDOWN';
     }
   }else{
     lb.disabled=false;
     fill.style.transform='scaleX(1)';
     
     document.querySelector('#lariatStatus').textContent='READY';
   }
 }if(!itemChanceActive&&!itemChancePending&&spawnTimer<=0)spawnPattern();
 const timeScale=Math.max(1,speed/6);
 p.vy+=.67*timeScale;
 p.y+=p.vy*timeScale;
 if(p.y+p.h>=G){p.y=G-p.h;p.vy=0;if(!p.on)makeDust(p.x+8,G,5);p.on=true;p.jumps=0}else p.on=false;
 p.rot=p.on?0:p.rot+.11;

 // Rescue shield pickup
 for(const it of items){
   const itemHit={x:it.x+3,y:it.y+3,w:it.w-6,h:it.h-6};
   const playerHit={x:p.x+11,y:p.y+9,w:p.w-20,h:p.h-15};
   const choiceItem=it.type==='shield'||it.type==='speedDown';
   if((!choiceItem||!itemChanceChosen) && !it.taken && rect(playerHit,itemHit)){
     it.taken=true;
     if(choiceItem){itemChanceChosen=true;itemChanceChosenAt=dist}
     if(it.type==='shield'){
       meatShield++;
       scoreEffects.push({type:'itemNotice',text:'🛡 GUARD',color:'#d9efff',life:90,maxLife:90});
     }
     else if(it.type==='roadCharge'){
       lariatCooldown=Math.max(0,lariatCooldown-GAME_CONFIG.lariatCooldownFrames*GAME_CONFIG.chargeRecoveryRatio);
       syncLariatReadyUi();
       scoreEffects.push({type:'itemNotice',text:`⚡ CHARGE +${Math.round(GAME_CONFIG.chargeRecoveryRatio*100)}%`,color:'#ffe45c',life:90,maxLife:90});
     }
     else if(it.type==='speedDown'){
       speed=Math.max(GAME_CONFIG.minSpeed,speed-GAME_CONFIG.speedStep*GAME_CONFIG.speedDownSteps);
       scoreEffects.push({type:'itemNotice',text:'🐢 SPEED DOWN',color:'#b9ff9f',life:90,maxLife:90});
     }
     updateItemHud();
     sfxButton();
   }
 }

 for(const o of obs){
  const simScale=Math.max(1,speed/6);
  o.age+=simScale;

  if(o.flying){
    o.x+=o.flyVx;
    o.y=(o.y??(G-o.h))+o.flyVy;
    o.flyVy+=0.55;
    o.flyRot+=0.22;
    continue;
  }

  // Species movement:
  // turtle = slower than world scroll, pig = slightly faster,
  // dog = oscillates forward/back around its scrolling path.
  let dx = speed * (o.speedMul || 1);
  if(o.move==='rush') dx += o.extra;

  if(o.type==='dog'){
    // Real patrol: dog runs toward the player, turns around, runs away, then returns.
    // The whole course still scrolls left, but the dog has its own signed movement.
    const dogSpeed=2.4;
    o.x-=speed;              // world scroll
    o.x+=o.dogDir*dogSpeed;  // dog's own run
    if(o.dogDir<0 && o.x<=o.dogTurnLeft){
      o.dogDir=1;
    }else if(o.dogDir>0 && o.x>=o.dogTurnRight){
      o.dogDir=-1;
    }
  }else{
    o.x -= dx;
  }

  // Small contact dust makes ground animals feel planted without moving ground texture.
  if((o.type==='pig'||o.type==='dog'||o.type==='cat'||o.type==='turtle') && o.age%18===0 && o.x<W && o.x>0){
    const oyNow=o.y??G-o.h;
    if(oyNow+o.h>=G-2) makeDust(o.x+o.w*.35,G,1);
  }

  // Prevent same-pattern ground animals from collapsing into each other
  // when their species speeds differ.
  if(o.type==='pig'||o.type==='dog'||o.type==='turtle'){
    for(const other of obs){
      if(other===o || other.pid!==o.pid) continue;
      if(!(other.type==='pig'||other.type==='dog'||other.type==='turtle')) continue;
      if(other.x > o.x){
        const minGap = 90;
        if(other.x - (o.x + o.w) < minGap){
          other.x = o.x + o.w + minGap;
        }
      }
    }
  }

  if(o.move==='rear'){
    // Snake alternates between a very low crawling pose and a tall raised pose.
    // The long holds make the state readable at a glance.
    const t=(o.age%o.period)/o.period;
    let lift=0;
    if(t<0.30){
      lift=0; // low crawl: easy to clear with a small jump
    }else if(t<0.48){
      const u=(t-0.30)/0.18;
      lift=u*u*(3-2*u); // rise
    }else if(t<0.72){
      lift=1; // tall hold: requires a much higher jump / double jump
    }else if(t<0.90){
      const u=(t-0.72)/0.18;
      lift=1-u*u*(3-2*u); // lower
    }else{
      lift=0;
    }
    o.h=18 + lift*o.amp;
    o.y=G-o.h;
    o.rearLift=lift;
  }else if(o.move==='react'){
    // Rabbit jumps once when the player enters its reaction distance.
    if(!o.reacted && o.x-p.x < o.trigger && o.x>p.x){
      o.reacted=true;
      o.localVy=o.jumpV;
    }
    if(o.reacted){
      o.localVy+=0.62;
      o.y=(o.y??(G-o.h))+o.localVy;
      if(o.y+o.h>=G){
        o.y=G-o.h;
        o.localVy=0;
      }
    }else{
      o.y=G-o.h;
    }
  }else if(o.move==='hop'){
    // Random phase per frog. About 60% of the cycle is a jump,
    // followed by a grounded pause, so "jump over" vs "run under"
    // changes from encounter to encounter.
    const cycle=o.period*1.55;
    const t=(o.age%cycle)/cycle;
    let lift=0;
    if(t<0.60){
      const jt=t/0.60;
      lift=Math.sin(Math.PI*jt)*o.amp;
    }
    o.y=G-o.h-lift;
  }else if(o.move==='bob'){
    o.y=o.baseY+Math.sin(o.age/o.period*Math.PI*2)*o.amp;
  }
  if(!o.passed && o.x+o.w<p.x){
    o.passed=true;
    const samePatternStillAhead = obs.some(other => other.pid===o.pid && !other.passed && other.x+other.w>=p.x);
    if(!samePatternStillAhead && !passedPatterns.has(o.pid)){
      passedPatterns.add(o.pid);
      cleared++;
      if(cleared%10===0)advance();
    }
  }
  if(o.type==='gap'){
   if(p.x+p.w>o.x&&p.x<o.x+o.w&&p.y+p.h>=G-3){
     if(lariatTimer<=0){die();break}
   }
  }else{
    let oy=o.y??G-o.h;
    if(lariatEndInvuln>0)continue;
    const hits=obstacleHitboxes(o);
    const playerHit=playerHitbox();
    if(hits.some(hit=>rect(playerHit,hit))){
      if(lariatTimer>0){
        // Only on actual contact: launch this animal up-right.
        registerLariatDefeat(o);
        o.flying=true;sfxHit();
       o.flyVx=10+Math.random()*3;
       o.flyVy=-12-Math.random()*3;
       o.flyRot=(Math.random()>.5?1:-1)*(0.3+Math.random()*0.2);
       for(let i=0;i<12;i++)makeDust(o.x+o.w/2,oy+o.h/2,1);
       continue;
     }
     die();break;
   }
  }
 }
 obs=obs.filter(o=>o.x+o.w>-80 && (!o.flying || (o.y??0)<H+120));
 for(const d of dusts){d.x+=d.vx;d.y+=d.vy;d.vy+=.1;d.life--}dusts=dusts.filter(d=>d.life>0);
 if(bannerT>0&&!--bannerT){
   document.querySelector('#banner').classList.remove('show');
   if(pendingSeasonBanner)bannerGapT=24;
 }else if(bannerGapT>0&&!--bannerGapT&&pendingSeasonBanner){
   const b=document.querySelector('#banner');b.textContent=pendingSeasonBanner;b.classList.add('show');
   pendingSeasonBanner='';bannerT=85;
 }
}
function loop(token,now=performance.now()){
 if(token!==gameToken)return;
 const elapsed=Math.min(
   Math.max(0,now-lastFrameTime),
   FIXED_STEP_MS*MAX_CATCH_UP_STEPS
 );
 lastFrameTime=now;
 frameAccumulator+=elapsed;

 let steps=0;
 while(frameAccumulator>=FIXED_STEP_MS && steps<MAX_CATCH_UP_STEPS){
   if(run)update();
   else if(gameOverExplosionTimer>0 || gameOverFragments.length)updateGameOverExplosion();
   else break;
   frameAccumulator-=FIXED_STEP_MS;
   steps++;
 }
 draw();
 if(run || gameOverExplosionTimer>0 || gameOverFragments.length){
   rafId=requestAnimationFrame(nextNow=>loop(token,nextNow));
 }else{
   rafId=null;
 }
}
loadDebugSettings();
if(DEBUG_BUILD)document.querySelector('#debugBtn').classList.remove('hidden');
reset();
titleMode=true;
run=false;
document.body.classList.add('titleOnly');
document.body.classList.remove('gameOnly');
startTitleDemo();

function closePauseRanking(){
  pauseRankingOpen=false;
  document.querySelector('#scoreModal').classList.add('hidden');
  document.body.classList.remove('scoreModalOpen');
}
function showPauseMenu(){
  pauseConfirmAction=null;
  document.querySelector('#pauseConfirm').classList.add('hidden');
  document.querySelector('#pauseMenu').classList.remove('hidden');
}
function openPause(){
  if(titleMode||!run||paused)return;
  paused=true;
  if(rafId!==null){cancelAnimationFrame(rafId);rafId=null;}
  stopBgm();
  showPauseMenu();
  document.querySelector('#pauseOverlay').classList.remove('hidden');
}
function resumeFromPause(){
  if(!paused)return;
  if(pauseRankingOpen)closePauseRanking();
  paused=false;
  pauseConfirmAction=null;
  document.querySelector('#pauseOverlay').classList.add('hidden');
  resetFrameClock();
  startBgm(lariatTimer>0?'lariat':'game');
  const token=gameToken;
  if(rafId===null)rafId=requestAnimationFrame(now=>loop(token,now));
}
function requestPauseConfirmation(action){
  if(!paused)return;
  pauseConfirmAction=action;
  const restarting=action==='restart';
  document.querySelector('#pauseMenu').classList.add('hidden');
  document.querySelector('#pauseConfirm').classList.remove('hidden');
  document.querySelector('#pauseConfirmTitle').textContent=restarting?'最初からリスタートしますか？':'タイトルへ戻りますか？';
  document.querySelector('#pauseConfirmText').textContent='現在のプレイ内容は失われ、ランキングには保存されません。';
  document.querySelector('#pauseConfirmOk').textContent=restarting?'リスタート':'タイトルへ戻る';
}
function returnToTitle(){
  paused=false;pauseConfirmAction=null;
  run=false;
  titleMode=true;
  lariatTimer=0;
  lariatCooldown=0;
  lariatEndInvuln=0;

  const msg=document.querySelector('#msg');
  if(msg)msg.classList.add('hidden');
  document.querySelector('#pauseOverlay').classList.add('hidden');
  document.querySelector('#scoreModal').classList.add('hidden');
  document.querySelector('#debugModal').classList.add('hidden');
  document.querySelector('#pauseBtn').classList.add('hidden');

  pauseRankingOpen=false;
  document.body.classList.remove('gameOnly');
  document.body.classList.remove('scoreModalOpen');
  document.body.classList.add('titleOnly');
  startBgm('title');
  startTitleDemo();
}
function restartGame(){
  paused=false;pauseConfirmAction=null;pauseRankingOpen=false;
  initAudio();sfxStart();startBgm('game');
  document.querySelector('#pauseOverlay').classList.add('hidden');
  document.querySelector('#scoreModal').classList.add('hidden');
  document.body.classList.remove('scoreModalOpen');
  titleMode=false;
  document.body.classList.remove('titleOnly');
  document.body.classList.add('gameOnly');
  reset();
}

document.querySelector('#startBtn').addEventListener('pointerdown',e=>{
  e.preventDefault();
  e.stopPropagation();
  if(DEBUG_BUILD&&!commitDebugInputs(false)){
    renderDebugSettings();
    setDebugStatus('ゲームを開始するには、出現する動物を1匹以上選択してください。',true);
    document.querySelector('#debugModal').classList.remove('hidden');
    return;
  }

  initAudio();
  sfxStart();
  startBgm('game');

  document.querySelector('#scoreModal').classList.add('hidden');
  document.body.classList.remove('scoreModalOpen');
  document.querySelector('#debugModal').classList.add('hidden');
  document.body.classList.remove('titleOnly');
  document.body.classList.add('gameOnly');
  titleMode=false;
  stopTitleDemo();
  reset();
});
document.querySelector('#scoreBtn').addEventListener('pointerdown',e=>{
  e.preventDefault();
  e.stopPropagation();
  initAudio();
  sfxButton();
  showScores();
});
document.querySelector('#scoreClose').addEventListener('pointerdown',e=>{
  e.preventDefault();
  e.stopPropagation();
  sfxButton();
  if(pauseRankingOpen)closePauseRanking();
  else{
    document.querySelector('#scoreModal').classList.add('hidden');
    document.body.classList.remove('scoreModalOpen');
  }
});
document.querySelector('#debugBtn').addEventListener('pointerdown',e=>{
  e.preventDefault();e.stopPropagation();if(!DEBUG_BUILD)return;sfxButton();renderDebugSettings();setDebugStatus('');document.querySelector('#debugModal').classList.remove('hidden');
});
document.querySelector('#debugClose').addEventListener('pointerdown',e=>{
  e.preventDefault();e.stopPropagation();commitDebugInputs(false);sfxButton();document.querySelector('#debugModal').classList.add('hidden');
});
document.querySelector('#debugApply').addEventListener('pointerdown',e=>{
  e.preventDefault();e.stopPropagation();
  const hasAnimal=commitDebugInputs(false);renderDebugSettings();setDebugStatus(hasAnimal?'保存しました。次のSTARTから反映されます。':'出現する動物を1匹以上選択してください。',!hasAnimal);sfxButton();
});
document.querySelector('#debugFields').addEventListener('change',e=>{
  if(!e.target.classList.contains('debugInput'))return;commitDebugInputs(true);
});
document.querySelector('#debugAnimalChecks').addEventListener('change',e=>{
  if(!e.target.classList.contains('debugAnimalInput'))return;commitDebugInputs(true);
});
document.querySelector('#debugAnimalsAll').addEventListener('pointerdown',e=>{
  e.preventDefault();e.stopPropagation();for(const input of document.querySelectorAll('.debugAnimalInput'))input.checked=true;commitDebugInputs(true);sfxButton();
});
document.querySelector('#debugAnimalsNone').addEventListener('pointerdown',e=>{
  e.preventDefault();e.stopPropagation();for(const input of document.querySelectorAll('.debugAnimalInput'))input.checked=false;commitDebugInputs(true);sfxButton();
});
document.querySelector('#debugReset').addEventListener('pointerdown',e=>{
  e.preventDefault();e.stopPropagation();applyDebugValues(DEBUG_DEFAULT_VALUES);try{localStorage.removeItem(DEBUG_STORAGE_KEY)}catch(err){}renderDebugSettings();setDebugStatus('初期値に戻しました。');sfxButton();
});

document.querySelector('#titleReturnBtn').addEventListener('pointerdown',e=>{
  e.preventDefault();
  e.stopPropagation();sfxButton();
  returnToTitle();
});

document.querySelector('#retryBtn').addEventListener('pointerdown',e=>{
  e.preventDefault();
  e.stopPropagation();initAudio();sfxStart();startBgm('game');

  const msg=document.querySelector('#msg');
  if(msg)msg.classList.add('hidden');
  document.body.classList.remove('scoreModalOpen');

  titleMode=false;
  document.body.classList.remove('titleOnly');
  document.body.classList.add('gameOnly');
  reset();
});

document.querySelector('#gameOverScoreBtn').addEventListener('pointerdown',e=>{
  e.preventDefault();
  e.stopPropagation();
  if(!gameOverRetryReady)return;
  initAudio();sfxButton();
  document.body.classList.add('scoreModalOpen');
  showScores();
});

document.querySelector('#pauseBtn').addEventListener('pointerdown',e=>{
  e.preventDefault();e.stopPropagation();initAudio();sfxButton();openPause();
});
document.querySelector('#pauseResumeBtn').addEventListener('pointerdown',e=>{
  e.preventDefault();e.stopPropagation();sfxButton();resumeFromPause();
});
document.querySelector('#pauseScoreBtn').addEventListener('pointerdown',e=>{
  e.preventDefault();e.stopPropagation();if(!paused)return;sfxButton();pauseRankingOpen=true;document.body.classList.add('scoreModalOpen');showScores();
});
document.querySelector('#pauseRestartBtn').addEventListener('pointerdown',e=>{
  e.preventDefault();e.stopPropagation();sfxButton();requestPauseConfirmation('restart');
});
document.querySelector('#pauseTitleBtn').addEventListener('pointerdown',e=>{
  e.preventDefault();e.stopPropagation();sfxButton();requestPauseConfirmation('title');
});
document.querySelector('#pauseConfirmCancel').addEventListener('pointerdown',e=>{
  e.preventDefault();e.stopPropagation();sfxButton();showPauseMenu();
});
document.querySelector('#pauseConfirmOk').addEventListener('pointerdown',e=>{
  e.preventDefault();e.stopPropagation();
  const action=pauseConfirmAction;if(!action)return;
  if(action==='restart')restartGame();
  else{ sfxButton();returnToTitle(); }
});

document.addEventListener('pointerdown',()=>{
  initAudio();
  if(titleMode)startBgm('title');
},{once:true});
document.addEventListener('keydown',initAudio,{once:true});
document.addEventListener('keydown',e=>{
  if(e.code==='Escape'&&!e.repeat){
    if(pauseRankingOpen){sfxButton();closePauseRanking();return;}
    if(paused){sfxButton();resumeFromPause();return;}
    if(run&&!titleMode){sfxButton();openPause();return;}
  }
  if(e.code!=='KeyD' || e.repeat)return;
  debugHitboxes=!debugHitboxes;
  if(!run)draw();
});
