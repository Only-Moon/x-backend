import express from "express";
import { initWorkspace } from "../controllers/workspace.controller.js";

const router = express.Router();

router.post("/init", initWorkspace);

export default router;
