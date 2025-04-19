import { Task, BoardData, Column, Project } from '../types';

const API_BASE = '/api'; // Using proxy

// --- Projects --- 
export const fetchProject = async (projectId: string): Promise<Project | null> => {
  try {
    const response = await fetch(`${API_BASE}/projects/${projectId}`);
    if (!response.ok) throw new Error(`Error fetching project: ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch project:', error);
    return null;
  }
};

export const fetchDefaultProject = async (): Promise<Project | null> => {
  try {
    const response = await fetch(`${API_BASE}/default-project`);
    if (!response.ok) throw new Error(`Error fetching default project: ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch default project:', error);
    return null;
  }
};

// --- Board --- 
export const fetchBoardData = async (): Promise<BoardData | null> => {
  try {
    const response = await fetch(`${API_BASE}/board`);
    if (!response.ok) {
      throw new Error(`Error fetching board data: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch board data:', error);
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
    return await response.json();
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
        return await response.json();
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
        return await response.json(); // Contains updated columnOrder
    } catch (error) {
        console.error('Failed to delete column:', error);
        return null;
    }
};

// Note: Column reordering endpoint /api/columns/reorder might be needed for drag-drop columns later

// --- Tasks ---

// Note: fetchTasks is replaced by fetchBoardData

export const createTask = async (title: string, columnId: string, description?: string): Promise<{ task: Task, column: Column } | null> => {
  try {
    const response = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, columnId }),
    });
    if (!response.ok) throw new Error(`Error creating task: ${response.statusText}`);
    return await response.json(); // Backend returns new task and updated column taskIds
  } catch (error) {
    console.error('Failed to create task:', error);
    return null;
  }
};

// Update task details OR handle drag-and-drop move
// For D&D, include source/dest column IDs and indices
export const updateTask = async (taskId: string, updates: Partial<Task> & { 
    sourceColumnId?: string; 
    destColumnId?: string; 
    sourceIndex?: number; 
    destIndex?: number; 
}): Promise<{ task: Task, sourceColumn?: Column, destColumn?: Column, column?: Column } | null> => {
  try {
    const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error(`Error updating task: ${response.statusText}`);
    // Backend returns updated task and potentially affected source/dest columns
    return await response.json();
  } catch (error) {
    console.error('Failed to update task:', error);
    return null;
  }
};

export const deleteTask = async (taskId: string): Promise<{ taskId: string, column: Column | null } | null> => {
    try {
        const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error(`Error deleting task: ${response.statusText}`);
        return await response.json(); // Backend returns ID of deleted task and updated source column
    } catch (error) {
        console.error('Failed to delete task:', error);
        return null;
    }
}; 