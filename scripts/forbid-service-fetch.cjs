// Test-only tripwire: any service fetch from the demo app fails locally.
// Do not print URLs, headers, or payloads, which can contain credentials.
process.stderr.write("WCL_SERVICE_FETCH_TRIPWIRE_ACTIVE\n");
globalThis.fetch = async function forbiddenServiceFetch() {
  process.stderr.write("WCL_UNEXPECTED_SERVICE_FETCH\n");
  throw new Error("Service fetch forbidden by public-demo test");
};
