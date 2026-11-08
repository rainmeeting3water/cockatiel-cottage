'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
let source=fs.readFileSync(path.join(__dirname,'..','creator.js'),'utf8');
const target='root.CottageCreator=Object.freeze';assert.ok(source.includes(target),'Creator export hook not found');
source=source.replace(target,'root.__creatorTests={cleanName,cleanFeatures,imageInfo,validateHeader,checkPixels,prepareImage,boundedAtlas,requestCustom,setCustom,getApplied:()=>applied,seedApplied:value=>applied=value}; '+target);
const sandbox={Blob,atob,Uint8Array,DataView,URL,console,setTimeout,clearTimeout,CustomEvent:class CustomEvent{constructor(type,options){this.type=type;this.detail=options.detail;}}};vm.createContext(sandbox);vm.runInContext(source,sandbox,{filename:'creator.js'});
const T=sandbox.__creatorTests,C=sandbox.CottageCreator;let passed=0;
async function test(name,fn){await fn();passed++;console.log('PASS '+name);}
function png(width,height,animated=false){
  const buffer=new ArrayBuffer(animated?65:33),bytes=new Uint8Array(buffer),view=new DataView(buffer);bytes.set([137,80,78,71,13,10,26,10]);view.setUint32(8,13);bytes.set([73,72,68,82],12);view.setUint32(16,width);view.setUint32(20,height);bytes[24]=8;bytes[25]=6;
  if(animated){view.setUint32(33,8);bytes.set([97,99,84,76],37);view.setUint32(41,2);}return buffer;
}
function webp(animated=false){const buffer=new ArrayBuffer(30),u=new Uint8Array(buffer);u.set(Buffer.from('RIFF'),0);u.set(Buffer.from('WEBP'),8);u.set(Buffer.from('VP8X'),12);u[20]=animated?2:0;const size=1279;u[24]=size&255;u[25]=size>>8;u[27]=size&255;u[28]=size>>8;return buffer;}
function pixels(skip=-1){const data=new Uint8ClampedArray(1280*1280*4);for(let cell=0;cell<16;cell++){if(cell===skip)continue;const x=(cell%4)*320+30,y=Math.floor(cell/4)*320+30;for(let p=0;p<96;p++)data[((y+p)*1280+x)*4+3]=255;}return data;}

