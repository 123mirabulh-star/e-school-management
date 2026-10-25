import React, { useState } from 'react';
import {
  Bell,
  Plus,
  Calendar,
  AlertCircle,
  Trash2,
  X,
  UserCheck
} from 'lucide-react';
import { Notice } from '../types';
import { AppDatabase, logAuditAction } from '../services/storage';

interface NoticesViewProps {
  db: AppDatabase;
  onUpdateDb: (updated: AppDatabase) => void;
}

export const NoticesView: React.FC<NoticesViewProps> = ({
  db,
  onUpdateDb
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    contentEn: '',
    targetAudience: 'All' as 'All' | 'Students' | 'Teachers' | 'Guardians',
    priority: 'normal' as 'normal' | 'important' | 'urgent'
  });

  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    const newNotice: Notice = {
      id: `ntc-${Date.now()}`,
      title: formData.title,
      contentEn: formData.contentEn,
      publishDate: new Date().toISOString().split('T')[0],
      targetAudience: formData.targetAudience,
      priority: formData.priority,
      publishedBy: db.currentUser ? `${db.currentUser.fullName} (${db.currentUser.role})` : 'School Admin'
    };

    let updatedDb: AppDatabase = {
      ...db,
      notices: [newNotice, ...db.notices]
    };

    updatedDb = logAuditAction(
      updatedDb,
      'PUBLISH_NOTICE',
      `Published notice: "${newNotice.title}" (Audience: ${newNotice.targetAudience})`
    );

    onUpdateDb(updatedDb);
    setIsCreating(false);
    setFormData({
      title: '',
      contentEn: '',
      targetAudience: 'All',
      priority: 'normal'
    });
  };

  const handleDeleteNotice = (id: string, title: string) => {
    if (!confirm(`Delete notice "${title}"?`)) return;
    const updated = db.notices.filter(n => n.id !== id);
    let updatedDb: AppDatabase = { ...db, notices: updated };
    updatedDb = logAuditAction(updatedDb, 'DELETE_NOTICE', `Deleted notice: ${title}`);
    onUpdateDb(updatedDb);
  };

  return (
    <div className="space-y-5">
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-500" />
            Notice Board & Official Circulars
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Institutional announcements, exam schedules, and holiday notifications for staff, students, and guardians.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Publish Notice
        </button>
      </div>

      {/* Notice Cards List */}
      <div className="space-y-4">
        {db.notices.map(notice => (
          <div
            key={notice.id}
            className={`bg-white rounded-xl border p-5 shadow-2xs space-y-3 transition-all ${
              notice.priority === 'urgent'
                ? 'border-l-4 border-l-red-500 border-gray-200'
                : notice.priority === 'important'
                ? 'border-l-4 border-l-amber-500 border-gray-200'
                : 'border-l-4 border-l-blue-500 border-gray-200'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-2">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    notice.priority === 'urgent'
                      ? 'bg-red-100 text-red-800'
                      : notice.priority === 'important'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {notice.priority}
                </span>
                <h4 className="text-sm font-bold text-gray-900">{notice.title}</h4>
              </div>

              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="font-mono">{notice.publishDate}</span>
                <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[11px] font-medium">
                  Audience: {notice.targetAudience}
                </span>
                <button
                  onClick={() => handleDeleteNotice(notice.id, notice.title)}
                  className="text-red-500 hover:text-red-700 p-1"
                  title="Delete notice"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              {notice.contentEn && (
                <div className="p-3 bg-gray-50 rounded-lg text-gray-700 leading-relaxed">
                  {notice.contentEn}
                </div>
              )}
            </div>

            <div className="text-[11px] text-gray-400 text-right">
              Published by: {notice.publishedBy}
            </div>
          </div>
        ))}
      </div>

      {/* Publish Notice Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-sm font-bold text-gray-900">Publish New Notice</h3>
              <button onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNotice} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Notice Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Schedule for Revision Classes"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border rounded-lg p-2 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Target Audience</label>
                  <select
                    value={formData.targetAudience}
                    onChange={e => setFormData({ ...formData, targetAudience: e.target.value as any })}
                    className="w-full border rounded-lg p-2"
                  >
                    <option value="All">All School</option>
                    <option value="Students">Students Only</option>
                    <option value="Teachers">Teachers & Faculty</option>
                    <option value="Guardians">Guardians & Parents</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Priority Level</label>
                  <select
                    value={formData.priority}
                    onChange={e => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full border rounded-lg p-2"
                  >
                    <option value="normal">Normal</option>
                    <option value="important">Important</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Notice Details / Body Content *
                </label>
                <textarea
                  rows={4}
                  placeholder="Enter notice details, instructions, schedule, or institutional announcement..."
                  value={formData.contentEn}
                  onChange={e => setFormData({ ...formData, contentEn: e.target.value })}
                  className="w-full border rounded-lg p-2 text-sm"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 border rounded-lg text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-sm"
                >
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
