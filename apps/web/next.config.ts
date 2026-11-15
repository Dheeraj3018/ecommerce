import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || "https://example.supabase.co").hostname, pathname: "/storage/v1/object/public/product-images/**" }],
    formats: ["image/avif", "image/webp"],
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
