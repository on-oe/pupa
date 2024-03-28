import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { crx } from "@crxjs/vite-plugin";
import manifest from "./manifest.json";

const rootDir = resolve(__dirname);
const srcDir = resolve(rootDir, "src");

export default defineConfig({
  resolve: {
    alias: {
      "@shared": resolve(srcDir, "shared"),
      "@host": resolve(srcDir, "host"),
    },
  },
  plugins: [react(), crx({ manifest })],
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      port: 5173,
    },
  },
});
