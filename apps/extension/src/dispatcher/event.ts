export interface BaseEvent {
    timestamp: number;
}

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