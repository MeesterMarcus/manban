import { v4 as uuidv4 } from 'uuid';
import { Project, Task, Column } from '../models/types';

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
    [task1Id]: { id: task1Id, title: 'Implement Backend API', description: 'Add CRUD endpoints', columnId: inProgColId },
    [task2Id]: { id: task2Id, title: 'Design Frontend UI', columnId: todoColId },
    [task3Id]: { id: task3Id, title: 'Setup Project Structure', description: 'Initialize project', columnId: doneColId },
  };
  console.log('Initial board data set up for default project.');
};

setupInitialData(); // Initialize on service load

// --- Service Functions --- 

// Projects
export const getProjectById = (id: string): Project | undefined => projects[id];
export const getDefaultProject = (): Project | undefined => defaultProjectId ? projects[defaultProjectId] : undefined;
// TODO: Add createProject, updateProject, etc.

// Board Data (acting on default project for now)
export const getBoardData = () => ({ tasks, columns, columnOrder }); 

// Columns (acting on default project for now)
export const addColumn = (title: string): { newColumn: Column, updatedOrder: string[] } => {
  const newColumn: Column = {
    id: uuidv4(),
    title,
    taskIds: [],
  };
  columns[newColumn.id] = newColumn;
  columnOrder.push(newColumn.id);
  console.log('Column created:', newColumn);
  return { newColumn, updatedOrder: columnOrder };
};

export const renameColumnById = (id: string, title: string): Column | null => {
    if (!columns[id]) return null;
    columns[id].title = title;
    console.log(`Column ${id} renamed to: ${title}`);
    return columns[id];
};

export const deleteColumnById = (id: string): { deletedColumnId: string, updatedOrder: string[] } | null => {
    const columnToDelete = columns[id];
    if (!columnToDelete) return null;

    columnToDelete.taskIds.forEach(taskId => {
        delete tasks[taskId];
    });
    delete columns[id];
    columnOrder = columnOrder.filter(colId => colId !== id);
    console.log(`Column ${id} and its tasks deleted`);
    return { deletedColumnId: id, updatedOrder: columnOrder };
};

export const reorderColumns = (newOrder: string[]): { updatedOrder: string[] } | null => {
     if (!Array.isArray(newOrder) || 
         newOrder.length !== columnOrder.length || 
         !columnOrder.every(id => newOrder.includes(id))) {
         return null; // Basic validation failed
     }
     columnOrder = newOrder;
     console.log('Column order updated:', columnOrder);
     return { updatedOrder: columnOrder };
};

// Tasks (acting on default project for now)
export const addTask = (title: string, columnId: string, description?: string): { newTask: Task, updatedColumn: Column } | null => {
    if (!columns[columnId]) return null;
    const newTask: Task = {
        id: uuidv4(),
        title,
        description,
        columnId,
    };
    tasks[newTask.id] = newTask;
    columns[columnId].taskIds.unshift(newTask.id);
    console.log('Task created:', newTask);
    return { newTask, updatedColumn: columns[columnId] };
};

export const updateTaskById = (id: string, updates: Partial<Task> & { 
    sourceColumnId?: string; 
    destColumnId?: string; 
    sourceIndex?: number; 
    destIndex?: number; 
}): { updatedTask: Task, updatedSourceColumn?: Column, updatedDestColumn?: Column } | null => {
    const taskToUpdate = tasks[id];
    if (!taskToUpdate) return null;

    const { sourceColumnId, destColumnId, sourceIndex, destIndex, ...taskUpdates } = updates;
    
    let updatedTask = { ...taskToUpdate, ...taskUpdates };
    let updatedSourceColumn: Column | undefined = undefined;
    let updatedDestColumn: Column | undefined = undefined;

    // Handle movement
    if (sourceColumnId && destColumnId && sourceIndex !== undefined && destIndex !== undefined) {
        const sourceCol = columns[sourceColumnId];
        const destCol = columns[destColumnId];
        if (!sourceCol || !destCol || !sourceCol.taskIds.includes(id)) return null; // Invalid move

        sourceCol.taskIds.splice(sourceIndex, 1);
        destCol.taskIds.splice(destIndex, 0, id);
        updatedTask.columnId = destColumnId;
        updatedSourceColumn = sourceCol;
        updatedDestColumn = destCol;
        console.log(`Task ${id} moved from ${sourceColumnId} to ${destColumnId}`);
    }
    // Handle simple column change (if columnId is in taskUpdates)
    else if (taskUpdates.columnId && columns[taskUpdates.columnId] && taskToUpdate.columnId !== taskUpdates.columnId) {
        const oldCol = columns[taskToUpdate.columnId];
        const newCol = columns[taskUpdates.columnId];
        if (oldCol) {
            oldCol.taskIds = oldCol.taskIds.filter(taskId => taskId !== id);
            updatedSourceColumn = oldCol; // Treat old column as source
        }
        if (newCol) {
            newCol.taskIds.unshift(id);
            updatedDestColumn = newCol; // Treat new column as dest
        }
         console.log(`Task ${id} columnId updated to: ${taskUpdates.columnId}`);
    }

    tasks[id] = updatedTask;
    console.log(`Task ${id} updated.`);

    return { updatedTask, updatedSourceColumn, updatedDestColumn };
};

export const deleteTaskById = (id: string): { deletedTaskId: string, updatedColumn: Column | null } | null => {
    const taskToDelete = tasks[id];
    if (!taskToDelete) return null;

    let updatedColumn: Column | null = null;
    const column = columns[taskToDelete.columnId];
    if (column) {
        column.taskIds = column.taskIds.filter(taskId => taskId !== id);
        updatedColumn = column;
    }
    delete tasks[id];
    console.log(`Task ${id} deleted`);
    return { deletedTaskId: id, updatedColumn };
}; 