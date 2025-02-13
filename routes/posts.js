const mongoose = require("mongoose");
const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;




// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "upload/post";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true }); // Ensure directory exists
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, req.body.name || Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Helper function to validate file types
const validateFile = (filePath) => {
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".mp4"];
  const ext = path.extname(filePath).toLowerCase();
  return allowedExtensions.includes(ext);
};

// Retry upload logic for Cloudinary
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const retryUpload = async (filePath, retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const ext = path.extname(filePath).toLowerCase();
      let result;

      if ([".jpg", ".jpeg", ".png", ".gif"].includes(ext)) {
        result = await cloudinary.uploader.upload(filePath, { folder: "animecon" });
      } else if (ext === ".mp4") {
        result = await cloudinary.uploader.upload(filePath, { folder: "animecon", resource_type: "video" });
      } else {
        throw new Error("Unsupported file type");
      }

      console.log(`Upload successful: ${result.secure_url}`);
      return result.secure_url;
    } catch (error) {
      console.error(`Retrying upload (${attempt}/${retries})...`, error.message);
      if (attempt === retries) throw error;
      await sleep(2000);
    }
  }
};

// Create Post Route
router.post("/", upload.single("file"), async (req, res) => {
  try {
    const { userId, desc, tags, location, genre } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    let result = null;

    if (req.file) {
      if (!validateFile(req.file.path)) {
        return res.status(400).json({ error: "Invalid file format" });
      }

      try {
        result = await retryUpload(req.file.path);
      } catch (cloudinaryErr) {
        return res.status(500).json({ error: "File upload to Cloudinary failed", details: cloudinaryErr.message });
      }
    }

    const newPost = new Post({
      userId,
      desc,
      media: result,
      tags: tags ? tags.split(",") : [],
      location,
      genre,
    });

    const savedPost = await newPost.save();

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(201).json(savedPost);
  } catch (err) {
    console.error("Error creating post:", err.message);
    res.status(500).json({ error: "Post creation failed", details: err.message });
  }
});



  // // Multer setup for file uploads
  // const storage = multer.diskStorage({
  //   destination: (req, file, cb) => {
  //     cb(null, "upload/images");
  //   },
  //   filename: (req, file, cb) => {
  //     cb(null, req.body.name || Date.now() + path.extname(file.originalname));
  //   },
  // });

  // const upload = multer({ storage: storage });

  // const validateFile = (filePath) => {
  //   const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".mp4"];
  //   const ext = path.extname(filePath).toLowerCase();
  //   return allowedExtensions.includes(ext);
  // };


  // const retryUpload = async (filePath, retries = 3) => {
  //   for (let attempt = 1; attempt <= retries; attempt++) {
  //     try {
  //       let result;

  //       // Check file extension to determine upload method
  //       const ext = path.extname(filePath).toLowerCase();

  //       if ([".jpg", ".jpeg", ".png", ".gif"].includes(ext)) {
  //         // Upload image
  //         result = await cloudinary.uploader.upload(filePath, {
  //           folder: "animecon",
  //         });
  //       } else if (ext === ".mp4") {
  //         // Upload video
  //         result = await cloudinary.uploader.upload_video(filePath, {
  //           folder: "animecon",
  //         });
  //       } else {
  //         throw new Error("Unsupported file type");
  //       }

  //       return result;
  //     } catch (error) {
  //       console.error(`Retrying upload (${attempt}/${retries})...`, error.message);
  //       if (attempt === retries) throw error;
  //       await sleep(2000); // Wait for 2 seconds before retrying
  //     }
  //   }
  // };


  // // Create Post Route
  // router.post("/", upload.single("file"), async (req, res) => {
  //   try {
  //     console.log("Request body:", req.body);  // Log request body
  //     console.log("Uploaded file:", req.file);  // Log uploaded file details

  //     const { userId, desc, tags, location, genre } = req.body;

  //     if (!userId) {
  //       return res.status(400).json({ error: "userId is required" });
  //     }
  //     if (req.file) {
  //       try {
  //         result = await retryUpload(req.file.path);
  //         result = await cloudinary.uploader.upload(req.file.path, { folder: "animecon" });
  //         console.log("Cloudinary upload result:", result);
  //       } catch (cloudinaryErr) {
  //         console.error("Error uploading file to Cloudinary:", cloudinaryErr);
  //         return res.status(500).json({ error: "File upload to Cloudinary failed", details: cloudinaryErr.message });
  //       }
  //     }

  //     const newPost = new Post({
  //       userId,
  //       desc,
  //       media: result ? result.secure_url : null,
  //       tags: tags ? tags.split(",") : [],
  //       location,
  //       genre,
  //     });

  //     const savedPost = await newPost.save();
  //     console.log("Post saved:", savedPost);

  //     // Delete the local file after successful upload
  //     if (req.file) {
  //       try {
  //         fs.unlinkSync(req.file.path);
  //       } catch (err) {
  //         console.error("Error deleting local file:", err);
  //       }
  //     }

  //     res.status(201).json(savedPost);
  //   } catch (err) {
  //     console.error("Error creating post:", err.message);
  //     res.status(500).json({ error: "Post creation failed", details: err.message });
  //   }
  // });


  // // Create a post
  // router.post("/", async (req, res) => {
  //   const newPost = new Post(req.body);
  //   try {
  //     const savedPost = await newPost.save();
  //     res.status(200).json(savedPost);
  //   } catch (err) {
  //     res.status(500).json(err);
  //   }
  // });

  // Update a post
  router.put("/:id", async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      if (post.userId === req.body.userId) {
        await post.updateOne({ $set: req.body });
        res.status(200).json("the post has been updated");
      } else {
        res.status(403).json("you can update only your post");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  });

  // Delete a post
  router.delete("/:id", async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      if (post.userId === req.body.userId) {
        await post.deleteOne();
        res.status(200).json("the post has been deleted");
      } else {
        res.status(403).json("you can delete only your post");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  });

  // // Like / dislike a post
  // router.put("/:id/like", async (req, res) => {
  //   try {
  //     const post = await Post.findById(req.params.id);
  //     if (!post.likes.includes(req.body.userId)) {
  //       await post.updateOne({ $push: { likes: req.body.userId } });
  //       res.status(200).json("The post has been liked");
  //     } else {
  //       await post.updateOne({ $pull: { likes: req.body.userId } });
  //       res.status(200).json("The post has been disliked");
  //     }
  //   } catch (err) {
  //     res.status(500).json(err);
  //   }
  // });

  router.put("/:id/like", async (req, res) => {
    try {
      const { userId, reaction } = req.body;
  
      if (!userId || !reaction) {
        return res.status(400).json({ message: "userId and reaction are required" });
      }
  
      const post = await Post.findById(req.params.id);
  
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
  
      // Ensure likes exist and is an array
      if (!Array.isArray(post.likes)) {
        post.likes = [];
      }
  
      const existingLikeIndex = post.likes.findIndex(
        (like) => like.userId?.toString() === userId
      );
  
      if (existingLikeIndex !== -1) {
        // User already liked, update or remove the reaction
        if (post.likes[existingLikeIndex].reaction === reaction) {
          post.likes.splice(existingLikeIndex, 1); // Remove like if it's the same reaction
        } else {
          post.likes[existingLikeIndex].reaction = reaction;
        }
      } else {
        // Add a new like with the reaction
        post.likes.push({ userId, reaction });
      }
  
      await post.save();
      res.status(200).json({ message: "Reaction updated", likes: post.likes });
    } catch (err) {
      console.error("Error updating likes:", err.message);
      res.status(500).json({ message: "Error updating likes", error: err.message });
    }
  });
  

  router.get("/timeline/:userId", async (req, res) => {
    const userId = req.params.userId;
     const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId format" });
    }

    try {
      const currentUser = await User.findById(userId);
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const timelinePosts = await Post.find({
        userId: { $in: [currentUser._id, ...currentUser.following] },
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);


      if (!timelinePosts.length) {
        return res.status(200).json({ message: "No posts found for timeline" });
      }

      res.status(200).json(timelinePosts);
    } catch (err) {
      console.error("Error fetching timeline posts:", err);
      res.status(500).json({
        message: "Failed to fetch timeline posts",
        error: err.message, // Include the error message
      });
    }
  });

  // Get user's all posts
  router.get("/profile/:username", async (req, res) => {
    try {
      const user = await User.findOne({ username: req.params.username });
      const posts = await Post.find({ userId: user._id });
      res.status(200).json(posts);
    } catch (err) {
      res.status(500).json(err);
    }
  });

  // Comment on a post
  router.post("/:id/comment", async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      if (!post) {
        return res.status(404).json("Post not found");
      }

      const user = await User.findById(req.body.userId); // Fetch the user data
      if (!user) {
        return res.status(404).json("User not found");
      }

      const comment = {
        userId: req.body.userId,
        text: req.body.text,
      };

      post.comments.push(comment);
      await post.save();
      res.status(200).json(comment); // Return the updated comment
    } catch (err) {
      res.status(500).json(err);
    }
  });

  // Fetch comments with usernames
  router.get("/:id/comment", async (req, res) => {
    try {
      const post = await Post.findById(req.params.id).populate({
        path: "comments.userId",
        select: "username profilePicture",
      });

      if (!post) {
        return res.status(404).json("Post not found");
      }

      // Map through comments to include user details
      const commentsWithUserDetails = post.comments.map((comment) => ({
        _id: comment._id,
        text: comment.text,
        timestamp: comment.timestamp,
        likes: comment.likes,
        username: comment.userId.username, // Retrieved from populate
        profilePicture: comment.userId.profilePicture, // Optional
      }));

      res.status(200).json(commentsWithUserDetails);
    } catch (err) {
      res.status(500).json(err);
    }
  });


  // Like a comment
  router.put("/:id/comment/:commentId/like", async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      if (!post) {
        return res.status(404).json("Post not found");
      }

      const comment = post.comments.id(req.params.commentId);
      if (!comment) {
        return res.status(404).json("Comment not found");
      }

      const userId = req.body.userId;

      // Check if the user has already liked the comment
      const userIndex = comment.likes.indexOf(userId);
      if (userIndex === -1) {
        comment.likes.push(userId);  // Add user to the likes array
      } else {
        comment.likes.splice(userIndex, 1);  // Remove user from the likes array if they have already liked
      }

      await post.save();
      res.status(200).json(comment);  // Send back the updated comment
    } catch (err) {
      console.error("Error liking comment:", err);
      res.status(500).json({ message: "An error occurred while liking the comment", error: err });
    }
  });




  // Rate a post
  router.put("/:id/rate", async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      if (!post) {
        return res.status(404).json("Post not found");
      }

      const { rating } = req.body;
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json("Rating must be between 1 and 5");
      }

      post.starRatings.push(rating);
      post.averageRating =
        post.starRatings.reduce((sum, val) => sum + val, 0) / post.starRatings.length;

      await post.save();
      res.status(200).json({ averageRating: post.averageRating }); // Return updated average rating
    } catch (err) {
      res.status(500).json(err);
    }
  });


  // Route to fetch posts by location
  router.get("/posts/location/:userId", async (req, res) => {
    try {
      const user = await User.findById(req.params.userId);
      if (!user) {
        return res.status(404).json("User not found");
      }
  
      // Find posts by users in the same location as the logged-in user
      const posts = await Post.find({ location: user.location });
      res.status(200).json(posts);
    } catch (err) {
      console.error(err);
      res.status(500).json("Server error");
    }
  });

  // Fetch Random Posts
router.get("/random", async (req, res) => {
  try {
    const count = await Post.countDocuments(); // Get total post count
    const randomPosts = await Post.aggregate([
      { $sample: { size: 15 } }, // Fetch 20 random posts
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $project: {
          _id: 1,
          userId: 1,
          desc: 1,
          media: 1,
          tags: 1,
          location: 1,
          genre: 1,
          createdAt: 1,
          userDetails: { username: 1, profilePicture: 1 }, // Include user details
        },
      },
    ]);

    res.status(200).json(randomPosts);
  } catch (err) {
    console.error("Error fetching random posts:", err.message);
    res.status(500).json({ error: "Failed to fetch random posts", details: err.message });
  }
});


  module.exports = router;
