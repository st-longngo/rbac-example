import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    authInterrupts: true, // Enables unauthorized() and forbidden() from next/navigation
  },
};

export default nextConfig;
