import { z } from "zod";

export interface BaseEvent {
    timestamp: number;
}

/**
 * `file` is workspace-relative (e.g. "src/index.ts"), or
 * "external:<basename>" for files outside any open workspace folder.
 * NEVER populate this with an absolute filesystem path — see DC-3.
 */

export const BaseEventSchema = z.object({
    timestamp: z.number().int().nonnegative()
});

export const ActiveEditorEventSchema = BaseEventSchema.extend({
    type: z.literal("editor.active"),
    file: z.string()
});

export const DocumentOpenEventSchema = BaseEventSchema.extend({
    type: z.literal("document.open"),
    file: z.string()
});

export const DocumentSaveEventSchema = BaseEventSchema.extend({
    type: z.literal("document.save"),
    file: z.string()
});

export const DocumentCloseEventSchema = BaseEventSchema.extend({
    type: z.literal("document.close"),
    file: z.string()
});

export const DevTrackerEventSchema = z.discriminatedUnion("type", [
    ActiveEditorEventSchema,
    DocumentOpenEventSchema,
    DocumentSaveEventSchema,
    DocumentCloseEventSchema
]);



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

export const SessionPayloadSchema = z.object({
    startTime: z.number().int().nonnegative(),
    lastActivity: z.number().int().nonnegative(),
    files: z.array(z.string()),
    events: z.array(DevTrackerEventSchema)
});

export interface SessionPayload {
    startTime: number;
    lastActivity: number;
    files: string[];
    events: DevTrackerEvent[];
}

export type DevTrackerEventDTO = z.infer<typeof DevTrackerEventSchema>;
export type SessionPayloadDTO = z.infer<typeof SessionPayloadSchema>;