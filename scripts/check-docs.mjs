import {readFileSync,readdirSync,existsSync,statSync} from 'node:fs';
import {resolve,dirname,extname} from 'node:path';
const files=['README.md','AGENTS.md',...readdirSync('docs').filter(n=>n.endsWith('.md')).map(n=>'docs/'+n)];
const scripts=JSON.parse(readFileSync('package.json','utf8')).scripts;
function headings(text) {
  const result=new Set();const counts=new Map();let fenced=false;
  for(const line of text.split('\n')) {
    if(/^\s*```/.test(line)){fenced=!fenced;continue;}
    if(fenced || !/^#{1,6} /.test(line))continue;
    const base=line.replace(/^#{1,6} /,'').replace(/<[^>]*>/g,'').toLowerCase().replace(/[^\p{L}\p{N}_\-\s]/gu,'').replace(/\s/g,'-');
    const n=counts.get(base)??0;counts.set(base,n+1);result.add(base+(n?'-'+n:''));
  }return result;
}
const failures=[];
for(const file of files) {
  const text=readFileSync(file,'utf8');
  const targets=[...text.matchAll(/!?\[[^\]\n]*\]\(([^)\n]+)\)/g)].map(m=>m[1]);
  targets.push(...[...text.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/g)].map(m=>m[1]));
  for(let target of targets) {
    target=target.replace(/^<|>$/g,'');if(/^(?:[a-z]+:|\/\/)/i.test(target)) continue;
    const [name,fragment]=target.split('#');const path=name?resolve(dirname(file),decodeURIComponent(name)):resolve(file);
    if(!existsSync(path) || !statSync(path).isFile()){failures.push(`${file}: missing local target ${target}`);continue;}
    if(fragment && extname(path)==='.md' && !headings(readFileSync(path,'utf8')).has(decodeURIComponent(fragment)))failures.push(`${file}: missing heading ${target}`);
  }
  for(const [,command] of text.matchAll(/\bnpm run ([\w:-]+)/g)) if(!Object.hasOwn(scripts,command))failures.push(`${file}: unknown npm script ${command}`);
}
if(failures.length){console.error(failures.join('\n'));process.exitCode=1;}
else console.log(`PASS ${files.length} Markdown files: local links, image targets, heading fragments and npm script references (external URLs not fetched)`);
