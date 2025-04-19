import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Board, { setupModal } from './components/Board';
// import { fetchDefaultProject } from './services/taskService'; // Removed import
import { Project } from './types';
import Sidebar from './components/Sidebar'; // Import Sidebar
import './App.css';

function App() {
  const [projectName, setProjectName] = useState('Loading project...');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    // setupModal(); // Call modal setup
    // // Fetch default project data
    // const loadProject = async () => {
    //   const project = await fetchDefaultProject(); // Removed call
    //   if (project) {
    //     setProjectName(project.name);
    //   } else {
    //     setProjectName('Default Project'); // Fallback name
    //   }
    // };
    // loadProject();
    setupModal(); // Call modal setup
    setProjectName('Default Project'); // Set name directly for now

  }, []);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
};

  return (
    <div className={`App ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar collapsed={isSidebarCollapsed} onToggle={toggleSidebar} />
      <div className="main-content">
          <Header 
              projectName={projectName} 
              onSearch={handleSearch} 
          />
          <Board searchTerm={searchTerm} />
      </div>
    </div>
  );
}

export default App;
