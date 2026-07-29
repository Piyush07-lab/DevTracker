import { Request, Response } from "express";
import { InstallResponseSchema } from "@devtracker/types";
import { installService } from "../services/install.service.js";

export async function installController(
    _req: Request,
    res: Response
) {
    try {
        const result = await installService();

        const response = InstallResponseSchema.parse(result);

        res.status(201).json(response);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Internal Server Error",
        });
    }
}