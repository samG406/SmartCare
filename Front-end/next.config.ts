import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Use this app's lockfile; avoid picking up C:\Users\gajul\package-lock.json
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
