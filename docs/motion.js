/* Imagegen-authored 4x4 photographic sprites, played and moved by a small local animator. */
(function () {
  'use strict';
  const assets={lutino:'assets/bird-lutino.webp',gray:'assets/bird-gray.webp',pearl:'assets/bird-pearl.webp'};
  let custom=null;
  function setCustom(dataUrl){if(dataUrl!==null&&(typeof dataUrl!=='string'||dataUrl.length>12000000||!/^data:image\/(?:png|webp);base64,[A-Za-z0-9+/=]+$/.test(dataUrl)))throw Error('鳥寶圖檔格式不正確。');custom=dataUrl;}
  let raf=0, previous=null, mounted=null;
  const labels={idle:'看看四周',walk:'散步中',water:'喝一點水',food:'吃飯時間',clean:'整理羽毛',play:'一起走走',rest:'安靜休息',sing:'開心唱一小段',flight:'拍拍翅膀，飛一圈',safe:'回家休息'};
  function image(color='lutino',className='',useCustom=false) {const variant=color==='grey'?'gray':color;return `<span class="real-bird ${className.replace(/[^a-zA-Z0-9 -]/g,'')}" style="background-image:url('${(useCustom&&custom)||assets[variant]||assets.lutino}')" aria-hidden="true"></span>`;}
  function unmount(){cancelAnimationFrame(raf);raf=0;mounted=null;}
  function mount(scene,options={}) {
    unmount();if(!scene||options.stage===4)return;
    const actor=scene.querySelector('.scene-bird'),sprite=actor?.querySelector('.real-bird');if(!actor||!sprite)return;
    const reduced=Boolean(options.reduced||matchMedia('(prefers-reduced-motion: reduce)').matches);
    const home={x:365,y:315},perch={x:350,y:274};
    let current=previous?{...previous}:home;
    const phases=[];
    const add=(to,duration,frames,label,step=170)=>{phases.push({from:{...current},to:{...to},duration,frames,label,step});current={...to};};
    const walk=(to,label='walk')=>add(to,Math.max(1400,Math.min(5500,Math.hypot(to.x-current.x,to.y-current.y)*24)),[4,5,6,7],label,170);
    const still=(ms,frames=[0,0,0,2,0],label='idle',step=500)=>add(current,ms,frames,label,step);
    let action=options.action||'idle';
    if(options.safe){current=perch;still(100000,[0],'safe');}
    else if(options.resting||options.stage>=2){current=home;still(100000,[1],'rest');}
    else if(options.outside){
      add({x:230,y:170},3300,[12,13,14,15],'flight',95);
      add({x:490,y:115},4200,[12,13,14,15],'flight',95);
      add({x:400,y:210},3100,[12,13,14,15],'flight',95);
      add(home,1900,[12,13,14,15],'flight',110);still(3000,[0],'idle');
    } else {
      if(current.y<260)add(home,1500,[12,13,14,15],'flight',110);
      if(action==='water'){walk({x:254,y:315});still(3200,[8,8,0,8],'water',700);}
      if(action==='food'){walk({x:320,y:315});still(3300,[9,9,0,9],'food',550);}
      if(action==='clean'){walk({x:435,y:315});still(3500,[10,10,0],'clean',700);}
      if(action==='play'){walk({x:465,y:315},'play');walk({x:295,y:315},'play');}
      if(action==='sing'){still(8500,[11,0,11,2],'sing',450);}
      still(5200,[0,0,0,2,0,1,0],'idle',700);
      walk({x:440,y:315});still(4200,[10,10,0],'clean',800);
      walk({x:300,y:315});still(5300,[0,2,0,1,0],'idle',800);
      walk(home);still(4500,[0,0,2,0],'idle',900);
    }
    const total=phases.reduce((a,p)=>a+p.duration,0),started=performance.now();
    let status='',lastFrame=-1;
    function draw(frame,pos,direction,label){
      if(lastFrame!==frame){sprite.style.backgroundPosition=`${frame%4*100/3}% ${Math.floor(frame/4)*100/3}%`;sprite.dataset.frame=String(frame);lastFrame=frame;}
      actor.dataset.motion=label;actor.classList.toggle('is-flying',label==='flight');
      const rect=scene.getBoundingClientRect(),scale=Math.max(rect.width/720,rect.height/380),size=actor.offsetHeight;
      const x=(rect.width-720*scale)/2+pos.x*scale,y=(rect.height-380*scale)/2+pos.y*scale;
      const anchor=direction>0?.62:.38;
      actor.style.transform=`translate(-${anchor*100}%,-89%)`;
      actor.style.left=`${Math.max(size*(anchor-.04)+4,Math.min(rect.width-size*(.96-anchor)-4,x))}px`;
      actor.style.top=`${Math.max(size*.89+4,Math.min(rect.height-size*.11-4,y))}px`;
      sprite.style.transform=direction>0?'scaleX(-1)':'scaleX(1)';
      if(status!==label){const mood=scene.querySelector('.scene-mood');if(mood)mood.textContent=labels[label]||labels.idle;status=label;}
      previous={...pos};
    }
    const token={};mounted=token;
    if(reduced){const p=phases.find(p=>p.label===action)||phases[0];draw(p.frames[0],p.to,-1,p.label);return;}
    function tick(now){
      if(mounted!==token||!scene.isConnected)return;
      let elapsed=(now-started)%total,p=phases[0];
      for(const candidate of phases){p=candidate;if(elapsed<candidate.duration)break;elapsed-=candidate.duration;}
      const t=Math.min(1,elapsed/p.duration),smooth=p.label==='flight'?t*t*(3-2*t):t;
      const pos={x:p.from.x+(p.to.x-p.from.x)*smooth,y:p.from.y+(p.to.y-p.from.y)*smooth};
      if(p.frames[0]>=4&&p.frames[0]<=7)pos.y-=Math.sin(elapsed/170*Math.PI)*1.6;
      draw(p.frames[Math.floor(elapsed/p.step)%p.frames.length],pos,p.to.x-p.from.x,p.label);
      raf=requestAnimationFrame(tick);
    }
    tick(started);
  }
  globalThis.CottageMotion=Object.freeze({image,mount,unmount,assets,setCustom});
}());
