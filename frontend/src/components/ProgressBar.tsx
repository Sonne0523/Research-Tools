import { type FC } from 'react';

interface ProgressBarProps {
  progress: number;
  label?: string;
  page?: number;
  totalPages?: number;
}

const ProgressBar: FC<ProgressBarProps> = ({ progress, label, page, totalPages }) => {
  return (
    <div className="progress-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <div className="progress-label">{label || 'Processing...'}</div>
        {page !== undefined && totalPages !== undefined && (
          <div className="progress-details" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Page {page} of {totalPages}
          </div>
        )}
      </div>
      <div className="progress-track">
        <div 
          className="progress-fill" 
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        ></div>
      </div>
      <div className="progress-percentage">{Math.round(progress)}%</div>
    </div>
  );
};

export default ProgressBar;
