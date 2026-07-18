import type { HelloWorld } from "@devtracker/types";

export function createGreeting(message: string): HelloWorld {
    return { message };
}