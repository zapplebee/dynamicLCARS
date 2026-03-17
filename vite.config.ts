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
        target: "http://127.0.0.1:1701",
        changeOrigin: true,
      },
      "/terminal": {
        target: "http://127.0.0.1:1701",
        changeOrigin: true,
        ws: true,
      },
    },
  },
});
