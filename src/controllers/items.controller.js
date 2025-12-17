import { pool } from "../db/index.js";
import { v4 as uuid } from "uuid";

const WORKSPACE_ID = process.env.WORKSPACE_ID;

export async function createItem(req, res) {
  const { type, title, content, pinned = false } = req.body;
  const result = await pool.query(
    `INSERT INTO items (id, workspace_id, type, title, content, pinned, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [uuid(), WORKSPACE_ID, type, title, content, pinned, "chatgpt"]
  );
  res.status(201).json(result.rows[0]);
}

export async function listItems(req, res) {
  const { type } = req.query;
  const result = await pool.query(
    `SELECT * FROM items WHERE workspace_id=$1 ${type ? "AND type=$2" : ""}`,
    type ? [WORKSPACE_ID, type] : [WORKSPACE_ID]
  );
  res.json(result.rows);
}

export async function updateItem(req, res) {
  const { id } = req.params;
  const { title, content, pinned } = req.body;
  const result = await pool.query(
    `UPDATE items SET
      title=COALESCE($1,title),
      content=COALESCE($2,content),
      pinned=COALESCE($3,pinned),
      updated_at=now()
     WHERE id=$4 RETURNING *`,
    [title, content, pinned, id]
  );
  res.json(result.rows[0]);
}