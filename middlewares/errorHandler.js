const errorHandler = (err, req, res, next) => {
  console.error("error occurred ", err.stack);
  res.status(500).json({
    success: false,
    message: " Unexpected error occured",
    error: err.stack,
  });
};

module.exports = { errorHandler };
