const c=document.querySelector('#game'),gameShell=document.querySelector('#gameShell'),x=c.getContext('2d'),W=960,H=540,G=440;
let canvasRenderScale=1;
function gameDisplayWidth(){return Math.min(1920,window.innerWidth,window.innerHeight*16/9)}
function usesTouchLayout(){return navigator.maxTouchPoints>0&&Math.min(window.innerWidth,window.innerHeight)<1000}
function updateCanvasRenderResolution(){
  // Keep game logic in the familiar 960 x 540 coordinate system, while using
  // a larger backing canvas when the PC display is larger.
  // 1.5x (1440 x 810) keeps desktop artwork crisp while avoiding the 4x
  // fill-rate cost of a full 1920 x 1080 redraw during busy seasonal scenes.
  const nextScale=Math.min(1.5,Math.max(1,gameDisplayWidth()/W));
  const nextWidth=Math.round(W*nextScale),nextHeight=Math.round(H*nextScale);
  if(c.width===nextWidth&&c.height===nextHeight){canvasRenderScale=nextScale;return}
  c.width=nextWidth;c.height=nextHeight;
  canvasRenderScale=nextScale;
  x.imageSmoothingEnabled=true;
  if('imageSmoothingQuality' in x)x.imageSmoothingQuality='high';
}
function updateDesktopUiScale(){
  const ui=document.querySelector('#ui');
  const touchLayout=usesTouchLayout();
  document.body.classList.toggle('touchLayout',touchLayout);
  // Phones keep their dedicated compact layout. On PC, the canvas and the UI
  // grow together according to the current browser window, not only F11 mode.
  if(touchLayout||window.matchMedia('(max-width:620px), (pointer:coarse)').matches){
    ui.style.removeProperty('width');ui.style.removeProperty('height');ui.style.removeProperty('transform');ui.style.removeProperty('transform-origin');
    return;
  }
  const gameWidth=gameDisplayWidth();
  const scale=Math.max(1,gameWidth/W);
  if(scale<=1.01){
    ui.style.removeProperty('width');ui.style.removeProperty('height');ui.style.removeProperty('transform');ui.style.removeProperty('transform-origin');
    return;
  }
  ui.style.width=`${100/scale}%`;
  ui.style.height=`${100/scale}%`;
  ui.style.transform=`scale(${scale})`;
  ui.style.transformOrigin='top left';
}
updateCanvasRenderResolution();
updateDesktopUiScale();
window.addEventListener('resize',()=>{updateCanvasRenderResolution();updateDesktopUiScale()});
// The title screen is the initial scene. This used to live in the removed
// title-demo script, but the game itself also relies on it for screen changes.
let titleMode=true;
let debugModeEnabled=false;
const KONAMI_COMMAND=['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','KeyB','KeyA'];
let konamiCommandIndex=0;
const sakataImg=new Image();sakataImg.src='assets/sakata.png';
function updateDebugSub(){
  const sub=document.querySelector('#sub');
  sub.innerHTML=debugModeEnabled?`<span style="color:#9ff7ff">DEBUG STAGE ${stage} / SPEED ${speed.toFixed(2)}</span><br><span style="color:#ffe45c">DEBUG ITEM NEXT ${fmt(nextItemChanceAt)}m</span>`:'';
}
function setDebugMode(enabled){
  debugModeEnabled=enabled;
  document.querySelector('#debugBtn').classList.toggle('hidden',!enabled);
  if(!enabled){
    document.querySelector('#debugModal').classList.add('hidden');
    debugHitboxes=false;
  }
  if(typeof stage==='number')updateDebugSub();
}
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
let cyclonePieces=0,cycloneState='idle',cycloneTimer=0,cycloneCountdownLabel='',cycloneSpawned=0,cycloneLanePlan=[],cycloneSpinFrames=0,cycloneResultMusicDelay=0,cycloneScoreRevealTimer=0,cycloneScoreRevealPoints=0,nextCyclonePieceAt=350;
let debugHitboxes=false;
let items=[],bananaPeels=[],crowDroppings=[],meatShield=0,rescueInvuln=0,hoverFuelFrames=0,hoverHeld=false,hoverActive=false,hoverBreakParticles=[],itemChancePending=false,itemChanceActive=false,itemChanceChosen=false,itemChanceChosenAt=0,nextItemChanceAt=600+Math.random()*200,nextChargeAt=250+Math.random()*200;
let gameOverFragments=[],gameOverExplosionTimer=0,gameOverMessageTimeout=null,playerExploded=false,gameOverRetryReady=false;
let scoreState={bonus:0,passed:0,passBonus:0,defeated:0,lariatCombo:0,lariatBonus:0};
let scoreEffects=[];
let displayedTotalScore=0,scoreGainNotices=[],nextScoreGainNoticeId=1,fastScoreCountup=false;
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
function getTotalScore(){return scoreState.bonus}
function getScores(){
  try{
    const scores=JSON.parse(localStorage.getItem('sakataPassScoreTop10V1')||'[]');
    return Array.isArray(scores)?scores.filter(record=>record&&Number.isFinite(record.totalScore)).map(record=>({totalScore:record.totalScore})).sort((a,b)=>b.totalScore-a.totalScore).slice(0,10):[];
  }catch(error){return []}
}
function saveScoreRecord(record){
  if(!record||!Number.isFinite(record.totalScore)||record.totalScore<=0)return;
  try{const scores=getScores();scores.push(record);scores.sort((a,b)=>b.totalScore-a.totalScore);localStorage.setItem('sakataPassScoreTop10V1',JSON.stringify(scores.slice(0,10)))}catch(error){}
}
const PLAY_STATS_STORAGE_KEY='sakataPlayStatsV1';
const COLLECTION_STORAGE_KEY='sakataAnimalCollectionV1';
function getCollection(){
  try{
    const saved=JSON.parse(localStorage.getItem(COLLECTION_STORAGE_KEY)||'[]');
    return new Set(Array.isArray(saved)?saved.filter(type=>ANIMAL_TYPES.includes(type)):[]);
  }catch(error){return new Set()}
}
function registerCollectionAnimal(type){
  if(!ANIMAL_TYPES.includes(type))return;
  try{
    const collection=getCollection();
    if(collection.has(type))return;
    collection.add(type);
    localStorage.setItem(COLLECTION_STORAGE_KEY,JSON.stringify([...collection]));
  }catch(error){}
}
function emptyPlayStats(){return {distanceBest:0,distanceTotal:0,passedBest:0,passedTotal:0,defeatedBest:0,defeatedTotal:0,deaths:{}}}
function getPlayStats(){
  const empty=emptyPlayStats();
  try{
    const saved=JSON.parse(localStorage.getItem(PLAY_STATS_STORAGE_KEY)||'null');
    if(!saved||typeof saved!=='object')return empty;
    for(const key of ['distanceBest','distanceTotal','passedBest','passedTotal','defeatedBest','defeatedTotal']){
      const value=Number(saved[key]);empty[key]=Number.isFinite(value)&&value>0?Math.floor(value):0;
    }
    if(saved.deaths&&typeof saved.deaths==='object')for(const type of ANIMAL_TYPES){
      const value=Number(saved.deaths[type]);if(Number.isFinite(value)&&value>0)empty.deaths[type]=Math.floor(value);
    }
  }catch(error){}
  return empty;
}
function savePlayStats(record){
  if(!record)return;
  try{
    const stats=getPlayStats();
    const distance=Math.max(0,Math.floor(Number(record.distance)||0));
    const passed=Math.max(0,Math.floor(Number(record.passed)||0));
    const defeated=Math.max(0,Math.floor(Number(record.defeated)||0));
    stats.distanceBest=Math.max(stats.distanceBest,distance);stats.distanceTotal+=distance;
    stats.passedBest=Math.max(stats.passedBest,passed);stats.passedTotal+=passed;
    stats.defeatedBest=Math.max(stats.defeatedBest,defeated);stats.defeatedTotal+=defeated;
    if(ANIMAL_TYPES.includes(record.deathCause))stats.deaths[record.deathCause]=(stats.deaths[record.deathCause]||0)+1;
    localStorage.setItem(PLAY_STATS_STORAGE_KEY,JSON.stringify(stats));
  }catch(error){}
}
function showPlayRecords(){
  const stats=getPlayStats(),table=document.querySelector('#recordStats');table.replaceChildren();
  const rows=[['移動した距離',`${fmt(stats.distanceBest)}m`,`${fmt(stats.distanceTotal)}m`],['突破した動物',fmt(stats.passedBest),fmt(stats.passedTotal)],['倒した動物',fmt(stats.defeatedBest),fmt(stats.defeatedTotal)]];
  for(const text of ['項目','最高','累計']){const cell=document.createElement('span');cell.className='recordHeader';cell.textContent=text;table.appendChild(cell)}
  for(const row of rows)for(const text of row){const cell=document.createElement('span');cell.textContent=text;table.appendChild(cell)}
  const deathList=document.querySelector('#deathList');deathList.replaceChildren();
  const names=Object.fromEntries(ANIMAL_OPTIONS);
  const deaths=ANIMAL_TYPES.map((type,index)=>({type,index,count:stats.deaths[type]||0})).sort((a,b)=>b.count-a.count||a.index-b.index);
  deaths.forEach((item,index)=>{const row=document.createElement('div');row.className='deathRow';const rank=document.createElement('span');rank.textContent=`${index+1}. ${names[item.type]||item.type}`;const count=document.createElement('span');count.textContent=`${fmt(item.count)}回`;row.append(rank,count);deathList.appendChild(row)});
  document.querySelector('#recordModal').classList.remove('hidden');
}
let collectionPreviewRaf=null,collectionPreviewFrame=0,collectionPreviewLast=0,collectionPreviewType=null;
const COLLECTION_ANIMAL_INFO={pig:'地面をまっすぐ進む',turtle:'ゆっくり地面を進む',frog:'大きくジャンプする',birds:'低い位置を群れで飛ぶ',cow:'大きな体で道をふさぐ',cat:'すばやく走り込んでくる',snake:'前に向かって伸びてくる',bats:'高い位置を群れで飛ぶ',rabbit:'近づくとジャンプする',dog:'通過後に戻ってくる',monkey:'バナナの皮を投げ捨てる',crow:'高い場所からフンを落とす'};
function collectionPreviewLength(type){return type==='turtle'?320:((type==='birds'||type==='bats')?220:200)}
function collectionPreviewObject(type,frame,playing=false){
  const sizes={pig:[64,48],turtle:[58,34],frog:[46,36],dog:[58,42],cat:[52,40],birds:[175,42],bats:[175,58],snake:[100,42],rabbit:[44,38],cow:[115,107],monkey:[60,54],crow:[68,42]};
  const [w,h]=sizes[type]||sizes.pig;
  const high=type==='crow',mid=type==='bats',cycle=frame;
  const moveSpeed=type==='turtle'?1.2:(type==='cat'?3.8:2.5);
  // The preview crop runs from x=330 to x=630, so its center is x=480.
  // Waiting animals are centered by their actual game collision width.
  let movingX=playing?630-cycle*moveSpeed:480-w/2,dogDir=-1;
  if(type==='dog'&&cycle>80){movingX=430+(cycle-80)*2.7;dogDir=1}
  const o={type,x:movingX,w,h,y:high?G-350:(mid?G-210:G-h),baseY:0,age:frame,dogDir,flying:false,flyRot:0,rearLift:0};
  o.baseY=o.y;
  if(type==='frog')o.y-=Math.max(0,Math.sin(frame*.11))*58;
  if(type==='rabbit')o.y-=Math.max(0,Math.sin(frame*.11))*48;
  if(type==='snake')o.rearLift=(Math.sin(frame*.08)+1)/2;
  if(type==='bats')o.y+=Math.sin(frame*.12)*9;
  return o;
}
function drawCollectionPreview(canvas,type,frame,playing=false){
  const saved={obs,items,bananaPeels,crowDroppings,scoreEffects};
  const preview=collectionPreviewObject(type,frame,playing),cycle=frame%155;
  obs=[preview];items=[];bananaPeels=[];crowDroppings=[];scoreEffects=[];
  if(type==='monkey'&&cycle>58){
    const t=Math.min(42,cycle-58),y=Math.min(G-4,G-65-8*t+.27*t*t);
    bananaPeels=[{x:preview.x+35+3*t,y,landed:y>=G-4}];
  }
  if(type==='crow'&&cycle>42){
    const t=Math.min(55,cycle-42),y=Math.min(G-4,preview.y+28+.34*t*t);
    crowDroppings=[{x:preview.x+32,y,landed:y>=G-4}];
  }
  draw();
  const ctx=canvas.getContext('2d'),sourceY=type==='crow'?10:(type==='bats'?G-300:G-205);
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.drawImage(c,330*canvasRenderScale,sourceY*canvasRenderScale,300*canvasRenderScale,225*canvasRenderScale,0,0,canvas.width,canvas.height);
  obs=saved.obs;items=saved.items;bananaPeels=saved.bananaPeels;crowDroppings=saved.crowDroppings;scoreEffects=saved.scoreEffects;
}
function animateCollectionPreviews(now){
  if(document.querySelector('#collectionModal').classList.contains('hidden')||!collectionPreviewType){collectionPreviewRaf=null;return}
  if(now-collectionPreviewLast>32){
    collectionPreviewLast=now;collectionPreviewFrame+=2;
    const canvas=document.querySelector(`.collectionPreview[data-animal="${collectionPreviewType}"]`);
    if(canvas)drawCollectionPreview(canvas,collectionPreviewType,collectionPreviewFrame,true);
    if(collectionPreviewFrame>=collectionPreviewLength(collectionPreviewType)){
      if(canvas)drawCollectionPreview(canvas,collectionPreviewType,0);
      collectionPreviewType=null;collectionPreviewRaf=null;return;
    }
  }
  collectionPreviewRaf=requestAnimationFrame(animateCollectionPreviews);
}
function startCollectionPreview(type){
  if(collectionPreviewType&&collectionPreviewType!==type){
    const previous=document.querySelector(`.collectionPreview[data-animal="${collectionPreviewType}"]`);
    if(previous)drawCollectionPreview(previous,collectionPreviewType,0);
  }
  collectionPreviewType=type;collectionPreviewFrame=0;collectionPreviewLast=0;
  const canvas=document.querySelector(`.collectionPreview[data-animal="${type}"]`);
  if(canvas)drawCollectionPreview(canvas,type,0,true);
  if(collectionPreviewRaf===null)collectionPreviewRaf=requestAnimationFrame(animateCollectionPreviews);
}
function stopCollectionPreviews(){collectionPreviewType=null;if(collectionPreviewRaf!==null){cancelAnimationFrame(collectionPreviewRaf);collectionPreviewRaf=null}}
function showCollection(){
  const collection=getCollection();
  const list=document.querySelector('#collectionList');list.replaceChildren();
  for(const [type,name] of ANIMAL_OPTIONS){
    const discovered=collection.has(type),card=document.createElement('div');card.className=`collectionCard${discovered?'':' locked'}`;
    const icon=discovered?document.createElement('canvas'):document.createElement('div');
    icon.className=discovered?'collectionPreview':'collectionIcon';
    if(discovered){icon.width=240;icon.height=180;icon.dataset.animal=type;drawCollectionPreview(icon,type,0)}else icon.textContent='●';
    const label=document.createElement('div');label.className='collectionName';label.textContent=discovered?name:'？？？';
    const comment=document.createElement('div');comment.className='collectionComment';comment.textContent=discovered?COLLECTION_ANIMAL_INFO[type]:'';
    card.append(icon,label,comment);
    if(discovered){const play=document.createElement('button');play.className='collectionPlay';play.type='button';play.dataset.animal=type;play.textContent='▶ 再生';card.appendChild(play)}
    list.appendChild(card);
  }
  document.querySelector('#collectionProgress').textContent=`発見した動物　${collection.size} / ${ANIMAL_TYPES.length}`;
  document.querySelector('#collectionModal').classList.remove('hidden');
}
function showScores(){
  const list=document.querySelector('#scoreList'),scores=getScores();list.innerHTML='';
  if(scores.length===0){const row=document.createElement('div');row.className='scoreRow';row.innerHTML='<span class="scoreRank">-</span><span class="scoreValue">まだ記録なし</span>';list.appendChild(row)}
  else scores.forEach((record,index)=>{const row=document.createElement('div');row.className='scoreRow';const rank=document.createElement('span');rank.className='scoreRank';rank.textContent=(index+1)+'.';const value=document.createElement('span');value.className='scoreValue';value.textContent=fmt(record.totalScore);row.append(rank,value);list.appendChild(row)});
  document.querySelector('#scoreModal').classList.remove('hidden');
}
function fmt(value){return Math.floor(value).toLocaleString('ja-JP')}
let helpDemoRaf=null,helpDemoFrame=0,helpDemoLast=0;
function drawHelpGround(ctx,w,h,metal=false){
  if(metal){const colors=['#ff4f7b','#ff914d','#ffe55c','#65e889','#52cffa','#7868ed','#c05be8'],bandHeight=34,cycle=bandHeight*colors.length,scroll=helpDemoFrame*2.8,mod=(v,s)=>((v%s)+s)%s;for(let px=0;px<w;px+=4){const movingX=px+scroll,waveOffset=mod(-movingX*.22+Math.sin(movingX/58)*7,cycle);for(let band=-8;band<9;band++){ctx.fillStyle=colors[mod(band,colors.length)];ctx.fillRect(px,band*bandHeight+waveOffset,5,bandHeight+1)}}}else{const g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,'#78bceb');g.addColorStop(.65,'#d7eaf2');g.addColorStop(.66,'#8c5b36');g.addColorStop(1,'#5b3d2e');ctx.fillStyle=g;ctx.fillRect(0,0,w,h)}ctx.fillStyle='#3f8c3a';ctx.fillRect(0,h-36,w,8);
}
function drawHelpAnimal(ctx,type,xPos,yPos,age,rotation=0){
  const sizes=type==='turtle'?[58,34]:[64,48],o={type,x:xPos,y:yPos,w:sizes[0],h:sizes[1],age,dogDir:-1};ctx.save();ctx.translate(o.x+o.w/2,o.y+o.h/2);ctx.rotate(rotation);ctx.translate(-o.w/2,-o.h/2);ctx.translate(o.w,0);ctx.scale(-1,1);drawTutorialAnimalSprite(ctx,o);ctx.restore();
}
function drawHelpSakata(ctx,xPos,yPos,rotation=0,mosh=false){ctx.save();ctx.translate(xPos,yPos);ctx.rotate(rotation);if(mosh){ctx.strokeStyle='#f4d35e';ctx.lineWidth=7;ctx.beginPath();ctx.arc(0,0,48,0,Math.PI*2);ctx.stroke()}drawSakataSprite(ctx,76);ctx.restore()}
function drawHelpMoshButton(ctx,w,h,active){const bx=w-166,by=h-78,bw=150,bh=58;ctx.fillStyle='#7a2020';ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(bx,by,bw,bh,10);ctx.fill();ctx.stroke();ctx.fillStyle='#fff';ctx.font='900 14px sans-serif';ctx.textAlign='center';ctx.fillText('坂田モッシュ',bx+bw/2,by+20);ctx.fillStyle='#3a1111';ctx.fillRect(bx+12,by+31,bw-24,7);ctx.fillStyle=active?'#f2c94c':'#eee';ctx.fillRect(bx+12,by+31,bw-24,7);ctx.fillStyle='#ddd';ctx.font='900 9px sans-serif';ctx.fillText(active?'発動中！':'READY',bx+bw/2,by+51);ctx.textAlign='start'}
function drawHelpDemo(){
  const panel=document.querySelector('[data-help-page].active'),canvas=panel?.querySelector('.helpDemo');if(!canvas)return;
  const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height,kind=canvas.dataset.helpDemo,t=helpDemoFrame,ground=h-36;ctx.clearRect(0,0,w,h);
  if(kind==='basic'){
    drawHelpGround(ctx,w,h);const cycle=t%210,first=cycle>35&&cycle<110,second=cycle>=110&&cycle<185;let y=ground-31,spin=0;if(first||second){const u=(first?(cycle-35)/75:(cycle-110)/75),frames=first?cycle-35:cycle-110;y-=Math.sin(Math.PI*u)*(first?85:112);spin=frames*.11}const animalX=430-((cycle*2.15)%500);drawHelpAnimal(ctx,'turtle',animalX,ground-34,t);drawHelpSakata(ctx,118,y,spin);ctx.fillStyle='#742020';ctx.font='900 25px sans-serif';ctx.fillText(first||second?'TAP!':'',92,34);
  }else if(kind==='mosh'){
    drawHelpGround(ctx,w,h);const phase=t%180,active=phase>76&&phase<142,n=Math.max(0,phase-76),pigX=phase<=76?400-phase*3.25:145+(10+n*.08)*n,pigY=phase<=76?ground-48:ground-48-12*n+.275*n*n;drawHelpAnimal(ctx,'pig',pigX,pigY,t,n*.38);drawHelpSakata(ctx,135,ground-31,active?t*.55:0,active);drawHelpMoshButton(ctx,w,h,active);if(active){ctx.fillStyle='#fff3a6';ctx.font='900 28px sans-serif';ctx.fillText('BOOM!',240,65)}
  }else if(kind==='metal'){
    drawHelpGround(ctx,w,h,true);for(let i=0;i<5;i++){ctx.font='30px sans-serif';ctx.fillText('🤘',44+i*80,42+Math.sin((t+i*12)*.1)*7)}for(let i=0;i<4;i++){const phase=(t*3+i*115)%190,n=Math.max(0,phase-80),pigX=phase<80?430-phase*3.5:145+(10+n*.08)*n,pigY=phase<80?ground-48:ground-48-12*n+.275*n*n;drawHelpAnimal(ctx,'pig',pigX,pigY,t+i*10,n*.38)}drawHelpSakata(ctx,145,ground-31,t*.55,true);
  }
}
function helpDemoLoop(now){const step=Math.min(3,Math.max(.5,(now-helpDemoLast)/16.667));helpDemoLast=now;helpDemoFrame+=step;drawHelpDemo();if(!document.querySelector('#helpModal').classList.contains('hidden'))helpDemoRaf=requestAnimationFrame(helpDemoLoop);else helpDemoRaf=null}
function startHelpDemo(){if(helpDemoRaf!==null)return;helpDemoLast=performance.now();helpDemoRaf=requestAnimationFrame(helpDemoLoop)}
function stopHelpDemo(){if(helpDemoRaf!==null)cancelAnimationFrame(helpDemoRaf);helpDemoRaf=null}
function itemChanceInterval(atDistance=dist){
  const range=GAME_CONFIG.itemChanceRanges.find(r=>atDistance>=r[0]&&atDistance<r[1])||GAME_CONFIG.itemChanceRanges[GAME_CONFIG.itemChanceRanges.length-1];
  return range[2]+Math.random()*(range[3]-range[2]);
}
function chargeInterval(){
  return GAME_CONFIG.chargeIntervalMin+Math.random()*(GAME_CONFIG.chargeIntervalMax-GAME_CONFIG.chargeIntervalMin);
}
function cyclonePieceInterval(){
  return GAME_CONFIG.cyclonePieceIntervalMin+Math.random()*(GAME_CONFIG.cyclonePieceIntervalMax-GAME_CONFIG.cyclonePieceIntervalMin);
}
function updateCycloneMeter(){
  const meter=document.querySelector('#cycloneMeter');
  const slots=document.querySelector('#cycloneSlots');
  if(!meter||!slots)return;
  const required=GAME_CONFIG.cycloneRequiredPieces;
  if(slots.children.length!==required){
    slots.innerHTML='';
    for(let i=0;i<required;i++){
      const slot=document.createElement('span');
      slot.className='cycloneSlot';
      const glyph=document.createElement('span');glyph.className='cycloneGlyph';glyph.textContent='🤘';
      slot.appendChild(glyph);
      slots.appendChild(slot);
    }
  }
  const charged=cycloneState==='escape';
  const visible=cycloneState==='idle'||charged;
  const filled=charged?required:Math.min(cyclonePieces,required);
  const pulseDurations=[1.6,1.6,1.3,1,.7,.28];
  meter.classList.toggle('hidden',!visible);
  meter.classList.toggle('complete',charged);
  meter.style.setProperty('--cyclone-pulse-duration',(pulseDurations[Math.min(filled,5)]||.28)+'s');
  meter.setAttribute('aria-label',`坂田メロディックスピードメタル ${filled} / ${required}`);
  const newlyFilledSlots=[];
  [...slots.children].forEach((slot,index)=>{
    const shouldFill=index<filled;
    const wasFilled=slot.classList.contains('filled');
    slot.classList.toggle('filled',shouldFill);
    if(!shouldFill)slot.classList.remove('justFilled');
    else if(!wasFilled){slot.classList.add('justFilled');newlyFilledSlots.push(slot);}
  });
  if(newlyFilledSlots.length){
    void slots.offsetWidth;
    const firstSlot=slots.querySelector('.cycloneSlot.filled');
    const referenceAnimation=firstSlot?.getAnimations().find(animation=>animation.animationName==='cycloneMeterPulse');
    if(referenceAnimation){
      for(const slot of newlyFilledSlots){
        if(slot===firstSlot)continue;
        const pulseAnimation=slot.getAnimations().find(animation=>animation.animationName==='cycloneMeterPulse');
        if(pulseAnimation)pulseAnimation.currentTime=referenceAnimation.currentTime;
      }
    }
  }
}
function updateItemHud(){
  const parts=[];
  if(meatShield>0)parts.push('🛡 GUARD');
  if(hoverFuelFrames>0)parts.push('🚀 HOVER');
  document.querySelector('#meatHud').textContent=parts.join('　');
  updateCycloneMeter();
}
function syncLariatReadyUi(){
  if(lariatCooldown>0 || lariatTimer>0)return;
  const lb=document.querySelector('#lariatBtn');
  lb.disabled=false;
  lb.classList.add('readyPulse');
  document.querySelector('#lariatFill').style.transform='scaleX(1)';
  document.querySelector('#lariatLabel').textContent='坂田モッシュ';
  document.querySelector('#lariatStatus').textContent='READY';
}
function beginItemChance(){
  itemChancePending=false;itemChanceActive=true;itemChanceChosen=false;itemChanceChosenAt=0;
  const group='choice-'+Math.floor(dist);
  const choices=['shield','speedDown','speedUp','hover'];
  for(let i=choices.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[choices[i],choices[j]]=[choices[j],choices[i]]}
  items.push({type:choices[0],group,x:W+80,y:G-185,w:46,h:46,taken:false,bob:0});
  items.push({type:choices[1],group,x:W+80,y:G-70,w:46,h:46,taken:false,bob:Math.PI});
  const b=document.querySelector('#banner');b.textContent='ITEM CHANCE';b.classList.add('show');bannerT=105;
}
function finishItemChance(){
  itemChancePending=false;itemChanceActive=false;itemChanceChosen=false;itemChanceChosenAt=0;
  nextItemChanceAt=dist+itemChanceInterval(dist);
  spawnTimer=360;
}
function showCycloneOverlay(mode,text=''){
  const overlay=document.querySelector('#cycloneOverlay');
  const cutin=document.querySelector('#cycloneCutin');
  const countdown=document.querySelector('#cycloneCountdown');
  overlay.classList.remove('hidden');
  cutin.classList.toggle('hidden',mode!=='cutin');
  countdown.classList.toggle('hidden',mode!=='countdown');
  if(mode==='countdown')countdown.textContent=text;
}
function beginCycloneCountdown(){
  obs=[];
  cycloneState='countdown';
  cycloneTimer=GAME_CONFIG.cycloneCountdownStepFrames*4;
  cycloneCountdownLabel='3';
  updateCycloneMeter();
  showCycloneOverlay('countdown','3');
}
function beginCyclonePreparation(){
  if(cycloneState!=='idle'||cyclonePieces<GAME_CONFIG.cycloneRequiredPieces||lariatTimer>0)return;
  cyclonePieces=0;
  cycloneState='escape';
  cycloneTimer=GAME_CONFIG.cycloneEscapeMaxFrames;
  cycloneSpinFrames=0;
  hoverActive=false;
  items=[];
  itemChancePending=false;itemChanceActive=false;itemChanceChosen=false;
  nextItemChanceAt=dist+itemChanceInterval(dist);
  Object.assign(p,{y:G-p.h,vy:0,jumps:0,on:true,rot:0});
  updateItemHud();
  const lb=document.querySelector('#lariatBtn');
  lb.disabled=true;
  lb.classList.remove('readyPulse');
  document.querySelector('#lariatLabel').textContent='坂田モッシュ';
  document.querySelector('#lariatStatus').textContent='メロスピ準備中';
  showCycloneOverlay('cutin');
  stopBgm();sfxThunder();
}
function spawnCycloneTarget(){
  const defs={pig:[64,48],turtle:[58,34],frog:[46,36],dog:[58,42],cat:[52,40],birds:[175,42],bats:[175,58],snake:[86,42],rabbit:[44,38],cow:[115,107],monkey:[60,54]};
  const enabled=ANIMAL_TYPES.filter(type=>debugEnabledAnimals.has(type));
  const lane=cycloneLanePlan[cycloneSpawned]||'ground';
  const laneTypes={ground:['pig','turtle','cat','dog','cow','snake','monkey'],mid:['birds','frog','rabbit','cat'],high:['bats','birds','frog','rabbit']};
  const candidates=laneTypes[lane].filter(type=>debugEnabledAnimals.has(type));
  const pool=candidates.length?candidates:enabled;
  const type=pool[Math.floor(Math.random()*pool.length)]||'pig';
  registerCollectionAnimal(type);
  const [w,h]=defs[type]||defs.pig;
  const targetY=lane==='high'?120:(lane==='mid'?250:G-h);
  obs.push({x:W+40,type,w,h,y:targetY,baseY:targetY,passed:false,pid:-1,move:null,amp:0,period:1,extra:0,trigger:0,jumpV:0,reacted:false,localVy:0,speedMul:1,patrolAmp:0,patrolPeriod:1,dogDir:0,dogTurnLeft:0,dogTurnRight:0,age:0,prevPatrol:0,flying:false,flyVx:0,flyVy:0,flyRot:0,defeated:false,cyclone:true,cycloneLane:lane});
  cycloneSpawned++;
}
function startCycloneBonus(){
  cycloneState='active';cycloneSpawned=0;
  fastScoreCountup=true;
  const targetCount=GAME_CONFIG.cycloneTargetCount;
  const groundCount=Math.round(targetCount*.4),midCount=Math.round(targetCount/3);
  cycloneLanePlan=[...Array(groundCount).fill('ground'),...Array(midCount).fill('mid'),...Array(Math.max(0,targetCount-groundCount-midCount)).fill('high')];
  for(let i=cycloneLanePlan.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[cycloneLanePlan[i],cycloneLanePlan[j]]=[cycloneLanePlan[j],cycloneLanePlan[i]];}
  document.querySelector('#cycloneOverlay').classList.add('hidden');
  lariatTimer=GAME_CONFIG.cycloneDurationFrames;
  lariatEndInvuln=0;
  scoreState.lariatCombo=0;scoreState.lariatBonus=0;
  const lb=document.querySelector('#lariatBtn');
  lb.disabled=true;lb.classList.remove('activeNow','readyPulse');
  // Keep the Mosh gauge visible. Its cooldown is deliberately paused during
  // Melo-Spi, so the fill level remains exactly as it was before the bonus.
  document.querySelector('#lariatLabel').textContent='坂田モッシュ';
  document.querySelector('#lariatStatus').textContent='メロスピ中！';
  sfxLariat();startBgm('cyclone');
}
function finishCycloneScoring(){
  const combo=scoreState.lariatCombo,bonus=scoreState.lariatBonus;
  scoreEffects=scoreEffects.filter(effect=>effect.type!=='combo');
  scoreEffects.push({type:'cycloneResult',combo,bonus,life:GAME_CONFIG.cycloneResultDisplayFrames,maxLife:GAME_CONFIG.cycloneResultDisplayFrames});
  cycloneScoreRevealTimer=GAME_CONFIG.cycloneResultDisplayFrames;
  cycloneScoreRevealPoints=bonus;
  stopBgm();
  sfxCycloneResult();
  cycloneResultMusicDelay=GAME_CONFIG.cycloneResultFanfareFrames;
  scoreState.lariatCombo=0;scoreState.lariatBonus=0;
  obs=obs.filter(o=>!o.cyclone);
  cycloneState='idle';cycloneTimer=0;cycloneSpawned=0;cycloneLanePlan=[];cycloneSpinFrames=0;
  nextCyclonePieceAt=dist+cyclonePieceInterval();
  spawnTimer=180;
  document.querySelector('#lariatLabel').textContent='坂田モッシュ';
  updateItemHud();
}
function updateCyclonePreparation(){
  updateScoreEffects();
  if(cycloneState==='escape'){
    cycloneSpinFrames=Math.min(GAME_CONFIG.cycloneSpinUpFrames,cycloneSpinFrames+1);
    const spinProgress=cycloneSpinFrames/Math.max(1,GAME_CONFIG.cycloneSpinUpFrames);
    const easedSpin=spinProgress*spinProgress;
    const spinSpeed=GAME_CONFIG.cycloneSpinStartSpeed+(GAME_CONFIG.cycloneSpinSpeed-GAME_CONFIG.cycloneSpinStartSpeed)*easedSpin;
    p.rot+=spinSpeed;
    for(const o of obs)o.x-=speed*2;
    obs=obs.filter(o=>o.x+o.w>-80);
    cycloneTimer--;
    const enemiesReady=obs.length===0||cycloneTimer<=0;
    const spinReady=cycloneSpinFrames>=GAME_CONFIG.cycloneSpinUpFrames;
    if(enemiesReady&&spinReady)beginCycloneCountdown();
    return;
  }
  p.rot+=GAME_CONFIG.cycloneSpinSpeed;
  cycloneTimer--;
  const step=GAME_CONFIG.cycloneCountdownStepFrames;
  const elapsed=step*4-cycloneTimer;
  const label=['3','2','1','GO!'][Math.min(3,Math.floor(elapsed/step))];
  if(label!==cycloneCountdownLabel){cycloneCountdownLabel=label;showCycloneOverlay('countdown',label);sfxButton();}
  if(cycloneTimer<=0)startCycloneBonus();
}

