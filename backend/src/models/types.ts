export interface Project {
  id: string;
  name: string;
  key: string; // Short identifier like 'PROJ'
  // Could add description, owner, etc.
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  columnId: string;
  priority?: 'Low' | 'Medium' | 'High'; // Example priorities
  dueDate?: string; // Store as YYYY-MM-DD string or Date object
  order?: number; // Order within the column
}

export interface Column {
  id: string;
  title: string;
  taskIds: string[]; // Ordered list of task IDs
  order?: number; // Order of the column itself
}

// Type for the overall board structure returned by the API
export interface BoardData {
  tasks: { [key: string]: Task };
  columns: { [key: string]: Column };
  columnOrder: string[];
} 