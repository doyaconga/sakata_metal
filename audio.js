// ---------- SOUND ----------
let audioCtx=null;
let masterGain=null;
let noiseBuffer=null;

function initAudio(){
  if(!audioCtx){
    const AC=window.AudioContext||window.webkitAudioContext;
    if(!AC)return;
    audioCtx=new AC();
    masterGain=audioCtx.createGain();
    masterGain.gain.value=.34;
    masterGain.connect(audioCtx.destination);

    noiseBuffer=audioCtx.createBuffer(1,audioCtx.sampleRate*2,audioCtx.sampleRate);
    const d=noiseBuffer.getChannelData(0);
    for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  }
  if(audioCtx.state==='suspended')audioCtx.resume();
}
function tone(freq,dur=.12,type='square',vol=.18,endFreq=null,delay=0){
  if(!audioCtx)return;
  const t=audioCtx.currentTime+delay;
  const o=audioCtx.createOscillator(),g=audioCtx.createGain();
  o.type=type;o.frequency.setValueAtTime(freq,t);
  if(endFreq)o.frequency.exponentialRampToValueAtTime(Math.max(20,endFreq),t+dur);
  g.gain.setValueAtTime(.0001,t);
  g.gain.exponentialRampToValueAtTime(Math.max(.0002,vol),t+.008);
  g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(g);g.connect(masterGain);o.start(t);o.stop(t+dur+.02);
}
function noise(dur=.18,vol=.18,lowpass=1000,delay=0){
  if(!audioCtx||!noiseBuffer)return;
  const t=audioCtx.currentTime+delay;
  const n=audioCtx.createBufferSource(),f=audioCtx.createBiquadFilter(),g=audioCtx.createGain();
  n.buffer=noiseBuffer;f.type='lowpass';f.frequency.value=lowpass;
  g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  n.connect(f);f.connect(g);g.connect(masterGain);n.start(t);n.stop(t+dur+.02);
}
function sfxJump(){
  initAudio();
  if(!audioCtx)return;
  // Clearly audible arcade jump: quick rising chirp with a soft low layer.
  tone(180,.13,'square',.28,430);
  tone(390,.15,'sine',.24,820,.025);
  tone(105,.10,'triangle',.14,155);
}
function sfxStart(){
  initAudio();tone(330,.08,'square',.10,440);tone(440,.08,'square',.10,660,.08);tone(660,.12,'square',.12,880,.16);
}
function sfxLariat(){
  initAudio();noise(.32,.24,520);tone(105,.38,'sawtooth',.22,48);tone(62,.48,'square',.13,35);
}
function sfxHit(){
  initAudio();noise(.12,.25,700);tone(120,.13,'square',.16,55);
}

function sfxDamage(){
  initAudio();
  // Heavy body-impact thump.
  noise(.24,.34,430);
  tone(92,.28,'sawtooth',.30,38);
  tone(54,.34,'square',.22,27,.025);
  // Small second impact gives it more weight.
  noise(.13,.18,260,.075);
  tone(145,.12,'square',.13,60,.07);
}

function sfxThunder(){
  initAudio();noise(.65,.20,380);tone(58,.7,'sawtooth',.12,28);
}
function sfxGameOver(){
  initAudio();
  tone(330,.18,'square',.12,250);
  tone(245,.22,'square',.12,180,.19);
  tone(165,.42,'sawtooth',.14,70,.42);
}
function sfxButton(){
  initAudio();tone(520,.055,'square',.07,650);
}
function sfxCycloneResult(){
  initAudio();
  if(!audioCtx)return;

  // Short original victory fanfare: a buoyant high-register climb followed
  // by a sparkling major chord. No crowd or applause layer is used.
  const phrase=[659.25,783.99,1046.50,1318.51,1567.98];
  phrase.forEach((note,index)=>{
    const delay=index*.09;
    tone(note,.14,'triangle',.115,note*1.06,delay);
    tone(note*2,.055,'sine',.042,null,delay+.014);
  });
  const chordDelay=.45;
  tone(1046.50,.48,'triangle',.115,1174.66,chordDelay);
  tone(1318.51,.48,'triangle',.105,1567.98,chordDelay);
  tone(1567.98,.52,'triangle',.095,2093.00,chordDelay);
  tone(2093.00,.28,'sine',.06,2637.02,chordDelay+.055);

  // Let the result sound sit in front, then smoothly restore the game BGM.
  if(bgmGain){
    const now=audioCtx.currentTime;
    bgmGain.gain.cancelScheduledValues(now);
    bgmGain.gain.setValueAtTime(.24,now);
    bgmGain.gain.linearRampToValueAtTime(.62,now+1.05);
  }
}

// ---------- PROCEDURAL BGM ----------
let bgmMode='none';
let bgmTimer=null;
let bgmStep=0;
let bgmGain=null;
let bgmNextNoteTime=0;
let bgmScheduleTime=null;

function ensureBgmGain(){
  initAudio();
  if(!audioCtx)return false;
  if(!bgmGain){
    bgmGain=audioCtx.createGain();
    bgmGain.gain.value=.62;
    bgmGain.connect(masterGain);
  }
  return true;
}

