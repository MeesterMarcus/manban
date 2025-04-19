import { v4 as uuidv4 } from 'uuid';
import { Project, Task, Column, BoardData } from '../models/types';
import pool from '../db';

// In-memory storage (replace with DB)
let projects: { [key: string]: Project } = {}; 
let defaultProjectId: string | null = null; 
let tasks: { [key: string]: Task } = {};
let columns: { [key: string]: Column } = {}; 
let columnOrder: string[] = []; 

// --- Initialization --- 
const setupInitialData = () => {
  // Reset stores
  projects = {};
  defaultProjectId = null;
  tasks = {};
  columns = {};
  columnOrder = [];

  // Create Default Project
  const defaultProj: Project = {
    id: uuidv4(),
    name: 'My Kanban Board',
    key: 'KAN'
  };
  projects[defaultProj.id] = defaultProj;
  defaultProjectId = defaultProj.id;
  console.log('Default project created:', defaultProj);

  // Create default columns and tasks
  const todoColId = uuidv4();
  const inProgColId = uuidv4();
  const doneColId = uuidv4();

  const task1Id = uuidv4();
  const task2Id = uuidv4();
  const task3Id = uuidv4();

  columns = {
    [todoColId]: { id: todoColId, title: 'To Do', taskIds: [task2Id] },
    [inProgColId]: { id: inProgColId, title: 'In Progress', taskIds: [task1Id] },
    [doneColId]: { id: doneColId, title: 'Done', taskIds: [task3Id] },
  };
  columnOrder = [todoColId, inProgColId, doneColId];

  tasks = {
    [task1Id]: { id: task1Id, title: 'Implement Backend API', description: 'Add CRUD endpoints', columnId: inProgColId, priority: 'High', dueDate: '2025-04-30' },
    [task2Id]: { id: task2Id, title: 'Design Frontend UI', columnId: todoColId, priority: 'Medium' },
    [task3Id]: { id: task3Id, title: 'Setup Project Structure', description: 'Initialize project', columnId: doneColId, priority: 'Low' },
  };
  console.log('Initial board data set up for default project.');
};

setupInitialData(); // Initialize on service load

// --- Service Functions --- 

// Helper to get the default project ID (can be cached or enhanced later)
const getDefaultProjectId = async (): Promise<string | null> => {
  try {
    const res = await pool.query('SELECT id FROM projects WHERE name = $1', ['Default Project']);
    return res.rows.length > 0 ? res.rows[0].id : null;
  } catch (err) {
    console.error('Error fetching default project ID:', err);
    return null;
  }
};

// Projects
export const getProjectById = async (id: string): Promise<Project | null> => {
  try {
    const res = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
    return res.rows.length > 0 ? res.rows[0] : null;
  } catch (err) {
    console.error(`Error fetching project ${id}:`, err);
    return null;
  }
};

export const getDefaultProject = async (): Promise<Project | null> => {
  const defaultId = await getDefaultProjectId();
  if (!defaultId) return null;
  return getProjectById(defaultId);
};

// TODO: Add createProject, updateProject, etc.

// Board Data for the Default Project
export const getBoardData = async (): Promise<BoardData | null> => {
  const projectId = await getDefaultProjectId();
  if (!projectId) {
    console.error('Could not find default project for getBoardData');
    return null;
  }

  try {
    // Fetch columns ordered correctly
    const columnsRes = await pool.query<Column & { taskIds?: string[] }>( // Add taskIds temporarily
      'SELECT id, name as title, "order" FROM columns WHERE "projectId" = $1 ORDER BY "order" ASC',
      [projectId]
    );

    const columns: { [key: string]: Column } = {};
    const columnOrder: string[] = [];
    const columnIdMap: { [key: string]: Column } = {}; // For quick lookup
    
    for (const row of columnsRes.rows) {
        // Map db 'name' to type 'title'
        const col: Column = { id: row.id, title: row.title, taskIds: [] }; 
        columns[col.id] = col;
        columnOrder.push(col.id);
        columnIdMap[col.id] = col;
    }

    // Fetch tasks for these columns ordered correctly
    if (columnOrder.length > 0) {
      const tasksRes = await pool.query<Task & { columnid: string }>(
        'SELECT id, content as title, "dueDate", priority, "columnId", "order" FROM tasks WHERE "columnId" = ANY($1::uuid[]) ORDER BY "order" ASC',
        [columnOrder] // Pass array of column IDs
      );

      const tasks: { [key: string]: Task } = {};
      for (const row of tasksRes.rows) {
         // Map db 'content' to type 'title'. 
         // Adjust Task type if needed for description etc.
        const task: Task = {
            id: row.id,
            title: row.title, 
            // description: row.description, // Add description if needed
            dueDate: row.dueDate ? new Date(row.dueDate).toISOString().split('T')[0] : undefined, // Format date
            priority: row.priority,
            columnId: row.columnid
        };
        tasks[task.id] = task;
        // Add taskId to the correct column
        if (columnIdMap[task.columnId]) {
          columnIdMap[task.columnId].taskIds.push(task.id);
        }
      }
        return { tasks, columns, columnOrder };
    } else {
        // No columns found, return empty board structure
        return { tasks: {}, columns: {}, columnOrder: [] };
    }

  } catch (err) {
    console.error('Error fetching board data:', err);
    return null;
  }
};

