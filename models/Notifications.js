const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Who receives the notification
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Who triggered it
    type: { type: String, enum: ["like", "comment", "follow", "message", "auto"], required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", NotificationSchema);

