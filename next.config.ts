import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    // Ensure Turbopack uses this folder as root when multiple lockfiles exist in workspace
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
