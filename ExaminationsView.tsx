import React, { useState } from 'react';
import {
  FileCheck2,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  Award,
  X,
  FileSpreadsheet,
  Upload,
  Download,
  AlertCircle,
  Check,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { Examination, ExamStatus } from '../types';
import { AppDatabase, logAuditAction } from '../services/storage';
import { downloadCsv } from '../utils/downloadHelper';

interface ExaminationsViewProps {
  db: AppDatabase;
  onUpdateDb: (updated: AppDatabase) => void;
  onNavigateToMarksEntry: () => void;
}

export const ExaminationsView: React.FC<ExaminationsViewProps> = ({
  db,
  onUpdateDb,
  onNavigateToMarksEntry
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    academicYear: db.schoolSettings.currentAcademicYear,
    classId: db.classes[0]?.id || 'c10',
    term: 'half_yearly' as 'half_yearly' | 'annual' | 'model_test' | 'pre_test' | 'class_test',
    startDate: '2026-06-10',
    endDate: '2026-06-25',
    weightPercentage: 40
  });

  // Bulk Excel/CSV Import state (Requirement 10)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [parsedImportExams, setParsedImportExams] = useState<Partial<Examination>[]>([]);
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');

  const handleDownloadExamTemplateCsv = () => {
    const headers = [
      'Examination Name',
      'Term (half_yearly/annual/model_test/pre_test/class_test)',
      'Academic Session Year',
      'Class Name (Optional)',
      'Start Date',
      'End Date',
      'Weight Percentage'
    ];
    const sampleRows = [
      ['1st Semester Examination 2026', 'half_yearly', '2026', 'Class 6', '2026-04-10', '2026-04-25', '25'],
      ['2nd Semester Examination 2026', 'model_test', '2026', 'Class 6', '2026-07-10', '2026-07-25', '25'],
      ['3rd Semester Examination 2026', 'pre_test', '2026', 'Class 6', '2026-09-10', '2026-09-25', '25'],
      ['Annual Final Examination 2026', 'annual', '2026', 'Class 6', '2026-11-15', '2026-11-30', '50']
    ];
    downloadCsv('Examination_Import_Template', headers, sampleRows);
  };

  const handleParseExamCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError('');
    setImportSuccess('');

    const reader = new FileReader();
    reader.onload = evt => {
      const text = (evt.target?.result as string) || '';
      const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
      if (lines.length < 2) {
        setImportError('File must contain a header row and at least one examination data row.');
        return;
      }

      const rows: Partial<Examination>[] = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map(p => p.trim().replace(/^"|"$/g, ''));
        if (parts.length >= 1 && parts[0]) {
          const name = parts[0];
          const term = (parts[1]?.toLowerCase() || 'half_yearly') as any;
          const year = parts[2] || db.schoolSettings.currentAcademicYear;
          const className = parts[3] || '';
          const sDate = parts[4] || '2026-06-01';
          const eDate = parts[5] || '2026-06-20';
          const weight = parseInt(parts[6]) || 40;

          const matchedClass = db.classes.find(
            c => c.nameEn.toLowerCase() === className.toLowerCase() ||
                 c.nameEn.toLowerCase().includes(className.toLowerCase())
          ) || db.classes[0];

          rows.push({
            name,
            term,
            academicYear: year,
            classId: matchedClass?.id || 'c10',
            startDate: sDate,
            endDate: eDate,
            weightPercentage: weight,
            status: 'marks_entry',
            isPublished: false
          });
        }
      }

      setParsedImportExams(rows);
    };

    reader.readAsText(file);
  };

  const handleConfirmExamImport = () => {
    if (parsedImportExams.length === 0) return;

    const newExams: Examination[] = parsedImportExams.map((r, i) => ({
      id: `exam-${Date.now()}-${i}`,
      name: r.name || 'Examination',
      academicYear: r.academicYear || db.schoolSettings.currentAcademicYear,
      classId: r.classId || db.classes[0]?.id || 'c10',
      term: r.term || 'half_yearly',
      startDate: r.startDate || '2026-06-10',
      endDate: r.endDate || '2026-06-25',
      status: 'marks_entry',
      weightPercentage: r.weightPercentage || 40,
      isPublished: false
    }));

    const updatedDb = logAuditAction(
      {
        ...db,
        examinations: [...db.examinations, ...newExams]
      },
      'BULK_EXAM_IMPORT',
      `Imported ${newExams.length} examinations via Excel/CSV file upload.`
    );

    onUpdateDb(updatedDb);
    setImportSuccess(`Successfully imported ${newExams.length} examinations!`);
    setParsedImportExams([]);
    setTimeout(() => {
      setIsImportModalOpen(false);
      setImportSuccess('');
    }, 1500);
  };

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const newExam: Examination = {
      id: `exam-${Date.now()}`,
      name: formData.name.trim(),
      academicYear: formData.academicYear,
      classId: formData.classId,
      term: formData.term,
      startDate: formData.startDate,
      endDate: formData.endDate,
      status: 'marks_entry',
      weightPercentage: Number(formData.weightPercentage),
      isPublished: false
    };

    let updatedDb: AppDatabase = {
      ...db,
      examinations: [newExam, ...db.examinations]
    };

    updatedDb = logAuditAction(
      updatedDb,
      'CREATE_EXAMINATION',
      `Created examination schedule: ${newExam.name} (${newExam.academicYear}, Term: ${newExam.term})`
    );

    onUpdateDb(updatedDb);
    setIsCreating(false);
    setFormData({
      name: '',
      academicYear: db.schoolSettings.currentAcademicYear,
      classId: db.classes[0]?.id || 'c10',
      term: 'half_yearly',
      startDate: '2026-06-10',
      endDate: '2026-06-25',
      weightPercentage: 40
    });
  };

  const handleTogglePublish = (exam: Examination) => {
    const updated = db.examinations.map(e =>
      e.id === exam.id ? { ...e, isPublished: !e.isPublished } : e
    );

    let updatedDb: AppDatabase = { ...db, examinations: updated };
    updatedDb = logAuditAction(
      updatedDb,
      exam.isPublished ? 'UNPUBLISH_EXAM' : 'PUBLISH_EXAM',
      `${exam.isPublished ? 'Withdrew publication of' : 'Officially published'} ${exam.name}`
    );

    onUpdateDb(updatedDb);
  };

  const [deleteExamTarget, setDeleteExamTarget] = useState<Examination | null>(null);
  const [bannerMsg, setBannerMsg] = useState('');

  const handleConfirmDeleteExam = () => {
    if (!deleteExamTarget) return;

    const examToDelete = deleteExamTarget;
    const remainingExams = db.examinations.filter(e => e.id !== examToDelete.id);
    const remainingMarks = db.marks.filter(m => m.examId !== examToDelete.id);
    const remainingResults = db.results.filter(r => r.examId !== examToDelete.id);

    let updatedDb: AppDatabase = {
      ...db,
      examinations: remainingExams,
      marks: remainingMarks,
      results: remainingResults
    };

    updatedDb = logAuditAction(
      updatedDb,
      'DELETE_EXAMINATION',
      `Deleted examination schedule: ${examToDelete.name} (${examToDelete.academicYear}, Term: ${examToDelete.term})`
    );

    onUpdateDb(updatedDb);
    setDeleteExamTarget(null);
    setBannerMsg(`Examination "${examToDelete.name}" deleted successfully.`);
    setTimeout(() => setBannerMsg(''), 3500);
  };

  return (
    <div className="space-y-5">
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-blue-600" />
            Examinations & Academic Terms Management
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure term exams, semesters, model tests, and final examinations. Import exam schedules via Excel.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Excel Import Button (Requirement 10) */}
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 border border-emerald-300 cursor-pointer shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Import Excel / CSV</span>
          </button>

          <button
            onClick={() => setIsCreating(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create Examination
          </button>
        </div>
      </div>

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

      {/* Examinations Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {db.examinations.map(exam => {
          const cls = db.classes.find(c => c.id === exam.classId);
          return (
            <div key={exam.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-gray-900">{exam.name}</h4>
                  <p className="text-[11px] text-gray-500 font-mono mt-0.5">
                    Session: {exam.academicYear} • Class: {cls?.nameEn || 'All Classes'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      exam.status === 'published' || exam.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : exam.status === 'marks_entry'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {exam.status.replace('_', ' ')}
                  </span>
                  <button
                    onClick={() => setDeleteExamTarget(exam)}
                    className="p-1 text-red-600 hover:bg-red-50 hover:text-red-700 rounded transition-colors cursor-pointer border border-transparent hover:border-red-200"
                    title={`Delete examination ${exam.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-2.5 rounded-lg">
                <div>
                  <span className="text-gray-500 block">Exam Term:</span>
                  <strong className="text-gray-900 capitalize">{exam.term.replace('_', ' ')}</strong>
                </div>
                <div>
                  <span className="text-gray-500 block">Weight in Final:</span>
                  <strong className="text-gray-900">{exam.weightPercentage}% Contribution</strong>
                </div>
                <div>
                  <span className="text-gray-500 block">Start Date:</span>
                  <span className="font-mono text-gray-900">{exam.startDate}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">End Date:</span>
                  <span className="font-mono text-gray-900">{exam.endDate}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t text-xs">
                <button
                  onClick={() => handleTogglePublish(exam)}
                  className={`font-semibold cursor-pointer ${
                    exam.isPublished ? 'text-emerald-700 hover:text-emerald-900' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {exam.isPublished ? '✓ Published to Students' : '○ Unpublished'}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDeleteExamTarget(exam)}
                    className="px-2.5 py-1 text-red-600 hover:bg-red-50 border border-red-200 hover:border-red-300 rounded font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                  <button
                    onClick={onNavigateToMarksEntry}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold px-3 py-1.5 rounded-lg border border-blue-200 cursor-pointer"
                  >
                    Enter Student Marks →
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Exam Confirmation Modal */}
      {deleteExamTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Confirm Examination Deletion
              </h3>
              <button
                onClick={() => setDeleteExamTarget(null)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-gray-700">
              <p>
                Are you sure you want to permanently delete the following examination from the academic system?
              </p>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-1">
                <div className="font-bold text-gray-900 text-sm">{deleteExamTarget.name}</div>
                <div className="text-gray-600 font-mono text-[11px]">
                  Academic Session: {deleteExamTarget.academicYear} • Term: {deleteExamTarget.term.replace('_', ' ')}
                </div>
              </div>

              {(() => {
                const linkedMarks = db.marks.filter(m => m.examId === deleteExamTarget.id).length;
                const linkedResults = db.results.filter(r => r.examId === deleteExamTarget.id).length;
                if (linkedMarks > 0 || linkedResults > 0) {
                  return (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-900 space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-amber-800">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        Academic Records Safeguard Warning
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        This examination is currently associated with <strong>{linkedMarks} student marks</strong> and <strong>{linkedResults} calculated results</strong>. Deleting will clean these related records to prevent orphan data in the database.
                      </p>
                    </div>
                  );
                }
                return null;
              })()}

              <p className="text-gray-500 text-[11px]">
                This deletion will be persistently saved and recorded in the system audit logs.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setDeleteExamTarget(null)}
                className="px-4 py-2 border rounded-lg text-gray-700 font-semibold hover:bg-gray-50 cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteExam}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs text-xs"
              >
                <Trash2 className="w-4 h-4" />
                Yes, Delete Examination
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Exam Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-sm font-bold text-gray-900">Create New Examination</h3>
              <button onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExam} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Examination Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1st Semester Examination 2026"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border rounded-lg p-2 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Session Year</label>
                  <select
                    value={formData.academicYear}
                    onChange={e => setFormData({ ...formData, academicYear: e.target.value })}
                    className="w-full border rounded-lg p-2 font-mono font-bold"
                  >
                    {db.academicYears.map(ay => (
                      <option key={ay.id} value={ay.year}>
                        Session {ay.year}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Target Class</label>
                  <select
                    value={formData.classId}
                    onChange={e => setFormData({ ...formData, classId: e.target.value })}
                    className="w-full border rounded-lg p-2"
                  >
                    {db.classes.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Term Type</label>
                  <select
                    value={formData.term}
                    onChange={e => setFormData({ ...formData, term: e.target.value as any })}
                    className="w-full border rounded-lg p-2"
                  >
                    <option value="half_yearly">Half Yearly / 1st Term</option>
                    <option value="annual">Annual / Final Exam</option>
                    <option value="model_test">Model Test / 2nd Term</option>
                    <option value="pre_test">Pre-Test / 3rd Term</option>
                    <option value="class_test">Class Test / Quiz</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Annual Weight (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.weightPercentage}
                    onChange={e => setFormData({ ...formData, weightPercentage: parseInt(e.target.value) || 40 })}
                    className="w-full border rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full border rounded-lg p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full border rounded-lg p-2 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 border rounded-lg text-gray-700">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-sm">
                  Create Examination
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EXCEL / CSV BULK IMPORT MODAL (Requirement 10) */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  Import Examination Schedules (Excel / CSV)
                </h3>
                <p className="text-xs text-gray-500">
                  Bulk import exam schedules, semesters, and term weights from CSV.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsImportModalOpen(false);
                  setParsedImportExams([]);
                  setImportError('');
                }}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Template Download */}
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-emerald-900 block">Sample CSV Template</span>
                <span className="text-[11px] text-emerald-700">Pre-formatted template with Exam Name, Term, Session & Dates.</span>
              </div>
              <button
                type="button"
                onClick={handleDownloadExamTemplateCsv}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Template</span>
              </button>
            </div>

            {/* File Upload Box */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-5 text-center bg-gray-50 hover:bg-blue-50/40 transition-colors">
              <input
                type="file"
                accept=".csv,.txt"
                id="exam-csv-file"
                className="hidden"
                onChange={handleParseExamCsv}
              />
              <label htmlFor="exam-csv-file" className="cursor-pointer space-y-2 block">
                <Upload className="w-8 h-8 text-blue-600 mx-auto" />
                <span className="font-bold text-gray-800 block">
                  Click to select CSV / Excel exported file
                </span>
                <span className="text-[11px] text-gray-500 block">
                  Supports UTF-8 CSV with exam names, semesters, and dates
                </span>
              </label>
            </div>

            {importError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{importError}</span>
              </div>
            )}

            {importSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{importSuccess}</span>
              </div>
            )}

            {/* Parsed Preview Table */}
            {parsedImportExams.length > 0 && (
              <div className="space-y-2">
                <span className="font-bold text-gray-700 block">
                  Preview Parsed Examinations ({parsedImportExams.length} records ready):
                </span>
                <div className="max-h-48 overflow-y-auto border rounded-xl">
                  <table className="w-full text-[11px] text-left">
                    <thead className="bg-gray-100 text-gray-700 sticky top-0">
                      <tr>
                        <th className="p-2">Exam Name</th>
                        <th className="p-2">Term</th>
                        <th className="p-2">Session</th>
                        <th className="p-2">Class</th>
                        <th className="p-2">Dates</th>
                        <th className="p-2">Weight</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {parsedImportExams.map((r, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="p-2 font-semibold text-gray-900">{r.name}</td>
                          <td className="p-2 capitalize">{r.term?.replace('_', ' ')}</td>
                          <td className="p-2 font-mono">{r.academicYear}</td>
                          <td className="p-2">{db.classes.find(c => c.id === r.classId)?.nameEn || 'Class'}</td>
                          <td className="p-2 font-mono text-gray-500">{r.startDate} to {r.endDate}</td>
                          <td className="p-2 font-mono">{r.weightPercentage}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 border rounded-xl text-gray-700 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={parsedImportExams.length === 0}
                onClick={handleConfirmExamImport}
                className={`px-5 py-2 rounded-xl text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-xs ${
                  parsedImportExams.length > 0 ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>Confirm & Import ({parsedImportExams.length})</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
