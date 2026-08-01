import type { ErrorRequestHandler } from "express";

interface HttpError extends Error {
    status?: number;
}

export const errorHandler: ErrorRequestHandler = (err, req, res) => {
    const error = err as HttpError;

    const status = error.status ?? 500;
    const isProduction = process.env.NODE_ENV === "production";

    // Log only unexpected server errors.
    if (status >= 500) {
        if (req.log) {
            req.log.error(
                {
                    err: {
                        message: error.message,
                        stack: error.stack,
                    },
                },
                "Unhandled server error",
            );
        } else {
            console.error(error);
        }
    }

    const message =
        status >= 500 && isProduction
            ? "Internal server error"
            : error.message;

    res.status(status).json({
        error: {
            message,
            ...(isProduction
                ? {}
                : status >= 500 && error.stack
                    ? { stack: error.stack }
                    : {}),
        },
    });
};