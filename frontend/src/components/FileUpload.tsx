import { type FC } from 'react';

interface FileUploadProps {
  onFileSelect: (files: FileList | null) => void;
  accept?: string;
  multiple?: boolean;
}

const FileUpload: FC<FileUploadProps> = ({ onFileSelect, accept, multiple }) => {
  return (
    <div 
      className="upload-area"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        onFileSelect(e.dataTransfer.files);
      }}
    >
      <input 
        type="file" 
        id="fileInput" 
        style={{ display: 'none' }} 
        onChange={(e) => onFileSelect(e.target.files)}
        accept={accept}
        multiple={multiple}
      />
      <label htmlFor="fileInput" className="upload-label">
        <span style={{ fontSize: '3rem' }}>📁</span>
        <p>Drag & drop files here or <strong>click to browse</strong></p>
        <p style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '0.5rem' }}>
          {accept ? `Supports: ${accept}` : 'All file types supported'}
        </p>
      </label>
    </div>
  );
};

export default FileUpload;
