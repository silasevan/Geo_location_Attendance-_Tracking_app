// routes/landingPage.js
const express = require("express");
const router = express.Router();

// Define a route handler for the landing page
router.get("", (req, res) => {
  // Instead of rendering an HTML view, send JSON data
  const token = req.query.token;

  // You can send any JSON data you need for your React frontend
  res.json({ token });
});

module.exports = router;
