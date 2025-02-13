const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Post = require("../models/Post");

// Search users and posts
router.get("/", async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const users = await User.find({ username: { $regex: query, $options: "i" } }).select("username profilePicture");
    const posts = await Post.find({ desc: { $regex: query, $options: "i" } }).select("description");

    res.json([...users, ...posts]);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
});

module.exports = router;
