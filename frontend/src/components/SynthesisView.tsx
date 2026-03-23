import { useState, type FC } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ProgressBar from './ProgressBar';
import ChatAssistant from './ChatAssistant';
import { useWebSocketProgress } from '../hooks/useWebSocketProgress';

const SynthesisView: FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showChat, setShowChat] = useState(false);

  const { clientId, progressData, connect, resetProgress } = useWebSocketProgress();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleSynthesize = async () => {
    if (selectedFiles.length < 2) {
      alert('Please select at least 2 PDF files to synthesize.');
      return;
    }

    setLoading(true);
    resetProgress();
    connect();

    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('files', file);
    });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/tools/ai/synthesize/${clientId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) throw new Error('API Error');

      const data = await response.json();
      setResult(data.synthesis);
    } catch (error) {
      console.error(error);
      alert('Synthesis failed.');
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  };

  const downloadSynthesis = async () => {
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
      a.download = 'multi-paper-synthesis.pdf';
      a.click();
    } catch (error) {
      alert('PDF generation failed.');
    }
  };

  return (
    <div className="tool-container split-layout">
      <div className="sidebar">
        {!result ? (
          <div className="sidebar-content">
            <h3 style={{ marginBottom: '1rem' }}>Multi-Paper Synthesis</h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.5rem' }}>
              Upload up to 5 research papers to generate a comparative matrix and meta-synthesis.
            </p>

            <div className="upload-area" style={{ borderStyle: 'dashed', borderWidth: 2, padding: '2rem', textAlign: 'center', borderRadius: '1rem', borderColor: 'rgba(255,255,255,0.1)' }}>
              <input
                type="file"
                multiple
                accept=".pdf"
                id="multi-upload"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <label htmlFor="multi-upload" style={{ cursor: 'pointer' }}>
                <span style={{ fontSize: '2.5rem', display: 'block' }}>📚</span>
                <span className="btn secondary" style={{ marginTop: '1rem' }}>Select PDFs</span>
              </label>
            </div>

            {selectedFiles.length > 0 && (
              <div style={{ marginTop: '1.5rem' }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Selected ({selectedFiles.length}):</h4>
                <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
                  {selectedFiles.map((f, i) => <li key={i} style={{ marginBottom: '0.4rem' }}>• {f.name}</li>)}
                </ul>
                <button className="btn primary" style={{ width: '100%', marginTop: '1rem' }} onClick={handleSynthesize}>Synthesize Papers</button>
              </div>
            )}
          </div>
        ) : (
          <div className="sidebar-content" style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '0.75rem' }}>
            <h3 style={{ width: '100%', marginBottom: '0.25rem', textAlign: 'center' }}>Actions</h3>
            <button className="btn secondary" style={{ flex: 1, minWidth: '120px' }} onClick={() => { setResult(null); setSelectedFiles([]); setShowChat(false); }}>New Synthesis</button>
            <button className="btn primary" style={{ flex: 1, minWidth: '120px' }} onClick={() => setShowChat(true)}>Chat with AI</button>
            <button className="btn btn-download" style={{ flex: 1, minWidth: '120px' }} onClick={downloadSynthesis}>Download PDF</button>
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
          <div className={`text-result paper-output ${showChat ? 'with-chat' : ''}`}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
          </div>
        ) : (
          <div className="empty-state">
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🔬</span>
            Select multiple PDFs to generate a comparative research matrix.
          </div>
        )}
      </div>

      {showChat && result && (
        <ChatAssistant context={result} onClose={() => setShowChat(false)} />
      )}
    </div>
  );
};

export default SynthesisView;
