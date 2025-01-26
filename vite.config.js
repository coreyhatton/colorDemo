import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
  css: {
    modules: {
      localsConvention: "camelCase",
      generateScopedName: "[name]__[local]__[hash:base64:5]",
    },
  },
  build: {
    target: ["es2020", "chrome120", "firefox117", "edge120", "safari17.2"],
  },
  base: "/colorDemo/", // Set the base URL for your GitHub Pages site
  plugins: [react(), tsconfigPaths()],
});
