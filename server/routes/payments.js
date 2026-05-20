const express = require("express");
const Payment = require("../models/payment");
const Property = require("../models/property");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * POST /api/payments
 * Create a new payment record
 */
router.post("/", authMiddleware, async (req, res, next) => {
  try {
    const {
      propertyId,
      userId,
      ownerId,
      buyerName,
      ownerName,
      propertyTitle,
      price,
      paymentType,
      amountPaid,
      remainingAmount,
      emiDuration,
      emiAmount,
      paymentMethod,
      transactionId
    } = req.body;

    const newPayment = new Payment({
      propertyId,
      userId,
      ownerId,
      buyerName,
      ownerName,
      propertyTitle,
      price,
      paymentType: paymentType || 'full',
      amountPaid,
      remainingAmount: remainingAmount || 0,
      emiDuration,
      emiAmount,
      paymentMethod,
      transactionId,
      paymentDate: new Date(),
      paymentStatus: remainingAmount > 0 ? 'partial' : 'completed'
    });

    await newPayment.save();

    // Proactively remove the property from listings upon successful payment
    try {
      await Property.findByIdAndDelete(propertyId);
      console.log(`✅ Property ${propertyId} removed from listings after payment.`);
    } catch (propErr) {
      console.error(`⚠️ Failed to remove property ${propertyId} after payment:`, propErr.message);
      // We don't fail the whole request if property removal fails, 
      // but the payment is already saved.
    }

    res.status(201).json({ success: true, message: "Payment recorded successfully and listing removed", payment: newPayment });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/payments
 * Get all payments (for admin)
 */
router.get("/", async (req, res, next) => {
  try {
    const payments = await Payment.find()
      .populate('propertyId', 'title price location state type image')
      .populate('userId', 'name email')
      .populate('ownerId', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, payments });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/payments/user/:userId
 * Get payments for a specific user
 */
router.get("/user/:userId", async (req, res, next) => {
  try {
    const payments = await Payment.find({ userId: req.params.userId })
      .populate('propertyId', 'title price location state type image')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, payments });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/payments/property/:propertyId
 * Get payments for a specific property
 */
router.get("/property/:propertyId", async (req, res, next) => {
  try {
    const payments = await Payment.find({ propertyId: req.params.propertyId })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, payments });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/payments/stats
 * Get payment statistics
 */
router.get("/stats", async (req, res, next) => {
  try {
    const totalPayments = await Payment.countDocuments();
    const totalRevenue = await Payment.aggregate([
      { $group: { _id: null, total: { $sum: "$amountPaid" } } }
    ]);
    const pendingAmount = await Payment.aggregate([
      { $match: { paymentStatus: 'partial' } },
      { $group: { _id: null, total: { $sum: "$remainingAmount" } } }
    ]);
    
    res.json({
      success: true,
      stats: {
        totalPayments,
        totalRevenue: totalRevenue[0]?.total || 0,
        pendingAmount: pendingAmount[0]?.total || 0
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
