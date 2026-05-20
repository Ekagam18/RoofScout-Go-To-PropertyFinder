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

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

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
app.use(express.static(path.join(__dirname, "../client/dist")));

// SPA Catch-all
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
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
