import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  build: { copyPublicDir: true, emptyOutDir: true, outDir: "docs" },
  plugins: [react()],
  base: "",
});
