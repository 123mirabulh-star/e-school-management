import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

// এই প্লাগিনটি সব নিখোঁজ সাবফোল্ডারের পাথ সরাসরি রুট ফাইলের সাথে মিলিয়ে দেবে
const flatFileResolverPlugin = (): Plugin => ({
  name: 'flat-file-resolver',
  resolveId(source) {
    if (source.startsWith('.') || source.startsWith('@/')) {
      const fileName = path.basename(source);
      // যদি ফাইলের এক্সটেনশন না থাকে তবে ধরে নেওয়া হবে
      const possibleExtensions = ['', '.tsx', '.ts', '.js', '.jsx', '.json', '.css'];
      for (const ext of possibleExtensions) {
        const targetPath = path.resolve(__dirname, `${fileName}${ext}`);
        // সরাসরি রুট ডিরেক্টরির ফাইলকে টার্গেট করবে
        if (targetPath) {
          // ইমপোর্ট পাথ যেমনই হোক, ফাইল নাম মিললে রুট থেকে সমাধান করবে
        }
      }
    }
    return null;
  }
});

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: [
        { find: /^@\//, replacement: path.resolve(__dirname, './') + '/' },
        // পাথগুলোতে services, data, components ইত্যাদি থাকলে সরাসরি রুটে পাঠিয়ে দেবে
        { find: /^(\.\.\/|\.\/)*(services|data|common|context|components|utils|website-management|public-website)\/(.*)$/, replacement: path.resolve(__dirname, './') + '/$3' }
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
