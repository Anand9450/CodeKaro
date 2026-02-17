const axios = require('axios');
async function seed() {
  try {
    console.log("Seeding Popular Problems...");
    const res = await axios.post('http://localhost:5000/admin/seed-leetcode');
    console.log(res.data);
  } catch (e) {
    console.error(e.message);
  }
}
seed();
