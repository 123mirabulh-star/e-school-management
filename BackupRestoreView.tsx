import React, { useState } from 'react';
import {
  Database,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Server,
  FileJson,
  ShieldAlert,
  ShieldCheck,
  X,
  History,
  Lock,
  FileCode
} from 'lucide-react';
import { AppDatabase, saveDatabase, getInitialDatabase, getBlankDatabase, logAuditAction, DESIGNATED_SUPER_ADMIN_ID, initializeBlankDatabaseServer } from '../services/storage';
import { ZipDownloaderModal } from './ZipDownloaderModal';

interface BackupRestoreViewProps {
  db: AppDatabase;
  onUpdateDb: (updated: AppDatabase) => void;
}

export const BackupRestoreView: React.FC<BackupRestoreViewProps> = ({
  db,
  onUpdateDb
}) => {
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Modals state
  const [showBlankConfirmModal, setShowBlankConfirmModal] = useState(false);
  const [showDemoConfirmModal, setShowDemoConfirmModal] = useState(false);
  const [blankConfirmAgreed, setBlankConfirmAgreed] = useState(false);
  const [showZipModal, setShowZipModal] = useState(false);

  // Check if current user is Super Admin
  const isSuperAdmin = db.currentUser?.role === 'Super Admin' || db.currentUser?.username === DESIGNATED_SUPER_ADMIN_ID;

  // Check if an emergency disaster recovery snapshot exists in local storage
  const hasEmergencySnapshot = !!localStorage.getItem('ebiddalay_emergency_snapshot');

  const handleDownloadBackup = () => {
    const backupData = JSON.stringify(db, null, 2);
    const blob = new Blob([backupData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ebiddalay_school_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    const updated = logAuditAction(db, 'EXPORT_DATABASE_BACKUP', 'Exported JSON database backup archive');
    onUpdateDb(updated);
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.schoolSettings || !parsed.students) {
          throw new Error('Invalid database backup structure.');
        }

        let updatedDb = { ...parsed };
        updatedDb = logAuditAction(updatedDb, 'RESTORE_DATABASE', 'Restored database from uploaded backup file');
        saveDatabase(updatedDb);
        onUpdateDb(updatedDb);

        setSuccessMsg('Database restored successfully from backup file!');
        setTimeout(() => setSuccessMsg(''), 4000);
      } catch (err) {
        setErrorMsg('Failed to restore backup: Invalid JSON file format.');
        setTimeout(() => setErrorMsg(''), 4000);
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteBlankDatabase = async () => {
    if (!isSuperAdmin) {
      setErrorMsg('Permission Denied: Only the designated Super Admin can initialize a blank database.');
      return;
    }

    if (!blankConfirmAgreed) {
      setErrorMsg('Please tick the confirmation checkbox before proceeding.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg('');

    try {
      // 1. Automatically create an emergency snapshot safeguard in localStorage before wiping
      localStorage.setItem('ebiddalay_emergency_snapshot', JSON.stringify({
        timestamp: new Date().toISOString(),
        data: db
      }));

      // 2. Prepare blank operational structure keeping all authorized users and Super Admin account intact
      const blank = getBlankDatabase(db.currentUser);

      // Keep all registered administrative accounts
      blank.users = db.users;
      blank.currentUser = db.currentUser;
      blank.isAuthenticated = true;

      // Log the initialization event
      const auditedBlank = logAuditAction(
        blank,
        'INITIALIZE_BLANK_DATABASE',
        `Super Admin ${db.currentUser?.fullName || 'Md. Mirabul Hossen'} initialized blank institution database (Null Slate). Emergency snapshot archived.`
      );

      // 3. Save to localStorage
      saveDatabase(auditedBlank);

      // 4. Execute backend server initialization
      await initializeBlankDatabaseServer(auditedBlank, DESIGNATED_SUPER_ADMIN_ID);

      // 5. Update React App state immediately
      onUpdateDb(auditedBlank);

      setShowBlankConfirmModal(false);
      setBlankConfirmAgreed(false);
      setSuccessMsg('Institution database initialized to clean blank slate (Null Data)! Super Admin account remains active. Emergency recovery snapshot saved.');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: any) {
      setErrorMsg('Failed to initialize blank database: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestoreEmergencySnapshot = () => {
    try {
      const raw = localStorage.getItem('ebiddalay_emergency_snapshot');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && parsed.data) {
        let restoredDb = parsed.data;
        restoredDb = logAuditAction(restoredDb, 'RESTORE_EMERGENCY_SNAPSHOT', 'Restored database from pre-blank emergency snapshot');
        saveDatabase(restoredDb);
        onUpdateDb(restoredDb);
        setSuccessMsg('Successfully restored pre-initialization database snapshot!');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch {
      setErrorMsg('Failed to restore emergency snapshot.');
    }
  };

  const handleExecuteResetDemoDefaults = () => {
    setIsProcessing(true);
    try {
      const initial = getInitialDatabase();
      if (db.currentUser) {
        initial.currentUser = db.currentUser;
        initial.isAuthenticated = true;
      }
      saveDatabase(initial);
      onUpdateDb(initial);
      setShowDemoConfirmModal(false);
      setSuccessMsg('Database reset to official demonstration sample dataset!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg('Failed to reset defaults: ' + err?.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto text-xs">
      {/* Header bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            <span>Database Backup & Disaster Recovery</span>
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Full institutional snapshot including student profiles, mark distribution, results, fees, and audit history.
          </p>
        </div>

        {hasEmergencySnapshot && (
          <button
            type="button"
            onClick={handleRestoreEmergencySnapshot}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-3 py-1.5 rounded-lg border border-gray-300 flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Restore database snapshot taken immediately before last blank initialization"
          >
            <History className="w-3.5 h-3.5 text-blue-600" />
            <span>Undo to Safety Snapshot</span>
          </button>
        )}
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3.5 rounded-xl font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border border-red-300 text-red-800 p-3.5 rounded-xl font-bold flex items-center gap-2 shadow-xs">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Export / Restore / Codebase Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Export Backup Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">Download Database Backup (.json)</h4>
              <p className="text-xs text-gray-500 mt-1">
                Creates a complete, timestamped JSON snapshot of all students, marks, fee collections, and configuration.
              </p>
            </div>
          </div>
          <button
            onClick={handleDownloadBackup}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Complete Database</span>
          </button>
        </div>

        {/* Restore Backup Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">Restore from Backup Archive</h4>
              <p className="text-xs text-gray-500 mt-1">
                Upload a previously exported .json file to restore the database to an exact historical state.
              </p>
            </div>
          </div>
          <label className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-xs cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>Select & Restore JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleRestoreFile}
              className="hidden"
            />
          </label>
        </div>

        {/* Project Source Code ZIP Archive (Exclusively in Backup & Restore) */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-6 rounded-2xl border border-indigo-700/50 shadow-md space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-yellow-300 flex items-center justify-center font-bold border border-blue-400/30">
                <FileCode className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-bold bg-blue-500/30 text-blue-300 px-2 py-0.5 rounded border border-blue-400/20">
                Full Codebase ZIP
              </span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Project Source Code Archive</h4>
              <p className="text-xs text-gray-300 mt-1">
                Download the complete codebase archive: React frontend, standalone Python Flask backend, SQLite/PostgreSQL schemas, ReportLab PDF generators, and setup automation.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowZipModal(true)}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-md cursor-pointer transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download Project Source ZIP</span>
          </button>
        </div>
      </div>

      {/* Database State Management: Clean Slate (Data Null) vs Demo Seed */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
        {/* Clean Slate / Null Data Option (Requirement 2) */}
        <div className="bg-amber-50/70 p-5 rounded-2xl border-2 border-amber-300 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
              <Database className="w-4 h-4 text-amber-600" />
              <span>Initialize Blank Institution Database (Null Slate)</span>
            </div>
            {!isSuperAdmin && (
              <span className="text-[10px] bg-red-100 text-red-800 font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Super Admin Only
              </span>
            )}
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">
            Empties all demo students, marks, examinations, and subjects. Admin can enter fresh data specifically for their institution or import via Excel. Super Admin and user accounts remain intact.
          </p>
          <button
            onClick={() => setShowBlankConfirmModal(true)}
            disabled={!isSuperAdmin || isProcessing}
            className={`w-full font-bold text-xs px-4 py-2.5 rounded-lg flex items-center justify-center gap-1.5 shadow-xs transition-colors ${
              isSuperAdmin
                ? 'bg-amber-600 hover:bg-amber-700 text-white cursor-pointer'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Initialize Blank Database (Null Slate)</span>
          </button>
        </div>

        {/* Factory Demo Reset Section */}
        <div className="bg-blue-50/60 p-5 rounded-2xl border border-blue-200 space-y-3">
          <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
            <Server className="w-4 h-4 text-blue-600" />
            <span>Load Sample Demonstration Data</span>
          </div>
          <p className="text-xs text-blue-800 leading-relaxed">
            Re-loads Dhaka Ideal Model High School dataset with sample students, subjects, exams, and marks for testing and preview.
          </p>
          <button
            onClick={() => setShowDemoConfirmModal(true)}
            disabled={isProcessing}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Load Demo Data Defaults</span>
          </button>
        </div>
      </div>

      {/* CONFIRMATION MODAL: BLANK / NULL DATABASE INITIALIZATION */}
      {showBlankConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
                <span>Confirm Blank Database Initialization</span>
              </div>
              <button
                onClick={() => {
                  setShowBlankConfirmModal(false);
                  setBlankConfirmAgreed(false);
                }}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-amber-900 text-xs">
              <p className="font-bold">
                ⚠️ Critical Institutional Notice:
              </p>
              <p>
                Initializing the blank database will clear all sample students, marks, subject lists, examinations, and fee records so you can start clean for your own institution.
              </p>
            </div>

            <div className="space-y-2 text-gray-700 text-xs bg-gray-50 p-3 rounded-xl border border-gray-200">
              <span className="font-bold block text-gray-900">Protected & Preserved Safeguards:</span>
              <div className="flex items-center gap-2 text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Super Admin account (Md. Mirabul Hossen - 01936988967) is 100% preserved.</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>All authorized administrator and user accounts remain active.</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>An automatic emergency safety snapshot will be created before clearing.</span>
              </div>
            </div>

            <label className="flex items-start gap-2.5 p-3 rounded-xl border border-gray-300 bg-white cursor-pointer select-none">
              <input
                type="checkbox"
                checked={blankConfirmAgreed}
                onChange={e => setBlankConfirmAgreed(e.target.checked)}
                className="mt-0.5 rounded text-amber-600 w-4 h-4"
              />
              <span className="text-gray-800 font-bold text-xs">
                I explicitly authorize initializing the blank database for this institution.
              </span>
            </label>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => {
                  setShowBlankConfirmModal(false);
                  setBlankConfirmAgreed(false);
                }}
                className="px-4 py-2 border rounded-lg text-gray-700 font-bold hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!blankConfirmAgreed || isProcessing}
                onClick={handleExecuteBlankDatabase}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <RotateCcw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
                <span>{isProcessing ? 'Initializing...' : 'Confirm & Initialize Blank Slate'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL: LOAD DEMO DATA */}
      {showDemoConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-gray-200 space-y-3">
            <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
              <Server className="w-5 h-5 text-blue-600" />
              <span>Load Sample Demonstration Data</span>
            </div>
            <p className="text-gray-600">
              Are you sure you want to re-load the demonstration sample dataset? Existing changes will be replaced with standard seed data.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setShowDemoConfirmModal(false)}
                className="px-3.5 py-1.5 border rounded-lg text-gray-700 font-bold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleExecuteResetDemoDefaults}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs cursor-pointer"
              >
                {isProcessing ? 'Loading...' : 'Yes, Load Demo Data'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Zip Downloader Modal */}
      <ZipDownloaderModal isOpen={showZipModal} onClose={() => setShowZipModal(false)} />
    </div>
  );
};