// Columns
export const addColumn = async (title: string): Promise<{ newColumn: Column, updatedOrder: string[] } | null> => {
  const projectId = await getDefaultProjectId();
  if (!projectId) return null;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Get the next order value
    const orderRes = await client.query('SELECT COALESCE(MAX("order"), -1) + 1 as next_order FROM columns WHERE "projectId" = $1', [projectId]);
    const nextOrder = orderRes.rows[0].next_order;

    // Insert the new column
    const insertRes = await client.query<Column>(
      'INSERT INTO columns ("projectId", name, "order") VALUES ($1, $2, $3) RETURNING id, name as title', 
      [projectId, title, nextOrder]
    );
    const newColumnData = { ...insertRes.rows[0], taskIds: [] }; // Add empty taskIds

    // Get the updated column order
    const orderResult = await client.query('SELECT id FROM columns WHERE "projectId" = $1 ORDER BY "order" ASC', [projectId]);
    const updatedOrder = orderResult.rows.map(row => row.id);

    await client.query('COMMIT');
    console.log('Column created:', newColumnData);
    return { newColumn: newColumnData, updatedOrder };
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error adding column:', err);
    return null;
  } finally {
    client.release();
  }
};

export const renameColumn = async (id: string, title: string): Promise<Column | null> => {
  try {
    const res = await pool.query<Column>(
      'UPDATE columns SET name = $1 WHERE id = $2 RETURNING id, name as title', 
      [title, id]
    );
    if (res.rowCount === 0) return null;
    console.log(`Column ${id} renamed to: ${title}`);
     // Fetch task IDs separately if needed for the return type, or adjust return type
    const tasksRes = await pool.query('SELECT id FROM tasks WHERE "columnId" = $1 ORDER BY "order" ASC', [id]);
    const taskIds = tasksRes.rows.map(row => row.id);
    return { ...res.rows[0], taskIds };
  } catch (err) {
    console.error(`Error renaming column ${id}:`, err);
    return null;
  }
};

export const deleteColumn = async (id: string): Promise<{ deletedColumnId: string, updatedOrder: string[] } | null> => {
    const projectId = await getDefaultProjectId(); // Need project ID to get updated order
    if (!projectId) return null;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        // Deletion happens via CASCADE constraint
        const deleteRes = await client.query('DELETE FROM columns WHERE id = $1', [id]);
        
        if (deleteRes.rowCount === 0) {
            await client.query('ROLLBACK');
            return null; // Column not found
        }

        // Get the updated column order (simple approach, doesn't re-index order)
        const orderResult = await client.query('SELECT id FROM columns WHERE "projectId" = $1 ORDER BY "order" ASC', [projectId]);
        const updatedOrder = orderResult.rows.map(row => row.id);

        await client.query('COMMIT');
        console.log(`Column ${id} deleted`);
        return { deletedColumnId: id, updatedOrder };
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(`Error deleting column ${id}:`, err);
        return null;
    } finally {
        client.release();
    }
};

// Note: Column reordering endpoint needs separate implementation if required
// export const reorderColumns = async (newOrder: string[]): Promise<{ updatedOrder: string[] } | null> => { ... };

// Tasks
export const addTask = async (columnId: string, title: string, priority?: Task['priority'], dueDate?: string): Promise<{ newTask: Task, updatedColumnTaskIds: string[] } | null> => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        // Get next order value for the column
        const orderRes = await client.query('SELECT COALESCE(MAX("order"), -1) + 1 as next_order FROM tasks WHERE "columnId" = $1', [columnId]);
        const nextOrder = orderRes.rows[0].next_order;

        // Use NULL for dueDate if it's undefined or empty string
        const finalDueDate = (dueDate && dueDate.trim() !== '') ? dueDate : null;

        // Insert new task
        const insertRes = await pool.query<Task>(
            'INSERT INTO tasks ("columnId", content, priority, "dueDate", "order") VALUES ($1, $2, $3, $4, $5) RETURNING id, content as title, priority, "dueDate", "columnId"', 
            [columnId, title, priority || 'Medium', finalDueDate, nextOrder]
        );
        const newTaskData = insertRes.rows[0];
         // Format date correctly for return
        if (newTaskData.dueDate) {
            newTaskData.dueDate = new Date(newTaskData.dueDate).toISOString().split('T')[0];
        }

        // Get updated task order for the column
        const taskOrderRes = await client.query('SELECT id FROM tasks WHERE "columnId" = $1 ORDER BY "order" ASC', [columnId]);
        const updatedColumnTaskIds = taskOrderRes.rows.map(row => row.id);

        await client.query('COMMIT');
        console.log('Task created:', newTaskData);
        return { newTask: newTaskData, updatedColumnTaskIds };
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error adding task:', err);
        return null;
    } finally {
        client.release();
    }
};

