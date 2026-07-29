import baseConfig from "../../tsdown.config.ts";

export default ({
    ...baseConfig,
    entry: ["src/server.ts"],
    format: ["esm"],
    platform: "node",
    outDir: "dist",
    dts: false,
    minify: false,
    deps: {
        neverBundle: [],
    }
});