import React, { useState, useEffect } from 'react';
import Board, { setupModal } from './components/Board'; // Import setupModal
import Header from './components/Header'; // Import Header
import Sidebar from './components/Sidebar'; // Import Sidebar
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
      <Sidebar /> { /* Render Sidebar */}
      <div className="main-content"> { /* Wrapper for Header and Board */}
        <Header 
          projectName={projectName} 
          searchTerm={searchTerm} // Pass searchTerm down
          onSearchChange={handleSearchChange} // Pass handler down
        /> 
        <Board searchTerm={searchTerm} /> {/* Pass searchTerm to Board */}
      </div>
    </div>
  );
}

export default App;
