import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { TestEnvironment } from "./TestEnvironment.js";

describe("E2E-001 Install Bootstrap", () => {
    let env: TestEnvironment | undefined;

    beforeEach(() => {
        env = new TestEnvironment({
            repositoryRoot: "C:\\Users\\theon\\OneDrive\\Desktop\\DevTracker",
            vscodeExecutable: "code"
        });
    });

    afterEach(async () => {
        await env?.stop();
    });

    it("boots a fresh installation", async () => {
        await env?.start();

        expect(env?.backendRunning()).toBe(true);

        expect(env?.extensionRunning()).toBe(true);

        expect(env?.extensionStderr()).toBe("");

        expect(env?.backendUrl().href).toContain("localhost");
    });
});