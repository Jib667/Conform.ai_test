import React, { useState } from 'react';
import hospitalSystems from '../data/hospitalSystems';
import './SignUp.css';

const SignUp = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    healthcareTitle: '',
    customTitle: '',
    hospitalSystem: '',
    customHospital: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (formData.healthcareTitle === '') {
      newErrors.healthcareTitle = 'Healthcare title is required';
    } else if (formData.healthcareTitle === 'Other' && !formData.customTitle.trim()) {
      newErrors.customTitle = 'Please specify your healthcare title';
    }
    
    if (formData.hospitalSystem === '') {
      newErrors.hospitalSystem = 'Hospital system is required';
    } else if (formData.hospitalSystem === 'Other' && !formData.customHospital.trim()) {
      newErrors.customHospital = 'Please specify your hospital system';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      // Prepare data for submission
      const submissionData = {
        name: formData.name,
        email: formData.email,
        healthcareTitle: formData.healthcareTitle === 'Other' ? formData.customTitle : formData.healthcareTitle,
        hospitalSystem: formData.hospitalSystem === 'Other' ? formData.customHospital : formData.hospitalSystem
      };
      
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submissionData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }
      
      setSubmitSuccess(true);
      
      // Reset form after successful submission
      setTimeout(() => {
        if (onClose) onClose();
      }, 3000);
      
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Common healthcare titles
  const healthcareTitles = [
    'Physician',
    'Nurse',
    'Nurse Practitioner',
    'Physician Assistant',
    'Medical Assistant',
    'Medical Technician',
    'Healthcare Administrator',
    'Medical Records Specialist',
    'Other'
  ];

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-header">
          <h2>Sign Up for Conform</h2>
          <p>Join other healthcare professionals using Conform to streamline their medical forms.</p>
          {onClose && (
            <button className="close-button" onClick={onClose}>×</button>
          )}
        </div>
        
        {submitSuccess ? (
          <div className="success-message">
            <h3>Thank you for signing up!</h3>
            <p>Your account has been created successfully. We'll be in touch soon.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="signup-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="healthcareTitle">Healthcare Title</label>
              <select
                id="healthcareTitle"
                name="healthcareTitle"
                value={formData.healthcareTitle}
                onChange={handleChange}
                className={errors.healthcareTitle ? 'error' : ''}
              >
                <option value="">Select your title</option>
                {healthcareTitles.map(title => (
                  <option key={title} value={title}>{title}</option>
                ))}
              </select>
              {errors.healthcareTitle && <span className="error-message">{errors.healthcareTitle}</span>}
            </div>
            
            {formData.healthcareTitle === 'Other' && (
              <div className="form-group">
                <label htmlFor="customTitle">Specify Your Title</label>
                <input
                  type="text"
                  id="customTitle"
                  name="customTitle"
                  value={formData.customTitle}
                  onChange={handleChange}
                  className={errors.customTitle ? 'error' : ''}
                />
                {errors.customTitle && <span className="error-message">{errors.customTitle}</span>}
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="hospitalSystem">Hospital System</label>
              <select
                id="hospitalSystem"
                name="hospitalSystem"
                value={formData.hospitalSystem}
                onChange={handleChange}
                className={errors.hospitalSystem ? 'error' : ''}
              >
                <option value="">Select your hospital system</option>
                {hospitalSystems.map(hospital => (
                  <option key={hospital} value={hospital}>{hospital}</option>
                ))}
                <option value="Other">Other</option>
              </select>
              {errors.hospitalSystem && <span className="error-message">{errors.hospitalSystem}</span>}
            </div>
            
            {formData.hospitalSystem === 'Other' && (
              <div className="form-group">
                <label htmlFor="customHospital">Specify Your Hospital System</label>
                <input
                  type="text"
                  id="customHospital"
                  name="customHospital"
                  value={formData.customHospital}
                  onChange={handleChange}
                  className={errors.customHospital ? 'error' : ''}
                />
                {errors.customHospital && <span className="error-message">{errors.customHospital}</span>}
              </div>
            )}
            
            {submitError && (
              <div className="error-banner">
                {submitError}
              </div>
            )}
            
            <button 
              type="submit" 
              className="signup-submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Sign Up'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SignUp; 