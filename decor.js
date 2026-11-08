/* Original local-only room decorations. No uploads, libraries, or external assets. */
(function (root) {
  'use strict';
  const KEY = 'cockatiel-cottage-decor-v1';
  const THEMES = Object.freeze({cream:'奶油小屋',sage:'森林小屋',peach:'蜜桃小屋'});
  const ART = {
    rug: {name:'軟軟地毯',width:28,x:55,y:84,svg:'<ellipse cx="50" cy="63" rx="47" ry="22" fill="#dbbd83"/><ellipse cx="50" cy="61" rx="46" ry="20" fill="#f1dcaa"/><ellipse cx="50" cy="61" rx="37" ry="13" fill="none" stroke="#d5b275" stroke-width="2"/><path d="M15 60h9m51 0h9" stroke="#e1c18b" stroke-width="2" stroke-linecap="round"/>'},
    perch: {name:'木頭棲架',width:17,x:68,y:76,svg:'<ellipse cx="50" cy="91" rx="29" ry="5" fill="#736149" opacity=".12"/><path d="M50 31v52M21 31h58" stroke="#b6986d" stroke-width="7" stroke-linecap="round"/><path d="M29 87q21-11 42 0" fill="none" stroke="#a78a61" stroke-width="5" stroke-linecap="round"/><path d="m34 29 5-3m23 5 7-2" stroke="#d4bb8e" stroke-width="2" stroke-linecap="round"/>'},
    ring: {name:'圓圓木環',width:16,x:72,y:40,svg:'<path d="M50 3v15" stroke="#b6a17e" stroke-width="4" stroke-linecap="round"/><circle cx="50" cy="48" r="29" fill="none" stroke="#bd9b6d" stroke-width="9"/><path d="M34 25q-15 12-11 28" fill="none" stroke="#dec79e" stroke-width="3" stroke-linecap="round"/><path d="M30 75h40" stroke="#ab8b60" stroke-width="6" stroke-linecap="round"/>'},
    beads: {name:'彩色木珠',width:12,x:20,y:46,svg:'<path d="M50 8v76" stroke="#a3906b" stroke-width="3"/><path d="M50 5l-6 7m6-7 6 7" fill="none" stroke="#a3906b" stroke-width="3" stroke-linecap="round"/><circle cx="50" cy="27" r="10" fill="#d4b479"/><rect x="39" y="41" width="22" height="19" rx="6" fill="#a8b995"/><circle cx="50" cy="76" r="10" fill="#dfad91"/><path d="M44 91h12" stroke="#a3906b" stroke-width="3" stroke-linecap="round"/>'},
    cushion: {name:'雲朵抱枕',width:18,x:22,y:78,svg:'<path d="M15 69q-13-10-6-24 4-10 16-10 0-20 18-23 19-2 24 15 15-6 23 7 8 13-1 23 5 15-12 19H28q-8 0-13-7" fill="#efe9d5" stroke="#d7cfb8" stroke-width="2"/><path d="M37 47q4 5 8 0m17 0q4 5 8 0" fill="none" stroke="#a6a18b" stroke-width="2" stroke-linecap="round"/><path d="M49 58q4 4 8 0" fill="none" stroke="#c7ad94" stroke-width="2" stroke-linecap="round"/>'},
    picture: {name:'鳥寶畫框',width:17,x:82,y:43,svg:'<rect x="8" y="8" width="84" height="80" rx="7" fill="#bfa581"/><rect x="14" y="14" width="72" height="68" rx="3" fill="#f9f5e6"/><path d="M44 34q-5-13 1-17l6 14 6-11 2 16" fill="#e0c068"/><ellipse cx="49" cy="53" rx="21" ry="24" fill="#f4df97"/><path d="M53 48q21 3 17 19-16 7-22-8" fill="#e4cc86"/><circle cx="40" cy="43" r="3" fill="#5b5849"/><circle cx="35" cy="53" r="6" fill="#e7a17c"/><path d="m30 45-9 5 10 4" fill="#a49a7a"/><path d="m51 74 16 8-8-16" fill="#e2c782"/>'},
    star: {name:'星星掛飾',width:13,x:26,y:30,svg:'<path d="M50 2v22" stroke="#c4af87" stroke-width="3"/><path d="m50 22 10 21 23 4-17 17 3 24-19-11-20 11 4-24-17-17 23-4Z" fill="#e8cc84" stroke="#d4b574" stroke-width="2" stroke-linejoin="round"/><path d="m43 42 7-13" stroke="#f9e9b9" stroke-width="3" stroke-linecap="round"/>'},
    shelf: {name:'小小書架',width:23,x:77,y:23,svg:'<path d="M7 78h86" stroke="#ac906b" stroke-width="7" stroke-linecap="round"/><path d="M16 82v9m68-9v9" stroke="#c7af8b" stroke-width="4"/><rect x="19" y="39" width="12" height="35" rx="2" fill="#acbb99"/><rect x="34" y="31" width="14" height="43" rx="2" fill="#d2af8d"/><path d="m51 39 12-3 9 37-12 3Z" fill="#e1ca87"/><path d="M22 46h6m9-7h8" stroke="#e9ead8" stroke-width="2"/><ellipse cx="81" cy="67" rx="10" ry="8" fill="#cec7a6"/>'}
  };
  const MAX_ITEMS=8, mounts=new WeakMap(), runtimeSnapshots=new WeakMap();
  let selected=null, message='', messageKind='', originalRaw=null, blocked=false, canStore=true;
  const fail=m=>{throw new Error(m);};
  const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const plain=v=>v!==null&&typeof v==='object'&&!Array.isArray(v)&&(Object.getPrototypeOf(v)===Object.prototype||Object.getPrototypeOf(v)===null);
  function fields(v,names,label){if(!plain(v)||Object.keys(v).length!==names.length||Object.keys(v).some(k=>!names.includes(k)))fail(label+'格式不對，原本的布置先保留。');}
  function defaultState(){return {version:1,theme:'cream',nextId:1,items:[]};}
  function validateImport(value){
    fields(value,['version','theme','nextId','items'],'布置檔');
    if(value.version!==1)fail('這個布置檔版本還不能用，先不要取代原本的。');
    if(!Object.hasOwn(THEMES,value.theme))fail('找不到這個房間色調。');
    if(!Number.isSafeInteger(value.nextId)||value.nextId<1||value.nextId>1000000000)fail('布置編號不正確。');
    if(!Array.isArray(value.items)||value.items.length>MAX_ITEMS)fail('一間小屋最多放 8 個布置。');
    const ids=new Set();
    const items=value.items.map(item=>{
      fields(item,['id','kind','x','y'],'小物');
      if(typeof item.id!=='string'||!/^d[1-9][0-9]{0,8}$/.test(item.id)||ids.has(item.id)||Number(item.id.slice(1))>=value.nextId)fail('小物編號重複或不正確。');
      if(!Object.hasOwn(ART,item.kind))fail('找不到這個小物。');
      if(!Number.isFinite(item.x)||!Number.isFinite(item.y)||item.x<5||item.x>95||item.y<10||item.y>90)fail('小物位置跑出房間了。');
      ids.add(item.id);return {id:item.id,kind:item.kind,x:item.x,y:item.y};
    });
    return {version:1,theme:value.theme,nextId:value.nextId,items};
  }
  let state=defaultState();
  try{if(root.localStorage){originalRaw=root.localStorage.getItem(KEY);if(originalRaw!==null)state=validateImport(JSON.parse(originalRaw));}else canStore=false;}
  catch(_){if(originalRaw!==null){blocked=true;message='原本的布置讀不到，先幫你保留。請存下原始檔，或確認後重新布置。';messageKind='error';}else{canStore=false;message='這個瀏覽器暫時存不了布置。這次可以先玩，記得下載備份。';messageKind='error';}}
  const stateExport=()=>validateImport(state);
  function captureRuntime(){
    const token=Object.freeze({});
    runtimeSnapshots.set(token,{state:stateExport(),selected,message,messageKind,originalRaw,blocked,canStore});
    return token;
  }
  function restoreRuntime(token){
    const snapshot=token&&typeof token==='object'?runtimeSnapshots.get(token):null;
    if(!snapshot)fail('找不到這次布置的回復紀錄。');
    state=validateImport(snapshot.state);selected=snapshot.selected;message=snapshot.message;messageKind=snapshot.messageKind;
    originalRaw=snapshot.originalRaw;blocked=snapshot.blocked;canStore=snapshot.canStore;
    return stateExport();
  }
  const svg=kind=>`<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">${ART[kind].svg}</svg>`;
  function persist(next,force=false){
    if(blocked&&!force)fail('先保存原始布置，或確認重新布置，再加入小物吧。');
    const checked=validateImport(next);let saved=false;
    try{if(!root.localStorage)throw new Error('unavailable');root.localStorage.setItem(KEY,JSON.stringify(checked));saved=true;canStore=true;blocked=false;originalRaw=JSON.stringify(checked);}
    catch(_){canStore=false;message='這次的布置還沒存好。請先下載布置備份，免得關掉後找不到。';messageKind='error';}
    state=checked;return saved;
  }
  function applyImport(value){const checked=validateImport(value);selected=null;message='布置已載入。';messageKind='success';const saved=persist(checked,true);return {state:stateExport(),saved};}
  function reset(){selected=null;message='房間清好了，想放什麼都可以重新選。';messageKind='success';const saved=persist(defaultState(),true);return {state:stateExport(),saved};}
  function layer(){
    return `<div class="decor-layer decor-theme-${state.theme}" data-decor-layer aria-label="自己布置的小屋">${state.items.map(item=>`<button type="button" class="decor-item ${selected===item.id?'is-selected':''}" data-decor-select="${item.id}" aria-label="選取${ART[item.kind].name}" aria-pressed="${selected===item.id}" style="left:${item.x}%;top:${item.y}%;width:${ART[item.kind].width}%">${svg(item.kind)}</button>`).join('')}</div>`;
  }
  function panel(){
    const item=state.items.find(i=>i.id===selected);
    return `<section class="decor-panel card" data-decor-panel aria-labelledby="decor-heading"><div class="decor-title-row"><div><h2 id="decor-heading">一起布置小屋</h2><p>挑一個喜歡的小物，放到想放的地方。</p></div><span class="decor-count">${state.items.length} / ${MAX_ITEMS}</span></div>
      <div class="decor-themes" aria-label="小屋色調">${Object.entries(THEMES).map(([id,name])=>`<button type="button" class="decor-theme-button ${state.theme===id?'is-current':''}" data-decor-theme="${id}" aria-pressed="${state.theme===id}"><span class="decor-swatch swatch-${id}"></span>${name}</button>`).join('')}</div>
      <div class="decor-catalog" aria-label="可以加入的小物">${Object.entries(ART).map(([id,art])=>`<button type="button" data-decor-add="${id}" ${state.items.length>=MAX_ITEMS?'disabled':''}>${svg(id)}<span>＋ ${art.name}</span></button>`).join('')}</div>
      ${state.items.length?`<label class="decor-picker">想移動哪一個？<select data-decor-picker><option value="">先選一個小物</option>${state.items.map((i,n)=>`<option value="${i.id}" ${i.id===selected?'selected':''}>${n+1}. ${ART[i.kind].name}</option>`).join('')}</select></label>`:'<p class="decor-empty">現在還沒有放小物。點上面的「＋」試試看！</p>'}
      ${item?`<div class="decor-editor"><div class="decor-editor-title"><strong>正在移動：${ART[item.kind].name}</strong><button type="button" class="decor-remove" data-decor-remove="${item.id}">拿走這個</button></div><p>可以拖曳，也可以用下面的按鈕慢慢移。</p><div class="decor-move-row"><button type="button" data-decor-move="left" aria-label="小物往左移">←</button><button type="button" data-decor-move="up" aria-label="小物往上移">↑</button><button type="button" data-decor-move="down" aria-label="小物往下移">↓</button><button type="button" data-decor-move="right" aria-label="小物往右移">→</button></div><label class="decor-range">左右 <input type="range" min="5" max="95" step="1" value="${item.x}" data-decor-axis="x" aria-label="小物左右位置"><output>${Math.round(item.x)}%</output></label><label class="decor-range">上下 <input type="range" min="10" max="90" step="1" value="${item.y}" data-decor-axis="y" aria-label="小物上下位置"><output>${Math.round(item.y)}%</output></label></div>`:''}
      <p class="decor-note">這是遊戲布置，真實用品仍要檢查材質和零件。</p><div class="decor-bottom"><button type="button" class="btn secondary" data-decor-export>下載布置備份</button><button type="button" class="decor-reset" data-decor-reset>清空房間…</button>${blocked?'<button type="button" class="btn secondary" data-decor-original>保存原始布置</button>':''}</div>
      <p class="decor-status ${messageKind}" data-decor-status role="status">${esc(message||(canStore?'布置會留在這台裝置。':'這次先玩，離開前請下載布置備份。'))}</p>
      <dialog class="decor-confirm" data-decor-dialog aria-labelledby="decor-dialog-title"><h2 id="decor-dialog-title"></h2><p data-decor-dialog-message></p><div class="decor-confirm-actions"><button type="button" class="btn secondary" data-decor-cancel>先不要</button><button type="button" class="btn danger" data-decor-confirm>確定</button></div></dialog>
    </section>`;
  }
  function download(raw,name){
    const url=URL.createObjectURL(new Blob([raw],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);
  }
  function mount(container,onChange){
    if(!container||typeof container.addEventListener!=='function')return ()=>{};
    mounts.get(container)?.abort();
    const controller=new AbortController();mounts.set(container,controller);const {signal}=controller;
    let pending=null,drag=null,oldFocus=null;
    function refresh(focus){
      const active=document.activeElement;
      let restore=null;
      if(container.contains(active)){
        for(const attr of ['data-decor-add','data-decor-theme','data-decor-picker','data-decor-axis','data-decor-reset','data-decor-remove']){
          if(active.hasAttribute(attr)){restore={attr,value:active.getAttribute(attr)};break;}
        }
      }
      container.querySelectorAll('[data-decor-panel]').forEach(el=>{el.outerHTML=panel();});
      container.querySelectorAll('[data-decor-layer]').forEach(el=>{el.outerHTML=layer();});
      if(focus){const selector=focus.id?`[data-decor-select="${focus.id}"]`:focus.move?`[data-decor-move="${focus.move}"]`:null;if(selector)container.querySelector(selector)?.focus({preventScroll:true});}
      else if(restore){const target=[...container.querySelectorAll('['+restore.attr+']')].find(el=>el.getAttribute(restore.attr)===restore.value&&!el.disabled);(target||container.querySelector('[data-decor-picker]')||container.querySelector('[data-decor-add]:not(:disabled)'))?.focus({preventScroll:true});}
    }
    function report(text,kind='success'){message=text;messageKind=kind;container.querySelectorAll('[data-decor-status]').forEach(el=>{el.textContent=message;el.className='decor-status '+kind;});}
    function changed(next,text,focus){
      message=text;messageKind='success';let saved;
      try{saved=persist(next);}catch(e){report(e.message,'error');return;}
      refresh(focus);onChange?.(stateExport(),saved?text:message,saved);
    }
    function ask(kind,id){
      const dialog=container.querySelector('[data-decor-dialog]');if(!dialog)return;
      pending={kind,id};oldFocus=document.activeElement;
      dialog.querySelector('h2').textContent=kind==='reset'?'把小屋的布置清空嗎？':'拿走這個小物嗎？';
      dialog.querySelector('[data-decor-dialog-message]').textContent=kind==='reset'?'會拿走所有加上的小物，色調也會回到奶油小屋。鳥寶和照顧紀錄不會改變。想留下這個樣子，可以先下載布置備份。':'拿走後，還能從上面的清單重新加入。';
      dialog.querySelector('[data-decor-confirm]').textContent=kind==='reset'?'確認清空布置':'確認拿走';
      dialog.showModal();dialog.querySelector('[data-decor-cancel]').focus();
    }
    function close(){container.querySelector('[data-decor-dialog]')?.close();pending=null;oldFocus?.isConnected&&oldFocus.focus({preventScroll:true});}
    function move(id,dx,dy,focus){const next=stateExport(),item=next.items.find(i=>i.id===id);if(!item)return;item.x=Math.max(5,Math.min(95,item.x+dx));item.y=Math.max(10,Math.min(90,item.y+dy));changed(next,'位置調整好了。',focus);}
    container.addEventListener('click',e=>{
      const el=e.target.closest('[data-decor-add],[data-decor-theme],[data-decor-select],[data-decor-move],[data-decor-remove],[data-decor-reset],[data-decor-cancel],[data-decor-confirm],[data-decor-export],[data-decor-original]');if(!el||!container.contains(el))return;
      try{
        if(el.hasAttribute('data-decor-add')){
          const kind=el.dataset.decorAdd;if(!Object.hasOwn(ART,kind)||state.items.length>=MAX_ITEMS)return;
          const next=stateExport();if(next.nextId>=1000000000)throw new Error('布置編號已滿，請先存備份，再重新布置。');
          selected='d'+next.nextId++;next.items.push({id:selected,kind,x:ART[kind].x,y:ART[kind].y});changed(next,'加入'+ART[kind].name+'了。可以拖曳，或用方向按鈕移動。');
        }else if(el.hasAttribute('data-decor-theme')){const next=stateExport();next.theme=el.dataset.decorTheme;changed(next,'換成'+THEMES[next.theme]+'了。');}
        else if(el.hasAttribute('data-decor-select')){selected=el.dataset.decorSelect;refresh({id:selected});}
        else if(el.hasAttribute('data-decor-move')){const d=el.dataset.decorMove;move(selected,d==='left'?-3:d==='right'?3:0,d==='up'?-3:d==='down'?3:0,{move:d});}
        else if(el.hasAttribute('data-decor-remove'))ask('remove',el.dataset.decorRemove);
        else if(el.hasAttribute('data-decor-reset'))ask('reset');
        else if(el.hasAttribute('data-decor-cancel'))close();
        else if(el.hasAttribute('data-decor-confirm')){const choice=pending;close();if(!choice)return;if(choice.kind==='reset'){const result=reset();refresh();onChange?.(stateExport(),message,result.saved);}else{const next=stateExport();next.items=next.items.filter(i=>i.id!==choice.id);selected=null;changed(next,'已拿走小物。喜歡的話，隨時可以再放回來。');}}
        else if(el.hasAttribute('data-decor-export')){download(JSON.stringify(stateExport(),null,2),'玄鳳小日子-布置-v1.json');report('布置備份已準備好，請保存到找得到的位置。');}
        else if(el.hasAttribute('data-decor-original')&&originalRaw!==null){download(originalRaw,'玄鳳小日子-原始布置.json');report('已準備原始布置檔。這不會覆寫原本的布置。');}
      }catch(err){report(err.message||'這次沒有改好，再試一次。','error');}
    },{signal});
    container.addEventListener('change',e=>{
      if(e.target.matches('[data-decor-picker]')){selected=state.items.some(i=>i.id===e.target.value)?e.target.value:null;refresh();container.querySelector('[data-decor-picker]')?.focus({preventScroll:true});}
      else if(e.target.matches('[data-decor-axis]')){
        const axis=e.target.dataset.decorAxis,val=Number(e.target.value);const next=stateExport(),item=next.items.find(i=>i.id===selected);if(!item||!['x','y'].includes(axis)||!Number.isFinite(val))return;
        item[axis]=Math.max(axis==='x'?5:10,Math.min(axis==='x'?95:90,val));changed(next,'位置調整好了。');container.querySelector(`[data-decor-axis="${axis}"]`)?.focus({preventScroll:true});
      }
    },{signal});
    container.addEventListener('input',e=>{if(e.target.matches('[data-decor-axis]')){const axis=e.target.dataset.decorAxis,value=Number(e.target.value);e.target.parentElement.querySelector('output').textContent=Math.round(value)+'%';const layer=container.querySelector(`[data-decor-select="${selected}"]`);if(layer&&Number.isFinite(value))layer.style[axis==='x'?'left':'top']=value+'%';}},{signal});
    container.addEventListener('keydown',e=>{
      const el=e.target.closest('[data-decor-select]');if(!el)return;const keys={ArrowLeft:[-3,0],ArrowRight:[3,0],ArrowUp:[0,-3],ArrowDown:[0,3]};if(!keys[e.key])return;e.preventDefault();selected=el.dataset.decorSelect;move(selected,...keys[e.key],{id:selected});
    },{signal});
    container.addEventListener('pointerdown',e=>{
      const el=e.target.closest('[data-decor-select]');if(!el||e.button!==0)return;
      const layer=el.closest('[data-decor-layer]'),item=state.items.find(i=>i.id===el.dataset.decorSelect);if(!layer||!item)return;
      const rect=layer.getBoundingClientRect();if(!rect.width||!rect.height)return;
      selected=item.id;drag={id:item.id,pointerId:e.pointerId,x:e.clientX,y:e.clientY,itemX:item.x,itemY:item.y,rect,el,moved:false};el.setPointerCapture(e.pointerId);
    },{signal});
    container.addEventListener('pointermove',e=>{
      if(!drag||e.pointerId!==drag.pointerId)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.abs(dx)+Math.abs(dy)>5)drag.moved=true;
      if(!drag.moved)return;e.preventDefault();drag.nextX=Math.max(5,Math.min(95,drag.itemX+dx/drag.rect.width*100));drag.nextY=Math.max(10,Math.min(90,drag.itemY+dy/drag.rect.height*100));drag.el.style.left=drag.nextX+'%';drag.el.style.top=drag.nextY+'%';
    },{signal});
    function finishDrag(e){if(!drag||e.pointerId!==drag.pointerId)return;const finished=drag;drag=null;if(finished.moved){const next=stateExport(),item=next.items.find(i=>i.id===finished.id);if(item){item.x=Math.round(finished.nextX*10)/10;item.y=Math.round(finished.nextY*10)/10;changed(next,'小物放好了。');}}}
    container.addEventListener('pointerup',finishDrag,{signal});
    container.addEventListener('pointercancel',e=>{if(drag&&drag.pointerId===e.pointerId){drag=null;refresh();}},{signal});
    container.querySelector('[data-decor-dialog]')?.addEventListener('cancel',()=>{pending=null;},{signal});
    return ()=>{controller.abort();mounts.delete(container);};
  }
  if(typeof root.addEventListener==='function')root.addEventListener('storage',e=>{
    if(e.key!==KEY)return;
    originalRaw=e.newValue;blocked=true;message='另一個分頁改了布置。先下載這頁的備份，再重新整理，就能看到最新的房間。';messageKind='error';
    root.document?.querySelectorAll('[data-decor-status]').forEach(el=>{el.textContent=message;el.className='decor-status error';});
  });
  root.CottageDecor=Object.freeze({panel,layer,mount,stateExport,validateImport,applyImport,reset,captureRuntime,restoreRuntime,themes:THEMES,kinds:Object.freeze(Object.keys(ART)),MAX_ITEMS,storageStatus:()=>({canStore,blocked,message})});
})(typeof globalThis==='undefined'?window:globalThis);
