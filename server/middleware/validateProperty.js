module.exports = (req, res, next) => {
  const { title, address, state, price, type } = req.body;
  if (!title || !address || !state || !price || !type) {
    return res.status(400).json({ success: false, message: "Missing required property fields" });
  }
  next();
};
