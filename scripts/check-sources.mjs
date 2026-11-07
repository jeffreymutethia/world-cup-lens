// Optional publisher-health check. No source records are changed and no bodies are consumed.
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

export const REVIEWED_HOSTS = new Set([
  "www.fifa.com", "inside.fifa.com", "www.fifatrainingcentre.com",
  "www.cbf.com.br", "www.dfb.de", "www.cafonline.com",
  "www.englandfootball.com", "www.the-afc.com", "www.ussoccer.com",
]);

// Reject query-bearing URLs rather than risk requesting or reporting a credential.
export function safeSourceUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || url.search ||
      (url.port && url.port !== "443") || !REVIEWED_HOSTS.has(url.hostname)) return null;
    url.hash = "";
    return url.href;
  } catch { return null; }
}

export function classifyStatus(status) {
  if (status >= 200 && status < 300) return "healthy";
  if ([404, 410].includes(status)) return "missing";
  if ([401, 403, 429, 451].includes(status)) return "blocked";
  if ([405, 501].includes(status)) return "unsupported";
  if (status >= 300 && status < 400) return "redirect";
  return "http-error";
}

export function publishedSources(...datasets) {
  const urls = new Set();
  const visit = value => {
    if (Array.isArray(value)) value.forEach(visit);
    else if (value && typeof value === "object") {
      for (const [key, child] of Object.entries(value)) {
        if ((key === "url" || key === "sourceUrl") && typeof child === "string") urls.add(child);
        else visit(child);
      }
    }
  };
  datasets.forEach(visit);
  return [...urls].sort();
}

function cancel(response) {
  // Cancellation itself is not trusted to finish: never consume a PDF/HTML body.
  try { void response.body?.cancel().catch(() => {}); } catch { /* No body / already closed. */ }
}

export async function checkSource(value, { fetchImpl = fetch, timeoutMs = 8_000, signal } = {}) {
  const original = safeSourceUrl(value);
  if (!original) return { url: "[rejected source URL]", outcome: "invalid-url", redirects: 0 };
  // A pre-aborted batch must not create an already-rejected, unobserved promise.
  if (signal?.aborted) return { url: original, outcome: "timeout", redirects: 0 };
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal?.addEventListener("abort", abort, { once: true });
  if (signal?.aborted) abort();
  const timer = setTimeout(abort, timeoutMs);
  let onAbort;
  const aborted = new Promise((_, reject) => {
    onAbort = () => reject(new Error("bounded request aborted"));
    controller.signal.addEventListener("abort", onAbort, { once: true });
    if (controller.signal.aborted) onAbort();
  });
  let redirects = 0;
  let current = original;
  let method = "HEAD";
  try {
    for (;;) {
      if (controller.signal.aborted) return { url: original, outcome: "timeout", redirects };
      const pending = Promise.resolve().then(() => fetchImpl(current, {
        method, redirect: "manual", signal: controller.signal,
        headers: method === "GET" ? { Range: "bytes=0-0" } : {},
      }));
      // Even a fetch adapter that ignores AbortSignal cannot hold up the checker.
      pending.then(response => { if (controller.signal.aborted) cancel(response); }, () => {});
      const response = await Promise.race([pending, aborted]);
      cancel(response);
      const outcome = classifyStatus(response.status);
      if (outcome === "redirect") {
        const location = response.headers.get("location");
        let next = null;
        try { next = location ? safeSourceUrl(new URL(location, current).href) : null; } catch { /* Invalid redirect. */ }
        if (!next) return { url: original, outcome: "unsafe-redirect", status: response.status, redirects };
        if (redirects >= 3) return { url: original, outcome: "redirect-limit", status: response.status, redirects };
        redirects++;
        current = next;
        continue;
      }
      if (outcome === "unsupported" && method === "HEAD") { method = "GET"; continue; }
      return { url: original, outcome, status: response.status, redirects, method };
    }
  } catch {
    return { url: original, outcome: controller.signal.aborted ? "timeout" : "network-error", redirects };
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", abort);
    controller.signal.removeEventListener("abort", onAbort);
  }
}

export async function checkSources(urls, { concurrency = 4, budgetMs = 90_000, ...options } = {}) {
  if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 4 ||
    !Number.isFinite(budgetMs) || budgetMs <= 0 || budgetMs > 90_000 ||
    (options.timeoutMs !== undefined && (!Number.isFinite(options.timeoutMs) || options.timeoutMs <= 0 || options.timeoutMs > 10_000))) {
    throw new Error("Invalid source-check bounds.");
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), budgetMs);
  const results = new Array(urls.length);
  let index = 0;
  try {
    await Promise.all(Array.from({ length: Math.min(concurrency, urls.length) }, async () => {
      for (;;) {
        const item = index++;
        if (item >= urls.length) return;
        results[item] = controller.signal.aborted
          ? { url: safeSourceUrl(urls[item]) ?? "[rejected source URL]", outcome: "budget-exhausted", redirects: 0 }
          : await checkSource(urls[item], { ...options, signal: controller.signal });
      }
    }));
    return results;
  } finally { clearTimeout(timer); }
}

export async function main(args = process.argv.slice(2)) {
  let limit = Infinity;
  let strict = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--strict") strict = true;
    else if (args[i] === "--limit" && /^\d+$/.test(args[i + 1] ?? "")) {
      limit = Number(args[++i]);
      if (limit < 1 || limit > 500) throw new Error("Invalid limit.");
    } else if (args[i] === "--help") {
      console.log("Usage: node scripts/check-sources.mjs [--limit 1..500] [--strict]\nManual only. HEAD, then bounded Range GET for unsupported HEAD; 4 workers, 8s/source, 90s total.\nPublisher failures are report-only unless --strict. No records are modified.");
      return;
    } else throw new Error("Invalid source-check argument.");
  }
  const files = ["curated-records.json", "curated-lenses.json"];
  const data = await Promise.all(files.map(file => readFile(new URL(`../src/data/${file}`, import.meta.url), "utf8").then(JSON.parse)));
  const urls = publishedSources(...data).slice(0, limit);
  // Bad committed URLs are configuration errors, not publisher downtime.
  if (!urls.length || urls.some(url => !safeSourceUrl(url))) throw new Error("Unreviewed or unsafe published source URL.");
  const results = await checkSources(urls);
  for (const result of results) console.log(JSON.stringify(result));
  const summary = results.reduce((counts, result) => ({ ...counts, [result.outcome]: (counts[result.outcome] ?? 0) + 1 }), {});
  console.log(JSON.stringify({ checked: results.length, summary, reportOnly: !strict }));
  if (strict && results.some(result => result.outcome !== "healthy")) process.exitCode = 1;
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  main().catch(() => { console.error("Source checker configuration failed; review arguments and published HTTPS sources. No source values or error bodies logged."); process.exitCode = 1; });
}
