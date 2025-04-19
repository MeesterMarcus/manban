# Project Title (e.g., Jira Better Clone)

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

## Available Scripts

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

*   Implement proper database storage instead of in-memory arrays.
*   Add user authentication and authorization.
*   Associate columns and tasks with specific projects.
*   Implement project creation and switching UI.
*   Add column drag-and-drop reordering.
*   Improve error handling and user feedback.
*   Add more detailed task fields (priority, assignee, due date, etc.).
*   Write unit and integration tests. 