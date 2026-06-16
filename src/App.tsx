/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  BarChart3, Play, ChevronRight, Bike, GraduationCap, FileDown, Database
} from 'lucide-react';
import EdaDashboard from './components/EdaDashboard';
import PredictionPlayground from './components/PredictionPlayground';
import { generateRawDataset } from './dataGenerator';
import { pythonNotebookCells } from './pythonNotebookCode';

type ViewTab = 'predictor' | 'eda';

export default function App() {
  const [activeTab, setActiveTab] = useState<ViewTab>('predictor');

  const navigationTabs = [
    { id: 'predictor', label: 'Predictor Console', icon: Play, subtitle: 'Interactive Risk Assessment & Presets' },
    { id: 'eda', label: 'Exploratory Data Analysis (EDA)', icon: BarChart3, subtitle: '10 Interactive SVG Visualizations' }
  ];

  // Build and export a fully compliant Jupyter Notebook (.ipynb) JSON file on the fly!
  const handleExportIpynb = () => {
    const ipynbCells = pythonNotebookCells.map((cell) => {
      const sourceLines = cell.content.split('\n').map((line, idx, arr) => 
        idx === arr.length - 1 ? line : line + '\n'
      );
      
      if (cell.type === 'markdown') {
        return {
          cell_type: 'markdown',
          metadata: {},
          source: sourceLines,
        };
      } else {
        return {
          cell_type: 'code',
          execution_count: cell.executionCount || null,
          metadata: {},
          outputs: cell.output ? [
            {
              name: 'stdout',
              output_type: 'stream',
              text: cell.output.split('\n').map((line, idx, arr) => 
                idx === arr.length - 1 ? line : line + '\n'
              ),
            }
          ] : [],
          source: sourceLines,
        };
      }
    });

    const ipynbData = {
      cells: ipynbCells,
      metadata: {
        kernelspec: {
          display_name: 'Python 3 (ipykernel)',
          language: 'python',
          name: 'python3',
        },
        language_info: {
          codemirror_mode: {
            name: 'ipython',
            version: 3,
          },
          file_extension: '.py',
          mimetype: 'text/x-python',
          name: 'python',
          nbconvert_exporter: 'python',
          pygments_lexer: 'ipython3',
          version: '3.10.0',
        },
      },
      nbformat: 4,
      nbformat_minor: 2,
    };

    const blob = new Blob([JSON.stringify(ipynbData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'predicting_food_delivery_delays.ipynb';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Build and export the raw food delivery CSV dataset dynamically
  const handleDownloadCSV = () => {
    const rawData = generateRawDataset();
    if (rawData.length === 0) return;
    
    const headers = Object.keys(rawData[0]);
    const csvRows = [headers.join(',')];
    
    for (const row of rawData) {
      const values = headers.map(header => {
        const val = row[header as keyof typeof row];
        const stringVal = val === undefined || val === null ? '' : String(val);
        // wrap strings with commas in quotes
        if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n')) {
          return `"${stringVal.replace(/"/g, '""')}"`;
        }
        return stringVal;
      });
      csvRows.push(values.join(','));
    }
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'food_delivery.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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

          {/* Clean Offline Assets Download Block */}
          <div className="bg-white border border-gray-200/60 rounded-xl p-4 shadow-sm space-y-3.5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block font-sans">
                Source Files & Datasets
              </span>
              <p className="text-[10.5px] text-gray-400 mt-1 leading-relaxed">
                Download the complete self-contained pipeline, Jupyter workbook code and sample dataset files. No external API required.
              </p>
            </div>
            
            <div className="space-y-2">
              <button 
                onClick={handleDownloadCSV}
                className="w-full py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/50 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Database className="h-4 w-4 text-amber-600" />
                Download csv Dataset
              </button>
              <button 
                onClick={handleExportIpynb}
                className="w-full py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/50 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <FileDown className="h-4 w-4 text-amber-600" />
                Export Jupyter Notebook
              </button>
            </div>
          </div>
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
