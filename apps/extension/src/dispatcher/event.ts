// DevTrackerEvent now lives in @devtracker/types (packages/types/src/events.ts)
// as the single source of truth shared with the backend. Re-exported here
// so existing imports (`from "../dispatcher"`) across the extension don't
// need to change. See DC-4.
export type {
    BaseEvent,
    ActiveEditorEvent,
    DocumentOpenEvent,
    DocumentSaveEvent,
    DocumentCloseEvent,
    DevTrackerEvent
} from "@devtracker/types";