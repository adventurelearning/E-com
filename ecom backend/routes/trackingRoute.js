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
console.log(trackingData);

    if (orderId && currentStatus?.toLowerCase() === "delivered") {
      const order = await Order.findById(orderId);

if (order && order.status !== "delivered") {
  order.status = "delivered";
  order.trackingId = trackingNumber;
  order.trackingCourier = courier;

  const deliveredAt =
    trackingData?.checkpoints?.find(c => c.tag?.toLowerCase() === "delivered")?.checkpoint_time ||
    new Date();

  // Only push if no delivered entry exists
  const alreadyDelivered = order.statusHistory.some(h => h.status === "delivered");
  if (!alreadyDelivered) {
    order.statusHistory.push({
      status: "delivered",
      changedAt: new Date(deliveredAt),
      note: "Auto-marked delivered from AfterShip",
      trackingId: trackingNumber,
      trackingCourier: courier,
    });
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
