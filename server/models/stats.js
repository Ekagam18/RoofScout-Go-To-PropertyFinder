const mongoose = require("mongoose");

const statsSchema = new mongoose.Schema({
  totalListed: Number,
  totalSold: Number,
  totalRented: Number,
  revenue: Number
});

module.exports = mongoose.models.Stats || mongoose.model("Stats", statsSchema);
