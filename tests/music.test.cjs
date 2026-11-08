'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
require('../music.js');const M=globalThis.CottageMusic;
test('153 and owner embedding errors stay distinct',()=>{assert.match(M.explainError(153),/來源|識別/);assert.notEqual(M.explainError(153),M.explainError(150));assert.ok(M.explainError(999));});
test('file player cannot fabricate a web origin',()=>{assert.equal(M.canTryEmbed('file:'),false);assert.throws(()=>M.buildEmbedUrl(M.videos[0].id,'file:///tmp/test.html'));});
test('embed URL retains legitimate Pages origin and no autoplay',()=>{const u=new URL(M.buildEmbedUrl(M.videos[0].id,'https://example.github.io/cottage/#music'));assert.equal(u.origin,'https://www.youtube-nocookie.com');assert.equal(u.searchParams.get('origin'),'https://example.github.io');assert.equal(u.searchParams.get('autoplay'),'0');assert.equal(u.searchParams.get('loop'),'0');});
test('credentials and unlisted videos never enter embed links',()=>{assert.throws(()=>M.buildEmbedUrl('bad','https://example.com'));assert.throws(()=>M.buildEmbedUrl(M.videos[0].id,'https://person:password@example.com'));});
