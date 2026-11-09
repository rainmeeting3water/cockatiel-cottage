(function () {
  'use strict';
  const L = globalThis.CottageI18n, C = globalThis.CottageCore, A = globalThis.CottageArt, M = globalThis.CottageMotion, MU = globalThis.CottageMusic, G = globalThis.CottageGallery, DE = globalThis.CottageDecor, GU = globalThis.CottageGuides, CR = globalThis.CottageCreator;
  let D = L.content();
  const KEY = 'cockatiel-cottage-save', OPEN_KEY = 'cockatiel-cottage-open';
  const $ = (s) => document.querySelector(s);
  const esc = (v) => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icon = n => A.icon(n);
  const pages = [['home','home','我的玄鳳小屋'],['learn','book','認識玄鳳'],['food','food','食物查詢'],['safety','shield','安全練習'],['journal','heart','陪伴日記'],['music','music','聽歌小角落'],['gallery','camera','鳥寶照片牆'],['creator','feather','鳥寶創作室']];
  const TEXT_SIZE_KEY='cockatiel-cottage-text-size-v1';
  let textSize='standard';try{const saved=localStorage.getItem(TEXT_SIZE_KEY);if(['standard','large','extra'].includes(saved))textSize=saved;}catch(_){}
  document.documentElement.dataset.textSize=textSize;
  L.register({'文字大小':'Text size','標準':'Standard','大字':'Large','特大字':'Extra large','顯示語言':'Display language','文字大小會記在這台裝置，不影響照顧紀錄。':'Text size is saved on this device. It does not change your care record.','語言與文字大小只存在這台裝置。':'Language and text size stay on this device.','目前無法使用本機儲存，這次設定只會暫存。':'Local storage is unavailable. These settings last for this visit only.','的小天地':"’s little home",'的小日子':"’s care journal",'小屋':'Home','認識':'Learn','食物':'Food','安全':'Safety','日記':'Journal'});
  const navShort={home:'小屋',learn:'認識',food:'食物',safety:'安全',journal:'日記',music:'聽歌',gallery:'相簿',creator:'創作'};
  function setTextSize(value){if(!['standard','large','extra'].includes(value))return;textSize=value;document.documentElement.dataset.textSize=value;try{localStorage.setItem(TEXT_SIZE_KEY,value);}catch(_){toast('目前無法使用本機儲存，這次設定只會暫存。');}document.querySelectorAll('[data-text-size-choice]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.textSizeChoice===value)));}
  function syncLanguageButtons(){document.querySelectorAll('[data-language]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.language===L.getLanguage())));}
  const ages = {young:'已離乳幼鳥',adult:'成鳥',senior:'高齡鳥'};
  const colorNames = {lutino:'黃化玄鳳',gray:'原始灰玄鳳',pearl:'珍珠玄鳳'};
  const careItems = [['water','water','乾淨的水'],['food','food','準備好食物'],['clean','clean','乾淨的小屋'],['company','heart','一起玩和休息']];
  const hazards = {
    window:{title:'把門窗關好',detail:'打開的門窗可能讓鳥飛走。把門窗關好。玻璃和鏡子也要留意，別讓鳥寶撞上去。',done:'門窗都關好了'},
    fan:{title:'關閉吊扇',detail:'旋轉的扇葉會造成嚴重傷害。先關閉，再等扇葉完全停止。',done:'扇葉已完全停止'},
    pets:{title:'貓狗先去別的房間',detail:'貓狗平常再乖，也可能突然追鳥或咬鳥。先讓牠們去別的房間。',done:'貓狗已去別的房間'},
    objects:{title:'收好危險物品',detail:'移開熱鍋、電線、藥品、開放水容器與不明植物，避開煙霧及噴霧。',done:'危險物品已收妥'}
  };
  let state = C.createState(), loaded = false, saveBlocked = false, originalRaw = null, storageWorks = true;
  let sessionOpen = true, page = 'home', foodFilter = 'all', query = '', resting = false, outside = false;
  let toastTimer, opener = null, audio, nextMotion='idle', reviewPending=false;
  try {
    originalRaw = localStorage.getItem(KEY);
    if (originalRaw !== null) { state = C.parseSave(originalRaw); loaded = true; }
    sessionOpen = localStorage.getItem(OPEN_KEY) !== 'closed';
  } catch (e) {
    if (originalRaw !== null) saveBlocked = true;
    else storageWorks = false;
  }

  function hydrateIcons(root = document) { root.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = icon(el.dataset.icon); }); }
  function save() {
    if (saveBlocked) { $('#save-status').textContent = '原紀錄受保護，目前暫存'; return false; }
    try {
      localStorage.setItem(KEY, C.serialize(state));
      localStorage.setItem(OPEN_KEY, sessionOpen ? 'active' : 'closed');
      storageWorks = true;
      $('#save-status').textContent = '已存於這台裝置';
      return true;
    } catch (_) {
      storageWorks = false;
      $('#save-status').textContent = '無法存檔，請匯出備份';
      return false;
    }
  }
  function commit(next) { state = next; save(); applySettings(); render(); }
  function begin() { if (!sessionOpen || state.safeMode) { state = C.startSession(state); sessionOpen = true; } }
  function applySettings() {
    document.body.classList.toggle('reduced-motion', state.settings.reducedMotion);
    $('#sound-toggle').innerHTML = icon(state.settings.muted ? 'muted' : 'volume');
    $('#sound-toggle').setAttribute('aria-label', state.settings.muted ? '開啟互動音效' : '關閉互動音效');
    $('#sound-toggle').setAttribute('aria-pressed', String(!state.settings.muted));
  }
  function chirp() {
    if (state.settings.muted) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      audio ||= new AC(); audio.resume();
      const o = audio.createOscillator(), g = audio.createGain(), t = audio.currentTime;
      o.type = 'sine'; o.frequency.setValueAtTime(1250,t); o.frequency.exponentialRampToValueAtTime(1900,t+.08);
      g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(.035,t+.015); g.gain.exponentialRampToValueAtTime(.001,t+.18);
      o.connect(g).connect(audio.destination); o.start(t); o.stop(t+.2);
    } catch (_) { toast('這個瀏覽器暫時無法播放音效。'); }
  }
  function toast(message) { $('#toast').textContent = message; L.apply($('#toast')); $('#toast').classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(()=>$('#toast').classList.remove('show'),5000); }
  function links(ids) { return ids?.length ? `<div class="source-links">${ids.map(id=>{const s=D.sources.find(s=>s.id===id);return s?`<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title.split(/[｜|]/)[0].trim())} ↗</a>`:'';}).join('')}<span>查核 ${D.checked}</span></div>` : ''; }
  function heading(en,title,desc,side='') { return `<div class="page-heading"><div><div class="eyebrow">${en}</div><h1>${title}</h1><p>${desc}</p></div>${side}</div>`; }
  function urgent() { return `<div class="notice urgent">${icon('vet')}<div><strong>${esc(D.emergency.title)}</strong><p>${esc(D.emergency.detail)}</p>${links(D.emergency.sourceIds)}</div></div>`; }
  function outcome() {
    if (!state.stage) return '';
    return `<div class="outcome-banner"><strong>${esc(C.STAGE_MESSAGES[state.stage])}</strong><p>故事會照這四步演。真鳥不一定照順序生病；只疏忽一次，也可能受傷。一起記住：離開前，要再檢查一次。</p>${state.stage>=3?`<button class="btn secondary" data-action="vet">${icon('vet')} 練習向獸醫求助</button>`:''}${state.stage===4?'<button class="btn secondary" data-action="reset">回顧後重新開始</button>':''}</div>`;
  }

  function roomArt() {
    return `<svg class="wall-art" viewBox="0 0 720 380" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs><pattern id="grain" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="2" cy="4" r=".65" fill="#b3a16e" opacity=".12"/><circle cx="15" cy="16" r=".5" fill="#b3a16e" opacity=".1"/></pattern><linearGradient id="daylight" x2="0" y2="1"><stop stop-color="#e5eddb"/><stop offset="1" stop-color="#f9f3d8"/></linearGradient></defs>
      <rect width="720" height="380" fill="${outside?'#e9eddd':'#f3efdc'}"/><rect width="720" height="380" fill="url(#grain)"/>
      <path d="M0 270H720V380H0Z" fill="#e5d7b4"/><path d="M0 270H720" stroke="#d6cba9" stroke-width="4"/><path d="M0 327H720M180 272L145 380M440 272L466 380M660 272L707 380" stroke="#d6c8a4" stroke-width="1" opacity=".6"/>
      <g transform="translate(62 45)"><rect x="-8" y="-7" width="183" height="167" rx="66" fill="#e4d5b2"/><path d="M0 68Q0 0 81 0Q162 0 162 68V148H0Z" fill="url(#daylight)"/>
      <path d="M0 121Q38 92 64 115Q98 62 162 98V148H0Z" fill="#b8c6a3" opacity=".6"/><path d="M0 139Q41 112 90 137Q119 116 162 125V148H0Z" fill="#a5b992" opacity=".65"/><path d="M81 0V148M0 78H162" stroke="#e7d9b9" stroke-width="7"/><rect x="-15" y="148" width="193" height="9" rx="4" fill="#cebb91"/>
      <path d="M-15-8Q-3 15-10 67L-23 143H-37L-32-8Z" fill="#e9e2c9"/><path d="M173-8Q159 18 175 75L187 143H199L190-8Z" fill="#e9e2c9"/></g>
      <g opacity=".9" transform="translate(501 66)"><path d="M0 0H137" stroke="#b7a782" stroke-width="7" stroke-linecap="round"/><path d="M14 5V16M122 5V16" stroke="#c4b593" stroke-width="3"/><path d="M20-23H47L43-4H24Z" fill="#a6b08c"/><path d="M30-25Q15-56 27-58Q39-45 35-24M32-27Q45-55 51-47Q49-31 35-24" fill="#9cab82"/><path d="M62-39H74V-4H62Z" fill="#d2b08c"/><path d="M76-32H86V-4H76Z" fill="#b2b99a"/><path d="M89-36H101V-4H89Z" fill="#e0c480"/><rect x="113" y="-25" width="19" height="22" rx="5" fill="#e9d9ab"/></g>
      <g transform="translate(550 160)"><rect width="79" height="75" rx="5" fill="#dfcfad"/><rect x="6" y="6" width="67" height="63" rx="2" fill="#faf5e2"/><path d="M25 53Q28 37 42 34Q54 31 59 42Q48 57 25 53" fill="#b7bf94"/><path d="M41 33Q29 21 36 16Q49 17 49 35" fill="#d9bd7c"/><circle cx="54" cy="25" r="8" fill="#f0dcaa"/></g>
      <g transform="translate(98 217)"><path d="M-13 31H82Q89 31 89 45V82H-22V44Q-22 31-13 31" fill="#b9c29a"/><rect x="-15" y="-7" width="94" height="50" rx="19" fill="#c5cda9"/><rect x="-20" y="28" width="103" height="34" rx="8" fill="#d3d7b5"/><path d="M-14 77V88M78 77V88" stroke="#a99571" stroke-width="7" stroke-linecap="round"/><path d="M5 8H33V33H5Z" fill="#e4dfb9"/><path d="M10 13L28 29M27 12L10 30" stroke="#c8bd91" opacity=".5"/></g>
      <ellipse cx="365" cy="329" rx="158" ry="31" fill="#c3b28b" opacity=".23"/><ellipse cx="365" cy="324" rx="156" ry="30" fill="#e9cf98"/><ellipse cx="365" cy="324" rx="132" ry="22" fill="none" stroke="#ddbf83" stroke-width="1.3"/>
      <g transform="translate(358 195)"><path d="M0 56V111M-43 56H48" stroke="#b9a17a" stroke-width="9" stroke-linecap="round"/><path d="M-26 115Q0 104 25 115" stroke="#b9a17a" stroke-width="6" fill="none" stroke-linecap="round"/></g>
      <g transform="translate(527 270)"><path d="M-29 9H34L27 55H-21Z" fill="#c0b08c"/><ellipse cy="9" rx="32" ry="7" fill="#d0c09e"/><path d="M1 6V-61" stroke="#96a37b" stroke-width="3"/><path d="M0-25Q-39-28-31-53Q-3-54 0-25M0-41Q31-48 30-67Q4-66 0-41M1-7Q34-15 29-34Q8-33 1-7" fill="#a6b38b"/></g>
      <g transform="translate(251 302)"><path d="M-21 0H20L16 17Q0 26-17 17Z" fill="#f4eee0"/><ellipse rx="21" ry="6" fill="#a7c3c3"/><path d="M56 6H88L84 20Q70 26 60 20Z" fill="#c8a57f"/><ellipse cx="72" cy="6" rx="17" ry="5" fill="#d9c18a"/></g>
      ${state.safeMode?'<g transform="translate(347 199)" stroke="#b6b394" fill="none" opacity=".55"><path d="M-75 10Q-75-70 0-70Q75-70 75 10V96H-75Z" stroke-width="4"/><path d="M-45-49V96M-15-66V96M15-66V96M45-49V96" stroke-width="2"/><path d="M-75 34H75M-75 76H75" stroke-width="2"/></g>':''}
    </svg>`;
  }
  function home() {
    const done = careItems.filter(([k])=>state.care[k]>=70).length;
    const mood = state.stage===4?'在小屋裡，留一個想念的位置。':state.stage===3?'牠需要專業協助，請練習看獸醫。':state.stage===2?'精神不太好，請留意異常。':resting?'讓我安靜休息一下 ♡':state.safeMode?'安全回家，謝謝你的細心。':'今天，也一起慢慢來吧。';
    return `${heading('A LITTLE HOME, A LOT OF LOVE','嗨，歡迎回到玄鳳小屋。','一起換水、準備食物，也記得陪鳥寶休息。',`<div class="heading-side">${icon('sun')} 今天也有溫柔的陪伴</div>`)}${outcome()}
    <div class="home-layout"><div><section class="room-card" aria-label="玄鳳小屋場景"><div class="room-header"><div class="room-title"><div class="mini-avatar">${M.image(state.bird.color,'',true)}</div><div><strong><span data-i18n-ignore>${esc(state.bird.name)}</span>${L.t('的小天地')}</strong><p>${esc(L.t(colorNames[state.bird.color]))} ・ ${esc(L.t(ages[state.bird.age]))}</p></div></div><button class="text-button" data-action="profile">編輯鳥寶 ↗</button></div>
    <div class="room-scene ${outside?'outside':''} ${state.stage===4?'missing':''}" role="group" aria-label="${esc(state.bird.name)}在溫暖的小屋${state.stage===4?'，目前狀況不明':resting?'安靜休息':'自在站著'}"><span class="scene-tag">${icon(state.safeMode?'shield':'sun')}${state.safeMode?'安全模式已開啟':outside?'有人陪伴的放風時間':'小屋裡的日常'}</span>${roomArt()}${DE.layer()}<div class="speech">${mood}</div><div class="scene-shadow"></div><div class="scene-bird ${resting?'resting':''}">${M.image(state.bird.color,'',true)}</div><span class="scene-mood">${state.stage>=2?'需要關心':resting?'休息中':outside?'飛一圈':'看看四周'}</span></div>
    <div class="room-caption"><div><strong>${state.stage===4?'先回顧安全原因，再決定是否重新開始故事。':state.safeMode?'已回到安全鳥籠，放心結束本次練習。':'不用一直按按鈕，安靜陪著也很好。'}</strong><p>鳥寶會走走、理毛，也會休息。遊戲動作不能看出真鳥有沒有生病。</p></div><span class="dots" aria-hidden="true"><i></i><i></i><i></i></span></div></section>
    <div class="care-actions" aria-label="照顧互動">${[['water','water','換新鮮水'],['food','food','準備食物'],['clean','clean','清理小屋'],['play','play','邀請陪玩'],['flight','feather','安全放風']].map(([a,i,t])=>`<button class="care-action" data-action="${a}" ${state.stage===4?'disabled':''}><span class="action-icon">${icon(i)}</span><span>${t}</span></button>`).join('')}</div>
    <div class="room-help"><button class="btn secondary" data-action="roam" ${state.stage===4?'disabled':''}>${icon('feather')}邀請牠走走</button><button class="btn secondary" data-action="sing" ${state.stage===4?'disabled':''}>${icon('play')}鳥寶唱一小段</button></div><p class="microcopy">${icon('info')}這些格子只記錄遊戲裡做了什麼，不是真鳥的健康分數。離線不扣分。</p><div class="quick-nav"><a href="#music">${icon('music')}聽 KOOKEE KOOKEE</a><a href="#gallery">${icon('camera')}鳥寶照片牆</a><a href="#creator">${icon('feather')}做自己的鳥寶</a><a href="#decor-panel" data-action="show-decor">${icon('home')}布置小屋</a></div>
    ${DE.panel()}<div class="discover-row"><a class="discovery" href="#learn"><div class="discover-art">${M.image('lutino')}</div><div><span class="tag">MEET YOUR LITTLE FRIEND</span><h3>小小冠羽，大大的個性</h3><p>先認識牠，再慢慢靠近牠。</p></div><span class="go">↗</span></a><a class="discovery green" href="#food"><div class="food-illustration">${icon('leaf')}</div><div><span class="tag">A LITTLE FOOD GUIDE</span><h3>這個，鳥寶可以吃嗎？</h3><p>準備食物前，一起查一查。</p></div><span class="go">↗</span></a></div></div>
    <aside class="right-column"><section class="card daily-card"><div class="card-heading"><h2>今天的小小照顧</h2><span class="count-badge">${done} / 4</span></div><p>一點一滴，都是陪伴。</p>${careItems.map(([k,i,t])=>`<div class="meter-row"><div class="meter-label">${icon(i)}<span>${t}</span><span>${state.care[k]>=70?'已照顧':'待照顧'}</span></div><div class="meter" role="meter" aria-label="${t}教學數值" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${state.care[k]}" aria-valuetext="${state.care[k]}，教學簡化"><span style="width:${state.care[k]}%"></span></div></div>`).join('')}<p class="simulation-label">只記遊戲進度，不能當成健康檢查。</p></section>
    <section class="safety-card ${state.safeMode?'is-safe':''}"><span class="inline-icon">${icon('shield')}</span><h2>${state.stage===4?'這次的故事，先停在這裡。':state.safeMode?'安心的離開，完成了。':'出門前，留一份安心。'}</h2><p>${state.stage===4?'鳥寶目前狀況不明，無法確認回籠。回顧原因，記住真實生命未必能重來。':state.safeMode?'環境與基本照顧已檢查，鳥寶已回籠。下次回來，再開始新的陪伴。':'關好門窗、關掉吊扇，確認鳥寶回到安全的家，再說晚點見。'}</p><button class="btn wide" data-action="${state.stage===4?'reset':state.safeMode?'resume':'safety'}">${icon(state.safeMode?'home':'shield')}${state.stage===4?'回顧後重新開始':state.safeMode?'回來繼續陪伴':'離開前安全模式'}</button></section>
    <div class="little-tip"><div class="tip-top">${icon('leaf')} 陪伴小筆記</div>鳥寶願意靠近，是信任；<br>牠想自己待著，也值得被尊重。<button class="text-button" data-action="rest">給牠安靜的時間 →</button></div></aside></div>`;
  }
  function learn() {
    return heading('GET TO KNOW COCKATIELS','先看圖，一起認識牠。','先記住這幾件事。想知道更多，再打開小卡。')+GU.overview()+
    '<div class="basics">'+D.basics.slice(0,3).map(b=>'<details class="basic"><summary>'+esc(b.title)+'</summary><p>'+esc(b.detail)+'</p>'+links(b.sourceIds)+'</details>').join('')+'</div>'+ 
    '<div class="section-title"><h2>不同羽色，都是玄鳳</h2><small>外觀不決定個性</small></div><div class="content-grid color-grid">'+D.colors.map(c=>'<article class="card color-card"><div class="color-bird">'+M.image(c.id)+'</div><div class="info-card"><h2>'+esc(c.name)+'</h2><details><summary>看看牠的羽毛</summary><p>'+esc(c.description)+'</p>'+links(c.sourceIds)+'</details></div></article>').join('')+'</div>'+ 
    '<div class="notice">'+icon('feather')+'<p>'+esc(D.basics[3].detail)+' 圖片是遊戲角色，不能用來看真鳥的性別、年齡或健康。</p></div>'+ 
    '<div class="section-title"><h2>每天怎麼照顧？</h2><small>資料查核 '+D.checked+'</small></div><div class="content-grid two">'+D.guides.filter(g=>g.id!=='emergency').map(g=>GU.careCard(g.id,g.title,g.summary,'<ul>'+g.bullets.map(b=>'<li>'+esc(b)+'</li>').join('')+'</ul>'+links(g.sourceIds))).join('')+'</div>'+urgent();
  }
  function food() {
    return `${heading('BEFORE YOU SHARE A BITE','這個，鳥寶可以吃嗎？','先查一查，再決定放進食碗裡。')}<p class="section-intro">${esc(D.foodIntro)}</p><label class="search-box">${icon('food')}<input id="food-query" type="search" value="${esc(query)}" placeholder="搜尋食物，例如：蘋果、酪梨、木糖醇" aria-label="搜尋食物"></label><div class="filters" aria-label="食物分類">${[['all','全部食物'],['suitable','可適量'],['avoid','需要避免'],['unknown','資料不足']].map(([k,t])=>`<button class="filter ${foodFilter===k?'active':''}" data-action="filter" data-filter="${k}" aria-pressed="${foodFilter===k}">${t}</button>`).join('')}</div><div id="food-results"></div>${urgent()}`;
  }
  function renderFoods() {
    const words = query.trim().toLocaleLowerCase();
    const rows = D.foods.filter(f=>(foodFilter==='all'||f.status===foodFilter)&&[f.name,...f.aliases].some(s=>s.toLocaleLowerCase().includes(words)));
    $('#food-results').innerHTML = `<p class="result-count" role="status">${rows.length} 項查詢結果 · 查核 ${D.checked}</p>${rows.length?`<div class="content-grid">${rows.map(f=>`<article class="food-result">${GU.foodIcon((globalThis.CockatielContent.foods.find(item=>item.id===f.id)||f).name,f.status)}<div><h2>${esc(f.name)}</h2></div><p>${esc(f.detail)}</p><small class="subtle">${esc(f.category)}</small>${links(f.sourceIds)}</article>`).join('')}</div>`:`<div class="empty"><h2>目前沒有這項食物的可靠資料</h2><p>搜尋不到不代表安全。先不要餵，確認完整成分後詢問鳥類獸醫。</p></div>`}`;
  }
  function safety() {
    const issues=C.safetyIssues(state);
    return `${heading('A SAFE SPACE TO EXPLORE','先安心，才放心探索。','觀察房間裡的四種危險，點選處理，了解每個動作的原因。')}${outcome()}<div class="safety-layout"><div><div class="hazard-grid">${Object.entries(hazards).map(([k,h])=>`<button class="hazard ${state.hazards[k]?'':'safe'}" data-action="hazard" data-key="${k}" aria-pressed="${!state.hazards[k]}"><span class="hazard-icon">${icon(k)}</span><div><h3>${h.title}</h3><p>${h.detail}</p><span class="hazard-check">${state.hazards[k]?'點一下，移除危險 →':`✓ ${h.done}`}</span></div></button>`).join('')}</div><div class="notice">${icon('info')}<p>這裡先練四件事，真實房間還可能有別的危險。鳥寶出來玩時，要一直有人陪；離開前，要讓牠回到安全鳥籠。</p></div>${links(['merck-hazards','msd-toxins'])}<div class="section-title"><h2>把「離開前檢查」變成習慣</h2></div><p class="subtle">只有你選「我真的忘了」，才會多算一次。這是遊戲故事，不能拿次數來猜真鳥會不會生病。</p><div class="stage-path">${[['安全提醒','一起補上檢查。'],['精神不佳','觀察異常，改善環境。'],['生病與看診','練習尋求專業協助。'],['飛走或狀況不明','真實生命未必能重來。']].map(([t,d],i)=>`<div class="stage-step ${state.stage===i+1?'current':''}"><span class="stage-num">0${i+1}</span><strong>${t}</strong><p>${d}</p></div>`).join('')}</div><button class="btn secondary" data-action="forgot-demo">練習：沒有檢查就離開</button><p class="microcopy">這會先要求確認，不會把關閉分頁、當機或斷線直接當成疏忽。</p></div><aside class="card departure-card"><h2>離開前，最後看一眼</h2><p class="subtle">小小檢查，安心說晚點見。</p><ul class="checklist">${Object.entries(hazards).map(([k,h])=>`<li>${icon(state.hazards[k]?'info':'check')}<span class="${state.hazards[k]?'unready':''}">${state.hazards[k]?'待確認：'+h.title:h.done}</span></li>`).join('')}${careItems.slice(0,3).map(([k,i,t])=>`<li>${icon(state.care[k]>=70?'check':'info')}<span class="${state.care[k]<70?'unready':''}">${t}${state.care[k]<70?'（回小屋完成）':''}</span></li>`).join('')}</ul><button class="btn wide" data-action="activate-safe" ${issues.length||state.safeMode||state.stage===4?'disabled':''}>${icon('shield')}${state.safeMode?'安全模式已開啟':'完成檢查並開啟'}</button><a class="btn secondary wide" href="#home" style="margin-top:10px">回小屋照顧鳥寶</a><p class="simulation-label">離開前先讓鳥寶回籠。這個遊戲不會因為你離線很久，就偷偷扣分。</p></aside></div>${urgent()}`;
  }
  function journal() {
    return `${heading('SMALL MOMENTS, KEPT CLOSE','把陪伴，留在日記裡。','幫你記住最近 40 次照顧，存在這台裝置裡。')}<section class="card journal-card"><div class="journal-top">${M.image(state.bird.color,'',true)}<div><h2><span data-i18n-ignore>${esc(state.bird.name)}</span>${L.t('的小日子')}</h2><p>${esc(L.t(colorNames[state.bird.color]))} ・ ${esc(L.t(ages[state.bird.age]))}<br>確認未檢查離開 ${state.misses} 次 · 看診練習${state.vetPracticed?'已完成':'尚未完成'}</p></div></div>${state.log.length?state.log.slice().reverse().map(l=>`<div class="log-row"><time datetime="${new Date(l.at).toISOString()}">${new Intl.DateTimeFormat(L.getLanguage()==='en'?'en-GB':'zh-TW',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',timeZone:'Asia/Taipei'}).format(l.at)}</time><span>${esc(l.text)}</span></div>`).join(''):'<div class="empty">第一碗水、第一次邀請，都是故事的開始。<br>回小屋做一件小小的照顧吧。</div>'}</section><div class="notice">${icon('download')}<p>這台裝置的紀錄不會自動跑到別台。清除瀏覽器資料、無痕視窗結束或更換網址／連接埠都可能失去或看不到存檔。請定期匯出備份。</p></div><button class="btn secondary" data-action="export">${icon('download')}匯出陪伴紀錄</button>`;
  }
  function sources() {
    return `${heading('SOURCES & LITTLE PROMISES','有來源，也保留不確定。','照顧資料從哪裡來？查核日期：2026 年 11 月 8 日。')}${urgent()}<div class="notice">${icon('info')}<div><strong>第一版仍需鳥類獸醫審閱</strong><p>${D.reviewNotes.map(esc).join('<br>')}</p><p>AAV 與 VCA 對飲食配比有不同建議，本版不提供通用比例或克數。部分 AAV 網頁直接存取受限，查核使用官方搜尋索引及可讀的官方 PDF，並非所有全文都已取得。</p></div></div>${D.sources.map(s=>`<article class="card source-card"><h3>${esc(s.title)}</h3><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">前往機構原始資料 ↗</a><p>查核 ${s.checked} · 外部來源連結可能改版；醫療個案請由鳥類獸醫評估。</p></article>`).join('')}<div class="section-title"><h2>關於這間小屋</h2></div><div class="content-grid two"><article class="card info-card"><h3>少一點資料，多一點安心</h3><p>免登入、無分析追蹤、不使用雲端資料庫、不蒐集生日或位置；你選的鳥寶照片只存在這台裝置，也沒有公開聊天。你輸入的鳥寶暱稱與遊戲紀錄，只存在瀏覽器及你匯出的 JSON。請勿輸入真實姓名或個人資料。</p><p>網站本身不送出紀錄。點開獸醫來源會離開本網站，該機構的隱私政策另行適用。</p></article><article class="card info-card"><h3>原創角色，輕輕動一下</h3><p>這一版的鳥寶是依玄鳳外觀，用生圖工具做的原創寫實動作圖；小屋和圖示也是原創。沒有拿網路照片直接放進遊戲。設定中可靜音、減少動畫，也會尊重裝置的減少動態效果偏好。</p><p>已查閱個人字體清冊；清冊候選未確認可用，本機採已存在的 Noto Sans TC（官方 OFL 1.1 授權已查核），以系統中文字體備援。未下載、嵌入或散布字型；不同裝置外觀可能不同。</p><a class="text-button" href="https://github.com/notofonts/noto-cjk/blob/main/Sans/LICENSE" target="_blank" rel="noopener noreferrer">Noto 官方授權 ↗</a></article></div><div class="notice">${icon('heart')}<p>遊戲裡的點數、固定後果與醫療代幣，全是教學設計；不代表真鳥的疾病機率、醫療價格、診斷或預後。真實生命未必能重新開始。</p></div>`;
  }
  function music() {
    const external=document.documentElement.dataset.youtubeMode==='external';
    return heading('KOOKEE KOOKEE','一起聽，開心唱。','鳥寶想跟著唱，就試試；想安靜待著，也很好。')+
    '<div class="notice">'+icon('music')+'<div><strong>先按「到 YouTube 聽原版」</strong><p>本機檔出現錯誤 153，是播放器缺少網頁來源資訊。網站版也可能受瀏覽器限制；直接到 YouTube 聽最方便。</p></div></div>'+ '<div class="music-grid">'+MU.videos.map((v,i)=>`<article class="card music-card"><div class="music-player" id="player-${v.id}"><div class="music-cover">${M.image(i?'gray':'lutino')}<div><strong>KOOKEE<br>KOOKEE</strong><small>${i?'GINGER 自己唱':'OFFICIAL MUSIC'}</small></div></div></div><div class="info-card"><h2>${esc(v.title)}</h2><p>${esc(v.note)}</p><small class="subtle">${esc(v.creator)} · ${v.published}</small><div class="music-links"><a class="btn" href="${v.url}" target="_blank" rel="noopener noreferrer">${icon('music')}到 YouTube 聽原版 ↗</a>${document.documentElement.dataset.youtubeMode==='external'?'':`<button class="btn secondary" data-action="load-video" data-video="${v.id}">${location.protocol==='file:'?'為什麼小屋播不出來？':'試試在小屋播放'}</button>`}</div><p class="music-note">${esc(external?'點一下連結，會另開 YouTube 原影片。':MU.fallback)}</p></div></article>`).join('')+'</div>'+
    '<div class="notice">'+icon('info')+'<p>'+esc(external?'按下連結才會離開小屋，到 YouTube 收聽。影片的音量、廣告和播放限制由 YouTube 提供。':MU.privacy)+' 小屋的靜音開關只管遊戲音效；影片請用播放器調整音量。</p></div><section class="card info-card"><h2>陪鳥寶聽歌，記住這幾句</h2><ul class="music-tips">'+MU.tips.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul><button class="btn secondary" data-action="sing-from-music">回小屋，邀請鳥寶唱一小段</button></section><p class="subtle" style="margin-top:18px">官方音樂版把 Ginger 的鳥聲變成歌曲。原始鳥聲素材由創作者標在影片說明裡；上方示範片不是宣稱最早上傳。</p><div class="source-links"><a href="'+MU.origin.youtubeChannel+'" target="_blank" rel="noopener noreferrer">Ginger 原作者頻道 ↗</a><span>來源查核 '+MU.mediaSourcesChecked+'</span></div><div class="animation-downloads"><a href="assets/lutino-walk.gif" download>下載走路動圖</a><a href="assets/lutino-flight.gif" download>下載飛行動圖</a></div>';
  }
  function loadVideo(id) {
    if(location.protocol==='file:') {modal('錯誤 153：換個方式聽', '<p>YouTube 沒收到播放器需要的網頁來源資訊。直接開本機檔時可能會這樣。請用「到 YouTube 聽原版」，就能在 YouTube 開啟。</p><p>換成正式網站後會再測試，現在不會一直重試。</p>', '<button class="btn" data-action="close">知道了</button>');return;}

    if(document.documentElement.dataset.youtubeMode==='external'){toast('這版請到 YouTube 原頻道收聽。');return;}
    const v=MU.videos.find(v=>v.id===id);if(!v)return;
    const box=document.getElementById('player-'+v.id);if(!box)return;
    box.innerHTML=`<div class="video-wrap"><iframe src="${esc(MU.buildEmbedUrl(id,location.href))}" title="${esc(v.originalTitle)}" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div>`;
    const button=document.querySelector('[data-video="'+id+'"]');if(button){button.textContent='關掉這支影片';button.dataset.action='stop-video';}
  }
  function gameBackup(){return globalThis.CottageBackup.pack(state,DE.stateExport());}
  function readBackup(raw){return globalThis.CottageBackup.parse(raw);}
  function render() {
    D=L.content();
    const active=document.activeElement;
    const focusAction=$('#main').contains(active)?active.dataset.action:null;
    const focusKey=active?.dataset.key;
    $('#nav').innerHTML=pages.map(([id,i,t])=>`<a class="nav-item ${page===id?'active':''}" href="#${id}" ${page===id?'aria-current="page"':''} aria-label="${esc(L.t(t))}"><span>${icon(i)}</span><span><span class="nav-full">${esc(L.t(t))}</span><span class="nav-short">${esc(L.t(navShort[id]||t))}</span></span></a>`).join('');
    $('#breadcrumb').textContent=L.t(pages.find(p=>p[0]===page)?.[2]||'資料來源與使用說明');
    G.unmount();M.unmount();CR.unmount();
    $('#main').innerHTML=({home,learn,food,safety,journal,sources,music,gallery:()=>G.render(),creator:()=>CR.render()})[page]();
    if(page==='creator')CR.mount($('#main'));
    if(page==='food')renderFoods();
    applySettings();
    if(page==='home'){DE.mount($('#main'),(_,message)=>toast(message));M.mount($('.room-scene'),{color:state.bird.color,reduced:state.settings.reducedMotion,safe:state.safeMode,stage:state.stage,resting,outside,action:nextMotion});nextMotion='idle';}
    if(page==='gallery')G.mount($('#main')).catch(()=>toast('相簿暫時打不開，請先保留備份。'));
    syncLanguageButtons();L.apply(document.body);
    if(focusAction){const same=[...$('#main').querySelectorAll('[data-action]')].find(e=>e.dataset.action===focusAction&&(!focusKey||e.dataset.key===focusKey));same?.focus({preventScroll:true});}
  }
  function navigate() { const next=location.hash.slice(1);page=['home','learn','food','safety','journal','sources','music','gallery','creator'].includes(next)?next:'home';render();window.scrollTo(0,0);if(reviewPending&&!saveBlocked&&['home','safety'].includes(page)){reviewPending=false;recovery();} }
  function modal(title,body,actions='',closeable=true) {
    opener=document.activeElement;
    $('#dialog-content').innerHTML=`<div class="dialog-top"><h2 id="dialog-title">${title}</h2>${closeable?`<button class="icon-button" data-action="close" aria-label="關閉視窗">${icon('close')}</button>`:''}</div><div class="dialog-body">${body}</div>${actions?`<div class="dialog-actions">${actions}</div>`:''}`;
    L.apply($('#dialog'));
    if(!$('#dialog').open)$('#dialog').showModal();
    $('#dialog').querySelector('button,input,select,a')?.focus({preventScroll:true});
  }
  function closeModal() { $('#dialog').close(); if(opener?.isConnected)opener.focus(); }
  function settings() {
    modal('讓陪伴更自在',`<label class="field">${L.t('顯示語言')}<select id="language-setting" data-i18n-ignore><option value="zh-Hant-TW" ${L.getLanguage()==='zh-Hant-TW'?'selected':''}>繁體中文</option><option value="en" ${L.getLanguage()==='en'?'selected':''}>English</option></select></label><div class="field"><span>${L.t('文字大小')}</span><div class="text-size-options">${[['standard','標準'],['large','大字'],['extra','特大字']].map(([value,label])=>`<button type="button" data-text-size-choice="${value}" aria-pressed="${textSize===value}">${L.t(label)}</button>`).join('')}</div><small class="language-hint">${L.t('文字大小會記在這台裝置，不影響照顧紀錄。')}</small></div><label class="toggle-row"><span>遊戲靜音<small>關掉小屋短鳴聲。YouTube 音量要在影片裡調整。</small></span><input type="checkbox" id="muted-setting" ${state.settings.muted?'checked':''}></label><label class="toggle-row"><span>減少動畫<small>讓動作停下來，鳥寶不會一直走動或拍翅。</small></span><input type="checkbox" id="motion-setting" ${state.settings.reducedMotion?'checked':''}></label><div class="settings-buttons"><button class="btn secondary" data-action="export">${icon('download')}匯出紀錄</button><button class="btn secondary" data-action="import">${icon('upload')}匯入紀錄</button></div><div class="privacy-box">免登入，存檔只留在本機。更換裝置、清除瀏覽器資料、無痕模式結束可能失去紀錄。更新會先驗證版本；不支援的紀錄會保留並提示，不能保證每次更新都相容。匯入會先確認覆寫。<br>照顧與布置可以一起備份。照片請到照片牆另外備份。<br>目前存檔格式：v${C.VERSION}。${!storageWorks?'目前無法使用本機儲存，請務必匯出。':''}${saveBlocked?'原存檔受保護，目前變更不會覆寫它。':''}</div><div class="music-links"><a href="#gallery" data-action="close-link">我的鳥寶照片 ↗</a><a href="#music" data-action="close-link">聽 KOOKEE KOOKEE ↗</a><a href="#creator" data-action="close-link">做自己的鳥寶 ↗</a><a href="#journal" data-action="close-link">陪伴日記 ↗</a></div><button class="text-button" data-action="reset">重新開始照顧故事…</button><p><a href="#sources" data-action="close-link">資料來源、醫療限制與隱私說明 ↗</a></p>`);
  }
  function profile() {
    modal('認識你的鳥寶',`<form id="profile-form"><label class="field">鳥寶暱稱（最多 20 字）<input id="bird-name" maxlength="20" required value="${esc(state.bird.name)}" autocomplete="off"></label><label class="field">羽色<select id="bird-color">${Object.entries(colorNames).map(([k,t])=>`<option value="${k}" ${state.bird.color===k?'selected':''}>${t}</option>`).join('')}</select></label><label class="field">年齡階段<select id="bird-age">${Object.entries(ages).map(([k,t])=>`<option value="${k}" ${state.bird.age===k?'selected':''}>${t}</option>`).join('')}</select></label><p>羽色和年齡是幫鳥寶做的小檔案，不會決定牠乖不乖。這裡的幼鳥已經會自己吃飯，沒有餵幼雛的教學。請用鳥寶暱稱。</p><button class="btn wide" type="submit">一起開始小日子</button></form>`);
  }
  function recovery() {
    modal('剛剛的離開，補確認一下',`<p>上次好像還沒完成安全檢查。也可能只是當機、斷線或關掉分頁，小屋不知道真正的原因。</p><p>選一個最像的情況就好。不確定也不扣分，離線多久都不會偷偷變差。</p>`,`<button class="btn" data-action="recover-technical">當機、斷線或不確定，不計次</button><button class="btn secondary" data-action="recover-forgot">我確定忘了檢查…</button>`,false);
  }
  function forgotPrompt(fromRecovery=false) {
    modal('確認這次練習的選擇',`<p>只有按下「確認未檢查離開」，才會把確認次數從 ${state.misses} 增加為 ${state.misses+1}，並呈現第 ${Math.min(4,state.misses+1)} 階段教學故事。</p><p>當機、斷線或不確定的離開不應計次。這只是練習，不是幫現實生活打分數。</p>`,`<button class="btn secondary" data-action="${fromRecovery?'recover-technical':'close'}">${fromRecovery?'不確定，不計次':'取消，回去完成檢查'}</button><button class="btn danger" data-action="confirm-forgot">確認未檢查離開</button>`);
  }
  function vet() {
    modal('練習：先找誰幫忙？',`<p>故事裡的鳥寶持續虛弱、站不穩。你會怎麼做？如果真鳥有這些警訊，請立刻通知照顧的大人並聯絡鳥類獸醫。</p><div class="vet-choices"><button class="btn" data-action="vet-correct">聯絡可接診鳥類的獸醫／急診</button><button class="btn" data-action="vet-wrong">先自行餵藥，明天再看看</button><button class="btn" data-action="vet-wrong">多餵食和陪玩，應該會好</button></div><p>教學情境不提供診斷，也不會讓遊戲數值代替醫療判斷。</p>`);
  }
  function download(raw,name) {
    const url=URL.createObjectURL(new Blob([raw],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);
  }
  function eDecor(){if(page!=='home'){location.hash='home';return;}document.querySelector('[data-decor-panel]')?.scrollIntoView({behavior:state.settings.reducedMotion?'auto':'smooth',block:'start'});}
  function resetPrompt() {
    modal('讓故事重新開始？',`<p>這會清除本瀏覽器目前的鳥寶、照顧日記、安全練習次數及設定，建立新的小屋。照片牆和小屋布置會保留。其他裝置與已匯出的備份不受影響。</p><p>遊戲可以重來，真實生命未必能重來。建議先匯出紀錄，再決定是否重新開始。</p>${saveBlocked&&originalRaw!==null?'<p>目前另有受保護的原始存檔。請先保存原始紀錄；目前暫存小屋不等於原始紀錄。</p>':''}`,`<button class="btn secondary" data-action="${saveBlocked&&originalRaw!==null?'export-original':'export'}">${saveBlocked&&originalRaw!==null?'保存原始受保護紀錄':'先匯出紀錄'}</button><button class="btn danger" data-action="confirm-reset">確認重置本機紀錄</button>`);
  }
  function action(name,el) {
    switch(name) {
      case 'close':case 'close-link': closeModal();break;
      case 'settings':settings();break;
      case 'profile':profile();break;
      case 'sound':commit(C.updateSettings(state,{muted:!state.settings.muted}));if(!state.settings.muted)chirp();break;
      case 'water':case 'food':case 'clean':
        if(state.stage===4)return; begin(); resting=false;outside=false;nextMotion=name;commit(C.performCare(state,name));chirp();toast({water:'新鮮的水準備好了！也記得洗淨水碗。',food:'今天的備餐完成。真鳥要吃多少，請問鳥類獸醫。',clean:'小屋清爽了，謝謝你的細心。'}[name]);break;
      case 'play':
        if(state.stage===4)return;begin();save();render();modal('先邀請，讓牠選擇',`<p>把玩具放在安全的位置，給 ${esc(state.bird.name)} 一點時間。牠可以主動靠近，也可以安靜觀察。</p><p>這次由你選牠的反應。真鳥退開或不想玩，就先停下來，不用一直叫牠。</p>`,`<button class="btn" data-action="play-yes">牠主動靠近，一起玩</button><button class="btn secondary" data-action="play-no">牠退開，給牠空間</button>`);break;
      case 'play-yes':closeModal();outside=false;resting=false;nextMotion='play';commit(C.performCare(state,'play'));chirp();toast('謝謝你先等待牠的邀請。');break;
      case 'rest':case 'play-no':outside=false;nextMotion='rest';closeModal();if(state.stage===4)return;begin();resting=true;commit(C.performCare(state,'rest'));toast('安靜陪著，也是一種照顧。');break;
      case 'safety':location.hash='safety';break;
      case 'hazard':begin();commit(C.resolveHazard(state,el.dataset.key));toast(hazards[el.dataset.key].done+'。記住原因，再繼續下一項。');break;
      case 'activate-safe':modal('最後確認：鳥寶已回籠',`<p>環境、飲水、食物與清潔已完成。離開前，請確認鳥寶回到安全鳥籠、門扣妥當，沒有留在房間自由活動。</p><p>安全模式不會保證真實環境絕對安全；真鳥仍需由照顧者確認。</p>`,`<button class="btn secondary" data-action="close">再檢查一下</button><button class="btn" data-action="confirm-safe">確認回籠並開啟</button>`);break;
      case 'confirm-safe':sessionOpen=false;outside=false;resting=true;commit(C.activateSafeMode(state));closeModal();toast('安全模式已開啟。可以安心結束這次練習。');break;
      case 'resume':begin();resting=false;commit(state);toast('歡迎回來。新一輪安全練習，請重新確認四項環境。');break;
      case 'flight':
        if(state.stage===4)return;begin();save();render();
        if(Object.values(state.hazards).some(Boolean)){modal('先幫牠準備安全的空間',`<p>門窗、吊扇、貓狗與危險物品還有未完成的檢查。先排除危險，再邀請鳥寶出來；放風全程都要有人看顧。</p>`,`<a href="#safety" class="btn" data-action="close-link">去做安全檢查</a>`);}
        else{begin();outside=!outside;resting=false;commit(C.performCare(state,outside?'play':'rest'));toast(outside?'有人陪伴的放風開始。想回家時，讓牠自願回籠。':'已結束放風；離開前仍要完成安全模式。');}break;
      case 'roam':if(state.stage===4)return;begin();outside=false;resting=false;nextMotion='play';commit(C.performCare(state,'play'));toast('一起走走吧！鳥寶想停下來，也沒關係。');break;
      case 'sing':if(state.stage===4)return;begin();outside=false;resting=false;nextMotion='sing';commit(C.performCare(state,'play'));chirp();toast('牠想唱就唱，不唱也很可愛。');break;
      case 'sing-from-music':if(state.stage===4){toast('鳥寶目前不在小屋，先回顧故事吧。');break;}begin();outside=false;nextMotion='sing';resting=false;state=C.performCare(state,'play');save();location.hash='home';break;
      case 'show-decor':eDecor();break;
      case 'load-video':loadVideo(el.dataset.video);break;
      case 'stop-video':render();break;
      case 'filter':foodFilter=el.dataset.filter;render();break;
      case 'forgot-demo':forgotPrompt();break;
      case 'recover-forgot':forgotPrompt(true);break;
      case 'confirm-forgot':sessionOpen=false;outside=false;commit(C.confirmDeparture(state,'forgot'));closeModal();toast('已記錄這次確認。一起回顧原因與改善方式。');break;
      case 'recover-technical':sessionOpen=true;commit(C.confirmDeparture(state,'technical'));closeModal();toast('已補確認，不計入疏忽，也沒有離線扣分。');break;
      case 'vet':vet();break;
      case 'vet-wrong':toast('照顧不等於治療。不要自行餵藥或等待，請聯絡鳥類獸醫。');break;
      case 'vet-correct':commit(C.practiceVet(state));modal('把求助，練習成行動',`<p>先聯絡可接診鳥類的獸醫，說明何時開始異常、呼吸與活動的改變，以及可能接觸的危險物。依獸醫指示安全運送，減少不必要抓握。</p><p>預算練習：假設帶有 10 枚「照護代幣」，問診使用 3 枚、檢查使用 4 枚，剩 3 枚。這些數字完全是教學設定，不是新臺幣、報價或真實統計。實際費用需向醫院詢問。</p><p>答對了也不代表病已經好了，故事會保留現在的情況。${state.stage===4?'鳥寶仍狀況不明，不能靠看診按鈕讓牠回來。':''}</p>${links(D.emergency.sourceIds)}`,`<button class="btn" data-action="close">記住了，先尋求專業協助</button>`);break;
      case 'export':download(gameBackup(),'玄鳳小日子-照顧與布置.json');toast('已準備紀錄檔。請保存到自己找得到的位置。');break;
      case 'export-original':if(originalRaw!==null)download(originalRaw,'玄鳳小日子-原始紀錄.json');break;
      case 'import':$('#import-file').value='';$('#import-file').click();break;
      case 'reset':resetPrompt();break;
      case 'confirm-reset':state=C.createState();saveBlocked=false;sessionOpen=true;resting=false;outside=false;commit(state);closeModal();location.hash='home';toast('新的小屋已準備好。一起把學到的照顧帶進新故事。');break;
      case 'reload':location.reload();break;
    }
  }
  window.addEventListener('CottageCustomBird',e=>{try{M.setCustom(e.detail?.dataUrl??null);if(typeof e.detail?.ack==='function')e.detail.ack(true,'小屋已確認。');toast(e.detail?.dataUrl?'新鳥寶已套用，這次開著頁面時有效。':'已換回小屋原本的鳥寶。');}catch(error){if(typeof e.detail?.ack==='function')e.detail.ack(false,error.message);toast(error.message);}});
  window.addEventListener('CottageLanguageChanged',()=>{const inSettings=$('#dialog').open&&Boolean($('#language-setting'));D=L.content();if(!['gallery','creator'].includes(page))render();else{syncLanguageButtons();L.apply(document.body);}if(inSettings){settings();$('#language-setting')?.focus();}else if($('#language-setting'))$('#language-setting').value=L.getLanguage();});
  document.addEventListener('click', e=>{const language=e.target.closest('[data-language]');if(language){e.preventDefault();L.setLanguage(language.dataset.language);return;}const size=e.target.closest('[data-text-size-choice]');if(size){e.preventDefault();setTextSize(size.dataset.textSizeChoice);return;}if(e.target.closest('a.skip')){e.preventDefault();$('#main').focus();return;}const el=e.target.closest('[data-action]');if(el){if(el.tagName!=='A'||el.dataset.action==='show-decor')e.preventDefault();try{action(el.dataset.action,el);}catch(err){toast(err.message||'操作未完成，原紀錄保留。');}}});
  document.addEventListener('input', e=>{if(e.target.id==='food-query'){query=e.target.value;renderFoods();}});
  document.addEventListener('change', e=>{if(e.target.id==='language-setting'){L.setLanguage(e.target.value);return;}if(['muted-setting','motion-setting'].includes(e.target.id)){commit(C.updateSettings(state,{muted:$('#muted-setting').checked,reducedMotion:$('#motion-setting').checked}));}});
  document.addEventListener('submit', e=>{if(e.target.id==='profile-form'){e.preventDefault();try{commit(C.updateBird(state,{name:$('#bird-name').value.trim(),color:$('#bird-color').value,age:$('#bird-age').value}));closeModal();toast('鳥寶的小檔案已更新。');}catch(err){toast(err.message);}}});
  $('#import-file').addEventListener('change',async e=>{
    const f=e.target.files[0];if(!f)return;
    try{if(f.size>200000)throw new Error('檔案過大。請選擇由小屋匯出的 JSON 紀錄。');const bundle=readBackup(await f.text()),imported=bundle.game;
      modal('確認匯入陪伴紀錄',`<p>將載入鳥寶「${esc(imported.bird.name)}」的 v${imported.version} 紀錄，包含 ${imported.log.length} 則日記與 ${imported.misses} 次確認紀錄。${bundle.decor?'也會換成備份裡的小屋布置。':'這是舊版備份，會保留目前的布置。'}這會取代目前本瀏覽器的遊戲紀錄。</p><p>可先取消並匯出目前紀錄。資料驗證已通過；匯入不會額外累計疏忽。</p>`,`<button class="btn secondary" data-action="close">取消</button><button class="btn" id="confirm-import">確認取代並匯入</button>`);
      $('#confirm-import').addEventListener('click',()=>{try{const result=globalThis.CottageBackup.apply(bundle);state=result.game;sessionOpen=result.sessionOpen;saveBlocked=false;storageWorks=true;resting=state.safeMode;outside=false;$('#save-status').textContent='已存於這台裝置';render();closeModal();toast('紀錄已載入並存好了，沒有多算忘記檢查的次數。');}catch(error){if(error.rollbackFailed){saveBlocked=true;$('#save-status').textContent='紀錄未完整恢復，請先備份';}render();toast(error.message);}},{once:true});
    }catch(err){toast('未匯入：'+err.message+' 目前紀錄未變更。');}
  });
  const recoveryNeedsChoice=()=>Boolean($('#dialog-content').querySelector('[data-action="recover-technical"]'));
  $('#dialog').addEventListener('cancel',e=>{if(recoveryNeedsChoice())e.preventDefault();});
  $('#dialog').addEventListener('keydown',e=>{if(e.key==='Escape'&&recoveryNeedsChoice()){e.preventDefault();e.stopPropagation();}});
  window.addEventListener('hashchange',()=>{if($('#dialog').open)closeModal();navigate();$('#main').focus({preventScroll:true});});
  window.addEventListener('storage',e=>{if(e.key===KEY){originalRaw=e.newValue;saveBlocked=true;$('#save-status').textContent='其他分頁已更新，請重新載入';modal('另一個分頁更新了紀錄',`<p>為了保留另一個分頁的變更，這個分頁已暫停寫入。請先匯出本頁紀錄，或重新載入最新存檔。</p>`,`<button class="btn secondary" data-action="export">匯出本頁紀錄</button><button class="btn" data-action="reload">載入最新紀錄</button>`);}});
  reviewPending=loaded&&sessionOpen&&!state.safeMode&&state.stage<4;
  L.initDOM();hydrateIcons();navigate();applySettings();syncLanguageButtons();L.apply(document.body);
  if(saveBlocked){modal('原本的紀錄需要確認',`<p>原存檔無法通過本版驗證，可能是檔案損壞或來自較新的版本。原紀錄已保留，這個分頁暫時不會覆寫它。</p><p>你可以先下載原始紀錄留存，或匯入相容備份。重置前仍會再次確認。</p>`,`<button class="btn secondary" data-action="export-original">保存原始紀錄</button><button class="btn secondary" data-action="import">匯入相容備份</button><button class="btn danger" data-action="reset">重置前確認…</button>`);}
  else if(!reviewPending&&!$('#dialog').open){if(!loaded)sessionOpen=true;save();if(!storageWorks)toast('目前無法儲存在瀏覽器。你仍可體驗，請匯出紀錄備份。');}
}());



