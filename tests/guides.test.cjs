'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {test} = require('node:test');
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(__dirname,'..','content.js'),'utf8'),sandbox,{filename:'content.js'});
vm.runInContext(fs.readFileSync(path.join(__dirname,'..','guides.js'),'utf8'),sandbox,{filename:'guides.js'});
const G = sandbox.CottageGuides;

test('all current care topics render; ordinary details begin folded',()=>{
  for (const guide of sandbox.CockatielContent.guides) {
    const html = G.careCard(guide.id,guide.title,guide.summary,'<ul><li>原有說明</li></ul>');
    assert.match(html,/<svg /);
    assert.match(html,/<h2>/);
    if(guide.id !== 'emergency') {
      assert.match(html,/<details class="cg-care-details">/);
      assert.doesNotMatch(html,/<details[^>]*\bopen\b/);
    }
  }
});

test('emergency directions are immediately visible without details',()=>{
  const html = G.careCard('emergency','立刻求助','呼吸困難不能等','<p>馬上聯絡鳥類獸醫。</p>');
  assert.doesNotMatch(html,/<details|<summary/);
  assert.match(html,/立刻聯絡能看鳥的獸醫或急診/);
  assert.match(html,/<p>馬上聯絡鳥類獸醫。<\/p>/);
  const overview = G.overview();
  assert.match(overview,/呼吸困難、站不起來、一直出血或可能中毒/);
  assert.match(overview,/小朋友先找照顧鳥寶的大人/);
});

test('untrusted card titles and summaries are escaped; IDs are whitelisted',()=>{
  const html = G.careCard('" onmouseover="synthetic','<img src=x onerror=synthetic>','<script>synthetic</script>');
  assert.doesNotMatch(html,/<script>|<img |onmouseover=/);
  assert.match(html,/&lt;img/);
  assert.match(html,/data-care-guide="general"/);
  for(const id of ['constructor','toString','__proto__']) {
    assert.match(G.picture(id),/<svg /);
    assert.match(G.careCard(id,'題目','簡介'),/data-care-guide="general"/);
  }
});

test('food states always have visible status words and shape symbols',()=>{
  for(const [status,label,symbol] of [['suitable','可適量','✓'],['avoid','需要避免','×'],['unknown','資料不足','?']]) {
    const html = G.foodIcon('合成測試食品',status);
    assert.ok(html.includes(label));
    assert.ok(html.includes(symbol));
    assert.match(html,/<svg /);
  }
  assert.match(G.foodIcon('未知食物','made-up-status'),/資料不足/);
  assert.doesNotMatch(G.foodIcon('<script>synthetic</script>','unknown'),/<script>/);
});

test('all existing food records receive an illustration and the correct status',()=>{
  const labels = {suitable:'可適量',avoid:'需要避免',unknown:'資料不足'};
  for(const food of sandbox.CockatielContent.foods) {
    const html = G.foodIcon(food.name,food.status);
    assert.ok(html.includes(labels[food.status]));
    assert.match(html,/viewBox="0 0 88 88"/);
  }
});

test('overview has seven illustrated topics and no app-route-conflicting hash links',()=>{
  const html = G.overview();
  assert.equal((html.match(/<figure /g)||[]).length,7);
  assert.equal((html.match(/<svg /g)||[]).length,7);
  assert.doesNotMatch(html,/href="#/);
});

test('illustrations use no external resources, embedded scripts or repeated IDs',()=>{
  const html = G.overview() + sandbox.CockatielContent.guides.map(g=>G.careCard(g.id,g.title,g.summary)).join('') + sandbox.CockatielContent.foods.map(f=>G.foodIcon(f.name,f.status)).join('');
  // xmlns is the standard SVG namespace, not a fetched URL.
  assert.doesNotMatch(html,/<image|<script|foreignObject|(?:href|src)\s*=|<text\b|\bid="/i);
  const svgs = html.match(/<svg\b[^>]*>/g) || [];
  assert.ok(svgs.length > 20);
  assert.ok(svgs.every(s=>s.includes('aria-hidden="true"')&&s.includes('focusable="false"')));
  assert.ok(Object.isFrozen(G));
});

test('source links supplied by the app remain inside the expandable detail',()=>{
  const detail = '<ul><li>原有照顧說明</li></ul><div class="source-links"><a href="https://www.aav.org/">AAV</a>查核 2026-11-08</div>';
  const html = G.careCard('sleep','安靜睡覺','避開強光',detail);
  assert.ok(html.indexOf(detail)>html.indexOf('<details'));
  assert.ok(html.indexOf(detail)<html.indexOf('</details>'));
});
