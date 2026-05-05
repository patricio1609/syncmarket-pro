import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration enabling React plugin
export default defineConfig({
  plugins: [react()],
});