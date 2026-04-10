import { defineConfig } from 'vite'
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { nodePolyfills } from 'vite-plugin-node-polyfills';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
  tailwindcss(),
  // basicSsl(), // Desactivado para dev local, activar para Telegram Mini App
  // Copiar index.html como 404.html para SPA routing en GitHub Pages
  {
    name: 'copy-404',
    closeBundle() {
      const out = path.resolve(__dirname, 'docs');
      fs.copyFileSync(path.join(out, 'index.html'), path.join(out, '404.html'));
    }
  },
  nodePolyfills({
    include: ['buffer', 'crypto', 'stream', 'util', 'process'],
    globals: {
      Buffer: true,
      global: true,
      process: true,
    },
  })
  ],
  resolve:{
    alias: {
      '@': path.resolve(__dirname, './src'),
      'vite-plugin-node-polyfills/shims/buffer': path.resolve(__dirname, 'node_modules/vite-plugin-node-polyfills/shims/buffer'),
      'vite-plugin-node-polyfills/shims/global': path.resolve(__dirname, 'node_modules/vite-plugin-node-polyfills/shims/global'),
      'vite-plugin-node-polyfills/shims/process': path.resolve(__dirname, 'node_modules/vite-plugin-node-polyfills/shims/process'),
    },
  },
  build: {
    outDir: './docs',
  },
  
  base: process.env.NODE_ENV === 'production' ? '/cryptolottery/' : '/',
  
})
