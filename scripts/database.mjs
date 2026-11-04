import { spawnSync, spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, rmSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';

// Never accepts a database URL. Every invocation owns and destroys its database.
const root = resolve(import.meta.dirname, '..');
const temp = mkdtempSync(join(tmpdir(), 'wcl-db-'));
const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith('PG') && !/DATABASE|SUPABASE|OPENAI|FOOTBALL/.test(key)));
const native = process.env.WCL_PG_BIN || '/opt/homebrew/opt/postgresql@14/bin';
const timeout = 120_000;
const deadline=Date.now()+8*60_000;
let container, running = false;
function run(cmd, args, input, quiet = false) {
  const remaining=deadline-Date.now();
  if(remaining<=0) throw new Error('Database test deadline exceeded');
  const r = spawnSync(cmd, args, { env, input, encoding: 'utf8', timeout:Math.min(timeout,remaining), maxBuffer: 10_000_000 });
  if (r.error || r.status !== 0) throw new Error(`${cmd} failed: ${r.stderr || r.error?.message || 'nonzero exit'}`);
  if (!quiet && r.stdout.trim()) console.log(r.stdout.trim());
  if (!quiet) for(const line of r.stderr.split('\n').filter(line=>/^NOTICE:\s+PASS /.test(line))) console.log(line.replace(/^NOTICE:\s+/,''));
  return r.stdout;
}
let sql, psqlCommand, psqlArgs;
try {
  if (spawnSync(join(native, 'initdb'), ['--version'], {env,timeout:5000}).status === 0) {
    const socket = join(temp, 'socket'); mkdirSync(socket, {mode:0o700});
    run(join(native, 'initdb'), ['-D',join(temp,'data'),'-U','postgres','-A','trust','--no-locale','-E','UTF8'], undefined, true);
    running=true;
    run(join(native, 'pg_ctl'), ['-D',join(temp,'data'),'-l',join(temp,'postgres.log'),'-o',`-k ${socket} -h '' -p 55439`,'-w','start'], undefined, true);
    psqlCommand=join(native,'psql');psqlArgs=['-X','-v','ON_ERROR_STOP=1','-h',socket,'-p','55439','-U','postgres','-d','postgres'];
  } else {
    container = `wcl-test-${randomUUID()}`;
    run('docker',['run','-d','--name',container,'--network','none','-e','POSTGRES_HOST_AUTH_METHOD=trust','pgvector/pgvector:0.8.2-pg17'],undefined,true);
    for (let i=0;i<60;i++) {
      if (spawnSync('docker',['exec',container,'pg_isready','-U','postgres'],{env,stdio:'ignore',timeout:5000}).status===0) break;
      await new Promise(r=>setTimeout(r,500));
      if(i===59) throw new Error('Disposable PostgreSQL did not become ready');
    }
    psqlCommand='docker';psqlArgs=['exec','-i',container,'psql','-X','-U','postgres','-v','ON_ERROR_STOP=1'];
  }
  sql=text=>run(psqlCommand,psqlArgs,text);
  sql('create role anon nologin; create role authenticated nologin; create role service_role nologin nobypassrls;');
  for(const name of readdirSync(join(root,'supabase/migrations')).filter(n=>n.endsWith('.sql')).sort()) sql(readFileSync(join(root,'supabase/migrations',name),'utf8'));
  sql(readFileSync(join(root,'supabase/seed.sql'),'utf8'));
  const checks=readFileSync(join(root,'supabase/tests/integration.sql'),'utf8');
  if(!checks.includes('test_assert') || !checks.includes('test_error')) throw new Error('Integration checks missing');
  sql(checks);
  const concurrent=()=>new Promise((resolve,reject)=>{
    const child=spawn(psqlCommand,psqlArgs,{env,stdio:['pipe','ignore','pipe'],timeout:15_000});let stderr='';
    child.stderr.on('data',chunk=>stderr+=chunk);child.on('error',reject);child.on('close',code=>code===0?resolve():reject(new Error('Concurrent persistence failed: '+stderr)));
    child.stdin.end('set role service_role; select public.commit_lens_generation(payload) from public.test_concurrency;');
  });
  await Promise.all([concurrent(),concurrent()]);
  sql(`select public.test_assert((select count(*)=1 from public.generation_runs where id=(select (payload->>'id')::uuid from public.test_concurrency)),'concurrent identical retry is idempotent');`);
  console.log('Disposable PostgreSQL/pgvector integration checks passed. No external database contacted.');
} finally {
  if(running) spawnSync(join(native,'pg_ctl'),['-D',join(temp,'data'),'-m','immediate','-w','stop'],{env,stdio:'ignore',timeout:30_000});
  if(container) spawnSync('docker',['rm','-f','-v',container],{env,stdio:'ignore',timeout:30_000});
  rmSync(temp,{recursive:true,force:true});
}
