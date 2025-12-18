import crypto from "crypto";
import { pool } from "../db/index.js";
import { getChatGPTContextId } from "./chatgptContext.js";

export async function auth(req, res, next) {
  try {
    // ---------- MODE A: ChatGPT ----------
    const chatgptContextId = getChatGPTContextId(req);

    if (chatgptContextId) {
      const result = await pool.query(
        `
        INSERT INTO workspaces (token_hash)
        VALUES ($1)
        ON CONFLICT (token_hash)
        DO UPDATE SET token_hash = EXCLUDED.token_hash
        RETURNING id
        `,
        [chatgptContextId]
      );

      const workspaceId = result.rows[0].id;

      req.workspaceId = workspaceId;

      await pool.query(`SELECT set_config('app.workspace_id', $1, true)`, [
        workspaceId,
      ]);

      return next();
    }

    // ---------- MODE B: App / Widget ----------
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = header.replace("Bearer ", "").trim();

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

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

    req.workspaceId = workspaceId;

    await pool.query(`SELECT set_config('app.workspace_id', $1, true)`, [
      workspaceId,
    ]);

    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(500).json({ error: "Auth failed" });
  }
}
