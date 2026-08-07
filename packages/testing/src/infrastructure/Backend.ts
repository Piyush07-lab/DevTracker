import type { IBackend } from "../contracts/index.js";
import { HttpClient } from "./HttpClient.js";
import { Process } from "./Process.js";

export interface BackendOptions {
    cwd: string;
    port?: number;
    http?: HttpClient;
}

export class Backend implements IBackend {
    private readonly process: Process;
    private readonly http: HttpClient;
    private readonly url: URL;

    constructor(
        options: BackendOptions
    ) {
        const port = options.port ?? 3000;

        this.url = new URL(`http://localhost:${port}`);

        this.http = new HttpClient();

        this.process = new Process({
            command: process.platform === "win32"
                ? "pnpm.cmd"
                : "pnpm",
            args: [
                "--filter",
                "@devtracker/backend",
                "dev"
            ],
            cwd: options.cwd,
            env: {
                ...process.env,
                PORT: String(port)
            }
        });
    }

    async start(): Promise<void> {
        await this.process.start();
    }

    async stop(): Promise<void> {
        await this.process.stop();
    }

    async waitUntilReady(): Promise<void> {
        await this.http.waitUntilHealthy(
            new URL("/health", this.url)
        );
    }

    isRunning(): boolean {
        return this.process.isRunning();
    }

    getUrl(): URL {
        return this.url;
    }
}