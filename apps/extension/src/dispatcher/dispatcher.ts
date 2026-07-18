import { DevTrackerEvent } from "./event";

export class EventDispatcher {
    dispatch(event: DevTrackerEvent): void {
        console.log(event);
    }
}