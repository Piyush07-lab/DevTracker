import { resolve } from "node:path";

import type { IExtensionHost } from "../contracts/index.js";
import { Process } from "./Process.js";

export interface ExtensionHostOptions {
    workspaceRoot: string;
    extensionPath: string;
    vscodeExecutable: string;
}

export class ExtensionHost implements IExtensionHost {
    private readonly process: Process;

    constructor(options: ExtensionHostOptions) {
        this.process = new Process({
            command: options.vscodeExecutable,
            args: [
                "--extensionDevelopmentPath=" +
                resolve(options.extensionPath),

                resolve(options.workspaceRoot)
            ],
            // The VS Code `code` launcher resolves to a .cmd shim on Windows.
            shell: process.platform === "win32"
        });
    }

    async start(): Promise<void> {
        await this.process.start();
    }

    async stop(): Promise<void> {
        await this.process.stop();
    }

    isRunning(): boolean {
        return this.process.isRunning();
    }

    stdout(): string {
        return this.process.stdout();
    }

    stderr(): string {
        return this.process.stderr();
    }
}
