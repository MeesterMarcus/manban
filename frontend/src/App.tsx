import React, { useState, useEffect } from 'react';
import Board, { setupModal } from './components/Board'; // Import setupModal
import Header from './components/Header'; // Import Header
import { fetchDefaultProject } from './services/taskService'; // Import fetch service
import { Project } from './types'; // Import Project type
import './App.css'; // Keep general styles if needed, or remove if Board.css covers everything

function App() {
  const [projectName, setProjectName] = useState<string>('Loading Project...');
  const [searchTerm, setSearchTerm] = useState<string>(''); // Add search state

  // Fetch default project name on mount
  useEffect(() => {
    setupModal(); // Set up modal accessibility
    const loadProject = async () => {
      const project = await fetchDefaultProject();
      if (project) {
        setProjectName(project.name);
      } else {
        setProjectName('Project Not Found');
      }
    };
    loadProject();
  }, []);

  // Handler for search input changes
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div className="App">
       {/* Render Header with project name */} 
      <Header 
        projectName={projectName} 
        searchTerm={searchTerm} // Pass searchTerm down
        onSearchChange={handleSearchChange} // Pass handler down
      /> 
      {/* Board component remains below the header */} 
      <Board searchTerm={searchTerm} /> {/* Pass searchTerm to Board */}
    </div>
  );
}

export default App;
