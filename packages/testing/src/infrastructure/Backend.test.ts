import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Backend } from "./Backend.js";
import { HttpClient } from "./HttpClient.js";
import { Process } from "./Process.js";

vi.mock("./Process.js");
vi.mock("./HttpClient.js");

describe("Backend", () => {
    let backend: Backend;

    beforeEach(() => {
        vi.clearAllMocks();

        backend = new Backend({
            cwd: "/repo"
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("starts the backend process", async () => {
        const proc = vi.mocked(Process).mock.instances[0]!;

        await backend.start();

        expect(proc.start).toHaveBeenCalledOnce();
    });

    it("stops the backend process", async () => {
        const proc = vi.mocked(Process).mock.instances[0]!;

        await backend.stop();

        expect(proc.stop).toHaveBeenCalledOnce();
    });

    it("waits until the backend is healthy", async () => {
        const http = vi.mocked(HttpClient).mock.instances[0]!;

        await backend.waitUntilReady();

        expect(http.waitUntilHealthy).toHaveBeenCalledOnce();
        expect(http.waitUntilHealthy).toHaveBeenCalledWith(
            new URL("http://localhost:3000/health")
        );
    });

    it("returns the backend URL", () => {
        expect(backend.getUrl()).toEqual(
            new URL("http://localhost:3000")
        );
    });

    it("returns the running state", () => {
        const proc = vi.mocked(Process).mock.instances[0]!;

        vi.mocked(proc.isRunning).mockReturnValue(true);

        expect(backend.isRunning()).toBe(true);
    });

    it("constructs Process with the correct options", () => {
        expect(Process).toHaveBeenCalledWith({
            command: process.platform === "win32"
                ? "pnpm.cmd"
                : "pnpm",
            args: [
                "--filter",
                "@devtracker/backend",
                "dev"
            ],
            cwd: "/repo",
            env: expect.objectContaining({
                PORT: "3000"
            }),
            shell: process.platform === "win32"
        });
    });

    it("uses the provided port", async () => {
        backend = new Backend({
            cwd: "/repo",
            port: 8080
        });

        const http = vi.mocked(HttpClient).mock.instances[1]!;

        await backend.waitUntilReady();

        expect(backend.getUrl()).toEqual(
            new URL("http://localhost:8080")
        );

        expect(http.waitUntilHealthy).toHaveBeenCalledOnce();
        expect(http.waitUntilHealthy).toHaveBeenCalledWith(
            new URL("http://localhost:8080/health")
        );
    });
});
