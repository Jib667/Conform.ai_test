import './App.css'
import conformLogo from './assets/conform_logo.png'
import h2aiLogo from './assets/h2ai_logo.png'
import medicalFormPreview from './assets/medical_form.png'
import popup1 from './assets/popup1.png'
import popup2 from './assets/popup2.png'
import xIcon from './assets/x.png'
import clockIcon from './assets/clock.png'
import carousel1 from './assets/carousel1.png'
import carousel2 from './assets/carousel2.png'
import carousel3 from './assets/carousel3.png'
import carousel4 from './assets/carousel4.png'
import carousel5 from './assets/carousel5.png'
import carousel6 from './assets/carousel6.png'
import carousel7 from './assets/carousel7.png'
import carousel8 from './assets/carousel8.png'
import carousel9 from './assets/carousel9.png'
import carousel10 from './assets/carousel10.png'
import carousel11 from './assets/carousel11.png'
import carousel12 from './assets/carousel12.png'
import carousel13 from './assets/carousel13.png'
import carousel14 from './assets/carousel14.png'
import Carousel from './components/Carousel'
import SignUp from './components/SignUp'
import Login from './components/Login'
import { useEffect, useState } from 'react'

function App() {
  const [showPopups, setShowPopups] = useState(true);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState(null);
  
  const carouselImages = [
    carousel1, carousel2, carousel3, carousel4,
    carousel5, carousel6, carousel7, carousel8, 
    carousel9, carousel10, carousel11, carousel12,
    carousel13, carousel14
  ];

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

  const handleSignUpClick = () => {
    setShowSignUp(true);
  };

  const handleCloseSignUp = () => {
    setShowSignUp(false);
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
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
          <div className="logo-container">
            <img src={conformLogo} alt="Conform.ai logo" className="logo-image" />
            <span className="logo-text">Conform</span>
          </div>
          <div className="h2ai-logo-container">
            <img src={h2aiLogo} alt="H2.ai logo" className="h2ai-logo" />
          </div>
          <div className="header-right">
            {user ? (
              <div className="user-menu">
                <span>Welcome, {user.name}</span>
                <button onClick={handleLogout} className="login-button">Logout</button>
              </div>
            ) : (
              <>
                <button onClick={() => setShowLogin(true)} className="login-button">Log In</button>
                <button onClick={() => setShowSignUp(true)} className="sign-up-button">Sign Up</button>
              </>
            )}
          </div>
        </div>
      </header>
      
      <main className="main-content">
        <div className="hero-section">
          <div className="hero-content">
            <div className="hero-text">
              <h1>
                Fill and send medical forms <span className="highlight">accurately</span> and <span className="highlight">quickly</span> with Conform
              </h1>
              <button className="get-started-button" onClick={handleSignUpClick}>Get Started</button>
            </div>
            <div className="carousel-section">
              <h2 className="carousel-title">Fill and send <span className="highlight">any</span> medical form</h2>
              <Carousel images={carouselImages} />
            </div>
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
            </div>
          </div>
        </div>

        <div className="features-section">
          <h2>Why Choose Conform?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-title">
                <img src={conformLogo} alt="Conform logo" className="feature-icon" />
                <h3>Smart Form Filling</h3>
              </div>
              <p>Conform automatically fills form fields that have been previously saved.</p>
            </div>
            <div className="feature-card">
              <div className="feature-title">
                <img src={xIcon} alt="Error prevention icon" className="feature-icon" />
                <h3>Error Prevention</h3>
              </div>
              <p>Real-time AI validation ensures that entries are consistent and accurate.</p>
            </div>
            <div className="feature-card">
              <div className="feature-title">
                <img src={clockIcon} alt="Clock icon" className="feature-icon" />
                <h3>Time Saving</h3>
              </div>
              <p>Reduce form filling time by having a dashboard of all patient forms.</p>
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
      
      {showSignUp && <SignUp onClose={handleCloseSignUp} />}

      {showLogin && (
        <Login 
          onClose={() => setShowLogin(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </div>
  )
}

export default App
