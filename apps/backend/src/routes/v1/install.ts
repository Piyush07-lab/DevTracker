import { Router } from "express";
import { installController } from "../../controllers/install.controller.js";

const router: Router = Router();

router.post("/install", installController);

export default router;