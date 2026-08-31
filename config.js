const skies=[[150,210,245],[80,180,240],[238,137,105],[25,38,75]];
const SEASON_NAMES=['SPRING','SUMMER','AUTUMN','WINTER'];
const DEBUG_BUILD=true; // 最終公開版では false にするとDEBUG画面を完全に隠せます。
const DEBUG_STORAGE_KEY='zangiefAnimalDebugSettingsV1';
const DEBUG_SETTINGS_VERSION=8;
const ANIMAL_OPTIONS=[['pig','ブタ'],['turtle','カメ'],['frog','カエル'],['dog','イヌ'],['cat','ネコ'],['birds','トリ'],['bats','コウモリ'],['snake','ヘビ'],['rabbit','ウサギ'],['cow','ウシ'],['monkey','サル'],['crow','カラス']];
const ANIMAL_TYPES=ANIMAL_OPTIONS.map(option=>option[0]);
// Introduce one new animal per stage so players can learn each behavior before
// new combinations begin appearing in later stages.
const ANIMAL_UNLOCK_STAGE={pig:1,turtle:2,frog:3,birds:4,cow:5,cat:6,snake:7,bats:8,rabbit:9,dog:10,monkey:11,crow:12};
let debugEnabledAnimals=new Set(ANIMAL_TYPES);
const GAME_CONFIG={
  startStage:1,
  minSpeed:6,
  initialSpeed:6,
  speedStep:.39,
  maxSpeed:15,
  lariatDurationFrames:90,  // 発動時間：約1.5秒（60フレーム＝1秒）
  lariatCooldownFrames:1200, // 発動開始から再使用可能になるまで：約20秒。発動中も減少する
  lariatWarningFrames:30,
  lariatCriticalFrames:12,
  lariatEndInvulnFrames:60,
  lariatDefeatScore:50,
  cycloneRequiredPieces:5,
  cycloneDurationFrames:360,
  cycloneTargetCount:30,
  cyclonePieceIntervalMin:200,
  cyclonePieceIntervalMax:700,
  cycloneSpinUpFrames:90,
  cycloneSpinStartSpeed:.035,
  cycloneSpinSpeed:.55,
  cycloneResultFanfareFrames:66,
  cycloneResultDisplayFrames:150,
  cycloneEscapeMaxFrames:120,
  cycloneCountdownStepFrames:42,
  chargeRecoveryRatio:.20,
  chargeIntervalMin:250,
  chargeIntervalMax:450,
  speedDownSteps:2,
  speedUpSteps:2,
  hoverDurationFrames:120,
  snakeCycleMinFrames:65,
  snakeCycleMaxFrames:135,
  catSpeedMultiplier:1.65,
  catAfterBatsSafeFrames:30,
  itemChanceRanges:[[0,1500,600,800],[1500,3000,800,1000],[3000,Infinity,1000,1200]],
  itemChanceLeadMeters:30,
  itemChanceExitMeters:30,
  itemChanceRoadItemDelayMeters:120,
  // Base pass score rises by five points for each newly introduced animal.
  // Keep this order aligned with ANIMAL_UNLOCK_STAGE above.
  passScores:{pig:50,turtle:55,frog:60,birds:65,cow:70,cat:75,snake:80,bats:85,rabbit:90,dog:95,monkey:100,crow:105},
  passSpeedMultiplierCap:2,
  cycloneDefeatBaseScore:100,
  cycloneComboStepScore:5,
  cycloneComboBonusCap:20
};
const DEBUG_SETTING_DEFS=[
  {key:'startStage',label:'開始ステージ',min:1,max:50,step:1,get:()=>GAME_CONFIG.startStage,set:v=>GAME_CONFIG.startStage=Math.round(v)},
  {key:'minSpeed',label:'最低速度',min:3,max:20,step:.1,get:()=>GAME_CONFIG.minSpeed,set:v=>GAME_CONFIG.minSpeed=v},
  {key:'initialSpeed',label:'開始速度',min:3,max:20,step:.1,get:()=>GAME_CONFIG.initialSpeed,set:v=>GAME_CONFIG.initialSpeed=v},
  {key:'speedStep',label:'ステージ毎の速度上昇',min:0,max:2,step:.01,get:()=>GAME_CONFIG.speedStep,set:v=>GAME_CONFIG.speedStep=v},
  {key:'maxSpeed',label:'最高速度',min:3,max:30,step:.1,get:()=>GAME_CONFIG.maxSpeed,set:v=>GAME_CONFIG.maxSpeed=v},
  {key:'lariatDurationSec',label:'坂田モッシュ持続時間（秒）',min:1,max:10,step:.1,get:()=>GAME_CONFIG.lariatDurationFrames/60,set:v=>GAME_CONFIG.lariatDurationFrames=Math.round(v*60)},
  {key:'lariatCooldownSec',label:'坂田モッシュクールタイム（秒）',min:1,max:60,step:.5,get:()=>GAME_CONFIG.lariatCooldownFrames/60,set:v=>GAME_CONFIG.lariatCooldownFrames=Math.round(v*60)},
  {key:'lariatWarningSec',label:'終了予告開始（残り秒）',min:0,max:5,step:.1,get:()=>GAME_CONFIG.lariatWarningFrames/60,set:v=>GAME_CONFIG.lariatWarningFrames=Math.round(v*60)},
  {key:'lariatCriticalSec',label:'高速点滅開始（残り秒）',min:0,max:3,step:.1,get:()=>GAME_CONFIG.lariatCriticalFrames/60,set:v=>GAME_CONFIG.lariatCriticalFrames=Math.round(v*60)},
  {key:'lariatEndInvulnSec',label:'終了後すり抜け無敵（秒）',min:0,max:5,step:.1,get:()=>GAME_CONFIG.lariatEndInvulnFrames/60,set:v=>GAME_CONFIG.lariatEndInvulnFrames=Math.round(v*60)},
  {key:'cycloneRequiredPieces',label:'メタルサイン必要数',min:1,max:10,step:1,get:()=>GAME_CONFIG.cycloneRequiredPieces,set:v=>GAME_CONFIG.cycloneRequiredPieces=Math.round(v)},
  {key:'cycloneDurationSec',label:'坂田メロディックスピードメタル持続時間（秒）',min:1,max:15,step:.5,get:()=>GAME_CONFIG.cycloneDurationFrames/60,set:v=>GAME_CONFIG.cycloneDurationFrames=Math.round(v*60)},
  {key:'cycloneTargetCount',label:'メタル中の出現動物数',min:1,max:100,step:1,get:()=>GAME_CONFIG.cycloneTargetCount,set:v=>GAME_CONFIG.cycloneTargetCount=Math.round(v)},
  {key:'cyclonePieceMin',label:'メタルサイン最短間隔（m）',min:50,max:3000,step:50,get:()=>GAME_CONFIG.cyclonePieceIntervalMin,set:v=>GAME_CONFIG.cyclonePieceIntervalMin=Math.round(v)},
  {key:'cyclonePieceMax',label:'メタルサイン最長間隔（m）',min:50,max:3000,step:50,get:()=>GAME_CONFIG.cyclonePieceIntervalMax,set:v=>GAME_CONFIG.cyclonePieceIntervalMax=Math.round(v)},
  {key:'chargeRecoveryPercent',label:'道中CHARGE回復量（%）',min:0,max:100,step:5,get:()=>GAME_CONFIG.chargeRecoveryRatio*100,set:v=>GAME_CONFIG.chargeRecoveryRatio=v/100},
  {key:'chargeIntervalMin',label:'道中CHARGE 最短間隔（m）',min:50,max:3000,step:50,get:()=>GAME_CONFIG.chargeIntervalMin,set:v=>GAME_CONFIG.chargeIntervalMin=Math.round(v)},
  {key:'chargeIntervalMax',label:'道中CHARGE 最長間隔（m）',min:50,max:3000,step:50,get:()=>GAME_CONFIG.chargeIntervalMax,set:v=>GAME_CONFIG.chargeIntervalMax=Math.round(v)},
  {key:'speedDownSteps',label:'SPEED DOWN低下段階',min:1,max:10,step:1,get:()=>GAME_CONFIG.speedDownSteps,set:v=>GAME_CONFIG.speedDownSteps=Math.round(v)},
  {key:'speedUpSteps',label:'SPEED UP上昇段階',min:1,max:10,step:1,get:()=>GAME_CONFIG.speedUpSteps,set:v=>GAME_CONFIG.speedUpSteps=Math.round(v)},
  {key:'hoverDurationSec',label:'HOVER累計時間（秒）',min:1,max:20,step:.5,get:()=>GAME_CONFIG.hoverDurationFrames/60,set:v=>GAME_CONFIG.hoverDurationFrames=Math.round(v*60)},
  {key:'snakeCycleMinSec',label:'蛇の上下周期 最短（秒）',min:.3,max:5,step:.1,get:()=>GAME_CONFIG.snakeCycleMinFrames/60,set:v=>GAME_CONFIG.snakeCycleMinFrames=Math.round(v*60)},
  {key:'snakeCycleMaxSec',label:'蛇の上下周期 最長（秒）',min:.3,max:5,step:.1,get:()=>GAME_CONFIG.snakeCycleMaxFrames/60,set:v=>GAME_CONFIG.snakeCycleMaxFrames=Math.round(v*60)},
  {key:'catSpeedMultiplier',label:'猫の速度倍率',min:1,max:3,step:.05,get:()=>GAME_CONFIG.catSpeedMultiplier,set:v=>GAME_CONFIG.catSpeedMultiplier=v},
  {key:'catAfterBatsSafeSec',label:'コウモリ後の猫 安全間隔（秒）',min:.2,max:3,step:.1,get:()=>GAME_CONFIG.catAfterBatsSafeFrames/60,set:v=>GAME_CONFIG.catAfterBatsSafeFrames=Math.round(v*60)},
  {key:'cycloneDefeatBaseScore',label:'メタル撃破 基礎点',min:0,max:5000,step:10,get:()=>GAME_CONFIG.cycloneDefeatBaseScore,set:v=>GAME_CONFIG.cycloneDefeatBaseScore=Math.round(v)},
  {key:'cycloneComboStepScore',label:'メタル1コンボ毎の加算点',min:0,max:1000,step:5,get:()=>GAME_CONFIG.cycloneComboStepScore,set:v=>GAME_CONFIG.cycloneComboStepScore=Math.round(v)},
  {key:'cycloneComboBonusCap',label:'メタルのコンボ加算上限',min:0,max:5000,step:5,get:()=>GAME_CONFIG.cycloneComboBonusCap,set:v=>GAME_CONFIG.cycloneComboBonusCap=Math.round(v)},
  {key:'itemEarlyMin',label:'ITEM 0～1500m 最短（m）',min:100,max:3000,step:50,get:()=>GAME_CONFIG.itemChanceRanges[0][2],set:v=>GAME_CONFIG.itemChanceRanges[0][2]=Math.round(v)},
  {key:'itemEarlyMax',label:'ITEM 0～1500m 最長（m）',min:100,max:3000,step:50,get:()=>GAME_CONFIG.itemChanceRanges[0][3],set:v=>GAME_CONFIG.itemChanceRanges[0][3]=Math.round(v)},
  {key:'itemMidMin',label:'ITEM 1500～3000m 最短（m）',min:100,max:3000,step:50,get:()=>GAME_CONFIG.itemChanceRanges[1][2],set:v=>GAME_CONFIG.itemChanceRanges[1][2]=Math.round(v)},
  {key:'itemMidMax',label:'ITEM 1500～3000m 最長（m）',min:100,max:3000,step:50,get:()=>GAME_CONFIG.itemChanceRanges[1][3],set:v=>GAME_CONFIG.itemChanceRanges[1][3]=Math.round(v)},
  {key:'itemLateMin',label:'ITEM 3000m以降 最短（m）',min:100,max:4000,step:50,get:()=>GAME_CONFIG.itemChanceRanges[2][2],set:v=>GAME_CONFIG.itemChanceRanges[2][2]=Math.round(v)},
  {key:'itemLateMax',label:'ITEM 3000m以降 最長（m）',min:100,max:4000,step:50,get:()=>GAME_CONFIG.itemChanceRanges[2][3],set:v=>GAME_CONFIG.itemChanceRanges[2][3]=Math.round(v)},
  {key:'itemLeadMeters',label:'ITEM前の敵停止距離（m）',min:0,max:500,step:10,get:()=>GAME_CONFIG.itemChanceLeadMeters,set:v=>GAME_CONFIG.itemChanceLeadMeters=Math.round(v)},
  {key:'itemExitMeters',label:'ITEM後の敵停止距離（m）',min:0,max:500,step:10,get:()=>GAME_CONFIG.itemChanceExitMeters,set:v=>GAME_CONFIG.itemChanceExitMeters=Math.round(v)}
];
const DEBUG_DEFAULT_VALUES={...Object.fromEntries(DEBUG_SETTING_DEFS.map(def=>[def.key,def.get()])),enabledAnimals:[...ANIMAL_TYPES]};
function normalizeDebugConfig(){
  GAME_CONFIG.minSpeed=Math.min(GAME_CONFIG.minSpeed,GAME_CONFIG.maxSpeed);
  GAME_CONFIG.initialSpeed=Math.max(GAME_CONFIG.minSpeed,GAME_CONFIG.initialSpeed);
  GAME_CONFIG.initialSpeed=Math.min(GAME_CONFIG.initialSpeed,GAME_CONFIG.maxSpeed);
  GAME_CONFIG.lariatWarningFrames=Math.min(GAME_CONFIG.lariatWarningFrames,GAME_CONFIG.lariatDurationFrames);
  GAME_CONFIG.lariatCriticalFrames=Math.min(GAME_CONFIG.lariatCriticalFrames,GAME_CONFIG.lariatWarningFrames);
  GAME_CONFIG.cyclonePieceIntervalMax=Math.max(GAME_CONFIG.cyclonePieceIntervalMin,GAME_CONFIG.cyclonePieceIntervalMax);
  GAME_CONFIG.chargeIntervalMax=Math.max(GAME_CONFIG.chargeIntervalMin,GAME_CONFIG.chargeIntervalMax);
  GAME_CONFIG.snakeCycleMaxFrames=Math.max(GAME_CONFIG.snakeCycleMinFrames,GAME_CONFIG.snakeCycleMaxFrames);
  for(const range of GAME_CONFIG.itemChanceRanges)range[3]=Math.max(range[2],range[3]);
}
function applyDebugValues(values){
  for(const def of DEBUG_SETTING_DEFS){
    const raw=Number(values[def.key]);
    if(!Number.isFinite(raw))continue;
    def.set(Math.min(def.max,Math.max(def.min,raw)));
  }
  if(Array.isArray(values.enabledAnimals))debugEnabledAnimals=new Set(values.enabledAnimals.filter(type=>ANIMAL_TYPES.includes(type)));
  normalizeDebugConfig();
}
function loadDebugSettings(){
  if(!DEBUG_BUILD)return;
  try{
    const saved=JSON.parse(localStorage.getItem(DEBUG_STORAGE_KEY)||'null');
    if(!saved||typeof saved!=='object')return;
    const savedVersion=saved._version||1;
    if(savedVersion<2){
      if(Number(saved.cycloneRequiredPieces)===3)saved.cycloneRequiredPieces=5;
      if(Number(saved.cyclonePieceMin)===350&&Number(saved.cyclonePieceMax)===550){
        saved.cyclonePieceMin=200;saved.cyclonePieceMax=700;
      }
    }
    if(savedVersion<3){
      if(Number(saved.lariatDurationSec)===3)saved.lariatDurationSec=1.5;
      if(Number(saved.lariatWarningSec)===1)saved.lariatWarningSec=.5;
      if(Number(saved.lariatCriticalSec)===.4)saved.lariatCriticalSec=.2;
    }
    if(savedVersion<5&&Number(saved.maxSpeed)===10)saved.maxSpeed=15;
    if(savedVersion<6&&Array.isArray(saved.enabledAnimals)&&!saved.enabledAnimals.includes('monkey'))saved.enabledAnimals.push('monkey');
    if(savedVersion<7&&Array.isArray(saved.enabledAnimals)&&!saved.enabledAnimals.includes('crow'))saved.enabledAnimals.push('crow');
    if(savedVersion<8&&Number(saved.hoverDurationSec)===5)saved.hoverDurationSec=2;
    saved._version=DEBUG_SETTINGS_VERSION;
    applyDebugValues(saved);
    localStorage.setItem(DEBUG_STORAGE_KEY,JSON.stringify(currentDebugValues()));
  }catch(e){}
}
function currentDebugValues(){return {_version:DEBUG_SETTINGS_VERSION,...Object.fromEntries(DEBUG_SETTING_DEFS.map(def=>[def.key,def.get()])),enabledAnimals:[...debugEnabledAnimals]}}
