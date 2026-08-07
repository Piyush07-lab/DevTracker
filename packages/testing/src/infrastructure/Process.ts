import {
    spawn,
    type ChildProcess
} from "node:child_process";

import type { IProcess } from "../contracts/index.js";

export interface ProcessOptions {
    command: string;
    args: readonly string[];
    cwd?: string;
    env?: NodeJS.ProcessEnv;
    shell?: boolean;
}

export class Process implements IProcess {
    private readonly options: ProcessOptions;

    private child?: ChildProcess | undefined;
    private running = false;

    private readonly stdoutBuffer: string[] = [];
    private readonly stderrBuffer: string[] = [];

    constructor(options: ProcessOptions) {
        this.options = {
            ...options,
            args: options.args ?? [],
            env: options.env ?? process.env,
            shell: options.shell ?? false
        };
    }

    async start(): Promise<void> {
        if (this.running) {
            throw new Error("Process is already running.");
        }

        await new Promise<void>((resolve, reject) => {
            const child = spawn(
                this.options.command,
                this.options.args,
                {
                    cwd: this.options.cwd,
                    env: this.options.env,
                    shell: this.options.shell,
                    stdio: ["ignore", "pipe", "pipe"]
                }
            );

            this.child = child;

            child.once("spawn", () => {
                this.running = true;
                resolve();
            });

            child.once("error", (error) => {
                this.running = false;
                reject(error);
            });

            child.once("exit", () => {
                this.running = false;
            });

            child.stdout?.on("data", (data: Buffer) => {
                this.stdoutBuffer.push(data.toString());
            });

            child.stderr?.on("data", (data: Buffer) => {
                this.stderrBuffer.push(data.toString());
            });
        });
    }

    async stop(): Promise<void> {
        if (!this.child) {
            return;
        }

        const child = this.child;

        if (child.exitCode !== null || child.signalCode !== null) {
            this.running = false;
            this.child = undefined;
            return;
        }

        await new Promise<void>((resolve) => {

            // eslint-disable-next-line prefer-const
            let timer: ReturnType<typeof setTimeout>;

            const cleanup = () => {
                clearTimeout(timer);

                child.removeListener("exit", cleanup);

                this.running = false;
                this.child = undefined;

                resolve();
            };

            child.once("exit", cleanup);

            if (process.platform === "win32" && child.pid !== undefined) {
                // Windows commands can create child processes. Terminate the
                // complete tree so they are not left running after stop().
                spawn("taskkill", [
                    "/pid",
                    String(child.pid),
                    "/t",
                    "/f"
                ], { stdio: "ignore" });
            } else {
                child.kill("SIGTERM");
            }

            timer = setTimeout(() => {
                if (child.exitCode === null) {
                    child.kill("SIGKILL");
                }
            }, 5000);
        });
    }

    async waitForExit(): Promise<number | null> {
        if (!this.child) {
            return null;
        }

        return await new Promise<number | null>((resolve) => {
            this.child!.once("exit", (code) => {
                resolve(code);
            });
        });
    }

    isRunning(): boolean {
        return this.running;
    }

    stdout(): string {
        return this.stdoutBuffer.join("");
    }

    stderr(): string {
        return this.stderrBuffer.join("");
    }
}
