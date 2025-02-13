const express = require('express');
const router = express.Router();
const User = require('../models/Users'); // Adjust the path as needed
const { updateUserRankAndLevel } = require('../services/rankService'); // External rank logic

router.post('/update-xp', async (req, res) => {
  const { userId, xpGained } = req.body;

  if (!userId || !xpGained) return res.status(400).json({ error: "Missing parameters" });

  try {
    await updateUserRankAndLevel(userId, xpGained);
    const updatedUser = await User.findById(userId);
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get('/top', async (req, res) => {
    try {
      const topUsers = await User.find().sort({ level: -1, xp: -1 }).limit(10);
      res.status(200).json(topUsers);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
module.exports = router;
