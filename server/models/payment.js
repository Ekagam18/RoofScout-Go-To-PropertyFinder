const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  buyerName: { type: String, required: true },
  ownerName: { type: String, required: true },
  propertyTitle: { type: String, required: true },
  price: { type: Number, required: true },
  paymentType: { type: String, enum: ['full', 'emi'], default: 'full' },
  amountPaid: { type: Number, required: true },
  remainingAmount: { type: Number, default: 0 },
  emiDuration: { type: Number }, // in months if EMI
  emiAmount: { type: Number }, // monthly EMI amount
  paymentDate: { type: Date, default: Date.now },
  paymentStatus: { type: String, enum: ['pending', 'partial', 'completed'], default: 'completed' },
  transactionId: { type: String },
  paymentMethod: { type: String }, // e.g., 'card', 'upi', 'netbanking'
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Payment || mongoose.model("Payment", paymentSchema);
