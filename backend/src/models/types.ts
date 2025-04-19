export interface Project {
  id: string;
  name: string;
  key?: string; // Optional project key like JIRA
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  columnId: string; // Link task to a column
  priority: 'Low' | 'Medium' | 'High'; // Add priority
  dueDate?: string; // Add optional due date (ISO string format)
}

export interface Column {
  id: string;
  title: string;
  taskIds: string[]; // Store order of tasks within the column
} 