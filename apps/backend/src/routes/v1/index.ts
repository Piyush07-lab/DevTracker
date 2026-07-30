import { Router } from "express";
import installRouter from "./install.js";
import sessionRouter from "./session.js"

const router: Router = Router();

router.use(installRouter);
router.use(sessionRouter);

export default router;