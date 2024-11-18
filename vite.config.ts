import { defineConfig } from "vite"
import MillionLint from "@million/lint"
import react from "@vitejs/plugin-react-swc"
import UnoCSS from "unocss/vite"
import Pages from "vite-plugin-pages"
import basicSsl from "@vitejs/plugin-basic-ssl"

export default defineConfig({
  plugins: [
    MillionLint.vite(),
    react(),
    UnoCSS(),
    Pages({ extensions: ["tsx"], importMode: "async" }),
    basicSsl()
  ],
  build: {
    commonjsOptions: { transformMixedEsModules: true }
  },
  server: {
    proxy: {
      "/api": "http://localhost:3000"
    }
  }
})
