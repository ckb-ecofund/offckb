/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    config.resolve.fallback = {
      ...config.resolve.fallback,

      fs: false, // simple workaround for the lumos.hd.keystore fs not found problem
    };

    return config;
  },
};

export default nextConfig;
