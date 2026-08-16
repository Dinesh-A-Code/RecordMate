// Catches any error passed to next(err) and returns a clean JSON response
// instead of leaking a stack trace to the client.
export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    message: err.message || "Server error",
  });
};

// Handles requests to routes that don't exist.
export const notFound = (req, res, next) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};
