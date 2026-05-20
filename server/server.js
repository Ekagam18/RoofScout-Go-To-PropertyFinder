const path = require("path");
// Load environment variables as the very first thing
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const adminRoutes = require("./routes/admin");
const authRoutes = require("./routes/auth");
const propertyRoutes = require("./routes/properties");
const requestRoutes = require("./routes/requests");
const paymentRoutes = require("./routes/payments");
const logger = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

// Validate critical environment variables
if (!MONGO_URI) {
  console.error("❌ ERROR: MONGO_URI is not defined in environment variables!");
}
if (!JWT_SECRET) {
  console.error("❌ ERROR: JWT_SECRET is not defined in environment variables!");
}

// Connect to MongoDB
if (MONGO_URI) {
  console.log("⏳ Attempting to connect to MongoDB...");
  mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  })
    .then(() => {
      console.log("✅ MongoDB Connected Successfully");
      const host = mongoose.connection.host;
      console.log(`📡 Connected to host: ${host}`);
    })
    .catch(err => {
      console.error("❌ MongoDB Connection Error:", err.message);
      if (err.message.includes("ETIMEOUT")) {
        console.error("🔍 Potential Issue: Connection timed out. This usually means the server cannot reach MongoDB Atlas.");
      } else if (err.message.includes("ECONNREFUSED")) {
        console.error("🔍 Potential Issue: Connection refused. Check if the port and host in MONGO_URI are correct.");
      } else if (err.message.includes("authentication failed")) {
        console.error("🔍 Potential Issue: Authentication failed. Check your username and password in MONGO_URI.");
      }
      console.error("👉 Action Required: Please verify that you have whitelisted '0.0.0.0/0' (all IPs) in your MongoDB Atlas Network Access settings for deployment.");
    });
}

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(logger);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set("io", io);

// API Routes
app.get("/api/health", (req, res) => res.status(200).json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/request", requestRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);

// Serve Static Files (Production)
const clientDistPath = path.join(__dirname, "../client/dist");
console.log("Checking for client dist at:", clientDistPath);
if (require("fs").existsSync(clientDistPath)) {
  console.log("✅ Client dist found");
} else {
  console.warn("⚠️ Warning: Client dist NOT found at", clientDistPath);
}

app.use(express.static(clientDistPath));

// SPA Catch-all
app.get("*", (req, res) => {
  const indexPath = path.join(clientDistPath, "index.html");
  if (require("fs").existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ 
      success: false, 
      message: `index.html not found at ${indexPath}`,
      currentDir: __dirname,
      parentDir: path.join(__dirname, ".."),
      clientDistPath
    });
  }
});

// Error Handler
app.use(errorHandler);

// Socket.io Logic
io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  const userId = socket.handshake.auth?.userId;
  if (userId) {
    socket.join(`user_${userId}`);
  }

  const token = socket.handshake.auth?.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.role === "admin") {
        socket.join("admins");
      }
    } catch (err) {}
  }

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`🚀 RoofScout Server v1.1 running on port ${PORT}`);
  });
}

module.exports = app;
