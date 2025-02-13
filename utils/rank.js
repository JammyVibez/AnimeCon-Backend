const User = require('../models/userModel');

const xpThresholds = [
  { xp: 0, level: 1, rankTag: 'Chibi Fan', badge: 'beginner-badge.png' },
  { xp: 200, level: 5, rankTag: 'Shonen Explorer', badge: 'shonen-badge.png' },
  { xp: 500, level: 10, rankTag: 'Seinen Connoisseur', badge: 'seinen-badge.png' },
  { xp: 1000, level: 20, rankTag: 'Otaku Supreme', badge: 'otaku-badge.png' },
  { xp: 2000, level: 30, rankTag: 'Anime Sage', badge: 'sage-badge.png' }
];

const updateUserRankAndLevel = async (userId, xpGained) => {
  const user = await User.findById(userId);
  if (!user) return;

  user.xp += xpGained;

  for (let i = xpThresholds.length - 1; i >= 0; i--) {
    if (user.xp >= xpThresholds[i].xp) {
      user.level = xpThresholds[i].level;
      user.rankTag = xpThresholds[i].rankTag;
      if (!user.badges.includes(xpThresholds[i].badge)) {
        user.badges.push(xpThresholds[i].badge);
      }
      break;
    }
  }

  await user.save();
};

module.exports = { updateUserRankAndLevel };
