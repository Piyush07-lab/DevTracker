import { prisma } from "../lib/prisma.js";
import { createHash, randomUUID } from "node:crypto";

export async function installService() {
    const token = randomUUID();

    const tokenHash = createHash("sha256")
        .update(token)
        .digest("hex");

    let account = await prisma.account.findFirst();

    if (!account) {
        account = await prisma.account.create({
            data: {
                email: "local@devtracker",
            },
        });
    }

    const installation = await prisma.installation.create({
        data: {
            accountId: account.id,
            deviceName: "Unknown Device",
            platform: process.platform,
            extensionVersion: "0.0.0",
        },
    });

    await prisma.installToken.create({
        data: {
            accountId: account.id,
            tokenHash,
            expiresAt: new Date(
                Date.now() + 1000 * 60 * 60 * 24 * 30
            ),
        },
    });

    return {
        installationId: installation.id,
        token,
    };
}