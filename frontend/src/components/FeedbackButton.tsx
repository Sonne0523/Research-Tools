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
                body: JSON.stringify({ user_email: email, message: message })
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
                className="feedback-trigger"
                onClick={() => setIsOpen(true)}
                title="Send Feedback"
            >
                💬
            </button>
        );
    }

    return (
        <div className="feedback-modal-overlay">
            <div className="feedback-modal">
                <div className="feedback-header">
                    <h3>Feedback</h3>
                    <button className="close-btn" onClick={() => setIsOpen(false)}>&times;</button>
                </div>
                {status === 'success' ? (
                    <div className="feedback-success">
                        <p>✅ Thank you! Your feedback has been sent.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="feedback-form">
                        <p>How can we improve RESEARCHER.AI?</p>
                        <input 
                            type="email" 
                            placeholder="Your email (optional)"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <textarea 
                            required
                            placeholder="Tell us what's on your mind..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                        <button type="submit" disabled={sending}>
                            {sending ? 'Sending...' : 'Submit Feedback'}
                        </button>
                        {status === 'error' && <p className="error-text">Failed to send. Please try again.</p>}
                    </form>
                )}
            </div>
        </div>
    );
};

export default FeedbackButton;
