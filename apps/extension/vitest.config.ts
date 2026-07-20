import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        include: ["src/**/*.test.ts"],
        // Files that import `vscode` cannot run here — `vscode` is only
        // injected at runtime by the real Extension Host. Those belong in
        // the @vscode/test-cli / @vscode/test-electron suite instead.
        exclude: ["node_modules", "dist", "src/listeners/**/*.test.ts"],
        environment: "node"
    }
});