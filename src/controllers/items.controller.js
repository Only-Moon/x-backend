import { pool } from "../db/index.js";
import { v4 as uuid } from "uuid";

export async function createItem(req, res) {
  const { type, title, content, pinned = false } = req.body;
  const workspaceId = req.workspaceId;

  if (!content) {
    return res.status(400).json({
      error: "content is required and cannot be null",
    });
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO items (
        id,
        workspace_id,
        type,
        title,
        content,
        pinned,
        created_by
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *
      `,
      [uuid(), workspaceId, type, title, content, pinned, "chatgpt"]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("createItem error:", err);
    res.status(500).json({ error: "Failed to create item" });
  }
}

export async function listItems(req, res) {
  const { type } = req.query;
  const workspaceId = req.workspaceId;

  try {
    let result;

    if (type) {
      result = await pool.query(
        `
        SELECT *
        FROM items
        WHERE workspace_id = $1
          AND type = $2
        ORDER BY updated_at DESC
        `,
        [workspaceId, type]
      );
    } else {
      result = await pool.query(
        `
        SELECT *
        FROM items
        WHERE workspace_id = $1
        ORDER BY updated_at DESC
        `,
        [workspaceId]
      );
    }

    res.json(result.rows);
  } catch (err) {
    console.error("listItems error:", err);
    res.status(500).json({ error: "Failed to list items" });
  }
}

export async function updateItem(req, res) {
  const { id } = req.params;
  const { title, content, pinned } = req.body;
  const workspaceId = req.workspaceId;

  try {
    const result = await pool.query(
      `
      UPDATE items
      SET
        title = COALESCE($1, title),
        content = COALESCE($2, content),
        pinned = COALESCE($3, pinned),
        updated_at = now()
      WHERE id = $4
        AND workspace_id = $5
      RETURNING *
      `,
      [title, content, pinned, id, workspaceId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("updateItem error:", err);
    res.status(500).json({ error: "Failed to update item" });
  }
}
