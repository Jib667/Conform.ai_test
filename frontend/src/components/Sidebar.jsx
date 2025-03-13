import React from 'react';
import './Sidebar.css';
import conformLogo from '../assets/conform_logo.png';

const Sidebar = ({ isOpen, onClose, user, onNavigate, handleDashboardClick }) => {
  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}></div>
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img src={conformLogo} alt="Conform.ai logo" className="sidebar-logo-image" />
            <span className="sidebar-logo-text">Conform</span>
          </div>
          <button className="sidebar-close" onClick={onClose}>×</button>
        </div>
        
        <div className="sidebar-content">
          <h3 className="sidebar-title">Pages</h3>
          <ul className="sidebar-menu">
            <li className="sidebar-menu-item">
              <a 
                href="/" 
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('home');
                  onClose();
                }}
              >
                Home
              </a>
            </li>
            <li className="sidebar-menu-item">
              <a 
                href="/dashboard" 
                onClick={(e) => {
                  if (user) {
                    e.preventDefault();
                    onNavigate('dashboard');
                    onClose();
                  } else {
                    handleDashboardClick(e);
                    onClose();
                  }
                }}
              >
                Dashboard
              </a>
            </li>
            <li className="sidebar-menu-item">
              <a href="#">Features</a>
            </li>
            <li className="sidebar-menu-item">
              <a href="#">Use Cases</a>
            </li>
            <li className="sidebar-menu-item">
              <a href="#">Documentation</a>
            </li>
            <li className="sidebar-menu-item">
              <a href="#">About Us</a>
            </li>
            <li className="sidebar-menu-item">
              <a href="#">Contact</a>
            </li>
          </ul>
        </div>
        
        {user && (
          <div className="sidebar-footer">
            <p>Logged in as: <strong>{user.name}</strong></p>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar; 