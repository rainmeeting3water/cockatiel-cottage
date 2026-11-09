'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const base = path.resolve(__dirname, '..');
let passed = 0;
function test(name, fn) { fn(); passed++; console.log('PASS ' + name); }
class Element {
  constructor(tag, attributes = {}, children = []) {
    this.nodeType = 1; this.tagName = tag.toUpperCase(); this.attributes = new Map(Object.entries(attributes));
    this.childNodes = []; this.parentElement = null; this.isConnected = true; this.value = '';
    for (const child of children) this.append(child);
  }
  append(child) { child.parentElement = this; this.childNodes.push(child); return child; }
  getAttribute(name) { return this.attributes.has(name) ? this.attributes.get(name) : null; }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  hasAttribute(name) { return this.attributes.has(name); }
}
function text(value) { return {nodeType: 3, nodeValue: value, childNodes: [], parentElement: null, isConnected: true}; }
function fixture(initial = {}, withDocument = true) {
  const store = new Map(Object.entries(initial)), writes = [], events = [], handlers = {}, microtasks = [], observers = [];
  const body = new Element('body'), title = new Element('title', {}, [text('玄鳳小日子｜一起練習，好好陪伴')]);
  const meta = new Element('meta', {content:'陪一隻玄鳳慢慢長大。認識玄鳳、查詢食物，在溫暖的小屋練習負責任的照顧。'});
  const document = {body, documentElement: new Element('html'), querySelector: selector => selector === 'title' ? title : selector === 'meta[name="description"]' ? meta : null};
  const scope = {console, Map, Set, WeakMap, RegExp, URL, Promise, queueMicrotask: callback => microtasks.push(callback),
    localStorage: {getItem:key=>store.get(key)??null,setItem:(key,value)=>{store.set(key,String(value));writes.push(key);}},
    addEventListener:(name,fn)=>{(handlers[name] ||= []).push(fn);},
    dispatchEvent:event=>{events.push(event);for(const fn of handlers[event.type]||[])fn(event);return true;},
    CustomEvent: class {constructor(type, options){this.type=type;this.detail=options.detail;}},
    MutationObserver: class {constructor(callback){this.callback=callback;observers.push(this);}observe(node,options){this.node=node;this.options=options;}disconnect(){this.disconnected=true;}},
    ...(withDocument ? {document} : {})
  };
  vm.createContext(scope);
  vm.runInContext(fs.readFileSync(path.join(base,'i18n.js'),'utf8'),scope);
  vm.runInContext(fs.readFileSync(path.join(base,'i18n-app-en.js'),'utf8'),scope);
  const flush=()=>{let runs=0;while(microtasks.length){if(runs++>100)throw Error('Translation did not settle');microtasks.shift()();}};
  return {scope,L:scope.CottageI18n,body,title,meta,store,writes,events,handlers,observers,flush};
}

