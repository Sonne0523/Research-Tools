import { useState, type FC, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { API_BASE_URL } from '../config';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatAssistantProps {
  context: string;
  onClose: () => void;
}

const ChatAssistant: FC<ChatAssistantProps> = ({ context, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "I've analyzed the research paper. Is there anything specific you'd like to dive deeper into? (e.g., methodology details, specific data points, or implications)" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    const formData = new FormData();
    formData.append('query', userMessage);
    formData.append('paper_content', context);

    try {
      const response = await fetch(`${API_BASE_URL}/api/tools/ai/chat`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting to the research engine." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-assistant-panel animate-slide-in-right">
      <div className="chat-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="ai-badge">AI</span>
          <h3 style={{ margin: 0, fontSize: '1rem' }}>Research Assistant</h3>
        </div>
        <button className="chat-close-btn" onClick={onClose}>&times;</button>
      </div>

      <div className="chat-messages" ref={scrollRef}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`message-bubble ${msg.role}`}>
            {msg.role === 'assistant' ? (
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            ) : (
              msg.content
            )}
          </div>
        ))}
        {loading && <div className="message-bubble assistant loading">Generating insight...</div>}
      </div>

      <form className="chat-input-area" onSubmit={handleSend}>
        <input 
          type="text" 
          placeholder="Ask a follow-up question..." 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          autoFocus
        />
        <button type="submit" className="chat-send-btn" disabled={loading}>
          {loading ? '...' : '→'}
        </button>
      </form>
    </div>
  );
};

export default ChatAssistant;
