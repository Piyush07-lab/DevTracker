import { Router } from "express";

const router: Router = Router();

router.post("/install", (_req, res) => {
    res.status(501).json({
        message: "Not implemented"
    });
});

export default router;