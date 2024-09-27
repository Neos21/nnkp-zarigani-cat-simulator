import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue()
  ],
  server: {
    proxy: {
      '^/api': {
        target: 'http://localhost:5000',  // バックエンドの開発用サーバのポートを指定する
        changeOrigin: true  // 参考 : https://zenn.dev/kouschatten/scraps/d8e11adf870d78
      },
      '^/public/images': {
        target: 'http://localhost:5000',  // バックエンドの開発用サーバのポートを指定する
        changeOrigin: true
      },
    }
  }
});
