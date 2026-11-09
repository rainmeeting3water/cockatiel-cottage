'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'content.js'), 'utf8'), sandbox);
const originalSnapshot = JSON.stringify(sandbox.CockatielContent);
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'content-en.js'), 'utf8'), sandbox);
const chinese = JSON.parse(originalSnapshot);
const english = JSON.parse(JSON.stringify(sandbox.CockatielEnglishContent));

test('translation preserves all content fields and record counts', () => {
  assert.deepEqual(Object.keys(english).sort(), Object.keys(chinese).sort());
  assert.equal(english.basics.length, 5);
  assert.equal(english.colors.length, 3);
  assert.equal(english.foods.length, 24);
  assert.equal(english.guides.length, 9);
  assert.equal(english.reviewNotes.length, chinese.reviewNotes.length);
  for (const group of ['sources','basics','colors','foods','guides']) {
    assert.equal(english[group].length, chinese[group].length);
    english[group].forEach((record,index) => {
      assert.deepEqual(Object.keys(record).sort(),Object.keys(chinese[group][index]).sort());
    });
  }
});

test('all source IDs, URLs and historical check dates stay unchanged', () => {
  assert.equal(english.checked, chinese.checked);
  assert.equal(english.checked, '2026-11-08');
  assert.deepEqual(english.sources.map(({id,url,checked})=>({id,url,checked})), chinese.sources.map(({id,url,checked})=>({id,url,checked})));
  const knownIds = new Set(chinese.sources.map(source=>source.id));
  for (const group of ['basics','colors','foods','guides']) {
    english[group].forEach((record,index)=>{
      assert.deepEqual(record.sourceIds, chinese[group][index].sourceIds);
      for(const id of record.sourceIds) assert.ok(knownIds.has(id));
    });
  }
  assert.deepEqual(english.emergency.sourceIds, chinese.emergency.sourceIds);
});

test('food IDs and all safety states remain exactly the same', () => {
  assert.deepEqual(english.foods.map(({id,status})=>({id,status})),chinese.foods.map(({id,status})=>({id,status})));
  assert.deepEqual(english.foods.filter(food=>food.status==='unknown').map(food=>food.id),['xylitol','wild-plant','mixed-treat']);
  assert.match(english.foods.find(food=>food.id==='xylitol').detail,/not enough evidence.*safe for cockatiels/i);
  assert.match(english.foods.find(food=>food.id==='xylitol').detail,/other birds/);
  assert.match(english.foods.find(food=>food.id==='xylitol').detail,/Do not feed/);
  for(const food of english.foods.filter(food=>food.status==='unknown')) {
    assert.match(food.category,/Not enough information: do not feed/);
  }
});

test('English food search retains every original name and alias', () => {
  english.foods.forEach((food,index)=>{
    const source = chinese.foods[index];
    assert.ok(food.aliases.includes(source.name));
    source.aliases.forEach(alias=>assert.ok(food.aliases.includes(alias),alias));
    assert.ok(food.aliases.includes(food.name));
    assert.equal(new Set(food.aliases).size,food.aliases.length);
  });
  const search = query => english.foods.filter(food=>[food.name,...food.aliases].some(value=>value.toLowerCase().includes(query.toLowerCase()))).map(food=>food.id);
  assert.ok(search('蘋果').includes('apple'));
  assert.ok(search('apple').includes('apple'));
  assert.ok(search('酪梨').includes('avocado'));
  assert.ok(search('avocado').includes('avocado'));
  assert.ok(search('木糖醇').includes('xylitol'));
  assert.ok(search('xylitol').includes('xylitol'));
});

test('each guide keeps its icon, ID, sources and all bullet points', () => {
  english.guides.forEach((guide,index)=>{
    const source = chinese.guides[index];
    assert.equal(guide.id,source.id);
    assert.equal(guide.icon,source.icon);
    assert.equal(guide.bullets.length,source.bullets.length);
    assert.ok(guide.bullets.every(bullet=>typeof bullet==='string'&&bullet.length>20));
  });
  assert.deepEqual(english.colors.map(c=>c.id),chinese.colors.map(c=>c.id));
});

test('translated visible content is complete English; Chinese stays in search aliases only', () => {
  const cjk = /[\u3400-\u9fff]/;
  for(const group of ['sources','basics','colors','foods','guides']) {
    for(const record of english[group]) {
      for(const field of ['title','detail','name','description','category','summary']) {
        if(record[field]!==undefined) {
          assert.equal(typeof record[field],'string');
          assert.ok(record[field].length>0);
          assert.doesNotMatch(record[field],cjk);
        }
      }
      for(const bullet of record.bullets||[]) assert.doesNotMatch(bullet,cjk);
    }
  }
  for(const value of [english.foodIntro,english.emergency.title,english.emergency.detail,...english.reviewNotes]) {
    assert.doesNotMatch(value,cjk);
    assert.ok(value.length>0);
  }
});

test('important medical conditions and care limits survive translation', () => {
  const emergency = english.guides.find(guide=>guide.id==='emergency');
  const text = [emergency.summary,...emergency.bullets,english.emergency.detail].join(' ');
  for(const phrase of ['breathing','severe weakness','ongoing bleeding','poisoning','immediately','even if there are no signs','force food or water','try to make your bird vomit']) assert.ok(text.includes(phrase),phrase);
  assert.match(text,/Do not give medicine on your own/);
  assert.match(english.foodIntro,/no one amount in grams/);
  assert.match(english.foodIntro,/Never let a bird go hungry/);
  assert.match(english.foodIntro,/not listed, do not feed/);
  assert.match(english.basics[4].detail,/cannot tell you whether a real bird is sick/);
  assert.match(english.basics[4].detail,/not real vet fees/);
  assert.match(english.colors.find(colour=>colour.id==='lutino').description,/does not tell us a bird’s personality/);
});

test('translation does not mutate Chinese content, access storage or add a journal schema', () => {
  assert.equal(JSON.stringify(sandbox.CockatielContent),originalSnapshot);
  assert.equal(sandbox.localStorage,undefined);
  assert.equal(sandbox.indexedDB,undefined);
  assert.equal(sandbox.document,undefined);
  assert.deepEqual(Object.keys(sandbox).sort(),['CockatielContent','CockatielEnglishContent']);
  assert.equal('journal' in english,false);
  assert.equal('version' in english,false);
  english.foods[0].sourceIds.push('synthetic-test-source');
  assert.equal(chinese.foods[0].sourceIds.includes('synthetic-test-source'),false);
});
