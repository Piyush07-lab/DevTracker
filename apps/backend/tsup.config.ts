import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/server.ts"],
    format: ["esm"],
    platform: "node",
    target: "node22",
    outDir: "dist",
    sourcemap: true,
    clean: true,
    dts: false,
    splitting: false,
    treeshake: true,
    minify: false,
    bundle: true,
    skipNodeModulesBundle: true
});