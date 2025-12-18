import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import itemsRoutes from "./routes/items.routes.js";
import workspaceRoutes from "./routes/workspace.route.js";

const app = express();

app.use(helmet());
app.use(express.json());
app.use(
    rateLimit({
    windowMs: 60 * 1000,
    max: 100,
})
);

// Protected routes
app.use("/api/v1/items", itemsRoutes);

// Public routes
app.use("/api/v1/workspace", workspaceRoutes);

export default app;
