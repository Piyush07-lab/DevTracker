import { DevTrackerEvent } from "../dispatcher";
import { Session } from "./session";

export class SessionManager {

    private currentSession: Session | null = null;

    private static readonly IDLE_TIMEOUT = 5 * 60 * 1000;

    public getCurrentSession(): Readonly<Session> | null {
        return this.currentSession;
    }

    handle(event: DevTrackerEvent): Session | null {

        let completedSession: Session | null = null;

        const now = event.timestamp;

        if (
            this.currentSession &&
            now - this.currentSession.lastActivity > SessionManager.IDLE_TIMEOUT
        ) {
            completedSession = this.endCurrentSession();
        }

        if (!this.currentSession) {
            this.currentSession = {
                startTime: now,
                lastActivity: now,
                files: new Set()
            };
        }

        this.currentSession.lastActivity = now;
        this.currentSession.files.add(event.file);
        return completedSession;
    }

    private endCurrentSession(): Session {

        const session = this.currentSession!;

        this.currentSession = null;

        return session;
    }

}