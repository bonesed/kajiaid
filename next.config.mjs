/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    webpackBuildWorker: true,
    // 以下の2行を削除
    // parallelServerBuildTraces: true,
    // parallelServerCompiles: true,
  }
}

export default nextConfig
