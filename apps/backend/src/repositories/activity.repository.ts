import { type TransactionClient } from "../lib/prisma.js"; 
import type { DevTrackerEvent } from "@devtracker/types";

export class ActivityRepository{
    async createMany(
        tx: TransactionClient,
        accountId: string,
        sessionId: string,
        events: DevTrackerEvent[]
    ) {
        if(events.length === 0){
            return
        }

        return tx.activity.createMany({
            data: events.map(event => ({
                accountId,
                sessionId,
                eventType: event.type,
                filePath: event.file,
                language: event.language,
                timestamp: new Date(event.timestamp)
            }))
        });
    }
}