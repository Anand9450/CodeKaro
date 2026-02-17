const axios = require('axios');

async function updateProfile() {
  const userId = 1; // Assuming Anand is ID 1
  const updateData = {
    userId: userId,
    mobile: "+91 6378411035",
    linkedIn: "https://www.linkedin.com/in/anandshukla",
    github: "https://github.com/anandshukla",
    leetCode: "https://leetcode.com/anandshukla",
    codeForces: "https://codeforces.com/profile/anandshukla",
    bio: "Full Stack Developer | Competitive Programmer | Tech Enthusiast"
  };

  try {
    console.log("Updating profile for user ID:", userId);
    const res = await axios.put('http://localhost:5000/user/profile', updateData);
    console.log("Profile Updated Successfully!");
    console.log("Updated User Data:", res.data.user);
  } catch (error) {
    console.error("Error updating profile:", error.message);
  }
}

updateProfile();
