import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@actone/shared"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "k.kakaocdn.net" },
      { protocol: "http", hostname: "k.kakaocdn.net" },
    ],
  },
};

export default nextConfig;
