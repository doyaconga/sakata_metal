// Shared by the live game and the how-to-play demos. Callers position and
// rotate the context first, then this draws the standard Sakata sprite.
function drawSakataSprite(ctx,size=76){
 if(sakataImg.complete&&sakataImg.naturalWidth){
   ctx.drawImage(sakataImg,-size/2,-size/2-size*.0526,size,size);
 }else{
   ctx.fillStyle='#8b2f2f';ctx.beginPath();ctx.arc(0,0,size*.368,0,Math.PI*2);ctx.fill();
 }
}

// Shared item picture. The caller places the drawing origin at the item's
// top-left, so this works on both the game canvas and tutorial canvases.
function drawItemSprite(ctx,type){
 if(type==='shield'){
   ctx.translate(2,0);ctx.fillStyle='#d8dde6';ctx.strokeStyle='#38485c';ctx.lineWidth=3;
   ctx.beginPath();ctx.moveTo(21,3);ctx.lineTo(39,10);ctx.lineTo(37,27);ctx.quadraticCurveTo(33,39,21,45);ctx.quadraticCurveTo(9,39,5,27);ctx.lineTo(3,10);ctx.closePath();ctx.fill();ctx.stroke();
   ctx.fillStyle='#6e91b7';ctx.beginPath();ctx.moveTo(21,8);ctx.lineTo(33,13);ctx.lineTo(31,26);ctx.quadraticCurveTo(28,34,21,38);ctx.quadraticCurveTo(14,34,11,26);ctx.lineTo(9,13);ctx.closePath();ctx.fill();
   ctx.strokeStyle='rgba(255,255,255,.8)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(21,9);ctx.lineTo(21,36);ctx.stroke();
 }else if(type==='speedDown'||type==='speedUp'||type==='hover'){
   const icon=type==='speedDown'?'🐢':(type==='speedUp'?'🐈':'🚀');
   const glow=type==='speedDown'?'#8dff72':(type==='speedUp'?'#ffb347':'#72e6ff');
   ctx.shadowColor=glow;ctx.shadowBlur=type==='hover'?14:12;ctx.font='34px sans-serif';ctx.textAlign='center';ctx.fillStyle='#fff';ctx.fillText(icon,23,36);ctx.shadowBlur=0;
 }else if(type==='cyclonePiece'){
   ctx.shadowColor='#77edff';ctx.shadowBlur=16;ctx.strokeStyle='#1c6674';ctx.fillStyle='#9af4ff';ctx.lineWidth=3;
   ctx.beginPath();ctx.arc(23,23,18,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#185467';ctx.font='900 30px sans-serif';ctx.fillText('🤘',23,34);ctx.shadowBlur=0;
 }else{
   ctx.shadowColor='#ffe45c';ctx.shadowBlur=14;ctx.fillStyle='#ffe45c';ctx.strokeStyle='#7a4b00';ctx.lineWidth=3;
   ctx.beginPath();ctx.moveTo(27,1);ctx.lineTo(9,25);ctx.lineTo(22,25);ctx.lineTo(15,46);ctx.lineTo(40,18);ctx.lineTo(27,18);ctx.closePath();ctx.fill();ctx.stroke();ctx.shadowBlur=0;
 }
}

// The first tutorial animals share the exact live-game art and leg motion.
function drawTutorialAnimalSprite(ctx,o){
 const stride=o.age*.23;
 if(o.type==='pig'){
   ctx.strokeStyle='#8d4e5c';ctx.lineWidth=3;ctx.fillStyle='#ef9cab';ctx.beginPath();ctx.ellipse(o.w*.43,o.h*.61,o.w*.34,o.h*.27,0,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.beginPath();ctx.arc(o.w*.75,o.h*.49,o.h*.25,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#dc7f91';ctx.beginPath();ctx.moveTo(o.w*.62,o.h*.31);ctx.lineTo(o.w*.65,o.h*.08);ctx.lineTo(o.w*.74,o.h*.30);ctx.closePath();ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(o.w*.77,o.h*.28);ctx.lineTo(o.w*.85,o.h*.09);ctx.lineTo(o.w*.90,o.h*.34);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#f5b3be';ctx.beginPath();ctx.ellipse(o.w*.91,o.h*.55,o.w*.14,o.h*.11,0,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#8d4e5c';ctx.beginPath();ctx.arc(o.w*.87,o.h*.55,2.5,0,Math.PI*2);ctx.arc(o.w*.95,o.h*.55,2.5,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(o.w*.70,o.h*.42,4.5,0,Math.PI*2);ctx.arc(o.w*.80,o.h*.42,4.5,0,Math.PI*2);ctx.fill();ctx.fillStyle='#222';ctx.beginPath();ctx.arc(o.w*.71,o.h*.42,2.2,0,Math.PI*2);ctx.arc(o.w*.81,o.h*.42,2.2,0,Math.PI*2);ctx.fill();ctx.fillStyle='#b96575';const step=Math.sin(stride)*5;ctx.fillRect(o.w*.25+step,o.h*.78,9,o.h*.19);ctx.fillRect(o.w*.52-step,o.h*.78,9,o.h*.19);ctx.strokeStyle='#b96575';ctx.lineWidth=4;ctx.beginPath();ctx.arc(o.w*.09,o.h*.55,9,0,Math.PI*1.8);ctx.stroke();return true;
 }
 if(o.type==='turtle'){
   ctx.strokeStyle='#57421d';ctx.lineWidth=3;ctx.fillStyle='#e0aa42';ctx.beginPath();ctx.ellipse(o.w*.46,o.h*.57,o.w*.34,o.h*.30,0,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#f2cb62';ctx.beginPath();ctx.ellipse(o.w*.46,o.h*.57,o.w*.25,o.h*.21,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#8f6d2c';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(o.w*.28,o.h*.55);ctx.lineTo(o.w*.64,o.h*.55);ctx.moveTo(o.w*.37,o.h*.39);ctx.lineTo(o.w*.37,o.h*.72);ctx.moveTo(o.w*.55,o.h*.39);ctx.lineTo(o.w*.55,o.h*.72);ctx.stroke();ctx.fillStyle='#8fc85d';ctx.strokeStyle='#3f6a32';ctx.lineWidth=3;ctx.beginPath();ctx.arc(o.w*.82,o.h*.55,o.h*.20,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(o.w*.78,o.h*.49,4,0,Math.PI*2);ctx.arc(o.w*.88,o.h*.49,4,0,Math.PI*2);ctx.fill();ctx.fillStyle='#111';ctx.beginPath();ctx.arc(o.w*.79,o.h*.49,2,0,Math.PI*2);ctx.arc(o.w*.89,o.h*.49,2,0,Math.PI*2);ctx.fill();ctx.fillStyle='#6ba64e';const step=Math.sin(stride*.55)*4;ctx.fillRect(o.w*.18+step,o.h*.78,11,5);ctx.fillRect(o.w*.57-step,o.h*.78,11,5);return true;
 }
 return false;
}

function drawScoreEffects(){
  for(const effect of scoreEffects){
    const age=effect.maxLife-effect.life;
    const fade=Math.min(1,age/8,effect.life/22);
    x.save();
    x.globalAlpha=.78*fade;x.textAlign='center';x.textBaseline='middle';
    if(effect.type==='combo'){
      const pop=1+Math.max(0,1-age/12)*.28;
      x.translate(W/2,225);x.scale(pop,pop);
      x.lineWidth=8;x.strokeStyle='rgba(40,12,5,.75)';
      x.fillStyle='#ffe45c';x.font='950 66px sans-serif';
      x.strokeText(`${effect.combo} COMBO!`,0,0);x.fillText(`${effect.combo} COMBO!`,0,0);
    }else if(effect.type==='cycloneResult'){
      const rise=Math.min(18,age*.28);
      x.translate(W/2,255-rise);
      x.lineWidth=8;x.strokeStyle='rgba(55,5,5,.80)';
      x.fillStyle='#8ff5ff';x.font='950 48px sans-serif';
      x.font='950 40px sans-serif';
      x.strokeText('MELODIC SPEED METAL RESULT',0,-55);x.fillText('MELODIC SPEED METAL RESULT',0,-55);
      x.fillStyle='#fff';x.font='950 35px sans-serif';
      x.strokeText(`${effect.combo} ANIMALS`,0,0);x.fillText(`${effect.combo} ANIMALS`,0,0);
      x.fillStyle='#ffe45c';x.font='950 40px sans-serif';
      x.strokeText(`+${fmt(effect.bonus)} BONUS`,0,50);x.fillText(`+${fmt(effect.bonus)} BONUS`,0,50);
    }else if(effect.type==='itemNotice'){
      const rise=Math.min(26,age*.35);
      const pop=1+Math.max(0,1-age/10)*.18;
      x.translate(W/2,185-rise);x.scale(pop,pop);
      x.lineWidth=7;x.strokeStyle='rgba(20,12,5,.78)';
      x.fillStyle=effect.color||'#fff';x.font='950 42px sans-serif';
      x.strokeText(effect.text,0,0);x.fillText(effect.text,0,0);
    }
    x.restore();
  }
}
const seasonStaticLayers=new Map();
let seasonLayerWidth=0,seasonLayerHeight=0;
function drawSeasonStaticScenery(ctx,sn){
 const x=ctx;
 if(sn===0){
  for(const tx of [115,520,875]){x.fillStyle='rgba(91,63,47,.72)';x.fillRect(tx-8,292,16,G-292);x.fillStyle='rgba(255,183,210,.80)';for(const [dx,dy,r] of [[-30,0,34],[8,-22,42],[42,5,31],[-2,20,38]]){x.beginPath();x.arc(tx+dx,292+dy,r,0,7);x.fill()}}
 }else if(sn===1){
  x.fillStyle='rgba(39,151,207,.70)';x.fillRect(0,302,W,98);x.fillStyle='rgba(242,211,139,.88)';x.fillRect(0,390,W,G-390);
  for(const tx of [155,760]){x.strokeStyle='rgba(91,59,31,.92)';x.lineWidth=17;x.lineCap='round';x.beginPath();x.moveTo(tx,414);x.quadraticCurveTo(tx-10,342,tx+18,274);x.stroke();x.strokeStyle='rgba(191,133,61,.90)';x.lineWidth=10;x.beginPath();x.moveTo(tx,414);x.quadraticCurveTo(tx-8,343,tx+18,274);x.stroke();x.strokeStyle='rgba(111,71,34,.55)';x.lineWidth=2;for(let j=0;j<5;j++){const yy=397-j*25;x.beginPath();x.moveTo(tx-5,yy);x.lineTo(tx+7,yy-4);x.stroke()}const crownX=tx+18,crownY=274;x.strokeStyle='rgba(25,111,59,.96)';x.lineWidth=9;x.lineCap='round';for(const [dx,dy,cx,cy] of [[-75,18,-42,-16],[-58,-28,-28,-38],[-12,-55,-9,-35],[42,-48,23,-36],[78,-12,45,-24],[68,30,42,8],[-52,40,-35,12]]){x.beginPath();x.moveTo(crownX,crownY);x.quadraticCurveTo(crownX+cx,crownY+cy,crownX+dx,crownY+dy);x.stroke()}x.fillStyle='#77502b';for(const [dx,dy] of [[-8,8],[8,10],[1,20]]){x.beginPath();x.arc(crownX+dx,crownY+dy,7,0,7);x.fill()}}
 }else if(sn===2){
  for(const [tx,col] of [[125,'#d85f36'],[500,'#e4a22d'],[845,'#b94432']]){x.fillStyle='rgba(91,59,39,.78)';x.fillRect(tx-9,292,18,G-292);x.fillStyle=col;x.globalAlpha=.78;for(const [dx,dy,r] of [[-34,5,36],[2,-24,43],[40,4,34],[4,22,39]]){x.beginPath();x.arc(tx+dx,292+dy,r,0,7);x.fill()}x.globalAlpha=1}
 }else{
  x.fillStyle='rgba(229,241,248,.94)';x.strokeStyle='rgba(113,145,164,.34)';x.lineWidth=1.25;x.beginPath();x.moveTo(0,G);x.lineTo(0,365);x.quadraticCurveTo(180,330,350,370);x.quadraticCurveTo(610,320,960,365);x.lineTo(W,G);x.fill();x.stroke();
  for(const tx of [140,760]){x.fillStyle='rgba(86,61,43,.86)';x.fillRect(tx-7,315,14,G-315);x.fillStyle='rgba(22,101,64,.90)';x.strokeStyle='rgba(16,69,50,.48)';x.lineWidth=1.5;for(const [yy,ww] of [[265,52],[295,72],[330,92]]){x.beginPath();x.moveTo(tx,yy-55);x.lineTo(tx-ww,yy+42);x.lineTo(tx+ww,yy+42);x.closePath();x.fill();x.stroke()}x.fillStyle='rgba(250,253,255,.96)';x.strokeStyle='rgba(139,168,184,.42)';x.lineWidth=1.25;for(const [yy,ww] of [[265,52],[295,72],[330,92]]){x.beginPath();x.moveTo(tx,yy-55);x.lineTo(tx-ww*.58,yy+1);x.quadraticCurveTo(tx-ww*.25,yy-5,tx,yy+6);x.quadraticCurveTo(tx+ww*.25,yy-5,tx+ww*.58,yy+1);x.closePath();x.fill();x.stroke()}x.fillStyle='#f5cf45';x.beginPath();x.arc(tx,213,7,0,7);x.fill()}
  for(const sx of [430,900]){x.fillStyle='rgba(250,253,255,.98)';x.strokeStyle='rgba(116,146,163,.50)';x.lineWidth=1.5;x.beginPath();x.arc(sx,390,34,0,7);x.fill();x.stroke();x.beginPath();x.arc(sx,345,25,0,7);x.fill();x.stroke();x.fillStyle='#26333c';x.beginPath();x.arc(sx-8,340,3,0,7);x.arc(sx+8,340,3,0,7);x.fill();x.fillStyle='#e47a32';x.beginPath();x.moveTo(sx,347);x.lineTo(sx+21,352);x.lineTo(sx,354);x.fill();x.fillStyle='#26333c';for(const by of [375,392,407]){x.beginPath();x.arc(sx,by,3,0,7);x.fill()}}
 }
}
function seasonStaticLayer(sn){
 if(seasonLayerWidth!==c.width||seasonLayerHeight!==c.height){seasonStaticLayers.clear();seasonLayerWidth=c.width;seasonLayerHeight=c.height}
 if(seasonStaticLayers.has(sn))return seasonStaticLayers.get(sn);
 const layer=document.createElement('canvas');layer.width=c.width;layer.height=c.height;
 const ctx=layer.getContext('2d');ctx.setTransform(canvasRenderScale,0,0,canvasRenderScale,0,0);
 drawSeasonStaticScenery(ctx,sn);seasonStaticLayers.set(sn,layer);
 return layer;
}
function warmSeasonStaticLayer(sn){seasonStaticLayer(sn)}
function drawSeasonScenery(sn){
 const loop=(value,size)=>((value%size)+size)%size;
 x.drawImage(seasonStaticLayer(sn),0,0,W,H);
 if(sn===1){
  x.strokeStyle='rgba(235,250,255,.72)';x.lineWidth=3;
  for(let row=0;row<3;row++){x.beginPath();for(let px=0;px<=W;px+=32){const py=326+row*27+Math.sin((px+groundOffset*.12)/48)*3;px?x.lineTo(px,py):x.moveTo(px,py)}x.stroke()}
 }
 if(sn===0){x.fillStyle='rgba(255,220,232,.85)';for(let i=0;i<18;i++){const px=loop(i*181-groundOffset*.18,1040)-40,py=90+(i*67)%270;x.beginPath();x.ellipse(px,py,4,2,((i%5)-2)*.25,0,7);x.fill()}}
 else if(sn===2){x.fillStyle='rgba(224,119,44,.80)';for(let i=0;i<16;i++){const px=loop(i*157-groundOffset*.22,1040)-40,py=110+(i*83)%285;x.save();x.translate(px,py);x.rotate(i+groundOffset*.002);x.fillRect(-5,-2,10,5);x.restore()}}
 else if(sn===3){x.fillStyle='rgba(255,255,255,.82)';for(let i=0;i<34;i++){const px=loop(i*137-groundOffset*.12,1020)-30,py=loop(i*79+groundOffset*.08,420);x.beginPath();x.arc(px,py,2+(i%3),0,7);x.fill()}}
}
function drawCycloneRainbowSky(){
  const colors=['#ff4f7b','#ff914d','#ffe55c','#65e889','#52cffa','#7868ed','#c05be8'];
  const bandHeight=68;
  const scroll=groundOffset*2.8;
  const cycle=bandHeight*colors.length;
  const modulo=(value,size)=>((value%size)+size)%size;
  x.save();
  x.beginPath();x.rect(0,0,W,G);x.clip();
  // Paint every narrow column from top to bottom with the same repeating
  // seven-color cycle. Unlike overlapping polygons, this cannot expose a
  // fallback color when a moving wave crosses the edge of the canvas.
  const columnWidth=4;
  for(let px=0;px<W;px+=columnWidth){
    const movingX=px+scroll;
    const waveOffset=modulo(-movingX*.22+Math.sin(movingX/58)*13,cycle);
    for(let band=-8;band<9;band++){
      const py=band*bandHeight+waveOffset;
      x.fillStyle=colors[modulo(band,colors.length)];
      x.fillRect(px,py,columnWidth+1,bandHeight+1);
    }
  }
  x.restore();
}
function draw(){
 x.setTransform(canvasRenderScale,0,0,canvasRenderScale,0,0);
 x.save();
 const cycloneVisual=cycloneState==='active';
 const lariatPower=lariatTimer>GAME_CONFIG.lariatWarningFrames?1:(lariatTimer>0?Math.max(.05,lariatTimer/GAME_CONFIG.lariatWarningFrames):0);
 if(lariatTimer>0&&!cycloneVisual){
   // Violent lariat shake: both translation and a tiny rotation.
   const mag=15*lariatPower;
   const sx=(Math.random()-.5)*mag;
   const sy=(Math.random()-.5)*mag;
   const rot=(Math.random()-.5)*0.012*lariatPower;
   x.translate(W/2,H/2);
   x.rotate(rot);
   x.translate(-W/2+sx,-H/2+sy);
 }
 let ph=phase(),sn=season(),s=skies[ph],g=x.createLinearGradient(0,0,0,H);
 if(cycloneVisual){
   drawCycloneRainbowSky();
 }else{
   g.addColorStop(0,`rgb(${s[0]},${s[1]},${s[2]})`);g.addColorStop(1,`rgb(${Math.max(0,s[0]-30)},${Math.max(0,s[1]-20)},${Math.max(0,s[2]-5)})`);
   x.fillStyle=g;x.fillRect(0,0,W,H);
 }

 if(lariatTimer>0&&!cycloneVisual){
   // Storm overlay: dark clouds, rain, and intermittent lightning.
   const stormAlpha=.62*lariatPower;
   x.fillStyle=`rgba(10,15,28,${stormAlpha})`;x.fillRect(0,0,W,H);

   // Rolling cloud bands.
   x.fillStyle=`rgba(38,45,62,${.88*lariatPower})`;
   for(let i=0;i<8;i++){
     const cx=(i*145 + (lariatTimer*2)%145)-100;
     const cy=55+(i%3)*32;
     x.beginPath();
     x.arc(cx,cy,42,0,Math.PI*2);
     x.arc(cx+38,cy+4,52,0,Math.PI*2);
     x.arc(cx+82,cy+2,39,0,Math.PI*2);
     x.fill();
   }

   // Heavy slanted rain.
   x.strokeStyle=`rgba(210,225,255,${.65*lariatPower})`;
   x.lineWidth=2;
   x.beginPath();
   const rainShift=(240-lariatTimer)*17;
   for(let i=0;i<70;i++){
     const rx=((i*73+rainShift)%1040)-40;
     const ry=((i*119+rainShift*1.7)%620)-40;
     x.moveTo(rx,ry);
     x.lineTo(rx-11,ry+27);
   }
   x.stroke();

   // Lightning flash every so often.
   if(lariatTimer>GAME_CONFIG.lariatWarningFrames&&(lariatTimer%58)<5){
     if(!thunderLatch){sfxThunder();thunderLatch=true;}
     x.fillStyle='rgba(235,242,255,.40)';
     x.fillRect(0,0,W,H);
     x.strokeStyle='rgba(255,255,255,.95)';
     x.lineWidth=4;
     const bx=620;
     x.beginPath();
     x.moveTo(bx,20);
     x.lineTo(bx-28,105);
     x.lineTo(bx+5,105);
     x.lineTo(bx-38,205);
     x.stroke();
   }else thunderLatch=false;
 }
 if(!cycloneVisual){
   // stars / sun / moon
   if(ph===3){x.fillStyle='#fff8';for(let i=0;i<35;i++)x.fillRect((i*137)%W,(i*71)%260,2,2);x.fillStyle='#eef3ff';x.beginPath();x.arc(790,90,32,0,7);x.fill()}
   else{x.fillStyle=ph===2?'#ffcf80':'#ffe789';x.beginPath();x.arc(790,90,40,0,7);x.fill()}
   if(sn!==1){
    if(sn===0)x.fillStyle='#76aa70';
    else if(sn===2){const autumnMountains=x.createLinearGradient(0,300,W,370);autumnMountains.addColorStop(0,'#df8b6e');autumnMountains.addColorStop(.52,'#e8b15d');autumnMountains.addColorStop(1,'#d87962');x.fillStyle=autumnMountains}
    else x.fillStyle='#f4f7f9';
    x.beginPath();x.moveTo(0,G);x.lineTo(0,355);x.quadraticCurveTo(150,270,300,355);x.quadraticCurveTo(470,255,630,355);x.quadraticCurveTo(800,280,960,350);x.lineTo(960,G);x.fill();
    if(sn===3){x.strokeStyle='rgba(112,145,160,.38)';x.lineWidth=1.25;x.stroke()}
   }
   drawSeasonScenery(sn);
 }
 const groundColors=[['#5b3d2e','#3f8c3a'],['#9c7139','#e3bd62'],['#62402d','#b87532'],['#aebfca','#f7fbff']][sn];
 x.fillStyle=groundColors[0];x.fillRect(0,G,W,H-G);
 x.fillStyle=groundColors[1];x.fillRect(0,G,W,12);
 if(sn===3){
  // This line marks the exact collision/landing surface; background outlines
  // stay faint so this remains the only strong horizontal winter landmark.
  x.strokeStyle='#617f8e';x.lineWidth=3;x.beginPath();x.moveTo(0,G+.5);x.lineTo(W,G+.5);x.stroke();
 }

 // Ground kept visually fixed: no scrolling dots, stones or grass.
 drawScoreEffects();
 // Rescue shield
 for(const it of items){
   if(it.taken)continue;
   x.save();
   x.translate(it.x,it.y+Math.sin(it.bob)*4);
   x.font='900 12px sans-serif';x.textAlign='center';x.lineWidth=3;x.strokeStyle='rgba(0,0,0,.75)';x.fillStyle='#fff';
   const label=it.type==='shield'?'🛡 GUARD':(it.type==='speedDown'?'🐢 SPEED DOWN':(it.type==='speedUp'?'🐈 SPEED UP':(it.type==='hover'?'🚀 HOVER':(it.type==='cyclonePiece'?'🤘 METAL':`⚡ CHARGE +${Math.round(GAME_CONFIG.chargeRecoveryRatio*100)}%`))));x.strokeText(label,23,-8);x.fillText(label,23,-8);
   drawItemSprite(x,it.type);
   x.restore();
 }

 for(const o of obs){
  let oy=o.y??G-o.h;
  x.save();
  x.translate(o.x,oy);
  if(o.flying){
    x.translate(o.w/2,o.h/2);
    x.rotate(o.flyRot);
    x.translate(-o.w/2,-o.h/2);
  }
  if(ANIMAL_TYPES.includes(o.type)){
    // Most animals face left. Dog faces whichever way it is currently running.
    const faceLeft = o.type==='dog' ? (o.dogDir<0) : true;
    if(faceLeft){
      x.translate(o.w,0);
      x.scale(-1,1);
    }
  }

  // Locomotion animation. Collision boxes stay unchanged.
  const stride=o.age*.23;
  if(o.type==='pig' || o.type==='dog' || o.type==='cat'){
    const bounce=Math.abs(Math.sin(stride))*3;
    const tilt=Math.sin(stride)*0.035;
    x.translate(0,-bounce);
    x.translate(o.w/2,o.h/2);x.rotate(tilt);x.translate(-o.w/2,-o.h/2);
  }else if(o.type==='turtle'){
    x.translate(0,-Math.abs(Math.sin(stride*.55))*1.2);
  }else if(o.type==='rabbit'){
    x.translate(0,-Math.abs(Math.sin(stride*.8))*1.5);
  }else if(o.type==='cow'){
    const cowBounce=Math.abs(Math.sin(stride*.46))*2.5;
    const cowTilt=Math.sin(stride*.46)*0.018;
    x.translate(0,-cowBounce);
    x.translate(o.w/2,o.h/2);x.rotate(cowTilt);x.translate(-o.w/2,-o.h/2);
  }

  if(drawTutorialAnimalSprite(x,o)){
    // Pig and turtle are rendered by the shared sprite component.
  }else if(o.type==='pig'){
    // Chibi pig: pink round body, big snout, triangle ears and curly tail.
    x.strokeStyle='#8d4e5c';x.lineWidth=3;
    x.fillStyle='#ef9cab';

    // Body.
    x.beginPath();x.ellipse(o.w*.43,o.h*.61,o.w*.34,o.h*.27,0,0,Math.PI*2);x.fill();x.stroke();

    // Big round head.
    x.beginPath();x.arc(o.w*.75,o.h*.49,o.h*.25,0,Math.PI*2);x.fill();x.stroke();

    // Ears.
    x.fillStyle='#dc7f91';
    x.beginPath();x.moveTo(o.w*.62,o.h*.31);x.lineTo(o.w*.65,o.h*.08);x.lineTo(o.w*.74,o.h*.30);x.closePath();x.fill();x.stroke();
    x.beginPath();x.moveTo(o.w*.77,o.h*.28);x.lineTo(o.w*.85,o.h*.09);x.lineTo(o.w*.90,o.h*.34);x.closePath();x.fill();x.stroke();

    // Large pig snout.
    x.fillStyle='#f5b3be';
    x.beginPath();x.ellipse(o.w*.91,o.h*.55,o.w*.14,o.h*.11,0,0,Math.PI*2);x.fill();x.stroke();
    x.fillStyle='#8d4e5c';
    x.beginPath();x.arc(o.w*.87,o.h*.55,2.5,0,Math.PI*2);x.arc(o.w*.95,o.h*.55,2.5,0,Math.PI*2);x.fill();

    // Big chibi eyes.
    x.fillStyle='#fff';
    x.beginPath();x.arc(o.w*.70,o.h*.42,4.5,0,Math.PI*2);x.arc(o.w*.80,o.h*.42,4.5,0,Math.PI*2);x.fill();
    x.fillStyle='#222';
    x.beginPath();x.arc(o.w*.71,o.h*.42,2.2,0,Math.PI*2);x.arc(o.w*.81,o.h*.42,2.2,0,Math.PI*2);x.fill();

    // Short legs.
    x.fillStyle='#b96575';
    const pigStep=Math.sin(stride)*5;
    x.fillRect(o.w*.25+pigStep,o.h*.78,9,o.h*.19);
    x.fillRect(o.w*.52-pigStep,o.h*.78,9,o.h*.19);

    // Obvious curly tail.
    x.strokeStyle='#b96575';x.lineWidth=4;
    x.beginPath();x.arc(o.w*.09,o.h*.55,9,0,Math.PI*1.8);x.stroke();

  } else if(o.type==='turtle'){
    // Chibi turtle: domed shell, large friendly head, stubby feet.
    x.strokeStyle='#57421d';x.lineWidth=3;
    x.fillStyle='#e0aa42';
    x.beginPath();x.ellipse(o.w*.46,o.h*.57,o.w*.34,o.h*.30,0,0,Math.PI*2);x.fill();x.stroke();
    x.fillStyle='#f2cb62';
    x.beginPath();x.ellipse(o.w*.46,o.h*.57,o.w*.25,o.h*.21,0,0,Math.PI*2);x.fill();
    x.strokeStyle='#8f6d2c';x.lineWidth=2;
    x.beginPath();x.moveTo(o.w*.28,o.h*.55);x.lineTo(o.w*.64,o.h*.55);x.moveTo(o.w*.37,o.h*.39);x.lineTo(o.w*.37,o.h*.72);x.moveTo(o.w*.55,o.h*.39);x.lineTo(o.w*.55,o.h*.72);x.stroke();
    x.fillStyle='#8fc85d';
    x.strokeStyle='#3f6a32';x.lineWidth=3;
    x.beginPath();x.arc(o.w*.82,o.h*.55,o.h*.20,0,Math.PI*2);x.fill();x.stroke();
    x.fillStyle='#fff';
    x.beginPath();x.arc(o.w*.78,o.h*.49,4,0,Math.PI*2);x.arc(o.w*.88,o.h*.49,4,0,Math.PI*2);x.fill();
    x.fillStyle='#111';
    x.beginPath();x.arc(o.w*.79,o.h*.49,2,0,Math.PI*2);x.arc(o.w*.89,o.h*.49,2,0,Math.PI*2);x.fill();
    x.fillStyle='#6ba64e';
    const turtleStep=Math.sin(stride*.55)*4;
    x.fillRect(o.w*.18+turtleStep,o.h*.78,11,5);
    x.fillRect(o.w*.57-turtleStep,o.h*.78,11,5);

  } else if(o.type==='frog'){
    // Chibi frog style baseline.
    x.fillStyle='#49a84f';
    x.strokeStyle='#256c2d';x.lineWidth=3;
    x.beginPath();x.ellipse(o.w*.50,o.h*.60,o.w*.32,o.h*.25,0,0,Math.PI*2);x.fill();x.stroke();
    x.beginPath();x.arc(o.w*.30,o.h*.27,o.h*.18,0,Math.PI*2);x.arc(o.w*.70,o.h*.27,o.h*.18,0,Math.PI*2);x.fill();x.stroke();
    x.fillStyle='#fff';
    x.beginPath();x.arc(o.w*.30,o.h*.25,4,0,Math.PI*2);x.arc(o.w*.70,o.h*.25,4,0,Math.PI*2);x.fill();
    x.fillStyle='#111';
    x.beginPath();x.arc(o.w*.30,o.h*.25,2,0,Math.PI*2);x.arc(o.w*.70,o.h*.25,2,0,Math.PI*2);x.fill();
    x.strokeStyle='#256c2d';x.lineWidth=5;
    x.beginPath();x.moveTo(o.w*.30,o.h*.70);x.lineTo(o.w*.08,o.h*.94);x.moveTo(o.w*.70,o.h*.70);x.lineTo(o.w*.92,o.h*.94);x.stroke();

  } else if(o.type==='dog'){
    // Chibi dog: round head, floppy ear, short body, curled tail.
    x.strokeStyle='#74451f';x.lineWidth=3;
    x.fillStyle='#d99a57';
    x.beginPath();x.ellipse(o.w*.45,o.h*.60,o.w*.31,o.h*.24,0,0,Math.PI*2);x.fill();x.stroke();
    x.beginPath();x.arc(o.w*.76,o.h*.46,o.h*.24,0,Math.PI*2);x.fill();x.stroke();
    x.fillStyle='#9d6534';
    x.beginPath();x.ellipse(o.w*.68,o.h*.29,7,13,-.5,0,Math.PI*2);x.fill();
    x.fillStyle='#fff';
    x.beginPath();x.arc(o.w*.72,o.h*.41,4,0,Math.PI*2);x.arc(o.w*.82,o.h*.41,4,0,Math.PI*2);x.fill();
    x.fillStyle='#111';
    x.beginPath();x.arc(o.w*.73,o.h*.41,2,0,Math.PI*2);x.arc(o.w*.83,o.h*.41,2,0,Math.PI*2);x.fill();
    x.fillStyle='#f0b974';
    x.beginPath();x.ellipse(o.w*.90,o.h*.54,9,6,0,0,Math.PI*2);x.fill();
    x.fillStyle='#111';x.beginPath();x.arc(o.w*.96,o.h*.52,2.5,0,Math.PI*2);x.fill();
    x.fillStyle='#74451f';
    const dogStep=Math.sin(stride)*6;
    x.fillRect(o.w*.28+dogStep,o.h*.78,7,o.h*.18);
    x.fillRect(o.w*.55-dogStep,o.h*.78,7,o.h*.18);
    x.strokeStyle='#9d6534';x.lineWidth=5;
    x.beginPath();x.arc(o.w*.15,o.h*.52,10,Math.PI*.9,Math.PI*2.1);x.stroke();

  } else if(o.type==='cat'){
    // Fast cat: slim silhouette, pointed ears and a long raised tail.
    x.strokeStyle='#4b3b38';x.lineWidth=3;x.fillStyle='#9a8178';
    x.beginPath();x.ellipse(o.w*.45,o.h*.63,o.w*.31,o.h*.22,0,0,Math.PI*2);x.fill();x.stroke();
    x.beginPath();x.arc(o.w*.76,o.h*.43,o.h*.22,0,Math.PI*2);x.fill();x.stroke();
    x.beginPath();x.moveTo(o.w*.62,o.h*.28);x.lineTo(o.w*.66,o.h*.05);x.lineTo(o.w*.75,o.h*.25);x.closePath();x.fill();x.stroke();
    x.beginPath();x.moveTo(o.w*.77,o.h*.24);x.lineTo(o.w*.88,o.h*.04);x.lineTo(o.w*.91,o.h*.31);x.closePath();x.fill();x.stroke();
    x.fillStyle='#d8ef80';x.beginPath();x.arc(o.w*.72,o.h*.40,3.8,0,Math.PI*2);x.arc(o.w*.82,o.h*.40,3.8,0,Math.PI*2);x.fill();
    x.fillStyle='#161616';x.fillRect(o.w*.715,o.h*.35,1.8,8);x.fillRect(o.w*.815,o.h*.35,1.8,8);
    x.strokeStyle='#eee0d5';x.lineWidth=1.5;x.beginPath();x.moveTo(o.w*.87,o.h*.50);x.lineTo(o.w*1.05,o.h*.43);x.moveTo(o.w*.87,o.h*.53);x.lineTo(o.w*1.05,o.h*.57);x.stroke();
    x.strokeStyle='#4b3b38';x.lineWidth=4;x.beginPath();x.moveTo(o.w*.18,o.h*.59);x.quadraticCurveTo(-5,o.h*.30,o.w*.10,o.h*.08);x.stroke();
    const catStep=Math.sin(stride*1.35)*7;x.fillStyle='#65514b';
    x.fillRect(o.w*.28+catStep,o.h*.76,6,o.h*.23);x.fillRect(o.w*.55-catStep,o.h*.76,6,o.h*.23);

  } else if(o.type==='monkey'){
    // Small monkey with a long curled tail. It faces left after the common flip.
    x.strokeStyle='#4c3428';x.lineWidth=3;x.fillStyle='#8b5a3c';
    x.beginPath();x.ellipse(o.w*.48,o.h*.62,o.w*.27,o.h*.24,0,0,Math.PI*2);x.fill();x.stroke();
    x.beginPath();x.arc(o.w*.75,o.h*.38,o.h*.23,0,Math.PI*2);x.fill();x.stroke();
    x.fillStyle='#d7a46c';x.beginPath();x.ellipse(o.w*.80,o.h*.47,o.w*.16,o.h*.13,0,0,Math.PI*2);x.fill();
    x.fillStyle='#fff';x.beginPath();x.arc(o.w*.70,o.h*.35,3.5,0,Math.PI*2);x.arc(o.w*.80,o.h*.35,3.5,0,Math.PI*2);x.fill();
    x.fillStyle='#111';x.beginPath();x.arc(o.w*.71,o.h*.35,1.5,0,Math.PI*2);x.arc(o.w*.81,o.h*.35,1.5,0,Math.PI*2);x.fill();
    const monkeyStep=Math.sin(stride*1.2)*5;x.fillStyle='#5f3c2c';
    x.fillRect(o.w*.30+monkeyStep,o.h*.76,6,o.h*.20);x.fillRect(o.w*.53-monkeyStep,o.h*.76,6,o.h*.20);
    x.strokeStyle='#4c3428';x.lineWidth=5;x.lineCap='round';x.beginPath();x.moveTo(o.w*.24,o.h*.61);x.quadraticCurveTo(-3,o.h*.28,o.w*.12,o.h*.13);x.quadraticCurveTo(o.w*.24,o.h*.07,o.w*.20,o.h*.24);x.stroke();

  } else if(o.type==='snake'){
    // The snake leans forward toward Sakata as it rises.
    const lift=o.rearLift||0;
    x.strokeStyle='#2f6538';x.lineWidth=7;x.lineCap='round';
    x.fillStyle='#68b96d';

    // Ground body stays visible in both states.
    const baseY=o.h-7;
    x.beginPath();
    x.moveTo(5,baseY);
    x.bezierCurveTo(o.w*.18,baseY-10,o.w*.30,baseY+8,o.w*.42,baseY);
    x.bezierCurveTo(o.w*.54,baseY-8,o.w*.62,baseY+5,o.w*.68,baseY-2);
    x.stroke();

    // Art is mirrored for left-facing animals, so local right is forward.
    // The raised neck therefore reaches farther toward Sakata on screen.
    const anchorX=o.w*.68,anchorY=baseY-2;
    const headX=o.w*(.80+.35*lift);
    const headY=baseY-(1+lift*o.h*.70);
    x.beginPath();
    x.moveTo(anchorX,anchorY);
    x.quadraticCurveTo(anchorX+o.w*.18,baseY-o.h*.42,headX,headY+8);
    x.stroke();

    // Large head.
    x.strokeStyle='#2f6538';x.lineWidth=3;
    x.beginPath();x.ellipse(headX,headY,13,10,0,0,Math.PI*2);x.fill();x.stroke();

    // Eyes.
    x.fillStyle='#fff';
    x.beginPath();x.arc(headX-4,headY-2,3.5,0,Math.PI*2);x.arc(headX+4,headY-2,3.5,0,Math.PI*2);x.fill();
    x.fillStyle='#111';
    x.beginPath();x.arc(headX-4.5,headY-2,1.6,0,Math.PI*2);x.arc(headX+3.5,headY-2,1.6,0,Math.PI*2);x.fill();

    // Tongue when raised, making the high state extra obvious.
    if(lift>0.55){
      x.strokeStyle='#c64e62';x.lineWidth=2;
      x.beginPath();x.moveTo(headX+12,headY+2);x.lineTo(headX+20,headY+2);x.lineTo(headX+24,headY-1);
      x.moveTo(headX+20,headY+2);x.lineTo(headX+24,headY+5);x.stroke();
    }

  } else if(o.type==='rabbit'){
    // Chibi rabbit: white body, very long ears, compact legs.
    x.strokeStyle='#7d7d86';x.lineWidth=3;
    x.fillStyle='#f2f0eb';
    x.beginPath();x.ellipse(o.w*.42,o.h*.62,o.w*.28,o.h*.23,0,0,Math.PI*2);x.fill();x.stroke();
    x.beginPath();x.arc(o.w*.70,o.h*.48,o.h*.20,0,Math.PI*2);x.fill();x.stroke();
    x.fillStyle='#e7c4cf';
    x.beginPath();x.ellipse(o.w*.63,o.h*.16,6,16,-.16,0,Math.PI*2);x.fill();x.stroke();
    x.beginPath();x.ellipse(o.w*.76,o.h*.14,6,17,.12,0,Math.PI*2);x.fill();x.stroke();
    x.fillStyle='#fff';x.beginPath();x.arc(o.w*.68,o.h*.44,3.5,0,Math.PI*2);x.arc(o.w*.77,o.h*.44,3.5,0,Math.PI*2);x.fill();
    x.fillStyle='#111';x.beginPath();x.arc(o.w*.69,o.h*.44,1.7,0,Math.PI*2);x.arc(o.w*.78,o.h*.44,1.7,0,Math.PI*2);x.fill();
    x.fillStyle='#c88f9c';x.beginPath();x.arc(o.w*.84,o.h*.52,2.5,0,Math.PI*2);x.fill();
    x.fillStyle='#8b8b93';x.fillRect(o.w*.24,o.h*.80,8,o.h*.15);x.fillRect(o.w*.50,o.h*.80,8,o.h*.15);

  } else if(o.type==='cow'){
    // Chibi cow: large black-and-white body, horns, big head.
    x.strokeStyle='#3a3a3a';x.lineWidth=4;
    x.fillStyle='#f3f1e8';
    x.beginPath();x.ellipse(o.w*.44,o.h*.62,o.w*.34,o.h*.27,0,0,Math.PI*2);x.fill();x.stroke();
    x.fillStyle='#343434';
    x.beginPath();x.ellipse(o.w*.32,o.h*.55,15,11,.2,0,Math.PI*2);x.fill();
    x.beginPath();x.ellipse(o.w*.52,o.h*.68,14,10,-.3,0,Math.PI*2);x.fill();
    x.fillStyle='#f3f1e8';
    x.beginPath();x.arc(o.w*.76,o.h*.45,o.h*.23,0,Math.PI*2);x.fill();x.stroke();
    x.fillStyle='#d79da3';
    x.beginPath();x.ellipse(o.w*.84,o.h*.56,16,10,0,0,Math.PI*2);x.fill();x.stroke();
    x.fillStyle='#fff';x.beginPath();x.arc(o.w*.70,o.h*.40,4,0,Math.PI*2);x.arc(o.w*.80,o.h*.40,4,0,Math.PI*2);x.fill();
    x.fillStyle='#111';x.beginPath();x.arc(o.w*.71,o.h*.40,2,0,Math.PI*2);x.arc(o.w*.81,o.h*.40,2,0,Math.PI*2);x.fill();
    x.fillStyle='#d7c39a';
    x.beginPath();x.moveTo(o.w*.64,o.h*.30);x.lineTo(o.w*.57,o.h*.16);x.lineTo(o.w*.70,o.h*.28);x.fill();
    x.beginPath();x.moveTo(o.w*.82,o.h*.29);x.lineTo(o.w*.91,o.h*.15);x.lineTo(o.w*.88,o.h*.32);x.fill();
    x.fillStyle='#3a3a3a';
    const cowStep=Math.sin(stride*.46)*8;
    x.fillRect(o.w*.24+cowStep,o.h*.80,10,o.h*.18);
    x.fillRect(o.w*.52-cowStep,o.h*.80,10,o.h*.18);

  } else if(o.type==='birds'){
    // Birds: bright blue, horizontal flock, rounded wings and yellow beaks.
    const body='#e2b94f';
    const outline='#765f25';
    const positions=[
      [20,14],[55,8],[90,14],[125,8]
    ];
    for(const [bx,by] of positions){
      x.strokeStyle=outline;x.lineWidth=3;x.fillStyle=body;
      x.beginPath();x.ellipse(bx,by+11,11,8,0,0,Math.PI*2);x.fill();x.stroke();

      // single rounded wing
      x.beginPath();x.ellipse(bx-8,by+9,8,5,-.5,0,Math.PI*2);x.fill();x.stroke();

      // eye
      x.fillStyle='#fff';x.beginPath();x.arc(bx+4,by+8,3.2,0,Math.PI*2);x.fill();
      x.fillStyle='#111';x.beginPath();x.arc(bx+5,by+8,1.5,0,Math.PI*2);x.fill();

      // yellow beak
      x.fillStyle='#c8782e';
      x.beginPath();x.moveTo(bx+10,by+11);x.lineTo(bx+18,by+14);x.lineTo(bx+10,by+16);x.closePath();x.fill();
    }

  } else if(o.type==='crow'){
    // Crow flies above jump height; only its dropping becomes a hazard.
    const flap=Math.sin(stride*1.8)*8;
    x.shadowColor='rgba(65,157,190,.48)';x.shadowBlur=6;
    x.fillStyle='#465066';x.strokeStyle='#4f9fbe';x.lineWidth=2;
    x.beginPath();x.ellipse(o.w*.48,o.h*.58,o.w*.21,o.h*.16,0,0,Math.PI*2);x.fill();x.stroke();
    x.beginPath();x.arc(o.w*.70,o.h*.46,o.h*.16,0,Math.PI*2);x.fill();x.stroke();
    x.beginPath();x.moveTo(o.w*.42,o.h*.57);x.lineTo(o.w*.17,o.h*.28-flap*.35);x.lineTo(o.w*.29,o.h*.70);x.closePath();x.fill();x.stroke();
    x.beginPath();x.moveTo(o.w*.53,o.h*.57);x.lineTo(o.w*.37,o.h*.25+flap*.35);x.lineTo(o.w*.68,o.h*.70);x.closePath();x.fill();x.stroke();
    x.fillStyle='#d7a64a';x.beginPath();x.moveTo(o.w*.83,o.h*.49);x.lineTo(o.w*.96,o.h*.54);x.lineTo(o.w*.83,o.h*.58);x.closePath();x.fill();
    x.fillStyle='#f2efc8';x.beginPath();x.arc(o.w*.73,o.h*.42,2.5,0,Math.PI*2);x.fill();
    x.shadowBlur=0;

  } else if(o.type==='bats'){
    // Bats: purple V-shaped swarm, pointed wings and ears, stronger vertical spread.
    const body='#665071';
    const outline='#31283a';
    const positions=[
      [18,24],[50,10],[86,2],[122,10],[154,24]
    ];
    for(const [bx,by] of positions){
      x.strokeStyle=outline;x.lineWidth=3;x.fillStyle=body;

      // body/head
      x.beginPath();x.ellipse(bx,by+15,6,9,0,0,Math.PI*2);x.fill();x.stroke();

      // angular wings
      x.beginPath();
      x.moveTo(bx-4,by+14);
      x.lineTo(bx-20,by+4);
      x.lineTo(bx-15,by+18);
      x.lineTo(bx-9,by+12);
      x.closePath();
      x.fill();x.stroke();

      x.beginPath();
      x.moveTo(bx+4,by+14);
      x.lineTo(bx+20,by+4);
      x.lineTo(bx+15,by+18);
      x.lineTo(bx+9,by+12);
      x.closePath();
      x.fill();x.stroke();

      // small red eyes, non-glowing
      x.fillStyle='#9e4d57';
      x.fillRect(bx-3,by+11,2,2);x.fillRect(bx+2,by+11,2,2);
    }

  } else {
    x.fillStyle='#777';x.fillRect(0,0,o.w,o.h);
  }
  x.restore();
 }
 for(const peel of bananaPeels){
   x.save();x.translate(peel.x,peel.y);
   x.strokeStyle='#8a6818';x.lineWidth=2;x.fillStyle=peel.landed?'#f2d15c':'#ffe47a';
   x.beginPath();x.moveTo(2,0);x.quadraticCurveTo(10,-12,17,-2);x.quadraticCurveTo(23,-12,31,0);x.quadraticCurveTo(17,5,2,0);x.fill();x.stroke();
   if(!peel.landed){x.fillStyle='#fff0a0';x.beginPath();x.arc(17,-4,3,0,Math.PI*2);x.fill()}
   x.restore();
 }
 for(const dropping of crowDroppings){
   x.save();x.translate(dropping.x,dropping.y);
   x.shadowColor='rgba(183,255,124,.75)';x.shadowBlur=dropping.landed?6:10;
   x.fillStyle=dropping.landed?'#9bd85f':'#b9f27a';x.strokeStyle='#304229';x.lineWidth=1.5;
   if(dropping.landed){
     x.beginPath();x.ellipse(14,0,14,5,0,0,Math.PI*2);x.fill();x.stroke();
     x.fillStyle='#fff3c1';x.beginPath();x.arc(14,-1,3,0,Math.PI*2);x.fill();
   }else{
     x.beginPath();x.arc(10,0,6,0,Math.PI*2);x.fill();x.stroke();
     x.fillStyle='#fff3c1';x.beginPath();x.arc(8,-2,2,0,Math.PI*2);x.fill();
   }
   x.restore();
 }
 if(!playerExploded){
 x.save();
 if(rescueInvuln>0 && Math.floor(rescueInvuln/5)%2===0)x.globalAlpha=.4;
 if(lariatEndInvuln>0 && Math.floor(lariatEndInvuln/5)%2===0)x.globalAlpha=.25;
 x.translate(p.x+p.w/2,p.y+p.h/2);
 const spin=lariatTimer>0&&cycloneState!=='active' ? (70-lariatTimer)*0.55 : p.rot;
 x.rotate(spin);
 if(lariatTimer>0){
   x.strokeStyle='#f4d35e';x.lineWidth=7;x.globalAlpha=.9;
   x.beginPath();x.arc(0,0,48,0,Math.PI*2);x.stroke();
   x.globalAlpha=1;
 }
 if(lariatTimer>0&&lariatTimer<=GAME_CONFIG.lariatWarningFrames){
   const blinkFrames=lariatTimer<=GAME_CONFIG.lariatCriticalFrames?3:8;
   if(Math.floor(lariatTimer/blinkFrames)%2===0)x.globalAlpha=.22;
 }
 if(hoverFuelFrames>0){
   const fuelRatio=Math.max(0,Math.min(1,hoverFuelFrames/GAME_CONFIG.hoverDurationFrames));
   const bodyShade=Math.round(28+105*fuelRatio),highlightShade=Math.round(38+160*fuelRatio);
   x.save();
   x.lineWidth=2;x.strokeStyle='#172027';x.fillStyle=`rgb(${bodyShade},${bodyShade+13},${bodyShade+20})`;
   x.fillRect(-38,-19,14,35);x.strokeRect(-38,-19,14,35);
   x.fillStyle=`rgb(${highlightShade},${highlightShade+15},${highlightShade+20})`;x.fillRect(-35,-15,8,22);
   x.fillStyle='#10171c';x.fillRect(-37,-24,12,6);
   // Large fuel meter beside the hover device. The lit section retreats from
   // the top toward the bottom as fuel is spent, so it remains legible in play.
   const meterX=-56,meterY=-27,meterW=14,meterH=52,innerX=meterX+3,innerY=meterY+3,innerW=8,innerH=46;
   x.fillStyle='#10171c';x.fillRect(meterX,meterY,meterW,meterH);
   x.lineWidth=2;x.strokeStyle='#54d9f5';x.strokeRect(meterX,meterY,meterW,meterH);
   x.fillStyle='#18333c';x.fillRect(innerX,innerY,innerW,innerH);
   const remainingHeight=innerH*fuelRatio,remainingY=innerY+innerH-remainingHeight;
   x.fillStyle='#6df0ff';x.fillRect(innerX,remainingY,innerW,remainingHeight);
   x.fillStyle='rgba(255,255,255,.62)';x.fillRect(innerX+1,remainingY,2,remainingHeight);
   if(hoverActive){
     const flame=8+(Math.floor(performance.now()/60)%2)*5;
     x.fillStyle='#ff8a28';x.beginPath();x.moveTo(-36,17);x.lineTo(-25,17);x.lineTo(-30,17+flame);x.closePath();x.fill();
     x.fillStyle='#fff2a0';x.beginPath();x.moveTo(-34,17);x.lineTo(-27,17);x.lineTo(-30,22+flame*.35);x.closePath();x.fill();
   }
   x.restore();
 }
 drawSakataSprite(x,76);
  x.restore();
 }
 for(const particle of hoverBreakParticles){
   x.save();x.globalAlpha=particle.life/particle.maxLife;
   x.fillStyle=particle.hot?'#ff9f2e':'#53616a';
   x.beginPath();x.arc(particle.x,particle.y,particle.size,0,Math.PI*2);x.fill();
   if(particle.hot){x.fillStyle='#fff2a0';x.beginPath();x.arc(particle.x,particle.y,Math.max(1,particle.size*.45),0,Math.PI*2);x.fill()}
   x.restore();
 }
  x.globalAlpha=1;
  if(gameOverFragments.length){
    const sw=sakataImg.naturalWidth/4,sh=sakataImg.naturalHeight/4;
    for(const f of gameOverFragments){
      x.save();x.translate(f.x,f.y);
      x.globalAlpha=Math.max(0,Math.min(1,f.life/18));
      if(f.spark){
        x.fillStyle=f.life%3<1?'#fff3a6':(f.life%2<1?'#ffb21c':'#d82818');
        x.beginPath();x.arc(0,0,f.size,0,Math.PI*2);x.fill();
      }else{
        x.rotate(f.rot);
        if(sakataImg.complete&&sakataImg.naturalWidth){
          x.drawImage(sakataImg,f.col*sw,f.row*sh,sw,sh,-f.size/2,-f.size/2,f.size,f.size);
        }else{
          x.fillStyle='#8b2f2f';x.fillRect(-f.size/2,-f.size/2,f.size,f.size);
        }
      }
      x.restore();
    }
    x.globalAlpha=1;
  }
  if(debugHitboxes){
    const drawHitbox=(box,color,label)=>{
      x.save();
      x.strokeStyle=color;x.lineWidth=2;x.setLineDash([7,4]);
      x.strokeRect(box.x,box.y,box.w,box.h);
      if(label){
        x.setLineDash([]);x.font='bold 12px sans-serif';
        const tw=x.measureText(label).width;
        x.fillStyle='rgba(0,0,0,.72)';x.fillRect(box.x,Math.max(0,box.y-17),tw+8,17);
        x.fillStyle=color;x.fillText(label,box.x+4,Math.max(12,box.y-4));
      }
      x.restore();
    };
    for(const o of obs){
      obstacleHitboxes(o).forEach((box,i)=>drawHitbox(box,'#ff4d4d',i===0?o.type.toUpperCase():''));
    }
    for(const peel of bananaPeels){
      if(peel.landed)drawHitbox({x:peel.x+3,y:peel.y-7,w:28,h:9},'#ffb21c','BANANA');
    }
    for(const dropping of crowDroppings){
      const droppingHitbox=dropping.landed
        ? {x:dropping.x+3,y:dropping.y-8,w:22,h:10}
        : {x:dropping.x+4,y:dropping.y-6,w:12,h:12};
      drawHitbox(droppingHitbox,'#b9f27a','CROW POOP');
    }
    if(!playerExploded&&lariatEndInvuln<=0)drawHitbox(playerHitbox(),'#38e8ff','PLAYER');
    x.save();
    x.font='bold 15px sans-serif';x.textAlign='right';
    x.fillStyle='rgba(0,0,0,.72)';x.fillRect(W-182,12,170,28);
    x.fillStyle='#ffe45c';x.fillText('HITBOX DEBUG [D]',W-20,32);
    x.restore();
  }
  for(const d of dusts){x.globalAlpha=d.life/30;x.fillStyle='#ddd';x.fillRect(d.x,d.y,4,4)}x.globalAlpha=1;
 document.querySelector('#scoreValue').textContent=fmt(displayedTotalScore);
 const scoreGain=document.querySelector('#scoreGain');
 const activeNoticeIds=new Set(scoreGainNotices.map(notice=>String(notice.id)));
 [...scoreGain.children].forEach(node=>{if(!activeNoticeIds.has(node.dataset.noticeId))node.remove()});
 scoreGainNotices.forEach(notice=>{
   let node=scoreGain.querySelector(`[data-notice-id="${notice.id}"]`);
   if(!node){
     node=document.createElement('span');node.className='scoreGainNotice';node.dataset.noticeId=String(notice.id);node.textContent=`+${fmt(notice.points)}`;scoreGain.appendChild(node);
   }
 });
 const debugItemLine=DEBUG_BUILD&&debugModeEnabled?`<span style="color:#9ff7ff">DEBUG STAGE ${stage} / SPEED ${speed.toFixed(2)}</span><br><span style="color:#ffe45c">DEBUG ITEM ${itemChanceActive?'ACTIVE':(itemChancePending?'PREP ': 'NEXT ')+(itemChancePending?fmt(nextItemChanceAt):fmt(Math.max(dist,nextItemChanceAt)))+'m'}</span>`:'';
 document.querySelector('#sub').innerHTML=debugItemLine;
 x.restore();
}
