import crypto from "crypto";
import { pool } from "../db/index.js";

export async function auth(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = header.replace("Bearer ", "").trim();

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  try {
    const result = await pool.query(
      `
      SELECT id
      FROM workspaces
      WHERE token_hash = $1
        AND revoked_at IS NULL
      `,
      [tokenHash]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const workspaceId = result.rows[0].id;

    // attach to request (used by controllers)
    req.workspaceId = workspaceId;

    // SET workspace for RLS (CORRECT WAY)
    await pool.query(`SELECT set_config('app.workspace_id', $1, true)`, [
      workspaceId,
    ]);

    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(500).json({ error: "Auth failed" });
  }
}
