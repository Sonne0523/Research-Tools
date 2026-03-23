import React, { useState } from 'react';
import { API_BASE_URL } from '../config';

const FeedbackButton: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [email, setEmail] = useState('');
    const [sending, setSending] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_email: email, message: `[Quick] ${message}` })
            });

            if (response.ok) {
                setStatus('success');
                setTimeout(() => {
                    setIsOpen(false);
                    setStatus('idle');
                    setMessage('');
                    setEmail('');
                }, 2000);
            } else {
                setStatus('error');
            }
        } catch (error) {
            setStatus('error');
        } finally {
            setSending(false);
        }
    };

    if (!isOpen) {
        return (
            <button 
                className="feedback-trigger-floating"
                onClick={() => setIsOpen(true)}
                title="Quick Feedback"
            >
                💬
            </button>
        );
    }

    return (
        <div className="feedback-modal-overlay animate-fade-in">
            <div className="feedback-modal pro-card">
                <div className="feedback-header">
                    <h2 style={{ color: 'white', margin: 0 }}>Quick Feedback</h2>
                    <button className="close-btn" onClick={() => setIsOpen(false)}>&times;</button>
                </div>
                {status === 'success' ? (
                    <div className="feedback-success">
                        <p style={{ color: '#10b981', fontWeight: 600 }}>✅ Sent! Thank you.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="pro-form" style={{ marginTop: '1rem' }}>
                        <div className="form-group">
                          <label>Email (Optional)</label>
                          <input 
                              type="email" 
                              placeholder="Your email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="pro-input"
                          />
                        </div>
                        <div className="form-group">
                          <label>Suggestion</label>
                          <textarea 
                              required
                              placeholder="Describe your suggestion..."
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              className="pro-input pro-textarea"
                              style={{ minHeight: '120px' }}
                          />
                        </div>
                        <button type="submit" disabled={sending} className="btn-submit">
                            {sending ? 'Sending...' : 'Submit Feedback'}
                        </button>
                        {status === 'error' && <p className="error-text">Failed to send.</p>}
                    </form>
                )}
            </div>
        </div>
    );
};

export default FeedbackButton;
