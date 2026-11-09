'use strict';
// Only copies project-owned static files. No dependencies, credentials, or network.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),target=path.join(root,'docs');
const files=['index.html','favicon.svg','style.css','motion.css','gallery.css','decor.css','guides.css','creator.css','core.js','content.js','content-en.js','i18n.js','i18n-app-en.js','i18n-components-en.js','readability.css','art.js','motion.js','music.js','gallery.js','decor.js','backup.js','guides.js','creator.js','app.js','assets/bird-lutino.webp','assets/bird-gray.webp','assets/bird-pearl.webp','assets/lutino-walk.gif','assets/lutino-flight.gif','assets/lutino-care.gif'];
if(path.resolve(target)!==path.join(root,'docs'))throw Error('Unexpected target');
if(fs.existsSync(target)&&fs.readdirSync(target).length&&!fs.existsSync(path.join(target,'cottage-generated.json')))throw Error('docs/ contains unowned files. Nothing changed.');
const permitted=new Set([...files,'.nojekyll','cottage-generated.json']);
function inspect(dir){
 if(fs.realpathSync(dir)!==path.resolve(dir))throw Error('Publish directory contains a link. Nothing changed.');
 for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
  const item=path.join(dir,entry.name),relative=path.relative(target,item).split(path.sep).join('/');
  if(fs.lstatSync(item).isSymbolicLink()||fs.realpathSync(item)!==path.resolve(item))throw Error('Publish directory contains a link. Nothing changed.');
  if(entry.isDirectory())inspect(item);else if(!entry.isFile()||!permitted.has(relative))throw Error('Publish directory contains an unlisted file. Nothing changed.');
 }
}
if(fs.existsSync(target))inspect(target);
for(const file of files){const src=path.join(root,file);if(!fs.statSync(src).isFile()||fs.realpathSync(src)!==path.resolve(src))throw Error('Source missing or linked. Nothing changed.');}
// Do not recursively delete. Remove only files in the previous generated inventory.
if(fs.existsSync(path.join(target,'cottage-generated.json'))){const old=JSON.parse(fs.readFileSync(path.join(target,'cottage-generated.json'),'utf8'));if(!Array.isArray(old)||old.some(rel=>!permitted.has(rel)))throw Error('Unsafe old inventory');}
const entries=[];
for(const file of files){const src=path.join(root,file),dest=path.join(target,file);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(src,dest);if(file==='index.html')fs.writeFileSync(dest,fs.readFileSync(dest,'utf8').replace('<html lang="zh-Hant-TW">','<html lang="zh-Hant-TW" data-youtube-mode="external">'));const bytes=fs.readFileSync(dest);entries.push({file,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')});}
fs.writeFileSync(path.join(target,'.nojekyll'),'');
fs.writeFileSync(path.join(target,'cottage-generated.json'),JSON.stringify([...files,'.nojekyll']));
const generated=fs.readFileSync(path.join(target,'cottage-generated.json'));
const manifest={version:'0.4.0',publication:'prepared locally; NOT published',publishDirectory:'docs/',files:[...entries,{file:'cottage-generated.json',bytes:generated.length,sha256:crypto.createHash('sha256').update(generated).digest('hex')},{file:'.nojekyll',bytes:0,sha256:crypto.createHash('sha256').update('').digest('hex')}],notPublished:['private user photos','browser saves','handbook','tests','tools','standalone.html']};
fs.writeFileSync(path.join(root,'PUBLIC-FILES.json'),JSON.stringify(manifest,null,2)+'\n');
console.log('Prepared '+manifest.files.length+' public static files in docs/. No upload, Git operation, or deployment.');
