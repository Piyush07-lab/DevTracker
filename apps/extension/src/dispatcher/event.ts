export interface BaseEvent {
    timestamp: number;
}

/**
 * `file` is workspace-relative (e.g. "src/index.ts"), or
 * "external:<basename>" for files outside any open workspace folder.
 * NEVER populate this with an absolute filesystem path — see DC-3.
 */

export interface ActiveEditorEvent extends BaseEvent {
    type: "editor.active";
    file: string;
}

export interface DocumentOpenEvent extends BaseEvent {
    type: "document.open";
    file: string;
}

export interface DocumentSaveEvent extends BaseEvent {
    type: "document.save";
    file: string;
}

export interface DocumentCloseEvent extends BaseEvent {
    type: "document.close";
    file: string;
}

export type DevTrackerEvent =
    | ActiveEditorEvent
    | DocumentOpenEvent
    | DocumentSaveEvent
    | DocumentCloseEvent;