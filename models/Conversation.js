// models/Conversation.js
const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema(
    {
      members: {
        type: [String], // Array of user IDs
        required: true,
      },
      lastMessage: {
        type: String,
        default: "", // Optional: Store a preview of the last message
      },
    },
    { timestamps: true }
  );
  
  module.exports = mongoose.model("Conversation", ConversationSchema);
  