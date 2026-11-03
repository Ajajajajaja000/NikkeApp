import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // 相対パスなら GitHub Pages のサブディレクトリでもそのまま動く。
  base: "./",
  plugins: [react()],
  test: { include: ["tests/**/*.test.ts"] },
});