function reset(){
 titleMode=false;
 paused=false;pauseConfirmAction=null;pauseRankingOpen=false;
 cyclonePieces=0;cycloneState='idle';cycloneTimer=0;cycloneCountdownLabel='';cycloneSpawned=0;cycloneLanePlan=[];cycloneSpinFrames=0;cycloneResultMusicDelay=0;cycloneScoreRevealTimer=0;cycloneScoreRevealPoints=0;nextCyclonePieceAt=cyclonePieceInterval();
 document.querySelector('#pauseOverlay').classList.add('hidden');
 document.querySelector('#cycloneOverlay').classList.add('hidden');
 document.body.classList.remove('titleOnly');document.body.classList.add('gameOnly');
 gameToken++;
 if(rafId!==null){cancelAnimationFrame(rafId);rafId=null;}
 if(gameOverMessageTimeout!==null){clearTimeout(gameOverMessageTimeout);gameOverMessageTimeout=null;}
 run=true;
 dist=0;cleared=0;stage=GAME_CONFIG.startStage;speed=GAME_CONFIG.initialSpeed;spawnTimer=100;groundOffset=0;lariatTimer=0;lariatCooldown=0;lariatEndInvuln=0;thunderLatch=false;
 items=[];bananaPeels=[];crowDroppings=[];meatShield=0;rescueInvuln=0;hoverFuelFrames=0;hoverHeld=false;hoverActive=false;hoverBreakParticles=[];itemChancePending=false;itemChanceActive=false;itemChanceChosen=false;itemChanceChosenAt=0;nextItemChanceAt=itemChanceInterval(0);nextChargeAt=chargeInterval();
 obs=[];dusts=[];bannerT=0;bannerGapT=0;pendingSeasonBanner='';patternSeq=0;passedPatterns=new Set();animalSpawnCounts=Object.fromEntries(ANIMAL_TYPES.map(type=>[type,0]));
 gameOverFragments=[];gameOverExplosionTimer=0;playerExploded=false;gameOverRetryReady=false;
 scoreState={bonus:0,passed:0,passBonus:0,defeated:0,lariatCombo:0,lariatBonus:0};scoreEffects=[];
 displayedTotalScore=0;scoreGainNotices=[];nextScoreGainNoticeId=1;fastScoreCountup=false;
 Object.assign(p,{y:G-p.h,vy:0,jumps:0,on:true,rot:0});
 document.querySelector('#msg').classList.add('hidden');
 document.querySelector('#banner').classList.remove('show');
 document.querySelector('#scoreValue').textContent='0';
 document.querySelector('#scoreGain').replaceChildren();
 updateDebugSub();
 updateItemHud();
  const lb=document.querySelector('#lariatBtn');
  lb.disabled=false;
 document.querySelector('#pauseBtn').classList.remove('hidden');
 
 document.querySelector('#lariatLabel').textContent='坂田モッシュ';
 document.querySelector('#lariatStatus').textContent='READY';
 document.querySelector('#lariatFill').style.transform='scaleX(1)';
 document.querySelector('#activeFill').style.transform='scaleX(1)';
  lb.classList.remove('activeNow');
  lb.classList.add('readyPulse');
 spawnPattern();
 const token=gameToken;
 resetFrameClock();
 rafId=requestAnimationFrame(now=>loop(token,now));
}
function jump(){
 if(titleMode||paused||cycloneState==='escape'||cycloneState==='countdown')return;
 if(!run){
   if(!gameOverRetryReady)return;
   gameOverRetryReady=false;initAudio();sfxStart();startBgm('game');reset();return;
 }
 if(p.jumps<2){p.vy=p.jumps? -13.0:-14.8;p.jumps++;sfxJump();p.on=false;makeDust(p.x+10,p.y+p.h,3)}
}
function useLariat(){
 if(!run||paused)return;
 if(cycloneState!=='idle'||lariatCooldown>0||lariatTimer>0)return;
 lariatTimer=GAME_CONFIG.lariatDurationFrames;
  lariatCooldown=GAME_CONFIG.lariatCooldownFrames;updateItemHud();
 lariatEndInvuln=0;
 scoreState.lariatCombo=0;scoreState.lariatBonus=0;
 sfxLariat();
 startBgm('lariat');
  const lb=document.querySelector('#lariatBtn');
  lb.disabled=true;
  lb.classList.add('activeNow');
  lb.classList.remove('readyPulse');
 document.querySelector('#lariatStatus').textContent='発動中！';
 document.querySelector('#lariatFill').style.transform='scaleX(0)';
 document.querySelector('#activeFill').style.transform='scaleX(1)';
}
function registerLariatDefeat(o){
  if(o.defeated)return;
  o.defeated=true;
  scoreState.lariatCombo++;
  const cycloneActive=cycloneState==='active';
  const index=scoreState.lariatCombo-1;
  const points=cycloneActive
    ? GAME_CONFIG.cycloneDefeatBaseScore+Math.min(index*GAME_CONFIG.cycloneComboStepScore,GAME_CONFIG.cycloneComboBonusCap)
    : GAME_CONFIG.lariatDefeatScore;
  scoreState.lariatBonus+=points;
  scoreState.bonus+=points;
  scoreState.defeated++;
  if(!cycloneActive)scoreGainNotices.push({id:nextScoreGainNoticeId++,points,life:55});
  if(cycloneActive){
    scoreEffects=scoreEffects.filter(e=>e.type!=='combo');
    scoreEffects.push({type:'combo',combo:scoreState.lariatCombo,life:68,maxLife:68});
  }
}
function finishLariatScoring(){
  scoreState.lariatCombo=0;scoreState.lariatBonus=0;
}
function updateScoreEffects(){
  for(const effect of scoreEffects)effect.life--;
  scoreEffects=scoreEffects.filter(effect=>effect.life>0);
  if(cycloneScoreRevealTimer>0){
    cycloneScoreRevealTimer--;
    if(cycloneScoreRevealTimer===0&&cycloneScoreRevealPoints>0){
      scoreGainNotices.push({id:nextScoreGainNoticeId++,points:cycloneScoreRevealPoints,life:55});
      cycloneScoreRevealPoints=0;
    }
  }
  const holdCycloneScore=cycloneState==='active'||cycloneScoreRevealTimer>0;
  if(!holdCycloneScore){
    if(displayedTotalScore<getTotalScore())displayedTotalScore+=Math.min(fastScoreCountup?10:1,getTotalScore()-displayedTotalScore);
    else if(cycloneState!=='active')fastScoreCountup=false;
  }
  scoreGainNotices.forEach(notice=>notice.life--);
  scoreGainNotices=scoreGainNotices.filter(notice=>notice.life>0);
}
document.addEventListener('pointerdown',e=>{
  // Left click / touch = jump. Right press activates Sakata Mosh immediately.
  // The whole browser viewport is the jump pad during play, including the
  // black side margins in landscape.  Actual controls and overlays stay out.
  if(!document.body.classList.contains('gameOnly')||e.target.closest('button,#msg,#pauseOverlay,#scoreModal,#recordModal,#collectionModal,#helpModal,#debugModal'))return;
  e.preventDefault();
  if(e.pointerType==='touch')gameShell.setPointerCapture(e.pointerId);
  if(e.button===2){useLariat();return;}
  hoverHeld=true;
  jump();
});
gameShell.addEventListener('pointerup',e=>{hoverHeld=false;if(gameShell.hasPointerCapture(e.pointerId))gameShell.releasePointerCapture(e.pointerId)});
gameShell.addEventListener('pointercancel',e=>{hoverHeld=false;if(gameShell.hasPointerCapture(e.pointerId))gameShell.releasePointerCapture(e.pointerId)});
c.addEventListener('selectstart',e=>e.preventDefault());
c.addEventListener('dragstart',e=>e.preventDefault());
document.addEventListener('dblclick',e=>e.preventDefault(),{passive:false});
window.addEventListener('pointerup',()=>{hoverHeld=false});
window.addEventListener('blur',()=>{hoverHeld=false});
document.addEventListener('contextmenu',e=>{
  // Suppress the browser menu. Activation already happened on pointerdown.
  if(document.body.classList.contains('gameOnly'))e.preventDefault();
});
document.querySelector('#lariatBtn').addEventListener('pointerdown',e=>{e.stopPropagation();e.preventDefault();useLariat()});

