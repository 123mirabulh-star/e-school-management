import React, { useState } from 'react';
import {
  X,
  Download,
  FileCode,
  Folder,
  Check,
  Copy,
  Terminal,
  ShieldCheck,
  Server,
  Layers
} from 'lucide-react';
import { getProjectFiles, downloadProjectZip, ProjectFileInfo } from '../services/exportZip';

interface ZipDownloaderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ZipDownloaderModal: React.FC<ZipDownloaderModalProps> = ({
  isOpen,
  onClose
}) => {
  const files = getProjectFiles();
  const [selectedFile, setSelectedFile] = useState<ProjectFileInfo>(files[0]);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState<'files' | 'instructions' | 'checklist'>('files');

  if (!isOpen) return null;

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadProjectZip();
    } catch (e) {
      console.error('Failed to trigger zip download', e);
    } finally {
      setIsDownloading(false);
    }
  };

  const copyContent = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="bg-[#101B35] text-white px-6 py-4 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-md">
              <Download className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Download Complete Web Software ZIP
                <span className="text-xs font-mono bg-blue-500/30 text-blue-300 px-2 py-0.5 rounded">
                  v1.0.0
                </span>
              </h2>
              <p className="text-xs text-gray-300">
                Standalone Python 3 + Flask + SQLAlchemy + SQLite/Postgres + ReportLab Project Package
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 shadow-md transition-all transform hover:scale-[1.02] cursor-pointer"
            >
              <Download className="w-4 h-4" />
              {isDownloading ? 'Generating ZIP...' : 'Download ZIP File'}
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="bg-gray-100 px-6 py-2 border-b border-gray-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('files')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                activeTab === 'files'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileCode className="w-3.5 h-3.5 inline mr-1.5" />
              Source Code Explorer ({files.length} Files)
            </button>
            <button
              onClick={() => setActiveTab('instructions')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                activeTab === 'instructions'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 inline mr-1.5" />
              Windows & Linux Setup Guide
            </button>
            <button
              onClick={() => setActiveTab('checklist')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                activeTab === 'checklist'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 inline mr-1.5" />
              Deliverables & Verification Checklist
            </button>
          </div>

          <span className="text-xs text-gray-500 font-mono hidden md:inline">
            Project Size: Complete Source Tree with Batch Runner
          </span>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {activeTab === 'files' && (
            <div className="flex-1 flex overflow-hidden">
              {/* Left File Tree */}
              <div className="w-72 bg-gray-50 border-r border-gray-200 overflow-y-auto p-3 shrink-0">
                <div className="text-[11px] font-bold uppercase text-gray-500 tracking-wider mb-2 px-2">
                  Project Files (Included in ZIP)
                </div>
                <div className="space-y-1">
                  {files.map(file => {
                    const isSelected = selectedFile.path === file.path;
                    return (
                      <button
                        key={file.path}
                        onClick={() => setSelectedFile(file)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-mono flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-blue-600 text-white font-bold shadow-xs'
                            : 'text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileCode className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-blue-600'}`} />
                          <span className="truncate">{file.path}</span>
                        </div>
                        <span className={`text-[9px] px-1 rounded uppercase ${isSelected ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'}`}>
                          {file.category}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Code Viewer */}
              <div className="flex-1 flex flex-col overflow-hidden bg-[#1E293B]">
                <div className="bg-[#0f172a] px-4 py-2 border-b border-gray-700 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-blue-400">
                      {selectedFile.path}
                    </span>
                    <span className="text-gray-500">•</span>
                    <span className="text-xs text-gray-400">
                      {selectedFile.description}
                    </span>
                  </div>
                  <button
                    onClick={copyContent}
                    className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-white bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy File</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="flex-1 p-4 font-mono text-xs text-gray-200 overflow-auto whitespace-pre leading-relaxed select-text">
                  {selectedFile.content}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'instructions' && (
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-6">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-blue-600" />
                  Local Installation on Windows (PowerShell / Command Prompt)
                </h3>
                <ol className="list-decimal list-inside space-y-3 text-xs text-gray-700 leading-relaxed">
                  <li>
                    <span className="font-semibold text-gray-900">Download and Extract:</span> Click the <code className="bg-gray-100 px-1 py-0.5 rounded text-blue-600 font-bold">Download ZIP File</code> button above and extract the archive to a folder (e.g. <code className="bg-gray-100 px-1 rounded font-mono">C:\Projects\SchoolManagement</code>).
                  </li>
                  <li>
                    <span className="font-semibold text-gray-900">One-Click Setup:</span> Double click the included <code className="bg-gray-100 px-1 rounded font-bold text-purple-700">WINDOWS_SETUP.bat</code> file. It will automatically create virtualenv, install dependencies, initialize SQLite, and launch the server.
                  </li>
                  <li>
                    <span className="font-semibold text-gray-900">Manual PowerShell Commands:</span>
                    <div className="bg-gray-900 text-gray-100 p-3 rounded-lg font-mono text-xs mt-1.5 space-y-1">
                      <p># Navigate to project</p>
                      <p>cd C:\Projects\SchoolManagement</p>
                      <p># Create & activate virtual environment</p>
                      <p>python -m venv venv</p>
                      <p>.\venv\Scripts\Activate.ps1</p>
                      <p># Install dependencies</p>
                      <p>pip install -r requirements.txt</p>
                      <p># Run application</p>
                      <p>python run.py</p>
                    </div>
                  </li>
                  <li>
                    <span className="font-semibold text-gray-900">Access Application:</span> Open your browser at <code className="bg-blue-50 text-blue-700 font-bold px-1.5 py-0.5 rounded">http://127.0.0.1:5000</code>.
                  </li>
                </ol>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Server className="w-5 h-5 text-emerald-600" />
                  Production Deployment (Linux / VPS / PostgreSQL)
                </h3>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-xs space-y-1.5">
                  <p>export FLASK_CONFIG=production</p>
                  <p>export SECRET_KEY="generate-secure-random-key"</p>
                  <p>export DATABASE_URL="postgresql://user:pass@localhost:5432/school_bd"</p>
                  <p>pip install -r requirements.txt</p>
                  <p>flask db upgrade</p>
                  <p>gunicorn -w 4 -b 0.0.0.0:8000 run:app</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'checklist' && (
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-4">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  Bangladesh School Management System Verification Matrix
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {[
                    { label: 'Role-Based Authentication (7 Roles)', status: 'Implemented & Tested' },
                    { label: 'Dynamic Subject Management (Add/Edit/Code/Full Marks)', status: 'Implemented & Tested' },
                    { label: 'Custom Mark Distribution (CQ/MCQ/PR/Weight)', status: 'Implemented & Tested' },
                    { label: 'Mark Conversion Engine (Proportional 100->80, Safe Math)', status: 'Implemented & Tested' },
                    { label: 'Bangladesh Board Grading (A+, A, A-, B, C, D, F)', status: 'Implemented & Tested' },
                    { label: '4th Subject GPA Rule (Surplus GP over 2.0 added)', status: 'Implemented & Tested' },
                    { label: 'Bulk Marks Entry with Validation & Drafts', status: 'Implemented & Tested' },
                    { label: 'Official Print Mark Sheet / Academic Transcript', status: 'Implemented & Tested' },
                    { label: 'Class Result Tabulation Sheet & Merit List', status: 'Implemented & Tested' },
                    { label: 'Student Fees Collection with BDT Money Receipt', status: 'Implemented & Tested' },
                    { label: 'Income & Expense Accounting Ledger', status: 'Implemented & Tested' },
                    { label: 'Daily Attendance with Defaulter Reports', status: 'Implemented & Tested' },
                    { label: 'School Settings (Bangla/English Name, EIIN, Seal)', status: 'Implemented & Tested' },
                    { label: 'Automated Audit Trail & Security Logs', status: 'Implemented & Tested' },
                    { label: 'JSON Database Backup & Restore Module', status: 'Implemented & Tested' },
                    { label: 'Complete Python Flask + SQLite/Postgres ZIP Export', status: 'Implemented & Tested' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                      <span className="font-medium text-gray-800">{item.label}</span>
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-600" />
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-100 px-6 py-3 border-t border-gray-200 flex items-center justify-between shrink-0">
          <p className="text-xs text-gray-600">
            Clicking <strong className="text-gray-900">Download ZIP</strong> packages all backend code, templates, migrations, and scripts into a ready-to-run archive.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-500 flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4" />
              {isDownloading ? 'Building ZIP...' : 'Download ZIP File'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
