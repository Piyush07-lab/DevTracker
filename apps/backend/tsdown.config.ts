import { defineConfig } from "tsdown";

export default defineConfig({
    entry: ["src/server.ts"],
    format: ["esm"],
    platform: "node",
    target: "node22",
    outDir: "dist",
    sourcemap: true,
    clean: true,
    dts: false,
    treeshake: true,
    minify: false,
    deps: {
        neverBundle: true
    }
});