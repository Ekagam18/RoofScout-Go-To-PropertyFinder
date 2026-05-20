module.exports = (err, req, res, next) => {
  const isDev = process.env.NODE_ENV === 'development';
  
  console.error("DEBUG ERROR LOG:", {
    message: err.message,
    url: req.originalUrl,
    method: req.method,
    stack: err.stack
  });

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: isDev ? err.message : "Internal Server Error",
    debugMessage: err.message, // Always provide this for frontend debugging as per project conventions
    stack: isDev ? err.stack : undefined
  });
};
