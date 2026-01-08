import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "127.0.0.1",
    "localhost",
    "*.app.github.dev",
    "*.github.dev",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "baserow-production-9f1c.up.railway.app",
        pathname: "/media/**",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
        pathname: "/api/**",
      },
    ],
  },
};

export default nextConfig;
