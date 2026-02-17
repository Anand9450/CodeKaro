const axios = require('axios');

async function fetchLargeBatch() {
  try {
    console.log("Fetching 120 problems...");
    // 120 limit
    const batch = await axios.post('http://localhost:5000/admin/fetch-batch?limit=120');
    console.log("Batch Result:", batch.data);
  } catch (e) {
    console.error("Error:", e.message);
  }
}

fetchLargeBatch();
