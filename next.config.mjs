/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverComponentsExternalPackages: ["pdf-parse"],
    },
    webpack: (config) => {
        config.externals = [...config.externals, "bcrypt"];
        return config;
      },
};

export default nextConfig;
