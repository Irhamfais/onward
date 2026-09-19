/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Disable eslint check during build as project uses typescript type checking
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
