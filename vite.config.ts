import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react()
  ],
  server: {
    port: 5173,
    host: true,
    // HMR config for tunnel services (comment out for local dev)
    // hmr: {
    //   clientPort: 443
    // },
    allowedHosts: ['.lhr.life', '.localhost.run']
  }
});