import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import Modal from 'react-modal';
import { Task } from '../types';
import './Board.css'; // Reuse or create new modal styles

interface TaskModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  task: Task | null;
  onSave: (taskId: string, updates: Partial<Task>) => void;
  onDelete: (taskId: string) => void; // Add delete handler prop
}

// Basic modal styles (customize as needed)
const customStyles: Modal.Styles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    width: '80%',
    maxWidth: '600px',
    maxHeight: '80vh',
    overflowY: 'auto',
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '25px',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
};

// Bind modal to your app element (for accessibility)
// In your main app file (e.g., index.tsx or App.tsx), you might need:
// Modal.setAppElement('#root'); 
// We'll add this to App.tsx later.

const TaskModal: React.FC<TaskModalProps> = ({ 
    isOpen, 
    onRequestClose, 
    task, 
    onSave,
    onDelete 
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
    } else {
      // Reset form when modal opens with no task (or closes)
      setTitle('');
      setDescription('');
    }
  }, [task]); // Re-run effect when the task prop changes

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (!task) return;
    
    const updates: Partial<Task> = {};
    if (title !== task.title) {
        updates.title = title;
    }
    // Handle potential undefined vs empty string for description
    const currentDesc = task.description || '';
    if (description !== currentDesc) {
        updates.description = description;
    }

    if (Object.keys(updates).length > 0) {
        onSave(task.id, updates);
    }
    onRequestClose(); // Close modal after save attempt
  };

  const handleDelete = () => {
      if (task && window.confirm(`Are you sure you want to delete task: "${task.title}"?`)) {
          onDelete(task.id);
          onRequestClose();
      }
  };

  if (!task) {
    // Optional: Render nothing or a loading/error state if task is null when open
    // This case shouldn't typically happen with proper state management in Board.tsx
    return null; 
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={customStyles}
      contentLabel="Task Details"
    >
      <div className="task-modal-header">
        <h2>Task Details</h2>
        <button onClick={onRequestClose} className="close-button">&times;</button>
      </div>
      <form onSubmit={handleSave} className="task-modal-form">
        <div className="form-group">
          <label htmlFor="taskTitle">Title</label>
          <input
            id="taskTitle"
            type="text"
            value={title}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="taskDescription">Description</label>
          <textarea
            id="taskDescription"
            value={description}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
            rows={5}
          />
        </div>
        {/* Add dropdown for column/status change here if needed later */}
        <div className="form-actions">
           <button type="submit" className="save-button">Save Changes</button>
           <button type="button" onClick={handleDelete} className="delete-button">Delete Task</button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskModal; 