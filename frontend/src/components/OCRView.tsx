import { useState, type FC } from 'react';
import FileUpload from './FileUpload';
import ProgressBar from './ProgressBar';
import { useWebSocketProgress } from '../hooks/useWebSocketProgress';
import { API_BASE_URL } from '../config';

interface BatchItem {
  id: string;
  name: string;
  status: 'pending' | 'loading' | 'done' | 'error';
  text?: string;
  blob?: Blob;
  currentPage?: number;
  totalPages?: number;
}

const OCRView: FC = () => {
  const [batch, setBatch] = useState<BatchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalProgress, setTotalProgress] = useState(0);
  const [useAdvanced, setUseAdvanced] = useState(false);
  const [useLatex, setUseLatex] = useState(false);
  const [useSearchable, setUseSearchable] = useState(false);
  
  const { clientId, progressData, connect, resetProgress } = useWebSocketProgress();

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const newItems: BatchItem[] = Array.from(files).map((f, i) => ({
      id: `${Date.now()}-${i}`,
      name: f.name,
      status: 'pending'
    }));
    
    setBatch((prev: BatchItem[]) => [...prev, ...newItems]);
    setLoading(true);
    resetProgress();
    connect();

    let completed = 0;
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const itemId = newItems[i].id;
        
        setBatch((prev: BatchItem[]) => prev.map((item: BatchItem) => 
          item.id === itemId ? { ...item, status: 'loading' } : item
        ));

        const formData = new FormData();
        formData.append('file', file);
        formData.append('advanced', useAdvanced.toString());
        formData.append('latex', useLatex.toString());
        formData.append('searchable', useSearchable.toString());

        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${API_BASE_URL}/api/tools/ocr-progress/${clientId}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData,
          });

          if (useSearchable) {
            const blob = await response.blob();
            setBatch((prev: BatchItem[]) => prev.map((item: BatchItem) => 
              item.id === itemId ? { ...item, status: 'done', blob: blob } : item
            ));
          } else {
            const data = await response.json();
            setBatch((prev: BatchItem[]) => prev.map((item: BatchItem) => 
              item.id === itemId ? { ...item, status: 'done', text: data.text } : item
            ));
          }
        } catch (error) {
          setBatch((prev: BatchItem[]) => prev.map((item: BatchItem) => 
            item.id === itemId ? { ...item, status: 'error' } : item
          ));
        }
        
        completed++;
        setTotalProgress((completed / files.length) * 100);
    }
    setLoading(false);
  };

  const downloadResult = async (item: BatchItem) => {
    if (item.blob) {
      const url = URL.createObjectURL(item.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `searchable_${item.name}`;
      a.click();
    } else if (item.text) {
      // Use the dedicated export-pdf endpoint for structured text
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/tools/export-pdf`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ text: item.text }),
        });

        if (!response.ok) throw new Error('Export failed');
        
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${item.name.split('.')[0]}_ocr.pdf`;
        a.click();
      } catch (error) {
        console.error('Error exporting PDF:', error);
        // Fallback to TXT
        const blob = new Blob([item.text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${item.name.split('.')[0]}_ocr.txt`;
        a.click();
      }
    }
  };

  return (
    <div className="tool-container">
      <div className="options-bar" style={{ marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', padding: '1rem', background: 'var(--glass-bg)', borderRadius: '1rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={useAdvanced} onChange={e => { setUseAdvanced(e.target.checked); if(e.target.checked) setUseSearchable(false); }} />
          <span>AI Correction</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={useLatex} onChange={e => { setUseLatex(e.target.checked); if(e.target.checked) setUseSearchable(false); }} />
          <span>LaTeX Formulas</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={useSearchable} onChange={e => { setUseSearchable(e.target.checked); if(e.target.checked) { setUseAdvanced(false); setUseLatex(false); } }} />
          <span>Searchable PDF</span>
        </label>
      </div>

      <FileUpload onFileSelect={handleUpload} accept=".pdf" multiple />
      
      {loading && (
        <ProgressBar 
          progress={totalProgress} 
          label={progressData.message || "Processing Documents..."}
          page={progressData.page}
          totalPages={progressData.total}
        />
      )}

      <div className="batch-list">
        {batch.map((item: BatchItem) => (
          <div key={item.id} className="batch-item">
            <div style={{ flex: 1 }}>
              <strong style={{ display: 'block' }}>{item.name}</strong>
              <span className={`status-tag status-${item.status}`}>
                {item.status.toUpperCase()}
              </span>
            </div>
            {item.status === 'done' && (
              <button 
                className="btn btn-download" 
                style={{ marginTop: 0, padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                onClick={() => downloadResult(item)}
              >
                Download PDF
              </button>
            )}
          </div>
        ))}
      </div>

      {batch.some((i: BatchItem) => i.status === 'done' && !loading) && (
        <button 
          className="btn secondary" 
          style={{ marginTop: '2rem', width: '100%' }}
          onClick={() => { setBatch([]); setTotalProgress(0); }}
        >
          Clear All
        </button>
      )}
    </div>
  );
};

export default OCRView;
