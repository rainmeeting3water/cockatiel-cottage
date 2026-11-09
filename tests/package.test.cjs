'use strict';

const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const {spawnSync} = require('node:child_process');

const project = path.resolve(__dirname, '..');
const packageSource = fs.readFileSync(path.join(project, 'tools/package.cjs'), 'utf8');
const temporaryParent = fs.realpathSync(os.tmpdir());
const temporaryPrefix = 'cottage-package-regression-';

function packageList(name) {
  const match = packageSource.match(new RegExp('const ' + name + '=\\[([^\\]]+)\\]'));
  assert.ok(match, 'The package input list must be readable: ' + name);
  return JSON.parse('[' + match[1].replaceAll("'", '"') + ']');
}

function normalized(file) {
  return fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
}

function cleanup(directory) {
  const absolute = path.resolve(directory);
  if (!path.isAbsolute(directory) ||
      path.dirname(absolute) !== temporaryParent ||
      !path.basename(absolute).startsWith(temporaryPrefix) ||
      fs.lstatSync(absolute).isSymbolicLink() ||
      fs.realpathSync(absolute) !== absolute) {
    throw new Error('Refusing to remove an unexpected package-test directory.');
  }
  // The checked target is a unique, task-specific child of the system temp directory.
  fs.rmSync(absolute, {recursive: true, force: false});
}

test('standalone packaging preserves literal dollar tokens and all 15 CSP script hashes', () => {
  const directory = fs.mkdtempSync(path.join(temporaryParent, temporaryPrefix));
  try {
    const scripts = packageList('scripts');
    const styles = packageList('styles');
    const assets = packageList('assets');
    const inputs = new Set(['index.html', 'favicon.svg', 'tools/package.cjs', ...scripts, ...styles, ...assets]);
    for (const relative of inputs) {
      assert.ok(!path.isAbsolute(relative) && !relative.split(/[\\/]/).includes('..'));
      const destination = path.join(directory, relative);
      fs.mkdirSync(path.dirname(destination), {recursive: true});
      fs.copyFileSync(path.join(project, relative), destination);
    }

    // These are JavaScript replacement-string metacharacters, not user data.
    // Their presence must not change how the original HTML or CSS is inserted.
    const tokens = {wholeMatch: '$&', suffix: "$'", prefix: '$`', dollar: '$$'};
    const dictionaryFile = path.join(directory, 'i18n-app-en.js');
    const dictionarySentinel = 'globalThis.__packageLiteralTokens = ' + JSON.stringify(tokens) + ';';
    fs.appendFileSync(dictionaryFile, '\n' + dictionarySentinel + '\n');
    const cssSentinel = ':root{--package-literal-tokens:' + JSON.stringify(Object.values(tokens).join('/')) + ';}';
    fs.appendFileSync(path.join(directory, 'readability.css'), '\n' + cssSentinel + '\n');

    const result = spawnSync(process.execPath, ['tools/package.cjs'], {
      cwd: directory,
      encoding: 'utf8',
      timeout: 30000
    });
    assert.ifError(result.error);
    assert.equal(result.status, 0, 'The isolated package command failed: ' + result.stderr);

    const html = normalized(path.join(directory, 'standalone.html'));
    const embeddedScripts = Array.from(html.matchAll(/<script>([\s\S]*?)<\/script>/g), match => match[1]);
    assert.equal(scripts.length, 15);
    assert.equal(embeddedScripts.length, 15, 'Packaging must produce exactly 15 complete script elements.');
    assert.doesNotMatch(html, /<script\s+src=/);

    const policy = html.match(/http-equiv="Content-Security-Policy"\s+content="([^"]+)"/);
    assert.ok(policy, 'The standalone output must retain its CSP.');
    const scriptDirective = policy[1].match(/(?:^|;)\s*script-src\s+([^;]+)/);
    assert.ok(scriptDirective, 'The standalone CSP must include script-src.');
    const allowedHashes = Array.from(scriptDirective[1].matchAll(/'sha256-([A-Za-z0-9+/=]+)'/g), match => match[1]);
    assert.equal(allowedHashes.length, 15);
    for (const [index, source] of embeddedScripts.entries()) {
      const digest = crypto.createHash('sha256').update(source).digest('base64');
      assert.ok(allowedHashes.includes(digest), 'CSP does not allow the actual inline content of ' + scripts[index]);
    }

    for (const file of ['i18n-app-en.js', 'i18n-components-en.js']) {
      const index = scripts.indexOf(file);
      assert.notEqual(index, -1);
      assert.equal(embeddedScripts[index], '\n' + normalized(path.join(directory, file)) + '\n',
        'The packaged dictionary changed its literal source: ' + file);
    }
    assert.ok(embeddedScripts[scripts.indexOf('i18n-app-en.js')].includes(dictionarySentinel));
    assert.ok(html.includes(cssSentinel), 'CSS insertion must also preserve replacement-string metacharacters.');
  } finally {
    cleanup(directory);
  }
});
