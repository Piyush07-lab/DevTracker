import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createServer, type Server } from "node:http";

import { HttpClient } from "./HttpClient.js";

describe("HttpClient", () => {
    let server: Server;
    let baseUrl: URL;

    beforeAll(async () => {
        server = createServer((req, res) => {
            switch (req.url) {
                case "/health":
                    res.writeHead(200, {
                        "Content-Type": "application/json"
                    });
                    res.end(JSON.stringify({ status: "ok" }));
                    break;

                case "/get":
                    res.writeHead(200, {
                        "Content-Type": "application/json"
                    });
                    res.end(JSON.stringify({ message: "success" }));
                    break;

                case "/post": {
                    let body = "";

                    req.on("data", chunk => {
                        body += chunk;
                    });

                    req.on("end", () => {
                        res.writeHead(200, {
                            "Content-Type": "application/json"
                        });

                        res.end(body);
                    });

                    break;
                }

                default:
                    res.writeHead(404);
                    res.end();
            }
        });

        await new Promise<void>((resolve) => {
            server.listen(0, () => resolve());
        });

        const address = server.address();

        if (address === null || typeof address === "string") {
            throw new Error("Failed to determine server address.");
        }

        baseUrl = new URL(`http://127.0.0.1:${address.port}`);
    });

    afterAll(async () => {
        await new Promise<void>((resolve, reject) => {
            server.close(error => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve();
            });
        });
    });

    it("performs a GET request", async () => {
        const client = new HttpClient();

        const response = await client.get(
            new URL("/get", baseUrl)
        );

        expect(response.status).toBe(200);

        const json = await response.json();

        expect(json).toEqual({
            message: "success"
        });
    });

    it("performs a POST request", async () => {
        const client = new HttpClient();

        const payload = {
            hello: "world"
        };

        const response = await client.post(
            new URL("/post", baseUrl),
            payload
        );

        expect(response.status).toBe(200);

        const json = await response.json();

        expect(json).toEqual(payload);
    });

    it("waitUntilHealthy resolves for a healthy service", async () => {
        const client = new HttpClient();

        await expect(
            client.waitUntilHealthy(
                new URL("/health", baseUrl)
            )
        ).resolves.toBeUndefined();
    });

    it("waitUntilHealthy rejects when the service never becomes healthy", async () => {
        const client = new HttpClient({
            retryDelay: 10
        });

        await expect(
            client.waitUntilHealthy(
                new URL("/missing", baseUrl),
                100
            )
        ).rejects.toThrow(
            "Health check timed out after 100ms"
        );
    });

    it("times out when a request exceeds the configured timeout", async () => {
        server.removeAllListeners("request");

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        server.on("request", (_req, _res) => {
            // Intentionally never respond.
        });

        const client = new HttpClient({
            timeout: 100
        });

        await expect(
            client.get(
                new URL("/timeout", baseUrl)
            )
        ).rejects.toThrow();
    });
});