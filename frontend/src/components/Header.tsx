import React from 'react';
import './Header.css'; // We'll create this next

interface HeaderProps {
  projectName: string;
  searchTerm: string;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const Header: React.FC<HeaderProps> = ({ projectName, searchTerm, onSearchChange }) => {
  return (
    <header className="app-header">
      <div className="project-info">
        {/* Icon placeholder */} 
        <span className="project-icon"> KAN </span> 
        <h1>{projectName}</h1>
        {/* Add project switcher dropdown later */}
      </div>
      <div className="header-actions">
        <input 
          type="search" 
          placeholder="Search tickets..."
          className="search-input"
          value={searchTerm}
          onChange={onSearchChange}
        />
        <div className="user-info">
          {/* Change text to initials */}
          <span>ML</span>
        </div>
      </div>
    </header>
  );
};

export default Header; 