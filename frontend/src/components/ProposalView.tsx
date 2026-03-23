import { useState, type FC } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ProgressBar from './ProgressBar';
import { useWebSocketProgress } from '../hooks/useWebSocketProgress';

const ProposalView: FC = () => {
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState('');
  const [result, setResult] = useState<string | null>(null);

  const { clientId, progressData, connect, resetProgress } = useWebSocketProgress();

  const handleGenerate = async () => {
    if (!topic) return;
    setLoading(true);
    resetProgress();
    connect();

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/ai/proposal-guide/${clientId}?topic=${encodeURIComponent(topic)}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) throw new Error('API Error');

      const data = await response.json();
      setResult(data.guide);
    } catch (error) {
      console.error(error);
      alert('Failed to generate guide.');
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  };

  const downloadGuide = async () => {
    if (!result) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/tools/export-pdf', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: result }),
      });
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${topic.replace(/\s+/g, '_')}_guide.pdf`;
      a.click();
    } catch (error) {
      alert('PDF Export failed.');
    }
  };

  return (
    <div className="tool-container split-layout">
      <div className="sidebar">
        {!result ? (
          <div className="sidebar-content">
            <h3 style={{ marginBottom: '1rem' }}>Research Topic</h3>
            <input
              type="text"
              className="card"
              style={{ width: '100%', marginBottom: '1rem', padding: '1rem', background: 'var(--glass-bg)', color: 'white' }}
              placeholder="e.g. AI ethics in medicine"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
            <button className="btn" style={{ width: '100%' }} onClick={handleGenerate}>Generate Guide</button>
          </div>
        ) : (
          <div className="sidebar-content" style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '0.75rem' }}>
            <h3 style={{ width: '100%', marginBottom: '0.25rem', textAlign: 'center' }}>Actions</h3>
            <button className="btn secondary" style={{ flex: 1, minWidth: '120px' }} onClick={() => setResult(null)}>New Topic</button>
            <button className="btn btn-download" style={{ flex: 1, minWidth: '120px' }} onClick={downloadGuide}>Download Guide</button>
          </div>
        )}
        {loading && (
          <ProgressBar
            progress={progressData.progress}
            label={progressData.message || "Connecting..."}
          />
        )}
      </div>

      <div className="main-output">
        {result ? (
          <div className="text-result paper-output">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
          </div>
        ) : (
          <div className="empty-state">
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>✍️</span>
            Enter a topic on the left to generate your custom writing guide.
          </div>
        )}
      </div>
    </div>
  );
};

export default ProposalView;