test('Traditional Chinese is the first default and reading language does not write a game save',()=>{
  const f=fixture({'cockatiel-cottage-save':'synthetic original save'});
  f.L.start(); assert.equal(f.L.getLanguage(),'zh-Hant-TW');assert.equal(f.scope.document.documentElement.lang,'zh-Hant-TW');
  assert.equal(f.store.get('cockatiel-cottage-save'),'synthetic original save');assert.deepEqual(f.writes,[]);
});
test('language preference restores independently and emits the agreed event',()=>{
  const f=fixture({'cockatiel-cottage-language-v1':'en','cockatiel-cottage-save':'keep me'});
  f.L.start();assert.equal(f.L.t('我的玄鳳小屋'),'My cockatiel cottage');assert.equal(f.scope.document.documentElement.lang,'en');
  f.L.setLanguage('zh-Hant-TW');assert.equal(f.events.at(-1).type,'CottageLanguageChanged');assert.equal(f.events.at(-1).detail.language,'zh-Hant-TW');
  assert.deepEqual(f.writes,['cockatiel-cottage-language-v1']);assert.equal(f.store.get('cockatiel-cottage-save'),'keep me');
  assert.throws(()=>f.L.setLanguage('fr'),/Unsupported/);assert.equal(f.L.getLanguage(),'zh-Hant-TW');
});
test('text and accessible attributes translate while input values and user text remain untouched',()=>{
  const f=fixture();const label=text('  換新鮮水  ');const input=new Element('input',{'aria-label':'搜尋食物',placeholder:'搜尋食物，例如：蘋果、酪梨、木糖醇',title:'認識你的鳥寶'});input.value='我的玄鳳小屋';
  const ignored=new Element('span',{'data-i18n-ignore':''},[text('我的玄鳳小屋')]);const code=new Element('code',{},[text('我的玄鳳小屋')]);
  const prompt=new Element('textarea',{'aria-label':'搜尋食物'},[text('準備食物')]);prompt.value='生成提示詞：我的玄鳳小屋';
  const editable=new Element('div',{},[text('準備食物')]);editable.isContentEditable=true;
  f.body.append(new Element('button',{},[label]));for(const el of [input,ignored,code,prompt,editable])f.body.append(el);
  f.L.setLanguage('en');assert.equal(label.nodeValue,'  Fresh water  ');assert.equal(input.getAttribute('aria-label'),'Search foods');assert.match(input.getAttribute('placeholder'),/apple/);
  assert.equal(input.value,'我的玄鳳小屋');assert.equal(ignored.childNodes[0].nodeValue,'我的玄鳳小屋');assert.equal(code.childNodes[0].nodeValue,'我的玄鳳小屋');
  assert.equal(prompt.value,'生成提示詞：我的玄鳳小屋');assert.equal(prompt.childNodes[0].nodeValue,'準備食物');assert.equal(prompt.getAttribute('aria-label'),'Search foods');assert.equal(editable.childNodes[0].nodeValue,'準備食物');
  f.L.setLanguage('zh-Hant-TW');assert.equal(label.nodeValue,'  換新鮮水  ');assert.equal(input.getAttribute('aria-label'),'搜尋食物');assert.equal(input.value,'我的玄鳳小屋');
});
test('external text changes become the new source and can switch back without stale content',()=>{
  const f=fixture();const node=text('換新鮮水');f.body.append(node);f.L.setLanguage('en');node.nodeValue='準備食物';f.L.apply(node);
  assert.equal(node.nodeValue,'Prepare food');f.L.setLanguage('zh-Hant-TW');assert.equal(node.nodeValue,'準備食物');
});
test('async toasts and new component dictionaries are translated locally by the observer',()=>{
  const f=fixture();f.L.setLanguage('en');f.L.start();const toast=new Element('div',{},[text('新鮮的水準備好了！也記得洗淨水碗。')]);f.body.append(toast);
  f.observers[0].callback([{type:'childList',addedNodes:[toast]}]);f.flush();assert.match(toast.childNodes[0].nodeValue,/Fresh water/);
  const component=text('合成元件按鈕');f.body.append(component);f.L.register({'合成元件按鈕':'Synthetic component button'});f.flush();assert.equal(component.nodeValue,'Synthetic component button');
  f.L.setLanguage('zh-Hant-TW');assert.equal(toast.childNodes[0].nodeValue,'新鮮的水準備好了！也記得洗淨水碗。');
});
test('template rules preserve nicknames and translate only bounded known UI forms',()=>{
  const {L}=fixture();L.setLanguage('en');assert.equal(L.t('檸檬的小天地'),'檸檬’s little place');
  assert.equal(L.t('7 項查詢結果 · 查核 2026-11-08'),'7 results · Checked 2026-11-08');
  assert.match(L.t('只有按下「確認未檢查離開」，才會把確認次數從 2 增加為 3，並呈現第 3 階段教學故事。'),/from 2 to 3/);
  L.register({patterns:[{pattern:/更換/u,replace:'Replace'}]});assert.equal(L.t('請更換這個不明內容'),'請更換這個不明內容');
});
test('old Chinese journal entries display in English without rewriting the saved game',()=>{
  const f=fixture();vm.runInContext(fs.readFileSync(path.join(base,'core.js'),'utf8'),f.scope);
  const C=f.scope.CottageCore;let game=C.createState(1);for(let n=0;n<3;n++)game=C.confirmDeparture(game,'forgot',n+2);
  for(const action of ['water','food','clean','play','rest'])game=C.performCare(game,action,8);game=C.practiceVet(game,9);game=C.updateBird(game,vm.runInContext('({name:"合成鳥寶"})',f.scope),10);
  const original=C.serialize(game);f.store.set('cockatiel-cottage-save',original);f.L.setLanguage('en');
  for(const log of game.log)assert.equal(/[\u3400-\u9fff]/u.test(f.L.t(log.text)),false,'Untranslated generated log: '+log.type);
  assert.equal(C.serialize(game),original);assert.equal(f.store.get('cockatiel-cottage-save'),original);assert.equal(C.parseSave(original).bird.name,'合成鳥寶');
});
test('validation and backup failures remain clear in English',()=>{
  const {L}=fixture();L.setLanguage('en');assert.equal(L.t('鳥寶名字格式不正確。'),'Bird nickname has an invalid format.');assert.equal(L.t('日記類型選項無法辨識。'),'Journal type has an unknown option.');
  assert.match(L.t('未匯入：這個檔案讀不到，原本的紀錄先保留。 目前紀錄未變更。'),/^Not imported: This file/);
  assert.match(L.t('這次沒有完整存好，有些資料也沒能還原。請先備份，再重新載入檢查。'),/could not be restored/);
});
test('metadata and content language switch and restore',()=>{
  const f=fixture();f.scope.CockatielContent={marker:'zh',emergency:{detail:'原始安全條件'}};f.scope.CockatielEnglishContent={marker:'en',emergency:{detail:'Translated safety conditions'}};
  const original=JSON.stringify(f.scope.CockatielContent);f.L.setLanguage('en');assert.equal(f.L.content().marker,'en');assert.match(f.title.childNodes[0].nodeValue,/Little Cockatiel Days/);assert.match(f.meta.getAttribute('content'),/^Meet cockatiels/);
  f.L.setLanguage('zh-Hant-TW');assert.equal(f.L.content().marker,'zh');assert.equal(f.title.childNodes[0].nodeValue,'玄鳳小日子｜一起練習，好好陪伴');assert.equal(JSON.stringify(f.scope.CockatielContent),original);
});
test('unavailable local storage still allows switching in the current session',()=>{
  const f=fixture();f.scope.localStorage.setItem=()=>{throw Error('synthetic blocked storage');};assert.doesNotThrow(()=>f.L.setLanguage('en'));assert.equal(f.L.t('資料不足'),'Not enough information');
});
test('language storage events affect language only',()=>{
  const f=fixture();for(const handler of f.handlers.storage)handler({key:'cockatiel-cottage-save',newValue:'not a language'});assert.equal(f.L.getLanguage(),'zh-Hant-TW');
  for(const handler of f.handlers.storage)handler({key:f.L.KEY,newValue:'en'});assert.equal(f.L.getLanguage(),'en');assert.deepEqual(f.writes,[]);
});
test('missing-copy inspection is read only and can be cleared',()=>{
  const f=fixture();f.L.setLanguage('en');const writes=f.writes.length;assert.equal(f.L.t('尚未登錄的合成介面'),'尚未登錄的合成介面');assert.ok(f.L.listMissing().includes('尚未登錄的合成介面'));
  const copy=f.L.listMissing();copy.push('not internal');assert.ok(!f.L.listMissing().includes('not internal'));assert.equal(f.writes.length,writes);f.L.clearMissing();assert.equal(f.L.listMissing().length,0);
});
test('canvas fonts follow CSS when present and have deterministic no-DOM fallbacks',()=>{
  const f=fixture({},false);f.L.setLanguage('en');assert.equal(f.L.fontFamily(),'Segoe UI, Arial, sans-serif');f.L.setLanguage('zh-Hant-TW');assert.match(f.L.fontFamily(),/Noto Sans TC/);
  const d=fixture();d.scope.getComputedStyle=()=>({getPropertyValue:()=>"'Cottage Latin', sans-serif",fontFamily:'ignored'});assert.equal(d.L.fontFamily(),"'Cottage Latin', sans-serif");
});
test('attribute updates restore their new original and never touch URL or data attributes',()=>{
  const f=fixture();const el=new Element('img',{alt:'搜尋食物',src:'assets/bird-lutino.webp','data-name':'我的玄鳳小屋'});f.body.append(el);f.L.setLanguage('en');assert.equal(el.getAttribute('alt'),'Search foods');
  el.setAttribute('alt','準備食物');f.L.apply(el);assert.equal(el.getAttribute('alt'),'Prepare food');f.L.setLanguage('zh-Hant-TW');assert.equal(el.getAttribute('alt'),'準備食物');assert.equal(el.getAttribute('src'),'assets/bird-lutino.webp');assert.equal(el.getAttribute('data-name'),'我的玄鳳小屋');
});
console.log(`${passed} i18n tests passed.`);
