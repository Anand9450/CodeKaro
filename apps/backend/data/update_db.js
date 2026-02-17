const fs = require('fs');
const path = require('path');
const { problems } = require('./problems_data');

const dbPath = path.join(__dirname, 'db.json');

try {
  let db = { users: [], problems: [] };
  if (fs.existsSync(dbPath)) {
    db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  }

  // Update problems
  // We want to replace the problems array entirely or merge?
  // Since we enriched all of them, let's replace the problems list with our new list
  // but be careful if there are other problems added dynamically (unlikely for now).
  // Let's just overwrite problems for this task.
  db.problems = problems;

  // Initialize user stats if missing
  db.users = db.users.map(user => ({
    ...user,
    coins: user.coins || 0,
    streak: user.streak || 0,
    lastSolvedDate: user.lastSolvedDate || null,
    solvedProblems: user.solvedProblems || []
  }));

  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  console.log('Database updated successfully');
} catch (err) {
  console.error('Error updating DB:', err);
}
