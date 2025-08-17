import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/loading.css';

const Loading = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setLoading(false);
      // Redirect to welcome page after animation completes
      setTimeout(() => navigate('/welcome'), 500);
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className={`loading-container ${!loading ? 'fade-out' : ''}`}>
      <div className="logo-animation">
        <div className="logo-spinner">
          <div className="logo-circle"></div>
          <div className="logo-text">$</div>
        </div>
        <h1>SpendBook</h1>
        <p className="developer-credit">Developed by Saikat Kar</p>
      </div>
    </div>
  );
};

export default Loading;
