'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const base=path.join(__dirname,'..');let passed=0;
async function test(name,fn){await fn();passed++;console.log('PASS '+name);}
function environment(){
  const events=new Map(),storage=new Map();
  const box={Blob,atob,URL,Uint8Array,DataView,console,setTimeout,clearTimeout,cancelAnimationFrame(){},requestAnimationFrame(){return 1;},
    CustomEvent:class{constructor(type,options){this.type=type;this.detail=options?.detail;}},
    localStorage:{getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,String(value))},
    addEventListener(type,fn){if(!events.has(type))events.set(type,new Set());events.get(type).add(fn);},
    removeEventListener(type,fn){events.get(type)?.delete(fn);},dispatchEvent(event){for(const fn of [...(events.get(event.type)||[])])fn(event);return true;}};
  vm.createContext(box);
  for(const file of ['i18n.js','i18n-components-en.js'])vm.runInContext(fs.readFileSync(path.join(base,file),'utf8'),box,{filename:file});
  function load(file,hooks=''){
    let source=fs.readFileSync(path.join(base,file),'utf8');
    if(hooks){const target=file==='creator.js'?'root.CottageCreator=Object.freeze':file==='gallery.js'?'root.CottageGallery=Object.freeze':'root.CottageDecor=Object.freeze';assert.ok(source.includes(target));source=source.replace(target,hooks+'; '+target);}
    vm.runInContext(source,box,{filename:file});
  }
  return {box,load,events,storage,L:box.CottageI18n};
}
function textNode(value,parent=null){return {nodeType:3,nodeValue:value,parentElement:parent};}
function element(tag,attrs={},children=[]){
  const node={nodeType:1,tagName:tag.toUpperCase(),parentElement:null,isContentEditable:false,childNodes:children,
    hasAttribute:name=>Object.hasOwn(attrs,name),getAttribute:name=>Object.hasOwn(attrs,name)?attrs[name]:null,setAttribute(name,value){attrs[name]=String(value);}};
  children.forEach(child=>child.parentElement=node);return node;
}
function decode(value){return value.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'");}
function visibleChineseStrings(html){
  const found=[],stack=[],voids=new Set(['input','img','br','hr','meta','link','path','ellipse','circle','rect','line','polyline','polygon','stop']);
  for(const token of html.match(/<[^>]+>|[^<]+/g)||[]){
    if(token.startsWith('</')){const tag=/^<\/([\w-]+)/.exec(token)?.[1].toLowerCase();while(stack.length){if(stack.pop().tag===tag)break;}continue;}
    if(token.startsWith('<')){
      const tag=/^<([\w-]+)/.exec(token)?.[1].toLowerCase();if(!tag)continue;
      const excluded=stack.some(s=>s.ignore)||/\bdata-i18n-ignore\b/.test(token),skip=excluded||['textarea','input','pre','code','script','style'].includes(tag);
      if(!excluded)for(const attr of token.matchAll(/(?:aria-label|title|placeholder|alt)="([^"]*)"/g)){const value=decode(attr[1]);if(/[\u3400-\u9fff]/u.test(value))found.push(value);}
      if(!voids.has(tag)&&!token.endsWith('/>'))stack.push({tag,ignore:skip});
    }else if(!stack.some(s=>s.ignore)){const value=decode(token).trim().replace(/\s+/g,' ');if(/[\u3400-\u9fff]/u.test(value))found.push(value);}
  }
  return found;
}
function creatorPage(name,features){
  const listeners=new Map(),parts=new Map(),form={elements:{birdName:{name:'birdName',value:name,placeholder:''},birdColor:{name:'birdColor',value:'lutino'},features:{name:'features',value:features,placeholder:''}},addEventListener(){}};
  const page={matches:selector=>selector==='.creator-page',querySelector(selector){if(selector==='.creator-details')return form;if(!parts.has(selector))parts.set(selector,{value:'',textContent:'',innerHTML:'',hidden:false,disabled:false,href:'',removeAttribute(){},setAttribute(){}});return parts.get(selector);},querySelectorAll(){return[];},addEventListener(type,fn){listeners.set(type,fn);},removeEventListener(type,fn){if(listeners.get(type)===fn)listeners.delete(type);}};
  for(const field of Object.values(form.elements)){field.closest=selector=>selector==='.creator-details'?form:null;field.matches=()=>false;}
  return {page,form,parts,input(field){listeners.get('input')?.({target:form.elements[field]});}};
}

(async()=>{
  await test('component dictionary covers initial creator, album, decoration catalogue and editor UI',()=>{
    const {box,load,L}=environment();load('creator.js','root.__creatorPaint={paintAtlas,seed:node=>{mounted=node;atlas={dataUrl:"data:image/png;base64,AA=="}}}');load('gallery.js','root.__galleryPaint={draftEditor,seed:node=>mounted=node}');load('decor.js','root.__decorTest={select:id=>selected=id}');L.setLanguage('en');
    const room={version:1,theme:'cream',nextId:9,items:Array.from(box.CottageDecor.kinds).map((kind,i)=>({id:'d'+(i+1),kind,x:30,y:40}))};vm.runInContext('CottageDecor.applyImport('+JSON.stringify(room)+')',box);box.__decorTest.select('d1');
    for(const html of [box.CottageCreator.render(),box.CottageGallery.render(),box.CottageDecor.panel(),box.CottageDecor.layer()])for(const zh of visibleChineseStrings(html))assert.ok(!/[\u3400-\u9fff]/u.test(L.t(zh)),'Missing component English: '+zh);
    const creatorParts=new Map(),creatorStub={querySelector(selector){if(!creatorParts.has(selector))creatorParts.set(selector,{innerHTML:'',hidden:false,querySelector(){return null;}});return creatorParts.get(selector);}};
    box.__creatorPaint.seed(creatorStub);box.__creatorPaint.paintAtlas();
    for(const zh of visibleChineseStrings(creatorParts.get('.creator-atlas-area').innerHTML))assert.ok(!/[\u3400-\u9fff]/u.test(L.t(zh)),'Missing atlas English: '+zh);
    const dialog={innerHTML:'',open:false,showModal(){this.open=true;},querySelector(){return{focus(){}};}};box.document={activeElement:{}};
    box.__galleryPaint.seed({querySelector(){return dialog;}});box.__galleryPaint.draftEditor({id:'synthetic-photo',name:'一起布置小屋',frame:'garden',dataUrl:'data:image/jpeg;base64,AA=='},true);
    for(const zh of visibleChineseStrings(dialog.innerHTML))assert.ok(!/[\u3400-\u9fff]/u.test(L.t(zh)),'Missing photo editor English: '+zh);
  });
  await test('component error strings and bounded dynamic templates have English translations',()=>{
    const {L}=environment();L.setLanguage('en');
    const strings=['相簿已經有 12 張照片。先備份，再挑一張移除吧。','這台裝置的空間不夠，照片還沒存好。先備份相簿，再整理空間；這個視窗裡的照片先別關掉。','動作圖處理後仍然太大。請在圖片工具降低檔案大小，再重新匯入。','第 1、3 格看不到足夠的角色。請補好 16 格再匯入。','這份備份有 3 張照片。確認後，會取代這台裝置目前的 2 張照片。','小物格式不對，原本的布置先保留。','布置檔格式不對，原本的布置先保留。','加入木頭棲架了。可以拖曳，或用方向按鈕移動。','換成森林小屋了。','正在移動：星星掛飾','選取雲朵抱枕','3. 彩色木珠','＋ 鳥寶畫框','4 / 12 張','第 16 格：拍翅飛行 4','9. 低頭喝水'];
    strings.forEach(zh=>assert.ok(!/[\u3400-\u9fff]/u.test(L.t(zh)),zh));
    assert.equal(L.t('4 / 12 張'),'4 / 12 photos');assert.equal(L.t('第 16 格：拍翅飛行 4'),'Frame 16: Wingbeat 4');
  });
  await test('all standalone component UI/error literals are covered; construction fragments and fixed filenames are excluded',()=>{
    const {L}=environment();L.setLanguage('en');
    const fragments=new Set(['第 ',' 格看不到足夠的角色。請補好 16 格再匯入。','鳥寶','格式不對，原本的布置先保留。','布置檔','小物','加入','了。可以拖曳，或用方向按鈕移動。','換成','了。']);
    for(const file of ['creator.js','gallery.js','decor.js'])for(const match of fs.readFileSync(path.join(base,file),'utf8').matchAll(/'((?:\\.|[^'\\])*)'/g)){
      const value=match[1];if(!/[\u3400-\u9fff]/u.test(value)||value.includes('<')||value.includes('\n')||/\.(?:json|png|jpg|txt)$/.test(value)||fragments.has(value))continue;
      assert.notEqual(L.t(value),value,'Untranslated literal in '+file+': '+value);
    }
  });
  await test('ignored bird nickname stays original while surrounding UI switches both ways',()=>{
    const {L}=environment(),name=textNode('一起布置小屋'),label=textNode('改名字／相框');const caption=element('div',{'data-i18n-ignore':''},[name]),button=element('button',{},[label]),tree=element('section',{},[caption,button]);
    L.setLanguage('en');L.apply(tree);assert.equal(name.nodeValue,'一起布置小屋');assert.equal(label.nodeValue,'Edit name / frame');
    L.setLanguage('zh-Hant-TW');L.apply(tree);assert.equal(name.nodeValue,'一起布置小屋');assert.equal(label.nodeValue,'改名字／相框');
  });
  await test('creator English defaults and generated prompt keep the full 16-frame specification',()=>{
    const {box,L,load}=environment();load('creator.js');L.setLanguage('en');const html=box.CottageCreator.render(),prompt=box.CottageCreator.makePrompt();
    assert.ok(html.includes('value="My bird"'));assert.ok(html.includes('Orange cheeks, creamy white wings, and a long slender tail'));assert.ok(!/[\u3400-\u9fff]/u.test(prompt));
    for(const part of ['1280 × 1280','4 columns × 4 rows','320 × 320','8 water','9 food','10 preen','11 sing','15 flight'])assert.ok(prompt.includes(part),part);
    const typed=box.CottageCreator.makePrompt({name:'我的原名',color:'pearl',features:'灰色翅膀與白斑'});assert.ok(typed.includes('Pearl: grey feathers with pale pearl markings'));assert.ok(typed.includes('灰色翅膀與白斑'));assert.ok(!typed.includes('我的原名'));
  });
  await test('creator language changes update untouched defaults without remounting',()=>{
    const {box,L,load,events}=environment();load('creator.js','root.__creatorLocale={state:()=>({generation,busy}),busy:value=>busy=value}');
    const mock=creatorPage('我的鳥寶','橘色臉頰，奶白色翅膀，細長的尾羽');box.CottageCreator.mount(mock.page);const before=box.__creatorLocale.state().generation;box.__creatorLocale.busy(true);
    L.setLanguage('en');assert.equal(mock.form.elements.birdName.value,'My bird');assert.equal(mock.form.elements.features.value,'Orange cheeks, creamy white wings, and a long slender tail');assert.ok(mock.form.elements.birdName.placeholder.includes('My Sunny'));assert.equal(box.__creatorLocale.state().generation,before);assert.equal(box.__creatorLocale.state().busy,true);
    L.setLanguage('zh-Hant-TW');assert.equal(mock.form.elements.birdName.value,'我的鳥寶');assert.equal(mock.form.elements.features.value,'橘色臉頰，奶白色翅膀，細長的尾羽');box.CottageCreator.unmount();assert.equal(events.get('CottageLanguageChanged')?.size||0,0);
  });
  await test('creator preserves edited names and even invalid in-progress feather notes across language changes',()=>{
    const {box,L,load}=environment();load('creator.js');const mock=creatorPage('我的鳥寶','橘色臉頰，奶白色翅膀，細長的尾羽');box.CottageCreator.mount(mock.page);
    mock.form.elements.birdName.value='一起布置小屋';mock.input('birdName');mock.form.elements.features.value='灰色翅膀\n這是我自己寫的文字';mock.input('features');
    L.setLanguage('en');assert.equal(mock.form.elements.birdName.value,'一起布置小屋');assert.equal(mock.form.elements.features.value,'灰色翅膀\n這是我自己寫的文字');assert.equal(mock.parts.get('[data-creator-action="copy"]').disabled,true);
    L.setLanguage('zh-Hant-TW');assert.equal(mock.form.elements.birdName.value,'一起布置小屋');assert.equal(mock.form.elements.features.value,'灰色翅膀\n這是我自己寫的文字');assert.ok(box.CottageCreator.render().includes('灰色翅膀\n這是我自己寫的文字'));box.CottageCreator.unmount();
  });
  await test('album nickname markup and accessible actions keep user data outside translation',()=>{
    const {box,L,load}=environment();load('gallery.js','root.__galleryLocale={paint,seed:(node,data)=>{mounted=node;rows=data}}');L.setLanguage('en');
    const count={},grid={},add={},page={querySelector(selector){return selector==='.gallery-count'?count:selector==='.gallery-grid'?grid:add;}};
    box.__galleryLocale.seed(page,[{id:'test-photo',name:'一起布置小屋',frame:'cream',dataUrl:'data:image/jpeg;base64,AA=='}]);box.__galleryLocale.paint();
    assert.match(grid.innerHTML,/data-i18n-ignore>一起布置小屋<\/div>/);assert.match(grid.innerHTML,/aria-label="下載這張相框圖" aria-describedby="gallery-name-test-photo"/);assert.ok(!grid.innerHTML.includes('aria-label="下載一起布置小屋'));
    assert.ok(!/[\u3400-\u9fff]/u.test(L.t(count.textContent)));
  });
  await test('framed-photo Canvas uses language font and fixed caption while preserving the raw nickname',async()=>{
    const {box,L,load}=environment();L.setLanguage('en');const calls=[],fonts=[];const context={fillRect(){},save(){},beginPath(){},moveTo(){},arcTo(){},closePath(){},clip(){},drawImage(){},restore(){},fillText(...args){calls.push(args);},set font(value){fonts.push(value);}};
    box.Image=class{constructor(){this.naturalWidth=100;this.naturalHeight=100;}set src(_){Promise.resolve().then(()=>this.onload());}};
    box.document={documentElement:{},querySelector(){return null;},createElement(tag){
      assert.equal(tag,'canvas');
      return{getContext(){return context;},toBlob(fn,type){fn(new Blob(['synthetic canvas'],{type}));}};
    }};
    box.getComputedStyle=()=>({getPropertyValue:()=> L.getLanguage()==='en'?'"Test Latin", Arial, sans-serif':'"Test TC", sans-serif'});
    load('gallery.js','root.__galleryLocale={framedBlob}');await box.__galleryLocale.framedBlob({name:'鳥寶的小日子',frame:'cream',dataUrl:'data:image/jpeg;base64,AA=='});
    assert.equal(calls[0][0],'鳥寶的小日子');assert.equal(calls[1][0],'Little bird moments');assert.ok(fonts.every(font=>font.includes('"Test Latin", Arial, sans-serif')));
    L.setLanguage('zh-Hant-TW');await box.__galleryLocale.framedBlob({name:'鳥寶的小日子',frame:'cream',dataUrl:'data:image/jpeg;base64,AA=='});assert.equal(calls[2][0],'鳥寶的小日子');assert.equal(calls[3][0],'鳥寶的小日子');assert.ok(fonts.slice(2).every(font=>font.includes('"Test TC", sans-serif')));
  });
  await test('language preferences do not rewrite album schemas, filenames, or saved decoration data',()=>{
    const {box,L,load,storage}=environment();load('gallery.js');load('decor.js');vm.runInContext('CottageDecor.applyImport({version:1,theme:"sage",nextId:2,items:[{id:"d1",kind:"star",x:40,y:30}]})',box);const key='cockatiel-cottage-decor-v1',raw=storage.get(key);L.setLanguage('en');L.setLanguage('zh-Hant-TW');assert.equal(storage.get(key),raw);
    assert.ok(fs.readFileSync(path.join(base,'gallery.js'),'utf8').includes("'玄鳳小日子-鳥寶相簿.json'"));assert.equal(box.CottageDecor.stateExport().items[0].kind,'star');
  });
  console.log(`${passed} component language tests passed.`);
  console.log('Canvas rendering here uses a synthetic context; real image output, browser fonts, layouts, and assistive technology still need browser checks.');
})().catch(error=>{console.error(error);process.exitCode=1;});
