const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;
const { updateRankAndLevel } = require('../utils/utils');





// // Multer setup for file uploads
// // Multer setup
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const dir = "upload/temp";
//     if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
//     cb(null, dir);
//   },
//   filename: (req, file, cb) => {
//     cb(null, req.body.name || Date.now() + path.extname(file.originalname));
//   },
// });
// const upload = multer({ storage });

// const validateFile = (filePath) => [".jpg", ".jpeg", ".png"].includes(path.extname(filePath).toLowerCase());

// const retryUpload = async (filePath, folder, retries = 3) => {
//   for (let i = 0; i < retries; i++) {
//     try {
//       return (await cloudinary.uploader.upload(filePath, { folder })).secure_url;
//     } catch (err) {
//       if (i === retries - 1) throw err;
//       await new Promise(r => setTimeout(r, 2000));
//     }
//   }
// };

// // Update Profile Picture
// router.put("/update-profilePicture/:id", upload.single("profilePicture"), async (req, res) => {
//   try {
//     if (!req.file || !validateFile(req.file.path)) return res.status(400).json({ error: "Invalid file" });
//     const result = await retryUpload(req.file.path, "profile_pictures");
//     const user = await User.findById(req.params.id);
//     if (!user) return res.status(404).json({ error: "User not found" });
//     user.profilePicture = result;
//     await user.save();
//     fs.unlinkSync(req.file.path);
//     res.status(200).json(user);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Update Cover Picture
// router.put("/update-coverPicture/:id", upload.single("coverPicture"), async (req, res) => {
//   try {
//     if (!req.file || !validateFile(req.file.path)) return res.status(400).json({ error: "Invalid file" });
//     const result = await retryUpload(req.file.path, "cover_pictures");
//     const user = await User.findById(req.params.id);
//     if (!user) return res.status(404).json({ error: "User not found" });
//     user.coverPicture = result;
//     await user.save();
//     fs.unlinkSync(req.file.path);
//     res.status(200).json(user);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });



// // update user
// router.put("/:id", async (req, res) => {
//   if (req.body.userId === req.params.id || req.body.isAdmin) {
//       if (req.body.password) {
//           try {
//               const salt = await bcrypt.genSalt(10);
//               req.body.password = await bcrypt.hash(req.body.password, salt)
//           } catch (err) {
//               return res.status(500).json(err)
//           }
//       }
//       try {
//           const user = await User.findByIdAndUpdate(req.params.id, { $set: req.body, });
//           res.status(200).json("account has been Updated")
//       } catch (err) {
//           return res.status(500).json(err)
//       }
//   } else {
//       return res.status(403).json("You can Update only ur acc")
//   }
// })

// Update user details

// Update user details
router.put("/:id", async (req, res) => {
  try {
    const updates = { ...req.body };

    // If password is being updated, hash it
    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }

    // Update the user
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    );

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err.message);
  }
});




// delete user
router.delete("/:id", async (req, res) => {
    if (req.body.userId === req.params.id || req.body.isAdmin) {
        try {
            const user = await User.findByIdAndDelete(req.params.id);
            res.status(200).json("account has been Deleted")
        } catch (err) {
            return res.status(500).json(err)
        }
    } else {
        return res.status(403).json("You can Delete only ur acc")
    }
})




// Get a user
router.get("/", async (req, res) => {
    const userId = req.query.userId;
    const username = req.query.username;
    const uniqueTag = req.query.tagname;
    try {
        let user;
        if (userId) {
            user = await User.findById(userId);
        } else if (username) {
            user = await User.findOne({ username: username });
        } else if (uniqueTag) {
          user = await User.findOne({uniqueTag: tagname });
        } else {
            return res.status(400).json({ message: "Missing userId or username" });
        }

        if (!user) {
          // const randomSuffix = Math.floor(1000 + Math.random() * 9000);
          // let uniqueTag = `${username}${randomSuffix}`;
            return res.status(404).json({ message: "User not found" });
        }

        // Exclude sensitive fields
        const { password, updatedAt, ...other } = user._doc;
        res.status(200).json(other);
    } catch (err) {
        console.error("Error fetching user:", err);
        res.status(500).json({ message: "Internal server error", error: err });
    }
});

// Get friends
router.get("/friends/:userId", async (req, res) => {
    try {
      // Fetch the user by ID
      const user = await User.findById(req.params.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      // Fetch all friends using the IDs in the `following` array
      const friends = await Promise.all(
        (user.following || []).map((friendId) => User.findById(friendId))
      );
  
      // Map over friends and construct a friend list
      const friendList = friends.map((friend) => ({
        _id: friend._id,
        username: friend.username,
        profilePicture: friend.profilePicture,
      }));
  
      res.status(200).json(friendList);
    } catch (err) {
      console.error("Error fetching friends:", err);
      res.status(500).json({ error: "An error occurred while fetching friends" });
    }
  });
  


// follow user
router.put("/:id/follow", async (req, res) => {
    if (req.body.userId !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);
            if (!user.followers.includes(req.body.userId)) {
                await user.updateOne({ $push: { followers: req.body.userId } })
                await currentUser.updateOne({ $push: { following: req.params.id } })
                res.status(200).json("user has been followed")
            } else {
                res.status(403).json("You already follow this nigga")
            }
        } catch (err) {
            res.status(500).json(err)
        }
    } else {
        res.status(403).json("You cant follow your self")
    }
})
// unfollow user
router.put("/:id/unfollow", async (req, res) => {
    if (req.body.userId !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);
            if (user.followers.includes(req.body.userId)) {
                await user.updateOne({ $pull: { followers: req.body.userId } })
                await currentUser.updateOne({ $pull: { following: req.params.id } })
                res.status(200).json("user has been unfollowed")
            } else {
                res.status(403).json("You dont follow this nigga")
            }
        } catch (err) {
            res.status(500).json(err)
        }
    } else {
        res.status(403).json("You cant unfollow your self")
    }
})


router.get("/suggested/:id", async (req, res) => {
    try {
        const currentUser = await User.findById(req.params.id);
        const users = await User.find({ _id: { $nin: [...currentUser.following, req.params.id] } }).select(
            "username profilePicture desc level rank followers"
        );
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json(err);
    }
});


router.get("/:id/followers", async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate("followers", "username profilePicture desc");
        res.status(200).json(user.followers);
    } catch (err) {
        res.status(500).json(err);
    }
});



router.get("/:id/following", async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate("following", "username profilePicture desc");
        res.status(200).json(user.following);
    } catch (err) {
        res.status(500).json(err);
    }
});





router.post('/complete-task', async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json('User not found');

        // Increment task count and experience points
        user.tasksCompleted += 1;
        user.experiencePoints += 50; // Example: 50 XP per task

        await user.save();

        // Update rank and level
        const updatedUser = await updateRankAndLevel(userId);

        res.status(200).json(updatedUser);
    } catch (err) {
        res.status(500).json(err.message);
    }
});

// Get followers of a user
router.get("/:userId/followers", async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).populate("followers", "username profilePicture");
        if (!user) return res.status(404).json("User not found");
        res.status(200).json(user.followers);
    } catch (err) {
        res.status(500).json(err);
    }
});

  
  // Delete Account
  router.delete('/delete-account/:id', async (req, res) => {
    try {
      const userId = req.params.id;
      await User.findByIdAndDelete(userId);
      res.status(200).json({ message: 'Account deleted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to delete account' });
    }
  });
  
  
module.exports = router