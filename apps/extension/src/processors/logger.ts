import { DevTrackerEvent } from "../dispatcher";
import { EventProcessor } from "./processor";

export class LoggerProcessor implements EventProcessor {
    process(event: DevTrackerEvent): void {
        console.log(event);
    }
}