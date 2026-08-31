import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cho phép mọi IP trong dải mạng LAN phổ biến truy cập dev server
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "172.16.*.*"],
};

export default nextConfig;
