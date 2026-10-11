import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Clip file names are content hashes (lib/audio/key.ts): a changed text gets
  // a new URL, so an existing URL never changes and can be cached forever.
  async headers() {
    return [
      {
        source: "/audio/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
