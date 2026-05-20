const express = require("express");
const Property = require("../models/property");

const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const { cloudinary } = require("../config/cloudinary");

const router = express.Router();

/**
 * Helper: state -> common city aliases
 * Extend this map with more states and cities as needed.
 */
const STATE_MAP = {
  punjab: ["punjab", "mohali", "ludhiana", "amritsar", "jalandhar", "patiala", "bathinda", "barnala"],
  haryana: ["haryana", "gurgaon", "gurugram", "faridabad", "panipat", "ambala", "hisar", "karnal", "rohtak", "sonipat"],
  delhi: ["delhi", "new delhi", "noida", "gurgaon", "faridabad"],
  rajasthan: ["rajasthan", "jaipur", "udaipur", "jodhpur", "ajmer", "alwar", "kota", "bikaner"],
  uttarpradesh: ["uttar pradesh", "up", "lucknow", "kanpur", "agra", "varanasi", "noida", "ghaziabad"],
  // add more states and common cities here
};

/**
 * GET /api/properties
 * Public: fetch all properties with optional filtering
 *  - If state provided, checks both state and location fields.
 *  - If state provided and no results, try alias-based fallback using STATE_MAP.
 */
router.get("/", async (req, res, next) => {
  try {
    const { state, type, minPrice, maxPrice } = req.query;
    let filter = { status: "available" }; // Default: only show available properties

    // Type filter
    if (type && type !== "all") filter.type = type;

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // If state provided, build an OR that checks state and location fields
    if (state) {
      const stateRegex = new RegExp(state, "i");
      filter.$or = [
        { state: stateRegex },      // match state field
        { location: stateRegex }    // fallback: match location/city text
      ];
    }

    // Query DB
    let properties = await Property.find(filter).populate("user", "name email");

    // If state was provided but no results, try alias fallback using STATE_MAP
    if (state && properties.length === 0) {
      const key = state.toLowerCase();
      const aliases = STATE_MAP[key] || [];

      if (aliases.length > 0) {
        const aliasOr = aliases.map((a) => ({ location: new RegExp(a, "i") }));
        // keep other filters (type, price) by merging
        const aliasFilter = { ...filter, $or: aliasOr };
        properties = await Property.find(aliasFilter).populate("user", "name email");
      }
    }

    // Map properties to include singular 'image' for frontend compatibility
    const mappedProperties = properties.map(p => {
      const doc = p.toObject();
      return {
        ...doc,
        image: (doc.images && doc.images.length > 0) ? doc.images[0] : null
      };
    });

    return res.json({ success: true, properties: mappedProperties });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/properties/user
 * Protected: list properties created by the logged-in user
 */
router.get("/user", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const properties = await Property.find({ user: userId }).sort({ createdAt: -1 });
    
    // Map for frontend compatibility
    const mappedProperties = properties.map(p => {
      const doc = p.toObject();
      return {
        ...doc,
        image: (doc.images && doc.images.length > 0) ? doc.images[0] : null
      };
    });

    return res.json({ success: true, properties: mappedProperties });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/properties/:id/view
 * Public: view single property by id (JSON API)
 */
router.get("/:id/view", async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id).populate("user", "name email");
    if (!property) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }

    const mapped = property.toObject();
    mapped.image = (mapped.images && mapped.images.length > 0) ? mapped.images[0] : null;

    return res.json({ success: true, property: mapped });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /properties/:id/ssr
 * SSR: Server-Side Rendered property view using EJS
 */
router.get("/:id/ssr", async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id).populate("user", "name email");
    if (!property) {
      return res.status(404).render("error", { message: "Property not found" });
    }
    
    // Render EJS template with property data
    res.render("property", {
      property: {
        title: property.title,
        address: property.location,
        state: property.state,
        price: property.price.toLocaleString("en-IN"),
        type: property.type,
        status: "Available",
        description: property.description,
        area: property.area,
        beds: property.beds,
        baths: property.baths,
        ownerName: property.ownerName || property.user?.name || "Owner"
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/properties/add
 * Protected: add a new property with image uploads
 * Expects multipart/form-data with fields:
 *  title, description, price, location, state, district, type, area, beds, baths, garages, ownerName
 *  images (array of image files)
 */
router.post("/add", authMiddleware, upload.array('images', 10), async (req, res, next) => {
  try {
    const {
      title,
      description,
      price,
      location,
      state,
      district,
      type,
      area,
      beds,
      baths,
      garages,
      ownerName
    } = req.body;

    if (!title || !price) {
      return res.status(400).json({ success: false, message: "Title and price are required" });
    }

    // Extract image URLs from uploaded files
    const imageUrls = req.files ? req.files.map(file => file.path) : [];

    const newProperty = new Property({
      title,
      description: description || "",
      price: Number(price),
      location: location || "",
      state: state || "",
      district: district || "",
      type: type || "plot",
      images: imageUrls,       // Array of Cloudinary URLs
      area: area ? Number(area) : undefined,
      beds: beds ? Number(beds) : undefined,
      baths: baths ? Number(baths) : undefined,
      garages: garages ? Number(garages) : undefined,
      ownerName: ownerName || "", // store owner display name
      user: req.user.id
    });

    await newProperty.save();
    
    // Emit socket event for new property
    const io = req.app.get("io");
    if (io) {
      io.emit("propertyAdded", {
        type: "propertyAdded",
        title: newProperty.title,
        ownerName: newProperty.ownerName,
        property: newProperty,
      });
    }
    
    return res.status(201).json({ success: true, property: newProperty });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/properties/:id
 * Protected (Admin only): Edit a property
 */
router.put("/:id", authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const property = await Property.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!property) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }

    // Emit socket event for property update
    const io = req.app.get("io");
    if (io) {
      io.emit("propertyUpdated", {
        type: "propertyUpdated",
        title: property.title,
        property: property,
      });
    }

    return res.json({ success: true, property });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/properties/:id
 * Protected (Admin only): Delete a property and its images from Cloudinary
 */
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;

    const property = await Property.findByIdAndDelete(id);

    if (!property) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }

    // Delete images from Cloudinary
    if (property.images && property.images.length > 0) {
      const imagePublicIds = property.images.map(url => {
        // Extract public ID from Cloudinary URL
        // URL format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/public_id.jpg
        const parts = url.split('/');
        const filename = parts[parts.length - 1];
        const publicId = filename.split('.')[0];
        return `roofscout/properties/${publicId}`;
      });

      await cloudinary.api.delete_resources(imagePublicIds);
    }

    // Emit socket event for property deletion
    const io = req.app.get("io");
    if (io) {
      io.emit("propertyDeleted", {
        type: "propertyDeleted",
        title: property.title,
        property: property,
      });
    }

    return res.json({ success: true, message: "Property deleted successfully" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
