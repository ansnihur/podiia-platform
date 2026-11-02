/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@podiia/brand'],
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com' }],
  },
};
export default nextConfig;
