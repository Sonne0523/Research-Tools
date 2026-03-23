import { useState, type FC } from 'react';
import FileUpload from './FileUpload';
import ProgressBar from './ProgressBar';
import { API_BASE_URL } from '../config';

const CompressView: FC = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setLoading(true);
    setProgress(30); // Simulate start
    
    const formData = new FormData();
    formData.append('file', files[0]);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/tools/compress`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });
      
      setProgress(80);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compressed_${files[0].name}`;
      a.click();
      setProgress(100);
    } catch (error) {
       alert('Compression failed.');
    } finally {
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 1000);
    }
  };

  return (
    <div className="tool-container">
      <FileUpload onFileSelect={handleUpload} accept=".pdf" />
      {loading && <ProgressBar progress={progress} label="Optimizing PDF..." />}
    </div>
  );
};

export default CompressView;