(async()=>{
  await test('prompt fixes 1280x1280, 4x4 cells and all required action slots',()=>{
    const prompt=C.makePrompt({name:'PRIVATE_NICKNAME_DO_NOT_EXPORT',color:'lutino',features:'橘色臉頰，白色翅膀'});
    for(const text of ['1280 × 1280','4 columns × 4 rows','320 × 320','0 idle','4 walk','8 water','9 food','10 preen','11 sing','12 flight','15 flight','transparent RGBA PNG'])assert.ok(prompt.includes(text),text);
    assert.ok(!prompt.includes('PRIVATE_NICKNAME_DO_NOT_EXPORT'));assert.ok(prompt.includes('橘色臉頰，白色翅膀'));
  });
  await test('prompt never includes nickname, source filename, photo bytes, paths or unrelated fields',()=>{
    const prompt=C.makePrompt({name:'NICKNAME_MUST_STAY_LOCAL',color:'gray',features:'白色翼斑',dataUrl:'data:PRIVATE_PHOTO_BYTES',fileName:'PRIVATE_SOURCE_NAME.jpg',path:'C:/PRIVATE_SOURCE_PATH',token:'PRIVATE_TOKEN'});
    for(const privateText of ['NICKNAME_MUST_STAY_LOCAL','PRIVATE_PHOTO_BYTES','PRIVATE_SOURCE_NAME','PRIVATE_SOURCE_PATH','PRIVATE_TOKEN'])assert.ok(!prompt.includes(privateText));
  });
  await test('unknown colors and common sensitive description inputs are rejected',()=>{
    assert.throws(()=>C.makePrompt({color:'unknown',features:''}));
    for(const text of ['https://example.test/photo','bird@example.test','0912-345-678','API key abc','學號 12345','密碼 abc'])assert.throws(()=>T.cleanFeatures(text));
    assert.equal(T.cleanFeatures('  尾羽有 3 條白斑  '),'尾羽有 3 條白斑');
  });
  await test('local nickname and feather notes reject empty, control or excessive values',()=>{
    assert.equal(T.cleanName('  合成鳥寶  '),'合成鳥寶');for(const value of ['', ' ', '鳥'.repeat(21),'鳥\n寶'])assert.throws(()=>T.cleanName(value));
    assert.throws(()=>T.cleanFeatures('羽'.repeat(121)));assert.throws(()=>T.cleanFeatures('羽\n毛'));
  });
  await test('static PNG and APNG animation are distinguished from header chunks',()=>{
    const still=T.imageInfo(png(1280,1280));assert.equal(still.mime,'image/png');assert.equal(still.width,1280);assert.equal(still.height,1280);assert.equal(still.animated,false);
    assert.equal(T.imageInfo(png(1280,1280,true)).animated,true);assert.throws(()=>T.validateHeader(T.imageInfo(png(1280,1280,true)),'atlas'),/靜態/);
  });
  await test('WebP dimensions and animation flag are read before image decoding',()=>{
    const still=T.imageInfo(webp());assert.equal(still.width,1280);assert.equal(still.height,1280);assert.equal(still.mime,'image/webp');assert.equal(still.animated,false);
    assert.throws(()=>T.validateHeader(T.imageInfo(webp(true)),'atlas'),/靜態/);
  });
  await test('atlas size and JPEG atlas are rejected while reference bounds remain separate',()=>{
    assert.throws(()=>T.validateHeader({mime:'image/png',width:1024,height:1024,animated:false},'atlas'),/1280/);
    assert.throws(()=>T.validateHeader({mime:'image/jpeg',width:1280,height:1280,animated:false},'atlas'),/PNG/);
    assert.equal(T.validateHeader({mime:'image/jpeg',width:1200,height:800,animated:false},'reference').width,1200);
    assert.throws(()=>T.validateHeader({mime:'image/png',width:10000,height:10000,animated:false},'reference'),/2400/);
  });
  await test('synthetic alpha pixels must fill all 16 cells and retain transparent margins',()=>{
    const result=T.checkPixels(pixels(),1280,1280);assert.equal(result.visible.length,16);assert.ok(result.visible.every(n=>n===96));assert.ok(result.transparent.every(n=>n>32));
  });
  await test('opaque backgrounds and an empty cell fail pixel validation',()=>{
    const opaque=new Uint8ClampedArray(1280*1280*4);opaque.fill(255);assert.throws(()=>T.checkPixels(opaque,1280,1280),/透明/);
    assert.throws(()=>T.checkPixels(pixels(7),1280,1280),/第 8 格/);
    assert.throws(()=>T.checkPixels(new Uint8Array(4),1,1),/尺寸/);
  });
  await test('file sizes, unsupported MIME and invalid dimensions fail before a browser decoder',async()=>{
    assert.equal(sandbox.Image,undefined);assert.equal(sandbox.document,undefined);
    await assert.rejects(()=>T.prepareImage({size:8*1024*1024+1},'atlas'),/8 MB/);
    await assert.rejects(()=>T.prepareImage(new Blob(['<svg/>'],{type:'image/svg+xml'}),'reference'),/JPG/);
    await assert.rejects(()=>T.prepareImage(new Blob([png(1024,1024)],{type:'image/png'}),'atlas'),/1280/);
    await assert.rejects(()=>T.prepareImage(new Blob([png(10000,10000)],{type:'image/png'}),'reference'),/2400/);
  });
  await test('page discloses no AI upload, memory-only session and manual approval',()=>{
    const html=C.render();for(const text of ['不會呼叫 AI 服務','重新整理就會清掉','data-creator-action="copy"','creator-atlas-input','creator-prompt','不會存進相簿'])assert.ok(html.includes(text),text);
    assert.ok(!/https?:\/\//.test(html));
  });
  await test('canonical atlas bound matches the Motion 12-million-character limit',()=>{
    assert.equal(T.boundedAtlas('data:image/png;base64,AA=='),'data:image/png;base64,AA==');
    assert.throws(()=>T.boundedAtlas('data:image/jpeg;base64,AA=='));
    assert.throws(()=>T.boundedAtlas('data:image/png;base64,'+'A'.repeat(12000000)),/太大/);
  });
  await test('custom-bird acknowledgements require true and ignore a duplicate response',async()=>{
    sandbox.dispatchEvent=event=>{assert.equal(event.type,'CottageCustomBird');assert.equal(event.detail.dataUrl,'SYNTHETIC_ATLAS');event.detail.ack('yes','not a boolean');event.detail.ack(true,'late duplicate');};
    const result=await T.requestCustom('SYNTHETIC_ATLAS');assert.equal(result.ok,false);assert.equal(result.message,'not a boolean');
  });
  await test('failed apply preserves the old selection; confirmed restore clears it',async()=>{
    T.seedApplied('SYNTHETIC_OLD');sandbox.dispatchEvent=event=>event.detail.ack(false,'rejected by Motion');
    assert.equal(await T.setCustom('SYNTHETIC_NEXT'),false);assert.equal(T.getApplied(),'SYNTHETIC_OLD');
    sandbox.dispatchEvent=event=>{assert.equal(event.detail.dataUrl,null);event.detail.ack(true,'restored');};
    assert.equal(await T.setCustom(null),true);assert.equal(T.getApplied(),null);
  });
  await test('missing listener confirmation cannot be reported as successful',async()=>{
    sandbox.dispatchEvent=()=>{};const result=await T.requestCustom('SYNTHETIC_ATLAS');assert.equal(result.ok,false);assert.match(result.message,/沒有確認/);
  });
  console.log(`${passed} creator tests passed.`);
  console.log('Not tested here: real browser decoding/canvas, file chooser, visual character consistency, motion playback, clipboard, downloads, or the parent custom-bird listener.');
})().catch(error=>{console.error(error);process.exitCode=1;});
