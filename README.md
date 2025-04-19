# Kanban Board

A simple Jira-like task board application with a Node.js/TypeScript backend and a React/TypeScript frontend.

## Features

*   Create, rename, and delete columns.
*   Create, view, edit, and delete tasks within columns.
*   Drag-and-drop tasks between columns.
*   Basic task filtering via a search bar.
*   (Future) Multi-project support.

## Folder Structure

```
/
├── backend/         # Node.js/Express/TypeScript API
│   ├── src/
│   │   ├── api/       # API route handlers
│   │   ├── models/    # Data type definitions
│   │   ├── services/  # Data access/logic service
│   │   └── server.ts  # Express server setup
│   ├── dist/        # Compiled JavaScript output
│   ├── node_modules/
│   ├── package.json
│   ├── tsconfig.json
│   └── ...
├── frontend/        # React/TypeScript UI (Create React App)
│   ├── public/
│   ├── src/
│   │   ├── components/ # React components (Board, Column, TaskCard, Header, etc.)
│   │   ├── services/   # Frontend API service (taskService)
│   │   ├── App.css
│   │   ├── App.tsx
│   │   ├── index.css
│   │   ├── index.tsx
│   │   └── types.ts    # Frontend type definitions
│   ├── node_modules/
│   ├── package.json
│   ├── tsconfig.json
│   └── ...
├── .gitignore       # Root Git ignore configuration
├── README.md        # This file
└── ...
```

## Prerequisites

*   [Node.js](https://nodejs.org/) (v18 or later recommended - currently using v22)
*   [npm](https://www.npmjs.com/) (usually comes with Node.js)

## Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd <repo-folder>
    ```

2.  **Install Backend Dependencies:**
    ```bash
    cd backend
    npm install
    cd ..
    ```

3.  **Install Frontend Dependencies:**
    ```bash
    cd frontend
    npm install
    cd ..
    ```

## Running the Application

## Option 1: Running Locally (npm)

You need to run both the backend and frontend servers concurrently in separate terminals.

1.  **Start the Backend Server:**
    *   Navigate to the `backend` directory: `cd backend`
    *   Build the TypeScript code: `npm run build`
    *   Start the server: `npm start`
    *   The backend should be running on `http://localhost:3001`.

2.  **Start the Frontend Server:**
    *   Navigate to the `frontend` directory: `cd frontend`
    *   Start the development server: `npm start`
    *   The application should automatically open in your browser, usually at `http://localhost:3000`.

## Option 2: Running with Docker Compose (Recommended for Production-like)

Ensure you have Docker and Docker Compose installed.

1.  **Build and Start Containers:**
    From the project root directory, run:
    ```bash
    docker-compose up --build
    ```
    *   This command will build the Docker images for both the frontend and backend (if they don't exist or have changed) and then start the containers.
    *   Use the `-d` flag (`docker-compose up --build -d`) to run in detached mode (in the background).

2.  **Access the Application:**
    *   The frontend should be accessible at `http://localhost:8080` (mapped to the Nginx container).
    *   The backend API is accessible at `http://localhost:3001` (mapped to the backend container).

3.  **Stopping Containers:**
    *   If running in the foreground, press `Ctrl + C`.
    *   If running in detached mode, use `docker-compose down` from the project root directory.

## Available Scripts

### Root (`./`)

*   `npm run install:all`: Installs dependencies for root and both workspaces.
*   `npm run dev:backend`: Runs `npm start` in the `backend` workspace.
*   `npm run dev:frontend`: Runs `npm start` in the `frontend` workspace.
*   `npm run build:backend`: Runs `npm run build` in the `backend` workspace.
*   `npm run build:frontend`: Runs `npm run build` in the `frontend` workspace.
*   `npm run build`: Builds both backend and frontend.
*   `npm run dev`: Placeholder script (run dev scripts separately).

### Backend (`./backend`)

*   `npm run build`: Compiles TypeScript to JavaScript (`dist/` folder).
*   `npm start`: Starts the compiled backend server from the `dist/` folder.
*   `npm test`: (Not yet implemented) Runs tests.

### Frontend (`./frontend`)

*   `npm start`: Runs the app in development mode.
*   `npm run build`: Builds the app for production (`build/` folder).
*   `npm test`: Runs the test runner.
*   `npm run eject`: Ejects from Create React App configuration (use with caution).

## Future Improvements

*   Implement proper database storage instead of in-memory arrays (e.g., add a PostgreSQL container to `docker-compose.yml`).
*   Add user authentication and authorization.
*   Associate columns and tasks with specific projects.
*   Implement project creation and switching UI.
*   Add column drag-and-drop reordering.
*   Improve error handling and user feedback.
*   Add more detailed task fields (priority, assignee, due date, etc.).
*   Write unit and integration tests.
*   Configure Nginx for optimized production serving (caching, HTTPS).
*   Use environment variables for configuration (API URLs, database connections). 