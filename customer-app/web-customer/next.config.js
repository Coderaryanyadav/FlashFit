/** @type {import('next').NextConfig} */
const nextConfig = {
  // Force restart 1
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ['@flashfit/core'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
    ],
    dangerouslyAllowSVG: true,
  },
}

module.exports = nextConfig
