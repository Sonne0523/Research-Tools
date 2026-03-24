import { useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './App.css';
import AnalysisView from './components/AnalysisView';
import AskYourPDFView from './components/AskYourPDFView';
import SummaryView from './components/SummaryView';
import ProposalView from './components/ProposalView';
import AuthView from './components/AuthView';
import FeedbackView from './components/FeedbackView';

const tools = [
  { id: 'ask-pdf', title: 'AskYourPDF', desc: 'Interact with research papers using AI-powered chat.', icon: '💬', component: AskYourPDFView },
  { id: 'analysis', title: 'Journal Analysis', desc: 'Deep dive into research papers with AI extraction.', icon: '🧬', component: AnalysisView },
  { id: 'summary', title: 'PDF Summary', desc: 'Get concise summaries of long research documents.', icon: '📝', component: SummaryView },
  { id: 'proposal', title: 'Proposal Guide', desc: 'Step-by-step writing guide for research proposals.', icon: '🎓', component: ProposalView },
  { id: 'feedback', title: 'Feedback', desc: 'Help us improve with your suggestions and bug reports.', icon: '💬', component: FeedbackView },
];

function App() {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState<'login' | 'signup' | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  const handleToolClick = (toolId: string) => {
    if (!currentUser) {
      setShowAuth('login');
      return;
    }
    setActiveTool(toolId);
  };

  const renderTool = () => {
    const tool = tools.find(t => t.id === activeTool);
    if (!tool) return null;
    const Component = tool.component;
    return <Component />;
  };

  const handleAuthSuccess = (user: string, token: string) => {
    setCurrentUser(user);
    localStorage.setItem('token', token);
    localStorage.setItem('user', user);
    setShowAuth(null);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setActiveTool(null);
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setCurrentUser(savedUser);
  }, []);

  const [theme, setTheme] = useState<string>(localStorage.getItem('theme') || 'dark');

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const googleClientId = "539318391775-t10t6t9n99k7h6t4ehmiid9m9u1dhf78.apps.googleusercontent.com";

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <nav className="navbar">
        <div className="nav-content">
          <div className="nav-logo" onClick={() => setActiveTool(null)}>
            RESEARCHER.AI
          </div>
          <div className="nav-links">
            {tools.map(tool => (
              <div
                key={tool.id}
                className={`nav-link ${activeTool === tool.id ? 'active' : ''}`}
                onClick={() => handleToolClick(tool.id)}
              >
                {tool.title}
              </div>
            ))}
          </div>
          <div className="auth-buttons">
            <button className="theme-toggle" onClick={toggleTheme} title="Toggle Dark/Light Mode">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            {currentUser ? (
              <>
                <span style={{ color: '#a855f7', fontWeight: 600, fontSize: '0.9rem' }}>Dr. {currentUser}</span>
                <button className="btn-login" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <button className="btn-login" onClick={() => setShowAuth('login')}>Login</button>
                <button className="btn-signup" onClick={() => setShowAuth('signup')}>Sign Up</button>
              </>
            )}
          </div>
        </div>
      </nav>

      {showAuth && (
        <AuthView
          initialMode={showAuth}
          onClose={() => setShowAuth(null)}
          onSuccess={handleAuthSuccess}
        />
      )}

      <div className="container">
        {!activeTool ? (
          <>
            <header className="header">
              <h1>The Intelligent Researcher</h1>
              <p>Elevate your academic workflow with AI-powered toolsets designed for senior researchers.</p>
            </header>
            <div className="grid">
              {tools.map((tool) => (
                <div
                  key={tool.id}
                  className="card"
                  onClick={() => handleToolClick(tool.id)}
                >
                  <span className="card-icon">{tool.icon}</span>
                  <h3 className="card-title">{tool.title}</h3>
                  <p className="card-desc">{tool.desc}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="tool-view">
            <div className="tool-header">
              <h2 style={{ margin: 0, opacity: 0.9 }}>{tools.find(t => t.id === activeTool)?.title}</h2>
            </div>
            {renderTool()}
          </div>
        )}
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;
