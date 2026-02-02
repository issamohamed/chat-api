// Express error handlers have 4 parameters — the `err` first parameter
// is what tells Express "this is an error handler, not a regular middleware."
function errorHandler(err, req, res, next) {
    console.error("Unhandled error:", err);
  
    res.status(500).json({
      error: "Internal server error",
      // Only show the real error in non-production environments
      ...(process.env.NODE_ENV !== "production" && { detail: err.message }),
    });
  }
  
  module.exports = errorHandler;