import React, { useState } from 'react';
import './Sidebar.css'; // Create this file next

// Simple type for menu items for now
interface MenuItem {
  id: string;
  label: string;
  icon?: string; // Placeholder for icon later
}

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true); // Sidebar starts open

  const menuItems: MenuItem[] = [
    { id: 'board', label: 'My Board', icon: '📊' },
    { id: 'reports', label: 'Reports', icon: '📈' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <button onClick={toggleSidebar} className="toggle-button">
        {isOpen ? '«' : '»'} 
      </button>
      <div className="menu-items">
        {menuItems.map((item) => (
          <a href="#" key={item.id} className="menu-item">
            <span className="menu-icon">{item.icon || '-'}</span>
            {isOpen && <span className="menu-label">{item.label}</span>}
          </a>
        ))}
      </div>
    </div>
  );
};

export default Sidebar; 