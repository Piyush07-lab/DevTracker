import { Router } from "express";
import { SessionPayloadSchema } from "@devtracker/types";
import { installTokenMiddleware } from "../../middleware/installToken.js";
import { SessionRepository } from "../../repositories/session.repository.js";
import { QuarantinedEventRepository } from "../../repositories/quarantinedEvent.repository.js";

const router: Router = Router();

router.post(
    "/sessions",
    installTokenMiddleware,
    async (req, res) => {
        const repository = new SessionRepository();
        const quarantineRepository = new QuarantinedEventRepository();

        const result = SessionPayloadSchema.safeParse(req.body);

        if (!result.success) {
            await quarantineRepository.create(
                req.auth.accountId,
                req.body,
                JSON.stringify(result.error.flatten())
            );

            return res.status(400).json({
                error: "Invalid session payload",
                details: result.error.flatten()
            });
        }

        const session = result.data;

        try {
            const created = await repository.create(
                req.auth.accountId,
                session
            );

            return res.status(200).json({
                success: true,
                message: "Session accepted",
                created
            });
        } catch (error) {
            await quarantineRepository.create(
                req.auth.accountId,
                req.body,
                error instanceof Error
                    ? error.message
                    : "Unknown persistence error"
            );

            return res.status(500).json({
                error: "Failed to persist session"
            });
        }
    }
);

export default router;