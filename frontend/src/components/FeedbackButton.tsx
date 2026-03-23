import React, { useState } from 'react';
import { API_BASE_URL } from '../config';

const FeedbackButton: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [email, setEmail] = useState('');
    const [sending, setSending] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

        try {
            console.log("Submitting feedback via Web3Forms...");
            const response = await fetch("https://api.web3forms.com/submit", {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ 
                    access_key: "61403297-5865-463a-930f-e6bd6a49cf3c",
                    name: "Anonymous Scholar",
                    email: email,
                    message: message,
                    subject: "Quick Feedback - Researcher AI",
                    from_name: "Researcher AI System"
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                console.log("Feedback submitted successfully via Web3Forms.");
                setStatus('success');
                setTimeout(() => {
                    setIsOpen(false);
                    setStatus('idle');
                    setMessage('');
                    setEmail('');
                }, 2000);
            } else {
                console.error("Web3Forms submission failed:", result);
                setStatus('error');
            }
        } catch (error) {
            console.error("Web3Forms submission error:", error);
            setStatus('error');
        } finally {
            setSending(false);
        }

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
