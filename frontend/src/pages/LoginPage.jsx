import { useState } from 'react';

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!username.trim() || !password.trim()) {
      return;
    }

    onLogin();
  };

  return (
    <div className="login-page">
      <div className="login-panel">
        <div className="login-brand">
          <div className="login-brand-icon">▥</div>

          <div>
            <h1>INFRAMON</h1>
            <p>Infrastructure Monitoring</p>
          </div>
        </div>

        <div className="login-card">
          <div className="login-heading">
            <h2>Welcome Back</h2>
            <p>Sign in to access the Infrastructure Monitoring Portal.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="login-field">
              <label htmlFor="username">Username / Email</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Enter your username"
                autoComplete="username"
              />
            </div>

            <div className="login-field">
              <label htmlFor="password">Password</label>

              <div className="password-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className="login-options">
              <label className="remember-option">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
            </div>

            <button type="submit" className="login-button">
              Sign In
            </button>
          </form>
        </div>

        <div className="login-footer">
          <p>Government Infrastructure Monitoring Portal</p>
          <span>Authorized Access Only</span>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;