function makeDust(px,py,n){for(let i=0;i<n;i++)dusts.push({x:px,y:py,vx:-Math.random()*2,vy:-1-Math.random()*2,life:30})}
function breakHoverDevice(){
  const bx=p.x+2,by=p.y+25;
  for(let i=0;i<12;i++){
    const life=16+Math.floor(Math.random()*9);
    hoverBreakParticles.push({x:bx+(Math.random()-.5)*10,y:by+(Math.random()-.5)*12,vx:(Math.random()-.5)*4,vy:-1.5-Math.random()*3,life,maxLife:life,size:2+Math.random()*3,hot:i<5});
  }
}
function rect(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y}
function playerHitbox(){return {x:p.x+11,y:p.y+9,w:p.w-20,h:p.h-15}}
function obstacleHitboxes(o){
  const oy=o.y??G-o.h;
  if(o.type==='birds')return [{x:o.x+44,y:oy+10,w:112,h:22}];
  if(o.type==='bats')return [{x:o.x+7,y:oy+3,w:o.w-14,h:o.h-7}];
  if(o.type==='crow')return [{x:o.x+10,y:oy+6,w:o.w-20,h:o.h-12}];
  if(o.type==='snake'){
    const lift=o.rearLift||0;
    const baseY=oy+o.h-7;
    // Snake art is mirrored to face left, so these coordinates mirror the
    // drawing's local body, neck, and head positions.
    const anchorX=o.x+o.w*.32,anchorY=baseY-2;
    const headX=o.x+o.w*(.20-.35*lift),headY=baseY-(1+lift*o.h*.70);
    const hits=[{x:o.x+o.w*.32,y:baseY-11,w:o.w*.67,h:12}];
    for(let i=1;i<=4;i++){
      const t=i/4,cx=anchorX+(headX-anchorX)*t,cy=anchorY+(headY-anchorY)*t;
      hits.push({x:cx-6,y:cy-6,w:12,h:12});
    }
    hits.push({x:headX-11,y:headY-8,w:22,h:16});
    return hits;
  }
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
 // Prepare the next season one stage early, outside the active game frame.
 // That avoids a one-frame hitch when the visible season actually changes.
 if(stage%4===0){
   const warm=()=>warmSeasonStaticLayer((season()+1)%4);
   if('requestIdleCallback' in window)window.requestIdleCallback(warm,{timeout:1000});else setTimeout(warm,0);
 }
}
function registerAnimalPass(o){
 const basePoints=GAME_CONFIG.passScores[o.type]||0;
 if(basePoints<=0)return;
 const speedMultiplier=Math.min(GAME_CONFIG.passSpeedMultiplierCap,speed/GAME_CONFIG.initialSpeed);
 const points=Math.round(basePoints*speedMultiplier);
 scoreState.passed++;
  scoreState.passBonus+=points;
  scoreState.bonus+=points;
  scoreGainNotices.push({id:nextScoreGainNoticeId++,points,life:55});
}
function throwMonkeyBanana(o){
  o.bananaThrown=true;
  bananaPeels.push({x:o.x+o.w*.55,y:(o.y??G-o.h)+o.h*.32,vy:-11.5,throwVx:2.5,landed:false,life:240});
}
function dropCrowPoop(o){
  o.droppingThrown=true;
  crowDroppings.push({x:o.x+o.w*.48,y:(o.y??G-o.h)+o.h*.70,vy:0,landed:false,life:230});
}
function resolvePatternMember(o){
 if(o.cyclone||o.pid<0||o.passed)return;
 o.passed=true;
 const unresolvedMember=obs.some(other=>other.pid===o.pid&&!other.passed);
 if(!unresolvedMember&&!passedPatterns.has(o.pid)){
   passedPatterns.add(o.pid);
   cleared++;
   if(cleared%10===0)advance();
 }
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
  [{d:0,t:'snake',w:100,h:18,move:'rear',amp:80,period:150}],
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
  [{d:0,t:'rabbit',w:44,h:38,move:'react',trigger:260,jumpV:-12.5},{d:320,t:'snake',w:100,h:18,move:'rear',amp:80,period:150}]
 ];
 const compound=[
  // Clear the cow with one jump and land to run under the bats. A needless
  // second jump keeps the player airborne long enough to collide with them.
  [{d:0,t:'cow',w:115,h:107},{d:260,t:'bats',w:175,h:58,y:G-210,move:'bob',amp:8,period:78}],
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
  [{d:0,t:'cat',w:52,h:40},{d:300,t:'birds',w:175,h:42,y:G-72}],
  // Monkey leaves a banana peel behind after it has safely passed.
  [{d:0,t:'monkey',w:60,h:54}],
  // Crow stays far above jump height and drops a ground hazard.
  [{d:0,t:'crow',w:68,h:42,y:G-350}]
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
 // A fast cat can otherwise reach the player while the tail of a high bat
 // flock is still overhead, demanding both "stay low" and "jump" at once.
 // Predict both arrival times and preserve a short reaction window after the
 // bats have fully passed. This scales with the current stage speed.
 if(pat.some(entry=>entry.t==='cat')){
   const activeBats=obs.filter(o=>o.type==='bats'&&!o.flying&&o.x+o.w>p.x);
   if(activeBats.length){
     const rightmostBat=Math.max(...activeBats.map(o=>o.x+o.w));
     const batTailFrames=Math.max(0,(rightmostBat-p.x)/speed);
     const catSpeed=speed*GAME_CONFIG.catSpeedMultiplier;
     const safeCatBase=p.x+catSpeed*(batTailFrames+GAME_CONFIG.catAfterBatsSafeFrames);
     base=Math.max(base,safeCatBase);
   }
 }
 let max=0;
 const pid=patternSeq++;
 for(const q of pat){
   animalSpawnCounts[q.t]=(animalSpawnCounts[q.t]||0)+1;
   registerCollectionAnimal(q.t);
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
    speedMul:q.t==='turtle'?0.82:(q.t==='cow'?0.92:(q.t==='pig'?1.02:(q.t==='cat'?GAME_CONFIG.catSpeedMultiplier:1))),
     patrolAmp:q.t==='dog'?42:0,
     patrolPeriod:q.t==='dog'?115:1,
     dogDir:q.t==='dog'?-1:0,
    dogTurnLeft:q.t==='dog'?250:0,
    dogTurnRight:q.t==='dog'?430:0,
    crowDropLeadFrames:q.t==='crow'?30+Math.random()*30:0,
    baseY:q.y??(G-q.h),
     age:q.move==='hop' ? Math.random()*(q.period||110) : Math.floor(Math.random()*60),
     prevPatrol:0,
      flying:false,flyVx:0,flyVy:0,flyRot:0,defeated:false
   });
   max=Math.max(max,q.d+q.w)
 }
 spawnTimer=(base-(W+50))+max+220+Math.random()*90;
}

