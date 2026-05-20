const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  location: { type: String },
  state: { type: String },
  district: { type: String },
  type: { type: String },
  images: [{ type: String }],    // Array of Cloudinary image URLs
  area: { type: Number },
  beds: { type: Number },
  baths: { type: Number },
  garages: { type: Number },
  ownerName: { type: String },    // store owner display name
  status: { type: String, default: "available" }, // available, sold, pending
  soldTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  buyerName: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

module.exports = mongoose.models.Property || mongoose.model("Property", propertySchema);
