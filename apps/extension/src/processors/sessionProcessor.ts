import { DevTrackerEvent } from "../dispatcher";
import { SessionPayload, SessionPayloadSchema } from "@devtracker/types"
import { EventProcessor } from "./processor";
import { SessionManager } from "../sessions";
import { DevTrackerClient } from "@devtracker/sdk"; 

export class SessionProcessor implements EventProcessor {
    private readonly manager = new SessionManager();

    constructor(private readonly client: DevTrackerClient) { }

    async process(event: DevTrackerEvent): Promise<void> {
        const completed = this.manager.handle(event);

        if (!completed) {
            return;
        }

        const payload: SessionPayload = {
            startTime: completed.startTime,
            lastActivity: completed.lastActivity,
            files: Array.from(completed.files),
            events: completed.events,
            ...(completed.project !== undefined
                ? { project: completed.project }
                : {}),
        };

        const validated = SessionPayloadSchema.parse(payload);

        console.log("[E2E] Sending completed session");

        await this.client.sendSession(validated);

        console.log("[E2E] Session upload completed");
    }

    public getCurrentSession() {
        return this.manager.getCurrentSession();
    }
}