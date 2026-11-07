import test from "node:test";
import assert from "node:assert/strict";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

type Result = { url: string; outcome: string; status?: number; redirects: number; method?: string };
type Options = { fetchImpl?: typeof fetch; timeoutMs?: number; concurrency?: number; budgetMs?: number; signal?: AbortSignal };
type Checker = {
  safeSourceUrl: (url: string) => string | null;
  classifyStatus: (status: number) => string;
  publishedSources: (...data: unknown[]) => string[];
  checkSource: (url: string, options?: Options) => Promise<Result>;
  checkSources: (urls: string[], options?: Options) => Promise<Result[]>;
};
const checker = (new Function("url", "return import(url)") as (url: string) => Promise<Checker>)(pathToFileURL(resolve("scripts/check-sources.mjs")).href);
const url = "https://www.fifatrainingcentre.com/example.pdf";
const mock = (handler: (input: string, init: RequestInit) => Response | Promise<Response>) =>
  ((input, init) => Promise.resolve(handler(String(input), init ?? {}))) as typeof fetch;

test("source health separates missing publishers from blocked requests and unsupported methods", async () => {
  const c = await checker;
  for (const [status, outcome] of [[200,"healthy"],[206,"healthy"],[404,"missing"],[410,"missing"],[401,"blocked"],[403,"blocked"],[429,"blocked"],[451,"blocked"],[405,"unsupported"],[501,"unsupported"],[503,"http-error"],[302,"redirect"]] as const) {
    assert.equal(c.classifyStatus(status), outcome);
  }
  let calls = 0;
  const blocked = await c.checkSource(url, { fetchImpl: mock(() => { calls++; return new Response(null, { status: 403 }); }) });
  assert.equal(blocked.outcome, "blocked");
  assert.equal(calls, 1, "does not work around publisher access blocks with GET");
});

test("HEAD fallback requests only a byte range and immediately cancels any returned body", async () => {
  const c = await checker;
  const calls: RequestInit[] = [];
  let cancelled = 0;
  const result = await c.checkSource(url, { fetchImpl: mock((_input, init) => {
    calls.push(init);
    if (init.method === "HEAD") return new Response(null, { status: 405 });
    return new Response(new ReadableStream({ cancel() { cancelled++; } }), { status: 200 });
  }) });
  assert.equal(result.outcome, "healthy");
  assert.deepEqual(calls.map(call => call.method), ["HEAD", "GET"]);
  assert.deepEqual(calls[1].headers, { Range: "bytes=0-0" });
  assert.ok(calls.every(call => call.redirect === "manual"));
  assert.equal(cancelled, 1, "server may ignore Range; checker still never consumes the full PDF");
});

test("URL safety rejects secrets, non-publishers and private endpoints without making requests", async () => {
  const c = await checker;
  let calls = 0;
  for (const input of ["not a URL", "http://www.fifa.com/a", "https://localhost/a", "https://127.0.0.1/a", "https://www.fifa.com.evil.test/a", "https://api.openai.com/a", "https://www.fifa.com:444/a", "https://user:password@www.fifa.com/a", "https://www.fifa.com/a?token=secret"]) {
    assert.equal(c.safeSourceUrl(input), null);
    const result = await c.checkSource(input, { fetchImpl: mock(() => { calls++; throw new Error("must not run"); }) });
    assert.equal(result.outcome, "invalid-url");
    assert.equal(result.url, "[rejected source URL]");
    assert.ok(!JSON.stringify(result).includes("secret"));
  }
  assert.equal(calls, 0);
  assert.equal(c.safeSourceUrl(`${url}#anchor`), url);
});

test("redirects are manual, bounded and restricted to reviewed HTTPS publishers", async () => {
  const c = await checker;
  let calls = 0;
  const result = await c.checkSource(url, { fetchImpl: mock(() => {
    calls++;
    return calls === 1 ? new Response(null, { status: 301, headers: { location: "https://www.fifa.com/article" } }) : new Response(null, { status: 200 });
  }) });
  assert.equal(result.outcome, "healthy"); assert.equal(result.redirects, 1);
  for (const location of ["http://www.fifa.com/a", "https://localhost/a", "https://www.fifa.com/a?secret=value"]) {
    const rejected = await c.checkSource(url, { fetchImpl: mock(() => new Response(null, { status: 302, headers: { location } })) });
    assert.equal(rejected.outcome, "unsafe-redirect");
    assert.equal(rejected.redirects, 0);
    assert.ok(!JSON.stringify(rejected).includes("secret"));
  }
  calls = 0;
  const loop = await c.checkSource(url, { fetchImpl: mock(() => { calls++; return new Response(null, { status: 302, headers: { location: "/loop" } }); }) });
  assert.equal(loop.outcome, "redirect-limit"); assert.equal(calls, 4);
});

test("timeouts and network exceptions are bounded and do not report upstream error values", async () => {
  const c = await checker;
  const failure = await c.checkSource(url, { fetchImpl: mock(() => { throw new Error("credential=secret"); }) });
  assert.equal(failure.outcome, "network-error"); assert.ok(!JSON.stringify(failure).includes("secret"));
  const timeout = await c.checkSource(url, { timeoutMs: 10, fetchImpl: mock(() => new Promise<Response>(() => {})) });
  assert.equal(timeout.outcome, "timeout", "even an adapter ignoring abort cannot hang the checker");
});

test("a pre-aborted source check returns without fetching or creating an unhandled rejection", async () => {
  const c = await checker;
  const controller = new AbortController();
  controller.abort();
  let calls = 0;
  const result = await c.checkSource(url, { signal: controller.signal, fetchImpl: mock(() => {
    calls++;
    return new Response(null, { status: 200 });
  }) });
  // Let Node report any unhandled rejection before this test completes.
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(result.outcome, "timeout");
  assert.equal(calls, 0);
});

test("source collection deduplicates records/developments and workers respect concurrency and total budget", async () => {
  const c = await checker;
  assert.deepEqual(c.publishedSources([{ sources: [{ url }] }], { lens: { sources: [{ url }], developments: [{ sourceUrl: "https://www.fifa.com/a" }] } }), ["https://www.fifa.com/a", url]);
  let active = 0, peak = 0;
  const results = await c.checkSources(Array.from({ length: 8 }, (_, n) => `${url}/${n}`), { concurrency: 2, fetchImpl: mock(async () => {
    active++; peak = Math.max(active, peak);
    await new Promise(resolve => setTimeout(resolve, 5)); active--;
    return new Response(null, { status: 200 });
  }) });
  assert.equal(results.length, 8); assert.equal(peak, 2); assert.ok(results.every(result => result.outcome === "healthy"));
  const bounded = await c.checkSources([url, `${url}/2`], { concurrency: 1, timeoutMs: 500, budgetMs: 10, fetchImpl: mock(() => new Promise<Response>(() => {})) });
  assert.deepEqual(bounded.map(result => result.outcome), ["timeout", "budget-exhausted"]);
  await assert.rejects(c.checkSources([url], { concurrency: 5 }), /bounds/);
});
