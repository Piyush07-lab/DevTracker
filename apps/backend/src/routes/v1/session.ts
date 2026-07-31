import { Router } from "express";
import { SessionPayloadSchema } from "@devtracker/types";
import { installTokenMiddleware } from "../../middleware/installToken.js";
import { SessionRepository } from "../../repositories/session.repository.js";

const router: Router = Router();

router.post(
    "/sessions",
    installTokenMiddleware,
    async (req, res) => {
        const result = SessionPayloadSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                error: "Invalid session payload",
                details: result.error.flatten()
            });
        }

        const session = result.data;

        const repository = new SessionRepository();

        const created = await repository.create(
            req.auth.accountId,
            session
        );

        return res.status(200).json({
            success: true,
            message: "Session accepted",
            created
        });
    }
);

export default router;