export const updateTask = async (id: string, updates: Partial<Omit<Task, 'id' | 'columnId'>>): Promise<Task | null> => {
    // Exclude id and columnId from direct updates here (use moveTask for column changes)
    const { title, description, priority, dueDate } = updates;
    // Use NULL for dueDate if it's explicitly set to undefined or empty string
    const finalDueDate = (dueDate === undefined || dueDate === '') ? null : dueDate;

    // Build query dynamically (simple example)
    const fieldsToUpdate = [];
    const values = [];
    let paramIndex = 1;

    if (title !== undefined) { fieldsToUpdate.push(`content = $${paramIndex++}`); values.push(title); }
    if (priority !== undefined) { fieldsToUpdate.push(`priority = $${paramIndex++}`); values.push(priority); }
    if (dueDate !== undefined) { fieldsToUpdate.push(`"dueDate" = $${paramIndex++}`); values.push(finalDueDate); }
    // Add description update if needed

    if (fieldsToUpdate.length === 0) {
        console.log('No fields to update for task:', id);
        // Fetch and return current task data if no update occurred
        const currentTaskRes = await pool.query<Task>('SELECT id, content as title, priority, "dueDate", "columnId" FROM tasks WHERE id = $1', [id]);
        if (currentTaskRes.rows.length > 0) {
             const task = currentTaskRes.rows[0];
             if (task.dueDate) {
                 task.dueDate = new Date(task.dueDate).toISOString().split('T')[0];
             }
             return task;
        }
        return null;
    }

    values.push(id); // Add id for the WHERE clause
    const queryText = `UPDATE tasks SET ${fieldsToUpdate.join(', ')} WHERE id = $${paramIndex} RETURNING id, content as title, priority, "dueDate", "columnId"`;

    try {
        const res = await pool.query<Task>(queryText, values);
        if (res.rowCount === 0) return null;
         const updatedTask = res.rows[0];
        if (updatedTask.dueDate) {
            updatedTask.dueDate = new Date(updatedTask.dueDate).toISOString().split('T')[0];
        }
        console.log(`Task ${id} updated.`);
        return updatedTask;
    } catch (err) {
        console.error(`Error updating task ${id}:`, err);
        return null;
    }
};

export const deleteTask = async (id: string): Promise<{ deletedTaskId: string, updatedColumnTaskIds?: string[] } | null> => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        // Get columnId before deleting
        const taskRes = await client.query('SELECT "columnId" FROM tasks WHERE id = $1', [id]);
        if (taskRes.rowCount === 0) {
            await client.query('ROLLBACK');
            return null; // Task not found
        }
        const columnId = taskRes.rows[0].columnId;

        const deleteRes = await client.query('DELETE FROM tasks WHERE id = $1', [id]);
        if (deleteRes.rowCount === 0) {
             await client.query('ROLLBACK'); // Should not happen if previous query found it
             return null;
        }

        // Get updated task order for the original column
         let updatedColumnTaskIds: string[] | undefined = undefined;
         if (columnId) {
            const taskOrderRes = await client.query('SELECT id FROM tasks WHERE "columnId" = $1 ORDER BY "order" ASC', [columnId]);
            updatedColumnTaskIds = taskOrderRes.rows.map(row => row.id);
         }

        await client.query('COMMIT');
        console.log(`Task ${id} deleted`);
        return { deletedTaskId: id, updatedColumnTaskIds };
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(`Error deleting task ${id}:`, err);
        return null;
    } finally {
        client.release();
    }
};

export const moveTask = async (taskId: string, sourceColumnId: string, sourceOrder: number, destColumnId: string, destOrder: number): Promise<boolean> => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Remove task from source position: Decrement order of subsequent tasks in source column
        await client.query(
            'UPDATE tasks SET "order" = "order" - 1 WHERE "columnId" = $1 AND "order" > $2',
            [sourceColumnId, sourceOrder]
        );

        // Make space in destination position: Increment order of tasks at or after destination position in dest column
        await client.query(
            'UPDATE tasks SET "order" = "order" + 1 WHERE "columnId" = $1 AND "order" >= $2',
            [destColumnId, destOrder]
        );

        // Update the moved task's column and order
        await client.query(
            'UPDATE tasks SET "columnId" = $1, "order" = $2 WHERE id = $3',
            [destColumnId, destOrder, taskId]
        );

        await client.query('COMMIT');
        console.log(`Task ${taskId} moved from column ${sourceColumnId} (pos ${sourceOrder}) to ${destColumnId} (pos ${destOrder})`);
        return true;

    } catch (err) {
        await client.query('ROLLBACK');
        console.error(`Error moving task ${taskId}:`, err);
        return false;
    } finally {
        client.release();
    }
}; 