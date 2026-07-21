import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./src/__tests__/setup.ts"],
    include: ["src/__tests__/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@config": path.resolve(__dirname, "src/config"),
      "@controllers": path.resolve(__dirname, "src/controllers"),
      "@middlewares": path.resolve(__dirname, "src/middlewares"),
      "@models": path.resolve(__dirname, "src/models"),
      "@routes": path.resolve(__dirname, "src/routes"),
      "@services": path.resolve(__dirname, "src/services"),
      "@validators": path.resolve(__dirname, "src/validators"),
      "@utils": path.resolve(__dirname, "src/utils"),
      "@sockets": path.resolve(__dirname, "src/sockets"),
    },
  },
});
