const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const passport = require("passport"); // Import passport
require("./src/config/passport-config"); // Import passport-config




// Load environment variables from .env file
dotenv.config();


const app = express();

const mongoose = require("mongoose");

// Replace <your-db-uri> with the actual URI of your MongoDB database

const employee_info =
  "mongodb+srv://silasevan:santification@cluster0.wrkgl.mongodb.net/?retryWrites=true&w=majority";

mongoose
  .connect(employee_info, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to the database");
  })
  .catch((error) => {
    console.error("Database connection error:", error);
  });

const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize()); // Initialize Passport
//app.use(passport.session());

// Import and use your routes here
const testRoute = require("./src/routes/test");
const authRoute = require("./src/routes/auth");
const landingPageRoute = require("./src/routes/landingPage");
const userRouter = require("./src/routes/users"); 

app.use("/api/test", testRoute);
app.use("/api/auth", authRoute);
app.use("/landingPage", landingPageRoute); // Use the correct path here
app.use("/api/user", userRouter);


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
