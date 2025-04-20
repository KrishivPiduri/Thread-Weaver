import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { VitePluginRadar } from 'vite-plugin-radar'

export default defineConfig({
  plugins: [
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
    VitePluginRadar({
      // Google Analytics tag injection
      analytics: {
        id: 'G-VW77CSJRBW',
      },
    })
  ],
  build: {
    outDir: 'dist', // or 'build/client' if you want, just be consistent
  },
});
