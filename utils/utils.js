const router = require("express").Router();
const User = require("../models/User")

const updateRankAndLevel = async (userId) => {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    // Update rank based on followers
    if (user.followers.length >= 5000) {
        user.rank = 'Gold';
    } else if (user.followers.length >= 1000) {
        user.rank = 'Silver';
    } else {
        user.rank = 'Bronze';
    } 

    // Update level based on experience points (e.g., 100 XP per level)
    user.level = Math.floor(user.experiencePoints / 100);

    await user.save();
    return user;
};

module.exports = { updateRankAndLevel };
