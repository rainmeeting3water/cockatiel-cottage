/* Local-only bird photo album. No network calls, account, or shared photo wall. */
(function (root) {
  'use strict';
  const DB_NAME = 'cockatiel-cottage-photos', DB_VERSION = 1, STORE = 'photos';
  const MAX_PHOTOS = 12, MAX_FILE = 10 * 1024 * 1024, MAX_PIXELS = 24000000, MAX_BACKUP = 20 * 1024 * 1024;
  const FRAMES = Object.freeze([
    {id:'cream',name:'奶油小圓框',note:'暖暖的，剛剛好。'},
    {id:'polaroid',name:'拍立得回憶',note:'把今天留在小卡上。'},
    {id:'wood',name:'森林木相框',note:'像放在家裡的小木框。'},
    {id:'garden',name:'小花園',note:'讓照片開一朵小花。'},
    {id:'night',name:'晚安星空',note:'安安靜靜，亮一點星光。'}
  ]);
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icon = name => root.CottageArt?.icon(name) || '';
  const tr = value => root.CottageI18n?.t(value) || value;
  const canvasFont = () => root.CottageI18n?.fontFamily?.() || '"Cottage TC", "Noto Sans TC", "Microsoft JhengHei", sans-serif';
  const uid = () => root.crypto?.randomUUID?.() || 'photo-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
  let dbPromise, mounted, generation = 0, rows = [], busy = false, openDraft, lastFocus, previewURL;

  function db() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve,reject) => {
      if (!root.indexedDB) { reject(new Error('這個瀏覽器不能保存照片。可以換用一般視窗再試一次。')); return; }
      const req = root.indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE,{keyPath:'id'});
      req.onsuccess = () => { const database = req.result; database.onversionchange = () => { database.close(); dbPromise = null; }; resolve(database); };
      req.onerror = () => reject(req.error || new Error('相簿打不開。原本的照片沒有更動。'));
      req.onblocked = () => reject(new Error('另一個分頁正在使用相簿。請關閉另一個小屋分頁，再試一次。'));
    }).catch(e => { dbPromise = null; throw e; });
    return dbPromise;
  }
  async function readAll() {
    const database = await db();
    return new Promise((resolve,reject) => {
      const tx = database.transaction(STORE,'readonly'), req = tx.objectStore(STORE).getAll();
      req.onsuccess = () => resolve(req.result.sort((a,b) => b.createdAt-a.createdAt));
      req.onerror = () => reject(req.error || new Error('照片暫時讀不到，請再試一次。'));
      tx.onabort = () => reject(tx.error || new Error('讀取中斷，原本的照片仍保留。'));
    });
  }
  async function transact(kind, data) {
    const database = await db();
    return new Promise((resolve,reject) => {
      let problem;
      const tx = database.transaction(STORE,'readwrite'), store = tx.objectStore(STORE);
      tx.oncomplete = resolve;
      tx.onabort = tx.onerror = () => reject(problem || tx.error || new Error('照片還沒存好。請保留這個視窗，或先備份其他照片。'));
      if (kind === 'replace') { store.clear(); data.forEach(row => store.put(row)); }
      else if (kind === 'delete') store.delete(data);
      else if (kind === 'add') {
        const count = store.count();
        count.onsuccess = () => {
          if (count.result >= MAX_PHOTOS) { problem = new Error('相簿已經有 12 張照片。先備份，再挑一張移除吧。'); tx.abort(); }
          else store.put(data);
        };
      } else if (kind === 'edit') {
        const req = store.get(data.id);
        req.onsuccess = () => {
          if (!req.result) { problem = new Error('這張照片可能已在另一個分頁移除。請重新整理相簿。'); tx.abort(); }
          else store.put({...req.result,name:data.name,frame:data.frame});
        };
      }
    });
  }
  function imageInfo(bytes) {
    const u = new Uint8Array(bytes), d = new DataView(bytes), ascii = (at,len) => String.fromCharCode(...u.slice(at,at+len));
    if (u.length >= 24 && u[0]===137 && ascii(1,3)==='PNG' && ascii(12,4)==='IHDR') return {mime:'image/png',width:d.getUint32(16),height:d.getUint32(20)};
    if (u.length >= 12 && u[0]===255 && u[1]===216) {
      let p = 2;
      while (p + 9 < u.length) {
        if (u[p++] !== 255) continue;
        while (p < u.length && u[p]===255) p++;
        const marker = u[p++];
        if (marker===217 || marker===218) break;
        if (marker===1 || (marker>=208 && marker<=215)) continue;
        if (p+2 > u.length) break;
        const size = d.getUint16(p);
        if (size < 2 || p+size > u.length) break;
        if ([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(marker)) return {mime:'image/jpeg',width:d.getUint16(p+5),height:d.getUint16(p+3)};
        p += size;
      }
    }
    if (u.length >= 30 && ascii(0,4)==='RIFF' && ascii(8,4)==='WEBP') {
      const type=ascii(12,4);
      if (type==='VP8X') {
        if (u[20]&2) throw new Error('先選靜態照片喔，這裡還不能放動態 WebP。');
        return {mime:'image/webp',width:1+u[24]+(u[25]<<8)+(u[26]<<16),height:1+u[27]+(u[28]<<8)+(u[29]<<16)};
      }
      if (type==='VP8 ' && u[23]===157 && u[24]===1 && u[25]===42) return {mime:'image/webp',width:d.getUint16(26,true)&16383,height:d.getUint16(28,true)&16383};
      if (type==='VP8L' && u[20]===47) return {mime:'image/webp',width:1+u[21]+((u[22]&63)<<8),height:1+(u[22]>>6)+(u[23]<<2)+((u[24]&15)<<10)};
    }
    throw new Error('這張照片的格式讀不到。請選 JPG、PNG 或靜態 WebP。');
  }
  function loadImage(blob) {
    return new Promise((resolve,reject) => {
      const url=URL.createObjectURL(blob), img=new Image();
      img.onload=()=>{URL.revokeObjectURL(url);resolve(img);};
      img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('照片打不開，原本的相簿沒有更動。'));};
      img.src=url;
    });
  }
  async function normalizePhoto(blob) {
    if (!blob || blob.size===0 || blob.size>MAX_FILE) throw new Error('每張照片請選 10 MB 以內的 JPG、PNG 或 WebP。');
    const bytes=await blob.arrayBuffer(), info=imageInfo(bytes);
    if (!info.width || !info.height || info.width*info.height>MAX_PIXELS || info.width>16000 || info.height>16000) throw new Error('這張照片太大了。請先縮小到 2400 萬畫素以下再放上來。');
    if (blob.type && !['image/jpeg','image/png','image/webp'].includes(blob.type.toLowerCase())) throw new Error('請選 JPG、PNG 或靜態 WebP 照片，不能放 SVG 或 GIF。');
    const img=await loadImage(new Blob([bytes],{type:info.mime}));
    if (img.naturalWidth*img.naturalHeight>MAX_PIXELS) throw new Error('這張照片太大了，請先縮小再放上來。');
    const scale=Math.min(1,1600/Math.max(img.naturalWidth,img.naturalHeight));
    const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));
    const ctx=canvas.getContext('2d');if(!ctx)throw new Error('這個瀏覽器暫時不能處理照片。');
    ctx.fillStyle='#fffefa';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);
    let result;
    for(const quality of [.85,.72,.60,.48]){result=canvas.toDataURL('image/jpeg',quality);if(result.length<=1572864)break;}
    if(result.length>1572864)throw new Error('照片縮小後還是太大。請先裁掉不用的部分，再放上來。');
    if (!result.startsWith('data:image/jpeg;base64,')) throw new Error('照片還沒處理好，請再試一次。');
    return result;
  }
  function photoName(value) {
    if(typeof value!=='string')throw new Error('請填一個鳥寶暱稱。');
    const clean=value.trim();if(!clean || [...clean].length>20 || /[\u0000-\u001f\u007f]/u.test(clean))throw new Error('暱稱請填 1～20 個字，不要填姓名或地址。');return clean;
  }
  function dataUrlBlob(value) {
    if(typeof value!=='string' || value.length>MAX_FILE*1.4)throw new Error('相簿裡有讀不到的照片。');
    const match=/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]*={0,2})$/.exec(value);
    if(!match)throw new Error('相簿只能放內含的照片，不能放網路圖片網址。');
    let decoded;try{decoded=atob(match[2]);}catch(_){throw new Error('相簿裡的照片資料不完整。');}
    const bytes=new Uint8Array(decoded.length);for(let i=0;i<decoded.length;i++)bytes[i]=decoded.charCodeAt(i);
    return new Blob([bytes],{type:match[1]});
  }
  function plain(value){return value!==null&&typeof value==='object'&&!Array.isArray(value);}
  function exactKeys(value, allowed) { if(!plain(value)||Object.keys(value).some(k=>!allowed.includes(k))||allowed.some(k=>!Object.hasOwn(value,k)))throw new Error('這份檔案不是小屋的相簿備份。'); }
  async function parseAlbum(raw) {
    if(typeof raw!=='string'||new Blob([raw]).size>MAX_BACKUP)throw new Error('相簿備份請選 20 MB 以內的檔案。');
    let parsed;try{parsed=JSON.parse(raw);}catch(_){throw new Error('檔案讀不到。請選「備份照片」存下的相簿檔。');}
    exactKeys(parsed,['format','version','photos']);
    if(parsed.format!=='cockatiel-cottage-album'||parsed.version!==1||!Array.isArray(parsed.photos)||parsed.photos.length>MAX_PHOTOS)throw new Error('這份相簿的版本或張數不符合。原本照片沒有更動。');
    const result=[];
    for(const [i,row] of parsed.photos.entries()) {
      exactKeys(row,['name','frame','dataUrl']);
      if(!FRAMES.some(f=>f.id===row.frame))throw new Error('相簿裡有不認得的相框。');
      result.push({id:uid(),name:photoName(row.name),frame:row.frame,dataUrl:await normalizePhoto(dataUrlBlob(row.dataUrl)),createdAt:Date.now()+i});
    }
    return result;
  }
  async function exportData() {
    const all=await readAll();
    return {format:'cockatiel-cottage-album',version:1,photos:all.map(({name,frame,dataUrl})=>({name,frame,dataUrl}))};
  }
  function fileDownload(blob,name) {
    const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
  }
  function status(message,error=false) {
    if(!mounted)return;const el=mounted.querySelector('.gallery-status');el.textContent=message;el.classList.toggle('error',error);
  }
  async function refresh(token=generation) {
    const list=await readAll();if(!mounted||token!==generation)return;rows=list;paint();
  }
  function paint() {
    if(!mounted)return;
    mounted.querySelector('.gallery-count').textContent=`${rows.length} / ${MAX_PHOTOS} 張`;
    mounted.querySelector('.gallery-grid').innerHTML=rows.length?rows.map(row=>`<article class="gallery-card" data-photo="${esc(row.id)}"><div class="gallery-frame frame-${esc(row.frame)}"><div class="gallery-image-wrap"><img src="${row.dataUrl}" alt="鳥寶照片" aria-describedby="gallery-name-${esc(row.id)}" loading="lazy"></div><div class="gallery-photo-label" id="gallery-name-${esc(row.id)}" data-i18n-ignore>${esc(row.name)}</div><span class="gallery-frame-decoration" aria-hidden="true"></span></div><div class="gallery-card-actions"><button class="btn secondary" data-gallery-action="edit" data-id="${esc(row.id)}">${icon('settings')}改名字／相框</button><button class="gallery-small-button" data-gallery-action="download" data-id="${esc(row.id)}" aria-label="下載這張相框圖" aria-describedby="gallery-name-${esc(row.id)}">${icon('download')}<span>下載</span></button><button class="gallery-small-button gallery-remove" data-gallery-action="delete" data-id="${esc(row.id)}" aria-label="移除這張照片" aria-describedby="gallery-name-${esc(row.id)}">移除</button></div></article>`).join(''):`<div class="gallery-empty"><div class="gallery-empty-papers" aria-hidden="true"><span>♡</span><span>✦</span><span>☀</span></div><h2>第一張鳥寶照片，等你放上來。</h2><p>打哈欠、歪頭、睡午覺……<br>那些可愛的小時刻，都值得留下來。</p><button class="btn" data-gallery-action="add">${icon('upload')}選一張鳥寶照片</button></div>`;
    mounted.querySelector('[data-gallery-action="add"]').disabled=rows.length>=MAX_PHOTOS;
  }
  function releasePreview(){if(previewURL){URL.revokeObjectURL(previewURL);previewURL=null;}}
  function closeDialog() {
    releasePreview();
    const d=mounted?.querySelector('.gallery-dialog');if(!d)return;d.close();openDraft=null;lastFocus?.isConnected&&lastFocus.focus({preventScroll:true});
  }
  function dialog(title,body,actions='') {
    if(!mounted)return;
    releasePreview();
    const d=mounted.querySelector('.gallery-dialog');lastFocus=document.activeElement;
    d.innerHTML=`<div class="gallery-dialog-heading"><h2 id="gallery-dialog-title">${title}</h2><button class="icon-button" data-gallery-action="close" aria-label="關閉照片視窗">${icon('close')||'×'}</button></div>${body}${actions?`<div class="gallery-dialog-actions">${actions}</div>`:''}<p class="gallery-dialog-status" role="status" aria-live="polite"></p>`;
    if(!d.open)d.showModal();d.querySelector('input,button,select')?.focus({preventScroll:true});
  }
  function draftEditor(draft,existing=false) {
    openDraft=draft;
    dialog(existing?'幫照片換個樣子':'這張照片，叫什麼名字呢？',`<form class="gallery-editor" data-gallery-form><div class="gallery-draft frame-${esc(draft.frame)}"><div class="gallery-image-wrap"><img src="${draft.dataUrl}" alt="準備放入相框的鳥寶照片"></div><div class="gallery-photo-label" data-i18n-ignore>${esc(draft.name)}</div><span class="gallery-frame-decoration" aria-hidden="true"></span></div><label class="field">鳥寶暱稱<input name="photoName" data-i18n-ignore value="${esc(draft.name)}" maxlength="20" required autocomplete="off" placeholder="${esc(tr('例如：午睡的小米'))}"></label><fieldset class="gallery-frame-options"><legend>挑一個喜歡的相框</legend>${FRAMES.map(f=>`<label class="gallery-frame-choice"><input type="radio" name="photoFrame" value="${f.id}" ${f.id===draft.frame?'checked':''}><span class="gallery-frame-swatch frame-${f.id}" aria-hidden="true">♡</span><span>${f.name}</span></label>`).join('')}</fieldset><p class="gallery-help">照片會縮小後保存在這台裝置，不會上傳。請只放鳥寶，不要放人臉、姓名或地址。</p><button class="btn wide" type="submit">${existing?'保存新樣子':'放進我的相簿'}</button></form>`);
    openDraft={...draft,existing};
  }
  function roundRect(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
  async function framedBlob(row) {
    const img=await loadImage(dataUrlBlob(row.dataUrl)),canvas=document.createElement('canvas');canvas.width=1200;canvas.height=1400;
    const c=canvas.getContext('2d');if(!c)throw new Error('這個瀏覽器暫時不能做相框圖。');
    const style={cream:['#f4e3b9','#675c42'],polaroid:['#fffefa','#52614a'],wood:['#b18760','#fff9ed'],garden:['#e1ebd5','#4a6340'],night:['#283b53','#fff1c7']}[row.frame]||['#f4e3b9','#675c42'];
    c.fillStyle=style[0];c.fillRect(0,0,1200,1400);
    if(row.frame==='wood'){c.strokeStyle='#8f6544';c.lineWidth=5;for(let n=17;n<100;n+=20){c.strokeRect(n,n,1200-n*2,1400-n*2);}}
    if(row.frame==='polaroid'){c.fillStyle='#efede7';c.fillRect(33,33,1134,1334);c.fillStyle='#fffefa';c.fillRect(48,40,1104,1314);}
    const x=90,y=90,w=1020,h=1020;c.save();roundRect(c,x,y,w,h,row.frame==='polaroid'?4:35);c.clip();c.fillStyle='#fffefa';c.fillRect(x,y,w,h);
    const scale=Math.min(w/img.naturalWidth,h/img.naturalHeight),iw=img.naturalWidth*scale,ih=img.naturalHeight*scale;c.drawImage(img,x+(w-iw)/2,y+(h-ih)/2,iw,ih);c.restore();
    c.fillStyle=style[1];c.textAlign='center';c.textBaseline='middle';c.font='500 48px '+canvasFont();c.fillText(row.name,600,1210,1020);
    c.globalAlpha=.75;c.font='28px '+canvasFont();c.fillText(tr('鳥寶的小日子'),600,1280);c.globalAlpha=1;
    if(row.frame==='garden'){for(const [px,py] of [[50,95],[1140,1140],[1060,60],[85,1300]]){c.fillStyle='#9aaf78';c.beginPath();c.ellipse(px,py,17,37,-.5,0,Math.PI*2);c.fill();c.fillStyle='#e5b294';for(let a=0;a<5;a++){const theta=a*Math.PI*2/5;c.beginPath();c.arc(px+Math.cos(theta)*18,py-42+Math.sin(theta)*18,13,0,Math.PI*2);c.fill();}c.fillStyle='#f7df8b';c.beginPath();c.arc(px,py-42,10,0,Math.PI*2);c.fill();}}
    if(row.frame==='night'){c.fillStyle='#f5df9f';for(const [px,py,r] of [[45,50,7],[1135,82,10],[70,1160,8],[1120,1300,7],[1010,1335,5]]){c.beginPath();for(let n=0;n<8;n++){const a=n*Math.PI/4,rr=n%2?r*.35:r;c.lineTo(px+Math.cos(a)*rr,py+Math.sin(a)*rr);}c.closePath();c.fill();}}
    return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('相框圖還沒做好，請再試一次。')),'image/png'));
  }
  function messageFor(error){return error?.name==='QuotaExceededError'?'這台裝置的空間不夠，照片還沒存好。先備份相簿，再整理空間；這個視窗裡的照片先別關掉。':error?.message||'這次還沒完成。原本的照片沒有更動，請再試一次。';}
  async function click(event) {
    const button=event.target.closest('[data-gallery-action]');if(!button||!mounted?.contains(button))return;event.preventDefault();
    if(busy)return;
    const token=generation,action=button.dataset.galleryAction,row=rows.find(p=>p.id===button.dataset.id);
    try {
      if(action==='add'){mounted.querySelector('.gallery-photo-input').value='';mounted.querySelector('.gallery-photo-input').click();}
      else if(action==='close')closeDialog();
      else if(action==='edit'&&row)draftEditor({...row},true);
      else if(action==='delete'&&row)dialog('要移除這張照片嗎？',`<p><span data-i18n-ignore>「${esc(row.name)}」</span> <span>會從這台裝置的相簿移除。你原本的照片檔和已下載的相框圖不會被刪掉。</span></p><p>想保留的話，可以先取消，再備份相簿。</p>`,`<button class="btn secondary" data-gallery-action="close">先留著</button><button class="btn danger" data-gallery-action="confirm-delete" data-id="${esc(row.id)}">確認移除</button>`);
      else if(action==='confirm-delete'&&row){busy=true;await transact('delete',row.id);if(!mounted||token!==generation)return;closeDialog();await refresh(token);status('這張照片已從相簿移除。');}
      else if(action==='download'&&row){busy=true;status('正在幫照片裝上相框……');const blob=await framedBlob(row);if(!mounted||token!==generation)return;const filename=(row.name.replace(/[<>:"/\\|?*\u0000-\u001f]/g,'').slice(0,30)||'鳥寶')+'-相框.png';fileDownload(blob,filename);const url=URL.createObjectURL(blob);dialog('相框圖做好了！',`<img class="gallery-export-preview" src="${url}" alt="鳥寶的相框成品"><p>可以下載 PNG 圖片。手機也可以長按圖片，選擇儲存。</p>`,`<a class="btn" href="${url}" download="${esc(filename)}">下載相框圖片</a><button class="btn secondary" data-gallery-action="close">看完了</button>`);previewURL=url;status('相框圖做好了，可以下載或長按儲存。');}
      else if(action==='export'){busy=true;const album=await exportData();if(!mounted||token!==generation)return;fileDownload(new Blob([JSON.stringify(album)],{type:'application/json'}),'玄鳳小日子-鳥寶相簿.json');status('相簿備份已準備好。這份備份和小屋的遊戲紀錄分開。');}
      else if(action==='import'){mounted.querySelector('.gallery-album-input').value='';mounted.querySelector('.gallery-album-input').click();}
      else if(action==='confirm-import'&&openDraft?.album){busy=true;const album=openDraft.album;await transact('replace',album);if(!mounted||token!==generation)return;closeDialog();await refresh(token);status('相簿已載入，原本的照片檔沒有更動。');}
      else if(action==='reload'){busy=true;await refresh(token);if(mounted&&token===generation)status('已重新讀取這台裝置的相簿。');}
    } catch(error){if(!mounted||token!==generation)return;status(messageFor(error),true);const errorEl=mounted.querySelector('.gallery-dialog[open] .gallery-dialog-status');if(errorEl)errorEl.textContent=messageFor(error);}
    finally{if(token===generation)busy=false;}
  }
  async function fileChange(event) {
    const file=event.target.files?.[0];if(!file||busy)return;const token=generation;busy=true;
    try {
      if(event.target.classList.contains('gallery-photo-input')){
        if(rows.length>=MAX_PHOTOS)throw new Error('相簿已經有 12 張照片。先備份，再挑一張移除吧。');
        status('正在整理照片，請等一下……');const dataUrl=await normalizePhoto(file);if(!mounted||token!==generation)return;
        draftEditor({id:uid(),name:tr('我的鳥寶'),frame:'cream',dataUrl,createdAt:Date.now()});status('挑個相框，再按「放進我的相簿」才會保存。');
      } else if(event.target.classList.contains('gallery-album-input')) {
        if(file.size>MAX_BACKUP)throw new Error('相簿備份請選 20 MB 以內的檔案。');
        status('正在檢查相簿裡的照片……');const album=await parseAlbum(await file.text());if(!mounted||token!==generation)return;
        dialog('要換成這份相簿嗎？',`<p>這份備份有 ${album.length} 張照片。確認後，會取代這台裝置目前的 ${rows.length} 張照片。</p><p>想保留現在的相簿，先取消並按「備份照片」。小屋的遊戲紀錄不會改變。</p>`,`<button class="btn secondary" data-gallery-action="close">先取消</button><button class="btn" data-gallery-action="confirm-import">確認換成這份相簿</button>`);openDraft={album};status('檢查完成。確認之前，原本的相簿都不會改變。');
      }
    }catch(error){if(mounted&&token===generation)status(messageFor(error),true);}finally{if(token===generation)busy=false;}
  }
  function draftChange(event){
    if(!openDraft?.dataUrl)return;const editor=event.target.closest('.gallery-editor');if(!editor)return;
    const selected=editor.querySelector('[name="photoFrame"]:checked')?.value||'cream';
    const preview=editor.querySelector('.gallery-draft');preview.className='gallery-draft frame-'+selected;
    preview.querySelector('.gallery-photo-label').textContent=editor.querySelector('[name="photoName"]').value||tr('我的鳥寶');
  }
  async function submit(event){
    if(!event.target.matches('[data-gallery-form]'))return;event.preventDefault();if(busy||!openDraft?.dataUrl)return;busy=true;
    const token=generation;
    const button=event.target.querySelector('[type="submit"]');button.disabled=true;
    try{const name=photoName(event.target.elements.photoName.value),frame=event.target.elements.photoFrame.value;if(!FRAMES.some(f=>f.id===frame))throw new Error('請重新挑一個相框。');const {id,dataUrl,createdAt,existing}=openDraft;await transact(existing?'edit':'add',{id,name,frame,dataUrl,createdAt});if(!mounted||token!==generation)return;closeDialog();await refresh(token);status('照片已留在這台裝置，真可愛。');}
    catch(error){if(!mounted||token!==generation)return;const el=mounted.querySelector('.gallery-dialog-status');if(el)el.textContent=messageFor(error);status(messageFor(error),true);}
    finally{if(token===generation)busy=false;if(button.isConnected)button.disabled=false;}
  }
  function render(){
    return `<section class="gallery-page" aria-label="我的鳥寶照片牆"><div class="page-heading"><div><div class="eyebrow">OUR LITTLE BIRD MEMORIES</div><h1>把鳥寶的可愛，框起來。</h1><p>放上照片，挑個相框，留下你喜歡的小時刻。</p></div><span class="gallery-count">0 / ${MAX_PHOTOS} 張</span></div><div class="gallery-privacy">${icon('shield')}<p><strong>這是你自己的照片牆。</strong>照片只留在這台裝置，不會公開，也不會上傳到網路。請選自己拍的鳥寶照片，別放人臉、姓名或地址。</p></div><div class="gallery-toolbar"><button class="btn" data-gallery-action="add">${icon('upload')}放上鳥寶照片</button><div><button class="btn secondary" data-gallery-action="export">${icon('download')}備份照片</button><button class="btn secondary" data-gallery-action="import">${icon('upload')}匯入相簿</button><button class="gallery-small-button" data-gallery-action="reload">重新讀取</button></div></div><p class="gallery-status" role="status" aria-live="polite">正在打開相簿……</p><div class="gallery-grid"></div><div class="gallery-notes"><h2>搬家前，記得幫照片打包。</h2><p>清除瀏覽器資料、換裝置，或關閉無痕視窗，都可能讓照片不見。按「備份照片」存一份，就能之後再匯入。這份相簿備份，和小屋的遊戲紀錄分開。</p><p>每張最多 10 MB，最多 12 張。可選 JPG、PNG 或靜態 WebP；放進相簿時會縮小照片，並移除原檔裡的拍攝資訊。</p></div><input class="gallery-photo-input" type="file" accept="image/jpeg,image/png,image/webp" hidden><input class="gallery-album-input" type="file" accept="application/json,.json" hidden><dialog class="gallery-dialog" aria-labelledby="gallery-dialog-title"></dialog></section>`;
  }
  function localeChanged(){const input=mounted?.querySelector('[name="photoName"]');if(input)input.placeholder=tr('例如：午睡的小米');}
  function unmount(){
    root.removeEventListener?.('CottageLanguageChanged',localeChanged);
    releasePreview();
    if(mounted){mounted.removeEventListener('click',click);mounted.removeEventListener('change',fileChange);mounted.removeEventListener('input',draftChange);mounted.removeEventListener('change',draftChange);mounted.removeEventListener('submit',submit);const d=mounted.querySelector('.gallery-dialog');if(d?.open)d.close();}
    generation++;mounted=null;rows=[];openDraft=null;busy=false;
  }
  async function mount(container){
    unmount();mounted=container?.matches?.('.gallery-page')?container:container?.querySelector?.('.gallery-page');if(!mounted)return;
    const token=generation;
    root.addEventListener?.('CottageLanguageChanged',localeChanged);
    mounted.addEventListener('click',click);mounted.addEventListener('change',fileChange);mounted.addEventListener('input',draftChange);mounted.addEventListener('change',draftChange);mounted.addEventListener('submit',submit);
    try{await refresh(token);if(mounted&&token===generation)status('照片只保存在這台裝置。想搬到別台裝置，先備份相簿。');}
    catch(error){if(mounted&&token===generation){rows=[];paint();status(messageFor(error),true);}}
  }
  root.CottageGallery=Object.freeze({render,mount,unmount,exportData,frames:FRAMES});
})(globalThis);
