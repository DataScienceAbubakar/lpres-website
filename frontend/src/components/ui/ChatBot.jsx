import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Bot, User, RotateCcw } from 'lucide-react';
import './ChatBot.css';

const WELCOME = `👋 Hello! I'm the **L-PRES AI Assistant**.

I can help you learn about the Kwara Livestock Productivity & Resilience Support Project, including our coverage, activities, impact, and how to navigate the site.

What would you like to know?`;

function parseMarkdown(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br />')
    .replace(/^- (.+)/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
}

function Message({ role, text, isTyping }) {
  const isBot = role === 'assistant';
  return (
    <div className={`chat__msg chat__msg--${role}`}>
      <div className="chat__avatar">
        {isBot ? <Bot size={13} /> : <User size={13} />}
      </div>
      <div className="chat__bubble">
        {isTyping ? (
          <div className="chat__typing">
            <span /><span /><span />
          </div>
        ) : (
          <div
            className="chat__text"
            dangerouslySetInnerHTML={{ __html: `<p>${parseMarkdown(text)}</p>` }}
          />
        )}
      </div>
    </div>
  );
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: WELCOME },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasNew, setHasNew] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (open) {
      setHasNew(false);
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [open]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Build history for API (exclude welcome, max 10 turns)
    const history = [...messages.filter(m => m.text !== WELCOME), userMsg]
      .slice(-10)
      .map(m => ({ role: m.role, content: m.text }));

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', text: data.reply }]);
      if (!open) setHasNew(true);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: "I'm having trouble connecting right now. Please try again in a moment.",
      }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, open]);

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const reset = () => {
    setMessages([{ role: 'assistant', text: WELCOME }]);
    setInput('');
  };

  const QUICK = ['What is L-PRES?', 'LGAs covered', 'Key statistics', 'How to contact you'];

  return (
    <div className="chat__root">
      {/* Chat panel */}
      {open && (
        <div className="chat__panel">
          {/* Header */}
          <div className="chat__header">
            <div className="chat__header-info">
              <div className="chat__header-avatar">
                <Bot size={16} />
                <span className="chat__online-dot" />
              </div>
              <div>
                <div className="chat__header-name">L-PRES Assistant</div>
                <div className="chat__header-sub">Online Support</div>
              </div>
            </div>
            <div className="chat__header-actions">
              <button className="chat__icon-btn" onClick={reset} title="Clear chat"><RotateCcw size={13} /></button>
              <button className="chat__icon-btn" onClick={() => setOpen(false)} title="Close"><X size={15} /></button>
            </div>
          </div>

          {/* Messages */}
          <div className="chat__messages">
            {messages.map((m, i) => (
              <Message key={i} role={m.role} text={m.text} />
            ))}
            {loading && <Message role="assistant" isTyping />}
            <div ref={bottomRef} />
          </div>

          {/* Quick prompts (only when no conversation yet) */}
          {messages.length === 1 && !loading && (
            <div className="chat__quick">
              {QUICK.map(q => (
                <button
                  key={q}
                  className="chat__quick-btn"
                  onClick={() => { setInput(q); setTimeout(() => send(), 0); }}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="chat__input-row">
            <textarea
              ref={inputRef}
              className="chat__input"
              placeholder="Ask about L-PRES…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKey}
              rows={1}
              maxLength={500}
            />
            <button
              className={`chat__send ${input.trim() && !loading ? 'chat__send--active' : ''}`}
              onClick={send}
              disabled={!input.trim() || loading}
              aria-label="Send"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Floating toggle button */}
      <button
        className={`chat__toggle ${open ? 'chat__toggle--open' : ''}`}
        onClick={() => setOpen(v => !v)}
        aria-label={open ? 'Close chat' : 'Open AI assistant'}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
        {hasNew && !open && <span className="chat__new-dot" />}
        {!open && <span className="chat__toggle-label">Ask AI</span>}
      </button>
    </div>
  );
}
