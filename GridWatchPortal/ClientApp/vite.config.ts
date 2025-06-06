import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:5141",
        changeOrigin: true,
        secure: false,
      },
      "/deviceapi": {
        target: "http://localhost:5224",
        changeOrigin: true,
        secure: false,
      },
      "/adxapi": {
        target: "http://localhost:5257",
        changeOrigin: true,
        secure: false,
      },
      "/config.json": {
        target: "http://localhost:5141",
        changeOrigin: true,
        secure: false,
      },
    },
    hmr: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: [
      "highcharts",
      "highcharts/modules/exporting",
      "highcharts/modules/export-data",
      "highcharts/modules/full-screen"
    ],
  },
});
