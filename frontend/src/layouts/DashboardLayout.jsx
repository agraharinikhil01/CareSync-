import React, { useState } from 'react';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import AIAssistantModal from '../components/common/AIAssistantModal';
import { Sparkles, Bot } from 'lucide-react';

const DashboardLayout = ({ children, title }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-sky-100 selection:text-sky-900">
      <Navbar
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        title={title}
        openAI={() => setAiModalOpen(true)}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          isOpen={sidebarOpen}
          closeSidebar={() => setSidebarOpen(false)}
          openAI={() => setAiModalOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full transition-all">
          {children}
        </main>
      </div>

      {/* Modern Floating AI Assistant Pill */}
      <button
        onClick={() => setAiModalOpen(true)}
        title="Open CareSync AI Clinical Assistant"
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white pl-4 pr-5 py-3 rounded-full shadow-xl shadow-sky-600/30 hover:shadow-2xl hover:shadow-sky-600/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2.5 text-xs font-bold cursor-pointer group"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-300 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-400"></span>
        </span>
        <Sparkles className="w-4 h-4 text-teal-200 group-hover:rotate-12 transition-transform" />
        <span>CareSync AI</span>
      </button>

      {/* AI Assistant Chat Modal */}
      <AIAssistantModal isOpen={aiModalOpen} onClose={() => setAiModalOpen(false)} />
    </div>
  );
};

export default DashboardLayout;
