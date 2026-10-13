import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/deployment.json': {target: 'https://shimopay-demo.vercel.app', changeOrigin: true, rewrite: () => '/api/mobile-backend?resource=deployment'},
      '/api/solana-demo': {target: 'https://shimopay-demo.vercel.app', changeOrigin: true, rewrite: () => '/api/mobile-backend?resource=solana'},
      '/api/pix': {target: 'https://shimopay-demo.vercel.app', changeOrigin: true, rewrite: () => '/api/mobile-backend?resource=pix'},
    },
  },
  preview: {
    allowedHosts: ["shimopay-crudv1-jgfbe.ondigitalocean.app"],
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
