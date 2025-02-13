


























// // models/community.js
// const mongoose = require("mongoose");

// const communitySchema = new mongoose.Schema({
//   name: { type: String, required: true, unique: true },
//   description: { type: String, required: true },
//   owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   members: [
//     {
//       user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//       role: { type: String, enum: ["Owner", "Admin", "Moderator", "VIP", "Member"], default: "Member" },
//     },
//   ],
//   type: { type: String, enum: ["Free", "Premium"], default: "Free" },
//   messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }], // Reference to Message schema
//   createdAt: { type: Date, default: Date.now },
// });

// communitySchema.methods.addMember = function (userId, role = "Member") {
//   if (this.members.length >= 1500 && this.type === "Free") {
//     throw new Error("Member limit reached for free community.");
//   }
//   this.members.push({ user: userId, role });
// };

// module.exports = mongoose.model("Community", communitySchema);
