import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import itemsRouter from "./routes/items.routes.js";

const app = express();
app.use(helmet());
app.use(express.json());
app.use(rateLimit({ windowMs: 60000, max: 100 }));
app.use("/api/v1/items", itemsRouter);
export default app;