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

/**
 * Wire-shape session — crosses extension -> SDK -> backend once a session
 * is finalized (SessionManager.endCurrentSession()).
 *
 * This is deliberately NOT the same type as the extension's internal
 * `Session` (apps/extension/src/sessions/session.ts), which keeps
 * `files: Set<string>` for O(1) dedup while a session is actively being
 * built up in memory. `Set` is not JSON-serializable, so the conversion
 * (Set -> string[]) happens exactly once, at the moment a session
 * completes — not on every file-add mutation.
 *
 * Per DC-4:
 *  - One SessionPayload per request is the batch unit (not raw events).
 *  - `accountId` is intentionally NOT a field here. Identity is resolved
 *    server-side from the install token attached to the request (see
 *    DC-9) — the client never asserts its own account identity.
 */
export interface SessionPayload {
    startTime: number;
    lastActivity: number;
    files: string[];
    events: DevTrackerEvent[];
}