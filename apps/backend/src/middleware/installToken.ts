import { createHash } from "node:crypto";
import { type NextFunction, type Request, type Response } from "express";

import { prisma } from "../lib/prisma.js";

export async function installTokenMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const authorization = req.headers.authorization;

        if (!authorization) {
            return res.status(401).json({
                message: "Missing authorization header",
            });
        }

        if (!authorization.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Invalid authorization header",
            });
        }

        const token = authorization.substring(7).trim();

        if (!token) {
            return res.status(401).json({
                message: "Missing install token",
            });
        }

        const tokenHash = createHash("sha256")
            .update(token)
            .digest("hex");

        const installToken = await prisma.installToken.findUnique({
            where: {
                tokenHash,
            },
        });

        if (!installToken) {
            return res.status(401).json({
                message: "Invalid install token",
            });
        }

        if (installToken.expiresAt < new Date()) {
            return res.status(401).json({
                message: "Install token expired",
            });
        }

        req.accountId = installToken.accountId;

        next();

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
}