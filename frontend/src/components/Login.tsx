import React, { useState } from 'react';

interface LoginProps {
  onLogin: (token: string, user: object) => void;
  onSwitchToRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      onLogin(data.token, data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-none border-0 ms-auto me-auto login-card">
      <div className="card-body rounded-0 text-left">
        <h4 className="fw-300 font-xl display2-sm-size mb-3">Login into your account</h4>
        
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="col-sm-12 p-0 text-left">
            <div className="form-group mb-3">
              <input
                type="email"
                className="form-control text-grey-900 style2-input"
                name="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group mb-3">
              <input
                type="password"
                className="form-control text-grey-900 style2-input"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group mb-1">
              <button 
                type="submit" 
                className="form-control text-center style2-input text-white fw-600 bg-dark border-0 p-0"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </div>
          </div>
        </form>

        <div className="col-sm-12 p-0 text-center mt-2">
          <h6 className="mb-0 d-inline-block bg-white fw-500 font-xsss text-grey-500 mb-3">
            Don't have an account? 
            <button 
              type="button" 
              className="btn btn-link p-0 ms-2 text-primary"
              onClick={onSwitchToRegister}
            >
              Register
            </button>
          </h6>
        </div>
      </div>
    </div>
  );
};

export default Login;