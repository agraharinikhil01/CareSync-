import React, { useState } from 'react';
import api from '../../services/api';
import { Bot, X, Send, Trash2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const AIAssistantModal = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: 'Namaste! 👋 Main CareSync Hospital AI Assistant hun. Aap mujhse symptoms, appointments, available beds, ya hospital services ke baare me Hindi ya English me pooch sakte hain.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', { message: userMessage });
      if (res.data.success) {
        setMessages((prev) => [...prev, { role: 'ai', text: res.data.data.reply }]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: 'CareSync AI Assistant currently unavailable. Please consult the hospital helpdesk or try again shortly.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        role: 'ai',
        text: 'Chat history cleared. How can I assist you with your health today?',
      },
    ]);
    toast.success('Conversation reset');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-md border border-[#dcdcde] shadow-2xl w-full max-w-md flex flex-col h-[560px] overflow-hidden animate-in fade-in zoom-in duration-150">
        
        {/* Header */}
        <div className="bg-[#006088] text-white p-3.5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center ring-1 ring-white/20">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                CareSync AI Health Assistant
                <span className="text-[10px] bg-white/15 px-1.5 py-0.5 rounded font-normal text-cyan-100">
                  Gemini
                </span>
              </h3>
              <p className="text-[11px] text-blue-100">24/7 Clinical & Hospital Support</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleClear}
              title="Clear conversation"
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f6f7f7]">
          {messages.map((m, idx) => {
            const isUser = m.role === 'user';
            return (
              <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] text-xs p-3 rounded leading-relaxed shadow-xs ${
                    isUser
                      ? 'bg-[#0087be] text-white rounded-tr-none'
                      : 'bg-white text-[#101517] border border-[#dcdcde] rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-[#dcdcde] px-3.5 py-2 rounded text-xs text-[#646970] flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#0087be] animate-spin" />
                <span>CareSync AI is analyzing...</span>
              </div>
            </div>
          )}
        </div>

        {/* Emergency Medical Disclaimer */}
        <div className="bg-amber-50/80 px-3 py-1.5 border-t border-amber-200/60 text-[10px] text-amber-800 text-center">
          ⚠️ For acute medical emergencies, immediately call <strong>112</strong> or visit the nearest trauma center.
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSend} className="p-2.5 border-t border-[#dcdcde] bg-white flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your health inquiry in Hindi, Hinglish or English..."
            className="flex-1 border border-[#8c8f94] focus:border-[#006088] rounded px-3 py-2 text-xs outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-[#0087be] hover:bg-[#0073aa] disabled:opacity-50 text-white px-3 py-2 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIAssistantModal;
