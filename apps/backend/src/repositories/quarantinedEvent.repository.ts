import { prisma } from "../lib/prisma.js";

export class QuarantinedEventRepository {
    async create(
        accountId: string,
        rawPayload: unknown,
        validationError: string
    ) {
        return prisma.quarantinedEvent.create({
            data: {
                accountId,
                rawPayload: JSON.stringify(rawPayload),
                validationError,
            },
        });
    }
}