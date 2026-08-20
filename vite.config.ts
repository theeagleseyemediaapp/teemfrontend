// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  nitro: true,
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    server: {
      proxy: {
        "/api": {
          target: "http://localhost:8787",
          changeOrigin: true,
          secure: false,
        },
        "/healthz": {
          target: "http://localhost:8787",
          changeOrigin: true,
          secure: false,
        },
        "/readyz": {
          target: "http://localhost:8787",
          changeOrigin: true,
          secure: false,
        },
        "/.well-known": {
          target: "http://localhost:8787",
          changeOrigin: true,
          secure: false,
        },
      },
    },
  },
});