function die(deathCause){
 // Every hazard, including bananas and crow droppings, respects the same
 // post-Mosh invulnerability window as animal bodies.
 if(lariatTimer>0 || lariatEndInvuln>0 || rescueInvuln>0)return;
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
  saveScoreRecord({totalScore});
  savePlayStats({distance:score,passed:scoreState.passed,defeated:scoreState.defeated,deathCause});
  document.querySelector('#gameOverContent').innerHTML=`
    <b class="gameOverTitle">GAME OVER</b>
    <div class="gameOverTotalLabel">TOTAL SCORE</div>
    <div class="gameOverTotal">${fmt(totalScore)}</div>
    <div class="gameOverStats">
      <span class="gameOverStatLabel">移動した距離</span><span class="gameOverStatValue">${fmt(score)}m</span>
      <span class="gameOverStatLabel">突破した動物の数</span><span class="gameOverStatValue">${fmt(scoreState.passed)}</span>
      <span class="gameOverStatLabel">倒した動物の数</span><span class="gameOverStatValue">${fmt(scoreState.defeated)}</span>
    </div>`;
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
 if(cycloneState==='escape'||cycloneState==='countdown'){updateCyclonePreparation();return;}
 const cycloneActive=cycloneState==='active';
 if(cycloneResultMusicDelay>0){
   cycloneResultMusicDelay--;
   if(cycloneResultMusicDelay===0&&!titleMode&&run&&!paused)startBgm('game');
 }
 if(!cycloneActive){
   const distanceStep=speed/12;
   dist+=distanceStep;
   // ITEM CHANCE is a detour, not normal road progress. Keep the remaining
   // distance to METAL and CHARGE unchanged while the choice is on screen.
   if(itemChanceActive){
     nextCyclonePieceAt+=distanceStep;
     nextChargeAt+=distanceStep;
   }
 }
 // Keep the background timeline continuous. Seasonal scenery handles its own
 // off-screen looping, so resetting this value would visibly teleport it.
 groundOffset+=speed;
 if(!cycloneActive&&!itemChanceActive&&!itemChancePending)spawnTimer-=speed;
 updateScoreEffects();
 if(rescueInvuln>0)rescueInvuln--;
 if(lariatEndInvuln>0)lariatEndInvuln--;
 if(!cycloneActive&&dist>=nextItemChanceAt-GAME_CONFIG.itemChanceLeadMeters&&!itemChanceActive)itemChancePending=true;
 if(!cycloneActive&&itemChancePending&&dist>=nextItemChanceAt&&obs.length===0&&items.length===0)beginItemChance();
 if(!cycloneActive&&!itemChanceActive&&!itemChancePending&&cyclonePieces<GAME_CONFIG.cycloneRequiredPieces&&dist>=nextCyclonePieceAt&&!items.some(it=>it.type==='cyclonePiece'||it.type==='roadCharge')){
   items.push({type:'cyclonePiece',group:null,x:W+80,y:G-125,w:46,h:46,taken:false,bob:0});
   nextCyclonePieceAt=dist+cyclonePieceInterval();
 }
 if(!cycloneActive&&!itemChanceActive&&!itemChancePending&&lariatCooldown>0&&dist>=nextChargeAt&&!items.some(it=>it.type==='roadCharge'||it.type==='cyclonePiece')){
   items.push({type:'roadCharge',group:null,x:W+80,y:G-125,w:46,h:46,taken:false,bob:0});
   nextChargeAt=dist+chargeInterval();
 }
 for(const it of items){it.x-=speed;it.bob+=.08*Math.max(1,speed/6)}
 items=items.filter(it=>!it.taken && it.x+it.w>-60);
 if(!cycloneActive&&itemChanceActive&&!itemChanceChosen&&items.length===0){itemChanceChosen=true;itemChanceChosenAt=dist}
 if(!cycloneActive&&itemChanceActive&&itemChanceChosen&&dist-itemChanceChosenAt>=GAME_CONFIG.itemChanceExitMeters)finishItemChance();
 if(cycloneActive){
   const elapsed=GAME_CONFIG.cycloneDurationFrames-lariatTimer;
   const spawnInterval=Math.max(1,Math.floor(GAME_CONFIG.cycloneDurationFrames*.8/Math.max(1,GAME_CONFIG.cycloneTargetCount-1)));
   while(cycloneSpawned<GAME_CONFIG.cycloneTargetCount&&elapsed>=cycloneSpawned*spawnInterval)spawnCycloneTarget();
 }
     if(lariatTimer>0){
   lariatTimer--;
   const activeFill=document.querySelector('#activeFill');
   const activeDuration=cycloneActive?GAME_CONFIG.cycloneDurationFrames:GAME_CONFIG.lariatDurationFrames;
   activeFill.style.transform='scaleX('+Math.max(0,lariatTimer/activeDuration)+')';
   if(lariatTimer===0){
     lariatEndInvuln=GAME_CONFIG.lariatEndInvulnFrames;
     if(cycloneActive)finishCycloneScoring();else finishLariatScoring();
     const lb=document.querySelector('#lariatBtn');
     lb.classList.remove('activeNow');
     activeFill.style.transform='scaleX(0)';
     if(lariatCooldown>0)document.querySelector('#lariatStatus').textContent='COOLDOWN';
     else syncLariatReadyUi();
     if(!titleMode&&run&&!cycloneActive)startBgm('game');
   }
 }
 if(lariatCooldown>0&&!cycloneActive){
   lariatCooldown--;
   const lb=document.querySelector('#lariatBtn');
   const fill=document.querySelector('#lariatFill');
   const ready=1-(lariatCooldown/GAME_CONFIG.lariatCooldownFrames);
   fill.style.transform='scaleX('+Math.max(0,Math.min(1,ready))+')';
   if(lariatCooldown>0){
     lb.disabled=true;
     lb.classList.remove('readyPulse');
     if(lariatTimer<=0){
       
       document.querySelector('#lariatStatus').textContent='COOLDOWN';
     }
   }else{
     fill.style.transform='scaleX(1)';
     if(lariatTimer<=0)syncLariatReadyUi();
   }
 }
 if(!cycloneActive&&cycloneState==='idle'&&cyclonePieces>=GAME_CONFIG.cycloneRequiredPieces&&lariatTimer<=0){
   beginCyclonePreparation();
   return;
 }
 // A monkey encounter is not finished until its banana has left the course.
 // This prevents the next animal pattern from stacking on top of that hazard.
 if(!cycloneActive&&!itemChanceActive&&!itemChancePending&&spawnTimer<=0&&bananaPeels.length===0)spawnPattern();
 // The world scroll and animal actions share this scale. Without it, a fast
 // scroll lets moving hazards (especially the rabbit) pass before acting.
 // Use the normal gameplay baseline (speed 6), not the configurable starting
 // speed. In debug, starting directly at speed 10 must still accelerate animal
 // actions to 10 / 6 times their normal rate.
 const timeScale=Math.max(1,speed/6);
 hoverActive=hoverFuelFrames>0&&hoverHeld&&!p.on&&p.vy>=-1;
 if(hoverActive){
   p.vy=0;
   hoverFuelFrames--;
   if(hoverFuelFrames===0){breakHoverDevice();updateItemHud()}
 }else p.vy+=.67*timeScale;
 p.y+=p.vy*timeScale;
 if(p.y+p.h>=G){p.y=G-p.h;p.vy=0;if(!p.on)makeDust(p.x+8,G,5);p.on=true;p.jumps=0;hoverActive=false}else p.on=false;
 if(cycloneActive)p.rot+=GAME_CONFIG.cycloneSpinSpeed;
 else if(hoverFuelFrames>0)p.rot=0;
 else p.rot=p.on?0:p.rot+.11;

 // Rescue shield pickup
 for(const it of items){
   const itemHit={x:it.x+3,y:it.y+3,w:it.w-6,h:it.h-6};
   const playerHit={x:p.x+11,y:p.y+9,w:p.w-20,h:p.h-15};
   const choiceItem=it.type==='shield'||it.type==='speedDown'||it.type==='speedUp'||it.type==='hover';
   if((!choiceItem||!itemChanceChosen) && !it.taken && rect(playerHit,itemHit)){
     it.taken=true;
     if(choiceItem){itemChanceChosen=true;itemChanceChosenAt=dist}
     if(it.type==='shield'){
       meatShield=1;
       scoreEffects.push({type:'itemNotice',text:'🛡 GUARD',color:'#d9efff',life:90,maxLife:90});
     }
     else if(it.type==='roadCharge'){
       lariatCooldown=Math.max(0,lariatCooldown-GAME_CONFIG.lariatCooldownFrames*GAME_CONFIG.chargeRecoveryRatio);
       syncLariatReadyUi();
       scoreEffects.push({type:'itemNotice',text:`⚡ CHARGE +${Math.round(GAME_CONFIG.chargeRecoveryRatio*100)}%`,color:'#ffe45c',life:90,maxLife:90});
     }
     else if(it.type==='cyclonePiece'){
       cyclonePieces=Math.min(GAME_CONFIG.cycloneRequiredPieces,cyclonePieces+1);
     }
     else if(it.type==='speedDown'){
       speed=Math.max(GAME_CONFIG.minSpeed,speed-GAME_CONFIG.speedStep*GAME_CONFIG.speedDownSteps);
       scoreEffects.push({type:'itemNotice',text:'🐢 SPEED DOWN',color:'#b9ff9f',life:90,maxLife:90});
     }
     else if(it.type==='speedUp'){
       speed=Math.min(GAME_CONFIG.maxSpeed,speed+GAME_CONFIG.speedStep*GAME_CONFIG.speedUpSteps);
       scoreEffects.push({type:'itemNotice',text:'🐈 SPEED UP',color:'#ffd17c',life:90,maxLife:90});
     }
     else if(it.type==='hover'){
       hoverFuelFrames=GAME_CONFIG.hoverDurationFrames;
       p.rot=0;
       scoreEffects.push({type:'itemNotice',text:'🚀 HOVER',color:'#9fefff',life:90,maxLife:90});
     }
     updateItemHud();
     sfxButton();
   }
 }
 if(!cycloneActive&&cycloneState==='idle'&&cyclonePieces>=GAME_CONFIG.cycloneRequiredPieces&&lariatTimer<=0){
   beginCyclonePreparation();
   return;
 }

 for(const o of obs){
  const simScale=timeScale;
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

  if(o.cyclone){
    o.x-=Math.max(14,speed*2);
  }else if(o.type==='dog'){
    // Real patrol: dog runs toward the player, turns around, runs away, then returns.
    // The whole course still scrolls left, but the dog has its own signed movement.
    const dogSpeed=2.4*timeScale;
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

  // The monkey throws before it passes Sakata. The lead scales with speed so
  // the high arc still lands soon after the monkey has passed at late stages.
  if(!o.cyclone&&o.type==='monkey'&&!o.bananaThrown&&o.x>p.x&&o.x-p.x<=speed*48)throwMonkeyBanana(o);
  if(!o.cyclone&&o.type==='crow'&&!o.droppingThrown&&o.x>p.x&&o.x-p.x<=speed*(o.crowDropLeadFrames||48))dropCrowPoop(o);

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
    // Keep the familiar reaction distance; only the jump itself speeds up.
    if(!o.reacted && o.x-p.x < o.trigger && o.x>p.x){
      o.reacted=true;
      o.localVy=o.jumpV;
    }
    if(o.reacted){
      o.localVy+=0.62*timeScale;
      o.y=(o.y??(G-o.h))+o.localVy*timeScale;
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
  const safelyPassed=obstacleHitboxes(o).every(hit=>hit.x+hit.w<=playerHitbox().x);
  if(!o.cyclone&&!o.passed&&safelyPassed){
    registerAnimalPass(o);
    resolvePatternMember(o);
  }
  let oy=o.y??G-o.h;
  if(lariatEndInvuln>0)continue;
  const hits=obstacleHitboxes(o);
  const playerHit=playerHitbox();
  if(hits.some(hit=>rect(playerHit,hit))){
    if(lariatTimer>0){
      // Only on actual contact: launch this animal up-right.
      registerLariatDefeat(o);
      resolvePatternMember(o);
      o.flying=true;sfxHit();
      o.flyVx=10+Math.random()*3;
      o.flyVy=-12-Math.random()*3;
      o.flyRot=(Math.random()>.5?1:-1)*(0.3+Math.random()*0.2);
      for(let i=0;i<12;i++)makeDust(o.x+o.w/2,oy+o.h/2,1);
      continue;
    }
    die(o.type);break;
  }
 }
 obs=obs.filter(o=>o.x+o.w>-80 && (!o.flying || (o.y??0)<H+120));
 for(const peel of bananaPeels){
   if(!peel.landed){
     peel.x+=peel.throwVx*timeScale-speed;
     peel.y+=peel.vy*timeScale;
     peel.vy+=.58*timeScale;
     if(peel.y>=G-10){peel.y=G-10;peel.landed=true;peel.vy=0}
   }else peel.x-=speed;
   peel.life--;
   if(peel.landed&&!peel.used&&rect(playerHitbox(),{x:peel.x+3,y:peel.y-7,w:28,h:9})){
     peel.used=true;
     die('monkey');
   }
 }
 bananaPeels=bananaPeels.filter(peel=>!peel.used&&peel.life>0&&peel.x>-50&&peel.x<W+80);
 for(const dropping of crowDroppings){
   dropping.x-=speed;
   if(!dropping.landed){
     dropping.y+=dropping.vy*timeScale;
     dropping.vy+=.55*timeScale;
     if(dropping.y>=G-9){dropping.y=G-9;dropping.landed=true;dropping.vy=0}
   }
   dropping.life--;
   const droppingHitbox=dropping.landed
     ? {x:dropping.x+3,y:dropping.y-8,w:22,h:10}
     : {x:dropping.x+4,y:dropping.y-6,w:12,h:12};
   if(!dropping.used&&rect(playerHitbox(),droppingHitbox)){
     dropping.used=true;
     die('crow');
   }
 }
 crowDroppings=crowDroppings.filter(dropping=>!dropping.used&&dropping.life>0&&dropping.x>-50&&dropping.x<W+80);
 for(const d of dusts){d.x+=d.vx;d.y+=d.vy;d.vy+=.1;d.life--}dusts=dusts.filter(d=>d.life>0);
 for(const particle of hoverBreakParticles){particle.x+=particle.vx;particle.y+=particle.vy;particle.vy+=.14;particle.life--}hoverBreakParticles=hoverBreakParticles.filter(particle=>particle.life>0);
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
setDebugMode(false);
window.addEventListener('keydown',e=>{
  if(e.repeat)return;
  const expected=KONAMI_COMMAND[konamiCommandIndex];
  if(e.code===expected){
    if(e.code.startsWith('Arrow'))e.preventDefault();
    konamiCommandIndex++;
    if(konamiCommandIndex===KONAMI_COMMAND.length){
      setDebugMode(!debugModeEnabled);
      konamiCommandIndex=0;
    }
  }else konamiCommandIndex=e.code===KONAMI_COMMAND[0]?1:0;
});
titleMode=true;
run=false;
document.body.classList.add('titleOnly');
document.body.classList.remove('gameOnly');

function closePauseRanking(){
  pauseRankingOpen=false;
  document.querySelector('#scoreModal').classList.add('hidden');
  document.querySelector('#recordModal').classList.add('hidden');
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
  if(cycloneState==='escape'||cycloneState==='countdown'||cycloneResultMusicDelay>0)stopBgm();
  else startBgm(cycloneState==='active'?'cyclone':(lariatTimer>0?'lariat':'game'));
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
  cyclonePieces=0;cycloneState='idle';cycloneTimer=0;cycloneSpawned=0;cycloneLanePlan=[];cycloneSpinFrames=0;cycloneResultMusicDelay=0;cycloneScoreRevealTimer=0;cycloneScoreRevealPoints=0;
  run=false;
  titleMode=true;
  gameToken++;
  if(rafId!==null){cancelAnimationFrame(rafId);rafId=null;}
  if(gameOverMessageTimeout!==null){clearTimeout(gameOverMessageTimeout);gameOverMessageTimeout=null;}
  gameOverFragments=[];
  gameOverExplosionTimer=0;
  playerExploded=false;
  gameOverRetryReady=false;
  lariatTimer=0;
  lariatCooldown=0;
  lariatEndInvuln=0;

  const msg=document.querySelector('#msg');
  if(msg)msg.classList.add('hidden');
  document.querySelector('#pauseOverlay').classList.add('hidden');
  document.querySelector('#cycloneOverlay').classList.add('hidden');
  document.querySelector('#scoreModal').classList.add('hidden');
  document.querySelector('#debugModal').classList.add('hidden');
  document.querySelector('#pauseBtn').classList.add('hidden');

  pauseRankingOpen=false;
  document.body.classList.remove('gameOnly');
  document.body.classList.remove('scoreModalOpen');
  document.body.classList.add('titleOnly');
  startBgm('title');
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

const TITLE_SAKATA_FACES=[
  1,2,3,4,5
];
let titleSakataFaceIndex=-1;
function changeTitleSakataFace(){
  let nextIndex=titleSakataFaceIndex;
  while(nextIndex===titleSakataFaceIndex)nextIndex=Math.floor(Math.random()*TITLE_SAKATA_FACES.length);
  titleSakataFaceIndex=nextIndex;
  const faces=document.querySelectorAll('#titleSakata .titleSakataFace');
  faces.forEach((face,index)=>face.classList.toggle('active',index===TITLE_SAKATA_FACES[nextIndex]));
}
const titleSakata=document.querySelector('#titleSakata');
titleSakata.addEventListener('pointerdown',e=>{
  e.preventDefault();
  e.stopPropagation();
  changeTitleSakataFace();
});
titleSakata.addEventListener('keydown',e=>{
  if(e.key!=='Enter'&&e.key!==' ')return;
  e.preventDefault();
  changeTitleSakataFace();
});

document.querySelector('#startBtn').addEventListener('pointerdown',e=>{
  e.preventDefault();
  e.stopPropagation();
  if(DEBUG_BUILD&&debugModeEnabled&&!commitDebugInputs(false)){
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
  reset();
});
document.querySelector('#scoreBtn').addEventListener('pointerdown',e=>{
  e.preventDefault();
  e.stopPropagation();
  initAudio();
  sfxButton();
  showScores();
});
document.querySelector('#helpBtn').addEventListener('pointerdown',e=>{
  e.preventDefault();
  e.stopPropagation();
  initAudio();
  sfxButton();
  document.querySelector('#helpModal').classList.remove('hidden');
  startHelpDemo();
});
document.querySelector('#helpClose').addEventListener('pointerdown',e=>{
  e.preventDefault();
  e.stopPropagation();
  sfxButton();
  document.querySelector('#helpModal').classList.add('hidden');
  stopHelpDemo();
});
document.querySelector('#helpModal').addEventListener('pointerdown',e=>{
  if(e.target!==e.currentTarget)return;
  sfxButton();
  e.currentTarget.classList.add('hidden');
  stopHelpDemo();
});
for(const tab of document.querySelectorAll('.helpTab'))tab.addEventListener('pointerdown',e=>{
  e.preventDefault();
  e.stopPropagation();
  const page=tab.dataset.helpTab;
  document.querySelectorAll('.helpTab').forEach(button=>button.classList.toggle('active',button===tab));
  document.querySelectorAll('[data-help-page]').forEach(panel=>panel.classList.toggle('active',panel.dataset.helpPage===page));
  drawHelpDemo();
  sfxButton();
});
document.querySelector('#recordBtn').addEventListener('pointerdown',e=>{
  e.preventDefault();
  e.stopPropagation();
  initAudio();
  sfxButton();
  showPlayRecords();
});
document.querySelector('#recordClose').addEventListener('pointerdown',e=>{
  e.preventDefault();
  e.stopPropagation();
  sfxButton();
  document.querySelector('#recordModal').classList.add('hidden');
});
document.querySelector('#collectionBtn').addEventListener('pointerdown',e=>{
  e.preventDefault();
  e.stopPropagation();
  initAudio();
  sfxButton();
  showCollection();
});
document.querySelector('#collectionClose').addEventListener('pointerdown',e=>{
  e.preventDefault();
  e.stopPropagation();
  sfxButton();
  stopCollectionPreviews();
  document.querySelector('#collectionModal').classList.add('hidden');
});
document.querySelector('#collectionModal').addEventListener('pointerdown',e=>{
  if(e.target!==e.currentTarget)return;
  sfxButton();stopCollectionPreviews();e.currentTarget.classList.add('hidden');
});
document.querySelector('#collectionList').addEventListener('pointerdown',e=>{
  const button=e.target.closest('.collectionPlay');
  if(!button)return;
  e.preventDefault();
  e.stopPropagation();
  sfxButton();
  startCollectionPreview(button.dataset.animal);
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
document.querySelector('#scoreModal').addEventListener('pointerdown',e=>{
  if(e.target!==e.currentTarget)return;
  sfxButton();
  if(pauseRankingOpen)closePauseRanking();
  else{e.currentTarget.classList.add('hidden');document.body.classList.remove('scoreModalOpen')}
});
document.querySelector('#recordModal').addEventListener('pointerdown',e=>{
  if(e.target!==e.currentTarget)return;
  sfxButton();e.currentTarget.classList.add('hidden');
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
  if(!debugModeEnabled||e.code!=='KeyD' || e.repeat)return;
  debugHitboxes=!debugHitboxes;
  if(!run)draw();
});
