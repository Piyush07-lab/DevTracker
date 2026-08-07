import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";

import { afterEach, describe, expect, it } from "vitest";

import { Workspace } from "./Workspace.js";

describe("Workspace", () => {
    let workspace: Workspace;

    afterEach(async () => {
        if (workspace) {
            await workspace.dispose();
        }
    });

    it("creates a temporary workspace", async () => {
        workspace = new Workspace();

        await workspace.create();

        await expect(
            access(workspace.root(), constants.F_OK)
        ).resolves.toBeUndefined();
    });

    it("creates directories", async () => {
        workspace = new Workspace();

        await workspace.create();
        await workspace.createDirectory("src/utils");

        await expect(
            access(
                `${workspace.root()}/src/utils`,
                constants.F_OK
            )
        ).resolves.toBeUndefined();
    });

    it("creates files with content", async () => {
        workspace = new Workspace();

        await workspace.create();

        await workspace.createFile(
            "src/index.ts",
            "export const value = 42;"
        );

        const contents = await readFile(
            `${workspace.root()}/src/index.ts`,
            "utf8"
        );

        expect(contents).toBe("export const value = 42;");
    });

    it("returns the workspace root", async () => {
        workspace = new Workspace();

        await workspace.create();

        expect(workspace.root()).toContain("devtracker-e2e-");
    });

    it("throws if root() is called before create()", () => {
        workspace = new Workspace();

        expect(() => workspace.root()).toThrow(
            "Workspace has not been created."
        );
    });

    it("throws if createDirectory() is called before create()", async () => {
        workspace = new Workspace();

        await expect(
            workspace.createDirectory("src")
        ).rejects.toThrow(
            "Workspace has not been created."
        );
    });

    it("throws if createFile() is called before create()", async () => {
        workspace = new Workspace();

        await expect(
            workspace.createFile("index.ts")
        ).rejects.toThrow(
            "Workspace has not been created."
        );
    });

    it("disposes the workspace", async () => {
        workspace = new Workspace();

        await workspace.create();

        const root = workspace.root();

        await workspace.dispose();

        await expect(
            access(root, constants.F_OK)
        ).rejects.toThrow();
    });

    it("dispose() is safe to call multiple times", async () => {
        workspace = new Workspace();

        await workspace.create();

        await workspace.dispose();

        await expect(
            workspace.dispose()
        ).resolves.toBeUndefined();
    });
});