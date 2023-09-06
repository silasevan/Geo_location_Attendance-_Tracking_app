// routes/user.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");

// GET user profile by ID (example)
router.get("/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // You can customize the response based on your needs
    res.json({ user });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
