import { afterEach, describe, expect, it } from "vitest";

import { Process } from "./Process.js";

describe("Process", () => {

    let testProcess: Process | undefined;

    const isWindows = process.platform === "win32";

    afterEach(async () => {
        if (testProcess?.isRunning()) {
            await testProcess.stop();
        }
    });

    it("starts successfully", async () => {
        testProcess = new Process({
            command: isWindows ? "cmd" : "node",
            args:
                isWindows
                    ? ["/c", "timeout", "/t", "5", "/nobreak"]
                    : ["-e", "setTimeout(() => {}, 5000)"]
        });

        await testProcess.start();

        expect(testProcess.isRunning()).toBe(true);
    });

    it("stops successfully", async () => {
        testProcess = new Process({
            command: isWindows ? "cmd" : "node",
            args:
                isWindows
                    ? ["/c", "timeout", "/t", "5", "/nobreak"]
                    : ["-e", "setTimeout(() => {}, 5000)"]
        });

        await testProcess.start();

        await testProcess.stop();

        expect(testProcess.isRunning()).toBe(false);
    });

    it("throws when started twice", async () => {
        testProcess = new Process({
            command: isWindows ? "cmd" : "node",
            args:
                isWindows
                    ? ["/c", "timeout", "/t", "5", "/nobreak"]
                    : ["-e", "setTimeout(() => {}, 5000)"]
        });

        await testProcess.start();

        await expect(testProcess.start())
            .rejects
            .toThrow("Process is already running.");
    });

    it("stop() is safe when testProcess is not running", async () => {
        testProcess = new Process({
            command: "node",
            args: []
        });

        await expect(testProcess.stop()).resolves.toBeUndefined();
    });

    it("captures stdout", async () => {
        testProcess = new Process({
            command: "node",
            args: [
                "-e",
                "console.log('hello')"
            ]
        });

        await testProcess.start();

        await testProcess.waitForExit();

        expect(testProcess.stdout()).toContain("hello");
    });

    it("captures stderr", async () => {
        testProcess = new Process({
            command: "node",
            args: [
                "-e",
                "console.error('boom')"
            ]
        });

        await testProcess.start();

        await testProcess.waitForExit();

        expect(testProcess.stderr()).toContain("boom");
    });

    it("returns an exit code", async () => {
        testProcess = new Process({
            command: "node",
            args: [
                "-e",
                "process.exit(7)"
            ]
        });

        await testProcess.start();

        const code = await testProcess.waitForExit();

        expect(code).toBe(7);
    });
});