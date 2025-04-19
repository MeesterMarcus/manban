import React, { useState } from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { Task, Column as ColType } from '../types';
import TaskCard from './TaskCard';
import './Board.css';

interface ColumnProps {
  column: ColType;
  tasks: Task[];
  index: number;
  onAddTask: (columnId: string, title: string) => void;
  onRenameColumn: (columnId: string, newTitle: string) => void;
  onDeleteColumn: (columnId: string) => void;
  onOpenTaskModal: (task: Task) => void; // To open modal from TaskCard
}

const Column: React.FC<ColumnProps> = ({ 
    column, 
    tasks, 
    index, 
    onAddTask,
    onRenameColumn,
    onDeleteColumn,
    onOpenTaskModal 
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState(column.title);
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleTitleBlur = () => {
    if (newTitle.trim() && newTitle !== column.title) {
      onRenameColumn(column.id, newTitle.trim());
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
          handleTitleBlur();
      }
      if (e.key === 'Escape') {
          setNewTitle(column.title); // Revert
          setIsEditingTitle(false);
      }
  };

  const handleAddTaskClick = () => {
    setShowAddTaskForm(true);
  };

  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    onAddTask(column.id, newTaskTitle.trim());
    setNewTaskTitle('');
    setShowAddTaskForm(false);
  };

  const handleAddTaskCancel = () => {
    setNewTaskTitle('');
    setShowAddTaskForm(false);
  };

  return (
    // Make the entire column draggable (for column reordering later if needed)
    <Draggable draggableId={column.id} index={index}>
       {(provided) => (
            <div 
                className="column" 
                {...provided.draggableProps} 
                ref={provided.innerRef}
            >
                <div className="column-header" {...provided.dragHandleProps}>
                     {isEditingTitle ? (
                        <input
                            type="text"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            onBlur={handleTitleBlur}
                            onKeyDown={handleTitleKeyDown}
                            autoFocus
                            className="column-title-input"
                        />
                    ) : (
                        <h3 onClick={() => setIsEditingTitle(true)}>{column.title}</h3>
                    )}
                    <button onClick={() => onDeleteColumn(column.id)} className="delete-column-button">×</button>
                </div>
                <Droppable droppableId={column.id} type="task"> 
                    {(provided, snapshot) => (
                    <div
                        className={`task-list ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                    >
                        {tasks.map((task, index) => (
                        <TaskCard 
                            key={task.id} 
                            task={task} 
                            index={index} 
                            onClick={() => onOpenTaskModal(task)} // Pass handler to TaskCard
                        />
                        ))}
                        {provided.placeholder}
                    </div>
                    )}
                </Droppable>
                {/* Add Task Section */} 
                <div className="add-task-section">
                    {showAddTaskForm ? (
                        <form onSubmit={handleAddTaskSubmit} className="add-task-inline-form">
                            <input
                                type="text"
                                placeholder="Enter a title for this ticket..."
                                value={newTaskTitle}
                                onChange={(e) => setNewTaskTitle(e.target.value)}
                                autoFocus
                            />
                            <div className="add-task-inline-actions">
                                <button type="submit">Add ticket</button>
                                <button type="button" onClick={handleAddTaskCancel}>Cancel</button>
                            </div>
                        </form>
                    ) : (
                        <button onClick={handleAddTaskClick} className="add-task-button">
                            + Add ticket
                        </button>
                    )}
                </div>
            </div>
       )}
    </Draggable>

  );
};

export default Column; 