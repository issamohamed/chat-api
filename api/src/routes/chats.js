const { Router } = require("express");
const pool = require("../db");

const router = Router();

// POST /api/v1/chats — Create a new chat thread
router.post("/", async (req, res, next) => {
  try {
    const { user_id, title } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: "user_id is required" });
    }

    const result = await pool.query(
      `INSERT INTO chats (user_id, title) VALUES ($1, $2) RETURNING *`,
      [user_id, title || "New Chat"]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    // Postgres error code 23503 = foreign key violation (user_id doesn't exist)
    if (err.code === "23503") {
      return res.status(404).json({ error: "User not found" });
    }
    next(err);
  }
});

// GET /api/v1/chats?user_id=X — List all chats for a user, newest first
router.get("/", async (req, res, next) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: "user_id query parameter is required" });
    }

    const result = await pool.query(
      `SELECT * FROM chats WHERE user_id = $1 ORDER BY updated_at DESC`,
      [user_id]
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/chats/:id — Get a single chat along with all its messages
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const chatResult = await pool.query(
      `SELECT * FROM chats WHERE id = $1`,
      [id]
    );

    if (chatResult.rows.length === 0) {
      return res.status(404).json({ error: "Chat not found" });
    }

    const messagesResult = await pool.query(
      `SELECT * FROM messages WHERE chat_id = $1 ORDER BY created_at ASC`,
      [id]
    );

    res.json({
      ...chatResult.rows[0],
      messages: messagesResult.rows,
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/chats/:id — Update a chat's title
router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ error: "title is required" });
    }

    const result = await pool.query(
      `UPDATE chats SET title = $1 WHERE id = $2 RETURNING *`,
      [title, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Chat not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/chats/:id — Delete a chat and all its messages (CASCADE handles messages)
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `DELETE FROM chats WHERE id = $1 RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Chat not found" });
    }

    res.json({ message: "Chat deleted", id: result.rows[0].id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;