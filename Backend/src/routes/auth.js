const express = require("express");
const passport = require("passport"); // Import passport
require("../config/passport-config"); // Import passport-config
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const {
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const router = express.Router();
const multer = require("multer");

const upload = multer();

// User registration
router.post("/register", async (req, res) => {
  try {
    const { email, firstName, lastName, employee_id, password } = req.body;

    // Check if user with the same email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User with this email already exists.",
      });
    }

    // Ensure that password is defined and not empty
    if (!password) {
      return res.status(400).json({
        message: "Password is required.",
      });
    }
    const existingEmployee = await User.findOne({ employee_id });

    if (existingEmployee) {
      return;
      res.status(400).json({
        message: "Employee ID already exists. Please choose a different one.",
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Rest of your registration code

    const user = new User({
      email,
      firstName,
      lastName,
      employee_id,
      password: hashedPassword,
    });

    await user.save();
    res.status(201).json({
      message: "User registered successfully.",
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      // Handling required field validation error
      return res.status(400).json({
        message: "Required fields are missing or invalid.",
      });
    }
    console.error("Registration Error:", error);
    res.status(500).json({
      message: "An error occurred while registering.",
    });
  }
});

//User login
router.post("/login", (req, res, next) => {
  passport.authenticate(
    "local",
    { session: false },
    async (err, user, info) => {
      if (err) {
        console.error("Authentication error:", err);
        return res.status(500).json({
          message: "An internal server error occurred.",
        });
      }

      if (!user) {
        return res.status(401).json({
          message: "Incorrect username or password.",
        });
      }

      try {
        // Generate JWT token
        const token = jwt.sign(
          {
            sub: user._id,
          },
          process.env.JWT_SECRET
        );

        // Send the token along with user data as JSON response
        res.json({
          message: "Authentication successful.",
          token: token,
          user: {
            email: user.email,
            // Include other user data you want to send here
          },
        });
      } catch (error) {
        console.error("Error generating token:", error);
        return res.status(500).json({
          message: "An error occurred while generating the token.",
        });
      }
    }
  )(req, res, next);
});

router.post("/forgot-password", upload.none(), forgotPassword);
router.post("/reset-password", resetPassword);
//router.post("/login", login)
// Add this route to check the validity of the token
router.post("/check-token", async (req, res) => {
  try {
    const { token } = req.body;

    // Verify the token and check if it's still valid
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        // Token is invalid or expired
        return res.status(401).json({ message: "Invalid or expired token" });
      }

      // Token is valid, you can optionally return additional data if needed
      return res.status(200).json({ message: "Token is valid" });
    });
  } catch (error) {
    console.error("Error checking token:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//reset route
router.get("/reset-password", async (req, res) => {
  try {
    const token = req.query.token;

    // Validate the password reset token

    if (!token) {
      return;
      res.status(400).json({
        message: "Invalid reset token provided.",
      });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user by their ID and token, and check if the token is still valid

    const user = await User.findOne({
      _id: decodedToken.id,
      passwordResetToken: token,

      passwordResetExpires: {
        $gt: Date.now(),
      },
    });

    if (!user) {
      return;
      res.status(401).json({
        error: "Invalid or expired password reset token",
      });
    }

    // Render a password reset form or JSON response, depending on your needs

    // In this example, we'll send a JSON response indicating the token is valid

    return;
    res.status(200).json({
      message: "Password reset link is valid.",
      email: user.email,
    });
  } catch (err) {
    console.error("Error:", err);

    return;
    res.status(500).json({
      error: "Internal server error.",
    });
  }
});

module.exports = router;
