import React, { useState } from 'react';
import Login from '../components/Login';
import Register from '../components/Register';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  const handleLogin = (token: string, user: object) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    window.location.href = '/default';
  };

  const handleRegister = (token: string, user: object) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    window.location.href = '/default';
  };

  return (
    <div className="main-wrap">
      <div className="nav-header bg-transparent shadow-none border-0">
        <div className="nav-top w-100">
          <a href="/">
            <i className="feather-zap text-success display1-size me-2 ms-0"></i>
            <span className="d-inline-block fredoka-font ls-3 fw-600 text-current font-xxl logo-text mb-0">
              SolyFans
            </span>
          </a>
        </div>
      </div>

      <div className="row">
        <div className="col-xl-5 d-none d-xl-block p-0 vh-100 bg-image-cover bg-no-repeat" 
             style={{ backgroundImage: 'url(/images/login-bg.jpg)' }}>
        </div>
        <div className="col-xl-7 vh-100 align-items-center d-flex bg-white rounded-3 overflow-hidden">
          {isLogin ? (
            <Login 
              onLogin={handleLogin} 
              onSwitchToRegister={() => setIsLogin(false)} 
            />
          ) : (
            <Register 
              onRegister={handleRegister} 
              onSwitchToLogin={() => setIsLogin(true)} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;