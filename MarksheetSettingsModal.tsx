import React, { useState } from 'react';
import {
  X,
  Save,
  Palette,
  Eye,
  Sliders,
  FileText,
  RotateCcw,
  CheckCircle2,
  Building,
  Table,
  Layers,
  FileCheck
} from 'lucide-react';
import { MarksheetSettings, SchoolSettings } from '../types';
import { DEFAULT_MARKSHEET_SETTINGS } from '../data/initialData';

interface MarksheetSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: MarksheetSettings;
  schoolSettings: SchoolSettings;
  onSave: (settings: MarksheetSettings) => void;
}

export const MarksheetSettingsModal: React.FC<MarksheetSettingsModalProps> = ({
  isOpen,
  onClose,
  currentSettings,
  schoolSettings,
  onSave
}) => {
  const [settings, setSettings] = useState<MarksheetSettings>({
    ...DEFAULT_MARKSHEET_SETTINGS,
    ...currentSettings
  });
  const [activeSubTab, setActiveSubTab] = useState<'branding' | 'table' | 'signatures' | 'preview'>('branding');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleReset = () => {
    if (confirm('Reset marksheet layout to official standard defaults?')) {
      setSettings(DEFAULT_MARKSHEET_SETTINGS);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(settings);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden text-xs">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-yellow-400" />
            <div>
              <h3 className="text-base font-bold text-white">
                Marksheet Design & Layout Settings
              </h3>
              <p className="text-[11px] text-blue-200">
                Customize institution header, table breakdown, grading scale, signatures, and print format.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center border-b border-gray-200 bg-gray-50 px-4 pt-2 gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab('branding')}
            className={`px-3 py-2 font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeSubTab === 'branding'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Header & Branding</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('table')}
            className={`px-3 py-2 font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeSubTab === 'table'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Table Layout & Content</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('signatures')}
            className={`px-3 py-2 font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeSubTab === 'signatures'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Signatures & Footer</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('preview')}
            className={`px-3 py-2 font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeSubTab === 'preview'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-blue-600" />
            <span>Live Document Preview</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {savedSuccess && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3 rounded-xl font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Marksheet design settings saved successfully!</span>
            </div>
          )}

          {/* TAB 1: HEADER & BRANDING */}
          {activeSubTab === 'branding' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Transcript Header Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={settings.headerTitle}
                    onChange={e => setSettings({ ...settings, headerTitle: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2 font-bold"
                    placeholder="e.g. Academic Transcript & Mark Sheet"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Subtitle / Assessment Note
                  </label>
                  <input
                    type="text"
                    value={settings.headerSubtitle}
                    onChange={e => setSettings({ ...settings, headerSubtitle: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2"
                    placeholder="e.g. Official Student Evaluation Record"
                  />
                </div>
              </div>

              {/* Accent Color & Border Style */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Theme Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.themeColor}
                      onChange={e => setSettings({ ...settings, themeColor: e.target.value })}
                      className="w-9 h-9 rounded-lg border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.themeColor}
                      onChange={e => setSettings({ ...settings, themeColor: e.target.value })}
                      className="w-24 border border-gray-300 rounded-lg p-1.5 font-mono text-center font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Document Border Style
                  </label>
                  <select
                    value={settings.borderStyle}
                    onChange={e => setSettings({ ...settings, borderStyle: e.target.value as any })}
                    className="w-full border border-gray-300 rounded-lg p-2 bg-white"
                  >
                    <option value="formal">Formal Academic (Double Border)</option>
                    <option value="modern">Modern Clean (Soft Rounded)</option>
                    <option value="classic">Classic Heavy Line</option>
                    <option value="minimal">Minimal Borderless</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Text Font Density
                  </label>
                  <select
                    value={settings.fontSize}
                    onChange={e => setSettings({ ...settings, fontSize: e.target.value as any })}
                    className="w-full border border-gray-300 rounded-lg p-2 bg-white"
                  >
                    <option value="compact">Compact (Dense fit on single A4)</option>
                    <option value="normal">Normal (Standard A4 layout)</option>
                    <option value="spacious">Spacious (Large text)</option>
                  </select>
                </div>
              </div>

              {/* Visibility Checkboxes */}
              <div className="space-y-2 bg-blue-50/50 p-4 rounded-xl border border-blue-200">
                <span className="font-bold text-gray-900 block mb-2 uppercase text-[10px] tracking-wider">
                  Header Elements Visibility:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-800">
                    <input
                      type="checkbox"
                      checked={settings.showLogo}
                      onChange={e => setSettings({ ...settings, showLogo: e.target.checked })}
                      className="rounded text-blue-600 w-4 h-4"
                    />
                    <span>Show School Logo</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-800">
                    <input
                      type="checkbox"
                      checked={settings.showSchoolAddress}
                      onChange={e => setSettings({ ...settings, showSchoolAddress: e.target.checked })}
                      className="rounded text-blue-600 w-4 h-4"
                    />
                    <span>Show Campus Address</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-800">
                    <input
                      type="checkbox"
                      checked={settings.showInstituteCode}
                      onChange={e => setSettings({ ...settings, showInstituteCode: e.target.checked })}
                      className="rounded text-blue-600 w-4 h-4"
                    />
                    <span>Show Institute Code</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-800">
                    <input
                      type="checkbox"
                      checked={settings.showEiin}
                      onChange={e => setSettings({ ...settings, showEiin: e.target.checked })}
                      className="rounded text-blue-600 w-4 h-4"
                    />
                    <span>Show EIIN Number</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-800">
                    <input
                      type="checkbox"
                      checked={settings.showBoardName}
                      onChange={e => setSettings({ ...settings, showBoardName: e.target.checked })}
                      className="rounded text-blue-600 w-4 h-4"
                    />
                    <span>Show Education Board</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TABLE LAYOUT & CONTENT */}
          {activeSubTab === 'table' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Student Info Card Columns
                  </label>
                  <select
                    value={settings.studentInfoColumns}
                    onChange={e => setSettings({ ...settings, studentInfoColumns: Number(e.target.value) as 2 | 3 })}
                    className="w-full border border-gray-300 rounded-lg p-2 bg-white"
                  >
                    <option value={2}>2 Columns (Name, Class, Section, Roll)</option>
                    <option value={3}>3 Columns (Includes DOB & Student ID)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Target Paper Size
                  </label>
                  <select
                    value={settings.pageSize}
                    onChange={e => setSettings({ ...settings, pageSize: e.target.value as any })}
                    className="w-full border border-gray-300 rounded-lg p-2 bg-white"
                  >
                    <option value="A4">A4 (Standard Bangladesh Board)</option>
                    <option value="Letter">US Letter</option>
                  </select>
                </div>
              </div>

              {/* Table Columns Toggles */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                <span className="font-bold text-gray-900 block uppercase text-[10px] tracking-wider">
                  Marksheet Table Detail Elements:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-800">
                    <input
                      type="checkbox"
                      checked={settings.showComponentBreakdown}
                      onChange={e => setSettings({ ...settings, showComponentBreakdown: e.target.checked })}
                      className="rounded text-blue-600 w-4 h-4"
                    />
                    <span>Show Detailed Breakdown Columns (CQ, MCQ, Practical)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-800">
                    <input
                      type="checkbox"
                      checked={settings.showGradePoint}
                      onChange={e => setSettings({ ...settings, showGradePoint: e.target.checked })}
                      className="rounded text-blue-600 w-4 h-4"
                    />
                    <span>Show Grade Point (GP) Column in Subject Rows</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-800">
                    <input
                      type="checkbox"
                      checked={settings.showResultStatus}
                      onChange={e => setSettings({ ...settings, showResultStatus: e.target.checked })}
                      className="rounded text-blue-600 w-4 h-4"
                    />
                    <span>Show PASSED / FAILED Status Badge & Merit Position</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-800">
                    <input
                      type="checkbox"
                      checked={settings.showGradingScaleTable}
                      onChange={e => setSettings({ ...settings, showGradingScaleTable: e.target.checked })}
                      className="rounded text-blue-600 w-4 h-4"
                    />
                    <span>Include Official Board Grading Scale Legend (80+=A+, etc.)</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SIGNATURES & FOOTER */}
          {activeSubTab === 'signatures' && (
            <div className="space-y-4">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-900">
                <input
                  type="checkbox"
                  checked={settings.showSignatures}
                  onChange={e => setSettings({ ...settings, showSignatures: e.target.checked })}
                  className="rounded text-blue-600 w-4 h-4"
                />
                <span>Enable Official Signatures Block</span>
              </label>

              {settings.showSignatures && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Left Signature Title
                    </label>
                    <input
                      type="text"
                      value={settings.signature1Title}
                      onChange={e => setSettings({ ...settings, signature1Title: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg p-2 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Center Signature Title
                    </label>
                    <input
                      type="text"
                      value={settings.signature2Title}
                      onChange={e => setSettings({ ...settings, signature2Title: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg p-2 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Right Signature Title
                    </label>
                    <input
                      type="text"
                      value={settings.signature3Title}
                      onChange={e => setSettings({ ...settings, signature3Title: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg p-2 font-bold"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Footer Legal & Computerized Verification Note
                </label>
                <textarea
                  rows={2}
                  value={settings.footerRemarksText}
                  onChange={e => setSettings({ ...settings, footerRemarksText: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2 text-xs"
                />
              </div>
            </div>
          )}

          {/* TAB 4: LIVE PREVIEW */}
          {activeSubTab === 'preview' && (
            <div className="bg-gray-100 p-4 rounded-xl border border-gray-300 overflow-x-auto">
              <div
                className={`bg-white mx-auto shadow-lg p-6 max-w-xl ${
                  settings.borderStyle === 'formal'
                    ? 'border-4 border-double border-gray-800'
                    : settings.borderStyle === 'modern'
                    ? 'border-2 border-blue-600 rounded-xl'
                    : settings.borderStyle === 'classic'
                    ? 'border-2 border-gray-900'
                    : 'border border-gray-300'
                }`}
              >
                {/* School Header */}
                <div className="text-center border-b pb-3 mb-3">
                  {settings.showLogo && schoolSettings.logoUrl && (
                    <img
                      src={schoolSettings.logoUrl}
                      alt="Logo"
                      className="w-12 h-12 mx-auto mb-1 object-contain"
                    />
                  )}
                  <h2 className="text-base font-extrabold uppercase" style={{ color: settings.themeColor }}>
                    {schoolSettings.nameEn}
                  </h2>
                  {settings.showSchoolAddress && (
                    <p className="text-[10px] text-gray-600">{schoolSettings.address}</p>
                  )}
                  <div className="text-[9px] text-gray-500 flex justify-center gap-2 mt-0.5">
                    {settings.showEiin && <span>EIIN: {schoolSettings.eiin || '108245'}</span>}
                    {settings.showInstituteCode && <span>Code: {schoolSettings.instituteCode || 'DH-4412'}</span>}
                    {settings.showBoardName && <span>Board: {schoolSettings.boardName || 'Dhaka'}</span>}
                  </div>
                  <div
                    className="inline-block mt-2 px-3 py-0.5 rounded-full text-white font-bold text-[10px] uppercase tracking-wider"
                    style={{ backgroundColor: settings.themeColor }}
                  >
                    {settings.headerTitle}
                  </div>
                </div>

                {/* Student Info Box */}
                <div className="bg-gray-50 border p-2.5 rounded-md mb-3 grid grid-cols-2 text-[10.5px]">
                  <div>
                    <p><strong>Student Name:</strong> Rahim Ahmed</p>
                    <p><strong>Class & Section:</strong> Class 10 (Section A)</p>
                  </div>
                  <div>
                    <p><strong>Roll Number:</strong> #01</p>
                    <p><strong>Session Year:</strong> {schoolSettings.currentAcademicYear}</p>
                  </div>
                </div>

                {/* Sample Mark Table */}
                <table className="w-full text-[10px] border-collapse mb-3">
                  <thead>
                    <tr className="bg-gray-100 border">
                      <th className="p-1 border text-center">Code</th>
                      <th className="p-1 border text-left">Subject</th>
                      <th className="p-1 border text-center">Full</th>
                      {settings.showComponentBreakdown && (
                        <>
                          <th className="p-1 border text-center">CQ</th>
                          <th className="p-1 border text-center">MCQ</th>
                        </>
                      )}
                      <th className="p-1 border text-center">Total</th>
                      <th className="p-1 border text-center">Grade</th>
                      {settings.showGradePoint && <th className="p-1 border text-center">GP</th>}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border">
                      <td className="p-1 border text-center">101</td>
                      <td className="p-1 border font-medium">Bangla 1st Paper</td>
                      <td className="p-1 border text-center">100</td>
                      {settings.showComponentBreakdown && (
                        <>
                          <td className="p-1 border text-center">58</td>
                          <td className="p-1 border text-center">26</td>
                        </>
                      )}
                      <td className="p-1 border text-center font-bold">84</td>
                      <td className="p-1 border text-center font-bold text-emerald-700">A+</td>
                      {settings.showGradePoint && <td className="p-1 border text-center font-bold">5.00</td>}
                    </tr>
                    <tr className="border">
                      <td className="p-1 border text-center">107</td>
                      <td className="p-1 border font-medium">English 1st Paper</td>
                      <td className="p-1 border text-center">100</td>
                      {settings.showComponentBreakdown && (
                        <>
                          <td className="p-1 border text-center">62</td>
                          <td className="p-1 border text-center">20</td>
                        </>
                      )}
                      <td className="p-1 border text-center font-bold">82</td>
                      <td className="p-1 border text-center font-bold text-emerald-700">A+</td>
                      {settings.showGradePoint && <td className="p-1 border text-center font-bold">5.00</td>}
                    </tr>
                  </tbody>
                </table>

                {/* Result Summary Bar */}
                <div className="p-2 bg-blue-50/70 border border-blue-200 rounded flex justify-between items-center text-[11px] mb-4">
                  <div>
                    <span className="font-bold">Total Marks: 166 / 200</span>
                    {settings.showResultStatus && (
                      <span className="ml-2 font-bold px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                        PASSED (Merit #1)
                      </span>
                    )}
                  </div>
                  <div className="font-extrabold text-blue-900 text-sm">
                    GPA: 5.00 (A+)
                  </div>
                </div>

                {/* Signatures */}
                {settings.showSignatures && (
                  <div className="grid grid-cols-3 pt-6 border-t text-[9px] text-gray-600 text-center">
                    <div>
                      <div className="w-24 border-b border-gray-400 mx-auto mb-1"></div>
                      <span>{settings.signature1Title}</span>
                    </div>
                    <div>
                      <div className="w-24 border-b border-gray-400 mx-auto mb-1"></div>
                      <span>{settings.signature2Title}</span>
                    </div>
                    <div>
                      <div className="w-24 border-b border-gray-400 mx-auto mb-1"></div>
                      <span>{settings.signature3Title}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="text-gray-600 hover:text-red-600 font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 hover:border-red-300 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Marksheet Design</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
