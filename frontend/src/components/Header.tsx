import React from 'react';
import './Header.css'; // We'll create this next

interface HeaderProps {
  projectName: string;
  onSearch: (searchTerm: string) => void;
}

const Header: React.FC<HeaderProps> = ({ projectName, onSearch }) => {
  // Internal state for the search input
  const [localSearchTerm, setLocalSearchTerm] = React.useState('');

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchTerm(event.target.value);
    // Call the prop function immediately on change
    onSearch(event.target.value);
  };

  // Optional: Handle form submission if needed (e.g., press Enter)
  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSearch(localSearchTerm); // Explicitly trigger search on submit
  };

  return (
    <header className="app-header">
      <div className="project-info">
        {/* Icon placeholder */} 
        <span className="project-icon"> KAN </span> 
        <h1>{projectName}</h1>
        {/* Add project switcher dropdown later */}
      </div>
      <div className="header-actions">
        <form onSubmit={handleSearchSubmit}>
          <input 
            type="search" 
            placeholder="Search tickets..."
            className="search-input"
            value={localSearchTerm}
            onChange={handleInputChange}
          />
        </form>
        <div className="user-info">
          {/* Change text to initials */}
          <span>ML</span>
        </div>
      </div>
    </header>
  );
};

export default Header; 