import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Upload, Send, FileText, Loader2, User, Bot, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://researcher-tools-backend.onrender.com';
const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'wss://researcher-tools-backend.onrender.com';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AskYourPDFView: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [paperContent, setPaperContent] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [clientId] = useState(() => `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    await processFile(selectedFile);
  };

  const processFile = async (selectedFile: File) => {
    setIsLoading(true);
    setProgress(0);
    setPaperContent('');
    setMessages([]);

    const ws = new WebSocket(`${WS_BASE_URL}/ws/progress/${clientId}`);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setProgress(data.progress);
      setStatus(data.message);
    };

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/tools/extract-text-progress/${clientId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to process PDF');
      const data = await response.json();
      setPaperContent(data.text);
      setMessages([{
        role: 'assistant',
        content: `I've finished reading **${selectedFile.name}**. I'm ready to help you analyze it. What would you like to know?`
      }]);
    } catch (error) {
      console.error(error);
      setMessages([{ role: 'assistant', content: 'Sorry, I encountered an error while reading the PDF. Please try again.' }]);
    } finally {
      setIsLoading(false);
      ws.close();
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || !paperContent || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('query', userMessage);
      formData.append('paper_content', paperContent);

      const response = await fetch(`${API_BASE_URL}/api/tools/ai/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to get answer');
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I could not process that request.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPaperContent('');
    setMessages([]);
    setInput('');
    setProgress(0);
    setStatus('');
  };

  return (
    <div className="ask-pdf-container">
      {!paperContent && !isLoading ? (
        <div className="upload-section animate-in">
          <div className="upload-card">
            <div className="upload-icon-wrapper">
              <Upload className="w-12 h-12 text-purple-400" />
            </div>
            <h2>Ask Your PDF</h2>
            <p>Upload a research paper to start an AI-powered conversation about its contents.</p>
            
            <label className="dropzone">
              <input type="file" accept=".pdf" onChange={handleFileUpload} hidden />
              <FileText className="w-8 h-8 mb-2 opacity-50" />
              <span>Click to select or drag & drop PDF</span>
              <span className="text-xs opacity-40 mt-1">Maximum file size: 20MB</span>
            </label>
          </div>
        </div>
      ) : (
        <div className="chat-interface animate-in">
          <header className="chat-header">
            <div className="file-info">
              <div className="file-icon">
                <FileText className="w-5 h-5 text-purple-400" />
              </div>
              <div className="file-details">
                <span className="filename">{file?.name}</span>
                <span className="status-text">{isLoading ? status : 'Paper Indexing Complete'}</span>
              </div>
            </div>
            <button className="reset-btn" onClick={reset} title="Upload new paper">
              <Trash2 className="w-5 h-5" />
            </button>
          </header>

          <div className="messages-area">
            {isLoading && !paperContent && (
              <div className="loading-state">
                <Loader2 className="w-10 h-10 animate-spin text-purple-500 mb-4" />
                <div className="progress-container">
                  <div className="progress-bar" style={{ width: `${progress}%` }} />
                </div>
                <p>{status}</p>
              </div>
            )}
            
            {messages.map((msg, idx) => (
              <div key={idx} className={`message-wrapper ${msg.role}`}>
                <div className="message-icon">
                  {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                </div>
                <div className="message-bubble">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
            {isLoading && paperContent && (
              <div className="message-wrapper assistant">
                <div className="message-icon"><Bot size={18} /></div>
                <div className="message-bubble typing">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form className="input-area" onSubmit={handleSend}>
            <input
              type="text"
              placeholder="Ask anything about the paper..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading || !paperContent}
            />
            <button type="submit" disabled={isLoading || !input.trim() || !paperContent} className="send-btn">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </form>
        </div>
      )}

      <style>{`
        .ask-pdf-container {
          height: calc(100vh - 180px);
          display: flex;
          flex-direction: column;
          color: white;
          max-width: 1000px;
          margin: 0 auto;
          width: 100%;
        }

        .animate-in {
          animation: fadeIn 0.4s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Upload Section */
        .upload-section {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .upload-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 3rem;
          text-align: center;
          width: 100%;
          max-width: 500px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.3);
        }

        .upload-icon-wrapper {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(99, 102, 241, 0.2));
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
        }

        .upload-card h2 {
          font-size: 2rem;
          margin-bottom: 0.5rem;
          font-weight: 700;
          background: linear-gradient(to right, #a855f7, #6366f1);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .upload-card p {
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 2rem;
        }

        .dropzone {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 3rem 2rem;
          border: 2px dashed rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.02);
        }

        .dropzone:hover {
          border-color: #a855f7;
          background: rgba(168, 85, 247, 0.05);
          transform: scale(1.02);
        }

        /* Chat Interface */
        .chat-interface {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: rgba(15, 15, 20, 0.6);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }

        .chat-header {
          padding: 1rem 1.5rem;
          background: rgba(255, 255, 255, 0.03);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .file-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .file-icon {
          width: 36px;
          height: 36px;
          background: rgba(168, 85, 247, 0.1);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .file-details {
          display: flex;
          flex-direction: column;
        }

        .filename {
          font-weight: 600;
          font-size: 0.95rem;
          max-width: 250px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .status-text {
          font-size: 0.75rem;
          color: rgba(168, 85, 247, 0.8);
        }

        .reset-btn {
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.3);
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .reset-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .messages-area {
          flex: 1;
          overflow-y: auto;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .loading-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
        }

        .progress-container {
          width: 200px;
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-bar {
          height: 100%;
          background: linear-gradient(to right, #a855f7, #6366f1);
          transition: width 0.3s ease;
        }

        .message-wrapper {
          display: flex;
          gap: 1rem;
          max-width: 85%;
          animation: messageIn 0.3s ease-out;
        }

        @keyframes messageIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .message-wrapper.user {
          align-self: flex-end;
          flex-direction: row-reverse;
          animation: messageInRight 0.3s ease-out;
        }

        @keyframes messageInRight {
          from { opacity: 0; transform: translateX(10px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .message-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 4px;
        }

        .user .message-icon { background: #6366f1; }
        .assistant .message-icon { background: rgba(168, 85, 247, 0.2); border: 1px solid rgba(168, 85, 247, 0.3); }

        .message-bubble {
          padding: 0.8rem 1.2rem;
          border-radius: 18px;
          line-height: 1.6;
          font-size: 0.95rem;
        }

        .user .message-bubble {
          background: #6366f1;
          border-bottom-right-radius: 4px;
        }

        .assistant .message-bubble {
          background: rgba(255, 255, 255, 0.05);
          border-bottom-left-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .typing {
          display: flex;
          gap: 4px;
          padding: 12px 16px;
        }

        .dot {
          width: 6px;
          height: 6px;
          background: rgba(255, 255, 255, 0.4);
          border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out;
        }

        .dot:nth-child(1) { animation-delay: -0.32s; }
        .dot:nth-child(2) { animation-delay: -0.16s; }

        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }

        .input-area {
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.02);
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          gap: 1rem;
        }

        .input-area input {
          flex: 1;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 0.8rem 1.2rem;
          color: white;
          outline: none;
          transition: border-color 0.2s;
        }

        .input-area input:focus {
          border-color: #a855f7;
        }

        .send-btn {
          background: linear-gradient(135deg, #a855f7, #6366f1);
          border: none;
          border-radius: 12px;
          padding: 0 1.2rem;
          color: white;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .send-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(168, 85, 247, 0.4);
        }

        .send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* React Markdown Styles */
        .message-bubble table {
          border-collapse: collapse;
          width: 100%;
          margin: 1rem 0;
          font-size: 0.85rem;
        }
        .message-bubble th, .message-bubble td {
          border: 1px solid rgba(255,255,255,0.1);
          padding: 8px;
          text-align: left;
        }
        .message-bubble th { background: rgba(255,255,255,0.05); }
      `}</style>
    </div>
  );
};

export default AskYourPDFView;
