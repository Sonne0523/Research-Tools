import { useState, type FC } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import FileUpload from './FileUpload';
import ProgressBar from './ProgressBar';
import ChatAssistant from './ChatAssistant';
import { useWebSocketProgress } from '../hooks/useWebSocketProgress';
import { API_BASE_URL } from '../config';

const SummaryView: FC = () => {
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
      const response = await fetch(`${API_BASE_URL}/api/ai/summarize/${clientId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });
      
      if (!response.ok) throw new Error('API Error');
      
      const data = await response.json();
      setResult(data.summary);
    } catch (error) {
      console.error(error);
      alert('Summarization failed.');
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  };

  const downloadSummary = async () => {
    if (!result) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/tools/export-pdf`, {
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
      a.download = 'summary.pdf';
      a.click();
    } catch (error) {
      alert('PDF generation failed.');
    }
  };

  return (
    <div className="tool-container">
      {/* Top Bar - Buttons */}
      {result && !showChat && (
        <div className="top-bar">
          <button className="btn secondary" onClick={() => { setResult(null); setShowChat(false); }}>
            🔄 Summarize New
          </button>
          <button className="btn primary" onClick={() => setShowChat(true)}>
            💬 Chat with AI
          </button>
          <button className="btn btn-download" onClick={downloadSummary}>
            📥 Download Summary
          </button>
        </div>
      )}

      {/* Progress Bar */}
      {loading && (
        <ProgressBar 
          progress={progressData.progress} 
          label={progressData.message || "Connecting..."} 
        />
      )}

      {/* Two Column Layout */}
      <div className="two-column-layout">
        <div className="preview-column">
          {!result ? (
            <div>
              <h3 style={{ marginBottom: '2rem' }}>Upload Paper</h3>
              <FileUpload onFileSelect={handleUpload} accept=".pdf" />
            </div>
          ) : (
            <div className="text-result paper-output">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
            </div>
          )}
        </div>
        <div className="chat-column">
          {showChat && result ? (
            <ChatAssistant
              context={result}
              onClose={() => setShowChat(false)}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default SummaryView;
