const express = require("express");
const Theme = require("../models/theme");

const router = express.Router();

// Get latest theme or default
router.get("/", async (req, res) => {
  try {
    const theme = await Theme.findOne().sort({ createdAt: -1 });
    res.json(theme || {});
  } catch (error) {
    res.status(500).json({ message: "Error fetching theme", error });
  }
});

// Create new theme
router.post("/", async (req, res) => {
  try {
    const { primary, secondary, accent, darkMode } = req.body;
    const theme = await Theme.create(req.body);
    res.json({ message: "Theme created successfully", theme });
  } catch (error) {
    console.log(error);
    
    res.status(500).json({ message: "Error creating theme", error });
  }
});

// Update existing theme
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { primary, secondary, accent, darkMode } = req.body;

    const theme = await Theme.findByIdAndUpdate(
      id,
      { primary, secondary, accent, darkMode },
      { new: true }
    );

    if (!theme) return res.status(404).json({ message: "Theme not found" });

    res.json({ message: "Theme updated successfully", theme });
  } catch (error) {
    res.status(500).json({ message: "Error updating theme", error });
  }
});

module.exports = router;
