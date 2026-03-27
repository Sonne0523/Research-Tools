import React, { useState, useEffect } from 'react';
import { Mail, Send, Eye, Code, Smartphone, Monitor, Info, CheckCircle, RefreshCcw, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import emailjs from '@emailjs/browser';

const App = () => {
  const [emailData, setEmailData] = useState({
    recipient: '',
    subject: '',
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

  const [isPreview, setIsPreview] = useState(false);
  const [device, setDevice] = useState('desktop');
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

    // Use environment variables for security
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'YOUR_SERVICE_ID';
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'YOUR_TEMPLATE_ID';
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'YOUR_PUBLIC_KEY';

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
    <div className="app-container">
      <nav className="navbar">
        <div className="logo">
          <Sparkles className="logo-icon" />
          <span>Researcher.AI</span>
        </div>
        <div className="nav-links">
          <span>Docs</span>
          <span>Support</span>
          <button className="upgrade-btn">Upgrade</button>
        </div>
      </nav>

      <main className="content">
        <header className="header">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Custom Mail Composer
          </motion.h1>
          <p>Design premium emails for your research community.</p>
        </header>

        <div className="editor-grid">
          {/* Form Side */}
          <motion.div 
             className="glass-card editor-card"
             initial={{ opacity: 0, x: -50 }}
             animate={{ opacity: 1, x: 0 }}
          >
            <div className="card-header">
              <Mail size={20} />
              <span>Composer</span>
            </div>
            
            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>From Name</label>
                <input 
                  type="text" 
                  value={emailData.fromName}
                  onChange={(e) => setEmailData({...emailData, fromName: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Reply To</label>
                <input 
                  type="email" 
                  value={emailData.replyTo}
                  onChange={(e) => setEmailData({...emailData, replyTo: e.target.value})}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Recipient Email</label>
              <input 
                type="email" 
                placeholder="researcher@example.com" 
                value={emailData.recipient}
                onChange={(e) => setEmailData({...emailData, recipient: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Subject Line</label>
              <input 
                type="text" 
                placeholder="Enter subject..." 
                value={emailData.subject}
                onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
              />
            </div>

            <div className="form-group flex-1">
              <div className="label-row">
                <label>HTML Content</label>
                <div className="format-hints">
                  <Code size={14} />
                  <span>Supports HTML & inline CSS</span>
                </div>
              </div>
              <textarea 
                className="code-editor"
                value={emailData.body}
                onChange={(e) => setEmailData({...emailData, body: e.target.value})}
              />
            </div>

            <button 
              className={`send-btn ${isSending ? 'loading' : ''} ${sent ? 'sent' : ''}`}
              onClick={handleSend}
              disabled={isSending || sent}
            >
              {isSending ? <RefreshCcw className="spinning" /> : sent ? <CheckCircle /> : <Send size={18} />}
              <span>{isSending ? 'Sending...' : sent ? 'Sent!' : 'Dispatch Email'}</span>
            </button>
          </motion.div>

          {/* Preview Side */}
          <motion.div 
            className="glass-card preview-card"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="card-header">
              <div className="header-left">
                <Eye size={20} />
                <span>Live Preview</span>
              </div>
              <div className="device-toggle">
                <button 
                  className={device === 'desktop' ? 'active' : ''} 
                  onClick={() => setDevice('desktop')}
                >
                  <Monitor size={16} />
                </button>
                <button 
                  className={device === 'mobile' ? 'active' : ''} 
                  onClick={() => setDevice('mobile')}
                >
                  <Smartphone size={16} />
                </button>
              </div>
            </div>

            <div className={`preview-container ${device}`}>
              <div className="preview-chrome">
                <div className="chrome-dots">
                  <span></span><span></span><span></span>
                </div>
                <div className="chrome-title">{emailData.subject || 'New Message'}</div>
              </div>
              <div className="preview-frame">
                <div 
                  className="preview-content"
                  dangerouslySetInnerHTML={{ __html: emailData.body }}
                />
              </div>
            </div>

            <div className="preview-info">
              <Info size={14} />
              <span>This is how your mail will appear to the recipient.</span>
            </div>
          </motion.div>
        </div>
      </main>

      <div className="bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>
    </div>
  );
};

export default App;
