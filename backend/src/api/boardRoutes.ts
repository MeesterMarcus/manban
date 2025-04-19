import { Router, Request, Response } from 'express';
import express from 'express'; // Import express namespace for types
import * as dataService from '../services/dataService';

const router = Router();

// --- Board --- 
// GET /api/board - Fetch combined board data (columns, tasks, order)
router.get('/board', (req: Request, res: Response) => {
  // TODO: Later, filter by projectId
  const boardData = dataService.getBoardData();
  res.json(boardData);
});

// --- Columns ---

// POST /api/columns - Create column
// @ts-ignore - Suppressing persistent TS2769 overload error
router.post('/columns', (req: express.Request, res: express.Response) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ message: 'Column title is required' });
  }
  const result = dataService.addColumn(title);
  res.status(201).json({ columns: { [result.newColumn.id]: result.newColumn }, columnOrder: result.updatedOrder });
});

// PATCH /api/columns/:id - Rename column
// @ts-ignore
router.patch('/columns/:id', (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ message: 'New title is required' });
  }
  const updatedColumn = dataService.renameColumnById(id, title);
  if (!updatedColumn) {
    return res.status(404).json({ message: 'Column not found' });
  }
  res.json(updatedColumn);
});

// DELETE /api/columns/:id - Delete column
// @ts-ignore
router.delete('/columns/:id', (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  const result = dataService.deleteColumnById(id);
  if (!result) {
    return res.status(404).json({ message: 'Column not found' });
  }
  res.status(200).json({ columnId: result.deletedColumnId, columnOrder: result.updatedOrder });
});

// POST /api/columns/reorder - Reorder columns
// @ts-ignore
router.post('/columns/reorder', (req: express.Request, res: express.Response) => {
  const { newColumnOrder } = req.body;
  const result = dataService.reorderColumns(newColumnOrder);
  if (!result) {
     return res.status(400).json({ message: 'Invalid column order provided' });
  }
  res.status(200).json({ columnOrder: result.updatedOrder });
});

// --- Tasks ---

// POST /api/tasks - Create a new task
// @ts-ignore - Suppressing persistent TS2769 overload error
router.post('/tasks', (req: express.Request, res: express.Response) => {
  const { title, description, columnId } = req.body;
  if (!title || !columnId) {
    return res.status(400).json({ message: 'Task title and columnId are required' });
  }
  const result = dataService.addTask(title, columnId, description);
  if (!result) {
     return res.status(400).json({ message: 'Invalid columnId provided' });
  }
  res.status(201).json({ task: result.newTask, column: result.updatedColumn });
});

// PATCH /api/tasks/:id - Update task details/move
// @ts-ignore - Suppressing persistent TS2769 overload error
router.patch('/tasks/:id', (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  const result = dataService.updateTaskById(id, req.body); 
  if (!result) {
    // Handle specific errors? Maybe return 404 if task not found, 400 if invalid move
    return res.status(404).json({ message: 'Task not found or update failed' }); 
  }
  // Return updated task and potentially affected columns
   const responsePayload: any = { task: result.updatedTask };
   if (result.updatedSourceColumn) responsePayload.sourceColumn = result.updatedSourceColumn;
   if (result.updatedDestColumn && result.updatedSourceColumn?.id !== result.updatedDestColumn.id) {
       responsePayload.destColumn = result.updatedDestColumn;
   }
   // For simple updates (no move)
   if (!result.updatedSourceColumn && !result.updatedDestColumn && result.updatedTask.columnId) {
        const col = dataService.getBoardData().columns[result.updatedTask.columnId];
        if(col) responsePayload.column = col;
   }
   res.json(responsePayload);
});

// DELETE /api/tasks/:id - Delete a task
// @ts-ignore
router.delete('/tasks/:id', (req: express.Request, res: express.Response) => {
    const { id } = req.params;
    const result = dataService.deleteTaskById(id);
    if (!result) {
        return res.status(404).json({ message: 'Task not found' });
    }
    res.status(200).json({ taskId: result.deletedTaskId, column: result.updatedColumn });
});

export default router; 