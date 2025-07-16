import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path"

// https://vite.dev/config/
export default defineConfig({
  base: "/mis",
  plugins:
  [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // for production
  // build: {
  //   sourcemap: false
  // },

  // if it did not work, create `.env.production` file on the same directory of `.env` file
  // GENERATE_SOURCEMAP=false
})
