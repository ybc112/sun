import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      // 开发环境把后端 mine 接口代理过去，避免 CORS 与浏览器请求体限制问题
      "/api": {
        target: process.env.VITE_BACKEND_TARGET || "http://localhost:8787",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});