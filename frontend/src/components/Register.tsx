import React, { useState } from 'react';

interface RegisterProps {
  onRegister: (token: string, user: object) => void;
  onSwitchToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onRegister, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'consumer'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: formData.role
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      onRegister(data.token, data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-none border-0 ms-auto me-auto login-card">
      <div className="card-body rounded-0 text-left">
        <h4 className="fw-300 font-xl display2-sm-size mb-3">Create your account</h4>
        
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
                placeholder="Password (min 6 characters)"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>
            <div className="form-group mb-3">
              <input
                type="password"
                className="form-control text-grey-900 style2-input"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group mb-3">
              <select
                className="form-control text-grey-900 style2-input"
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="consumer">Consumer</option>
                <option value="creator">Creator</option>
              </select>
            </div>
            <div className="form-group mb-1">
              <button 
                type="submit" 
                className="form-control text-center style2-input text-white fw-600 bg-dark border-0 p-0"
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Register'}
              </button>
            </div>
          </div>
        </form>

        <div className="col-sm-12 p-0 text-center mt-2">
          <h6 className="mb-0 d-inline-block bg-white fw-500 font-xsss text-grey-500 mb-3">
            Already have an account? 
            <button 
              type="button" 
              className="btn btn-link p-0 ms-2 text-primary"
              onClick={onSwitchToLogin}
            >
              Login
            </button>
          </h6>
        </div>
      </div>
    </div>
  );
};

export default Register;