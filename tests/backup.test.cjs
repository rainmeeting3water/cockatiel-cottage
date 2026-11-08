const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const folder=path.resolve(__dirname,'..');let passed=0;
function setup(){
  const data=new Map();let rule=()=>false;
  const storage={getItem:k=>data.get(k)??null,setItem(k,v){if(rule(k,String(v)))throw new Error('synthetic storage failure');data.set(k,String(v));},removeItem(k){if(rule(k,null))throw new Error('synthetic removal failure');data.delete(k);}};
  const context=vm.createContext({localStorage:storage,addEventListener(){}});
  for(const file of ['core.js','decor.js','backup.js'])vm.runInContext(fs.readFileSync(path.join(folder,file),'utf8'),context);
  vm.runInContext(`var oldGame=CottageCore.updateBird(CottageCore.createState(1),{name:'原有小米'});var newGame=CottageCore.updateBird(CottageCore.createState(2),{name:'新故事'});var oldDecor=CottageDecor.stateExport();CottageDecor.applyImport(oldDecor);var newDecor={version:1,theme:'sage',nextId:2,items:[{id:'d1',kind:'star',x:30,y:40}]};localStorage.setItem('cockatiel-cottage-save',CottageCore.serialize(oldGame));localStorage.setItem('cockatiel-cottage-open','closed');`,context);
  return {data,run:code=>vm.runInContext(code,context),fail:fn=>{rule=fn;}};
}
function test(name,fn){fn();passed++;console.log('PASS '+name);}
test('bundle roundtrip validates game and decor',()=>{const e=setup();assert.equal(e.run(`CottageBackup.parse(CottageBackup.pack(newGame,newDecor)).decor.theme`),'sage');});
test('old v2 backup leaves room decor unchanged',()=>{const e=setup();assert.equal(e.run(`CottageBackup.parse(CottageCore.serialize(oldGame)).decor`),null);e.run(`CottageBackup.apply(CottageBackup.parse(CottageCore.serialize(newGame)))`);assert.equal(e.run(`CottageDecor.stateExport().theme`),'cream');});
test('future and malformed bundles rejected before writes',()=>{const e=setup(),before=JSON.stringify([...e.data]);assert.throws(()=>e.run(`CottageBackup.parse('invalid')`));assert.throws(()=>e.run(`CottageBackup.parse(JSON.stringify({format:'cockatiel-cottage-bundle',version:99,game:newGame,decor:newDecor}))`));assert.equal(JSON.stringify([...e.data]),before);});
test('successful import stores both state groups',()=>{const e=setup();assert.equal(e.run(`CottageBackup.apply({game:newGame,decor:newDecor}).game.bird.name`),'新故事');assert.equal(e.run(`CottageDecor.stateExport().theme`),'sage');assert.match(e.data.get('cockatiel-cottage-save'),/新故事/);});
test('game write failure preserves all previous records',()=>{const e=setup(),before=JSON.stringify([...e.data]);let once=true;e.fail(k=>k==='cockatiel-cottage-save'&&once?(once=false,true):false);assert.throws(()=>e.run(`CottageBackup.apply({game:newGame,decor:newDecor})`),/已還原/);assert.equal(JSON.stringify([...e.data]),before);assert.equal(e.run(`CottageDecor.stateExport().theme`),'cream');});
test('decor write failure rolls back game and runtime',()=>{const e=setup(),before=JSON.stringify([...e.data]);let once=true;e.fail(k=>k==='cockatiel-cottage-decor-v1'&&once?(once=false,true):false);assert.throws(()=>e.run(`CottageBackup.apply({game:newGame,decor:newDecor})`),/已還原/);assert.equal(JSON.stringify([...e.data]),before);assert.equal(e.run(`CottageDecor.stateExport().theme`),'cream');});
test('failed rollback is explicitly flagged',()=>{const e=setup();e.fail((k,v)=>(k==='cockatiel-cottage-decor-v1')||(k==='cockatiel-cottage-save'&&v?.includes('原有小米')));try{e.run(`CottageBackup.apply({game:newGame,decor:newDecor})`);assert.fail('must reject');}catch(error){assert.equal(error.rollbackFailed,true);assert.match(error.message,/沒能還原/);}});
console.log(passed+' backup tests passed.');
