import React, { useState, useRef, useEffect } from 'react';
import api from '../../services/api';
import { Bot, X, Send, RotateCcw, Sparkles, ShieldAlert, HeartPulse, User, Languages } from 'lucide-react';
import toast from 'react-hot-toast';

const SUGGESTED_PROMPTS_HI = [
  '🌍 सामान्य ज्ञान या कोई भी सवाल पूछें',
  '🔬 विज्ञान / तकनीक से जुड़े सवाल',
  '🩺 तबीयत खराब है, क्या करूँ?',
  '🏥 अस्पताल में उपलब्ध बेड व डॉक्टर',
];

const SUGGESTED_PROMPTS_EN = [
  '🌍 Ask anything (Science, Tech, General)',
  '💡 Explain complex concepts simply',
  '🩺 Health symptoms & medical guidance',
  '🏥 Check hospital beds & specialists',
];

const AIAssistantModal = ({ isOpen, onClose }) => {
  const [language, setLanguage] = useState('hi'); // 'hi' (Hindi) or 'en' (English)
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: 'नमस्ते',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const toggleLanguage = (lang) => {
    if (lang === language) return;
    setLanguage(lang);

    const greeting = lang === 'hi' ? 'नमस्ते' : 'Hello CareSync AI';

    // If chat hasn't started yet (only greeting shown), cleanly replace it with the new greeting
    setMessages((prev) => {
      const hasUserMessage = prev.some((m) => m.role === 'user');
      if (!hasUserMessage) {
        return [{ role: 'ai', text: greeting }];
      }
      return [
        ...prev,
        {
          role: 'ai',
          text: greeting,
        },
      ];
    });
  };

  const handleSend = async (textToSend) => {
    const userMessage = (textToSend || input).trim();
    if (!userMessage || loading) return;

    setInput('');
    const newMessages = [...messages, { role: 'user', text: userMessage }];
    setMessages(newMessages);
    setLoading(true);

    try {
      // Pass recent conversation history for multi-turn conversational context
      const res = await api.post('/ai/chat', {
        message: userMessage,
        language,
        history: newMessages.slice(-6),
      });

      if (res.data?.success && res.data?.data?.reply) {
        setMessages((prev) => [...prev, { role: 'ai', text: res.data.data.reply }]);
      } else {
        throw new Error('No reply');
      }
    } catch {
      const fallbackText =
        language === 'hi'
          ? 'नमस्ते। CareSync Pro AI से संपर्क में क्षणिक विलंब हो रहा है। सामान्य ज्ञान या स्वास्थ्य से जुड़े किसी भी प्रश्न के लिए कृपया एक बार पुनः सबमिट करें। यदि आपातकालीन स्थिति है तो तुरंत 112 डायल करें।'
          : 'CareSync Pro AI is momentarily busy. Please try sending your query again. For life-threatening emergencies, immediately dial 112.';

      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: fallbackText,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    const greeting = language === 'hi' ? 'नमस्ते' : 'Hello CareSync AI';
    setMessages([
      {
        role: 'ai',
        text: greeting,
      },
    ]);
    toast.success(language === 'hi' ? 'बातचीत रीसेट हो गई' : 'Conversation cleared');
  };

  if (!isOpen) return null;

  const currentPrompts = language === 'hi' ? SUGGESTED_PROMPTS_HI : SUGGESTED_PROMPTS_EN;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[9999] flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xl w-full max-w-lg flex flex-col h-[600px] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950 text-white p-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-teal-400 text-white flex items-center justify-center shadow-md shadow-sky-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight flex items-center gap-2">
                CareSync Pro AI
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  Gemini Pro AI
                </span>
              </h3>
              <p className="text-[11px] text-slate-300">
                {language === 'hi'
                  ? 'सर्वज्ञानी AI — सामान्य ज्ञान, विज्ञान, तकनीक व स्वास्थ्य'
                  : 'Omni-Intelligent AI — Science, Tech, Knowledge & Health'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher Pill */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-lg p-0.5 flex items-center text-xs">
              <button
                type="button"
                onClick={() => toggleLanguage('hi')}
                className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                  language === 'hi'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="हिंदी में बात करें"
              >
                🇮🇳 हिंदी
              </button>
              <button
                type="button"
                onClick={() => toggleLanguage('en')}
                className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                  language === 'en'
                    ? 'bg-sky-500 text-white font-bold shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Switch to English"
              >
                🌐 Eng
              </button>
            </div>

            <button
              onClick={handleClear}
              title={language === 'hi' ? 'बातचीत रीसेट करें' : 'Reset conversation'}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              title={language === 'hi' ? 'बंद करें' : 'Close'}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Suggested Quick Prompt Chips */}
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            {language === 'hi' ? 'सुझाव:' : 'Try:'}
          </span>
          {currentPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="text-[11px] text-slate-600 bg-white hover:bg-sky-50 hover:text-sky-700 hover:border-sky-200 border border-slate-200 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer shadow-2xs"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {messages.map((m, idx) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={idx}
                className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                    isUser ? 'bg-sky-600 text-white' : 'bg-slate-900 text-teal-300'
                  }`}
                >
                  {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-[85%] text-xs p-3.5 rounded-2xl leading-relaxed shadow-xs ${
                    isUser
                      ? 'bg-sky-600 text-white rounded-tr-xs'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-slate-900 text-teal-300 flex items-center justify-center text-xs shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-xs text-xs text-slate-500 flex items-center gap-2 shadow-xs">
                <div className="flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-bounce"></span>
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-bounce"
                    style={{ animationDelay: '0.15s' }}
                  ></span>
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-bounce"
                    style={{ animationDelay: '0.3s' }}
                  ></span>
                </div>
                <span>
                  {language === 'hi' ? 'CareSync AI उत्तर तैयार कर रहा है...' : 'CareSync AI is thinking...'}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Emergency Disclaimer Banner */}
        <div className="bg-amber-50/90 px-3.5 py-1.5 border-t border-amber-200/60 text-[10px] text-amber-800 flex items-center justify-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>
            {language === 'hi' ? (
              <>
                केवल AI परामर्श। गंभीर आपातकाल या सीने के दर्द में तुरंत <strong>112</strong> डायल करें।
              </>
            ) : (
              <>
                AI advisory only. For life-threatening emergencies, immediately call <strong>112</strong>.
              </>
            )}
          </span>
        </div>

        {/* Chat Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 border-t border-slate-200/80 bg-white flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              language === 'hi'
                ? 'कोई भी सवाल पूछें — विज्ञान, तकनीक, गणित, सामान्य ज्ञान या स्वास्थ्य...'
                : 'Ask anything — science, technology, math, general knowledge, or health...'
            }
            className="flex-1 border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/15 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none transition-all placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-sky-600 hover:bg-sky-700 disabled:opacity-40 text-white p-2.5 rounded-xl text-xs font-semibold flex items-center justify-center cursor-pointer transition-all shadow-sm shadow-sky-600/20 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIAssistantModal;
