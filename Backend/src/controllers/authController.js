const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function forgotPassword(req, res) {
  // Find the user by email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  // Generate a password reset token and set its expiration date
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "8h",
  });
  user.passwordResetToken = token;
  user.passwordResetExpires = Date.now() + 3600000; // 1 hour
  await user.save();

  // Send the password reset email
  const resetUrl = `http://localhost:3001/reset-password?token=${token}`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: "Password Reset Request",
    html: `
        <p>Attendance App : You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
      `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ message: "Password reset email sent" });
  } catch (err) {
    console.error("Failed to send password reset email:", err);
    res.status(500).json({ error: "Failed to send password reset email" });
  }
}

async function resetPassword(req, res) {
  // Validate the password reset token
  const token = req.query.token;
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

  // Find the user by their ID and token, and check if the token is still valid
  const user = await User.findOne({
    _id: decodedToken.id,
    passwordResetToken: token,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return;
    res.redirect(
      "/reset-password?message=Invalid or expired password reset token"
    );
  }

  // Update the user's password and remove the reset token and its expiration date
  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // Send a confirmation email
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: "Password Reset Confirmation",
    html: `
      <p>Your password has been successfully reset. If you did not initiate this request, please contact us immediately.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.redirect("/reset?message=Password reset successful");
  } catch (err) {
    console.error("Failed to send password reset confirmation email:", err);
    res.redirect(
      "/reset-password?message=Failed to send password reset confirmation email"
    );
  }
}
//

// async function login(req, res) {
//   const { email, password } = req.body;

//   try {
//     // Find the user by email and check if the password matches
//     const user = await User.findOne({ email });

//     if (!user || !user.comparePassword(password)) {
//       return res.status(401).json({ error: "Invalid credentials" });
//     }

//     // If authentication is successful, generate a JWT token
//     const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

//     // Send user data and token in the response
//     // Instead of sending a JSON response, you can set a cookie or response header with the token
//     // and then redirect to the landing page on the frontend.
//     // Here, we'll set a response header 'Authorization' with the token.
//     res.setHeader("Authorization", `Bearer ${token}`);

//     // Now, you can redirect to the landing page using React Router's Redirect component
//     res.redirect("/landing"); // Adjust the route as needed
//   } catch (error) {
//     console.error("Login error:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// }

module.exports = {
  forgotPassword,
  resetPassword,
  
};
