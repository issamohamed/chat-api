const { Router } = require("express");
const pool = require("../db");

const router = Router();

// POST /api/v1/users — Create a new user
router.post("/", async (req, res, next) => {
  try {
    const { username, email } = req.body;

    if (!username || !email) {
      return res.status(400).json({ error: "username and email are required" });
    }

    // $1, $2 are parameterized query placeholders — they prevent SQL injection.
    // NEVER use string interpolation (`INSERT INTO users VALUES ('${username}')`)
    // — that's how you get hacked.
    const result = await pool.query(
      `INSERT INTO users (username, email) VALUES ($1, $2) RETURNING *`,
      [username, email]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    // Postgres error code 23505 = unique constraint violation
    if (err.code === "23505") {
      return res.status(409).json({ error: "Username or email already exists" });
    }
    next(err); // Pass unexpected errors to the error handler
  }
});

// GET /api/v1/users/:id — Get a user by their ID
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`SELECT * FROM users WHERE id = $1`, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;