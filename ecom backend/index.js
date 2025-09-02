require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const multer = require("multer");
const cors = require("cors");
const connectDB = require("./config/db");
const errorHandler = require("./utils/errorHandler").errorHandler;
// const { errorHandler } = require('./middlewares/error');
const path = require("path");

const categoryRoutes = require("./routes/categoryRoutes.js");
const SupplierProduct = require("./routes/suplierRoute.js");
const cartRoutes = require("./routes/cartRoute.js");
const orderRoutes = require("./routes/orderRoute.js");
const userRoutes = require("./routes/userRoute.js");
const wishlistRoutes = require("./routes/wishlistRoute.js");
const offerRoutes = require("./routes/offerRoutes.js");
const reviewRoutes = require("./routes/reviewRoutes.js");
const footerRoutes = require('./routes/footer.js');
const logoroutes=require('./routes/logoRoutes.js')
// const uploadRoute = require("./routes/uploadRoute.js");
const themeRoutes = require("./routes/themeRoute.js");
const trackingRoute = require("./routes/trackingRoute.js");
const paymentRoute = require("./routes/paymentRoute.js");
const returnpolicyRoute=require('./routes/returnpolicyRoutes.js');
const privacypolicyRoute=require('./routes/privacyPoilcyRoute.js')
// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Multer Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const productRoutes = require("./routes/productRoutes");
const BannerRoutes = require("./routes/Banner");
const AdminUserRoutes = require("./routes/adminRoutes");
const SubBannerRoutes = require("./routes/SubBannerRoutes");
app.use("/api/categories", categoryRoutes);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Routes
app.use("/api/auth", require("./routes/authRoutes"));


app.use("/api/products", productRoutes);
app.use("/api/banners", BannerRoutes);
app.use("/api/adminUsers", AdminUserRoutes);
app.use("/api/subbanners", SubBannerRoutes);
app.use("/api/supplier-products", SupplierProduct);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api", offerRoutes);
app.use("/api/reviews", reviewRoutes);
app.use('/api/footer', footerRoutes);

app.use("/api/theme", themeRoutes);
app.use("/api/", paymentRoute);


app.use('/api/logo', logoroutes);
app.use("/api/tracking", trackingRoute);

// app.use("/api/upload", uploadRoute);
app.use("/api/returnpolicy",returnpolicyRoute)
app.use("/api/privacypolicy",privacypolicyRoute)

// Error handling middleware
app.use(errorHandler);

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process
  server.close(() => process.exit(1));
});
