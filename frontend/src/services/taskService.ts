import { Task, BoardData, Column } from '../types';

const API_BASE = '/api'; // Using proxy

// --- Board Data ---
export const fetchBoardData = async (): Promise<BoardData | null> => {
  try {
    const response = await fetch(`${API_BASE}/board`);
    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      throw new Error(`Error fetching board data: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch board data:', error);
    // Optionally, re-throw or handle UI feedback here
    return null;
  }
};

// --- Columns ---
export const createColumn = async (title: string): Promise<{ columns: { [key: string]: Column }, columnOrder: string[] } | null> => {
  try {
    const response = await fetch(`${API_BASE}/columns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    if (!response.ok) throw new Error(`Error creating column: ${response.statusText}`);
    return await response.json(); // Matches new backend response
  } catch (error) {
    console.error('Failed to create column:', error);
    return null;
  }
};

export const renameColumn = async (columnId: string, title: string): Promise<Column | null> => {
  try {
    const response = await fetch(`${API_BASE}/columns/${columnId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    if (!response.ok) throw new Error(`Error renaming column: ${response.statusText}`);
    return await response.json(); // Backend returns updated column with taskIds
  } catch (error) {
    console.error('Failed to rename column:', error);
    return null;
  }
};

export const deleteColumn = async (columnId: string): Promise<{ columnId: string, columnOrder: string[] } | null> => {
  try {
    const response = await fetch(`${API_BASE}/columns/${columnId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error(`Error deleting column: ${response.statusText}`);
    return await response.json(); // Matches new backend response
  } catch (error) {
    console.error('Failed to delete column:', error);
    return null;
  }
};

// --- Tasks ---

// Create a new task
export const createTask = async (
    columnId: string,
    title: string,
    priority?: Task['priority'], 
    dueDate?: string
): Promise<{ task: Task, columnTaskIds: string[] } | null> => {
  try {
    const body = { title, columnId, priority, dueDate };
    const response = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(`Error creating task: ${response.statusText}`);
    return await response.json(); // Matches new backend response
  } catch (error) {
    console.error('Failed to create task:', error);
    return null;
  }
};

// Update task content (title, priority, due date, etc.)
export const updateTask = async (taskId: string, updates: Partial<Omit<Task, 'id' | 'columnId'>>) : Promise<Task | null> => {
  try {
    const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      // Only send fields present in the updates object
      body: JSON.stringify(updates), 
    });
    if (!response.ok) throw new Error(`Error updating task: ${response.statusText}`);
    return await response.json(); // Backend returns the full updated task
  } catch (error) {
    console.error('Failed to update task:', error);
    return null;
  }
};

// Move a task (drag and drop)
export const moveTask = async (
  taskId: string, 
  sourceColumnId: string, 
  sourceIndex: number, 
  destColumnId: string, 
  destIndex: number
): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE}/tasks/${taskId}/move`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sourceColumnId, sourceIndex, destColumnId, destIndex }),
    });
    if (!response.ok) {
      // Log specific error from backend if available
      try {
        const errorBody = await response.json();
        console.error('Error moving task:', response.statusText, errorBody);
      } catch (_) {
        console.error('Error moving task:', response.statusText);
      }
      return false; 
    }
    return true; // Indicate success
  } catch (error) {
    console.error('Failed to move task:', error);
    return false;
  }
};

export const deleteTask = async (taskId: string): Promise<{ taskId: string, columnTaskIds?: string[] } | null> => {
  try {
    const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error(`Error deleting task: ${response.statusText}`);
    return await response.json(); // Matches new backend response
  } catch (error) {
    console.error('Failed to delete task:', error);
    return null;
  }
}; 