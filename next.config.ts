import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Explicit CI advisory checks own security monitoring. Disable development
  // reminder registry probes so startup/tests remain deterministic and offline.
  experimental: { agentUpgrade: false },
};

export default nextConfig;
