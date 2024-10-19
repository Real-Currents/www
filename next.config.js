/** @type {import('next').NextConfig} */
const nextConfig = {
    "distDir": "out",
    "output": "export", // <=== enables static exports
    // "output": "standalone",
    "reactStrictMode": true
};

export default nextConfig;
