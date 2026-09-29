import type { NextConfig } from "next";

// Root site (<org>.github.io): leave NEXT_PUBLIC_BASE_PATH unset.
// Project site (<org>.github.io/<repo>/): build with NEXT_PUBLIC_BASE_PATH=/<repo>.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  ...(basePath ? { basePath, assetPrefix: `${basePath}/` } : {}),
};

export default nextConfig;
