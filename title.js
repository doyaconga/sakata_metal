let titleMode=true;

const titleDemoCanvas=document.querySelector('#titleDemo');
const titleDemoCtx=titleDemoCanvas.getContext('2d');
const TITLE_DEMO_GROUND=260;
let titleDemoRaf=null;
let titleDemo={elapsed:0,lastTime:0,jump1:false,jump2:false,jumpPigStarted:false,lariatPigShown:false,dangerShown:false,player:{x:165,y:198,vy:0,rot:0,on:true},animal:{x:650,y:212,vx:0,vy:0,rot:0,visible:false,flying:false}};

function resetTitleDemo(now=performance.now()){
  titleDemo={elapsed:0,lastTime:now,jump1:false,jump2:false,jumpPigStarted:false,lariatPigShown:false,dangerShown:false,player:{x:165,y:198,vy:0,rot:0,on:true},animal:{x:650,y:212,vx:0,vy:0,rot:0,visible:false,flying:false}};
}
function isTouchTitleDemo(){return matchMedia('(hover: none) and (pointer: coarse)').matches}
function updateTitleDemo(now){
  let frames=Math.min(2.5,Math.max(.25,(now-titleDemo.lastTime)/16.667));
  titleDemo.lastTime=now;titleDemo.elapsed+=frames*16.667;
  if(titleDemo.elapsed>=9200){resetTitleDemo(now);frames=1}
  const d=titleDemo;
  if(d.elapsed>=900&&!d.jump1){d.jump1=true;d.player.vy=-14.8;d.player.on=false}
  if(d.elapsed>=1450&&!d.jump2){d.jump2=true;d.player.vy=-13;d.player.on=false}
  d.player.vy+=.67*frames;d.player.y+=d.player.vy*frames;
  if(d.player.y>=198){d.player.y=198;d.player.vy=0;d.player.on=true;d.player.rot=0}else{d.player.on=false;d.player.rot+=.11*frames}
  if(d.elapsed>=500&&!d.jumpPigStarted){d.jumpPigStarted=true;d.animal.visible=true}
  if(d.elapsed>=2500&&!d.lariatPigShown)d.animal.visible=false;
  if(d.elapsed>=3500&&!d.lariatPigShown){d.lariatPigShown=true;d.animal={x:650,y:212,vx:0,vy:0,rot:0,visible:true,flying:false}}
  if(d.animal.visible&&!d.animal.flying&&!d.dangerShown)d.animal.x-=7.65*frames;
  if(d.elapsed>=4350&&!d.animal.flying&&d.lariatPigShown&&!d.dangerShown){d.animal.flying=true;d.animal.vx=8.5;d.animal.vy=-10.5}
  if(d.animal.flying){d.animal.x+=d.animal.vx*frames;d.animal.y+=d.animal.vy*frames;d.animal.vy+=.48*frames;d.animal.rot+=.22*frames}
  if(d.elapsed>=6100&&!d.dangerShown){d.dangerShown=true;d.animal={x:760,y:212,vx:0,vy:0,rot:0,visible:true,flying:false}}
  if(d.dangerShown&&d.elapsed<7000)d.animal.x-=10.1*frames;
  if(d.dangerShown&&d.elapsed>=7000)d.animal.x=215;
}
function drawTitleDemoPig(ctx,o){
  const w=64,h=48;
  ctx.save();ctx.translate(o.x+w/2,o.y+h/2);ctx.rotate(o.rot||0);ctx.scale(-1,1);ctx.translate(-w/2,-h/2);
  ctx.strokeStyle='#8d4e5c';ctx.lineWidth=3;ctx.fillStyle='#ef9cab';
  ctx.beginPath();ctx.ellipse(w*.43,h*.61,w*.34,h*.27,0,0,Math.PI*2);ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.arc(w*.75,h*.49,h*.25,0,Math.PI*2);ctx.fill();ctx.stroke();
  ctx.fillStyle='#dc7f91';
  ctx.beginPath();ctx.moveTo(w*.62,h*.31);ctx.lineTo(w*.65,h*.08);ctx.lineTo(w*.74,h*.30);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.moveTo(w*.77,h*.28);ctx.lineTo(w*.85,h*.09);ctx.lineTo(w*.90,h*.34);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle='#f5b3be';ctx.beginPath();ctx.ellipse(w*.91,h*.55,w*.14,h*.11,0,0,Math.PI*2);ctx.fill();ctx.stroke();
  ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(w*.70,h*.42,4.5,0,Math.PI*2);ctx.arc(w*.80,h*.42,4.5,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#222';ctx.beginPath();ctx.arc(w*.71,h*.42,2.2,0,Math.PI*2);ctx.arc(w*.81,h*.42,2.2,0,Math.PI*2);ctx.fill();
  const step=o.flying?0:Math.sin(titleDemo.elapsed*.018)*5;
  ctx.fillStyle='#b96575';ctx.fillRect(w*.25+step,h*.78,8,h*.18);ctx.fillRect(w*.51-step,h*.78,8,h*.18);
  ctx.restore();
}
function titleDemoPrompt(){
  const t=titleDemo.elapsed,text=isTouchTitleDemo()?'タップ！':'クリック！';
  if(t>=760&&t<1160)return {text,pulse:Math.abs(t-900)<150};
  if(t>=1320&&t<1790)return {text,pulse:Math.abs(t-1450)<150};
  return null;
}
function drawTitleDemoLariatButton(ctx,t){
  if(t<2500||t>=5000)return;
  const active=t>=3950,pulse=Math.abs(t-3950)<190,scale=pulse?1.08:1,x=526,y=14,w=178,h=66;
  ctx.save();ctx.translate(x+w/2,y+h/2);ctx.scale(scale,scale);ctx.translate(-w/2,-h/2);
  ctx.fillStyle='#7a2020';ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(10,0);ctx.lineTo(w-10,0);ctx.quadraticCurveTo(w,0,w,10);ctx.lineTo(w,h-10);ctx.quadraticCurveTo(w,h,w-10,h);ctx.lineTo(10,h);ctx.quadraticCurveTo(0,h,0,h-10);ctx.lineTo(0,10);ctx.quadraticCurveTo(0,0,10,0);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle='#fff';ctx.font='900 15px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('ダブルラリアット',w/2,18);
  ctx.fillStyle='#3a1111';ctx.fillRect(13,32,w-26,7);ctx.fillStyle=active?'#f2c94c':'#eee';ctx.fillRect(13,32,w-26,7);
  ctx.fillStyle='#ddd';ctx.font='900 10px sans-serif';ctx.fillText(active?'発動中！':'READY',w/2,52);ctx.restore();
}
function drawTitleDemoExplosion(ctx,d){
  const t=d.elapsed;
  let progress=0;
  if(t>=7000&&t<7700)progress=(t-7000)/700;
  else if(t>=7700&&t<8250)progress=1;
  else if(t>=8250&&t<8950)progress=1-(t-8250)/700;
  if(progress<=0)return false;
  const size=76,piece=size/4,cx=d.player.x+29,cy=d.player.y+31,eased=1-Math.pow(1-progress,2);
  const sw=zangiefImg.naturalWidth/4,sh=zangiefImg.naturalHeight/4;
  for(let row=0;row<4;row++)for(let col=0;col<4;col++){
    const ox=(col-1.5)*piece,oy=(row-1.5)*piece,len=Math.hypot(ox,oy)||1,seed=(row*4+col)*1.73;
    const dx=ox/len*(46+((row+col)%3)*16)*eased+Math.sin(seed)*12*eased;
    const dy=oy/len*(42+((row*2+col)%4)*13)*eased-28*eased+42*eased*eased;
    ctx.save();ctx.translate(cx+ox+dx,cy+oy+dy);ctx.rotate((col-row)*.32*eased);ctx.globalAlpha=Math.max(.25,1-progress*.28);
    if(zangiefImg.complete&&zangiefImg.naturalWidth)ctx.drawImage(zangiefImg,col*sw,row*sh,sw,sh,-piece/2,-piece/2,piece,piece);else{ctx.fillStyle='#8b2f2f';ctx.fillRect(-piece/2,-piece/2,piece,piece)}ctx.restore();
  }
  if(t<8250){for(let i=0;i<16;i++){const a=i*Math.PI/8+.2,r=(28+(i%4)*13)*eased;ctx.fillStyle=i%2?'#ffb21c':'#fff3a6';ctx.beginPath();ctx.arc(cx+Math.cos(a)*r,cy+Math.sin(a)*r,2+(i%3),0,Math.PI*2);ctx.fill()}}
  return true;
}
function drawTitleDemo(){
  const ctx=titleDemoCtx,d=titleDemo,w=titleDemoCanvas.width,h=titleDemoCanvas.height;
  ctx.clearRect(0,0,w,h);
  const sky=ctx.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#8fd0f2');sky.addColorStop(1,'#e7d09c');ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
  ctx.fillStyle='#6ca568';ctx.beginPath();ctx.moveTo(0,TITLE_DEMO_GROUND);ctx.quadraticCurveTo(160,95,320,TITLE_DEMO_GROUND);ctx.quadraticCurveTo(500,105,720,TITLE_DEMO_GROUND);ctx.lineTo(720,h);ctx.lineTo(0,h);ctx.fill();
  ctx.fillStyle='#5b3d2e';ctx.fillRect(0,TITLE_DEMO_GROUND,w,h-TITLE_DEMO_GROUND);ctx.fillStyle='#3f8c3a';ctx.fillRect(0,TITLE_DEMO_GROUND,w,8);
  ctx.strokeStyle='rgba(255,255,255,.20)';ctx.lineWidth=3;for(let gx=0;gx<w;gx+=44){ctx.beginPath();ctx.moveTo(gx,TITLE_DEMO_GROUND+15);ctx.lineTo(gx+18,TITLE_DEMO_GROUND+15);ctx.stroke()}
  const lariat=d.elapsed>=3950&&d.elapsed<5000;
  if(lariat){
    ctx.fillStyle='rgba(10,15,28,.62)';ctx.fillRect(0,0,w,h);
    const demoFrames=(d.elapsed-3950)/16.667;
    ctx.fillStyle='rgba(38,45,62,.88)';for(let i=0;i<7;i++){const cx=(i*125+(180-demoFrames*2)%125)-90,cy=34+(i%3)*24;ctx.beginPath();ctx.arc(cx,cy,32,0,Math.PI*2);ctx.arc(cx+29,cy+3,39,0,Math.PI*2);ctx.arc(cx+63,cy+2,30,0,Math.PI*2);ctx.fill()}
    ctx.strokeStyle='rgba(210,225,255,.65)';ctx.lineWidth=2;ctx.beginPath();const rainShift=demoFrames*17;for(let i=0;i<55;i++){const rx=((i*73+rainShift)%780)-30,ry=((i*119+rainShift*1.7)%360)-30;ctx.moveTo(rx,ry);ctx.lineTo(rx-8,ry+20)}ctx.stroke();
    if((180-Math.floor(demoFrames))%58<5){ctx.fillStyle='rgba(235,242,255,.40)';ctx.fillRect(0,0,w,h);ctx.strokeStyle='rgba(255,255,255,.95)';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(520,10);ctx.lineTo(495,70);ctx.lineTo(520,70);ctx.lineTo(485,145);ctx.stroke()}
  }
  if(d.animal.visible)drawTitleDemoPig(ctx,d.animal);
  const exploded=drawTitleDemoExplosion(ctx,d);
  if(!exploded){ctx.save();ctx.translate(d.player.x+29,d.player.y+31);const demoLariatFrames=(d.elapsed-3950)/16.667;ctx.rotate(lariat?demoLariatFrames*.55:d.player.rot);
  if(lariat){ctx.strokeStyle='#f4d35e';ctx.lineWidth=7;ctx.globalAlpha=.9;ctx.beginPath();ctx.arc(0,0,48,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1}
  if(zangiefImg.complete&&zangiefImg.naturalWidth)ctx.drawImage(zangiefImg,-38,-42,76,76);else{ctx.fillStyle='#8b2f2f';ctx.beginPath();ctx.arc(0,0,28,0,Math.PI*2);ctx.fill()}
  ctx.restore()}
  if(d.player.on&&!exploded){ctx.fillStyle='rgba(230,220,190,.55)';for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(d.player.x-5-i*9,TITLE_DEMO_GROUND-3-i*2,3+i,0,Math.PI*2);ctx.fill()}}
  drawTitleDemoLariatButton(ctx,d.elapsed);
  const prompt=titleDemoPrompt();
  if(prompt){
    const scale=prompt.pulse?1.13:1;ctx.save();ctx.translate(w/2,28);ctx.scale(scale,scale);ctx.font='900 20px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';const tw=ctx.measureText(prompt.text).width;
    const bx=-tw/2-16,by=-17,bw=tw+32,bh=34,r=10;
    ctx.fillStyle=prompt.pulse?'rgba(255,235,115,.96)':'rgba(25,35,48,.78)';ctx.strokeStyle='rgba(255,255,255,.9)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(bx+r,by);ctx.lineTo(bx+bw-r,by);ctx.quadraticCurveTo(bx+bw,by,bx+bw,by+r);ctx.lineTo(bx+bw,by+bh-r);ctx.quadraticCurveTo(bx+bw,by+bh,bx+bw-r,by+bh);ctx.lineTo(bx+r,by+bh);ctx.quadraticCurveTo(bx,by+bh,bx,by+bh-r);ctx.lineTo(bx,by+r);ctx.quadraticCurveTo(bx,by,bx+r,by);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle=prompt.pulse?'#542018':'#fff';ctx.fillText(prompt.text,0,1);ctx.restore();
  }
}
function titleDemoLoop(now){
  if(!titleMode){titleDemoRaf=null;return}
  updateTitleDemo(now);drawTitleDemo();titleDemoRaf=requestAnimationFrame(titleDemoLoop);
}
function startTitleDemo(){
  if(titleDemoRaf!==null)return;
  resetTitleDemo();titleDemoRaf=requestAnimationFrame(titleDemoLoop);
}
function stopTitleDemo(){
  if(titleDemoRaf!==null)cancelAnimationFrame(titleDemoRaf);
  titleDemoRaf=null;
}

function getScores(){
  try{
    const a=JSON.parse(localStorage.getItem('zangiefAnimalTop10V2')||'[]');
    return Array.isArray(a)?a
      .filter(r=>r&&Number.isFinite(r.totalScore))
      .map(r=>({totalScore:r.totalScore}))
      .sort((a,b)=>b.totalScore-a.totalScore)
      .slice(0,10):[];
  }catch(e){return []}
}
function saveScoreRecord(record){
  if(!record||!Number.isFinite(record.totalScore)||record.totalScore<=0)return;
  try{
    const a=getScores();
    a.push(record);
    a.sort((a,b)=>b.totalScore-a.totalScore);
    localStorage.setItem('zangiefAnimalTop10V2',JSON.stringify(a.slice(0,10)));
  }catch(e){
    // Saving a score is optional; game-over handling must continue even when
    // browser storage is unavailable or full.
  }
}
function showScores(){
  const list=document.querySelector('#scoreList');
  const scores=getScores();
  list.innerHTML='';
  if(scores.length===0){
    const row=document.createElement('div');
    row.className='scoreRow';
    row.innerHTML='<span class="scoreRank">-</span><span class="scoreValue">まだ記録なし</span>';
    list.appendChild(row);
  }else{
    scores.forEach((r,i)=>{
      const row=document.createElement('div');
      row.className='scoreRow';
      const rank=document.createElement('span');rank.className='scoreRank';rank.textContent=(i+1)+'.';
      const value=document.createElement('span');value.className='scoreValue';value.textContent=fmt(r.totalScore);
      row.append(rank,value);
      list.appendChild(row);
    });
  }
  document.querySelector('#scoreModal').classList.remove('hidden');
}
function fmt(v){return Math.floor(v).toLocaleString('ja-JP')}
