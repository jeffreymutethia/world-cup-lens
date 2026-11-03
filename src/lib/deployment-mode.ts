export type DeploymentMode = "demo-only" | "archive-enabled";

// Safe default for absent or misspelled configuration. Never use NEXT_PUBLIC_.
export function deploymentMode(value = process.env.WCL_DEPLOYMENT_MODE): DeploymentMode {
  return value === "archive-enabled" ? "archive-enabled" : "demo-only";
}

export function authoringDisabled() {
  return deploymentMode() === "demo-only";
}
