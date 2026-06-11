import { defineConfig, loadEnv } from 'vite'
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

// Dual environment:
//   npm run build      -> mode production  -> .env.production  -> docs/      (sitio actual)
//   npm run build:dev  -> mode development -> .env.development -> docs-dev/  (repo cryptolottery-dev)
// Cada build emite su propio tonconnect-manifest.json con la URL del hosting
// (TonConnect exige que el manifest declare el dominio real de la app).
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, __dirname, '');
  const outDir = mode === 'development' ? 'docs-dev' : 'docs';

  return {
    plugins: [react(),
    tailwindcss(),
    // basicSsl(), // Desactivado para dev local, activar para Telegram Mini App
    {
      name: 'emit-manifest-and-404',
      closeBundle() {
        const out = path.resolve(__dirname, outDir);
        // index.html como 404.html para SPA routing en GitHub Pages
        fs.copyFileSync(path.join(out, 'index.html'), path.join(out, '404.html'));
        // Manifest TonConnect por dominio (pisa el de public/)
        const manifest = {
          url: env.VITE_PUBLIC_URL || 'https://esoteldo.github.io/cryptolottery/',
          name: env.VITE_APP_NAME || 'CryptoLottery',
          iconUrl: 'https://raw.githubusercontent.com/niccolden/cryptolottery/master/public/icon.png',
        };
        fs.writeFileSync(path.join(out, 'tonconnect-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
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
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        'vite-plugin-node-polyfills/shims/buffer': path.resolve(__dirname, 'node_modules/vite-plugin-node-polyfills/shims/buffer'),
        'vite-plugin-node-polyfills/shims/global': path.resolve(__dirname, 'node_modules/vite-plugin-node-polyfills/shims/global'),
        'vite-plugin-node-polyfills/shims/process': path.resolve(__dirname, 'node_modules/vite-plugin-node-polyfills/shims/process'),
      },
    },
    build: {
      outDir: `./${outDir}`,
    },

    // `vite` (server local) sirve en /; los builds usan el subpath de su hosting
    base: command === 'serve' ? '/' : (env.VITE_BASE_PATH || '/cryptolottery/'),
  };
})
