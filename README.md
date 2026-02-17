# CodeKaro - Competitive Programming Platform

CodeKaro is a full-stack competitive programming platform designed to help developers practice coding problems, compete in contests, and track their progress. It features a modern, responsive UI, code execution engine, and comprehensive user profiles.

![CodeKaro Dashboard](./dashboard-screenshot.png)

## 🚀 Features

-   **User Authentication**: Secure Signup/Login with JWT.
-   **Dashboard**: Daily Problem of the Day, Recent Activity, and quick stats.
-   **Extensive Problem Library**: Browse and filter coding problems by difficulty and topic.
-   **In-Browser Code Editor**: Monaco Editor with support for multiple languages (C++, Java, Python, JavaScript).
-   **Code Execution Engine**: Sandboxed execution for verifying solutions against test cases.
-   **Leaderboard & Contests**: Real-time ranking and timed contests.
-   **User Profiles**:
    -   Detailed stats dashboard (Score, Streak, Total Solved).
    -   Coding profile links (LeetCode, CodeForces, GitHub, LinkedIn).
    -   Profile Picture upload.
    -   Heatmap of activity.
    -   Public profile pages (`/u/:username`) for sharing achievements.
-   **Responsive Design**: Built with Tailwind CSS for optimal viewing on all devices.
-   **Search**: Find other users and view their public profiles.

## 🛠 Tech Stack

-   **Frontend**: React, Vite, Tailwind CSS, Monaco Editor
-   **Backend**: Node.js, Express.js
-   **Database**: JSON-based (Custom) / MongoDB (Ready)
-   **Execution**: Child Process / Docker (Optional)
-   **Other**: Redis (Queue), Multer (File Uploads), Axios

## 📦 Installation & Setup

### Prerequisites
-   Node.js (v16+)
-   Redis (Optional, for advanced queue features)
-   Docker (Optional, for isolated code execution)

### 1. Clone the Repository
```bash
git clone https://github.com/StartYourFork/CodeKaro.git
cd CodeKaro
```

### 2. Install Dependencies
Install dependencies for both frontend and backend:
```bash
# Root (if creating workspaces) or manually:
cd apps/backend && npm install
cd ../frontend && npm install
```

### 3. Environment Variables
Create a `.env` file in `apps/backend` (example):
```env
PORT=5000
JWT_SECRET=your_jwt_secret_key
REDIS_URL=redis://localhost:6379
```

### 4. Run the Application
Open two terminals:

**Backend:**
```bash
cd apps/backend
npm start
```
Starts server on `http://localhost:5000`.

**Frontend:**
```bash
cd apps/frontend
npm run dev
```
Starts Vite server on `http://localhost:5173`.

## 📸 Screenshots
*(Add screenshots of Dashboard, Problem Page, Profile here)*

## 🤝 Contributing
Contributions are welcome! Please open an issue or submit a pull request.

## 📄 License
This project is licensed under the MIT License.
