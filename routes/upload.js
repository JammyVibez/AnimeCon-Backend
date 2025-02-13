const express = require("express");
const multer = require("multer");
const { storage } = require("../utils/cloudinary"); // Adjust the path if needed
const Post = require("../models/Post"); // Import the Post model
const router = express.Router();

const upload = multer({ storage });

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const { userId, desc, tags, location, genre } = req.body;

    // Create a new post with the uploaded file's URL
    const newPost = new Post({
      userId,
      desc,
      media: req.file.path, // Cloudinary URL
      tags: tags ? tags.split(",") : [], // Convert comma-separated tags to an array
      location,
      genre,
    });

    // Save the post to the database
    const savedPost = await newPost.save();

    res.status(201).json(savedPost); // Return the saved post
  } catch (err) {
    console.error("Error creating post:", err.message);
    res.status(500).json({ error: "Post creation failed", details: err.message });
  }
});

module.exports = router;
