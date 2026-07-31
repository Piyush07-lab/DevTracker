import { pinoHttp } from "pino-http";

export const loggingMiddleware = pinoHttp({
    autoLogging: true,

    serializers: {
        req(req) {
            return {
                method: req.method,
                url: req.url,
            };
        },

        res(res) {
            return {
                statusCode: res.statusCode,
            };
        },
    },

    customSuccessMessage(req, res) {
        return `${req.method} ${req.url} ${res.statusCode}`;
    },

    customReceivedMessage(req) {
        return `${req.method} ${req.url}`;
    },
});