import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  outputFileTracingExcludes: {
    "/*": [
      "./.data/**/*",
      "./.data-tests/**/*",
      "./.local-admin.txt",
      "./.env*",
    ],
  },
};

export default nextConfig;
