import { afterEach, describe, expect, it } from "vitest";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

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

    it.skipIf(!isWindows)(
        "launches a batch file with its cwd, args, env, and stdio",
        async () => {
            const directory = await mkdtemp(
                join(tmpdir(), "devtracker-process-")
            );
            const command = join(directory, "fixture.cmd");

            try {
                await writeFile(
                    command,
                    "@echo off\r\necho %PROCESS_FIXTURE_ENV%:%1\r\n",
                    "utf8"
                );

                testProcess = new Process({
                    command,
                    args: ["argument"],
                    cwd: directory,
                    env: {
                        ...process.env,
                        PROCESS_FIXTURE_ENV: "environment"
                    },
                    shell: true
                });

                await testProcess.start();

                expect(await testProcess.waitForExit()).toBe(0);
                expect(testProcess.stdout()).toContain(
                    "environment:argument"
                );
                expect(testProcess.stderr()).toBe("");
            } finally {
                await rm(directory, {
                    recursive: true,
                    force: true
                });
            }
        }
    );
});
