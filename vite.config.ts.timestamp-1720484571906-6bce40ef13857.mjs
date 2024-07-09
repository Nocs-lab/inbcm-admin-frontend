// vite.config.ts
import { defineConfig } from "file:///D:/thiago/Documents/IFRN/INBCM/Desenvolvimento/inbcm-admin-frontend/node_modules/.pnpm/vite@5.3.1/node_modules/vite/dist/node/index.js";
import react from "file:///D:/thiago/Documents/IFRN/INBCM/Desenvolvimento/inbcm-admin-frontend/node_modules/.pnpm/@vitejs+plugin-react-swc@3.7.0_vite@5.3.1/node_modules/@vitejs/plugin-react-swc/index.mjs";
import UnoCSS from "file:///D:/thiago/Documents/IFRN/INBCM/Desenvolvimento/inbcm-admin-frontend/node_modules/.pnpm/unocss@0.60.4_postcss@8.4.38_vite@5.3.1/node_modules/unocss/dist/vite.mjs";
import Pages from "file:///D:/thiago/Documents/IFRN/INBCM/Desenvolvimento/inbcm-admin-frontend/node_modules/.pnpm/vite-plugin-pages@0.32.3_react-router@6.24.0_vite@5.3.1/node_modules/vite-plugin-pages/dist/index.js";
import basicSsl from "file:///D:/thiago/Documents/IFRN/INBCM/Desenvolvimento/inbcm-admin-frontend/node_modules/.pnpm/@vitejs+plugin-basic-ssl@1.1.0_vite@5.3.1/node_modules/@vitejs/plugin-basic-ssl/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [
    // MillionLint.vite(),
    // million.vite({ auto: true }),
    react(),
    UnoCSS(),
    Pages({ extensions: ["tsx"] }),
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
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFx0aGlhZ29cXFxcRG9jdW1lbnRzXFxcXElGUk5cXFxcSU5CQ01cXFxcRGVzZW52b2x2aW1lbnRvXFxcXGluYmNtLWFkbWluLWZyb250ZW5kXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFx0aGlhZ29cXFxcRG9jdW1lbnRzXFxcXElGUk5cXFxcSU5CQ01cXFxcRGVzZW52b2x2aW1lbnRvXFxcXGluYmNtLWFkbWluLWZyb250ZW5kXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi90aGlhZ28vRG9jdW1lbnRzL0lGUk4vSU5CQ00vRGVzZW52b2x2aW1lbnRvL2luYmNtLWFkbWluLWZyb250ZW5kL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIlxyXG4vLyBpbXBvcnQgbWlsbGlvbiBmcm9tIFwibWlsbGlvbi9jb21waWxlclwiXHJcbi8vIGltcG9ydCBNaWxsaW9uTGludCBmcm9tIFwiQG1pbGxpb24vbGludFwiXHJcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djXCJcclxuaW1wb3J0IFVub0NTUyBmcm9tIFwidW5vY3NzL3ZpdGVcIlxyXG5pbXBvcnQgUGFnZXMgZnJvbSBcInZpdGUtcGx1Z2luLXBhZ2VzXCJcclxuaW1wb3J0IGJhc2ljU3NsIGZyb20gXCJAdml0ZWpzL3BsdWdpbi1iYXNpYy1zc2xcIlxyXG5cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICBwbHVnaW5zOiBbXHJcbiAgICAvLyBNaWxsaW9uTGludC52aXRlKCksXHJcbiAgICAvLyBtaWxsaW9uLnZpdGUoeyBhdXRvOiB0cnVlIH0pLFxyXG4gICAgcmVhY3QoKSxcclxuICAgIFVub0NTUygpLFxyXG4gICAgUGFnZXMoeyBleHRlbnNpb25zOiBbXCJ0c3hcIl0gfSksXHJcbiAgICBiYXNpY1NzbCgpXHJcbiAgXSxcclxuICBidWlsZDoge1xyXG4gICAgY29tbW9uanNPcHRpb25zOiB7IHRyYW5zZm9ybU1peGVkRXNNb2R1bGVzOiB0cnVlIH1cclxuICB9LFxyXG4gIHNlcnZlcjoge1xyXG4gICAgcHJveHk6IHtcclxuICAgICAgXCIvYXBpXCI6IFwiaHR0cDovL2xvY2FsaG9zdDozMDAwXCJcclxuICAgIH1cclxuICB9XHJcbn0pXHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBeVksU0FBUyxvQkFBb0I7QUFHdGEsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sWUFBWTtBQUNuQixPQUFPLFdBQVc7QUFDbEIsT0FBTyxjQUFjO0FBRXJCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQTtBQUFBO0FBQUEsSUFHUCxNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUEsSUFDUCxNQUFNLEVBQUUsWUFBWSxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQUEsSUFDN0IsU0FBUztBQUFBLEVBQ1g7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLGlCQUFpQixFQUFFLHlCQUF5QixLQUFLO0FBQUEsRUFDbkQ7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLE9BQU87QUFBQSxNQUNMLFFBQVE7QUFBQSxJQUNWO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
