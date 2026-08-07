import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { TestEnvironment } from "./TestEnvironment.js";
import { DevTrackerClient } from "@devtracker/sdk";

describe("E2E-002 Authenticate Session Upload", () => {
    let env: TestEnvironment;

    beforeEach(() => {
        env = new TestEnvironment({
            repositoryRoot: "C:\\Users\\theon\\OneDrive\\Desktop\\DevTracker",
            vscodeExecutable: "code"
        });
    });

    afterEach(async () => {
        await env.stop();
    });

    it("uploads an authenticated session", async () => {
        await env.start();

        const client = new DevTrackerClient(
            env.backendUrl().href
        );

        await client.install();
        
        expect(client.getInstallToken()).toBeDefined();

        try {
            await client.sendSession({
                startTime: Date.now(),
                lastActivity: Date.now(),
                files: ["src/index.ts"],
                events: [
                    {
                        type: "editor.active",
                        timestamp: Date.now(),
                        language: "typescript",
                        file: "src/index.ts"
                    }
                ]
            });
        } catch (error) {
            console.error("Session upload failed:", error);
            
            throw error;
        }

    });
});