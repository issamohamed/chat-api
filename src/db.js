const { Pool } = require("pg");

// Pool manages a set of reusable database connections.
// Instead of opening a new connection for every request (slow),
// the pool keeps connections alive and hands them out as needed.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Required for Supabase — it uses SSL
  max: 20,                            // Max 20 simultaneous connections
  idleTimeoutMillis: 30000,           // Close idle connections after 30s
  connectionTimeoutMillis: 5000,      // Fail if connection takes > 5s
});

// Test the connection immediately on startup.
// If this fails, the process exits — better to crash early than serve 500s.
pool.query("SELECT NOW()")
  .then(() => console.log("✅ Connected to Supabase Postgres"))
  .catch((err) => {
    console.error("❌ Database connection failed:", err.message);
    process.exit(1);
  });

module.exports = pool;