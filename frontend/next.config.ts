import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Generate a fully static build in the `out/` directory.
  // FastAPI (the backend) will serve these static files in production.
  output: 'export',
  // Ensures each route produces route/index.html (required for static file serving)
  trailingSlash: true,
};

export default nextConfig;
