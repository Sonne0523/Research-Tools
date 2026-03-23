import { useState, type FC } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import FileUpload from './FileUpload';
import ProgressBar from './ProgressBar';
import ChatAssistant from './ChatAssistant';
import { useWebSocketProgress } from '../hooks/useWebSocketProgress';

const AnalysisView: FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);

  const { clientId, progressData, connect, resetProgress } = useWebSocketProgress();


  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setLoading(true);
    resetProgress();
    connect();

    const formData = new FormData();
    formData.append('file', files[0]);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/ai/analyze-paper/${clientId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) throw new Error('API Error');

      const data = await response.json();
      setResult(data.analysis);
    } catch (error) {
      console.error(error);
      alert('Analysis failed.');
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  };

  const downloadAnalysis = async () => {
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
      a.download = 'analysis.pdf';
      a.click();
    } catch (error) {
      alert('PDF Export failed.');
    }
  };

  return (
    <div className={`tool-container split-layout ${showChat ? 'has-chat' : ''}`}>
      <div className="sidebar">
        <div className="sidebar-content" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {!result ? (
            <div>
              <h3 style={{ marginBottom: '1rem' }}>Upload Journal Paper</h3>
              <FileUpload onFileSelect={handleUpload} accept=".pdf" />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '0.75rem' }}>
              <h3 style={{ width: '100%', marginBottom: '0.25rem', textAlign: 'center' }}>Actions</h3>
              {!showChat && (
                <>
                  <button className="btn secondary" style={{ flex: 1, minWidth: '150px' }} onClick={() => { setResult(null); setShowChat(false); }}>
                    🔄 Analyze New
                  </button>
                  <button className="btn primary" style={{ flex: 1, minWidth: '150px' }} onClick={() => setShowChat(true)}>
                    💬 Chat with AI Assistant
                  </button>
                  <button className="btn btn-download" style={{ flex: 1, minWidth: '150px' }} onClick={downloadAnalysis}>
                    📥 Download Analysis
                  </button>
                </>
              )}
            </div>
          )}
        </div>
        {loading && (
          <ProgressBar
            progress={progressData.progress}
            label={progressData.message || "Connecting..."}
          />
        )}
      </div>

      <div className="main-output">
        {result ? (
          <div className={`text-result paper-output ${showChat ? 'with-chat' : ''}`}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
          </div>
        ) : (
          <div className="empty-state">
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🔬</span>
            Upload a research paper to see the detailed AI analysis here.
          </div>
        )}
      </div>

      {showChat && result && (
        <ChatAssistant
          context={result}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
};

export default AnalysisView;
