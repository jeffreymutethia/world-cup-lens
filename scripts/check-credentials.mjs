import {execFileSync} from 'node:child_process';
import {readFileSync,statSync} from 'node:fs';
const files=execFileSync('git',['ls-files','--cached','--others','--exclude-standard','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);
const patterns=[/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,/\b(?:sk-proj-|sb_secret_|sb_publishable_)[A-Za-z0-9_-]{20,}/,/\b(?:ghp_|github_pat_)[A-Za-z0-9_]{30,}/,/\bAKIA[A-Z0-9]{16}\b/,/\beyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}/];
const violations=[];
for(const name of new Set(files)) {
 if(/(^|\/)\.env(?:\.|$)/.test(name) && !name.endsWith('.example')) {violations.push(name);continue;}
 try {if(!statSync(name).isFile()) continue;const content=readFileSync(name,'utf8');if(patterns.some(p=>p.test(content))) violations.push(name);}catch(error){if(error.code!=='ENOENT') throw error;}
}
if(violations.length) {console.error('Credential check rejected files (values withheld): '+violations.join(', '));process.exitCode=1;}
else console.log('PASS tracked/reviewable file credential patterns and environment-file policy (not a comprehensive secret detector)');
