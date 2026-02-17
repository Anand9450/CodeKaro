const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../data/db.json');

const getDB = () => {
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    // If file doesn't exist, return empty structure
    return { users: [], problems: [] };
  }
};

const saveDB = (data) => {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error saving DB:', err);
  }
};

module.exports = { getDB, saveDB };
