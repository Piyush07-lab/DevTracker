import express, { type Express } from "express";
import  healthRouter  from "./routes/health.js";
import v1Router from "./routes/v1/index.js";


const app: Express = express();

app.use(express.json());

app.use(healthRouter);
app.use("/v1", v1Router);

export default app;