const { getDB, saveDB } = require('./jsonDb');

const updateUserStats = (userId, problemId, problemScore, dailyProblemId) => {
  const db = getDB();
  const user = db.users.find(u => u.id === userId);

  if (!user) return { coins: 0, points: 0, dailySolved: false };

  // Initialize fields if missing
  user.coins = user.coins || 0;
  user.streak = user.streak || 0;
  user.score = user.score || 0;
  user.solvedProblems = user.solvedProblems || [];

  const today = new Date().toISOString().split('T')[0];
  const lastDate = user.lastSolvedDate;

  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (lastDate === today) {
    // Already solved today, streak maintained
  } else if (lastDate === yesterday) {
    user.streak++;
  } else {
    // Streak broken or new
    user.streak = 1;
  }

  user.lastSolvedDate = today;

  let coinsEarned = 0;
  let pointsEarned = 0;
  let dailySolved = false;

  // Add to solved problems if new
  const pId = parseInt(problemId);
  if (!user.solvedProblems.includes(pId)) {
    user.solvedProblems.push(pId);
    user.coins += 1; // 1 coin per unique problem
    coinsEarned = 1;

    // Add Score
    if (problemScore) {
      user.score += problemScore;
      pointsEarned = problemScore;
    }
  }

  // Check Daily Problem
  if (dailyProblemId && pId === dailyProblemId) {
    dailySolved = true;
    // Bonus for daily? User request: "rotating golden Coin that flased ... on summiting correct solution"
    // We return the flag, frontend handles animation.
  }

  saveDB(db);
  return { coins: coinsEarned, points: pointsEarned, dailySolved, streak: user.streak };
};

module.exports = { updateUserStats };
