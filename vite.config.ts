import path from 'node:path';
import { crx, CrxPlugin } from '@crxjs/vite-plugin';
import { defineConfig, ResolvedConfig } from 'vite';
import zip from 'vite-plugin-zip-pack';
import manifest from './manifest.config.js';
import { name, version } from './package.json';

const port = 5173;

export default defineConfig(({ command, mode }) => ({
  resolve: {
    alias: {
      '@': `${path.resolve(__dirname, 'src')}`,
    },
  },
  plugins: [
    crx({
      manifest: manifest(command === 'serve' ? port : undefined),
      browser: mode === 'firefox' ? 'firefox' : 'chrome',
    }),
    zip({ outDir: 'release', outFileName: `crx-${name}-${version}.zip` }),
  ],
  server: {
    cors: {
      origin: [/chrome-extension:\/\//],
    },
    port: port,
  },
  // https://getbootstrap.com/docs/5.3/getting-started/vite/#configure-vite
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: [
          'import',
          'color-functions',
          'global-builtin',
          'if-function',
        ],
      },
    },
  },
}));
