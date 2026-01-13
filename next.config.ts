import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    reactStrictMode: false,
    images: {
        remotePatterns: [
            {
                protocol: 'http', // Use 'http' for local development
                hostname: 'localhost',
                // port: 'YOUR_PORT_NUMBER', // E.g., '1337', '8000', or leave as '' if using standard port (e.g., 80)
                pathname: '/**' // Allows any path
            },
        ],
        localPatterns: [
            {
                pathname: '/**',
                search: '',
            },
        ],
    },
};

export default nextConfig;
