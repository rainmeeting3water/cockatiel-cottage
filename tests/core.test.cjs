'use strict';
const assert = require('node:assert/strict');
require('../core.js');
const C = globalThis.CottageCore;
let passed = 0;
function test(name, fn) { fn(); passed++; console.log('PASS ' + name); }
function ready() {
  let state = C.createState(1);
  for (const key of ['window', 'fan', 'pets', 'objects']) state = C.resolveHazard(state, key, 2);
  for (const key of ['water', 'food', 'clean']) state = C.performCare(state, key, 3);
  return state;
}
test('v2 roundtrip and validated deep clone', () => {
  const original = C.updateBird(C.createState(1), {name:'檸檬', color:'pearl', age:'young'}, 2);
  const loaded = C.parseSave(C.serialize(original));
  assert.deepEqual(loaded, original);
  assert.notEqual(loaded.bird, original.bird);
});
test('v1 migration preserves existing care, name, preferences, history', () => {
  const legacy = {version:1, bird:{name:'小黃',color:'lutino',age:'senior'}, settings:{muted:false}, care:{water:73,food:81,clean:92,company:14}, hazards:{window:true,fan:false,pets:true,objects:false}, safeMode:false, misses:2, log:[{at:42,type:'care',text:'既有日記'}]};
  const loaded = C.parseSave(JSON.stringify(legacy));
  assert.equal(loaded.version,2); assert.deepEqual(loaded.bird,legacy.bird); assert.deepEqual(loaded.care,legacy.care); assert.deepEqual(loaded.log,legacy.log); assert.equal(loaded.settings.muted,false); assert.equal(loaded.settings.reducedMotion,false); assert.equal(loaded.stage,2); assert.equal(loaded.vetPracticed,false); assert.equal(loaded.session.status,'active');
});
test('v1 safe mode migration retains valid safety checklist', () => {
  const s = C.activateSafeMode(ready(),4); const legacy = JSON.parse(C.serialize(s));
  legacy.version=1; delete legacy.stage; delete legacy.vetPracticed; delete legacy.session; delete legacy.settings.reducedMotion;
  assert.equal(C.parseSave(JSON.stringify(legacy)).safeMode,true);
});
test('future version, malformed JSON and invalid values rejected', () => {
  const s=C.createState(1);
  assert.throws(()=>C.parseSave('{broken'), /JSON/);
  assert.throws(()=>C.parseSave(JSON.stringify({...s,version:99})), /較新/);
  assert.throws(()=>C.parseSave(JSON.stringify({...s,care:{...s.care,water:101}})), /範圍/);
  assert.throws(()=>C.parseSave(JSON.stringify({...s,bird:{...s.bird,name:''}})), /格式/);
  assert.throws(()=>C.parseSave(JSON.stringify({...s,settings:{muted:0,reducedMotion:false}})), /是／否/);
  assert.throws(()=>C.parseSave('[]'), /版本/);
});
test('unknown fields and prototype payloads rejected', () => {
  const s=C.createState(1);
  assert.throws(()=>C.parseSave(JSON.stringify({...s,telemetry:'unexpected'})), /欄位/);
  const raw=C.serialize(s).replace('"version": 2','"__proto__": {"polluted":true}, "version": 2');
  assert.throws(()=>C.parseSave(raw), /欄位/); assert.equal({}.polluted,undefined);
  assert.throws(()=>C.updateBird(s,JSON.parse('{"__proto__":{}}')), /欄位/);
});
test('four confirmed departures progress once per explicit confirmation', () => {
  let s=C.createState(1);
  for(let n=1;n<=4;n++){ const before=s; s=C.confirmDeparture(s,'forgot',n+1); assert.equal(s.misses,n); assert.equal(s.stage,n); assert.equal(before.misses,n-1); }
  s=C.confirmDeparture(s,'forgot',9); assert.equal(s.stage,4); assert.equal(s.misses,5);
});
test('technical interruption never penalizes, even after long elapsed time', () => {
  let s=C.createState(1); s=C.confirmDeparture(s,'technical',2000000000000);
  assert.equal(s.misses,0); assert.equal(s.stage,0); assert.deepEqual(s.care,C.createState(1).care);
});
test('safe departure cannot bypass checklist', () => {
  const s=C.createState(1); assert.equal(C.safetyIssues(s).length,7);
  assert.throws(()=>C.activateSafeMode(s,2), /完成/);
  assert.throws(()=>C.confirmDeparture(s,'safe',2), /完成/);
  const good=ready(); assert.deepEqual(C.safetyIssues(good),[]);
  const safe=C.confirmDeparture(good,'safe',4); assert.equal(safe.safeMode,true); assert.equal(safe.session.status,'safe'); assert.equal(safe.misses,0);
});
test('activating safety is idempotent and startSession clears it', () => {
  const safe=C.activateSafeMode(ready(),4); assert.deepEqual(C.activateSafeMode(safe,5),safe);
  const active=C.startSession(safe,6); assert.equal(active.safeMode,false); assert.equal(active.session.status,'active'); assert.equal(active.session.startedAt,6); assert.equal(safe.safeMode,true);
  assert.deepEqual(active.care,safe.care); assert.equal(C.safetyIssues(active).length,4); assert.ok(Object.values(active.hazards).every(Boolean));
});
test('ordinary care and vet practice cannot cure stage 3 or revive stage 4', () => {
  let s=C.createState(1); for(let n=0;n<3;n++) s=C.confirmDeparture(s,'forgot',n+2);
  for(const action of ['water','food','clean','play','rest']) s=C.performCare(s,action,7);
  assert.equal(s.stage,3); s=C.practiceVet(s,8); assert.equal(s.stage,3); assert.equal(s.vetPracticed,true);
  s=C.confirmDeparture(s,'forgot',9); const values={...s.care};
  s=C.performCare(s,'food',10); s=C.practiceVet(s,11); assert.equal(s.stage,4); assert.deepEqual(s.care,values);
  assert.throws(()=>C.activateSafeMode(s,12), /狀況不明/);
});
test('all mutations preserve prior state and log size bounded', () => {
  const original=C.createState(1); const copy=C.serialize(original);
  C.performCare(original,'water',2); C.resolveHazard(original,'window',2); C.updateSettings(original,{muted:false}); C.updateBird(original,{name:'新名'},2); C.practiceVet(original,2);
  assert.equal(C.serialize(original),copy);
  let s=original; for(let i=0;i<100;i++) s=C.performCare(s,'rest',i+2);
  assert.equal(s.log.length,C.MAX_LOG); assert.equal(s.care.company,100); assert.equal(C.parseSave(C.serialize(s)).log.length,C.MAX_LOG);
});
test('schema consistency and untrusted log errors rejected', () => {
  const s=C.createState(1);
  assert.throws(()=>C.parseSave(JSON.stringify({...s,stage:3})), /不一致/);
  assert.throws(()=>C.parseSave(JSON.stringify({...s,safeMode:true})), /不一致/);
  assert.throws(()=>C.parseSave(JSON.stringify({...s,log:[{at:1,type:'script',text:'x'}]})), /類型/);
  assert.throws(()=>C.parseSave(JSON.stringify({...s,log:Array(41).fill({at:1,type:'care',text:'x'})})), /日記/);
  assert.throws(()=>C.parseSave(' '.repeat(262145)), /256/);
});
console.log(`${passed} core tests passed.`);

