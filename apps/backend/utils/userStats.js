const supabase = require('./supabase');

const updateUserStats = async (userId, problemId, problemScore, dailyProblemId) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !user) {
      console.error("User stats update failed: User not found");
      return { coins: 0, points: 0, dailySolved: false, streak: 0 };
    }

    // Initialize fields if missing (Supabase usually handles defaults, but to be safe)
    let coins = user.coins || 0;
    let streak = user.streak || 0;
    let score = user.score || 0;
    let solvedProblems = user.solved_problems || [];
    const lastDate = user.last_solved_date; // string YYYY-MM-DD

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Streak Logic
    if (lastDate === today) {
      // Already solved today, streak maintained
    } else if (lastDate === yesterday) {
      streak++;
    } else {
      // Streak broken or new
      streak = 1;
    }

    let coinsEarned = 0;
    let pointsEarned = 0;
    let dailySolved = false;

    // Add to solved problems if new
    const pId = parseInt(problemId);

    // Check uniqueness (solvedProblems is array of ints)
    if (!solvedProblems.includes(pId)) {
      solvedProblems.push(pId);
      coins += 1; // 1 coin per unique problem
      coinsEarned = 1;

      // Add Score
      if (problemScore) {
        score += problemScore;
        pointsEarned = problemScore;
      }
    }

    // Check Daily Problem
    // dailyProblemId might be string or int
    if (dailyProblemId && pId == dailyProblemId) {
      dailySolved = true;
    }

    // Update Supabase
    const { error: updateError } = await supabase
      .from('users')
      .update({
        streak: streak,
        last_solved_date: today,
        coins: coins,
        score: score,
        solved_problems: solvedProblems
      })
      .eq('id', userId);

    if (updateError) {
      console.error("Failed to update user stats:", updateError);
    }

    return { coins: coinsEarned, points: pointsEarned, dailySolved, streak: streak };
  } catch (e) {
    console.error("Error in updateUserStats:", e);
    return { coins: 0, points: 0, dailySolved: false, streak: 0 };
  }
};

module.exports = { updateUserStats };
