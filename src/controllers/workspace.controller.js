import crypto from "crypto";
import { pool } from "../db/index.js";

function generateToken() {
  return "ws_" + crypto.randomBytes(32).toString("hex");
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function initWorkspace(req, res) {
  try {
    const token = generateToken();
    const tokenHash = hashToken(token);

    const result = await pool.query(
      `
      INSERT INTO workspaces (token_hash)
      VALUES ($1)
      RETURNING id
      `,
      [tokenHash]
    );

    res.status(201).json({
      workspace_token: token,
    });
  } catch (err) {
    console.error("initWorkspace error:", err);
    res.status(500).json({ error: "Failed to initialize workspace" });
  }
}
