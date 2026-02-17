const axios = require('axios');

const LEETCODE_API_ENDPOINT = 'https://leetcode.com/graphql';

const QUESTION_DETAIL_QUERY = `
query questionData($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    questionId
    title
    content
  }
}
`;

async function main() {
  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Content-Type': 'application/json',
      'Referer': 'https://leetcode.com/'
    };

    console.log("Fetching detail...");
    const response = await axios.post(LEETCODE_API_ENDPOINT, {
      query: QUESTION_DETAIL_QUERY,
      variables: { titleSlug: 'two-sum' }
    }, { headers });

    console.log("Status:", response.status);
    console.log("Data keys:", Object.keys(response.data));
    if (response.data.errors) {
      console.log("Errors:", JSON.stringify(response.data.errors));
    }
    if (response.data.data) {
      console.log("Questions count:", response.data.data.problemsetQuestionList.questions.length);
      console.log("First Q:", response.data.data.problemsetQuestionList.questions[0]);
    }
  } catch (e) {
    console.error("Axios Error:", e.message);
    if (e.response) {
      console.error("Response Status:", e.response.status);
      console.error("Response Data:", e.response.data);
    }
  }
}

main();
