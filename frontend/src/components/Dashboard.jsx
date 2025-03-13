import React, { useState } from 'react';
import conformLogo from '../assets/conform_logo.png';
import h2aiLogo from '../assets/h2ai_logo.png';
import './Dashboard.css';
import EditProfile from './EditProfile';

const Dashboard = ({ user, onLogout, onToggleSidebar, onUpdateUser }) => {
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [forms, setForms] = useState([]);
  
  const handleHomeClick = (e) => {
    e.preventDefault();
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };
  
  const handleCreateForm = () => {
    // This would typically open a form editor or create a new form
    const newForm = {
      id: Date.now(),
      title: `New Form ${forms.length + 1}`,
      createdAt: new Date().toISOString(),
      elements: []
    };
    
    setForms([...forms, newForm]);
  };
  
  const handleEditForm = (formId) => {
    // This would open the form editor for the selected form
    console.log(`Editing form ${formId}`);
  };
  
  const handleDeleteForm = (formId) => {
    setForms(forms.filter(form => form.id !== formId));
  };
  
  const handleUpdateSuccess = (updatedUser) => {
    // Pass the updated user data to the parent component
    if (onUpdateUser) {
      onUpdateUser(updatedUser);
    }
  };

  return (
    <div className="app">
      <div className="sparkle"></div>
      <div className="sparkle"></div>
      <div className="sparkle"></div>
      <div className="sparkle"></div>
      <div className="sparkle"></div>
      <div className="sparkle"></div>
      <div className="sparkle"></div>
      <div className="sparkle"></div>
      <div className="sparkle"></div>
      <div className="sparkle"></div>
      <div className="decorative-circle decorative-circle-1"></div>
      <div className="decorative-circle decorative-circle-2"></div>

      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <div className="hamburger-menu" onClick={onToggleSidebar}>
              <div className="hamburger-line"></div>
              <div className="hamburger-line"></div>
              <div className="hamburger-line"></div>
            </div>
            <div 
              className="logo-container" 
              onClick={handleHomeClick}
              style={{ cursor: 'pointer' }}
            >
              <img src={conformLogo} alt="Conform.ai logo" className="logo-image" />
              <span className="logo-text">Conform</span>
            </div>
          </div>
          <div className="h2ai-logo-container">
            <img src={h2aiLogo} alt="H2.ai logo" className="h2ai-logo" />
          </div>
          <div className="header-right">
            <div className="user-menu">
              <span>Welcome, {user?.name}</span>
              <button onClick={onLogout} className="login-button">Logout</button>
            </div>
          </div>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="dashboard-header">
          <h1>{user?.name.split(' ')[0]}'s Dashboard</h1>
          <p>Manage your medical forms and submissions</p>
        </div>

        {/* Form Editor Card */}
        <div className="form-editor-card">
          <div className="form-editor-header">
            <h3>Form Editor</h3>
            <button 
              className="form-editor-button"
              onClick={handleCreateForm}
            >
              Create New Form
            </button>
          </div>
          
          <div className="form-editor-content">
            {forms.length > 0 ? (
              <ul className="form-editor-list">
                {forms.map(form => (
                  <li key={form.id} className="form-editor-item">
                    <span className="form-editor-item-title">{form.title}</span>
                    <div className="form-editor-item-actions">
                      <button 
                        className="form-editor-item-button"
                        onClick={() => handleEditForm(form.id)}
                      >
                        Edit
                      </button>
                      <button 
                        className="form-editor-item-button"
                        onClick={() => handleDeleteForm(form.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="form-editor-empty">
                <p>You haven't created any forms yet. Click "Create New Form" to get started.</p>
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h2>Recent Forms</h2>
            <p className="empty-state">No forms submitted yet</p>
            <button className="dashboard-button">Submit New Form</button>
          </div>

          <div className="dashboard-card">
            <h2>Saved Templates</h2>
            <p className="empty-state">No templates saved</p>
            <button className="dashboard-button">Create Template</button>
          </div>

          <div className="dashboard-card">
            <h2>Profile Information</h2>
            <div className="profile-info">
              <p><strong>Name:</strong> {user?.name}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Healthcare Title:</strong> {user?.healthcareTitle}</p>
              <p><strong>Hospital System:</strong> {user?.hospitalSystem}</p>
            </div>
            <button 
              className="dashboard-button" 
              onClick={() => setShowEditProfile(true)}
            >
              Edit Profile
            </button>
          </div>
        </div>
      </main>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <div className="logo-container">
              <img src={conformLogo} alt="Conform.ai logo" className="logo-image" />
              <span className="logo-text">Conform</span>
            </div>
            <p className="footer-description">Making medical form filling accurate and efficient.</p>
          </div>
          <div className="footer-section">
            <h4>Pages</h4>
            <ul>
              <li><a href="/" onClick={handleHomeClick}>Home</a></li>
              <li><a href="/dashboard">Dashboard</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Product</h4>
            <ul>
              <li><a href="#">Features</a></li>
              <li><a href="#">Use Cases</a></li>
              <li><a href="#">Documentation</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Company</h4>
            <ul>
              <li><a href="#">About Us</a></li>
              <li><a href="#">Contact</a></li>
              <li><a href="#">Future Work</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Connect</h4>
            <div className="social-links">
              <a href="#" className="social-link">GitHub</a>
              <a href="#" className="social-link">Devpost</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="sponsored-by">
            <span>A project made at</span>
            <img src={h2aiLogo} alt="H2.ai logo" className="h2ai-logo" />
          </div>
          <p>&copy; 2025 Conform. All rights reserved.</p>
        </div>
      </footer>

      {showEditProfile && (
        <EditProfile 
          user={user} 
          onClose={() => setShowEditProfile(false)} 
          onUpdateSuccess={handleUpdateSuccess}
        />
      )}
    </div>
  );
};

export default Dashboard; 