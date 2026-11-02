import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

// Compile TypeScript using the installed compiler; Node's runner needs no new dependency.
const output = mkdtempSync(join(tmpdir(), "world-cup-lens-tests-"));
try {
  const compile = spawnSync(process.execPath, ["node_modules/typescript/bin/tsc", "-p", "tsconfig.test.json", "--outDir", output], { stdio: "inherit" });
  if (compile.error) throw compile.error;
  if (compile.status !== 0) process.exitCode = compile.status ?? 1;
  else {
    const tests = spawnSync(process.execPath, ["--test", join(output, "tests/replay.test.js")], { stdio: "inherit" });
    if (tests.error) throw tests.error;
    process.exitCode = tests.status ?? 1;
  }
} finally {
  rmSync(output, { recursive: true, force: true });
}
