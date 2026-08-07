import axios, { AxiosInstance } from "axios";
import { stdout } from "node:process";

import {
    InstallResponse,
    InstallResponseSchema,
    SessionPayload,
    SessionPayloadSchema,
} from "@devtracker/types";

export class DevTrackerClient {
    private readonly baseUrl: string;
    private readonly api: AxiosInstance;
    private installToken?: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;

        this.api = axios.create({
            baseURL: baseUrl,
            headers: {
                "Content-Type": "application/json",
            },
            timeout: 10000,
        });
    }

    async install(): Promise<InstallResponse> {

        const response = await this.api.post("/v1/install");

        const install = InstallResponseSchema.parse(response.data);

        this.setInstallToken(install.token);

        return install;
    }

    setInstallToken(token: string): void {
        this.installToken = token;
    }

    getInstallToken(): string | undefined {
        return this.installToken;
    }

    async sendSession(session: SessionPayload): Promise<void> {

        SessionPayloadSchema.parse(session);

        if (!this.installToken) {
            throw new Error("Client has not been installed.");
        }

        stdout.write("[SDK] POST /v1/sessions\n");

        await this.api.post(
            "/v1/sessions",
            session,
            {
                headers: {
                    Authorization: `Bearer ${this.installToken}`,
                },
            }
        );
        stdout.write("[SDK] Session upload complete\n");
    }

}