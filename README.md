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

*   [Node.js](https://nodejs.org/) (v22 or later recommended)
*   [npm](https://www.npmjs.com/) (v10 or later recommended, comes with Node.js)
*   [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/) (for Option 2)

## Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd <repo-folder>
    ```

2.  **Install All Dependencies:**
    From the project root directory, run:
    ```bash
    npm install
    ```
    This command uses npm workspaces to install dependencies for the root, backend, and frontend.

## Running the Application (Development)

### Option 1: Running Locally (Single Command - Recommended for Dev)

From the project **root** directory, simply run:

```bash
npm run dev
```

This uses `npm-run-all` to start both the backend API server (typically on `http://localhost:3001`) and the frontend development server (typically on `http://localhost:3000` or the next available port) concurrently in a single terminal.

### Option 2: Running Locally (Manual - Separate Terminals)

If you prefer separate terminals:

1.  **Start the Backend Server:**
    ```bash
    npm run dev:backend
    ```
    (Alternatively: `cd backend && npm start` - requires `npm run build` first if not using nodemon/ts-node)

2.  **Start the Frontend Server:**
    In a **separate terminal**, run:
    ```bash
    npm run dev:frontend
    ```
    (Alternatively: `cd frontend && npm start`)

## Running the Application (Docker)

Ensure you have Docker and Docker Compose installed.

1.  **Build and Start Containers:**
    From the project root directory, run:
    ```bash
    npm run docker:up:d -- --build
    ```
    *   This uses the npm script which runs `docker-compose up -d --build`.
    *   It builds the images (if needed) and starts the containers in detached mode.
    *   You can also use `npm run docker:build` and `npm run docker:up` separately.

2.  **Access the Application:**
    *   The frontend is accessible at `http://localhost:8080` (served and proxied by Nginx).

3.  **View Logs:**
    ```bash
    docker-compose logs -f
    ```
    (Or `docker-compose logs backend` / `docker-compose logs frontend` for specific services)

4.  **Stopping Containers:**
    ```bash
    npm run docker:down
    ```
    (This runs `docker-compose down`)

## Available Scripts

### Root (`./`)

*   `npm install`: Installs dependencies for root and all workspaces.
*   `npm run dev:backend`: Starts the backend development server (`nodemon`).
*   `npm run dev:frontend`: Starts the frontend development server (`react-scripts start`).
*   `npm run build:backend`: Runs the TypeScript build for the backend.
*   `npm run build:frontend`: Creates a production build of the frontend app.
*   `npm run build`: Builds both backend and frontend.
*   `npm run dev`: Starts **both** backend and frontend development servers concurrently.
*   `npm run docker:build`: Builds the Docker images using `docker-compose build`.
*   `npm run docker:up`: Starts the containers using `docker-compose up`.
*   `npm run docker:up:d`: Starts the containers in detached mode using `docker-compose up -d`.
*   `npm run docker:down`: Stops and removes the containers using `docker-compose down`.

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