const axios = require('axios');

const API_URL = 'https://backend-oc8vftnmf-anand-shuklas-projects-9aae92af.vercel.app/api';

async function testRegister() {
  const username = `user_${Date.now()}`;
  const email = `${username}@example.com`;
  const password = 'password123';

  console.log(`Attempting to register: ${username} at ${API_URL}/auth/register`);

  try {
    const response = await axios.post(`${API_URL}/auth/register`, {
      username,
      email,
      password
    });

    console.log("Registration SUCCESS:", response.data);
  } catch (error) {
    if (error.response) {
      console.error("Registration FAILED:", error.response.status);
      const data = error.response.data;
      if (typeof data === 'string' && data.trim().startsWith('<')) {
        const titleMatch = data.match(/<title>(.*?)<\/title>/);
        const title = titleMatch ? titleMatch[1] : "No title found";
        console.error("Response is HTML. Title:", title);
        console.error("First 200 chars:", data.substring(0, 200));
      } else {
        console.error("Response Data:", JSON.stringify(data, null, 2));
      }
    } else {
      console.error("Registration ERROR (No Response):", error.message);
    }
  }
}

testRegister();
