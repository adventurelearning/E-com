// models/theme.js
const mongoose = require("mongoose");

const themeSchema = new mongoose.Schema(
  {
    primary: { type: String, default: "#3b82f6" },
    secondary: { type: String, default: "#6b7280" },
    accent: { type: String, default: "#f59e0b" },
    darkMode: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Theme = mongoose.model("Theme", themeSchema);

module.exports = Theme;
