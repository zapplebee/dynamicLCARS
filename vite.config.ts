import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:3002",
        changeOrigin: true,
      },
      "/wetty": {
        target: "http://127.0.0.1:3001",
        changeOrigin: true,
        ws: true,
      },
    },
  },
});
