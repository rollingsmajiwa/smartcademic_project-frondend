import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function RevisionAITutor({ material, onClose, apiBaseUrl, authConfig }) {
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: `Hi! I'm your study tutor for "${material.title}". What concept from these notes would you like to work through? (I'll guide you with hints rather than giving direct answers!)`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // Keep the latest message in view
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    
    if (!apiBaseUrl) {
      console.error('RevisionAITutor: apiBaseUrl prop is missing.');
      setMessages((prev) => [
        ...prev,
        { role: 'ai', text: 'The tutor is not configured correctly (missing API address). Please contact support.' }
      ]);
      return;
    }

    const userMsg = input.trim();
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    const url = `${apiBaseUrl.replace(/\/+$/, '')}/students/ai-tutor/`;

    try {
      console.log('Sending material:', material);
      const res = await axios.post(
        url,
        { material_id: material.id, question: userMsg },
        authConfig
      );
      setMessages((prev) => [...prev, { role: 'ai', text: res.data.reply }]);
    } catch (err) {
      console.error('AI tutor request failed:', url, err.response?.status, err.response?.data);

      const serverMsg = err.response?.data?.error || err.response?.data?.detail;
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: serverMsg || 'Sorry, I had trouble reading the notes right now. Please try again.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-[#c77dff] rounded-2xl w-full max-w-lg flex flex-col h-[520px] shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#10002b] text-white p-4 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-extrabold">Mwalimu AI</h3>
            <p className="text-[11px] text-[#c77dff] truncate max-w-xs">{material.title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold px-2 py-1 rounded bg-white/10 hover:bg-white/20 cursor-pointer"
          >
            Close
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-[#10002b] text-white rounded-br-none'
                    : 'bg-white border border-[#c77dff]/50 text-[#10002b] rounded-bl-none shadow-xs'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {loading && <p className="text-xs text-[#10002b]/60 italic">Reviewing teacher's notes...</p>}
          <div ref={bottomRef} />
        </div>

        {/* Input Box */}
        <form onSubmit={handleSend} className="p-3 border-t border-[#c77dff]/30 bg-white flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder="Ask a question about this revision material..."
            className="flex-1 text-xs border border-[#c77dff] rounded-xl px-3 py-2 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-[#10002b] text-white text-xs font-bold px-4 py-2 rounded-xl hover:opacity-90 disabled:opacity-50 cursor-pointer"
          >
            Ask
          </button>
        </form>
      </div>
    </div>
  );
}
