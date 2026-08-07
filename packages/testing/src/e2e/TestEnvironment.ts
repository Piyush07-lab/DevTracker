import { join } from "node:path";
import { Backend } from "../infrastructure/Backend.js";
import { ExtensionHost } from "../infrastructure/ExtensionHost.js";
import { Workspace } from "../infrastructure/Workspace.js";

export interface TestEnvironmentOptions {
    repositoryRoot: string;
    // extensionPath: string;
    vscodeExecutable: string;
    backendPort?: number;
}

export class TestEnvironment {
    private readonly workspace = new Workspace();

    private readonly backend: Backend;
    private extensionHost!: ExtensionHost;

    private readonly extensionPath: string;
    private readonly vscodeExecutable: string;

    constructor(options: TestEnvironmentOptions) {
        this.backend = new Backend({
            cwd: options.repositoryRoot,
            ...(options.backendPort !== undefined && { port: options.backendPort })
        });

        this.extensionPath = join(
            options.repositoryRoot,
            "apps",
            "extension"
        );
        this.vscodeExecutable = options.vscodeExecutable;
    }

    async start(): Promise<void> {
        await this.workspace.create();

        await this.workspace.createDirectory(".vscode");

        this.extensionHost = new ExtensionHost({
            workspaceRoot: this.workspace.root(),
            extensionPath: this.extensionPath,
            vscodeExecutable: this.vscodeExecutable
        });

        await this.backend.start();

        try {
            await this.backend.waitUntilReady();

            await this.extensionHost.start();
        } catch (error) {
            await this.stop();
            throw error;
        }
    }

    async stop(): Promise<void> {
        if (this.extensionHost) {
            await this.extensionHost.stop();
        }

        await this.backend.stop();
        await this.workspace.dispose();
    }

    workspaceRoot(): string {
        return this.workspace.root();
    }

    backendUrl(): URL {
        return this.backend.getUrl();
    }

    backendRunning(): boolean {
        return this.backend.isRunning();
    }

    extensionRunning(): boolean {
        return this.extensionHost.isRunning();
    }

    extensionStdout(): string {
        return this.extensionHost.stdout();
    }

    extensionStderr(): string {
        return this.extensionHost.stderr();
    }

}