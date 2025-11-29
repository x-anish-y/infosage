import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/Login.css';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      window.location.href = '/';
    } catch (err) {
      setError('Login failed. Try again with any credentials (dev mode).');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role) => {
    setError('');
    setLoading(true);
    try {
      await login(role, role + '123');
      window.location.href = '/';
    } catch (err) {
      setError('Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>InfoSage</h1>
          <p>Fact-Checking & Rumor Detection Platform</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="demo-section">
          <p>Quick Demo Login:</p>
          <div className="demo-buttons">
            <button onClick={() => handleDemoLogin('analyst')} disabled={loading}>
              Analyst
            </button>
            <button onClick={() => handleDemoLogin('reviewer')} disabled={loading}>
              Reviewer
            </button>
            <button onClick={() => handleDemoLogin('admin')} disabled={loading}>
              Admin
            </button>
          </div>
        </div>

        <div className="info-box">
          <p>
            <strong>Dev Mode:</strong> Use any username/password combination to login. In production, proper authentication
            will be required.
          </p>
        </div>
      </div>
    </div>
  );
}
