import express, { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import * as dataService from '../services/dataService';

const router = Router();

// Helper to wrap async route handlers
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next); // Forward errors to Express error handler
  };
};

// --- Board --- 
// GET /api/board - Fetch combined board data (columns, tasks, order)
router.get('/board', asyncHandler(async (req: Request, res: Response) => {
  const boardData = await dataService.getBoardData();
  if (!boardData) {
    // This might happen if the default project isn't found, unlikely with seeding
    return res.status(500).json({ message: 'Could not load board data' });
  }
  res.json(boardData);
}));

// --- Columns ---

// POST /api/columns - Create column
// @ts-ignore - Suppressing persistent TS2769 overload error
router.post('/columns', asyncHandler(async (req: Request, res: Response) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ message: 'Column title is required' });
  }
  const result = await dataService.addColumn(title);
  if (!result) {
    return res.status(500).json({ message: 'Failed to create column' });
  }
  // Return the new column and the full updated order
  res.status(201).json({ columns: { [result.newColumn.id]: result.newColumn }, columnOrder: result.updatedOrder });
}));

// PATCH /api/columns/:id - Rename column
// @ts-ignore
router.patch('/columns/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ message: 'New title is required' });
  }
  const updatedColumn = await dataService.renameColumn(id, title);
  if (!updatedColumn) {
    return res.status(404).json({ message: 'Column not found' });
  }
  // Return the updated column (including its taskIds)
  res.json(updatedColumn);
}));

// DELETE /api/columns/:id - Delete column
// @ts-ignore
router.delete('/columns/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await dataService.deleteColumn(id);
  if (!result) {
    return res.status(404).json({ message: 'Column not found' });
  }
  res.status(200).json({ columnId: result.deletedColumnId, columnOrder: result.updatedOrder });
}));

// Note: Column reordering endpoint/functionality not implemented for DB yet.

// --- Tasks ---

// POST /api/tasks - Create a new task
// @ts-ignore - Suppressing persistent TS2769 overload error
router.post('/tasks', asyncHandler(async (req: Request, res: Response) => {
  const { title, columnId, priority, dueDate } = req.body;
  if (!title || !columnId) {
    return res.status(400).json({ message: 'Task title and columnId are required' });
  }
  const result = await dataService.addTask(columnId, title, priority, dueDate);
  if (!result) {
    return res.status(500).json({ message: 'Failed to create task' });
  }
  // Return the new task and the updated task ID list for the column
  res.status(201).json({ task: result.newTask, columnTaskIds: result.updatedColumnTaskIds });
}));

// PATCH /api/tasks/:id - Update task content (NOT for moving)
// @ts-ignore - Suppressing persistent TS2769 overload error
router.patch('/tasks/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  // Extract only fields allowed for update (exclude columnId, id, order)
  const { title, description, priority, dueDate } = req.body;
  const updates = { title, description, priority, dueDate };

  // Remove undefined fields so they don't overwrite existing values unintentionally
  Object.keys(updates).forEach(key => updates[key as keyof typeof updates] === undefined && delete updates[key as keyof typeof updates]);

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: 'No update fields provided' });
  }

  const updatedTask = await dataService.updateTask(id, updates);
  if (!updatedTask) {
    return res.status(404).json({ message: 'Task not found or update failed' });
  }
  res.json(updatedTask);
}));

// POST /api/tasks/:id/move - Move a task between/within columns
// @ts-ignore
router.post('/tasks/:id/move', asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { sourceColumnId, sourceIndex, destColumnId, destIndex } = req.body;

    // Basic validation
    if (sourceColumnId === undefined || sourceIndex === undefined || destColumnId === undefined || destIndex === undefined) {
        return res.status(400).json({ message: 'Missing parameters for task move (sourceColumnId, sourceIndex, destColumnId, destIndex)' });
    }

    const success = await dataService.moveTask(id, sourceColumnId, sourceIndex, destColumnId, destIndex);
    if (!success) {
        // Could be 404 if task/column not found, or 500 if db error
        return res.status(500).json({ message: 'Failed to move task' }); 
    }
    res.status(200).json({ message: 'Task moved successfully' });
}));

// DELETE /api/tasks/:id - Delete a task
// @ts-ignore
router.delete('/tasks/:id', asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await dataService.deleteTask(id);
    if (!result) {
        return res.status(404).json({ message: 'Task not found' });
    }
    // Return the ID of the deleted task and the updated task ID list for the affected column
    res.status(200).json({ taskId: result.deletedTaskId, columnTaskIds: result.updatedColumnTaskIds });
}));

// Basic Error Handler (add after all routes)
router.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Unhandled error:", err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

export default router; 