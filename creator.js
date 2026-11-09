/* Local bird creation helper. Photos and imported sprites stay in memory; no AI or network calls. */
(function (root) {
  'use strict';
  const REF_LIMIT=10*1024*1024, ATLAS_LIMIT=8*1024*1024, MAX_PIXELS=24000000, MAX_ATLAS_DATA=12000000, ATLAS_SIDE=1280, CELL=320;
  const COLORS=Object.freeze({lutino:'黃化：淡黃色頭冠、橘色臉頰、奶白色身體',gray:'原始灰：灰色身體、白色翼斑、橘色臉頰',pearl:'珍珠：灰色羽毛帶淺色珍珠斑紋',other:'依照我自己提供的鳥寶參考照片'});
  const COLORS_EN=Object.freeze({lutino:'Lutino: pale yellow crest, orange cheeks, creamy white body',gray:'Normal grey: grey body, white wing patches, orange cheeks',pearl:'Pearl: grey feathers with pale pearl markings',other:'Use the reference photo I provide'});
  const DEFAULTS={zh:{name:'我的鳥寶',features:'橘色臉頰，奶白色翅膀，細長的尾羽'},en:{name:'My bird',features:'Orange cheeks, creamy white wings, and a long slender tail'}};
  const isEnglish=()=>root.CottageI18n?.getLanguage?.()==='en';
  const tr=value=>root.CottageI18n?.t(value)||value;
  const LABELS=Object.freeze(['站好看四周','眨眼休息','歪頭看看','輕輕呼吸','走路 1','走路 2','走路 3','走路 4','低頭喝水','低頭吃飯','整理羽毛','唱一小段','拍翅飛行 1','拍翅飛行 2','拍翅飛行 3','拍翅飛行 4']);
  const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icon=name=>root.CottageArt?.icon(name)||'';
  let mounted=null,generation=0,busy=false,applyPending=false,reference=null,atlas=null,applied=null,raf=0,previewMode='idle';
  let draft={...DEFAULTS.zh,color:'lutino'},formDraft={...draft},nameEdited=false,featuresEdited=false;
  function updateDefaultDraft(){const defaults=isEnglish()?DEFAULTS.en:DEFAULTS.zh;if(!nameEdited)draft.name=formDraft.name=defaults.name;if(!featuresEdited)draft.features=formDraft.features=defaults.features;}
  let promptURL=null,atlasURL=null,refURL=null;

  function cleanName(value){
    if(typeof value!=='string')throw new Error('請填一個鳥寶暱稱。');
    const name=value.trim();
    if(!name||[...name].length>20||/[\u0000-\u001f\u007f]/u.test(name))throw new Error('暱稱請填 1～20 個字。');
    return name;
  }
  function cleanFeatures(value){
    if(typeof value!=='string'||[...value].length>120||/[\u0000-\u001f\u007f]/u.test(value))throw new Error('羽色小記請用 120 字以內的短句。');
    const text=value.trim();
    if(/https?:|www\.|[\w.+-]+@[\w.-]+\.[a-z]{2,}|\d[\d\s()-]{6,}\d|(?:密碼|金鑰|身分證|身份證|學號|住址|api\s*key|access\s*token|secret)/iu.test(text))throw new Error('這裡只寫羽毛、臉頰和尾巴的樣子，不要放網址、電話或個人資料。');
    return text;
  }
  function makePrompt(values=draft){
    if(values===draft)updateDefaultDraft();
    if(!Object.hasOwn(COLORS,values.color))throw new Error('請重新選一種羽色。');
    const features=cleanFeatures(values.features);
    // The nickname, local file name, photo bytes, and metadata are deliberately excluded.
    return `Create one original photorealistic cockatiel animation sprite atlas using the reference bird photo that I choose to attach separately.

OUTPUT: exactly 1280 × 1280 pixels, transparent RGBA PNG, 4 columns × 4 rows, exactly 16 equal 320 × 320 cells. No spacing, labels, numbers, text, borders, grid lines, backgrounds, shadows, watermarks, or extra animals. The atlas is one static image, not a video or animated file.

CHARACTER: the same single cockatiel in every cell. Preserve the reference bird's natural crest, cheek patches, feather markings, beak, slender tail, feet, and realistic adult cockatiel proportions. Feather description: ${(isEnglish()?COLORS_EN:COLORS)[values.color]}.${features?' Extra visual details: '+features+'.':''} Do not add clothes, jewelry, hats, accessories, toys, food, bowls, furniture, or scenery. Do not copy a person, printed text, or background from the reference photo.

CONSISTENCY: keep identity, body scale, camera, natural light, and the bird's left-facing three-quarter/profile direction consistent. Each bird must remain entirely inside its own cell. Leave transparent margins around the crest, tail, toes, and flight feathers. For standing poses, the feet touch the same baseline near y=285 within each 320-pixel cell. For flying poses, keep the body centered and the full extended wings inside the cell.

FRAME ORDER, read left to right then top to bottom, using zero-based frame numbers:
0 idle: relaxed standing, eyes open.
1 idle: same standing pose, a natural blink or briefly closed eyes.
2 idle: same standing pose, small curious head tilt.
3 idle: same standing pose, subtle chest/feather settling.
4 walk: natural left-facing side-view walk cycle, left foot forward, right foot back.
5 walk: weight shifts naturally, feet approach the body.
6 walk: right foot forward, left foot back.
7 walk: weight shifts back to complete a seamless four-frame cycle.
8 water: natural small forward bend and lowered beak, drinking posture, no bowl drawn.
9 food: natural lowered head and small pecking posture, no food or bowl drawn.
10 preen: head turned gently toward the shoulder to arrange feathers, anatomically plausible.
11 sing: relaxed upright posture, beak slightly open, not distressed or gasping.
12 flight: wings raised high, full wings and long tail visible.
13 flight: wings spread midway through the downstroke.
14 flight: wings lower in the downstroke, realistic joints and primary feathers.
15 flight: wings return upward to complete a natural four-frame wingbeat.

QUALITY CHECK: all 16 cells contain exactly one complete bird, no duplicates inside a cell and no missing frames. Preserve real cockatiel anatomy; no extra wings, feet, beaks, crests, or tails. Do not make the bird a cartoon, plush toy, round chick, or costume. Use a genuinely transparent background rather than a drawn checkerboard. Export the final 1280 × 1280 RGBA PNG.
`;
  }
  function imageInfo(buffer){
    const bytes=new Uint8Array(buffer),view=new DataView(buffer),text=(at,len)=>String.fromCharCode(...bytes.slice(at,at+len));
    if(bytes.length>=24&&bytes[0]===137&&text(1,3)==='PNG'&&text(12,4)==='IHDR'){
      let animated=false,at=8;
      while(at+12<=bytes.length){const length=view.getUint32(at);if(length>bytes.length-at-12)break;const type=text(at+4,4);if(type==='acTL')animated=true;if(type==='IEND')break;at+=length+12;}
      return {mime:'image/png',width:view.getUint32(16),height:view.getUint32(20),animated};
    }
    if(bytes.length>=12&&bytes[0]===255&&bytes[1]===216){
      let at=2;while(at+9<bytes.length){if(bytes[at++]!==255)continue;while(at<bytes.length&&bytes[at]===255)at++;const marker=bytes[at++];if(marker===217||marker===218)break;if(marker===1||(marker>=208&&marker<=215))continue;if(at+2>bytes.length)break;const length=view.getUint16(at);if(length<2||at+length>bytes.length)break;if([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(marker))return{mime:'image/jpeg',width:view.getUint16(at+5),height:view.getUint16(at+3),animated:false};at+=length;}
    }
    if(bytes.length>=30&&text(0,4)==='RIFF'&&text(8,4)==='WEBP'){
      const type=text(12,4);if(type==='VP8X')return{mime:'image/webp',width:1+bytes[24]+(bytes[25]<<8)+(bytes[26]<<16),height:1+bytes[27]+(bytes[28]<<8)+(bytes[29]<<16),animated:Boolean(bytes[20]&2)};
      if(type==='VP8 '&&bytes[23]===157&&bytes[24]===1&&bytes[25]===42)return{mime:'image/webp',width:view.getUint16(26,true)&16383,height:view.getUint16(28,true)&16383,animated:false};
      if(type==='VP8L'&&bytes[20]===47)return{mime:'image/webp',width:1+bytes[21]+((bytes[22]&63)<<8),height:1+(bytes[22]>>6)+(bytes[23]<<2)+((bytes[24]&15)<<10),animated:false};
    }
    throw new Error('圖片格式讀不到。請選 JPG、PNG 或靜態 WebP；不要選 SVG 或 GIF。');
  }
  function validateHeader(info,kind){
    if(!info.width||!info.height||info.width>16000||info.height>16000||info.width*info.height>MAX_PIXELS)throw new Error('照片太大了，請先縮小到 2400 萬畫素以下。');
    if(info.animated)throw new Error('請選靜態圖片，這裡不能放 GIF、動態 PNG 或動態 WebP。');
    if(kind==='atlas'&&(!['image/png','image/webp'].includes(info.mime)||info.width!==ATLAS_SIDE||info.height!==ATLAS_SIDE))throw new Error('動作圖要是 1280 × 1280 的透明 PNG 或靜態 WebP，分成 4 × 4 共 16 格。');
    return info;
  }
  function loadImage(blob){return new Promise((resolve,reject)=>{const url=URL.createObjectURL(blob),img=new Image();img.onload=()=>{URL.revokeObjectURL(url);resolve(img);};img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('圖片打不開，請換一張再試一次。'));};img.src=url;});}
  function checkPixels(pixels,width,height){
    if(width!==ATLAS_SIDE||height!==ATLAS_SIDE||pixels.length!==width*height*4)throw new Error('動作圖尺寸不符合 1280 × 1280。');
    const visible=Array(16).fill(0),transparent=Array(16).fill(0);
    for(let y=0;y<height;y++)for(let x=0;x<width;x++){const cell=Math.floor(y/CELL)*4+Math.floor(x/CELL),alpha=pixels[(y*width+x)*4+3];if(alpha>32)visible[cell]++;if(alpha<16)transparent[cell]++;}
    if(transparent.some(n=>n<32))throw new Error('每一格都要有真正透明的背景。白底、灰底或畫上去的棋盤格都不算透明喔。');
    const empty=visible.map((n,i)=>n<64?i+1:0).filter(Boolean);if(empty.length)throw new Error('第 '+empty.join('、')+' 格看不到足夠的角色。請補好 16 格再匯入。');
    return {visible,transparent};
  }
  function boundedAtlas(dataUrl){if(typeof dataUrl!=='string'||!dataUrl.startsWith('data:image/png;base64,')||dataUrl.length>MAX_ATLAS_DATA)throw new Error('動作圖處理後仍然太大。請在圖片工具降低檔案大小，再重新匯入。');return dataUrl;}
  async function prepareImage(file,kind){
    const limit=kind==='atlas'?ATLAS_LIMIT:REF_LIMIT;
    if(!file||file.size===0||file.size>limit)throw new Error(kind==='atlas'?'動作圖請選 8 MB 以內的檔案。':'參考照片請選 10 MB 以內的檔案。');
    const allowed=kind==='atlas'?['image/png','image/webp']:['image/jpeg','image/png','image/webp'];
    if(file.type&&!allowed.includes(file.type.toLowerCase()))throw new Error(kind==='atlas'?'動作圖只接受 PNG 或靜態 WebP。':'參考照片可選 JPG、PNG 或靜態 WebP。');
    const bytes=await file.arrayBuffer(),info=validateHeader(imageInfo(bytes),kind),img=await loadImage(new Blob([bytes],{type:info.mime}));
    validateHeader({mime:info.mime,width:img.naturalWidth,height:img.naturalHeight,animated:false},kind);
    const scale=kind==='atlas'?1:Math.min(1,720/Math.max(img.naturalWidth,img.naturalHeight)),canvas=document.createElement('canvas');
    canvas.width=Math.round(img.naturalWidth*scale);canvas.height=Math.round(img.naturalHeight*scale);const ctx=canvas.getContext('2d',{willReadFrequently:kind==='atlas'});if(!ctx)throw new Error('這個瀏覽器暫時不能處理圖片。');
    if(kind!=='atlas'){ctx.fillStyle='#fffefa';ctx.fillRect(0,0,canvas.width,canvas.height);}ctx.drawImage(img,0,0,canvas.width,canvas.height);
    if(kind==='atlas')checkPixels(ctx.getImageData(0,0,canvas.width,canvas.height).data,canvas.width,canvas.height);
    const dataUrl=canvas.toDataURL(kind==='atlas'?'image/png':'image/jpeg',.86);
    if(!dataUrl.startsWith(kind==='atlas'?'data:image/png;base64,':'data:image/jpeg;base64,'))throw new Error('圖片還沒處理好，請再試一次。');
    if(kind==='atlas')boundedAtlas(dataUrl);
    return {dataUrl,width:canvas.width,height:canvas.height};
  }
  function urlBlob(value){const match=/^data:(image\/(?:png|jpeg));base64,([A-Za-z0-9+/]*={0,2})$/.exec(value||'');if(!match)throw new Error('本機圖片資料不完整。');const raw=atob(match[2]),bytes=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);return new Blob([bytes],{type:match[1]});}
  function releaseURLs(){for(const url of [promptURL,atlasURL,refURL])if(url)URL.revokeObjectURL(url);promptURL=atlasURL=refURL=null;}
  function status(message,error=false){if(!mounted)return;const el=mounted.querySelector('.creator-status');el.textContent=message;el.classList.toggle('error',error);}
  function stopPreview(){cancelAnimationFrame(raf);raf=0;}
  function reduced(){return Boolean(document.body.classList.contains('reduced-motion')||root.matchMedia?.('(prefers-reduced-motion: reduce)').matches);}
  function animate(mode=previewMode){
    stopPreview();previewMode=mode;if(!mounted||!atlas)return;
    const stage=mounted.querySelector('.creator-stage'),actor=stage?.querySelector('.creator-actor'),sprite=actor?.querySelector('.creator-sprite');if(!actor||!sprite)return;
    const frames=mode==='walk'?[4,5,6,7]:mode==='flight'?[12,13,14,15]:[0,1,2,3],start=performance.now();
    mounted.querySelectorAll('[data-creator-action^="preview-"]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.creatorAction==='preview-'+mode)));
    function draw(now){if(!mounted||!stage.isConnected)return;const elapsed=now-start,frame=frames[Math.floor(elapsed/(mode==='flight'?120:mode==='walk'?180:800))%frames.length];sprite.style.backgroundPosition=`${frame%4*100/3}% ${Math.floor(frame/4)*100/3}%`;
      const size=actor.offsetWidth,width=stage.clientWidth,height=stage.clientHeight,range=Math.max(0,width-size-20),phase=(elapsed%6000)/6000;
      let x=(width-size)/2,y=height*.8-size*.89;if(mode==='walk'){x=10+range*(.5+.5*Math.sin(phase*Math.PI*2));y-=Math.abs(Math.sin(elapsed/180*Math.PI))*2;}if(mode==='flight'){x=10+range*(.5+.5*Math.sin(phase*Math.PI*2));y=height*.25+Math.cos(phase*Math.PI*2)*height*.12;}
      actor.style.transform=`translate(${reduced()?(width-size)/2:x}px,${reduced()?height*.8-size*.89:y}px)`;
      sprite.style.transform=mode!=='idle'&&Math.cos(phase*Math.PI*2)>0?'scaleX(-1)':'scaleX(1)';
      if(reduced()){sprite.style.backgroundPosition=`${frames[0]%4*100/3}% ${Math.floor(frames[0]/4)*100/3}%`;return;}raf=requestAnimationFrame(draw);
    }
    draw(start);
  }
  function syncLinks(){
    releaseURLs();if(!mounted)return;
    promptURL=URL.createObjectURL(new Blob([makePrompt(draft)],{type:'text/plain;charset=utf-8'}));
    const promptLink=mounted.querySelector('[data-creator-download="prompt"]');promptLink.href=promptURL;
    if(reference){refURL=URL.createObjectURL(urlBlob(reference.dataUrl));mounted.querySelectorAll('[data-creator-download="reference"]').forEach(a=>a.href=refURL);}
    if(atlas){atlasURL=URL.createObjectURL(urlBlob(atlas.dataUrl));mounted.querySelectorAll('[data-creator-download="atlas"]').forEach(a=>a.href=atlasURL);}
  }
  function paintReference(){
    if(!mounted)return;mounted.querySelector('.creator-reference').innerHTML=reference?`<img src="${reference.dataUrl}" alt="只存在本次頁面裡的鳥寶參考照片"><div class="creator-reference-actions"><a class="btn secondary" data-creator-download="reference" download="鳥寶參考圖.jpg">${icon('download')}下載乾淨參考圖</a><a class="creator-text-link" data-creator-download="reference" target="_blank" rel="noopener">另開圖片</a><button class="creator-text-button" data-creator-action="clear-reference">移除參考照片</button></div>`:`<div class="creator-empty-picture">${icon('feather')}<p>還沒有選照片。<br>先找一張能看清冠羽、臉頰和尾巴的鳥寶照片。</p></div>`;
  }
  function paintAtlas(){
    if(!mounted)return;const region=mounted.querySelector('.creator-atlas-area');
    region.innerHTML=atlas?`<div class="creator-check-result">${icon('check')}尺寸、透明背景與 16 格非空檢查已通過。<br><span>這些檢查認不出鳥寶長得像不像，也不能判斷每個動作對不對，還要請你仔細看一遍。</span></div><div class="creator-atlas-grid" aria-label="16 格角色動作圖">${LABELS.map((label,i)=>`<figure><div class="creator-cell"><span class="creator-sprite" style="background-image:url('${atlas.dataUrl}');background-position:${i%4*100/3}% ${Math.floor(i/4)*100/3}%" role="img" aria-label="第 ${i+1} 格：${label}"></span></div><figcaption>${i+1}. ${label}</figcaption></figure>`).join('')}</div><div class="creator-preview-heading"><h3>先讓鳥寶動一動</h3><div class="creator-preview-buttons"><button class="btn secondary" data-creator-action="preview-idle" aria-pressed="true">看四周</button><button class="btn secondary" data-creator-action="preview-walk" aria-pressed="false">走走看</button><button class="btn secondary" data-creator-action="preview-flight" aria-pressed="false">飛一圈</button></div></div><div class="creator-stage" aria-label="鳥寶動作預覽，顯示匯入圖片中的連續動作"><span class="creator-actor"><span class="creator-sprite" style="background-image:url('${atlas.dataUrl}')" aria-hidden="true"></span></span></div><p class="creator-hint">開啟「減少動畫」時，只顯示一個姿勢，不會來回移動。</p><div class="creator-approval"><label><input class="creator-confirm" type="checkbox"><span>我看過 16 格：每格都是同一隻完整鳥寶，冠羽、尾巴、腳和翅膀沒有被切掉，走路與飛行也自然。</span></label><div class="creator-apply-actions"><button class="btn" data-creator-action="apply" disabled>${icon('check')}這次用我的鳥寶</button><a class="btn secondary" data-creator-download="atlas" download="鳥寶-16格動作圖.png">${icon('download')}下載這張動作圖</a><a class="creator-text-link" data-creator-download="atlas" target="_blank" rel="noopener">另開完整圖片</a></div></div>`:`<div class="creator-atlas-empty"><span aria-hidden="true">1 2 3 4<br>5 6 7 8<br>9 10 11 12<br>13 14 15 16</span><h3>16 格動作圖會出現在這裡。</h3><p>這個網站不會替你呼叫圖片工具。等你取得動作圖，再選進來預覽。</p></div>`;
    mounted.querySelector('.creator-applied').hidden=!applied;
    if(atlas)animate(previewMode);
  }
  function updatePrompt(){
    if(!mounted)return;const form=mounted.querySelector('.creator-details');
    formDraft={name:form.elements.birdName.value,color:form.elements.birdColor.value,features:form.elements.features.value};
    try{draft={name:cleanName(formDraft.name),color:formDraft.color,features:cleanFeatures(formDraft.features)};const text=makePrompt(draft);mounted.querySelector('.creator-prompt').value=text;mounted.querySelector('.creator-details-error').textContent='';mounted.querySelector('[data-creator-action="copy"]').disabled=false;syncLinks();}
    catch(error){mounted.querySelector('.creator-details-error').textContent=error.message;mounted.querySelector('[data-creator-action="copy"]').disabled=true;const a=mounted.querySelector('[data-creator-download="prompt"]');a.removeAttribute('href');}
  }
  async function handleFile(event){
    if(!event.target.matches('.creator-reference-input,.creator-atlas-input'))return;const file=event.target.files?.[0];if(!file||busy)return;
    const token=generation,kind=event.target.classList.contains('creator-atlas-input')?'atlas':'reference';busy=true;status(kind==='atlas'?'正在看看尺寸和 16 格圖片……':'正在整理照片，拍攝資訊不會留下來……');
    try{const prepared=await prepareImage(file,kind);if(!mounted||token!==generation)return;if(kind==='atlas'){atlas=prepared;previewMode='idle';paintAtlas();status('動作圖放好了！請先看 16 格，再試走路和飛行。');}else{reference=prepared;paintReference();status('參考照片只留在本次頁面。網站沒有把照片交給任何服務。');}syncLinks();}
    catch(error){if(mounted&&token===generation)status(error.message||'圖片還沒處理好，原本的選擇沒有改變。',true);}
    finally{if(token===generation)busy=false;event.target.value='';}
  }
  function requestCustom(dataUrl){
    return new Promise(resolve=>{
      let done=false;
      const finish=(ok,message)=>{if(done)return;done=true;clearTimeout(timer);resolve({ok:ok===true,message:typeof message==='string'?message.slice(0,200):''});};
      const timer=setTimeout(()=>finish(false,'小屋還沒有確認套用成功。請留在這裡再試一次，原本的選擇先保留。'),2000);
      try{root.dispatchEvent(new CustomEvent('CottageCustomBird',{detail:{dataUrl,ack:finish}}));}
      catch(error){finish(false,error?.message||'小屋還沒接好這次的鳥寶，請稍後再試。');}
    });
  }
  async function setCustom(dataUrl){
    applyPending=true;status(dataUrl?'正在請小屋確認你的鳥寶……':'正在請小屋換回原本的鳥寶……');
    try{const result=await requestCustom(dataUrl);if(!result.ok){status(result.message||'小屋沒有確認成功，原本的選擇先保留。',true);return false;}applied=dataUrl;if(mounted)mounted.querySelector('.creator-applied').hidden=!applied;return true;}
    finally{applyPending=false;}
  }
  async function handleClick(event){
    const button=event.target.closest('[data-creator-action]');if(!button||!mounted?.contains(button))return;event.preventDefault();const action=button.dataset.creatorAction;
    if(applyPending&&['reference','atlas','clear-reference','clear-atlas','apply','restore'].includes(action)){status('小屋還在確認，等一下再操作喔。');return;}
    if(busy&&['clear-reference','clear-atlas','apply','restore'].includes(action)){status('圖片還在整理，等一下再操作喔。');return;}
    try{
      if(action==='reference'||action==='atlas'){if(busy){status('圖片還在整理，等一下再選喔。');return;}mounted.querySelector(action==='atlas'?'.creator-atlas-input':'.creator-reference-input').click();}
      else if(action==='clear-reference'){reference=null;paintReference();syncLinks();status('參考照片已從本次頁面移除。');}
      else if(action==='copy'){const text=mounted.querySelector('.creator-prompt');if(!text.value)return;try{if(!root.navigator?.clipboard?.writeText)throw new Error('clipboard unavailable');await root.navigator.clipboard.writeText(text.value);status('提示詞已複製。照片要由你自己決定是否另外提供給圖片工具。');}catch(_){const details=text.closest('details');if(details)details.open=true;text.focus();text.select();status('這個瀏覽器不能直接複製。文字已選好，請按 Ctrl+C，或長按後選「複製」。');}}
      else if(action.startsWith('preview-'))animate(action.slice(8));
      else if(action==='apply'){if(!atlas||!mounted.querySelector('.creator-confirm')?.checked){status('先看完 16 格，再勾選確認喔。',true);return;}if(await setCustom(atlas.dataUrl))status('這次已選用你的鳥寶。重新整理後會回到原本的鳥寶。');}
      else if(action==='restore'){if(await setCustom(null))status('已回到小屋原本的鳥寶。匯入的動作圖仍可在這裡預覽。');}
      else if(action==='clear-atlas'){if(applied&&!(await setCustom(null)))return;atlas=null;stopPreview();if(mounted){paintAtlas();syncLinks();status('動作圖已從本次頁面移除，小屋使用原本的鳥寶。');}}
    }catch(error){status(error.message||'這次還沒完成，請再試一次。',true);}
  }
  function handleInput(event){if(event.target.closest('.creator-details')){if(event.target.name==='birdName')nameEdited=true;if(event.target.name==='features')featuresEdited=true;updatePrompt();}if(event.target.matches('.creator-confirm')){const apply=mounted?.querySelector('[data-creator-action="apply"]');if(apply)apply.disabled=!event.target.checked;}}
  function render(){updateDefaultDraft();return `<section class="creator-page" aria-label="鳥寶創作室"><div class="page-heading"><div><div class="eyebrow">MAKE YOUR OWN LITTLE BIRD</div><h1>把自己的鳥寶，帶進小屋。</h1><p>先準備照片和提示詞，再匯入 16 格動作圖，讓牠走走、飛飛。</p></div></div><div class="creator-privacy">${icon('shield')}<div><strong>照片不會上傳，也不會存進相簿。</strong><p>這裡只幫你準備提示詞和試動作，不會呼叫 AI 服務，也不會收費。照片和動作圖只在這次頁面裡；重新整理就會清掉。請只選自己能使用的鳥寶照片，不要放人臉、姓名或地址。</p></div></div><div class="creator-status" role="status" aria-live="polite">一起做一隻屬於你的鳥寶吧。</div><section class="creator-step"><div class="creator-step-title"><span>1</span><div><h2>選照片，說說牠的樣子。</h2><p>暱稱只用在這個頁面，不會寫進提示詞。</p></div></div><div class="creator-reference-layout"><div><button class="btn" data-creator-action="reference">${icon('upload')}選一張鳥寶參考照</button><div class="creator-reference"></div><p class="creator-hint">JPG、PNG 或靜態 WebP，10 MB 以內。網站會縮小照片，移除原檔的拍攝資訊。</p></div><form class="creator-details" autocomplete="off"><label class="field">鳥寶暱稱<input name="birdName" maxlength="20" data-i18n-ignore value="${esc(formDraft.name)}" placeholder="${esc(tr('例如：我的小米'))}"></label><label class="field">羽色<select name="birdColor">${Object.entries(COLORS).map(([id,label])=>`<option value="${id}" ${formDraft.color===id?'selected':''}>${label}</option>`).join('')}</select></label><label class="field">羽色小記<textarea name="features" maxlength="120" rows="3" data-i18n-ignore placeholder="${esc(tr('例如：橘色臉頰，翅膀有白斑，細長尾巴'))}">${esc(formDraft.features)}</textarea></label><p class="creator-hint">只寫冠羽、臉頰、羽毛和尾巴的樣子。不要寫電話、地址或其他個人資料。</p><p class="creator-details-error" role="status"></p></form></div></section><section class="creator-step"><div class="creator-step-title"><span>2</span><div><h2>複製提示詞，自己選圖片工具。</h2><p>把下面的文字交給你選的工具。要不要另附照片，由你決定；這個網站不會幫你傳送。</p></div></div><div class="creator-prompt-actions"><button class="btn" data-creator-action="copy">${icon('check')}複製提示詞</button><a class="btn secondary" data-creator-download="prompt" download="鳥寶-16格動作圖提示詞.txt">${icon('download')}下載提示詞</a></div><details class="creator-help creator-prompt-details"><summary>展開完整提示詞</summary><label class="creator-prompt-label">給圖片工具的提示詞（英文動作順序可直接使用）<textarea class="creator-prompt" data-i18n-ignore readonly rows="13" spellcheck="false">${esc(makePrompt(draft))}</textarea></label></details><p class="creator-hint">如果不能複製或下載，仍可選取框內文字，再長按或按 Ctrl+C 複製。圖片工具可能收費，請先看清楚再使用；這裡不會替你登入或付款。</p><details class="creator-help"><summary>為什麼要做成 16 格？</summary><p>小屋會輪流播放不同格子，像翻頁小動畫一樣。圖要是 1280 × 1280、4 排各 4 格，背景真的透明。第一排看四周，第二排走路，第三排喝水、吃飯、理毛和唱歌，第四排拍翅飛行。</p></details></section><section class="creator-step"><div class="creator-step-title"><span>3</span><div><h2>放進動作圖，先試玩。</h2><p>有了圖片工具做好的動作圖，再選進來。我們會先檢查尺寸和透明背景。</p></div></div><div class="creator-import-actions"><button class="btn" data-creator-action="atlas">${icon('upload')}匯入 16 格動作圖</button><button class="creator-text-button" data-creator-action="clear-atlas">移除這次的動作圖</button></div><p class="creator-hint">只接受靜態 PNG／WebP，1280 × 1280，8 MB 以內。沒有現成動作圖也沒關係，小屋原本的鳥寶仍然可以玩。</p><div class="creator-atlas-area"></div><div class="creator-applied" ${applied?'':'hidden'}><strong>這次的小屋，已用你的鳥寶。</strong><p>這不會改動相簿或遊戲存檔；重新整理後就會回到原本的鳥寶。</p><a class="btn" href="#home">回小屋看看</a><button class="btn secondary" data-creator-action="restore">回到原本的鳥寶</button></div></section><input class="creator-reference-input" type="file" accept="image/jpeg,image/png,image/webp" hidden><input class="creator-atlas-input" type="file" accept="image/png,image/webp" hidden></section>`;}
  function localeChanged(){
    if(!mounted){updateDefaultDraft();return;}
    const form=mounted.querySelector('.creator-details');
    if(form.elements.birdName.value!==formDraft.name){nameEdited=true;formDraft.name=form.elements.birdName.value;}
    if(form.elements.features.value!==formDraft.features){featuresEdited=true;formDraft.features=form.elements.features.value;}
    updateDefaultDraft();
    if(!nameEdited)form.elements.birdName.value=formDraft.name;
    if(!featuresEdited)form.elements.features.value=formDraft.features;
    form.elements.birdName.placeholder=tr('例如：我的小米');form.elements.features.placeholder=tr('例如：橘色臉頰，翅膀有白斑，細長尾巴');
    updatePrompt();
  }
  function unmount(){root.removeEventListener?.('CottageLanguageChanged',localeChanged);stopPreview();if(mounted){mounted.removeEventListener('click',handleClick);mounted.removeEventListener('change',handleFile);mounted.removeEventListener('input',handleInput);mounted.removeEventListener('change',handleInput);}mounted=null;generation++;busy=false;releaseURLs();}
  function mount(container){unmount();mounted=container?.matches?.('.creator-page')?container:container?.querySelector?.('.creator-page');if(!mounted)return;root.addEventListener?.('CottageLanguageChanged',localeChanged);mounted.addEventListener('click',handleClick);mounted.addEventListener('change',handleFile);mounted.addEventListener('input',handleInput);mounted.addEventListener('change',handleInput);mounted.querySelector('.creator-details').addEventListener('submit',event=>event.preventDefault());paintReference();paintAtlas();syncLinks();updatePrompt();}
  root.CottageCreator=Object.freeze({render,mount,unmount,makePrompt});
})(globalThis);
