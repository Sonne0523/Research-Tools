import { useState, type FC } from 'react';
import FileUpload from './FileUpload';
import ProgressBar from './ProgressBar';

const PhotoToPDFView: FC = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setLoading(true);
    setProgress(20);
    
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      setProgress(60);
      const response = await fetch('http://localhost:8000/api/tools/image-to-pdf', {
        method: 'POST',
        body: formData,
      });
      
      setProgress(90);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'batch_images.pdf';
      a.click();
      setProgress(100);
    } catch (error) {
      console.error('Conversion failed:', error);
    } finally {
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 500);
    }
  };

  return (
    <div className="tool-container">
      <FileUpload onFileSelect={handleUpload} multiple accept="image/*" />
      {loading && <ProgressBar progress={progress} label="Merging images into PDF..." />}
    </div>
  );
};

export default PhotoToPDFView;
