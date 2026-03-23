import { useState } from 'react';
import type { FormEvent, FC } from 'react';
import { GoogleLogin } from '@react-oauth/google';

interface AuthViewProps {
  initialMode: 'login' | 'signup';
  onClose: () => void;
  onSuccess: (user: string, token: string) => void;
}

const AuthView: FC<AuthViewProps> = ({ initialMode, onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState<boolean>(initialMode === 'login');
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';

    try {
      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Authentication failed');
      }

      onSuccess(data.username, data.access_token);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Google authentication failed');

      onSuccess(data.username, data.access_token);
    } catch (err: any) {
      setError(err.message || 'Google authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="auth-card animate-scale-in">
        <button className="auth-close" onClick={onClose}>&times;</button>

        <div className="auth-header">
          <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p>{isLogin ? 'Enter your researcher credentials' : 'Join the elite research community'}</p>
          {error && (
            <div style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '0.5rem', marginTop: '1rem', fontSize: '0.85rem', fontWeight: 500 }}>
              {error}
            </div>
          )}
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Dr. Jane Smith"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          )}

          <div className="form-group">
            <label>Work Email</label>
            <input
              type="email"
              placeholder="jane.smith@univ.edu"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button className="btn-auth-submit" disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <div className="social-auth">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google Login Failed')}
            theme="filled_black"
            text="continue_with"
            shape="pill"
            width="100%"
          />
        </div>

        <div className="auth-footer">
          <p>
            {isLogin ? "Don't have an account?" : "Already a member?"}
            <span
              className="auth-switch-link"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? ' Sign Up' : ' Login'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthView;
