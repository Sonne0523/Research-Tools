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
        <div className="feedback-modal-overlay">
            <div className="feedback-modal">
                <div className="feedback-header">
                    <h3>Quick Feedback</h3>
                    <button className="close-btn" onClick={() => setIsOpen(false)}>&times;</button>
                </div>
                {status === 'success' ? (
                    <div className="feedback-success">
                        <p>✅ Sent! Thank you.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="feedback-form">
                        <input 
                            type="email" 
                            placeholder="Your email (optional)"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pro-input"
                        />
                        <textarea 
                            required
                            placeholder="Quick suggestion..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="pro-input"
                            style={{ minHeight: '100px' }}
                        />
                        <button type="submit" disabled={sending} className="btn-submit" style={{ padding: '0.75rem' }}>
                            {sending ? 'Sending...' : 'Submit'}
                        </button>
                        {status === 'error' && <p className="error-text">Failed to send.</p>}
                    </form>
                )}
            </div>
        </div>
    );
};

export default FeedbackButton;
