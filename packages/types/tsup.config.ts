import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/index.ts"],
    // Root package.json has "type": "module", so tsup automatically
    // names the CJS build with a .cjs extension (and ESM stays .js) —
    // this is what lets both formats coexist without a nested
    // dist/cjs/package.json override. See DC-2/DC-4 module-format notes.
    format: ["esm", "cjs"],
    dts: true,
    clean: true,
    sourcemap: true,
    // Keep the shared workspace deps external rather than bundled —
    // this package only re-exports interfaces/types today, but if it
    // ever pulls in a runtime dependency, we don't want two copies of
    // it duplicated into both the esm and cjs output.
    external: []
});