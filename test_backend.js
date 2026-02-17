const axios = require('axios');

async function checkBackend() {
  try {
    console.log("Checking GET /...");
    const res = await axios.get('http://localhost:5000/');
    console.log("Status:", res.status);
    console.log("Data:", res.data);
  } catch (err) {
    console.log("GET / Failed:", err.message);
    if (err.response) console.log("Response Data:", err.response.data);
  }
}

checkBackend();
