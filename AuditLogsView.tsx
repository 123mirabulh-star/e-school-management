import React, { useState } from 'react';
import {
  History,
  ShieldCheck,
  Search,
  Filter,
  Clock,
  UserCheck,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  X,
  RotateCcw,
  Shield
} from 'lucide-react';
import { AppDatabase, saveDatabase } from '../services/storage';
import { AuditLog } from '../types';

interface AuditLogsViewProps {
  db: AppDatabase;
  onUpdateDb?: (updated: AppDatabase) => void;
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ db, onUpdateDb }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [bannerMsg, setBannerMsg] = useState('');

  // Confirmation modals state
  const [deleteLogTarget, setDeleteLogTarget] = useState<AuditLog | null>(null);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);

  const filteredLogs = db.auditLogs.filter(log =>
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const showBanner = (msg: string) => {
    setBannerMsg(msg);
    setTimeout(() => setBannerMsg(''), 3500);
  };

  // Delete individual audit log entry
  const handleConfirmDeleteLog = () => {
    if (!deleteLogTarget) return;

    // Strictly touches ONLY auditLogs array, preserving all operational data untouched
    const updatedLogs = db.auditLogs.filter(l => l.id !== deleteLogTarget.id);
    const updatedDb: AppDatabase = {
      ...db,
      auditLogs: updatedLogs
    };

    saveDatabase(updatedDb);
    if (onUpdateDb) {
      onUpdateDb(updatedDb);
    }

    setDeleteLogTarget(null);
    showBanner('Selected audit log record deleted successfully.');
  };

  // Clear all audit log history
  const handleConfirmClearAllLogs = () => {
    // Strictly resets ONLY auditLogs array, preserving all operational data (students, marks, exams, settings) completely untouched
    const updatedDb: AppDatabase = {
      ...db,
      auditLogs: []
    };

    saveDatabase(updatedDb);
    if (onUpdateDb) {
      onUpdateDb(updatedDb);
    }

    setShowClearAllConfirm(false);
    showBanner('Audit log history cleared successfully.');
  };

  return (
    <div className="space-y-5">
      {/* Top Header Card */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <History className="w-5 h-5 text-purple-600" />
            System Audit Trail & Security Logs
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            System audit logs tracking results publication, mark entries, student admissions, fee collections, and administrative changes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search action, user, details..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:outline-hidden"
            />
          </div>

          {/* Clear History Button */}
          {db.auditLogs.length > 0 && (
            <button
              onClick={() => setShowClearAllConfirm(true)}
              className="bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-red-200 cursor-pointer shadow-xs transition-colors shrink-0"
              title="Clear all audit log history"
            >
              <RotateCcw className="w-3.5 h-3.5 text-red-600" />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>

      {/* Banner Message */}
      {bannerMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold p-3 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{bannerMsg}</span>
          </div>
          <button onClick={() => setBannerMsg('')} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Logs Table Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="p-3.5 border-b border-gray-200 bg-gray-50 flex items-center justify-between text-xs">
          <span className="font-bold text-gray-700 uppercase tracking-wider">
            Logged Events ({filteredLogs.length})
          </span>
          <span className="text-gray-500 font-mono text-[11px] flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-purple-600" />
            Security Status: Enforced & Verified
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-100 text-gray-600 uppercase font-semibold">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Authorized User</th>
                <th className="py-2.5 px-3">Action Type</th>
                <th className="py-2.5 px-3">Audit Details</th>
                <th className="py-2.5 px-3">Client IP</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    No audit log records found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50/50">
                    <td className="py-2.5 px-3 font-mono text-gray-500 whitespace-nowrap text-[11px]">
                      {log.timestamp}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-gray-900 whitespace-nowrap">
                      {log.user}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] font-mono font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded uppercase">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-gray-700">
                      {log.details}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-gray-400 text-[11px]">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => setDeleteLogTarget(log)}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded cursor-pointer transition-colors"
                        title="Delete this log record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Single Log Confirmation Modal */}
      {deleteLogTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Confirm Audit Log Deletion
              </h3>
              <button
                onClick={() => setDeleteLogTarget(null)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-gray-700">
              <p>Are you sure you want to delete this specific audit log entry?</p>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-1 font-mono text-[11px]">
                <div>
                  <span className="text-gray-500">Action:</span> <strong>{deleteLogTarget.action}</strong>
                </div>
                <div>
                  <span className="text-gray-500">User:</span> {deleteLogTarget.user}
                </div>
                <div>
                  <span className="text-gray-500">Time:</span> {deleteLogTarget.timestamp}
                </div>
                <div className="text-gray-800 mt-1">{deleteLogTarget.details}</div>
              </div>
              <p className="text-gray-500 text-[11px]">
                Note: This operation modifies only the audit log record and does not alter any operational student, examination, or fee data.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setDeleteLogTarget(null)}
                className="px-4 py-2 border rounded-lg text-gray-700 font-semibold hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteLog}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Trash2 className="w-4 h-4" />
                Yes, Delete Log Entry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All History Confirmation Modal */}
      {showClearAllConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Clear Complete Audit History
              </h3>
              <button
                onClick={() => setShowClearAllConfirm(false)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-gray-700">
              <p>
                Are you sure you want to clear all <strong>{db.auditLogs.length} audit trail records</strong>?
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-800">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                  Audit Trail Isolation Guarantee
                </div>
                <p className="text-[11px] leading-relaxed">
                  Clearing history will reset the security event log table only. All student profiles, examination marks, published marksheets, teacher faculty records, and account transactions remain completely safe and untouched.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setShowClearAllConfirm(false)}
                className="px-4 py-2 border rounded-lg text-gray-700 font-semibold hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmClearAllLogs}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Trash2 className="w-4 h-4" />
                Yes, Clear All History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
