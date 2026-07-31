import { type TransactionClient } from "../lib/prisma.js";

export class ProjectRepository {
    async findOrCreate(
        tx: TransactionClient,
        accountId: string,
        name: string
    ) {
        return tx.project.upsert({
            where : {
                accountId_name : {
                    accountId,
                    name
                }
            },
            update : {},
            create : {
                accountId,
                name
            }
        });
    }
}