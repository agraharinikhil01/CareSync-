import React, { useState } from 'react';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import AIAssistantModal from '../components/common/AIAssistantModal';
import { Bot } from 'lucide-react';

const DashboardLayout = ({ children, title }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f6f7f7] flex flex-col font-sans">
      <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} title={title} />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          isOpen={sidebarOpen}
          closeSidebar={() => setSidebarOpen(false)}
          openAI={() => setAiModalOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Persistent Floating AI Assistant Button */}
      <button
        onClick={() => setAiModalOpen(true)}
        title="Consult CareSync AI Health Assistant"
        className="fixed bottom-5 right-5 z-40 bg-[#0087be] hover:bg-[#0073aa] text-white p-3.5 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2 text-xs font-semibold cursor-pointer group"
      >
        <Bot className="w-5 h-5 group-hover:scale-110 transition-transform" />
        <span className="hidden sm:inline">AI Health Assistant</span>
      </button>

      {/* AI Assistant Modal */}
      <AIAssistantModal isOpen={aiModalOpen} onClose={() => setAiModalOpen(false)} />
    </div>
  );
};

export default DashboardLayout;
