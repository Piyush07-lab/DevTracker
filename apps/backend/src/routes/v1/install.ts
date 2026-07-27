import { Router } from "express";
import { prisma } from "../../lib/prisma.js";
import { createHash, randomUUID } from "node:crypto";

const router: Router = Router();

router.post("/install", async (_req, res) => {
    try {
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
                tokenHash: tokenHash,
                expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
            },
        });

        res.status(201).json({
            token,
            installationId: installation.id,
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Internal Server Error",
        });
    }
});

export default router;