/**
 * Internal, in-memory session shape used only inside the extension while
 * a session is actively being built up by SessionManager. `files` is a
 * `Set<string>` for O(1) add/dedup during live tracking.
 *
 * This is NOT the shape that crosses the wire — see `SessionPayload` in
 * @devtracker/types (packages/types/src/events.ts) for that. Converting
 * from this internal shape to a `SessionPayload` (Set -> string[]) happens
 * exactly once, when a session completes, not on every event.
 */
export interface Session {
    startTime: number;
    lastActivity: number;
    files: Set<string>;
}