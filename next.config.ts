import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  async headers() {
    return [{ source: "/:path*", headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ] }];
  },
  outputFileTracingExcludes: {
    "/*": [
      "./.data/**/*",
      "./.data-tests/**/*",
      "./.local-admin.txt",
      "./.env*",
      "./api key*",
    ],
  },
};

export default nextConfig;
