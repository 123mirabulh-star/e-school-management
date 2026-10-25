import React, { useState } from 'react';
import {
  Building,
  Save,
  CheckCircle2,
  Calendar,
  Plus,
  Trash2,
  AlertTriangle,
  RotateCcw,
  Check,
  Upload,
  Image as ImageIcon,
  Sliders,
  X
} from 'lucide-react';
import { SchoolSettings, AcademicYear, MarksheetSettings } from '../types';
import { AppDatabase, logAuditAction } from '../services/storage';
import { MarksheetSettingsModal } from './MarksheetSettingsModal';
import { DEFAULT_MARKSHEET_SETTINGS } from '../data/initialData';

interface SchoolSettingsViewProps {
  db: AppDatabase;
  onUpdateDb: (updated: AppDatabase) => void;
}

export const SchoolSettingsView: React.FC<SchoolSettingsViewProps> = ({
  db,
  onUpdateDb
}) => {
  const [settings, setSettings] = useState<SchoolSettings>({ ...db.schoolSettings });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isMarksheetModalOpen, setIsMarksheetModalOpen] = useState(false);

  // New Academic Session state (Requirement 9)
  const [newSessionYear, setNewSessionYear] = useState('');
  const [sessionSuccess, setSessionSuccess] = useState('');

  // Clear data state (Requirement 4)
  const [showClearModal, setShowClearModal] = useState(false);

  // Logo upload handler (Requirement 1)
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert('Logo file size exceeds 3MB limit. Please upload a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Url = reader.result as string;
      setSettings(prev => ({ ...prev, logoUrl: base64Url }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setSettings(prev => ({ ...prev, logoUrl: '' }));
  };

  const handleSaveMarksheetSettings = (mSettings: MarksheetSettings) => {
    const updatedSettings = {
      ...settings,
      marksheetSettings: mSettings
    };
    setSettings(updatedSettings);
    let updatedDb: AppDatabase = {
      ...db,
      schoolSettings: updatedSettings
    };
    updatedDb = logAuditAction(
      updatedDb,
      'UPDATE_MARKSHEET_SETTINGS',
      'Updated custom marksheet design and print settings.'
    );
    onUpdateDb(updatedDb);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let updatedDb: AppDatabase = {
      ...db,
      schoolSettings: settings
    };

    updatedDb = logAuditAction(
      updatedDb,
      'UPDATE_SCHOOL_SETTINGS',
      `Updated institutional configuration: ${settings.nameEn} (EIIN: ${settings.eiin})`
    );

    onUpdateDb(updatedDb);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Add a new Academic Session (Requirement 9)
  const handleAddSession = (e: React.FormEvent) => {
    e.preventDefault();
    const year = newSessionYear.trim();
    if (!year) return;

    if (db.academicYears.some(ay => ay.year === year)) {
      alert(`Academic Session ${year} already exists.`);
      return;
    }

    const newYearObj: AcademicYear = {
      id: `year-${year}`,
      year: year,
      isCurrent: false
    };

    const updatedDb = logAuditAction(
      {
        ...db,
        academicYears: [...db.academicYears, newYearObj]
      },
      'ADD_ACADEMIC_SESSION',
      `Added new academic session ${year}`
    );

    onUpdateDb(updatedDb);
    setNewSessionYear('');
    setSessionSuccess(`Session ${year} added successfully!`);
    setTimeout(() => setSessionSuccess(''), 3000);
  };

  const handleSetActiveSession = (year: string) => {
    const updatedYears = db.academicYears.map(ay => ({
      ...ay,
      isCurrent: ay.year === year
    }));

    const updatedSettings = {
      ...settings,
      currentAcademicYear: year
    };
    setSettings(updatedSettings);

    const updatedDb = logAuditAction(
      {
        ...db,
        academicYears: updatedYears,
        schoolSettings: updatedSettings
      },
      'SET_ACTIVE_SESSION',
      `Switched active academic session to ${year}`
    );

    onUpdateDb(updatedDb);
  };

  // Clear all sample data to start fresh (Requirement 4: data null রাখবে admin তার প্রতিষ্ঠানের উপর ভিত্তি করে data Entry করবে)
  const handleClearAllSampleData = () => {
    const updatedDb: AppDatabase = {
      ...db,
      students: [],
      marks: [],
      results: [],
      examinations: [],
      feePayments: [],
      transactions: [],
      notices: [],
      schoolSettings: {
        ...settings,
        nameEn: 'My Institution Name',
        eiin: '',
        instituteCode: '',
        phone: '',
        email: '',
        address: ''
      }
    };

    const audited = logAuditAction(
      updatedDb,
      'INITIALIZE_BLANK_DATABASE',
      'Cleared all sample students, marks, exams, and payments. Database initialized blank for fresh institutional data entry.'
    );

    onUpdateDb(audited);
    setSettings(updatedDb.schoolSettings);
    setShowClearModal(false);
    alert('All sample records cleared! The system is now completely clean and ready for your institution data entry.');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-xs">
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Building className="w-5 h-5 text-blue-600" />
            School Profile & Academic Configuration
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure institutional details, add academic sessions, and manage database state.
          </p>
        </div>

        {/* Clear Data Button for Fresh Setup (Requirement 4) */}
        <button
          type="button"
          onClick={() => setShowClearModal(true)}
          className="bg-red-50 hover:bg-red-100 text-red-700 font-bold px-3.5 py-2 rounded-xl border border-red-300 flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <RotateCcw className="w-4 h-4 text-red-600" />
          <span>Clear Sample Data (Blank Setup)</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3 rounded-xl font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>School configuration saved successfully!</span>
        </div>
      )}

      {/* SECTION A: ACADEMIC SESSIONS MANAGEMENT (Requirement 9) */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-600" />
              Academic Sessions & Year Management
            </h4>
            <p className="text-gray-500 text-[11px]">
              Add new academic years/sessions (e.g. 2026, 2027, 2028) and select the active current session.
            </p>
          </div>
          <span className="font-mono text-xs bg-blue-100 text-blue-900 font-bold px-2.5 py-1 rounded-lg">
            Active: Session {settings.currentAcademicYear}
          </span>
        </div>

        {sessionSuccess && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{sessionSuccess}</span>
          </div>
        )}

        {/* Existing Sessions List */}
        <div className="flex flex-wrap gap-2">
          {db.academicYears.map(ay => (
            <div
              key={ay.id}
              className={`p-3 rounded-xl border flex items-center gap-2 transition-all ${
                ay.year === settings.currentAcademicYear
                  ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                  : 'bg-gray-50 text-gray-800 border-gray-300 hover:bg-gray-100'
              }`}
            >
              <span className="font-bold font-mono text-sm">Session {ay.year}</span>
              {ay.year === settings.currentAcademicYear ? (
                <span className="bg-white text-blue-900 text-[10px] font-black px-1.5 py-0.5 rounded">
                  Current
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSetActiveSession(ay.year)}
                  className="text-[10px] bg-white border border-gray-300 text-gray-700 hover:bg-blue-50 hover:text-blue-700 font-bold px-2 py-0.5 rounded cursor-pointer transition-colors"
                >
                  Set Active
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add New Session Form */}
        <form onSubmit={handleAddSession} className="flex gap-2 pt-2 border-t">
          <input
            type="text"
            required
            placeholder="Enter New Academic Session (e.g. 2027, 2028)"
            value={newSessionYear}
            onChange={e => setNewSessionYear(e.target.value)}
            className="flex-1 bg-gray-50 border border-gray-300 rounded-xl p-2 font-mono font-bold"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Session</span>
          </button>
        </form>
      </div>

      {/* SECTION B: INSTITUTIONAL PROFILE FORM */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-6">
        {/* Institutional Logo & Custom Marksheet Design (Requirement 1 & 3) */}
        <div className="bg-gradient-to-r from-blue-50/70 to-indigo-50/70 p-5 rounded-2xl border border-blue-200 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-white border-2 border-dashed border-blue-300 flex items-center justify-center overflow-hidden shrink-0 shadow-sm relative group">
                {settings.logoUrl ? (
                  <img
                    src={settings.logoUrl}
                    alt="School Logo"
                    className="w-full h-full object-contain p-1"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="text-center p-2">
                    <Building className="w-8 h-8 text-blue-400 mx-auto" />
                    <span className="text-[9px] text-blue-600 font-bold block mt-0.5">No Logo</span>
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-blue-600" />
                  <span>Institutional Logo (Optional)</span>
                </h4>
                <p className="text-[11px] text-gray-600 mt-0.5">
                  Upload your school's official logo. It will appear on marksheets, tabulation sheets, and reports.
                </p>

                <div className="flex items-center gap-2 mt-2">
                  <label className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Logo Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoUpload}
                    />
                  </label>

                  {settings.logoUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="bg-white border border-red-300 text-red-600 hover:bg-red-50 text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer"
                    >
                      Remove Logo
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Marksheet Settings Trigger */}
            <div className="sm:border-l sm:pl-4 border-blue-200 text-center sm:text-right shrink-0">
              <button
                type="button"
                onClick={() => setIsMarksheetModalOpen(true)}
                className="bg-white hover:bg-blue-50 text-blue-800 font-bold text-xs px-4 py-2 rounded-xl border border-blue-300 flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <Sliders className="w-4 h-4 text-blue-600" />
                <span>Marksheet Design & Layout</span>
              </button>
              <span className="text-[10px] text-blue-600 block mt-1">
                Customize titles, signatures & layout
              </span>
            </div>
          </div>
        </div>

        {/* Basic Identity */}
        <div className="space-y-3">
          <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[11px] border-b pb-1">
            1. Institutional Identity
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Institution Name *
              </label>
              <input
                type="text"
                required
                value={settings.nameEn}
                onChange={e => setSettings({ ...settings, nameEn: e.target.value })}
                className="w-full border rounded-lg p-2 font-bold text-gray-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Institution Short Code
              </label>
              <input
                type="text"
                required
                value={settings.instituteCode}
                onChange={e => setSettings({ ...settings, instituteCode: e.target.value })}
                className="w-full border rounded-lg p-2 font-bold text-blue-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1 font-mono">
                EIIN Identifier *
              </label>
              <input
                type="text"
                required
                value={settings.eiin}
                onChange={e => setSettings({ ...settings, eiin: e.target.value })}
                className="w-full border rounded-lg p-2 font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Education Board
              </label>
              <input
                type="text"
                value={settings.boardName}
                onChange={e => setSettings({ ...settings, boardName: e.target.value })}
                className="w-full border rounded-lg p-2"
              />
            </div>
          </div>
        </div>

        {/* Contact and Location */}
        <div className="space-y-3">
          <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[11px] border-b pb-1">
            2. Contact & Address
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-gray-700 mb-1">
                Full Campus Address
              </label>
              <input
                type="text"
                value={settings.address}
                onChange={e => setSettings({ ...settings, address: e.target.value })}
                className="w-full border rounded-lg p-2"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Official Phone Numbers
              </label>
              <input
                type="text"
                value={settings.phone}
                onChange={e => setSettings({ ...settings, phone: e.target.value })}
                className="w-full border rounded-lg p-2 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={settings.email}
                onChange={e => setSettings({ ...settings, email: e.target.value })}
                className="w-full border rounded-lg p-2"
              />
            </div>
          </div>
        </div>

        {/* Principal and Signatures */}
        <div className="space-y-3">
          <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[11px] border-b pb-1">
            3. Headmaster / Principal Information
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Principal Name
              </label>
              <input
                type="text"
                value={settings.principalName}
                onChange={e => setSettings({ ...settings, principalName: e.target.value })}
                className="w-full border rounded-lg p-2 font-semibold"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Currency & Timezone
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  disabled
                  value={settings.currency}
                  className="bg-gray-100 border rounded-lg p-2 font-bold"
                />
                <input
                  type="text"
                  disabled
                  value={settings.timezone}
                  className="bg-gray-100 border rounded-lg p-2 font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Save Institutional Settings
          </button>
        </div>
      </form>

      {/* Clear Database Modal (Requirement 4) */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-4 text-xs">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-gray-900">Initialize Blank Database?</h3>
              <p className="text-gray-600 mt-1">
                This will clear all sample students, examination marks, fee collections, and notices so you can enter your institution's data completely from scratch.
              </p>
              <p className="text-red-600 font-bold mt-2">
                Your login credentials, classes, and sections will be preserved.
              </p>
            </div>
            <div className="flex justify-center gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setShowClearModal(false)}
                className="px-4 py-2 border rounded-xl text-gray-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearAllSampleData}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-xs"
              >
                Yes, Clear All Sample Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Marksheet Design Customizer Modal (Requirement 3) */}
      <MarksheetSettingsModal
        isOpen={isMarksheetModalOpen}
        onClose={() => setIsMarksheetModalOpen(false)}
        currentSettings={settings.marksheetSettings || DEFAULT_MARKSHEET_SETTINGS}
        schoolSettings={settings}
        onSave={handleSaveMarksheetSettings}
      />
    </div>
  );
};
