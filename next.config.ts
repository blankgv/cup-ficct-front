import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Imagen liviana para Docker.
  output: "standalone",
  // El linteo se corre aparte; no debe frenar el build de producción.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
