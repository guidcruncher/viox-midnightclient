import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import tailwindcss from "@tailwindcss/vite"; // 1. Import Tailwind v4 plugin
import Components from 'unplugin-vue-components/vite';
import lucideIconExtractor from './plugins/vite-lucide-icon-extractor';

export default defineConfig({
  plugins: [
    tailwindcss(), // 2. Add Tailwind plugin (ideally before vue())
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
