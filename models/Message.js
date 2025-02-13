// models/Message.js
const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
      required: true,
    },
    sender: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: null, // URL for uploaded images
    },
    video: {
      type: String,
      default: null, // URL for uploaded videos
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", MessageSchema);