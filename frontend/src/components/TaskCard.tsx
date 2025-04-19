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
          {task.description && <p>{task.description}</p>}
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard; 