import React, { useState, useEffect } from 'react';
import { DragDropContext, DropResult, Droppable } from 'react-beautiful-dnd';
import Modal from 'react-modal';
import { v4 as uuidv4 } from 'uuid';
import Column from './Column';
import TaskModal from './TaskModal'; // Import the modal component
import { 
    fetchBoardData, 
    updateTask, 
    moveTask,   // For drag & drop
    createTask, 
    createColumn, 
    deleteColumn, 
    renameColumn,
    deleteTask
} from '../services/taskService'; 
import { BoardData, Task, Column as ColType } from '../types';
import './Board.css';

// Add searchTerm prop
interface BoardProps {
    searchTerm: string;
}

const Board: React.FC<BoardProps> = ({ searchTerm }) => { // Destructure searchTerm
  const [boardData, setBoardData] = useState<BoardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');

  // --- Data Loading ---
  useEffect(() => {
    const loadBoard = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchBoardData();
        if (data) {
          setBoardData(data);
        } else {
          setError('Failed to load board data. Please try again later.');
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError('An error occurred while loading board data.');
      }
      setLoading(false);
    };
    loadBoard();
  }, []);

  // --- Drag and Drop Logic ---
  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    
    if (!destination || !boardData) return;

    const sourceColId = source.droppableId;
    const destColId = destination.droppableId;

    if (sourceColId === destColId && source.index === destination.index) {
      return;
    }

    const startCol = boardData.columns[sourceColId];
    const finishCol = boardData.columns[destColId];
    const task = boardData.tasks[draggableId];

    if (!startCol || !finishCol || !task) {
        console.error('Drag and drop error: Column or Task not found');
        return;
    }

    // --- Optimistic UI Update --- 
    const newStartTaskIds = Array.from(startCol.taskIds);
    newStartTaskIds.splice(source.index, 1); 

    const newFinishTaskIds = Array.from(finishCol.taskIds);
    if (startCol.id !== finishCol.id) { // Only add to finish if different column
        newFinishTaskIds.splice(destination.index, 0, draggableId); 
    } else { // Same column, different position
        newFinishTaskIds.splice(destination.index, 0, draggableId); // Already removed, just add
    }

    const optimisticColumns = {
        ...boardData.columns,
        [startCol.id]: {
            ...startCol,
            taskIds: newStartTaskIds,
        },
        // Update finishCol only if it changed
        ...(startCol.id !== finishCol.id && {
            [finishCol.id]: {
                ...finishCol,
                taskIds: newFinishTaskIds,
            }
        })
    };
    // If moving within same column, update only that column's taskIds
    if (startCol.id === finishCol.id) {
        optimisticColumns[startCol.id].taskIds = newFinishTaskIds;
    }

    const optimisticTask = { ...task, columnId: destColId }; 
    const optimisticTasks = { ...boardData.tasks, [draggableId]: optimisticTask };

    const originalBoardData = boardData; // Store original state for potential revert

    setBoardData({
        ...boardData,
        tasks: optimisticTasks,
        columns: optimisticColumns,
    });

    // --- API Call for Moving Task --- 
    const success = await moveTask(
        draggableId, 
        sourceColId, 
        source.index, 
        destColId, 
        destination.index
    );

    if (!success) {
        console.error("Failed to update task position on backend.");
        setError('Failed to move task. Reverting changes.');
        // Revert UI to original state before optimistic update
        setBoardData(originalBoardData); 
        // Optionally, refetch for guaranteed consistency
        // const freshData = await fetchBoardData();
        // if (freshData) setBoardData(freshData);
    }
    // If successful, the optimistic update holds. No need to update state again 
    // unless backend needs to return the definitive new task/column orders.
  };

  // --- Column Operations ---
  const handleAddColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColumnTitle.trim() || !boardData) return;

    const tempId = `temp-col-${uuidv4()}`; // Optimistic temp ID
    const optimisticNewColumn: ColType = { id: tempId, title: newColumnTitle, taskIds: [] };
    const optimisticColumnOrder = [...boardData.columnOrder, tempId];
    const optimisticColumns = { ...boardData.columns, [tempId]: optimisticNewColumn };

    const originalBoardData = boardData; // Store for revert
    setBoardData({ ...boardData, columns: optimisticColumns, columnOrder: optimisticColumnOrder });
    setNewColumnTitle('');

    try {
      const result = await createColumn(newColumnTitle);
      if (!result || !result.columns || !result.columnOrder) {
          throw new Error('Invalid response when creating column');
      }
      // Replace temp column with real data from backend
      const realColumn = Object.values(result.columns)[0]; 
      setBoardData(prevData => {
          if (!prevData) return null;
          const finalColumns = { ...prevData.columns };
          delete finalColumns[tempId]; // Remove temp
          finalColumns[realColumn.id] = realColumn; // Add real
          return { ...prevData, columns: finalColumns, columnOrder: result.columnOrder };
      });
    } catch (err) {
        console.error("Failed to create column:", err);
        setError('Failed to create column.');
        // Revert optimistic update
        setBoardData(originalBoardData);
    }
  };

  const handleRenameColumn = async (columnId: string, newTitle: string) => {
      if (!boardData || !boardData.columns[columnId] || boardData.columns[columnId].title === newTitle) return;

      const originalColumn = boardData.columns[columnId];
      // Optimistic UI
      setBoardData(prev => prev ? {
          ...prev,
          columns: { ...prev.columns, [columnId]: { ...prev.columns[columnId], title: newTitle } }
      } : null);

      try {
        const updatedColumn = await renameColumn(columnId, newTitle);
        if (!updatedColumn) {
            throw new Error('Column not found or rename failed');
        }
         // API success, update definitively (though optimistic might be same)
         setBoardData(prev => prev ? {
             ...prev,
             columns: { ...prev.columns, [columnId]: updatedColumn }
         } : null);
      } catch (err) {
          console.error("Failed to rename column:", err);
          setError('Failed to rename column.');
          // Revert
          setBoardData(prev => prev ? {
              ...prev,
              columns: { ...prev.columns, [columnId]: originalColumn }
          } : null);
      }
  };

  const handleDeleteColumn = async (columnId: string) => {
      if (!boardData || !boardData.columns[columnId]) return;
      
      const columnToDelete = boardData.columns[columnId];
      if (!window.confirm(`Delete column "${columnToDelete.title}" and ALL its tasks?`)) return;

      const originalBoardData = JSON.parse(JSON.stringify(boardData)); // Deep copy for potential revert

      // Optimistic UI update
      setBoardData(prevData => {
          if (!prevData) return null;
          const optimisticColumns = { ...prevData.columns };
          delete optimisticColumns[columnId];
          const optimisticTasks = { ...prevData.tasks };
          columnToDelete.taskIds.forEach(taskId => delete optimisticTasks[taskId]);
          const optimisticColumnOrder = prevData.columnOrder.filter(id => id !== columnId);
          return { tasks: optimisticTasks, columns: optimisticColumns, columnOrder: optimisticColumnOrder };
      });

      try {
        const result = await deleteColumn(columnId);
        if (!result || !result.columnOrder) { 
             throw new Error('Column not found or delete failed');
        }
        // API success, ensure columnOrder matches backend
        setBoardData(prev => prev ? { ...prev, columnOrder: result.columnOrder } : null);
      } catch(err) {
          console.error("Failed to delete column:", err);
          setError('Failed to delete column.');
          // Revert
          setBoardData(originalBoardData);
      }
  };

  // --- Task Operations ---
  const handleAddTask = async (columnId: string, title: string, priority?: Task['priority'], dueDate?: string) => {
      if (!title.trim() || !boardData) return;

      const tempId = `temp-task-${uuidv4()}`; // Use descriptive temp ID
      const optimisticNewTask: Task = { id: tempId, title, columnId, priority: priority || 'Medium', dueDate }; 
      
      const originalBoardData = boardData; // Store for revert
      // Optimistic UI update
      setBoardData(prev => {
          if (!prev) return null;
          const optimisticColumn = { ...prev.columns[columnId] };
          optimisticColumn.taskIds = [tempId, ...optimisticColumn.taskIds]; // Add to top
          return {
              ...prev,
              tasks: { ...prev.tasks, [tempId]: optimisticNewTask },
              columns: { ...prev.columns, [columnId]: optimisticColumn },
          };
      });

      try {
        const result = await createTask(columnId, title, priority, dueDate);
        if (!result || !result.task || !result.columnTaskIds) {
            throw new Error('Invalid response when creating task');
        }
        // API Success: Replace temp task with real one, update column's taskIds
        setBoardData(prev => {
            if (!prev) return null;
            const finalTasks = { ...prev.tasks };
            delete finalTasks[tempId]; // Remove temp task
            finalTasks[result.task.id] = result.task; // Add real task
            const finalColumn = { ...prev.columns[columnId], taskIds: result.columnTaskIds };
            return {
                ...prev,
                tasks: finalTasks,
                columns: { ...prev.columns, [columnId]: finalColumn },
            };
        });
      } catch (err) {
        console.error("Failed to create task:", err);
        setError('Failed to create task.');
        // Revert optimistic update
        setBoardData(originalBoardData);
      }
  };

  // --- Modal Logic ---
  const openModal = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  // Called from TaskModal when saving
  const handleSaveTask = async (taskId: string, updates: Partial<Omit<Task, 'id' | 'columnId'>>) => {
    if (!boardData || !boardData.tasks[taskId]) return;

    const originalTask = boardData.tasks[taskId];
    // Optimistic UI update
    const optimisticUpdatedTask = { ...originalTask, ...updates };
    setBoardData(prev => prev ? { 
        ...prev, 
        tasks: { ...prev.tasks, [taskId]: optimisticUpdatedTask }
    } : null);
    closeModal(); // Close modal immediately

    try {
        const updatedTask = await updateTask(taskId, updates);
        if (!updatedTask) {
            throw new Error('Task not found or update failed');
        }
         // API success, update definitively (though optimistic might be same)
        setBoardData(prev => prev ? { 
            ...prev, 
            tasks: { ...prev.tasks, [taskId]: updatedTask }
        } : null);
    } catch (err) {
        console.error("Failed to save task:", err);
        setError('Failed to save task updates.');
        // Revert optimistic update
        setBoardData(prev => prev ? { 
            ...prev, 
            tasks: { ...prev.tasks, [taskId]: originalTask } // Restore original task
        } : null);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!boardData || !boardData.tasks[taskId]) return;
    
    const taskToDelete = boardData.tasks[taskId];
    const originalBoardData = JSON.parse(JSON.stringify(boardData)); // Deep copy for revert

    // Optimistic UI Update
    setBoardData(prevData => {
        if (!prevData) return null;
        const columnId = taskToDelete.columnId;
        const optimisticTasks = { ...prevData.tasks };
        delete optimisticTasks[taskId];
        let optimisticColumns = { ...prevData.columns };
        if (optimisticColumns[columnId]) {
            optimisticColumns[columnId] = { 
                ...optimisticColumns[columnId], 
                taskIds: optimisticColumns[columnId].taskIds.filter(id => id !== taskId)
            };
        }
        return { ...prevData, tasks: optimisticTasks, columns: optimisticColumns };
    });
    closeModal(); // Close modal if task is deleted from it

    try {
        const result = await deleteTask(taskId);
        if (!result || !result.columnTaskIds) {
            throw new Error('Task not found or delete failed');
        }
        // API Success: Ensure the correct column's taskIds are updated
        setBoardData(prev => {
            if (!prev) return null;
            const columnId = taskToDelete.columnId; // Use original columnId
            let finalColumns = { ...prev.columns };
            if (finalColumns[columnId]) {
                 finalColumns[columnId] = { 
                     ...finalColumns[columnId], 
                     taskIds: result.columnTaskIds ?? finalColumns[columnId].taskIds // Use taskIds from response
                 };
            }
             // Ensure task is removed from tasks map (already done optimistically)
            const finalTasks = { ...prev.tasks }; 
            delete finalTasks[taskId]; 
            return { ...prev, tasks: finalTasks, columns: finalColumns };
        });

    } catch (err) {
        console.error("Failed to delete task:", err);
        setError('Failed to delete task.');
        // Revert
        setBoardData(originalBoardData);
    }
  };

  // --- Filtering Logic ---
  const getFilteredTasks = (tasks: { [key: string]: Task }, term: string): { [key: string]: Task } => {
      if (!term) return tasks;
      const lowerCaseTerm = term.toLowerCase();
      return Object.entries(tasks)
          .filter(([_, task]) => 
              task.title.toLowerCase().includes(lowerCaseTerm) || 
              (task.description && task.description.toLowerCase().includes(lowerCaseTerm))
          )
          .reduce((acc, [id, task]) => {
              acc[id] = task;
              return acc;
          }, {} as { [key: string]: Task });
  };
  
  const filteredTasks = boardData ? getFilteredTasks(boardData.tasks, searchTerm) : {};
  // Filter columns to only show those that contain filtered tasks or are empty
  const visibleColumns = boardData ? boardData.columnOrder.map(colId => boardData.columns[colId]).filter(col => 
      col && (col.taskIds.length === 0 || col.taskIds.some(taskId => filteredTasks[taskId]))
  ) : [];

  // --- Render Logic ---
  if (loading) return <div className="loading"><div className="spinner"></div> Loading board...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!boardData) return <div className="error">No board data available.</div>;

  return (
    <div className="board-container">
      <DragDropContext onDragEnd={onDragEnd}>
        {/* Droppable for columns (if column drag-n-drop is added later) */}
        <Droppable droppableId="all-columns" direction="horizontal" type="column">
         {(provided) => (
           <div className="board" {...provided.droppableProps} ref={provided.innerRef}>
             {/* Render only visible columns */}
            {visibleColumns.map((column, index) => {
              // 1. Get all task objects for this column directly from boardData
              const allColumnTasks = column.taskIds
                  .map(taskId => boardData.tasks[taskId]) 
                  .filter(task => task !== undefined); 
              // 2. Filter these tasks based on the searchTerm result (filteredTasks map)
              const visibleTasks = allColumnTasks.filter(task => filteredTasks[task.id]);

              return (
                <Column 
                  key={column.id} 
                  column={column} 
                  tasks={visibleTasks} // Pass only the visible tasks
                  index={index} // For potential column DnD
                  onAddTask={handleAddTask} // Pass handler
                  onOpenTaskModal={openModal} // Correct prop name
                  onDeleteColumn={handleDeleteColumn} // Pass handler
                  onRenameColumn={handleRenameColumn} // Pass handler
                />
              );
            })}
            {provided.placeholder}
              <div className="add-column-section">
                <form onSubmit={handleAddColumn} className="add-column-form">
                  <input 
                    type="text" 
                    value={newColumnTitle}
                    onChange={(e) => setNewColumnTitle(e.target.value)}
                    placeholder="Add new column..."
                    className="add-column-input"
                    required
                  />
                  <button type="submit" className="add-column-button" disabled={!newColumnTitle.trim()}>Add Column</button>
                </form>
              </div>
          </div>
        )}
        </Droppable>
      </DragDropContext>

      {selectedTask && (
        <TaskModal 
          isOpen={isModalOpen} 
          onRequestClose={closeModal} 
          task={selectedTask}
          onSave={handleSaveTask} // Pass the save handler
          onDelete={handleDeleteTask} // Pass the delete handler
        />
      )}
    </div>
  );
};

// Modal setup (ensure it runs once)
let modalInitialized = false;
export const setupModal = () => {
    if (!modalInitialized && typeof window !== 'undefined') {
        const appElement = document.getElementById('root');
        if (appElement) {
            Modal.setAppElement(appElement); 
            modalInitialized = true;
        } else {
            console.warn('Modal app element #root not found. Ensure it exists in your HTML.');
        }
    }
};

export default Board; 