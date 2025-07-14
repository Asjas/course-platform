import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { defineConfig } from "vite";
import { createProductionServerPlugin } from "vite-create-production-server-plugin";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    VitePWA({
      injectRegister: "inline",
      registerType: "autoUpdate",
      manifestFilename: "manifest.json",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}", "manifest.json"],
        clientsClaim: true,
        skipWaiting: true,
        cleanupOutdatedCaches: true,
      },
      manifest: {
        short_name: "Codewizard Training",
        name: "Codewizard Training",
        icons: [
          {
            src: "favicon.ico",
            sizes: "64x64",
            type: "image/x-icon",
          },
          {
            src: "logo192.png",
            type: "image/png",
            sizes: "192x192",
          },
          {
            src: "logo512.png",
            type: "image/png",
            sizes: "512x512",
          },
        ],
        start_url: ".",
        display: "standalone",
        theme_color: "#000000",
        background_color: "#ffffff",
      },
    }),
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
      quoteStyle: "double",
    }),
    react(),
    tailwindcss(),
    createProductionServerPlugin(),
  ],
  css: { transformer: "lightningcss" },
  build: { cssMinify: "lightningcss" },
  resolve: {
    alias: {
      "~": resolve(__dirname, "./src"),
    },
  },
});
