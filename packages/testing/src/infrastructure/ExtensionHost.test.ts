import { afterEach, describe, expect, it, vi } from "vitest";
import { resolve } from "node:path";
import { ExtensionHost } from "./ExtensionHost.js";
import { Process } from "./Process.js";

vi.mock("./Process.js");

describe("ExtensionHost", () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    it("starts the extension host", async () => {
        const host = new ExtensionHost({
            workspaceRoot: "/workspace",
            extensionPath: "/extension",
            vscodeExecutable: "code"
        });

        const proc = vi.mocked(Process).mock.instances[0]!;

        await host.start();

        expect(proc.start).toHaveBeenCalledOnce();
    });

    it("stops the extension host", async () => {
        const host = new ExtensionHost({
            workspaceRoot: "/workspace",
            extensionPath: "/extension",
            vscodeExecutable: "code"
        });

        const proc = vi.mocked(Process).mock.instances[0]!;

        await host.stop();

        expect(proc.stop).toHaveBeenCalledOnce();
    });

    it("returns the running state", () => {
        const host = new ExtensionHost({
            workspaceRoot: "/workspace",
            extensionPath: "/extension",
            vscodeExecutable: "code"
        });

        const proc = vi.mocked(Process).mock.instances[0]!;

        vi.mocked(proc.isRunning).mockReturnValue(true);

        expect(host.isRunning()).toBe(true);
    });

    it("returns captured stdout", () => {
        const host = new ExtensionHost({
            workspaceRoot: "/workspace",
            extensionPath: "/extension",
            vscodeExecutable: "code"
        });

        const proc = vi.mocked(Process).mock.instances[0]!;

        vi.mocked(proc.stdout).mockReturnValue("stdout");

        expect(host.stdout()).toBe("stdout");
    });

    it("returns captured stderr", () => {
        const host = new ExtensionHost({
            workspaceRoot: "/workspace",
            extensionPath: "/extension",
            vscodeExecutable: "code"
        });

        const proc = vi.mocked(Process).mock.instances[0]!;

        vi.mocked(proc.stderr).mockReturnValue("stderr");

        expect(host.stderr()).toBe("stderr");
    });

    it("constructs Process with the correct options", () => {
        new ExtensionHost({
            workspaceRoot: "/workspace",
            extensionPath: "/extension",
            vscodeExecutable: "code"
        });

        expect(Process).toHaveBeenCalledWith({
            command: "code",
            args: [
                "--extensionDevelopmentPath=" + resolve("/extension"),
                resolve("/workspace")
            ]
        });
    });
});