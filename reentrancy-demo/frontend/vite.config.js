import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The dev server runs on :5173 by default. It talks to the Hardhat node on
// :8545 directly from the browser via ethers, so no proxy is required.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: false,
  },
});
