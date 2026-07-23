import { Router } from "express";

const router: Router = Router();

router.get("/health", (_req, res) => {
    res.status(200).json({
        status: "ok"
    });
});

export default router;