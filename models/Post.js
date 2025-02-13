const mongoose = require("mongoose");


const PostSchema = new mongoose.Schema({

    userId: {
        type: String,
        required: true
    },
    desc: {
        type: String,
        max: 500,
    },
    media: {
        type: String, // Store Cloudinary URL of the media (image/video)
      },
      likes: [
        {
          userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          reaction: { type: String, enum: ["sugoi", "yamete", "baka", "uwu"] },
        },
      ],
    comments: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User", // Reference to the User model
                required: true,
            },
            text: {
                type: String,
                required: true,
            },
            timestamp: {
                type: Date,
                default: Date.now,
            },
            likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
        },
    ],
    starRatings: {
        type: [Number], // Store star ratings (e.g., [5, 4, 3])
        default: [],
    },
    averageRating: {
        type: Number, // Calculate average rating
        default: 0,
    },

    tags: {
        type: [String], // Array of strings for hashtags
        default: [],
      },
      location: {
        type: String, // Single location
        default: "",
      },
      genre: {
        type: String, // Single genre
        default: "",
      },

},
    { timestamps: true }
)

module.exports = mongoose.model("Post", PostSchema);