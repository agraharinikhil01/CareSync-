import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { askAiAssistantApi, getAiSuggestionsApi } from '../api/endpoints';
import {
  Bot,
  Sparkles,
  Send,
  X,
  Minimize2,
  Volume2,
  VolumeX,
  Copy,
  Check,
  RotateCcw,
  Mic,
  MicOff,
  Stethoscope,
  Activity,
  HeartPulse,
  ShieldCheck,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

const AIAssistantWidget = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Hello ${user?.name ? user.name.split(' ')[0] : 'there'}! 👋 I am your **CareSync AI Health & Hospital Assistant**.\n\nYou can ask me about:\n- 🩺 **Diseases & Symptoms** (Fever, Dengue, BP, Diabetes, Heart care, First aid)\n- 👨‍⚕️ **Available Doctors & Specialties**\n- 🛏️ **Live Hospital Ward Beds & ICU Status**\n- 💳 **Online Bill Payment & Emergency QR**\n\n*Aap mujhse Hindi, Hinglish ya English me pooch sakte hain!*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [isListening, setIsListening] = useState(false);

  const chatEndRef = useRef(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen && !isMinimized) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized, loading]);

  // Load quick suggestions on mount
  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        const res = await getAiSuggestionsApi();
        if (res.data.success) {
          setSuggestions(res.data.data);
        }
      } catch (err) {
        // Fallback default suggestions
        setSuggestions([
          { id: '1', label: '🤒 Fever & Infection Care', query: 'What to do in high fever and body ache?' },
          { id: '2', label: '👨‍⚕️ Available Doctors', query: 'Which doctors are currently available at the hospital?' },
          { id: '3', label: '🛏️ Ward Bed Availability', query: 'How many beds and ICU units are currently available?' },
          { id: '4', label: '💳 How to Pay Bills', query: 'How to pay hospital bill using mobile QR code?' },
          { id: '5', label: '🚨 Emergency SOS Passport', query: 'How does the Emergency Health Passport QR work?' },
        ]);
      }
    };
    loadSuggestions();
  }, []);

  // Voice speech synthesis helper
  const speakText = (text) => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }

    // Clean markdown symbols for natural voice speech
    const cleanText = text
      .replace(/###/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/#/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '')
      .replace(/-/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Detect Hindi speech
    if (/[\u0900-\u097F]/.test(text) || /bukhar|dawa|aspataal|karna|chahiye/.test(text.toLowerCase())) {
      utterance.lang = 'hi-IN';
    } else {
      utterance.lang = 'en-US';
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Speech Recognition (Mic voice dictation)
  const toggleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice dictation is supported on Chrome, Edge, and Safari.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputValue((prev) => (prev ? `${prev} ${transcript}` : transcript));
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const handleSendMessage = async (customText) => {
    const textToSend = customText || inputValue;
    if (!textToSend || !textToSend.trim() || loading) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputValue('');
    setLoading(true);

    try {
      const res = await askAiAssistantApi({
        query: textToSend.trim(),
        userRole: user?.role || 'patient',
        userName: user?.name || 'Guest',
      });

      if (res.data.success) {
        const aiMsg = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: res.data.data.answer,
          suggestions: res.data.data.suggestions || [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, aiMsg]);

        if (autoSpeak) {
          speakText(res.data.data.answer);
        }
      }
    } catch (err) {
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: '⚠️ I encountered a temporary connection issue. Please check your network and try again, or consult hospital reception.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    setMessages([
      {
        id: 'welcome',
        sender: 'ai',
        text: `Chat cleared! How can I assist your health or hospital needs today? 😊`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      {/* FLOATING TRIGGER BUTTON (When closed or minimized) */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="group relative flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white rounded-full shadow-2xl shadow-sky-500/40 hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-white/20"
        >
          <div className="relative">
            <Bot className="w-6 h-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-sky-600 animate-ping"></span>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-sky-600"></span>
          </div>

          <div className="flex flex-col text-left">
            <span className="text-xs font-black tracking-wide flex items-center gap-1">
              CareSync AI <Sparkles className="w-3 h-3 text-amber-300" />
            </span>
            <span className="text-[10px] text-sky-100 font-medium leading-none">Medical & Hospital Assistant</span>
          </div>
        </button>
      )}

      {/* CHAT WINDOW DRAWER */}
      {isOpen && (
        <div
          className={`w-[92vw] sm:w-[420px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden transition-all duration-300 ${
            isMinimized ? 'h-16' : 'h-[560px] max-h-[85vh]'
          }`}
        >
          {/* HEADER */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-sky-600/80 border border-sky-400/30 flex items-center justify-center text-white shadow-inner">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm tracking-tight flex items-center gap-1.5">
                  CareSync AI Assistant
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </h3>
                <p className="text-[10px] text-slate-300 font-medium">Online 24/7 • Health & Hospital Navigator</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Voice toggle */}
              <button
                onClick={() => setAutoSpeak(!autoSpeak)}
                title={autoSpeak ? 'Voice Auto-Speak On' : 'Voice Auto-Speak Off'}
                className={`p-1.5 rounded-lg transition ${
                  autoSpeak ? 'bg-sky-500/30 text-sky-300' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {autoSpeak ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {/* Clear chat */}
              <button
                onClick={handleClearChat}
                title="Clear Chat"
                className="p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Minimize */}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? 'Expand' : 'Minimize'}
                className="p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition"
              >
                <Minimize2 className="w-4 h-4" />
              </button>

              {/* Close */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  window.speechSynthesis?.cancel();
                  setIsSpeaking(false);
                }}
                title="Close"
                className="p-1.5 text-slate-400 hover:bg-red-500/20 hover:text-red-300 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* CHAT BODY (When not minimized) */}
          {!isMinimized && (
            <>
              {/* MESSAGES STREAM */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/60 text-xs">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl shadow-sm space-y-1.5 ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white rounded-tr-none'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                      }`}
                    >
                      {/* Sender Tag */}
                      <div className="flex items-center justify-between gap-2 border-b border-black/5 pb-1 mb-1">
                        <span
                          className={`font-black text-[10px] uppercase tracking-wider ${
                            msg.sender === 'user' ? 'text-sky-200' : 'text-sky-700 flex items-center gap-1'
                          }`}
                        >
                          {msg.sender === 'user' ? 'You' : <><Bot className="w-3 h-3" /> CareSync AI</>}
                        </span>
                        <span className={`text-[9px] ${msg.sender === 'user' ? 'text-sky-200' : 'text-slate-400'}`}>
                          {msg.timestamp}
                        </span>
                      </div>

                      {/* Content Formatter */}
                      <div className="leading-relaxed whitespace-pre-wrap font-normal text-[11.5px]">
                        {msg.text}
                      </div>

                      {/* AI Action Toolbar (Copy & Voice Speak) */}
                      {msg.sender === 'ai' && (
                        <div className="flex items-center gap-2 pt-1 border-t border-slate-100 mt-2">
                          <button
                            onClick={() => speakText(msg.text)}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-600 rounded-lg text-[10px] font-bold transition"
                          >
                            <Volume2 className="w-3 h-3 text-sky-600" />
                            <span>Listen Aloud</span>
                          </button>

                          <button
                            onClick={() => handleCopy(msg.id, msg.text)}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-medium transition"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-600 font-bold">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Follow-up suggestions chips */}
                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2 max-w-[85%]">
                        {msg.suggestions.map((s, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendMessage(s)}
                            className="px-2.5 py-1 bg-white hover:bg-sky-50 border border-sky-200 text-sky-700 hover:border-sky-400 rounded-full text-[10px] font-semibold transition shadow-2xs"
                          >
                            👉 {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing Indicator */}
                {loading && (
                  <div className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-2xl rounded-tl-none w-32 shadow-xs">
                    <span className="w-2 h-2 bg-sky-500 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-sky-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-2 h-2 bg-sky-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    <span className="text-[10px] font-bold text-slate-400 ml-1">Analyzing...</span>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* QUICK PROMPT CHIPS */}
              {messages.length <= 2 && suggestions.length > 0 && (
                <div className="px-3 py-2 bg-slate-100/80 border-t border-slate-200/60">
                  <p className="text-[10px] font-extrabold uppercase text-slate-500 mb-1.5 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" /> Suggested Inquiries:
                  </p>
                  <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {suggestions.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => handleSendMessage(s.query)}
                        className="px-2.5 py-1 bg-white hover:bg-sky-600 hover:text-white text-slate-700 border border-slate-200 rounded-xl text-[10px] font-bold whitespace-nowrap transition shadow-xs"
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* INPUT AREA */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
              >
                {/* Voice Mic Button */}
                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  title="Speak into microphone"
                  className={`p-2.5 rounded-xl border transition ${
                    isListening
                      ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200'
                  }`}
                >
                  {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </button>

                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask about diseases, doctors, beds, first aid..."
                  className="flex-1 px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:bg-white focus:outline-none placeholder:text-slate-400"
                />

                <button
                  type="submit"
                  disabled={!inputValue.trim() || loading}
                  className="p-2.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-40 text-white rounded-xl shadow-md transition"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AIAssistantWidget;
