// Local concatenation and asset embedding only. No dependencies or network access.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8').replace(/^\uFEFF/,'').replace(/\r\n/g,'\n');
const scripts=['core.js','content.js','content-en.js','i18n.js','i18n-app-en.js','i18n-components-en.js','art.js','motion.js','music.js','gallery.js','decor.js','backup.js','guides.js','creator.js','app.js'];
const styles=['style.css','motion.css','gallery.css','decor.css','guides.css','creator.css','readability.css'];
const assets=['assets/bird-lutino.webp','assets/bird-gray.webp','assets/bird-pearl.webp','assets/lutino-walk.gif','assets/lutino-flight.gif','assets/lutino-care.gif'];
function inlineAssets(text){for(const file of assets){const type=file.endsWith('.webp')?'image/webp':'image/gif';text=text.replaceAll(file,'data:'+type+';base64,'+fs.readFileSync(path.join(root,file)).toString('base64'));}return text;}
let html=read('index.html');
for(const file of scripts)html=html.replace(`  <script src="${file}" defer></script>\n`,'');
for(const file of styles)html=html.replace(`<link rel="stylesheet" href="${file}">`,()=>`<style>\n${read(file)}\n</style>`);
const chunks=scripts.map(file=>'\n'+inlineAssets(read(file))+'\n');
const hashes=chunks.map(s=>"'sha256-"+crypto.createHash('sha256').update(s).digest('base64')+"'").join(' ');
html=html.replace("script-src 'self'",'script-src '+hashes).replace('href="favicon.svg"','href="data:image/svg+xml;base64,'+Buffer.from(read('favicon.svg')).toString('base64')+'"');
html=html.replace('</body>',()=>chunks.map(s=>'<script>'+s+'</script>').join('\n')+'\n</body>');
fs.writeFileSync(path.join(root,'standalone.html'),html);
const files=fs.readdirSync(root,{recursive:true}).filter(f=>fs.lstatSync(path.join(root,f)).isFile()&&!f.split(path.sep).some(part=>['docs','.git','.netlify','node_modules','private','photos','backups'].includes(part)||part.startsWith('.env'))&&f!=='VERSION.json'&&f!=='PUBLIC-FILES.json').sort();
const manifest={version:'0.4.0',saveSchema:2,decorSchema:1,albumSchema:1,date:'2026-11-09',publication:'local-only; not deployed',files:files.map(file=>({file,sha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex')}))};
fs.writeFileSync(path.join(root,'VERSION.json'),JSON.stringify(manifest,null,2)+'\n');
console.log('Packed v0.4.0 standalone with 3 bird atlases, GIFs, '+scripts.length+' scripts; hashed '+files.length+' files. No upload or deploy.');
