'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');require('../motion.js');const M=globalThis.CottageMotion;
test('custom birds appear only when the caller requests them',()=>{const url='data:image/png;base64,AAAA';M.setCustom(url);assert.match(M.image('lutino','',true),/data:image\/png/);assert.match(M.image('gray'),/bird-gray.webp/);M.setCustom(null);assert.match(M.image('lutino','',true),/bird-lutino.webp/);});
test('sprite source rejects remote URLs and attribute injection',()=>{for(const bad of ['https://example.com/photo.png',"data:image/png;base64,' onerror='x",'data:image/svg+xml;base64,AAAA'])assert.throws(()=>M.setCustom(bad));});
test('encoded 1280 square RGBA sprites fit the shared import allowance',()=>{M.setCustom('data:image/png;base64,'+'A'.repeat(7500000));assert.match(M.image('lutino','',true),/data:image\/png/);M.setCustom(null);assert.throws(()=>M.setCustom('data:image/png;base64,'+'A'.repeat(12000000)));});
