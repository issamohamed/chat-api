const { Router } = require("express");
const pool = require("../db");

// mergeParams: true is required here because this router is mounted at
// /api/v1/chats/:chatId/messages — without mergeParams, req.params.chatId
// would be undefined.
const router = Router({ mergeParams: true });

// POST /api/v1/chats/:chatId/messages — Add a message to a chat
router.post("/", async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const { role, content } = req.body;

    if (!role || !content) {
      return res.status(400).json({ error: "role and content are required" });
    }

    if (!["user", "assistant", "system"].includes(role)) {
      return res.status(400).json({
        error: "role must be one of: user, assistant, system",
      });
    }

    // Verify the chat exists before inserting
    const chatCheck = await pool.query(`SELECT id FROM chats WHERE id = $1`, [chatId]);
    if (chatCheck.rows.length === 0) {
      return res.status(404).json({ error: "Chat not found" });
    }

    const result = await pool.query(
      `INSERT INTO messages (chat_id, role, content) VALUES ($1, $2, $3) RETURNING *`,
      [chatId, role, content]
    );

    // Touch the chat's updated_at so it sorts to the top of the user's chat list
    await pool.query(`UPDATE chats SET updated_at = NOW() WHERE id = $1`, [chatId]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/chats/:chatId/messages — List all messages in a chat, oldest first
router.get("/", async (req, res, next) => {
  try {
    const { chatId } = req.params;

    const result = await pool.query(
      `SELECT * FROM messages WHERE chat_id = $1 ORDER BY created_at ASC`,
      [chatId]
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;