/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  BarChart3, Play, ChevronRight, Bike, GraduationCap
} from 'lucide-react';
import EdaDashboard from './components/EdaDashboard';
import PredictionPlayground from './components/PredictionPlayground';

type ViewTab = 'predictor' | 'eda';

export default function App() {
  const [activeTab, setActiveTab] = useState<ViewTab>('predictor');

  const navigationTabs = [
    { id: 'predictor', label: 'Predictor Console', icon: Play, subtitle: 'Interactive Risk Assessment & Presets' },
    { id: 'eda', label: 'Data Analysis', icon: BarChart3, subtitle: '10 Interactive SVG Visualizations' }
  ];

  return (
    <div id="app-root-shell" className="min-h-screen bg-gray-50 flex flex-col font-sans select-none antialiased">
      
      {/* Top Professional Header Branding */}
      <header id="app-header-brand" className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Logo Title Block */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-600 flex items-center justify-center text-white shadow-md shadow-amber-500/10">
              <Bike className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-extrabold text-gray-900 tracking-tight font-sans">
                  On-Demand Logistics Delay Predictor
                </h1>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-[10px] uppercase font-mono font-bold">
                  SML Study
                </span>
              </div>
              <p className="text-xs text-gray-400 font-sans tracking-wide">
                Industrial Capstone Machine Learning Project Study (Swiggy / Zomato logistics environment)
              </p>
            </div>
          </div>

          {/* Academic Signature */}
          <div className="flex items-center gap-2 text-xs text-gray-500 font-sans border-l-0 md:border-l border-gray-100 md:pl-4">
            <GraduationCap className="h-4 w-4 text-amber-500" />
            <span>Lead Scientist Portfolio</span>
          </div>

        </div>
      </header>

      {/* Main Container Layout */}
      <main id="app-main-content-layout" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Navigation Rail */}
        <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-[100px] z-20">
          <nav id="app-nav-rail" className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 pl-3 block mb-2 font-sans">
              System Console Index
            </span>
            {navigationTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  id={`nav-link-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id as ViewTab)}
                  className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer flex items-start gap-3 outline-none font-sans ${
                    isActive 
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20' 
                      : 'hover:bg-gray-200/50 bg-white border border-gray-200/40 text-gray-700'
                  }`}
                >
                  <div className={`mt-0.5 p-1.5 rounded-lg ${isActive ? 'bg-amber-700' : 'bg-gray-100'}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold block">{tab.label}</span>
                    <span className={`text-[10px] block mt-0.5 truncate ${isActive ? 'text-amber-100' : 'text-gray-400 font-medium'}`}>
                      {tab.subtitle}
                    </span>
                  </div>
                  <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${isActive ? 'translate-x-1' : 'opacity-40'}`} />
                </button>
              );
            })}
          </nav>
        </div>

        {/* View Switchboard Area */}
        <div id="app-view-canvas-body" className="lg:col-span-9">
          {activeTab === 'eda' && <EdaDashboard />}
          {activeTab === 'predictor' && <PredictionPlayground />}
        </div>

      </main>

      {/* Professional Footer */}
      <footer id="app-professional-footer" className="bg-white border-t border-gray-200 py-6 mt-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 font-sans gap-3">
          <div className="flex items-center gap-1">
            <span>© 2026 Academic Capstone Study. Compiled by krishchaudhari76@gmail.com</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px]">Notebook Version: v4_minor_2 (Python 3.10)</span>
            <span className="px-2 py-0.5 bg-gray-100 border border-gray-200 rounded font-semibold text-gray-600">
               Build Status: production-ready
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
