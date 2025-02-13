const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true, // Use 'required' instead of 'require'
      min: 3,
      max: 20,
      unique: true,
    },
    tagname: {
       type: String,
       unique: true,
       requred: true
    },
    email: {
      type: String,
      required: true, // Use 'required' instead of 'require'
      max: 50,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"], // Email validation regex
    },
    password: {
      type: String,
      required: true,
      min: 6,
    },
    profilePicture: {
      type: String,
      default: "",
    },
    coverPicture: {
      type: String,
      default: "",
    },
    following: { type: [mongoose.Schema.Types.ObjectId], ref: "User", default: [] },
    followers: { type: [mongoose.Schema.Types.ObjectId], ref: "User", default: [] },

    isAdmin: {
      type: Boolean,
      default: false,
    },
    desc: {
      type: String,
      max: 50,
    },
    rank: {
      type: String,
      default: "Bronze",
    },
    level: {
      type: Number,
      default: 10,
    },
    tasksCompleted: {
      type: Number,
      default: 0,
    },
    favoriteGenres: {
      type: [String], // Change to an array of strings
      default: [],
    },
    badges: { type: [String], default: [] }, // Badges for community participation
    activityCount: { type: Number, default: 0 }, // Number of threads or replies
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    rankTag: { type: String, default: 'Chibi Fan' },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
