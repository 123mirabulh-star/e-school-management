import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Layers,
  Save,
  X,
  Sliders,
  Check,
  FileSpreadsheet,
  Upload,
  Download,
  AlertCircle,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Subject, AssessmentComponent, ComponentTypeCode } from '../types';
import { AppDatabase, logAuditAction } from '../services/storage';
import { downloadCsv } from '../utils/downloadHelper';

interface SubjectsViewProps {
  db: AppDatabase;
  onUpdateDb: (updated: AppDatabase) => void;
  onNavigateToMarkDistribution: () => void;
}

export const SubjectsView: React.FC<SubjectsViewProps> = ({
  db,
  onUpdateDb,
  onNavigateToMarkDistribution
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Bulk Excel/CSV Import state (Requirement 10)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [parsedImportSubjects, setParsedImportSubjects] = useState<Partial<Subject>[]>([]);
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');

  const handleDownloadSubjectTemplateCsv = () => {
    const headers = [
      'Subject Code',
      'Subject Name',
      'Class Name',
      'Subject Type (compulsory/elective)',
      'Full Marks',
      'Pass Marks',
      'CQ Marks',
      'MCQ Marks',
      'Practical Marks'
    ];
    const sampleRows = [
      ['101', 'Bangla 1st Paper', 'Class 6', 'compulsory', '100', '33', '70', '30', '0'],
      ['102', 'Bangla 2nd Paper', 'Class 6', 'compulsory', '100', '33', '70', '30', '0'],
      ['107', 'English 1st Paper', 'Class 6', 'compulsory', '100', '33', '100', '0', '0'],
      ['109', 'Mathematics', 'Class 6', 'compulsory', '100', '33', '70', '30', '0'],
      ['127', 'General Science', 'Class 6', 'compulsory', '100', '33', '50', '25', '25']
    ];
    downloadCsv('Subject_Import_Template', headers, sampleRows);
  };

  const handleParseSubjectCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError('');
    setImportSuccess('');

    const reader = new FileReader();
    reader.onload = evt => {
      const text = (evt.target?.result as string) || '';
      const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
      if (lines.length < 2) {
        setImportError('File must contain a header row and at least one subject data row.');
        return;
      }

      const rows: Partial<Subject>[] = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map(p => p.trim().replace(/^"|"$/g, ''));
        if (parts.length >= 2 && parts[1]) {
          const code = parts[0] || `${Math.floor(100 + Math.random() * 900)}`;
          const nameEn = parts[1];
          const className = parts[2] || '';
          const subType = (parts[3]?.toLowerCase() === 'elective' ? 'elective' : 'compulsory') as 'compulsory' | 'elective';
          const fullMarks = parseInt(parts[4]) || 100;
          const passMarks = parseInt(parts[5]) || Math.round(fullMarks * 0.33);
          const cqMarks = parseInt(parts[6]) || (fullMarks >= 100 ? 70 : fullMarks);
          const mcqMarks = parseInt(parts[7]) || (fullMarks >= 100 ? 30 : 0);
          const prMarks = parseInt(parts[8]) || 0;

          const matchedClass = db.classes.find(
            c => c.nameEn.toLowerCase() === className.toLowerCase() ||
                 c.nameEn.toLowerCase().includes(className.toLowerCase())
          ) || db.classes[0];

          const components: AssessmentComponent[] = [];
          if (cqMarks > 0) {
            components.push({
              id: `cmp-cq-${Date.now()}-${i}`,
              name: 'Creative/CQ',
              code: 'CQ',
              maxMarks: cqMarks,
              passMarks: Math.round(cqMarks * 0.33),
              weight: 1,
              contributesToFinal: true,
              ordering: 1
            });
          }
          if (mcqMarks > 0) {
            components.push({
              id: `cmp-mcq-${Date.now()}-${i}`,
              name: 'MCQ',
              code: 'MCQ',
              maxMarks: mcqMarks,
              passMarks: Math.round(mcqMarks * 0.33),
              weight: 1,
              contributesToFinal: true,
              ordering: 2
            });
          }
          if (prMarks > 0) {
            components.push({
              id: `cmp-pr-${Date.now()}-${i}`,
              name: 'Practical',
              code: 'PR',
              maxMarks: prMarks,
              passMarks: Math.round(prMarks * 0.33),
              weight: 1,
              contributesToFinal: true,
              ordering: 3
            });
          }

          rows.push({
            code,
            nameEn,
            classId: matchedClass?.id || 'c6',
            subjectType: subType,
            fullMarks,
            passMarks,
            active: true,
            components
          });
        }
      }

      setParsedImportSubjects(rows);
    };

    reader.readAsText(file);
  };

  const handleConfirmSubjectImport = () => {
    if (parsedImportSubjects.length === 0) return;

    const newSubjects: Subject[] = parsedImportSubjects.map((r, i) => ({
      id: `sub-${Date.now()}-${i}`,
      code: r.code || `${100 + i}`,
      nameEn: r.nameEn || 'Subject',
      classId: r.classId || db.classes[0]?.id || 'c6',
      subjectType: r.subjectType || 'compulsory',
      fullMarks: r.fullMarks || 100,
      passMarks: r.passMarks || 33,
      active: true,
      teacherName: '',
      components: r.components || []
    }));

    const updatedDb = logAuditAction(
      {
        ...db,
        subjects: [...db.subjects, ...newSubjects]
      },
      'BULK_SUBJECT_IMPORT',
      `Imported ${newSubjects.length} subjects via Excel/CSV file upload.`
    );

    onUpdateDb(updatedDb);
    setImportSuccess(`Successfully imported ${newSubjects.length} subjects!`);
    setParsedImportSubjects([]);
    setTimeout(() => {
      setIsImportModalOpen(false);
      setImportSuccess('');
    }, 1500);
  };

  const [formData, setFormData] = useState<Subject>({
    id: '',
    code: '',
    nameEn: '',
    classId: db.classes[0]?.id || 'c10',
    subjectType: 'compulsory',
    fullMarks: 100,
    passMarks: 33,
    active: true,
    teacherName: '',
    components: [
      { id: 'cmp-cq', name: 'Creative/CQ', code: 'CQ', maxMarks: 70, passMarks: 23, weight: 1, contributesToFinal: true, ordering: 1 },
      { id: 'cmp-mcq', name: 'MCQ', code: 'MCQ', maxMarks: 30, passMarks: 10, weight: 1, contributesToFinal: true, ordering: 2 }
    ]
  });

  const filteredSubjects = db.subjects.filter(sub => {
    const matchesSearch =
      sub.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.code.includes(searchTerm);
    const matchesClass = selectedClassId === 'all' || sub.classId === selectedClassId;
    return matchesSearch && matchesClass;
  });

  const handleOpenCreate = () => {
    setIsCreating(true);
    setEditingSubject(null);
    setFormData({
      id: `sub-${Date.now()}`,
      code: `${Math.floor(110 + Math.random() * 80)}`,
      nameEn: '',
      classId: selectedClassId !== 'all' ? selectedClassId : (db.classes[0]?.id || 'c10'),
      subjectType: 'compulsory',
      fullMarks: 100,
      passMarks: 33,
      active: true,
      teacherName: '',
      components: [
        { id: `cmp-${Date.now()}-1`, name: 'Creative/CQ', code: 'CQ', maxMarks: 70, passMarks: 23, weight: 1, contributesToFinal: true, ordering: 1 },
        { id: `cmp-${Date.now()}-2`, name: 'MCQ', code: 'MCQ', maxMarks: 30, passMarks: 10, weight: 1, contributesToFinal: true, ordering: 2 }
      ]
    });
  };

  const handleOpenEdit = (sub: Subject) => {
    setEditingSubject(sub);
    setIsCreating(false);
    setFormData(JSON.parse(JSON.stringify(sub)));
  };

  const handleAddComponentRow = () => {
    const newComponent: AssessmentComponent = {
      id: `cmp-${Date.now()}`,
      name: 'Practical',
      code: 'PR',
      maxMarks: 25,
      passMarks: 8,
      weight: 1,
      contributesToFinal: true,
      ordering: formData.components.length + 1
    };
    setFormData({
      ...formData,
      components: [...formData.components, newComponent]
    });
  };

  const handleRemoveComponentRow = (id: string) => {
    setFormData({
      ...formData,
      components: formData.components.filter(c => c.id !== id)
    });
  };

  const [deleteSubjectTarget, setDeleteSubjectTarget] = useState<Subject | null>(null);
  const [bannerMsg, setBannerMsg] = useState('');
  const [formErrorMsg, setFormErrorMsg] = useState('');

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrorMsg('');

    if (!formData.nameEn?.trim() || !formData.code?.trim()) {
      setFormErrorMsg('Please fill out Subject Name and Subject Code.');
      return;
    }

    const compTotal = formData.components.reduce(
      (sum, c) => sum + (c.contributesToFinal ? Number(c.maxMarks) : 0),
      0
    );
    const finalFullMarks = compTotal > 0 ? compTotal : Number(formData.fullMarks) || 100;
    const finalFormData: Subject = {
      ...formData,
      nameEn: formData.nameEn.trim(),
      code: formData.code.trim(),
      fullMarks: finalFullMarks,
      passMarks: Number(formData.passMarks) || Math.round(finalFullMarks * 0.33)
    };

    let updatedSubjects: Subject[];
    if (isCreating) {
      updatedSubjects = [...db.subjects, finalFormData];
    } else {
      updatedSubjects = db.subjects.map(s => (s.id === finalFormData.id ? finalFormData : s));
    }

    let updatedDb: AppDatabase = {
      ...db,
      subjects: updatedSubjects
    };

    updatedDb = logAuditAction(
      updatedDb,
      isCreating ? 'CREATE_SUBJECT' : 'UPDATE_SUBJECT',
      `${isCreating ? 'Created' : 'Updated'} subject ${finalFormData.nameEn} (Code: ${finalFormData.code}, Full Marks: ${finalFormData.fullMarks})`
    );

    onUpdateDb(updatedDb);
    setIsCreating(false);
    setEditingSubject(null);
    setBannerMsg(`Subject "${finalFormData.nameEn}" saved successfully.`);
    setTimeout(() => setBannerMsg(''), 3500);
  };

  const handleConfirmDeleteSubject = () => {
    if (!deleteSubjectTarget) return;
    const target = deleteSubjectTarget;

    const remainingSubjects = db.subjects.filter(s => s.id !== target.id);
    const remainingMarks = db.marks.filter(m => m.subjectId !== target.id);

    let updatedDb: AppDatabase = {
      ...db,
      subjects: remainingSubjects,
      marks: remainingMarks
    };

    updatedDb = logAuditAction(
      updatedDb,
      'DELETE_SUBJECT',
      `Deleted subject: ${target.nameEn} (Code: ${target.code}, Class: ${target.classId})`
    );

    onUpdateDb(updatedDb);
    setDeleteSubjectTarget(null);
    setBannerMsg(`Subject "${target.nameEn}" deleted successfully.`);
    setTimeout(() => setBannerMsg(''), 3500);
  };

  const handleToggleActive = (sub: Subject) => {
    const updated = db.subjects.map(s => (s.id === sub.id ? { ...s, active: !s.active } : s));
    let updatedDb = { ...db, subjects: updated };
    updatedDb = logAuditAction(
      updatedDb,
      'TOGGLE_SUBJECT_STATUS',
      `${sub.active ? 'Deactivated' : 'Activated'} subject ${sub.nameEn} (${sub.code})`
    );
    onUpdateDb(updatedDb);
  };

  return (
    <div className="space-y-5">
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Dynamic Subject Management
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure subject names, codes, full marks, pass marks, and CQ/MCQ/Practical component breakdowns.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 border border-emerald-300 cursor-pointer shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Import Excel / CSV</span>
          </button>
          <button
            onClick={onNavigateToMarkDistribution}
            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 border border-indigo-200 cursor-pointer"
          >
            <Sliders className="w-4 h-4" />
            Mark Distribution Table
          </button>
          <button
            onClick={handleOpenCreate}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add New Subject
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

      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="p-3.5 border-b border-gray-200 bg-gray-50 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by subject name or code..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600 font-medium">Class Filter:</span>
            <select
              value={selectedClassId}
              onChange={e => setSelectedClassId(e.target.value)}
              className="text-xs bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 font-medium text-gray-700"
            >
              <option value="all">All Classes ({db.subjects.length})</option>
              {db.classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.nameEn}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-100 text-gray-600 uppercase font-semibold">
              <tr>
                <th className="py-3 px-3">Code</th>
                <th className="py-3 px-3">Subject Name</th>
                <th className="py-3 px-3">Class</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3 text-center">Full Marks</th>
                <th className="py-3 px-3 text-center">Pass Marks</th>
                <th className="py-3 px-3">Components Breakdown</th>
                <th className="py-3 px-3">Teacher</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSubjects.map(sub => {
                const cls = db.classes.find(c => c.id === sub.classId);
                return (
                  <tr key={sub.id} className="hover:bg-blue-50/40">
                    <td className="py-3 px-3 font-mono font-bold text-blue-900">
                      {sub.code}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-gray-900">{sub.nameEn}</div>
                    </td>
                    <td className="py-3 px-3 font-medium text-gray-700">
                      {cls?.nameEn}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                          sub.subjectType === 'optional'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {sub.subjectType}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-gray-900">
                      {sub.fullMarks}
                    </td>
                    <td className="py-3 px-3 text-center font-semibold text-gray-600">
                      {sub.passMarks}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1">
                        {sub.components.map(cmp => (
                          <span
                            key={cmp.id}
                            className="text-[10px] bg-gray-100 border border-gray-200 text-gray-700 px-1.5 py-0.5 rounded font-mono"
                          >
                            {cmp.code}: {cmp.maxMarks} (Pass: {cmp.passMarks})
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-gray-600">
                      {sub.teacherName || 'Not Assigned'}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => handleToggleActive(sub)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase cursor-pointer ${
                          sub.active
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {sub.active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(sub)}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded cursor-pointer"
                          title="Edit Subject"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteSubjectTarget(sub)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded cursor-pointer"
                          title={`Delete ${sub.nameEn}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Subject Modal */}
      {(isCreating || editingSubject) && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-base font-bold text-gray-900">
                {isCreating ? 'Add New Subject' : `Edit Subject: ${formData.nameEn}`}
              </h3>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setEditingSubject(null);
                }}
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubject} className="space-y-4 text-xs">
              {formErrorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{formErrorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Subject Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 101"
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Subject Full Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Physics"
                    value={formData.nameEn}
                    onChange={e => setFormData({ ...formData, nameEn: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Class</label>
                  <select
                    value={formData.classId}
                    onChange={e => setFormData({ ...formData, classId: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2"
                  >
                    {db.classes.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Subject Type</label>
                  <select
                    value={formData.subjectType}
                    onChange={e => setFormData({ ...formData, subjectType: e.target.value as any })}
                    className="w-full border border-gray-300 rounded-lg p-2"
                  >
                    <option value="compulsory">Compulsory</option>
                    <option value="optional">Optional / 4th Subject</option>
                    <option value="elective">Elective</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Full Marks</label>
                  <input
                    type="number"
                    required
                    value={formData.fullMarks}
                    onChange={e => setFormData({ ...formData, fullMarks: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg p-2 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Pass Marks</label>
                  <input
                    type="number"
                    required
                    value={formData.passMarks}
                    onChange={e => setFormData({ ...formData, passMarks: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg p-2 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Assigned Teacher</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Shamim Ahmed"
                  value={formData.teacherName || ''}
                  onChange={e => setFormData({ ...formData, teacherName: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-gray-900 text-xs">
                    Assessment Components (CQ, MCQ, Practical, CT)
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddComponentRow}
                    className="bg-white border border-gray-300 hover:bg-gray-100 text-blue-700 font-bold px-2.5 py-1 rounded text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    Add Component
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.components.map((cmp, idx) => (
                    <div key={cmp.id} className="grid grid-cols-12 gap-2 items-center bg-white p-2 rounded-lg border">
                      <div className="col-span-4">
                        <input
                          type="text"
                          value={cmp.name}
                          onChange={e => {
                            const newCmps = [...formData.components];
                            newCmps[idx].name = e.target.value;
                            setFormData({ ...formData, components: newCmps });
                          }}
                          className="w-full border border-gray-200 rounded p-1 text-xs"
                          placeholder="Component Name"
                        />
                      </div>
                      <div className="col-span-2">
                        <select
                          value={cmp.code}
                          onChange={e => {
                            const newCmps = [...formData.components];
                            newCmps[idx].code = e.target.value as ComponentTypeCode;
                            setFormData({ ...formData, components: newCmps });
                          }}
                          className="w-full border border-gray-200 rounded p-1 text-xs font-mono"
                        >
                          <option value="CQ">CQ</option>
                          <option value="MCQ">MCQ</option>
                          <option value="PR">PR</option>
                          <option value="CT">CT</option>
                          <option value="OR">OR</option>
                          <option value="AS">AS</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          placeholder="Max"
                          value={cmp.maxMarks}
                          onChange={e => {
                            const newCmps = [...formData.components];
                            newCmps[idx].maxMarks = Number(e.target.value);
                            setFormData({ ...formData, components: newCmps });
                          }}
                          className="w-full border border-gray-200 rounded p-1 text-xs font-bold text-center"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          placeholder="Pass"
                          value={cmp.passMarks}
                          onChange={e => {
                            const newCmps = [...formData.components];
                            newCmps[idx].passMarks = Number(e.target.value);
                            setFormData({ ...formData, components: newCmps });
                          }}
                          className="w-full border border-gray-200 rounded p-1 text-xs text-center"
                        />
                      </div>
                      <div className="col-span-2 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveComponentRow(cmp.id)}
                          className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingSubject(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  Save Subject Configuration
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
                  Import Subject List (Excel / CSV)
                </h3>
                <p className="text-xs text-gray-500">
                  Bulk import subjects, full marks, pass marks, and CQ/MCQ component weights.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsImportModalOpen(false);
                  setParsedImportSubjects([]);
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
                <span className="text-[11px] text-emerald-700">Pre-formatted template with Subject Code, Name, Class & CQ/MCQ.</span>
              </div>
              <button
                type="button"
                onClick={handleDownloadSubjectTemplateCsv}
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
                id="subject-csv-file"
                className="hidden"
                onChange={handleParseSubjectCsv}
              />
              <label htmlFor="subject-csv-file" className="cursor-pointer space-y-2 block">
                <Upload className="w-8 h-8 text-blue-600 mx-auto" />
                <span className="font-bold text-gray-800 block">
                  Click to select CSV / Excel exported file
                </span>
                <span className="text-[11px] text-gray-500 block">
                  Supports UTF-8 CSV with subject names, codes, and mark distributions
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
            {parsedImportSubjects.length > 0 && (
              <div className="space-y-2">
                <span className="font-bold text-gray-700 block">
                  Preview Parsed Subjects ({parsedImportSubjects.length} records ready):
                </span>
                <div className="max-h-48 overflow-y-auto border rounded-xl">
                  <table className="w-full text-[11px] text-left">
                    <thead className="bg-gray-100 text-gray-700 sticky top-0">
                      <tr>
                        <th className="p-2">Code</th>
                        <th className="p-2">Subject Name</th>
                        <th className="p-2">Class</th>
                        <th className="p-2">Full</th>
                        <th className="p-2">Pass</th>
                        <th className="p-2">Components</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {parsedImportSubjects.map((r, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="p-2 font-mono font-bold">{r.code}</td>
                          <td className="p-2 font-semibold text-gray-900">{r.nameEn}</td>
                          <td className="p-2">{db.classes.find(c => c.id === r.classId)?.nameEn || 'Class'}</td>
                          <td className="p-2 font-mono">{r.fullMarks}</td>
                          <td className="p-2 font-mono">{r.passMarks}</td>
                          <td className="p-2 text-gray-500">
                            {r.components?.map(c => `${c.code}: ${c.maxMarks}`).join(', ')}
                          </td>
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
                disabled={parsedImportSubjects.length === 0}
                onClick={handleConfirmSubjectImport}
                className={`px-5 py-2 rounded-xl text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-xs ${
                  parsedImportSubjects.length > 0 ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>Confirm & Import ({parsedImportSubjects.length})</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Subject Confirmation Modal */}
      {deleteSubjectTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Confirm Subject Deletion
              </h3>
              <button
                onClick={() => setDeleteSubjectTarget(null)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-gray-700">
              <p>
                Are you sure you want to permanently remove this subject from the academic curriculum?
              </p>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-1">
                <div className="font-bold text-gray-900 text-sm">
                  {deleteSubjectTarget.nameEn} (Code: {deleteSubjectTarget.code})
                </div>
                <div className="text-gray-600 font-mono text-[11px]">
                  Class: {db.classes.find(c => c.id === deleteSubjectTarget.classId)?.nameEn || 'All Classes'} • Full Marks: {deleteSubjectTarget.fullMarks}
                </div>
              </div>

              {(() => {
                const linkedMarks = db.marks.filter(m => m.subjectId === deleteSubjectTarget.id).length;
                if (linkedMarks > 0) {
                  return (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-900 space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-amber-800">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        Academic Records Safeguard Warning
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        This subject currently has <strong>{linkedMarks} student mark entries</strong> recorded in student results. Deleting will clean related records to prevent orphan data in the database.
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
                onClick={() => setDeleteSubjectTarget(null)}
                className="px-4 py-2 border rounded-lg text-gray-700 font-semibold hover:bg-gray-50 cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteSubject}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs text-xs"
              >
                <Trash2 className="w-4 h-4" />
                Yes, Delete Subject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
