// src/infrastructure/Workspace.ts

import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import type { IWorkspace } from "../contracts/index.js";

export class Workspace implements IWorkspace {
    private rootPath?: string | undefined;

    async create(prefix = "devtracker-e2e-"): Promise<void> {
        this.rootPath = await mkdtemp(join(tmpdir(), prefix));
    }

    async createDirectory(relativePath: string): Promise<void> {
        this.ensureCreated();

        await mkdir(
            join(this.rootPath!, relativePath),
            { recursive: true }
        );
    }

    async createFile(
        relativePath: string,
        contents = ""
    ): Promise<void> {

        this.ensureCreated();

        const fullPath = join(this.rootPath!, relativePath);

        await mkdir(
            join(fullPath, ".."),
            { recursive: true }
        );

        await writeFile(fullPath, contents, "utf8");
    }

    root(): string {
        this.ensureCreated();
        return this.rootPath!;
    }

    async dispose(): Promise<void> {
        if (!this.rootPath) {
            return;
        }

        await rm(this.rootPath, {
            recursive: true,
            force: true
        });

        this.rootPath = undefined;
    }

    private ensureCreated(): void {
        if (!this.rootPath) {
            throw new Error("Workspace has not been created.");
        }
    }
}