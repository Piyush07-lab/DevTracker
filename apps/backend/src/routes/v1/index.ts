import { Router } from "express";
import installRouter from "./install.js";

const router: Router = Router();

router.use(installRouter);

export default router;