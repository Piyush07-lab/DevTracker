import { resolve } from "node:path";

export const TestConfig = {
    repositoryRoot: process.env.DEVTRACKER_REPOSITORY_ROOT ?? resolve(import.meta.dirname, "../../../"),

    vscodeExecutable: process.env.VSCODE_EXECUTABLE ?? "code"
};