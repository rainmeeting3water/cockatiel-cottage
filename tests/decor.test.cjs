'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const code=fs.readFileSync(require('node:path').resolve(__dirname,'../decor.js'),'utf8');
function load(raw=null,writeFail=false){const values=new Map(raw===null?[]:[['cockatiel-cottage-decor-v1',raw]]);const localStorage={getItem:k=>values.get(k)??null,setItem:(k,v)=>{if(writeFail)throw new Error('quota');values.set(k,v);}};const box=vm.createContext({localStorage,console});vm.runInContext(code,box);const original=box.CottageDecor,parse=vm.runInContext('JSON.parse',box);const D={...original,validateImport:value=>original.validateImport(parse(JSON.stringify(value))),applyImport:value=>original.applyImport(parse(JSON.stringify(value)))};return {D,values};}
const clean=o=>JSON.parse(JSON.stringify(o));
const state={version:1,theme:'sage',nextId:3,items:[{id:'d1',kind:'perch',x:50,y:70},{id:'d2',kind:'ring',x:80,y:30}]};
let count=0;function test(name,fn){fn();console.log('PASS '+name);count++;}
const {D}=load();
test('eight original items and empty initial room',()=>{assert.equal(D.kinds.length,8);assert.equal(D.stateExport().items.length,0);assert.ok(!D.layer().includes('http'));});
test('validated state preserves fields and is a fresh copy',()=>{const out=D.validateImport(state);assert.deepEqual(clean(out),state);assert.notEqual(out.items,state.items);});
test('unknown fields rejected',()=>assert.throws(()=>D.validateImport({...state,html:'<script>'})));
test('future version rejected',()=>assert.throws(()=>D.validateImport({...state,version:2})));
test('unknown theme and kind rejected',()=>{assert.throws(()=>D.validateImport({...state,theme:'constructor'}));assert.throws(()=>D.validateImport({...state,items:[{id:'d1',kind:'__proto__',x:50,y:50}]}));});
test('duplicate and invalid item IDs rejected',()=>{assert.throws(()=>D.validateImport({...state,items:[state.items[0],state.items[0]]}));assert.throws(()=>D.validateImport({...state,items:[{...state.items[0],id:'d99'}]}));});
test('positions must be finite and inside the room',()=>{for(const x of [NaN,Infinity,-1,100,'50'])assert.throws(()=>D.validateImport({...state,items:[{...state.items[0],x}]}));});
test('eight items accepted but nine rejected',()=>{const items=Array.from({length:8},(_,i)=>({id:'d'+(i+1),kind:'rug',x:50,y:50}));assert.equal(D.validateImport({...state,nextId:9,items}).items.length,8);assert.throws(()=>D.validateImport({...state,nextId:10,items:[...items,{id:'d9',kind:'rug',x:50,y:50}]}));});
test('JSON prototype payload cannot enter state',()=>{const bad=JSON.parse(JSON.stringify(state).replace('"version":1','"version":1,"__proto__":{"polluted":true}'));assert.throws(()=>D.validateImport(bad));assert.equal({}.polluted,undefined);});
test('import stores a validated copy and reset clears only decorations',()=>{const {D,values}=load();const r=D.applyImport(state);assert.equal(r.saved,true);assert.deepEqual(clean(D.stateExport()),state);assert.equal(JSON.parse(values.get('cockatiel-cottage-decor-v1')).theme,'sage');D.reset();assert.equal(D.stateExport().items.length,0);assert.equal(D.stateExport().theme,'cream');});
test('valid stored room reloads',()=>{const {D}=load(JSON.stringify(state));assert.deepEqual(clean(D.stateExport()),state);});
test('bad saved data stays protected and can be downloaded',()=>{const raw='{bad json', {D,values}=load(raw);assert.equal(D.storageStatus().blocked,true);assert.equal(values.get('cockatiel-cottage-decor-v1'),raw);assert.ok(D.panel().includes('data-decor-original'));});
test('quota failure is reported as unsaved and old storage remains',()=>{const {D,values}=load(JSON.stringify(state),true);const r=D.applyImport({...state,theme:'peach'});assert.equal(r.saved,false);assert.equal(D.storageStatus().canStore,false);assert.equal(JSON.parse(values.get('cockatiel-cottage-decor-v1')).theme,'sage');assert.equal(D.stateExport().theme,'peach');});
test('generated markup exposes keyboard controls and original art only',()=>{D.applyImport(state);const p=D.panel();assert.ok(p.includes('data-decor-picker'));assert.ok(p.includes('data-decor-dialog'));assert.ok(D.layer().includes('aria-pressed'));assert.ok(!D.layer().includes('<image'));});
console.log(count+' decor tests passed.');

