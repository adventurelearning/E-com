const express = require("express");
const axios = require("axios");
const Order = require("../models/Order");
const { protect } = require("../middlewares/authMiddleware");
const router = express.Router();

const AFTERSHIP_API_KEY = process.env.AFTERSHIP_API_KEY;

router.post("/", protect, async (req, res) => {
  const { courier, trackingNumber, orderId } = req.body;
  const headers = {
    "aftership-api-key": AFTERSHIP_API_KEY,
    "Content-Type": "application/json",
  };

  try {
    let response;
    try {
      response = await axios.get(
        `https://api.aftership.com/v4/trackings/${courier}/${trackingNumber}`,
        { headers }
      );
    } catch (err) {
      if (err.response?.data?.meta?.code === 4004) {
        // Tracking not found → create first
        await axios.post(
          "https://api.aftership.com/v4/trackings",
          {
            tracking: {
              slug: courier,
              tracking_number: trackingNumber,
            },
          },
          { headers }
        );

        response = await axios.get(
          `https://api.aftership.com/v4/trackings/${courier}/${trackingNumber}`,
          { headers }
        );
      } else {
        throw err;
      }
    }

    const trackingData = response.data?.data?.tracking;
    const currentStatus = trackingData?.tag;

   if (orderId) {
  const order = await Order.findById(orderId);

  if (order) {
    const checkpoints = trackingData?.checkpoints || [];

    checkpoints.forEach((cp) => {
      // Convert checkpoint_time to Date object for comparison
      const checkpointTime = new Date(cp.checkpoint_time);
      const exists = order.statusHistory.some(
        (h) =>
          h.trackingId === trackingNumber &&
          h.changedAt.getTime() === checkpointTime.getTime()
      );

      if (!exists) {
        order.statusHistory.push({
          status: cp.tag || "in_transit",
          changedAt: checkpointTime,
          note: cp.message || cp.location || "Update from AfterShip",
          trackingId: trackingNumber,
          trackingCourier: courier,
          raw: cp, // optional → store full checkpoint object
        });
      }
    });

    // Update order status to delivered if currentStatus is delivered and order is not already delivered
    if (currentStatus?.toLowerCase() === "delivered" && order.status !== "delivered") {
      order.status = "delivered";
      order.trackingId = trackingNumber;
      order.trackingCourier = courier;

      // If there's a delivered checkpoint, we don't need to add manually because the forEach loop above should have added it.
      // But if there isn't one, we might want to add? However, AfterShip should include the delivered checkpoint.
      // So we don't manually add. If we want to be safe, we can check if the delivered checkpoint exists in the checkpoints.
      // If not, then add a delivered statusHistory entry.
      const deliveredCheckpoint = checkpoints.find(c => c.tag?.toLowerCase() === "delivered");
      if (!deliveredCheckpoint) {
        order.statusHistory.push({
          status: "delivered",
          changedAt: new Date(), // or use the current time
          note: "Marked delivered from AfterShip (no checkpoint found)",
          trackingId: trackingNumber,
          trackingCourier: courier,
        });
      }
    }

    await order.save();
  }
}

    res.json(response.data);
  } catch (err) {
    console.error("Error fetching tracking:", err.response?.data || err.message);
    res.status(500).json({ message: "Tracking fetch failed" });
  }
});

module.exports = router;
