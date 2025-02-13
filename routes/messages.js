// routes/messages.js
const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer-Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "chat-media",
    resource_type: "auto", // Supports both images and videos
  },
});

const upload = multer({ storage });

// Create a new message
router.post("/", upload.single("file"), async (req, res) => {
  const { conversationId, sender, text } = req.body;
  let fileUrl = null;

  try {
    if (req.file) {
      fileUrl = req.file.path; // Cloudinary returns the file URL in path
    }

    const newMessage = new Message({
      conversationId,
      sender,
      text: text || "",
      image: req.file && req.file.mimetype.startsWith("image") ? fileUrl : null,
      video: req.file && req.file.mimetype.startsWith("video") ? fileUrl : null,
    });

    const savedMessage = await newMessage.save();
    res.status(200).json(savedMessage);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get messages for a conversation
router.get("/:conversationId", async (req, res) => {
  try {
    const messages = await Message.find({ conversationId: req.params.conversationId });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
