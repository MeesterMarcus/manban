// Keep the console log in db.ts for now

import express, { Express } from 'express';
import cors from 'cors';
// Remove direct type imports, service imports, data storage, etc.
// import { v4 as uuidv4 } from 'uuid';
// import { Project, Task, Column } from './models/types'; // No longer needed here

// Import routers
import projectRoutes from './api/projectRoutes';
import boardRoutes from './api/boardRoutes';

// --- Express App Setup ---
const app: Express = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// --- API Routes ---
// Mount the routers
app.use('/api', projectRoutes); // Mount project routes under /api
app.use('/api', boardRoutes); // Mount board/column/task routes under /api

// Minimal hello endpoint for basic testing (optional)
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from the refactored backend!' });
});

// --- Start Server ---
app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
  // Note: Initial data setup is now handled within dataService.ts when it's loaded
}); 