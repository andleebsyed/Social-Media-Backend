const routeNotFound = (req, res) => {
  res.json({ success: false, message: "Route Not Found" });
};

module.exports = { routeNotFound };
