import React, { useState } from 'react';
import { Mail, Send, Eye, Code, Smartphone, Monitor, Info, CheckCircle, RefreshCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import emailjs from '@emailjs/browser';

const EmailComposerView: React.FC = () => {
  const [emailData, setEmailData] = useState({
    recipient: '',
    subject: 'Research Update: AI Breakthroughs',
    fromName: 'Researcher.AI',
    replyTo: 'support@researcher.ai',
    body: `<div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; background-color: #f9fafb; padding: 40px 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e5e7eb;">
    <!-- Header -->
    <div style="background-color: #ffffff; padding: 30px; border-bottom: 1px solid #f3f4f6; text-align: center;">
      <h1 style="color: #7B61FF; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; text-transform: uppercase;">Researcher.AI</h1>
    </div>
    
    <!-- Hero Section -->
    <div style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #f5f3ff 0%, #ffffff 100%);">
      <h2 style="color: #111827; margin: 0 0 16px; font-size: 24px; font-weight: 700;">Research Update: AI Breakthroughs</h2>
      <p style="color: #4b5563; margin: 0; font-size: 16px; line-height: 1.6;">Stay ahead of the curve with our latest insights into AI-augmented academic research.</p>
    </div>

    <!-- Content -->
    <div style="padding: 30px;">
      <div style="background-color: #ffffff; border: 1px solid #7B61FF; border-left: 6px solid #7B61FF; border-radius: 8px; padding: 24px; margin-bottom: 30px;">
        <h3 style="color: #7B61FF; margin: 0 0 8px; font-size: 14px; text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">Key Highlight</h3>
        <p style="color: #1f2937; margin: 0; font-size: 16px; font-weight: 500;">
          Our new analysis engine has achieved a 40% reduction in bibliography processing time for complex medical journals.
        </p>
      </div>

      <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
        As a valued member of the Researcher.AI community, we wanted to ensure you have the first look at these developments. Our goal is to empower researchers like you with the most advanced tools available.
      </p>

      <!-- CTA Button -->
      <div style="text-align: center; margin-top: 32px;">
        <a href="https://researcher-ai-tools.vercel.app/" style="background-color: #7B61FF; color: #ffffff; padding: 16px 32px; border-radius: 8px; font-weight: 600; text-decoration: none; display: inline-block;">Explore the Dashboard</a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #f3f4f6;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0 0 8px;">&copy; 2026 Researcher.AI. All rights reserved.</p>
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">
        You're receiving this because you're part of our research community. 
        <a href="#" style="color: #7B61FF; text-decoration: none;">Unsubscribe</a>
      </p>
    </div>
  </div>
</div>`,
  });

  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!emailData.recipient || !emailData.subject) {
      alert('Please fill in the recipient and subject.');
      return;
    }

    setIsSending(true);

    const templateParams = {
      from_name: emailData.fromName,
      reply_to: emailData.replyTo,
      to_email: emailData.recipient,
      subject: emailData.subject,
      message_html: emailData.body,
    };

    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';

    if (!serviceId || !templateId || !publicKey) {
      alert('EmailJS configuration is missing. Please check your environment variables.');
      setIsSending(false);
      return;
    }

    emailjs.send(serviceId, templateId, templateParams, publicKey)
      .then((response) => {
        console.log('SUCCESS!', response.status, response.text);
        setIsSending(false);
        setSent(true);
        setTimeout(() => setSent(false), 3000);
      }, (err) => {
        console.log('FAILED...', err);
        setIsSending(false);
        alert('Failed to send email. Please check your EmailJS configuration.');
      });
  };

  return (
    <div className="email-composer-view">
      <div className="composer-grid">
        {/* Editor Card */}
        <motion.div 
           className="composer-card glass-card"
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
        >
          <div className="card-header-inner">
            <Mail size={18} className="text-purple-400" />
            <span>Composer</span>
          </div>
          
          <div className="form-row">
            <div className="form-group-inner">
              <label>From Name</label>
              <input 
                type="text" 
                value={emailData.fromName}
                onChange={(e) => setEmailData({...emailData, fromName: e.target.value})}
              />
            </div>
            <div className="form-group-inner">
              <label>Reply To</label>
              <input 
                type="email" 
                value={emailData.replyTo}
                onChange={(e) => setEmailData({...emailData, replyTo: e.target.value})}
              />
            </div>
          </div>

          <div className="form-group-inner">
            <label>Recipient Email</label>
            <input 
              type="email" 
              placeholder="researcher@example.com" 
              value={emailData.recipient}
              onChange={(e) => setEmailData({...emailData, recipient: e.target.value})}
            />
          </div>

          <div className="form-group-inner">
            <label>Subject Line</label>
            <input 
              type="text" 
              placeholder="Enter subject..." 
              value={emailData.subject}
              onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
            />
          </div>

          <div className="form-group-inner flex-grow">
            <div className="label-row-inner">
              <label>HTML Content</label>
              <div className="format-hints-inner">
                <Code size={14} />
                <span>Supports HTML & inline CSS</span>
              </div>
            </div>
            <textarea 
              className="code-editor-inner"
              value={emailData.body}
              onChange={(e) => setEmailData({...emailData, body: e.target.value})}
            />
          </div>

          <button 
            className={`dispatch-btn ${isSending ? 'loading' : ''} ${sent ? 'sent' : ''}`}
            onClick={handleSend}
            disabled={isSending || sent}
          >
            {isSending ? <RefreshCcw className="spinning" size={18} /> : sent ? <CheckCircle size={18} /> : <Send size={18} />}
            <span>{isSending ? 'Sending...' : sent ? 'Sent Successfully!' : 'Dispatch Email'}</span>
          </button>
        </motion.div>

        {/* Preview Card */}
        <motion.div 
          className="preview-card-outer glass-card"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="card-header-inner">
            <div className="header-left-inner">
              <Eye size={18} className="text-purple-400" />
              <span>Live Preview</span>
            </div>
            <div className="device-toggle-inner">
              <button 
                className={device === 'desktop' ? 'active' : ''} 
                onClick={() => setDevice('desktop')}
                title="Desktop View"
              >
                <Monitor size={15} />
              </button>
              <button 
                className={device === 'mobile' ? 'active' : ''} 
                onClick={() => setDevice('mobile')}
                title="Mobile View"
              >
                <Smartphone size={15} />
              </button>
            </div>
          </div>

          <div className={`preview-container-inner ${device}`}>
            <div className="preview-chrome-inner">
              <div className="chrome-dots-inner">
                <span></span><span></span><span></span>
              </div>
              <div className="chrome-title-inner">{emailData.subject || 'New Message'}</div>
            </div>
            <div className="preview-frame-inner">
              <div 
                className="preview-content-inner"
                dangerouslySetInnerHTML={{ __html: emailData.body }}
              />
            </div>
          </div>

          <div className="preview-info-inner">
            <Info size={14} className="text-purple-400" />
            <span>This is how your mail will appear to the recipient.</span>
          </div>
        </motion.div>
      </div>

      <style>{`
        .email-composer-view {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          height: calc(100vh - 180px);
          animation: fadeIn 0.4s ease-out;
        }

        .composer-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          height: 100%;
          min-height: 0;
        }

        .glass-card {
          background: var(--card-bg);
          backdrop-filter: blur(20px);
          border: 1px solid var(--card-border);
          border-radius: 1.5rem;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .card-header-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.25rem;
          font-weight: 600;
          color: var(--text-main);
          font-size: 0.95rem;
          flex-shrink: 0;
        }

        .header-left-inner {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
          flex-shrink: 0;
        }

        .form-group-inner {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .form-group-inner.flex-grow {
          flex: 1;
          min-height: 0;
          margin-bottom: 0;
        }

        .label-row-inner {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .format-hints-inner {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        label {
          font-size: 0.8rem;
          color: var(--text-muted);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        input, textarea {
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid var(--glass-border);
          border-radius: 0.75rem;
          padding: 0.75rem 1rem;
          color: white;
          font-family: inherit;
          font-size: 0.9rem;
          transition: all 0.2s;
        }

        input:focus, textarea:focus {
          outline: none;
          border-color: var(--primary);
          background: rgba(255, 255, 255, 0.05);
        }

        .code-editor-inner {
          flex: 1;
          font-family: 'Fira Code', 'Courier New', monospace;
          font-size: 0.85rem;
          line-height: 1.5;
          resize: none;
          min-height: 200px;
        }

        .dispatch-btn {
          margin-top: 1.5rem;
          background: linear-gradient(135deg, var(--primary), var(--accent));
          border: none;
          padding: 0.85rem;
          border-radius: 0.75rem;
          color: white;
          font-weight: 700;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          cursor: pointer;
          transition: all 0.3s;
          flex-shrink: 0;
        }

        .dispatch-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(99, 102, 241, 0.3);
          filter: brightness(1.1);
        }

        .dispatch-btn.sent {
          background: #10b981;
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .device-toggle-inner {
          display: flex;
          background: rgba(0, 0, 0, 0.3);
          padding: 3px;
          border-radius: 8px;
        }

        .device-toggle-inner button {
          background: transparent;
          border: none;
          color: var(--text-muted);
          padding: 5px 8px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
        }

        .device-toggle-inner button.active {
          background: rgba(255, 255, 255, 0.1);
          color: var(--accent);
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }

        .preview-container-inner {
          flex: 1;
          background: white;
          border-radius: 1rem;
          overflow: hidden;
          margin: 0 auto;
          width: 100%;
          transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .preview-container-inner.mobile {
          max-width: 375px;
        }

        .preview-chrome-inner {
          background: #f1f5f9;
          padding: 8px 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid #e2e8f0;
          flex-shrink: 0;
        }

        .chrome-dots-inner {
          display: flex;
          gap: 5px;
        }

        .chrome-dots-inner span {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #cbd5e1;
        }

        .chrome-title-inner {
          font-size: 0.7rem;
          color: #64748b;
          flex: 1;
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .preview-frame-inner {
          flex: 1;
          overflow-y: auto;
          background: #fdfdfd;
        }

        .preview-content-inner {
          color: #1e293b;
        }

        .preview-info-inner {
          margin-top: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-muted);
          font-size: 0.75rem;
          flex-shrink: 0;
        }

        @media (max-width: 1024px) {
          .composer-grid {
            grid-template-columns: 1fr;
            height: auto;
            overflow-y: visible;
          }
          .email-composer-view {
            height: auto;
          }
          .preview-card-outer {
            height: 600px;
          }
        }
      `}</style>
    </div>
  );
};

export default EmailComposerView;
