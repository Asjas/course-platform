import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { defineConfig } from "vite";

// import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    // VitePWA({
    //   injectRegister: "inline",
    //   registerType: "autoUpdate",
    //   manifestFilename: "manifest.json",
    //   workbox: {
    //     globPatterns: ["**/*.{js,css,html,ico,png,svg}", "manifest.json"],
    //     clientsClaim: true,
    //     skipWaiting: true,
    //     cleanupOutdatedCaches: true,
    //   },
    //   manifest: {
    //     short_name: "Codewizard Training",
    //     name: "Codewizard Training",
    //     icons: [
    //       {
    //         src: "favicon.ico",
    //         sizes: "64x64 32x32 24x24 16x16",
    //         type: "image/x-icon",
    //       },
    //       {
    //         src: "logo192.png",
    //         type: "image/png",
    //         sizes: "192x192",
    //       },
    //       {
    //         src: "logo512.png",
    //         type: "image/png",
    //         sizes: "512x512",
    //       },
    //     ],
    //     start_url: ".",
    //     display: "standalone",
    //     theme_color: "#000000",
    //     background_color: "#ffffff",
    //   },
    // }),
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
      quoteStyle: "double",
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "~": resolve(__dirname, "./src"),
    },
  },
});
