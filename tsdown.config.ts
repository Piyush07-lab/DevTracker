
import { defineConfig } from "tsdown";

export default defineConfig({
    clean: true,

    format: ["esm"],

    dts: true,

    sourcemap: true,

    treeshake: true,

    target: "node22",
});