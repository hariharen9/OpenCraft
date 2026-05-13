import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import electron from "vite-plugin-electron/simple";

export default defineConfig({
  base: process.env.ELECTRON === "true" ? "./" : "/",
  plugins: [
    TanStackRouterVite({ autoCodeSplitting: true }),
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    viteReact(),
    process.env.ELECTRON === "true" && electron({
      main: {
        entry: "electron/main.ts",
      },
      preload: {
        input: "electron/preload.ts",
      },
    }),
  ],
  server: {
    host: "::",
    port: 8543,
    strictPort: true,
  },
});
