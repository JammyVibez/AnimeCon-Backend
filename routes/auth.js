const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");




// REGISTER
router.post("/register", async (req, res) => {
    try {
      // Generate a new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      // Create a new user
      const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword,
      });
  
      // Save user and respond
      const user = await newUser.save();
      return res.status(200).json(user); // Success response
    } catch (err) {
      console.error("Error during registration:", err); // Log detailed error
      if (err.code === 11000) { // Duplicate key error (email or username)
        return res.status(400).json({ message: "Email or username already exists" });
      }
      return res.status(500).json({ message: "Internal server error", error: err.message });
    }
  });
  

// LOGIN
router.post("/login", async (req, res) => {
    try {
        // Find user by email
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json("User not found"); // Added return
        }

        // Validate password
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) {
            return res.status(400).json("Incorrect password"); // Added return
        }

        // Respond with user details
        return res.status(200).json(user); // Added return
    } catch (err) {
        return res.status(500).json(err); // Added return
    }
});




module.exports = router;
