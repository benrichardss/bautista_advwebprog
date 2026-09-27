const express = require("express");
const Log = require("../models/logModel");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const logs = await Log.find().sort({ createdAt: -1 }).limit(20);
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch logs" });
  }
});

module.exports = router;