import { DevTrackerEvent } from "../dispatcher";
import { EventProcessor } from "./processor";
import { SessionManager } from "../sessions";

export class SessionProcessor implements EventProcessor {

    private readonly manager = new SessionManager();

    process(event: DevTrackerEvent): void {

        const completed = this.manager.handle(event);

        if (completed) {
            console.log("Completed session:", completed);
        }
    }

    public getCurrentSession() {
        return this.manager.getCurrentSession();
    }

}