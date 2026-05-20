const express = require("express");
const User = require("../models/user");
const Property = require("../models/property");
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

// Admin stats route
router.get("/stats", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProperties = await Property.countDocuments();
    
    // Get property counts by type
    const allProperties = await Property.find({});
    const houses = allProperties.filter(p => p.type === 'house' || p.type === 'villa' || p.type === 'flat').length;
    const plots = allProperties.filter(p => p.type === 'plot').length;
    const rentals = allProperties.filter(p => p.type === 'rent').length;

    res.json({
      success: true,
      stats: {
        users: totalUsers,
        properties: totalProperties,
        houses: houses,
        plots: plots,
        rentals: rentals,
        totalRevenue: 0 // Can be calculated from actual sales data
      },
      monthlyData: [],
      housesStatus: []
    });
  } catch (err) {
    console.error("Admin stats error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
