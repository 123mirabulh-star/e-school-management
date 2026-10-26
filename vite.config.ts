import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, Plugin } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// নিখোঁজ ফোল্ডারের পাথ স্বয়ংক্রিয়ভাবে রুট ফাইলের সাথে মিলিয়ে দেওয়ার প্লাগিন
function rootFileFallbackPlugin(): Plugin {
  return {
    name: 'root-file-fallback',
    enforce: 'pre',
    resolveId(source, importer) {
      // শুধুমাত্র রিলেটিভ বা অভ্যন্তরীণ ইমপোর্টগুলো চেক করবে
      if (source.startsWith('.') || source.startsWith('@/')) {
        const baseName = path.basename(source);
        const extensions = ['', '.tsx', '.ts', '.jsx', '.js', '.json', '.css'];

        for (const ext of extensions) {
          const directFile = path.resolve(__dirname, `${baseName}${ext}`);
          if (fs.existsSync(directFile) && !fs.statSync(directFile).isDirectory()) {
            return directFile;
          }
        }
      }
      return null;
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [
      rootFileFallbackPlugin(),
      react(),
      tailwindcss()
    ],
    resolve: {
      alias: [
        { find: /^@\//, replacement: `${__dirname}/` },
        {
          find: /^.*?\/(services|data|common|context|components|utils|website-management|public-website)\/(.*)$/,
          replacement: `${__dirname}/$2`
        }
      ]
    },
    server: {
      host: true,
      allowedHosts: true,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
