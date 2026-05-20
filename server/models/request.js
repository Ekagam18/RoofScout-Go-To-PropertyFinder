const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
  propertyId: mongoose.Schema.Types.ObjectId,
  userId: mongoose.Schema.Types.ObjectId,
  name: String,
  email: String,
  mobile: String,
  requestType: String,
  message: String,
  date: String,
  time: String,
  status: { type: String, default: "Pending" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Request || mongoose.model("Request", requestSchema);
