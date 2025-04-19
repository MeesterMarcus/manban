import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Task } from '../types';
import './Board.css'; // We'll share styles from Board.css

interface TaskCardProps {
  task: Task;
  index: number;
  onClick: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, index, onClick }) => {
  // Helper to format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateString; // Return original if invalid
    }
  };

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          className={`task-card ${snapshot.isDragging ? 'dragging' : ''}`}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
        >
          <h4>{task.title}</h4>
          {task.description && <p className="task-card-desc">{task.description}</p>}
          <div className="task-card-footer">
             {/* Display Priority - Add icons later */}
            <span className={`task-priority priority-${task.priority?.toLowerCase()}`}>{task.priority}</span>
            {/* Display Due Date */}
            {task.dueDate && (
              <span className="task-due-date">Due: {formatDate(task.dueDate)}</span>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard; 