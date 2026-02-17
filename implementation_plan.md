# Implementation Plan - CodeKaro Platform

## Objective
Build a platform called "CodeKaro" using a monorepo structure.
- **Backend**: Node.js/Express
- **Frontend**: React/Tailwind
- **Judge Service**: Separate service for code execution logic.

## Architecture: Monorepo
We will use **npm workspaces** for managing the monorepo. This allows us to manage dependencies from the root and share packages if needed in the future.

### Directory Structure
```
/
  package.json        # Root package.json with workspaces
  apps/
    frontend/         # React + Tailwind (Vite)
    backend/          # Express API
  packages/
    judge/            # Judge Service (Node.js)
```

## Step-by-Step Implementation

### Phase 1: Foundation
1.  Initialize root `package.json` with workspaces.
2.  Create `apps` and `packages` directories.

### Phase 2: Frontend (React + Tailwind)
1.  Initialize React app using Vite in `apps/frontend`.
2.  Install and configure Tailwind CSS.
3.  Install `react-router-dom` for navigation.
4.  Set up basic project structure (components, pages).
    - Landing page with "Aesthetic" design as requested.
    - Login/Signup pages.
    - Auth Context.

### Phase 3: Backend (Express + MongoDB)
1.  Initialize Node.js app in `apps/backend`.
2.  Install `express`, `cors`, `dotenv`.
3.  Install `jsonwebtoken`, `bcryptjs` for authentication.
4.  Install `mongoose` for MongoDB interaction.
5.  Create basic server setup (`index.js`).
6.  Configure Database connection (`config/db.js`).
7.  Create User Model (`models/User.js`).
8.  Implement Auth Routes (`/auth/register`, `/auth/login`).
9.  Implement Auth Middleware.
10. Create Problem Schema (`models/Problem.js`).

### Phase 4: Judge Service
1.  Initialize Node.js app in `packages/judge` (Changed to Python as per request).
2.  Set up basic execution script or service entry point. - **Completed (Python worker)**
3.  Implement Docker containerization for code execution. - **Completed**
4.  Implement Redis queue consumer. - **Completed**

### Phase 5: Linking & Verification
1.  Ensure all services can start.
2.  Verify monorepo commands.
