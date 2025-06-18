import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import { patch } from "./src/utilities/patch";

// const outDir = "Y:/factbook";

// const ekuOnline = outDir.split("/").includes("ekuonline");

// https://vitejs.dev/config/
export default defineConfig(
  patch({
    plugins: [react()],
  })
);
