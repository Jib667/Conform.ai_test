import React, { useState, useRef, useEffect } from 'react';
import conformLogo from '../assets/conform_logo.png';
import h2aiLogo from '../assets/h2ai_logo.png';
import './Dashboard.css';
import EditProfile from './EditProfile';
import FormEditor from './FormEditor';
import { scrollToTop } from '../utils/scrollUtils';

const Dashboard = ({ 
  user, 
  onLogout, 
  onToggleSidebar, 
  onUpdateUser, 
  forms, 
  setForms, 
  onCreateForm 
}) => {
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showFormEditor, setShowFormEditor] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [userPdfs, setUserPdfs] = useState([]);
  const [lastUploadedPdf, setLastUploadedPdf] = useState(null);
  const [showAllForms, setShowAllForms] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pdfToDelete, setPdfToDelete] = useState(null);
  const [currentFormId, setCurrentFormId] = useState(null);
  const fileInputRef = useRef(null);
  
  // Fetch user's PDFs on component mount
  useEffect(() => {
    if (user) {
      fetchUserPdfs();
    }
  }, [user]);
  
  const fetchUserPdfs = async () => {
    try {
      const response = await fetch(`/api/user/${user.id}/pdfs`);
      if (response.ok) {
        const data = await response.json();
        setUserPdfs(data.pdfs);
      }
    } catch (error) {
      console.error('Error fetching user PDFs:', error);
    }
  };
  
  const handleHomeClick = (e) => {
    e.preventDefault();
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
    scrollToTop();
  };
  
  const handleCreateForm = () => {
    // Reset the last uploaded PDF when clicking to upload a new one
    setLastUploadedPdf(null);
    // Trigger file input click
    fileInputRef.current.click();
    scrollToTop();
  };
  
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check if file is a PDF
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setUploadError('Only PDF files are allowed');
      setTimeout(() => setUploadError(''), 3000);
      return;
    }
    
    setIsUploading(true);
    setUploadError('');
    setUploadSuccess('');
    
    try {
      console.log(`Uploading file: ${file.name}, size: ${file.size} bytes`);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('user_id', user.id);
      
      console.log('Sending upload request...');
      const response = await fetch('/api/upload-pdf', {
        method: 'POST',
        body: formData,
      });
      
      console.log(`Upload response status: ${response.status}`);
      
      let responseText;
      try {
        responseText = await response.text();
        console.log('Response text:', responseText);
      } catch (textError) {
        console.error('Error reading response text:', textError);
      }
      
      if (!response.ok) {
        throw new Error(responseText || `Server error: ${response.status}`);
      }
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('Error parsing JSON response:', jsonError);
        throw new Error('Invalid response from server');
      }
      
      console.log('Upload successful:', data);
      
      setUploadSuccess('PDF uploaded successfully!');
      setTimeout(() => setUploadSuccess(''), 3000);
      
      // Set the last uploaded PDF
      setLastUploadedPdf(data.pdf);
      
      // Refresh the user's PDFs
      fetchUserPdfs();
      
      // Add the form to the forms list
      const newForm = {
        id: data.pdf.id,
        title: data.pdf.originalFilename.replace('.pdf', ''),
        createdAt: data.pdf.uploadDate,
        pdfUrl: data.pdf.url
      };
      
      if (setForms) {
        setForms([newForm, ...forms]);
      }
      
      // Clear the last uploaded PDF after 10 seconds
      setTimeout(() => {
        setLastUploadedPdf(null);
      }, 10000);
      
    } catch (error) {
      console.error('Error uploading PDF:', error);
      setUploadError(`Upload failed: ${error.message}`);
      setTimeout(() => setUploadError(''), 5000);
    } finally {
      setIsUploading(false);
      // Clear the file input
      e.target.value = '';
    }
  };
  
  const handleEditForm = (formId) => {
    // Find the PDF information from userPdfs
    const pdfToEdit = userPdfs.find(pdf => pdf.id === formId);
    
    if (pdfToEdit) {
      // Create a form object with the PDF information
      const formData = {
        id: pdfToEdit.id,
        title: pdfToEdit.originalFilename.replace('.pdf', ''),
        createdAt: pdfToEdit.uploadDate,
        pdfUrl: pdfToEdit.url
      };
      
      // Set the form to be edited
      if (setForms) {
        // Add the form to the forms list if it's not already there
        const formExists = forms.some(form => form.id === formData.id);
        if (!formExists) {
          setForms([formData, ...forms]);
        }
      }
      
      // Open the form editor
      setShowFormEditor(true);
      
      // Store the current form ID for the editor to use
      setCurrentFormId(formData.id);
      
      // Scroll to top
      scrollToTop();
    } else {
      console.error(`Form with ID ${formId} not found`);
      setUploadError('Form not found');
      setTimeout(() => setUploadError(''), 3000);
    }
  };
  
  const handleDeleteForm = (formId) => {
    if (setForms) {
      setForms(forms.filter(form => form.id !== formId));
    }
  };
  
  const handleUpdateSuccess = (updatedUser) => {
    // Pass the updated user data to the parent component
    if (onUpdateUser) {
      onUpdateUser(updatedUser);
    }
  };

  const handleSaveForm = (newForm) => {
    setForms([...forms, newForm]);
    setShowFormEditor(false);
  };

  const handleViewAllForms = () => {
    setShowAllForms(true);
  };

  const handleCloseAllForms = () => {
    setShowAllForms(false);
  };

  const handleDeletePdf = (pdfId) => {
    setPdfToDelete(pdfId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!pdfToDelete) return;
    
    try {
      const response = await fetch(`/api/pdfs/${pdfToDelete}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete form');
      }
      
      // Remove the PDF from the userPdfs state
      setUserPdfs(userPdfs.filter(pdf => pdf.id !== pdfToDelete));
      
      // If this was the last uploaded PDF, clear it
      if (lastUploadedPdf && lastUploadedPdf.id === pdfToDelete) {
        setLastUploadedPdf(null);
      }
      
      // Show success message
      setUploadSuccess('Form deleted successfully');
      setTimeout(() => setUploadSuccess(''), 3000);
      
    } catch (error) {
      console.error('Error deleting PDF:', error);
      setUploadError('Failed to delete form');
      setTimeout(() => setUploadError(''), 5000);
    } finally {
      // Close the confirmation modal
      setShowDeleteConfirm(false);
      setPdfToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setPdfToDelete(null);
  };

  if (showFormEditor) {
    // Find the form to edit
    const formToEdit = currentFormId ? forms.find(form => form.id === currentFormId) : null;
    
    return (
      <FormEditor 
        user={user}
        onLogout={onLogout}
        onToggleSidebar={onToggleSidebar}
        onSaveForm={handleSaveForm}
        onCancel={() => {
          setShowFormEditor(false);
          setCurrentFormId(null);
        }}
        form={formToEdit} // Pass the form to edit
      />
    );
  }

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
          <p>Manage your patient's medical forms and submissions</p>
        </div>

        {/* Hidden file input for PDF upload */}
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept=".pdf" 
          onChange={handleFileChange}
        />

        {/* Upload error/success messages */}
        {uploadError && (
          <div className="upload-error-message">
            {uploadError}
          </div>
        )}
        
        {uploadSuccess && (
          <div className="upload-success-message">
            {uploadSuccess}
          </div>
        )}

        <div className="dashboard-section">
          <h2 style={{ color: 'white' }}>Upload Fillable Form</h2>
          <div className="forms-grid">
            <div 
              className="create-form-card" 
              onClick={handleCreateForm}
              style={{ opacity: isUploading ? 0.7 : 1, pointerEvents: isUploading ? 'none' : 'auto' }}
            >
              {isUploading ? (
                <div className="create-form-icon">Uploading...</div>
              ) : lastUploadedPdf ? (
                <div className="last-upload-info">
                  <div className="last-upload-success">
                    <p className="last-upload-label">Uploaded:</p>
                    <p className="last-upload-name">{lastUploadedPdf.originalFilename}</p>
                  </div>
                </div>
              ) : (
                <div className="create-form-icon">+</div>
              )}
            </div>
            
            {forms.map(form => (
              <div className="form-card" key={form.id}>
                <div className="form-card-header">
                  <div>
                    <h3 className="form-card-title">{form.title}</h3>
                    <div className="form-card-date">
                      {new Date(form.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="form-card-actions">
                    <button 
                      className="form-card-action edit"
                      onClick={() => handleEditForm(form.id)}
                    >
                      ✎
                    </button>
                    <button 
                      className="form-card-action delete"
                      onClick={() => handleDeleteForm(form.id)}
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h2>Recent Forms</h2>
            {userPdfs.length > 0 ? (
              <div className="recent-forms-list">
                {userPdfs.slice(0, 3).map(pdf => (
                  <div className="recent-form-item" key={pdf.id}>
                    <span className="recent-form-name">{pdf.originalFilename}</span>
                    <div className="recent-form-actions">
                      <span className="recent-form-date">
                        {new Date(pdf.uploadDate).toLocaleDateString()}
                      </span>
                      <button 
                        className="form-card-action delete"
                        onClick={() => handleDeletePdf(pdf.id)}
                      >
                        −
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="recent-forms-empty">No forms submitted yet</p>
            )}
            <button 
              className="dashboard-button view-all-button"
              onClick={handleViewAllForms}
            >
              View All Forms
            </button>
          </div>

          <div className="dashboard-card">
            <h2>Saved Templates</h2>
            <div className="empty-state">No templates displayed</div>
            <div className="template-create-button" onClick={() => console.log('Create template')}>
              <div className="template-create-icon">+</div>
            </div>
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
              <li>
                <a 
                  href="/" 
                  onClick={(e) => {
                    e.preventDefault();
                    // Force navigation to home page
                    window.location.href = '/';
                  }}
                >
                  Home
                </a>
              </li>
              <li>
                <a 
                  href="/dashboard" 
                  style={{ fontWeight: 'bold', color: '#4FFFB0' }}
                >
                  Dashboard
                </a>
              </li>
              <li>
                <a 
                  href="/form-editor" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (onCreateForm) {
                      onCreateForm();
                    }
                  }}
                >
                  Form Editor
                </a>
              </li>
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

      {/* View All Forms Popup */}
      {showAllForms && (
        <div className="modal-overlay" onClick={handleCloseAllForms}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>All Uploaded Forms</h2>
              <button className="modal-close" onClick={handleCloseAllForms}>×</button>
            </div>
            <div className="modal-body">
              {userPdfs.length > 0 ? (
                <div className="all-forms-list">
                  {userPdfs.map(pdf => (
                    <div className="all-forms-item" key={pdf.id}>
                      <div className="all-forms-item-left">
                        <span className="all-forms-name">{pdf.originalFilename}</span>
                        <span className="all-forms-date">
                          {new Date(pdf.uploadDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="all-forms-actions">
                        <button 
                          className="form-card-action edit"
                          onClick={() => handleEditForm(pdf.id)}
                        >
                          ✎
                        </button>
                        <button 
                          className="form-card-action delete"
                          onClick={() => handleDeletePdf(pdf.id)}
                        >
                          −
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="all-forms-empty">No forms uploaded yet</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="modal-content delete-confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirm Delete</h2>
              <button className="modal-close" onClick={cancelDelete}>×</button>
            </div>
            <div className="modal-body">
              <p className="delete-confirm-message">
                Are you sure you want to delete this form? This action cannot be undone.
              </p>
              <div className="delete-confirm-actions">
                <button 
                  className="dashboard-button secondary"
                  onClick={cancelDelete}
                >
                  Cancel
                </button>
                <button 
                  className="dashboard-button delete-button"
                  onClick={confirmDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 