'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const {webcrypto} = require('node:crypto');

// Private hooks exist only in this isolated test copy; the shipped module is unchanged.
let source = fs.readFileSync(path.join(__dirname, '..', 'gallery.js'), 'utf8');
const hookTarget = 'root.CottageGallery=Object.freeze';
assert.ok(source.includes(hookTarget), 'Expected module export was not found');
source = source.replace(hookTarget,
  'root.__galleryTest={imageInfo,dataUrlBlob,parseAlbum,photoName,normalizePhoto}; ' + hookTarget);
const sandbox = {Blob, atob, Uint8Array, DataView, URL, console, setTimeout, clearTimeout, crypto:webcrypto};
vm.createContext(sandbox);
vm.runInContext(source, sandbox, {filename:'gallery.js'});
const T = sandbox.__galleryTest;
let passed = 0;
async function test(name, check) {
  await check();
  passed++;
  console.log('PASS ' + name);
}
function pngHeader(width, height) {
  const buffer = new ArrayBuffer(30);
  const bytes = new Uint8Array(buffer), view = new DataView(buffer);
  bytes.set([137,80,78,71],0);
  bytes.set([73,72,68,82],12);
  view.setUint32(16,width);
  view.setUint32(20,height);
  return buffer;
}
const album = (photos=[],version=1) => JSON.stringify({format:'cockatiel-cottage-album',version,photos});

(async () => {
  await test('five known frames and privacy-aware page rendering', () => {
    assert.equal(sandbox.CottageGallery.frames.length,5);
    assert.equal(new Set(sandbox.CottageGallery.frames.map(f=>f.id)).size,5);
    const html = sandbox.CottageGallery.render();
    assert.match(html,/不會上傳到網路/);
    assert.match(html,/gallery-album-input/);
    assert.match(html,/gallery-photo-input/);
  });

  await test('names trim whitespace and reject empty, long, or control-character values', () => {
    assert.equal(T.photoName('  小米  '),'小米');
    for(const value of ['', ' ', '鳥'.repeat(21), '小\n米', null]) {
      assert.throws(()=>T.photoName(value));
    }
  });

  await test('PNG header dimensions are read before any decoder is called', () => {
    const info = T.imageInfo(pngHeader(1600,900));
    assert.equal(info.mime,'image/png');
    assert.equal(info.width,1600);
    assert.equal(info.height,900);
  });

  await test('SVG content and remote image references are rejected', () => {
    assert.throws(()=>T.imageInfo(new TextEncoder().encode('<svg/>').buffer));
    assert.throws(()=>T.dataUrlBlob('https://example.test/synthetic-bird.jpg'));
    assert.throws(()=>T.dataUrlBlob('data:image/svg+xml;base64,PHN2Zy8+'));
  });

  await test('malformed, future-version, excessive-count, and unknown-field albums are rejected', async () => {
    await assert.rejects(()=>T.parseAlbum('{broken'));
    await assert.rejects(()=>T.parseAlbum(album([],9)));
    await assert.rejects(()=>T.parseAlbum(album(Array(13).fill({}))));
    await assert.rejects(()=>T.parseAlbum(JSON.stringify({format:'cockatiel-cottage-album',version:1,photos:[],unexpected:true})));
  });

  await test('imported remote URLs are refused before image decoding', async () => {
    await assert.rejects(()=>T.parseAlbum(album([
      {name:'合成鳥寶',frame:'cream',dataUrl:'https://example.test/synthetic-bird.jpg'}
    ])),/網路圖片網址/);
    await assert.rejects(()=>T.parseAlbum(album([
      {name:'合成鳥寶',frame:'unknown',dataUrl:'data:image/jpeg;base64,'}
    ])),/相框/);
  });

  await test('a valid empty backup parses without changing an existing album', async () => {
    const parsed = await T.parseAlbum(album());
    assert.equal(parsed.length,0);
    // No IndexedDB exists in the sandbox: parsing cannot clear or write a photo store.
    assert.equal(sandbox.indexedDB,undefined);
  });

  await test('excessive dimensions are rejected before browser image or canvas use', async () => {
    assert.equal(sandbox.Image,undefined);
    assert.equal(sandbox.document,undefined);
    await assert.rejects(
      ()=>T.normalizePhoto(new Blob([pngHeader(10000,10000)],{type:'image/png'})),
      /2400/
    );
    await assert.rejects(
      ()=>T.normalizePhoto(new Blob([new Uint8Array(10*1024*1024+1)],{type:'image/jpeg'})),
      /10 MB/
    );
  });

  console.log(`${passed} gallery boundary tests passed.`);
  console.log('Not covered here: real browser image decoding, IndexedDB persistence, frame rendering, file chooser, or downloads.');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
