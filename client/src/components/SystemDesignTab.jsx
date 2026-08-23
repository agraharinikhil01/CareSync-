import React, { useState } from 'react';
import { Layers, Network, GitMerge, Database, Printer, Download, Eye, ExternalLink } from 'lucide-react';

const SystemDesignTab = () => {
  const [selectedDiagram, setSelectedDiagram] = useState('arch');

  const diagrams = [
    {
      id: 'arch',
      title: 'Figure 4.1: Three-Tier System Architecture',
      subtitle: 'Presentation Layer (React 18), Application Layer (Express/Node.js API), Data Layer (MongoDB Atlas)',
      icon: Layers,
      file: '/system_architecture.html',
      svgFile: '/system_architecture_diagram.svg',
    },
    {
      id: 'usecase',
      title: 'Figure 4.2: Role-Based Use Case Diagram',
      subtitle: 'Actor mappings for Patient, Receptionist, Doctor, and Admin across 11 core functional modules',
      icon: Network,
      file: '/use_case_diagram.html',
      svgFile: '/use_case_diagram.svg',
    },
    {
      id: 'dfd',
      title: 'Figure 4.3: Level-1 Data Flow Diagram (DFD)',
      subtitle: 'Data flow between external entities, process engines (1.0 - 5.0), and database stores (D1 - D4)',
      icon: GitMerge,
      file: '/dfd_level1_diagram.html',
      svgFile: '/dfd_level1_diagram.svg',
    },
    {
      id: 'er',
      title: 'Figure 4.4: Entity-Relationship (ER) Diagram',
      subtitle: 'Relational & Document schema models, foreign keys, cardinality mappings (1:1, 1:N)',
      icon: Database,
      file: '/er_diagram.html',
      svgFile: '/er_diagram.svg',
    },
  ];

  const currentDiagram = diagrams.find((d) => d.id === selectedDiagram) || diagrams[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 p-6 rounded-2xl text-white shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" />
            <span>Academic Project Documentation & Specifications</span>
          </div>
          <h2 className="text-2xl font-bold">Chapter 4: System Design & Architecture</h2>
          <p className="text-slate-300 text-sm mt-1">
            Interactive visual blueprints: Three-Tier Architecture, Use Case, DFD Level-1, and ER Diagrams.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={currentDiagram.file}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl transition shadow-md shadow-sky-600/30"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </a>
          <a
            href={currentDiagram.svgFile}
            download
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded-xl transition"
          >
            <Download className="w-4 h-4" />
            <span>Download SVG</span>
          </a>
        </div>
      </div>

      {/* Tab Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {diagrams.map((diag) => {
          const Icon = diag.icon;
          const isSelected = selectedDiagram === diag.id;
          return (
            <button
              key={diag.id}
              onClick={() => setSelectedDiagram(diag.id)}
              className={`p-4 rounded-xl border text-left transition flex flex-col justify-between ${
                isSelected
                  ? 'bg-sky-50 border-sky-500 text-sky-900 shadow-md ring-2 ring-sky-500/20'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`p-2 rounded-lg ${
                    isSelected ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {diag.id.toUpperCase()}
                </span>
              </div>
              <h4 className="text-sm font-bold leading-snug line-clamp-2">{diag.title}</h4>
            </button>
          );
        })}
      </div>

      {/* Embedded Diagram Viewer Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800">{currentDiagram.title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{currentDiagram.subtitle}</p>
          </div>
          <a
            href={currentDiagram.file}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1.5"
          >
            <span>Open Fullscreen</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Embedded Iframe Viewer */}
        <div className="w-full bg-slate-50 rounded-xl border border-slate-200 overflow-hidden flex justify-center items-center min-h-[600px]">
          <iframe
            src={currentDiagram.file}
            title={currentDiagram.title}
            className="w-full min-h-[680px] border-0"
          />
        </div>
      </div>
    </div>
  );
};

export default SystemDesignTab;
