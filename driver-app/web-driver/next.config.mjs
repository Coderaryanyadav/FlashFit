const nextConfig = {
    output: 'export',
    reactStrictMode: true,
    swcMinify: true,
    transpilePackages: ['@flashfit/core'],
    images: {
        unoptimized: true,
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
            }
        ],
        dangerouslyAllowSVG: true,
    },
};

export default nextConfig;
