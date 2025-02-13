const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");
const Notification = require("../models/Notifications"); // Assuming the schema is in models/Notification.js

// Create a new notification
app.post("/notifications", async (req, res) => {
  try {
    const { userId, type, message, postId } = req.body;

    const notification = new Notification({
      userId,
      type,
      message,
      postId,
    });

    await notification.save();
    res.status(201).json({ message: "Notification created", notification });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// Get all notifications for a specific user
app.get("/notifications/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 }) // Newest first
      .lean();

    res.status(200).json({ notifications });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// Mark a single notification as read
app.post("/notifications/mark-as-read", async (req, res) => {
  try {
    const { id } = req.body;

    const notification = await Notification.findByIdAndUpdate(
      id,
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({ message: "Notification marked as read", notification });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark all notifications for a user as read
app.post("/notifications/mark-all-read", async (req, res) => {
  try {
    const { userId } = req.body;

    await Notification.updateMany({ userId, read: false }, { read: true });

    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
