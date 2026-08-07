import type { IHttpClient } from "../contracts/index.js";

export interface HttpClientOptions {
    timeout?: number;
    retries?: number;
    retryDelay?: number;
}

export class HttpClient implements IHttpClient {
    private readonly timeout: number;
    private readonly retries: number;
    private readonly retryDelay: number;

    constructor(options: HttpClientOptions = {}) {
        this.timeout = options.timeout ?? 5000;
        this.retries = options.retries ?? 0;
        this.retryDelay = options.retryDelay ?? 250;
    }

    async get(url: URL | string): Promise<Response> {
        return this.request(url, {
            method: "GET"
        });
    }

    async post(
        url: URL | string,
        body?: unknown,
        headers: Record<string, string> = {}
    ): Promise<Response> {

        return this.request(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...headers
            },
            body: body === undefined
                ? null
                : JSON.stringify(body)
        });
    }

    async waitUntilHealthy(
        url: URL | string,
        timeoutMs = 30_000
    ): Promise<void> {

        const deadline = Date.now() + timeoutMs;

        while (Date.now() < deadline) {

            try {

                const response = await this.get(url);

                if (response.ok) {
                    return;
                }

            } catch {
                // Service not ready.
            }

            await this.delay(this.retryDelay);
        }

        throw new Error(
            `Health check timed out after ${timeoutMs}ms`
        );
    }

    private async request(
        url: URL | string,
        init: RequestInit
    ): Promise<Response> {

        let lastError: unknown;

        for (let attempt = 0; attempt <= this.retries; attempt++) {

            const controller = new AbortController();

            const timer = setTimeout(
                () => controller.abort(),
                this.timeout
            );

            try {

                const response = await fetch(url, {
                    ...init,
                    signal: controller.signal
                });

                clearTimeout(timer);

                return response;

            } catch (error) {

                clearTimeout(timer);

                lastError = error;

                if (attempt < this.retries) {
                    await this.delay(this.retryDelay);
                }
            }
        }

        throw lastError;
    }

    private async delay(ms: number): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, ms));
    }
}