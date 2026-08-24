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
      x.strokeText(`${effect.combo} COMBO!`,0,-22);x.fillText(`${effect.combo} COMBO!`,0,-22);
      x.fillStyle='#fff';x.font='950 38px sans-serif';
      x.strokeText(`+${fmt(effect.points)}`,0,40);x.fillText(`+${fmt(effect.points)}`,0,40);
    }else if(effect.type==='lariatResult'){
      const rise=Math.min(18,age*.35);
      x.translate(W/2,260-rise);
      x.lineWidth=7;x.strokeStyle='rgba(20,5,5,.72)';
      x.fillStyle='#ffcf3f';x.font='950 48px sans-serif';
      x.strokeText('LARIAT RESULT',0,-55);x.fillText('LARIAT RESULT',0,-55);
      x.fillStyle='#fff';x.font='950 35px sans-serif';
      x.strokeText(`${effect.combo} COMBO`,0,0);x.fillText(`${effect.combo} COMBO`,0,0);
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
function drawSeasonScenery(sn){
 x.save();
 if(sn===0){
  // Spring: cherry trees and drifting petals.
  for(const tx of [115,520,875]){
   x.fillStyle='rgba(91,63,47,.72)';x.fillRect(tx-8,292,16,G-292);
   x.fillStyle='rgba(255,183,210,.80)';
   for(const [dx,dy,r] of [[-30,0,34],[8,-22,42],[42,5,31],[-2,20,38]]){x.beginPath();x.arc(tx+dx,292+dy,r,0,7);x.fill()}
  }
  x.fillStyle='rgba(255,220,232,.85)';
  for(let i=0;i<18;i++){const px=(i*181-groundOffset*.18)%1040-40,py=90+(i*67)%270;x.beginPath();x.ellipse(px,py,4,2,((i%5)-2)*.25,0,7);x.fill()}
 }else if(sn===1){
  // Summer: sea, beach and palm trees behind the play lane.
  x.fillStyle='rgba(39,151,207,.70)';x.fillRect(0,302,W,98);
  x.strokeStyle='rgba(235,250,255,.72)';x.lineWidth=3;
  for(let row=0;row<3;row++){x.beginPath();for(let px=0;px<=W;px+=32){const py=326+row*27+Math.sin((px+groundOffset*.12)/48)*3;px?x.lineTo(px,py):x.moveTo(px,py)}x.stroke()}
  x.fillStyle='rgba(242,211,139,.88)';x.fillRect(0,390,W,G-390);
  for(const tx of [155,760]){
   // Emoji-like palm: curved segmented trunk, coconuts and long drooping fronds.
   x.strokeStyle='rgba(91,59,31,.92)';x.lineWidth=17;x.lineCap='round';x.beginPath();x.moveTo(tx,414);x.quadraticCurveTo(tx-10,342,tx+18,274);x.stroke();
   x.strokeStyle='rgba(191,133,61,.90)';x.lineWidth=10;x.beginPath();x.moveTo(tx,414);x.quadraticCurveTo(tx-8,343,tx+18,274);x.stroke();
   x.strokeStyle='rgba(111,71,34,.55)';x.lineWidth=2;
   for(let j=0;j<5;j++){const yy=397-j*25;x.beginPath();x.moveTo(tx-5,yy);x.lineTo(tx+7,yy-4);x.stroke()}
   const crownX=tx+18,crownY=274;
   x.strokeStyle='rgba(25,111,59,.96)';x.lineWidth=9;x.lineCap='round';
   for(const [dx,dy,cx,cy] of [[-75,18,-42,-16],[-58,-28,-28,-38],[-12,-55,-9,-35],[42,-48,23,-36],[78,-12,45,-24],[68,30,42,8],[-52,40,-35,12]]){
    x.beginPath();x.moveTo(crownX,crownY);x.quadraticCurveTo(crownX+cx,crownY+cy,crownX+dx,crownY+dy);x.stroke();
   }
   x.fillStyle='#77502b';for(const [dx,dy] of [[-8,8],[8,10],[1,20]]){x.beginPath();x.arc(crownX+dx,crownY+dy,7,0,7);x.fill()}
  }
 }else if(sn===2){
  // Autumn: red and gold trees with falling leaves.
  for(const [tx,col] of [[125,'#d85f36'],[500,'#e4a22d'],[845,'#b94432']]){
   x.fillStyle='rgba(91,59,39,.78)';x.fillRect(tx-9,292,18,G-292);x.fillStyle=col;x.globalAlpha=.78;
   for(const [dx,dy,r] of [[-34,5,36],[2,-24,43],[40,4,34],[4,22,39]]){x.beginPath();x.arc(tx+dx,292+dy,r,0,7);x.fill()}
   x.globalAlpha=1;
  }
  x.fillStyle='rgba(224,119,44,.80)';
  for(let i=0;i<16;i++){const px=(i*157-groundOffset*.22)%1040-40,py=110+(i*83)%285;x.save();x.translate(px,py);x.rotate(i+groundOffset*.002);x.fillRect(-5,-2,10,5);x.restore()}
 }else{
  // Winter: snowfield, Christmas trees, snowmen and snow.
  x.fillStyle='rgba(229,241,248,.94)';x.strokeStyle='rgba(113,145,164,.34)';x.lineWidth=1.25;x.beginPath();x.moveTo(0,G);x.lineTo(0,365);x.quadraticCurveTo(180,330,350,370);x.quadraticCurveTo(610,320,960,365);x.lineTo(W,G);x.fill();x.stroke();
  for(const tx of [140,760]){
   x.fillStyle='rgba(86,61,43,.86)';x.fillRect(tx-7,315,14,G-315);x.fillStyle='rgba(22,101,64,.90)';x.strokeStyle='rgba(16,69,50,.48)';x.lineWidth=1.5;
   for(const [yy,ww] of [[265,52],[295,72],[330,92]]){x.beginPath();x.moveTo(tx,yy-55);x.lineTo(tx-ww,yy+42);x.lineTo(tx+ww,yy+42);x.closePath();x.fill();x.stroke()}
   // Snow caps follow the upper edge of each green branch tier.
   x.fillStyle='rgba(250,253,255,.96)';x.strokeStyle='rgba(139,168,184,.42)';x.lineWidth=1.25;
   for(const [yy,ww] of [[265,52],[295,72],[330,92]]){x.beginPath();x.moveTo(tx,yy-55);x.lineTo(tx-ww*.58,yy+1);x.quadraticCurveTo(tx-ww*.25,yy-5,tx,yy+6);x.quadraticCurveTo(tx+ww*.25,yy-5,tx+ww*.58,yy+1);x.closePath();x.fill();x.stroke()}
   x.fillStyle='#f5cf45';x.beginPath();x.arc(tx,213,7,0,7);x.fill();
  }
  for(const sx of [430,900]){
   x.fillStyle='rgba(250,253,255,.98)';x.strokeStyle='rgba(116,146,163,.50)';x.lineWidth=1.5;
   x.beginPath();x.arc(sx,390,34,0,7);x.fill();x.stroke();
   x.beginPath();x.arc(sx,345,25,0,7);x.fill();x.stroke();
   x.fillStyle='#26333c';x.beginPath();x.arc(sx-8,340,3,0,7);x.arc(sx+8,340,3,0,7);x.fill();
   x.fillStyle='#e47a32';x.beginPath();x.moveTo(sx,347);x.lineTo(sx+21,352);x.lineTo(sx,354);x.fill();
   x.fillStyle='#26333c';for(const by of [375,392,407]){x.beginPath();x.arc(sx,by,3,0,7);x.fill()}
  }
  x.fillStyle='rgba(255,255,255,.82)';
  for(let i=0;i<34;i++){const px=(i*137-groundOffset*.12)%1020-30,py=(i*79+groundOffset*.08)%420;x.beginPath();x.arc(px,py,2+(i%3),0,7);x.fill()}
 }
 x.restore();
}
function draw(){
 x.save();
 const lariatPower=lariatTimer>GAME_CONFIG.lariatWarningFrames?1:(lariatTimer>0?Math.max(.05,lariatTimer/GAME_CONFIG.lariatWarningFrames):0);
 if(lariatTimer>0){
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
 g.addColorStop(0,`rgb(${s[0]},${s[1]},${s[2]})`);g.addColorStop(1,`rgb(${Math.max(0,s[0]-30)},${Math.max(0,s[1]-20)},${Math.max(0,s[2]-5)})`);
 x.fillStyle=g;x.fillRect(0,0,W,H);

 if(lariatTimer>0){
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
   const label=it.type==='shield'?'🛡 GUARD':(it.type==='speedDown'?'🐢 SPEED DOWN':`⚡ CHARGE +${Math.round(GAME_CONFIG.chargeRecoveryRatio*100)}%`);x.strokeText(label,23,-8);x.fillText(label,23,-8);
   if(it.type==='shield'){
     x.translate(2,0);x.fillStyle='#d8dde6';x.strokeStyle='#38485c';x.lineWidth=3;
     x.beginPath();x.moveTo(21,3);x.lineTo(39,10);x.lineTo(37,27);x.quadraticCurveTo(33,39,21,45);x.quadraticCurveTo(9,39,5,27);x.lineTo(3,10);x.closePath();x.fill();x.stroke();
     x.fillStyle='#6e91b7';x.beginPath();x.moveTo(21,8);x.lineTo(33,13);x.lineTo(31,26);x.quadraticCurveTo(28,34,21,38);x.quadraticCurveTo(14,34,11,26);x.lineTo(9,13);x.closePath();x.fill();
     x.strokeStyle='rgba(255,255,255,.8)';x.lineWidth=3;x.beginPath();x.moveTo(21,9);x.lineTo(21,36);x.stroke();
   }else if(it.type==='speedDown'){
     x.shadowColor='#8dff72';x.shadowBlur=12;x.font='34px sans-serif';x.textAlign='center';x.fillStyle='#fff';x.fillText('🐢',23,36);x.shadowBlur=0;
   }else{
     x.shadowColor='#ffe45c';x.shadowBlur=14;x.fillStyle='#ffe45c';x.strokeStyle='#7a4b00';x.lineWidth=3;
     x.beginPath();x.moveTo(27,1);x.lineTo(9,25);x.lineTo(22,25);x.lineTo(15,46);x.lineTo(40,18);x.lineTo(27,18);x.closePath();x.fill();x.stroke();x.shadowBlur=0;
   }
   x.restore();
 }

 for(const o of obs){
  if(o.type==='gap'){x.fillStyle='#10151c';x.fillRect(o.x,G,o.w,H-G);continue}
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

  if(o.type==='pig'){
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

  } else if(o.type==='snake'){
    // Chibi snake: long ground coil plus a clearly raised neck/head.
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

    // Neck rises dramatically when active.
    const headY=Math.max(11, o.h*(0.18 + (1-lift)*0.42));
    const neckX=o.w*.73;
    x.beginPath();
    x.moveTo(o.w*.64,baseY-2);
    x.quadraticCurveTo(neckX,baseY-o.h*.28,neckX,headY+9);
    x.stroke();

    // Large head.
    x.strokeStyle='#2f6538';x.lineWidth=3;
    x.beginPath();x.ellipse(o.w*.78,headY,13,10,0,0,Math.PI*2);x.fill();x.stroke();

    // Eyes.
    x.fillStyle='#fff';
    x.beginPath();x.arc(o.w*.74,headY-2,3.5,0,Math.PI*2);x.arc(o.w*.82,headY-2,3.5,0,Math.PI*2);x.fill();
    x.fillStyle='#111';
    x.beginPath();x.arc(o.w*.75,headY-2,1.6,0,Math.PI*2);x.arc(o.w*.83,headY-2,1.6,0,Math.PI*2);x.fill();

    // Tongue when raised, making the high state extra obvious.
    if(lift>0.55){
      x.strokeStyle='#c64e62';x.lineWidth=2;
      x.beginPath();x.moveTo(o.w*.91,headY+2);x.lineTo(o.w*.99,headY+2);x.lineTo(o.w*1.03,headY-1);
      x.moveTo(o.w*.99,headY+2);x.lineTo(o.w*1.03,headY+5);x.stroke();
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
      [18,14],[58,8],[98,14],[138,8]
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
 if(!playerExploded){
 x.save();
 if(rescueInvuln>0 && Math.floor(rescueInvuln/5)%2===0)x.globalAlpha=.4;
 if(lariatEndInvuln>0 && Math.floor(lariatEndInvuln/5)%2===0)x.globalAlpha=.25;
 x.translate(p.x+p.w/2,p.y+p.h/2);
 const spin=lariatTimer>0 ? (70-lariatTimer)*0.55 : p.rot;
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
 if(zangiefImg.complete){
   const size=76;
   x.drawImage(zangiefImg,-size/2,-size/2-4,size,size);
 }else{
   x.fillStyle='#8b2f2f';x.beginPath();x.arc(0,0,28,0,Math.PI*2);x.fill();
 }
   x.restore();
  }
  x.globalAlpha=1;
  if(gameOverFragments.length){
    const sw=zangiefImg.naturalWidth/4,sh=zangiefImg.naturalHeight/4;
    for(const f of gameOverFragments){
      x.save();x.translate(f.x,f.y);
      x.globalAlpha=Math.max(0,Math.min(1,f.life/18));
      if(f.spark){
        x.fillStyle=f.life%3<1?'#fff3a6':(f.life%2<1?'#ffb21c':'#d82818');
        x.beginPath();x.arc(0,0,f.size,0,Math.PI*2);x.fill();
      }else{
        x.rotate(f.rot);
        if(zangiefImg.complete&&zangiefImg.naturalWidth){
          x.drawImage(zangiefImg,f.col*sw,f.row*sh,sw,sh,-f.size/2,-f.size/2,f.size,f.size);
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
      if(o.type==='gap')continue;
      obstacleHitboxes(o).forEach((box,i)=>drawHitbox(box,'#ff4d4d',i===0?o.type.toUpperCase():''));
    }
    if(!playerExploded&&lariatEndInvuln<=0)drawHitbox(playerHitbox(),'#38e8ff','PLAYER');
    x.save();
    x.font='bold 15px sans-serif';x.textAlign='right';
    x.fillStyle='rgba(0,0,0,.72)';x.fillRect(W-182,12,170,28);
    x.fillStyle='#ffe45c';x.fillText('HITBOX DEBUG [D]',W-20,32);
    x.restore();
  }
  for(const d of dusts){x.globalAlpha=d.life/30;x.fillStyle='#ddd';x.fillRect(d.x,d.y,4,4)}x.globalAlpha=1;
 document.querySelector('#score').textContent=`TOTAL SCORE ${fmt(getTotalScore())}`;
 const debugItemLine=DEBUG_BUILD?`<span style="color:#9ff7ff">DEBUG STAGE ${stage} / SPEED ${speed.toFixed(2)}</span><br><span style="color:#ffe45c">DEBUG ITEM ${itemChanceActive?'ACTIVE':(itemChancePending?'PREP ': 'NEXT ')+(itemChancePending?fmt(nextItemChanceAt):fmt(Math.max(dist,nextItemChanceAt)))+'m'}</span>`:'';
 document.querySelector('#sub').innerHTML=debugItemLine;
 x.restore();
}