function bgmTone(freq,dur=.16,type='triangle',vol=.16,delay=0){
  if(!audioCtx||!bgmGain)return;
  const t=(bgmScheduleTime??audioCtx.currentTime)+delay;
  const o=audioCtx.createOscillator(),g=audioCtx.createGain();
  o.type=type;
  o.frequency.setValueAtTime(freq,t);
  g.gain.setValueAtTime(.0001,t);
  g.gain.exponentialRampToValueAtTime(Math.max(.0002,vol),t+.008);
  g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(g);g.connect(bgmGain);
  o.start(t);o.stop(t+dur+.03);
}
function bgmNoise(dur=.08,vol=.10,lowpass=1700,delay=0){
  if(!audioCtx||!bgmGain||!noiseBuffer)return;
  const t=(bgmScheduleTime??audioCtx.currentTime)+delay;
  const n=audioCtx.createBufferSource(),f=audioCtx.createBiquadFilter(),g=audioCtx.createGain();
  n.buffer=noiseBuffer;
  f.type='lowpass';f.frequency.value=lowpass;
  g.gain.setValueAtTime(vol,t);
  g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  n.connect(f);f.connect(g);g.connect(bgmGain);
  n.start(t);n.stop(t+dur+.02);
}

function stopBgm(){
  if(bgmTimer){clearInterval(bgmTimer);bgmTimer=null;}
  bgmMode='none';bgmStep=0;bgmNextNoteTime=0;bgmScheduleTime=null;
}

function scheduleBgmStep(){
    if(bgmMode==='title'){
      // Gentle major-key arpeggio / toy-box feel.
      const notes=[261.63,329.63,392.00,523.25,392.00,329.63,293.66,349.23];
      const bass=[130.81,130.81,146.83,146.83,174.61,174.61,146.83,146.83];
      const i=bgmStep%notes.length;
      bgmTone(notes[i],.25,'triangle',.15);
      if(i%2===0)bgmTone(bass[i],.36,'sine',.07);
      if(i===0||i===4)bgmTone(notes[i]/2,.50,'sine',.045,.02);

    }else if(bgmMode==='game'){
      // Fast driving pulse with simple minor melody.
      const melody=[329.63,392.00,440.00,392.00,329.63,293.66,329.63,493.88,
                    440.00,392.00,329.63,293.66,261.63,293.66,329.63,392.00];
      const i=bgmStep%melody.length;
      bgmTone(melody[i],.11,'square',.12);
      bgmTone(i%4===0?110:82.41,.12,'sawtooth',i%4===0?.095:.045);
      if(i%2===0)bgmNoise(.035,.055,2400);
      if(i%4===2)bgmNoise(.055,.07,900);

    }else if(bgmMode==='cyclone'){
      // Original bright invincibility-style cue: rapid major arpeggios,
      // bell-like upper sparkles and a light pulse underneath.
      const melody=[523.25,659.25,783.99,1046.50,880.00,783.99,659.25,987.77,
                    587.33,698.46,880.00,1174.66,987.77,880.00,698.46,1046.50];
      const i=bgmStep%melody.length;
      const note=melody[i];
      bgmTone(note,.12,'triangle',.13);
      bgmTone(note*2,.055,'sine',.043,.012);
      if(i%2===0)bgmTone(note*1.5,.07,'sine',.035,.035);
      if(i%4===0)bgmTone(i<8?130.81:146.83,.24,'sine',.075);
      if(i%4===2)bgmTone(392,.08,'triangle',.045,.018);

    }else if(bgmMode==='lariat'){
      // Deliberately excessive: pounding lows, dissonant stabs, metallic noise,
      // siren-like alternation and rapid percussion.
      const i=bgmStep%16;
      const stabs=[110,155.56,92.50,174.61,116.54,87.31,196,103.83];

      // Heavy low-end pulse every step.
      bgmTone(i%2===0?46.25:55,.20,'square',.25,0);
      bgmTone(70,.16,'sawtooth',.18,0);

      // Dissonant upper stabs.
      bgmTone(stabs[i%stabs.length],.12,'sawtooth',.23,0);
      bgmTone(stabs[(i+3)%stabs.length]*1.5,.08,'square',.12,.018);

      // Constant crash/noise percussion.
      bgmNoise(.085,i%2===0?.25:.18,i%4===0?480:2600);
      if(i%2===0)bgmNoise(.045,.14,5200,.035);

      // Alarm / siren feel.
      if(i%4===0 || i%4===2){
        const siren=i%4===0?520:760;
        bgmTone(siren,.16,'square',.16,i%4===0?760:520,0);
      }

      // Big crash on the beat.
      if(i%4===0){
        bgmTone(220,.13,'square',.20,0);
        bgmTone(440,.10,'square',.14,.025);
        bgmTone(880,.07,'square',.08,.05);
        bgmNoise(.16,.28,900,0);
      }
    }
    bgmStep++;
}

function startBgm(mode){
  if(!ensureBgmGain())return;
  if(bgmMode===mode && bgmTimer)return;
  if(bgmTimer)clearInterval(bgmTimer);
  bgmMode=mode;
  bgmStep=0;
  bgmNextNoteTime=audioCtx.currentTime+.04;

  // Web Audio keeps playing scheduled notes even if a busy render frame
  // briefly delays JavaScript. Queue a short rolling window instead of
  // creating each beat only when a setInterval callback happens to run.
  const scheduler=()=>{
    if(!audioCtx)return;
    if(audioCtx.state!=='running'){
      bgmNextNoteTime=audioCtx.currentTime+.04;
      return;
    }
    // Never burst through beats that were already missed after a long tab or
    // device stall; resume from the current audio clock instead.
    if(bgmNextNoteTime<audioCtx.currentTime-.02)bgmNextNoteTime=audioCtx.currentTime+.02;
    const intervalSeconds=(bgmMode==='title'?310:bgmMode==='game'?145:bgmMode==='cyclone'?78:72)/1000;
    const scheduleUntil=audioCtx.currentTime+.16;
    while(bgmNextNoteTime<scheduleUntil){
      bgmScheduleTime=bgmNextNoteTime;
      scheduleBgmStep();
      bgmNextNoteTime+=intervalSeconds;
    }
    bgmScheduleTime=null;
  };
  scheduler();
  bgmTimer=setInterval(scheduler,40);
}
