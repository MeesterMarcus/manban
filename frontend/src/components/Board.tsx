import React, { useState, useEffect } from 'react';
import { DragDropContext, DropResult, Droppable } from 'react-beautiful-dnd';
import Modal from 'react-modal';
import { v4 as uuidv4 } from 'uuid';
import Column from './Column';
import TaskModal from './TaskModal'; // Import the modal component
import { 
    fetchBoardData, 
    updateTask, 
    createTask, 
    createColumn, 
    deleteColumn, 
    renameColumn,
    deleteTask // Import deleteTask
} from '../services/taskService'; 
import { BoardData, Task, Column as ColType, AppColumns } from '../types';
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
      const data = await fetchBoardData();
      if (data) {
        setBoardData(data);
      } else {
        setError('Failed to load board data. Please try again later.');
      }
      setLoading(false);
    };
    loadBoard();
  }, []);

  // --- Drag and Drop Logic ---
  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    
    console.log('onDragEnd fired:', result);

    if (!destination || !boardData) return;

    const sourceColId = source.droppableId;
    const destColId = destination.droppableId;

    // Prevent changes if dropped in the same spot
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
    newStartTaskIds.splice(source.index, 1); // Remove from start

    const newFinishTaskIds = Array.from(finishCol.taskIds);
    // Insert into finish only if different column or different index
    if (startCol.id !== finishCol.id || source.index !== destination.index) {
        newFinishTaskIds.splice(destination.index, 0, draggableId); // Insert into finish
    }

    const optimisticColumns = {
        ...boardData.columns,
        [startCol.id]: {
            ...startCol,
            taskIds: newStartTaskIds,
        },
        [finishCol.id]: {
            ...finishCol,
            taskIds: newFinishTaskIds,
        },
    };

    const optimisticTask = { ...task, columnId: destColId }; 
    const optimisticTasks = { ...boardData.tasks, [draggableId]: optimisticTask };

    setBoardData({
        ...boardData,
        tasks: optimisticTasks,
        columns: optimisticColumns,
    });

    // --- API Call --- 
    try {
        const updatePayload = {
            sourceColumnId: sourceColId,
            destColumnId: destColId,
            sourceIndex: source.index,
            destIndex: destination.index,
            columnId: destColId // Explicitly update columnId
        };
        const response = await updateTask(draggableId, updatePayload);

        if (!response || !response.task || !response.sourceColumn || !response.destColumn) {
            throw new Error('Invalid response from server after task update');
        }
        
        // Update state definitively based on successful API response
        // This ensures consistency if backend logic differs slightly
        setBoardData(prevData => {
            if (!prevData) return null;
            return {
                ...prevData,
                tasks: { ...prevData.tasks, [response.task.id]: response.task },
                columns: {
                    ...prevData.columns,
                    [response.sourceColumn!.id]: response.sourceColumn!,
                    [response.destColumn!.id]: response.destColumn!,
                },
            };
        });

    } catch (err) {
        console.error("Failed to update task position on backend:", err);
        setError('Failed to move task. Reverting changes.');
        // Revert UI - Simple approach: re-fetch data
        const freshData = await fetchBoardData();
        if (freshData) setBoardData(freshData);
    }
  };

  // --- Column Operations ---
  const handleAddColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColumnTitle.trim() || !boardData) return;

    const tempId = `temp-${uuidv4()}`; // Optimistic temp ID
    const optimisticNewColumn: ColType = { id: tempId, title: newColumnTitle, taskIds: [] };
    const optimisticColumnOrder = [...boardData.columnOrder, tempId];
    const optimisticColumns = { ...boardData.columns, [tempId]: optimisticNewColumn };

    setBoardData({ ...boardData, columns: optimisticColumns, columnOrder: optimisticColumnOrder });
    setNewColumnTitle('');

    const result = await createColumn(newColumnTitle);
    if (result && boardData) {
      // Replace temp column with real data from backend
      const realColumn = Object.values(result.columns)[0];
      setBoardData(prevData => {
          if (!prevData) return null;
          const finalColumns = { ...prevData.columns };
          delete finalColumns[tempId]; // Remove temp
          finalColumns[realColumn.id] = realColumn; // Add real
          return { ...prevData, columns: finalColumns, columnOrder: result.columnOrder };
      });
    } else {
      setError('Failed to create column.');
      // Revert optimistic update
       setBoardData(prevData => {
           if(!prevData) return null;
           const revertedColumns = { ...prevData.columns };
           delete revertedColumns[tempId];
           const revertedOrder = prevData.columnOrder.filter(id => id !== tempId);
           return { ...prevData, columns: revertedColumns, columnOrder: revertedOrder };
       });
    }
  };

  const handleRenameColumn = async (columnId: string, newTitle: string) => {
      if (!boardData || !boardData.columns[columnId] || boardData.columns[columnId].title === newTitle) return;

      const oldTitle = boardData.columns[columnId].title;
      // Optimistic UI
      setBoardData(prev => prev ? {
          ...prev,
          columns: { ...prev.columns, [columnId]: { ...prev.columns[columnId], title: newTitle } }
      } : null);

      const updatedColumn = await renameColumn(columnId, newTitle);
      if (!updatedColumn) {
          setError('Failed to rename column.');
          // Revert
          setBoardData(prev => prev ? {
              ...prev,
              columns: { ...prev.columns, [columnId]: { ...prev.columns[columnId], title: oldTitle } }
          } : null);
      }
       // No need to update state again if API succeeds, optimistic update holds
  };

  const handleDeleteColumn = async (columnId: string) => {
      if (!boardData || !boardData.columns[columnId]) return;
      if (!window.confirm(`Delete column "${boardData.columns[columnId].title}" and ALL its tasks?`)) return;

      const columnToDelete = boardData.columns[columnId];
      const tasksToDelete = columnToDelete.taskIds.map(id => boardData.tasks[id]).filter(Boolean);
      const originalBoardData = { ...boardData }; // Store for potential revert

      // Optimistic UI update
      const optimisticColumns = { ...boardData.columns };
      delete optimisticColumns[columnId];
      const optimisticTasks = { ...boardData.tasks };
      columnToDelete.taskIds.forEach(taskId => delete optimisticTasks[taskId]);
      const optimisticColumnOrder = boardData.columnOrder.filter(id => id !== columnId);

      setBoardData({ tasks: optimisticTasks, columns: optimisticColumns, columnOrder: optimisticColumnOrder });

      const result = await deleteColumn(columnId);
      if (!result) {
          setError('Failed to delete column.');
          // Revert - more complex, restore columns, tasks, and order
          setBoardData(originalBoardData);
      } 
      // If API succeeds, optimistic update holds. Ensure columnOrder matches backend if needed
      else if (result.columnOrder) { 
           setBoardData(prev => prev ? { ...prev, columnOrder: result.columnOrder } : null);
      }
  };

  // --- Task Operations ---
  const handleAddTask = async (columnId: string, title: string) => {
      if (!title.trim() || !boardData) return;

      const tempId = `temp-task-${uuidv4()}`;
      const optimisticNewTask: Task = { id: tempId, title, columnId };
      const optimisticColumn = { ...boardData.columns[columnId] };
      optimisticColumn.taskIds = [tempId, ...optimisticColumn.taskIds]; // Add to top

      setBoardData(prev => prev ? {
          ...prev,
          tasks: { ...prev.tasks, [tempId]: optimisticNewTask },
          columns: { ...prev.columns, [columnId]: optimisticColumn },
      } : null);

      const result = await createTask(title, columnId);
      if (result && boardData) {
           setBoardData(prev => {
               if (!prev) return null;
               const finalTasks = { ...prev.tasks };
               delete finalTasks[tempId]; // Remove temp task
               finalTasks[result.task.id] = result.task; // Add real task
               return {
                   ...prev,
                   tasks: finalTasks,
                   columns: { ...prev.columns, [columnId]: result.column }, // Update column with new taskIds order from backend
               };
           });
      } else {
          setError('Failed to create task.');
           // Revert
          setBoardData(prev => {
               if (!prev) return null;
               const revertedTasks = { ...prev.tasks };
               delete revertedTasks[tempId];
               const revertedColumn = { ...prev.columns[columnId] };
               revertedColumn.taskIds = revertedColumn.taskIds.filter(id => id !== tempId);
               return {
                   ...prev,
                   tasks: revertedTasks,
                   columns: { ...prev.columns, [columnId]: revertedColumn },
               };
           });
      }
  };

  const openModal = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  const handleSaveTask = async (taskId: string, updates: Partial<Task>) => {
    if (!boardData) return;
    const originalTask = boardData.tasks[taskId];

    // Optimistic UI Update
    const optimisticTask = { ...originalTask, ...updates };
    setBoardData(prev => prev ? {
        ...prev,
        tasks: { ...prev.tasks, [taskId]: optimisticTask }
    } : null);

    const result = await updateTask(taskId, updates);
    if (!result || !result.task) {
      setError('Failed to save task details.');
       // Revert
       setBoardData(prev => prev ? {
           ...prev,
           tasks: { ...prev.tasks, [taskId]: originalTask }
       } : null);
    } else {
        // Update state definitively (optional, if backend returns more info)
         setBoardData(prev => prev ? {
           ...prev,
           tasks: { ...prev.tasks, [result.task.id]: result.task }
       } : null);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
      if (!boardData) return;
      const taskToDelete = boardData.tasks[taskId];
      if (!taskToDelete) return;

      const originalBoardData = { ...boardData }; // Store for revert
      const columnId = taskToDelete.columnId;
      const column = boardData.columns[columnId];

      // Optimistic UI update
      const optimisticTasks = { ...boardData.tasks };
      delete optimisticTasks[taskId];
      const optimisticColumn = column ? { ...column, taskIds: column.taskIds.filter(id => id !== taskId) } : null;
      const optimisticColumns = column && optimisticColumn ? { ...boardData.columns, [columnId]: optimisticColumn } : { ...boardData.columns };

      setBoardData({ ...boardData, tasks: optimisticTasks, columns: optimisticColumns });

      const result = await deleteTask(taskId);
      if (!result) {
          setError('Failed to delete task.');
          setBoardData(originalBoardData); // Revert
      } 
      // Optional: Confirm state based on result.column if needed
      else if (result.column) {
          setBoardData(prev => prev ? { ...prev, columns: { ...prev.columns, [result.column!.id]: result.column! } } : null);
      }
  };

  // --- Render Logic ---
  if (loading) {
    return <div className="loading">Loading board...</div>;
  }

  if (error || !boardData) {
    return <div className="error">Error: {error || 'Board data is unavailable.'}</div>;
  }

  const { tasks, columns, columnOrder } = boardData;

  // --- Filtering Logic --- 
  const lowerSearchTerm = searchTerm.toLowerCase();
  const filteredTasks = lowerSearchTerm
    ? Object.values(tasks).filter(task => 
        task.title.toLowerCase().includes(lowerSearchTerm) ||
        (task.description && task.description.toLowerCase().includes(lowerSearchTerm))
      )
    : Object.values(tasks); // No filter if search is empty
  
  // Create a map for quick lookup of filtered tasks by ID
  const filteredTaskMap = filteredTasks.reduce((acc, task) => {
      acc[task.id] = task;
      return acc;
  }, {} as { [key: string]: Task });

  return (
    <div className="board-container">
      {/* Remove old top-level add task form */} 

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="all-columns" direction="horizontal" type="column">
          {(provided) => (
            <div 
                className="board" 
                {...provided.droppableProps} 
                ref={provided.innerRef}
            >
              {columnOrder.map((columnId, index) => {
                const column = columns[columnId];
                if (!column) return null; 

                // Filter tasks for this specific column using the pre-filtered map
                const columnTasks = column.taskIds
                                        .map(taskId => filteredTaskMap[taskId]) // Get tasks from the filtered map
                                        .filter(Boolean); // Remove any undefined entries (tasks not matching search)
                
                return (
                  <Column
                    key={column.id}
                    column={column}
                    tasks={columnTasks} // Pass the filtered tasks
                    index={index} 
                    onAddTask={handleAddTask} 
                    onRenameColumn={handleRenameColumn} 
                    onDeleteColumn={handleDeleteColumn} 
                    onOpenTaskModal={openModal} 
                  />
                );
              })}
              {provided.placeholder}
               {/* --- Add New Column Form --- */}
                <div className="add-column-section">
                    <form onSubmit={handleAddColumn} className="add-column-form">
                        <input
                        type="text"
                        placeholder="+ Add another list"
                        value={newColumnTitle}
                        onChange={(e) => setNewColumnTitle(e.target.value)}
                        />
                        <button type="submit" disabled={!newColumnTitle.trim()}>Add List</button>
                    </form>
                </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Task Details Modal */} 
      <TaskModal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        task={selectedTask}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask} // Pass delete handler
      />
    </div>
  );
};

export default Board;

// Helper to set the app element for react-modal (accessibility)
// Call this once in your main App component or index.tsx
export const setupModal = () => {
    const appElement = document.getElementById('root');
    if (appElement) {
        Modal.setAppElement(appElement);
    } else {
        console.error("Modal app element '#root' not found. Accessibility features may be impaired.");
    }
}; 