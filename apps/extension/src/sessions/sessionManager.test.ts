// sessionManager.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { SessionManager } from "./sessionManager";
import type { DevTrackerEvent } from "../dispatcher";

// --- Mock Helpers ---
function makeEvent(
    timestamp: number,
    file = "test.ts",
    type = "change"
): DevTrackerEvent {
    return { type, timestamp, file };
}

// --- Tests ---
describe("SessionManager", () => {
    let manager: SessionManager;

    beforeEach(() => {
        manager = new SessionManager();
    });

    describe("initial state", () => {
        it("getCurrentSession() returns null before any event has been handled", () => {
            expect(manager.getCurrentSession()).toBeNull();
        });
    });

    describe("first event", () => {
        it("creates a new session and returns null (no completed session)", () => {
            const event = makeEvent(1000);

            const result = manager.handle(event);

            expect(result).toBeNull();
            const session = manager.getCurrentSession();
            expect(session).not.toBeNull();
            expect(session!.startTime).toBe(1000);
            expect(session!.lastActivity).toBe(1000);
            expect(session!.files).toEqual(new Set(["test.ts"]));
        });
    });

    describe("second event within idle window", () => {
        it("extends the same session, updates lastActivity, and returns null", () => {
            manager.handle(makeEvent(1000, "fileA.ts"));

            const result = manager.handle(makeEvent(2000, "fileB.ts"));

            expect(result).toBeNull();
            const session = manager.getCurrentSession();
            expect(session!.startTime).toBe(1000);
            expect(session!.lastActivity).toBe(2000);
            expect(session!.files).toEqual(new Set(["fileA.ts", "fileB.ts"]));
        });
    });

    describe("files accumulation", () => {
        it("contains all unique filenames, duplicates are not double-counted", () => {
            manager.handle(makeEvent(1000, "a.ts"));
            manager.handle(makeEvent(2000, "b.ts"));
            manager.handle(makeEvent(3000, "a.ts")); // duplicate

            const session = manager.getCurrentSession();
            expect(session!.files.size).toBe(2);
            expect(session!.files.has("a.ts")).toBe(true);
            expect(session!.files.has("b.ts")).toBe(true);
        });
    });

    describe("idle timeout boundary — exactly IDLE_TIMEOUT (5 min)", () => {
        const IDLE_TIMEOUT = 5 * 60 * 1000; // 300,000ms

        it("treats a gap of exactly IDLE_TIMEOUT as still active, not idle (> not >=)", () => {
            const startTime = 1_000_000;
            manager.handle(makeEvent(startTime, "first.ts"));

            const atBoundary = startTime + IDLE_TIMEOUT;
            const result = manager.handle(makeEvent(atBoundary, "second.ts"));

            expect(result).toBeNull();

            const session = manager.getCurrentSession();
            expect(session).not.toBeNull();
            expect(session!.lastActivity).toBe(atBoundary);
            expect(session!.files.size).toBe(2);
        });

        it("completes session when gap exceeds IDLE_TIMEOUT (1ms past)", () => {
            const startTime = 1_000_000;
            manager.handle(makeEvent(startTime, "first.ts"));

            const pastTimeout = startTime + IDLE_TIMEOUT + 1;
            const result = manager.handle(makeEvent(pastTimeout, "second.ts"));

            expect(result).not.toBeNull();
            expect(result!.startTime).toBe(startTime);
            expect(result!.lastActivity).toBe(startTime);
            expect(result!.files).toEqual(new Set(["first.ts"]));

            const newSession = manager.getCurrentSession();
            expect(newSession).not.toBeNull();
            expect(newSession!.startTime).toBe(pastTimeout);
            expect(newSession!.lastActivity).toBe(pastTimeout);
            expect(newSession!.files).toEqual(new Set(["second.ts"]));
        });
    });

    describe("same timestamp (no false positive idle)", () => {
        it("does not complete session when events share the same timestamp", () => {
            manager.handle(makeEvent(5000, "file.ts"));

            const result = manager.handle(makeEvent(5000, "file.ts"));

            expect(result).toBeNull();
            const session = manager.getCurrentSession();
            expect(session).not.toBeNull();
            expect(session!.lastActivity).toBe(5000);
        });
    });

    describe("Readonly type constraint", () => {
        it("prevents direct property reassignment at compile time via Readonly<Session>", () => {
            manager.handle(makeEvent(100));
            const session = manager.getCurrentSession();
            // @ts-expect-error: Readonly prevents reassigning 'files'
            session!.files = new Set();
        });

        it("demonstrates internal Set is mutable through returned reference (shallow Readonly)", () => {
            manager.handle(makeEvent(100, "file1.ts"));
            const session = manager.getCurrentSession();
            // Mutate the Set via returned reference
            session!.files.add("injected.ts");
            // Trigger another event to get the session again
            manager.handle(makeEvent(200, "file2.ts"));
            const sessionAfter = manager.getCurrentSession();
            // Assert that the injected file is present, confirming the Set is not truly read-only
            expect(sessionAfter!.files.has("injected.ts")).toBe(true);
            // This shows that despite Readonly<Session>, the returned object's Set is still mutable.
        });
    })

});