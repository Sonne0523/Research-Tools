import React, { useState } from 'react';

const FeedbackView: React.FC = () => {
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('Suggestion');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          access_key: "61403297-5865-463a-930f-e6bd6a49cf3c",
          name: "Researcher AI User",
          email: email, 
          message: message,
          subject: `[${category}] Researcher AI Feedback`,
          from_name: "Researcher AI PRO Portal"
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setStatus('success');
        setMessage('');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    } finally {
      setSending(false);
    }
  };

  if (status === 'success') {
    return (
      <div className="feedback-container animate-fade-in">
        <div className="pro-card success-card">
          <div className="success-icon">✨</div>
          <h2>Thank You!</h2>
          <p>Your feedback helps us build the future of academic research. Our team has been notified.</p>
          <button className="btn-primary" onClick={() => setStatus('idle')}>Send More Feedback</button>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback-container animate-fade-in">
      <div className="pro-card">
        <div className="card-header">
          <h1>Share Your Thoughts</h1>
          <p>Help us refine RESEARCHER.AI for the global scientific community.</p>
        </div>

        <form onSubmit={handleSubmit} className="pro-form">
          <div className="form-row">
            <div className="form-group flex-1">
              <label>Category</label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                className="pro-input"
              >
                <option>Suggestion</option>
                <option>Bug Report</option>
                <option>Feature Request</option>
                <option>Other</option>
              </select>
            </div>
            <div className="form-group flex-2">
              <label>Email (Optional)</label>
              <input 
                type="email" 
                placeholder="dr.scholar@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pro-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Message</label>
            <textarea 
              required
              placeholder="Tell us about your experience or suggest a new feature..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="pro-input pro-textarea"
            />
          </div>

          <button type="submit" className="btn-submit" disabled={sending}>
            {sending ? (
              <span className="loader-text">Sending Submission...</span>
            ) : (
              'Submit Feedback'
            )}
          </button>
          
          {status === 'error' && (
            <p className="error-msg">⚠️ Failed to connect to server. Please try again later.</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default FeedbackView;
