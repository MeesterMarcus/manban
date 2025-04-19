// Define the structure for a Project
export interface Project {
  id: string;
  name: string;
  key?: string;
}

// Define the structure of a Task
export interface Task {
  id: string;
  title: string;
  description?: string;
  columnId: string; // Tasks belong to a column
  priority: 'Low' | 'Medium' | 'High'; // Add priority
  dueDate?: string; // Add optional due date (ISO string format)
}

// Define the structure for a Column
export interface Column {
  id: string;
  title: string;
  taskIds: string[]; // Keep track of task order within the column
}

// Define the structure for the entire board data fetched from backend
export interface BoardData {
  tasks: { [key: string]: Task };
  columns: { [key: string]: Column };
  columnOrder: string[];
}

// Type for the frontend state representation (maybe slightly different)
// We might want columns to hold the actual task objects for easier rendering
export interface AppColumn extends Column {
    tasks: Task[]; // Include full task objects
}

export interface AppColumns {
    [key: string]: AppColumn;
} 