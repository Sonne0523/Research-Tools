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
            console.log(`Submitting feedback to: ${API_BASE_URL}/api/feedback`);
            const response = await fetch(`${API_BASE_URL}/api/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_email: email, message: `[Quick] ${message}` })
            });

            if (response.ok) {
                console.log("Feedback submitted successfully.");
                setStatus('success');
                setTimeout(() => {
                    setIsOpen(false);
                    setStatus('idle');
                    setMessage('');
                    setEmail('');
                }, 2000);
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error("Feedback submission failed:", response.status, errorData);
                setStatus('error');
            }
        } catch (error) {
            console.error("Feedback submission error:", error);
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
        <div className="auth-overlay animate-fade-in" onClick={(e) => e.target === e.currentTarget && setIsOpen(false)}>
            <div className="auth-card animate-scale-in">
                <button className="auth-close" onClick={() => setIsOpen(false)}>&times;</button>
                
                <div className="auth-header">
                    <h2>Quick Feedback</h2>
                    <p>Help us improve your research experience</p>
                </div>

                {status === 'success' ? (
                    <div className="feedback-success" style={{ textAlign: 'center', padding: '2rem 0' }}>
                        <p style={{ color: '#10b981', fontWeight: 600, fontSize: '1.1rem' }}>✅ Sent! Thank you.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                          <label>Work Email (Optional)</label>
                          <input 
                              type="email" 
                              placeholder="dr.scholar@university.edu"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label>Suggestion / Bug Report</label>
                          <textarea 
                              required
                              placeholder="Tell us what's on your mind..."
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              className="pro-input pro-textarea"
                              style={{ 
                                minHeight: '120px', 
                                width: '100%', 
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                padding: '0.75rem 1rem',
                                borderRadius: '0.75rem',
                                color: 'white',
                                fontFamily: 'inherit',
                                resize: 'none'
                              }}
                          />
                        </div>
                        <button type="submit" disabled={sending} className="btn-auth-submit">
                            {sending ? 'Sending Submission...' : 'Send Feedback'}
                        </button>
                        {status === 'error' && <p className="error-text" style={{ color: '#ef4444', marginTop: '0.5rem', textAlign: 'center' }}>Failed to send. Please try again.</p>}
                    </form>
                )}
            </div>
        </div>
    );
};

export default FeedbackButton;
