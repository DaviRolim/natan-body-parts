import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  build: {
    outDir: "dist",
    assetsInlineLimit: 0,
    rollupOptions: {
      input: {
        main: "index.html"
      }
    }
  },
  publicDir: "public",
  server: {
    port: 4174,
    host: true
  },
  preview: {
    port: 4174,
    host: true
  }
});
