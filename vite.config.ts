import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import Components from 'unplugin-vue-components/vite'; // 1. Import the plugin
import lucideIconExtractor from './plugins/vite-lucide-icon-extractor';

export default defineConfig({
  plugins: [
    vue(),
    lucideIconExtractor(),
    Components({
      dirs: ['src/components'],
      directoryAsNamespace: false,
      dts: true,
      extensions: ['vue'],
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  },
  server: {
    port: 8081,
  },
  build: {
    chunkSizeWarningLimit: 1600
  }
});
