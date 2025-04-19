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

### Option 1: Hybrid Mode (DB in Docker, Code Locally - Recommended for Dev)

This approach uses Docker only for the PostgreSQL database, allowing you to run the backend and frontend locally with faster hot-reloading.

**Prerequisites:**
*   Docker Desktop running.
*   A `.env` file created in the project root (see `.env.example` or instructions below).

**Workflow:**

1.  **Start Everything (DB Container + Local Servers):**
    Open a terminal in the project root and run:
    ```bash
    npm run dev
    ```
    *   This command will first ensure the PostgreSQL Docker container (`db`) is running (using `npm run db:start`).
    *   Then, it will start both the backend and frontend development servers concurrently in the same terminal.

2.  **Access:** Open your browser to `http://localhost:3000` (or the port specified by the React dev server).

3.  **Stopping:** 
    *   Stop the local servers: Press `Ctrl + C` in the terminal running `npm run dev`.
    *   Stop the database container (optional, if you want to free up resources): Run `npm run db:stop` or `npm run docker:down`.

**`.env` File Setup:**
Create a file named `.env` in the project root directory with the following content (adjust password if needed):
```dotenv
# .env for local backend connecting to Docker DB
DB_HOST=localhost
DB_PORT=5432
DB_USER=kanban_user
DB_PASSWORD=supersecretpassword
DB_NAME=kanban_db
```

### Option 2: Full Docker Mode (All Services in Docker)

Runs the entire application (PostgreSQL, Backend, Frontend/Nginx) using Docker Compose. This is closer to a production setup but typically has slower startup and no hot-reloading for code changes.

**Prerequisites:**
*   Docker Desktop running.

**Workflow:**

1.  **Build and Start Containers:**
    From the project root directory, run:
    ```bash
    npm run docker:up:d -- --build
    ```
    (Use `npm run docker:up` to run in the foreground and see logs).

2.  **Access:** Open your browser to `http://localhost:8080` (served by Nginx).

3.  **View Logs:**
    ```bash
    docker-compose logs -f 
    ```

4.  **Stopping:**
    ```bash
    npm run docker:down
    ```

## Available Scripts

*   `npm install`: Installs dependencies for root and all workspaces.
*   `npm run dev:backend`: Starts the backend development server (`nodemon`).
*   `npm run dev:frontend`: Starts the frontend development server (`react-scripts start`).
*   `npm run build:backend`: Runs the TypeScript build for the backend.
*   `npm run build:frontend`: Creates a production build of the frontend app.
*   `npm run build`: Builds both backend and frontend.
*   `npm run dev`: **Starts DB container** (if not running) AND **both** backend/frontend dev servers concurrently.

*   `npm run db:start`: Starts **only** the PostgreSQL container using Docker Compose (used by `npm run dev`).
*   `npm run db:stop`: Stops **only** the PostgreSQL container.

*   `npm run docker:build`: Builds the Docker images for backend & frontend using `docker-compose build`.
*   `npm run docker:up`: Starts **all** containers (DB, Backend, Frontend) using `docker-compose up`.
*   `npm run docker:up:d`: Starts **all** containers in detached mode.
*   `npm run docker:down`: Stops and removes **all** containers defined in `docker-compose.yml`.

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