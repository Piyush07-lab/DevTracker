import express, { type Express } from "express";
import  healthRouter  from "./routes/health.js";
import v1Router from "./routes/v1/index.js";
import { loggingMiddleware, errorHandler } from "./middleware/index.js";


const app: Express = express();

app.use(express.json());

app.use(loggingMiddleware);

app.use(healthRouter);
app.use("/v1", v1Router);

app.use(errorHandler);

export default app;