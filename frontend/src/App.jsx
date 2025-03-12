import './App.css'
import conformLogo from './assets/conform_logo.png'
import h2aiLogo from './assets/h2ai_logo.png'
import medicalFormPreview from './assets/medical_form.png'
import popup1 from './assets/popup1.png'
import popup2 from './assets/popup2.png'
import popup3 from './assets/popup3.png'
import { useEffect, useState } from 'react'

function App() {
  const [showPopups, setShowPopups] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const showDuration = 3000;
    const hideDuration = 1000;
    let timeoutId;

    const togglePopups = () => {
      if (isMounted) {
        setShowPopups(true);
        timeoutId = setTimeout(() => {
          if (isMounted) {
            setShowPopups(false);
          }
        }, showDuration);
      }
    };

    togglePopups();
    const intervalId = setInterval(togglePopups, showDuration + hideDuration);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, []);

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
          <div className="logo-container">
            <img src={conformLogo} alt="Conform.ai logo" className="logo-image" />
            <span className="logo-text">Conform</span>
          </div>
          <div className="h2ai-logo-container">
            <img src={h2aiLogo} alt="H2.ai logo" className="h2ai-logo" />
          </div>
          <div className="header-right">
            <button className="login-button">Log In</button>
            <button className="sign-up-button">Sign Up</button>
          </div>
        </div>
      </header>
      
      <main className="main-content">
        <div className="hero-section">
          <div className="hero-text">
            <h1>
              Fill and send medical forms <span className="highlight">accurately</span> and <span className="highlight">quickly</span> with Conform
            </h1>
            <button className="get-started-button">Get Started</button>
          </div>
          <div className="hero-image">
            <div className="form-container">
              <img src={medicalFormPreview} alt="Medical form preview" className="form-preview" />
              <img 
                src={popup1} 
                alt="Vermont popup" 
                className={`popup popup-vermont ${showPopups ? 'show' : ''}`}
              />
              <img 
                src={popup2} 
                alt="Diabetes popup" 
                className={`popup popup-diabetes ${showPopups ? 'show' : ''}`}
              />
              <img 
                src={popup3} 
                alt="Sarah Smith popup" 
                className={`popup popup-signature ${showPopups ? 'show' : ''}`}
              />
            </div>
          </div>
        </div>

        <div className="features-section">
          <h2>Why Choose Conform?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>Smart Form Filling</h3>
              <p>Our AI automatically fills forms with accurate information from your records.</p>
            </div>
            <div className="feature-card">
              <h3>Error Prevention</h3>
              <p>Real-time validation ensures consistency across all your medical forms.</p>
            </div>
            <div className="feature-card">
              <h3>Time Saving</h3>
              <p>Reduce form filling time by up to 80% with our intelligent automation.</p>
            </div>
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
            <h4>Product</h4>
            <ul>
              <li><a href="#">Features</a></li>
              <li><a href="#">Pricing</a></li>
              <li><a href="#">Documentation</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Company</h4>
            <ul>
              <li><a href="#">About Us</a></li>
              <li><a href="#">Contact</a></li>
              <li><a href="#">Privacy Policy</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Connect</h4>
            <div className="social-links">
              <a href="#" className="social-link">Twitter</a>
              <a href="#" className="social-link">LinkedIn</a>
              <a href="#" className="social-link">GitHub</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="sponsored-by">
            <span>Sponsored by</span>
            <img src={h2aiLogo} alt="H2.ai logo" className="h2ai-logo" />
          </div>
          <p>&copy; 2025 Conform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default App