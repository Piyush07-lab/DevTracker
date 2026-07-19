import { DevTrackerEvent } from "../dispatcher";

export interface EventProcessor {
    process(event: DevTrackerEvent): void;
}