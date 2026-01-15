
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // 載入當前環境變數，第三個參數設為 '' 以允許讀取不具備 VITE_ 前綴的變數（如 API_KEY）
  // Fix: Cast process to any to resolve the issue where cwd() is missing from the global Process type definition.
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // 根據指令要求，將環境變數映射至 process.env.API_KEY
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      // 確保資源路徑正確
      assetsDir: 'assets',
    },
    server: {
      port: 3000,
    }
  };
});
