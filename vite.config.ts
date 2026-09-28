import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

const serveDevHtmlPlugin = (): Plugin => ({
  name: 'serve-dev-html',
  transformIndexHtml(html, ctx) {
    if (ctx?.server) {
      return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>JyotishVeda Kundli &amp; Panchang Engine</title>
    <meta name="description" content="Production Vedic astrology platform featuring high-precision Swiss Ephemeris Kundli, divisional vargas, Vimshottari dashas, dosha analysis, Ashtakoota compatibility, and swappable Prokerala Panchang integration." />
    <meta property="og:title" content="JyotishVeda Kundli &amp; Panchang Engine" />
    <meta property="og:description" content="Production Vedic astrology platform featuring high-precision Swiss Ephemeris Kundli, divisional vargas, Vimshottari dashas, dosha analysis, Ashtakoota compatibility, and swappable Prokerala Panchang integration." />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="icon" type="image/svg+xml" href="./favicon.svg" />
    <link rel="icon" href="./favicon.ico" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;
    }
    return html;
  },
});

export default defineConfig(() => {
  return {
    base: './',
    plugins: [serveDevHtmlPlugin(), react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/v1': {
          target: 'http://127.0.0.1:8001',
          changeOrigin: true,
        },
      },
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
