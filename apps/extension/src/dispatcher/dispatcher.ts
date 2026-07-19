import { DevTrackerEvent } from "./event";
import { EventProcessor } from "../processors";

export class EventDispatcher {

    private readonly processors: EventProcessor[] = [];

    register(processor: EventProcessor): void {
        this.processors.push(processor);
    }

    dispatch(event: DevTrackerEvent): void {
        for (const processor of this.processors) {
            processor.process(event);
        }
    }

}