import { defineConfig } from 'vite';

// GitHub Actions supplies VITE_BASE_PATH from the repository name. Locally the
// site lives at the root, so normal `npm run dev` needs no special settings.
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  // Arena's preview is served from a proxied .e2b.app host; allow the request
  // host in development and production preview servers.
  server: { host: '0.0.0.0', allowedHosts: true },
  preview: { host: '0.0.0.0', allowedHosts: true },
  build: {
    assetsInlineLimit: 4096,
    sourcemap: false,
    chunkSizeWarningLimit: 750,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/node_modules/three/')) return 'vendor-three';
          if (id.includes('/node_modules/gsap/')) return 'vendor-gsap';
          if (id.includes('/node_modules/lenis/')) return 'vendor-lenis';
          if (id.includes('/node_modules/@fontsource-variable/')) return 'vendor-fonts';
        },
      },
    },
  },
});
