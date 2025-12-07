import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { execSync } from "child_process";

// Get git short hash for debug panel
const gitHash = (() => {
  try {
    return execSync("git rev-parse --short HEAD").toString().trim();
  } catch {
    return "unknown";
  }
})();

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "env": path.resolve(__dirname, "./src/env-shim.js"),
    },
  },
  define: {
    __GIT_HASH__: JSON.stringify(gitHash),
  },
  build: {
    rollupOptions: {
      external: ["env"],
      output: {
        globals: {
          env: "globalThis.env",
        },
      },
    },
  },
}));
