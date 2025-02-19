const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");




// REGISTER
router.post("/register", async (req, res) => {
  try {
      const { username, email, password } = req.body;
      if (!username || !email || !password) {
          return res.status(400).json({ message: "All fields are required" });
      }

      // Generate a new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create a new user
      const newUser = new User({
          username,
          email,
          password: hashedPassword,
      });

      // Save user and respond
      const user = await newUser.save();
      return res.status(200).json(user);
  } catch (err) {
      console.error("Error during registration:", err);
      if (err.code === 11000) {
          return res.status(400).json({ message: "Email or username already exists" });
      }
      return res.status(500).json({ message: "Internal server error", error: err.message });
  }
});


// LOGIN
router.post("/login", async (req, res) => {
  try {
      const user = await User.findOne({ email: req.body.email });
      if (!user) return res.status(404).json("User not found");

      const validPassword = await bcrypt.compare(req.body.password, user.password);
      if (!validPassword) return res.status(400).json("Incorrect password");

      // Add `id` field to the response object
      const userData = { ...user._doc, id: user._id }; 

      return res.status(200).json(userData); // Send user data with `id`
  } catch (err) {
      return res.status(500).json(err);
  }
});




module.exports = router;
