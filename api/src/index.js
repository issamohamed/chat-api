// Load .env file FIRST, before any other imports that might read process.env
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const userRoutes = require("./routes/users");
const chatRoutes = require("./routes/chats");
const messageRoutes = require("./routes/messages");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware (order matters) ---

// helmet() sets security headers like X-Content-Type-Options, X-Frame-Options, etc.
app.use(helmet());

// cors() allows requests from any origin. In production you'd restrict this
// to your frontend's domain: cors({ origin: "https://myapp.com" })
app.use(cors());

// Parse JSON request bodies. Without this, req.body would be undefined.
app.use(express.json());

// --- Health check ---
// Railway and monitoring tools hit this to verify the service is alive.
// Kept outside /api/v1 because it's infrastructure, not a business endpoint.
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// --- API v1 Routes ---
// All business logic lives under /api/v1.
// If you ever need breaking changes, create /api/v2 routes alongside these.
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/chats", chatRoutes);
app.use("/api/v1/chats/:chatId/messages", messageRoutes);

// --- Error handler (MUST be registered last) ---
app.use(errorHandler);

// --- Start server ---
// "0.0.0.0" makes the server listen on all network interfaces,
// which is required for Railway to route traffic to it.
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 API server running on port ${PORT}`);
});