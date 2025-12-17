import express from "express";
import { auth } from "../middlewares/auth.js";
import { createItem, listItems, updateItem } from "../controllers/items.controller.js";

const router = express.Router();
router.use(auth);
router.post("/", createItem);
router.get("/", listItems);
router.patch("/:id", updateItem);
export default router;