import React, { useState, useEffect } from 'react';
import {
  PenTool,
  Save,
  CheckCircle,
  AlertCircle,
  Check,
  Send,
  Users,
  Search,
  Filter,
  Boxes,
  Clock
} from 'lucide-react';
import { AppDatabase, logAuditAction, classSupportsGroups } from '../services/storage';
import { StudentMark } from '../types';

interface MarksEntryViewProps {
  db: AppDatabase;
  onUpdateDb: (updated: AppDatabase) => void;
  initialExamId?: string;
  onNavigateToResults: () => void;
  onNavigateToExaminations?: () => void;
}

export const MarksEntryView: React.FC<MarksEntryViewProps> = ({
  db,
  onUpdateDb,
  initialExamId,
  onNavigateToResults,
  onNavigateToExaminations
}) => {
  const [selectedExamId, setSelectedExamId] = useState<string>(
    initialExamId && db.examinations.some(e => e.id === initialExamId)
      ? initialExamId
      : db.examinations[0]?.id || 'exam-hy-2026'
  );
  const [selectedClassId, setSelectedClassId] = useState<string>(db.classes[0]?.id || 'c10');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('all');
  const [selectedShift, setSelectedShift] = useState<string>('all');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');

  const activeClass = db.classes.find(c => c.id === selectedClassId) || db.classes[0];
  const isGroupRequired = classSupportsGroups(activeClass);

  // Available shifts and groups
  const availableShifts = db.shifts || [];
  const availableGroups = db.groups || [];

  // Filter subjects for the class
  const classSubjects = db.subjects.filter(s => s.classId === selectedClassId && s.active);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(classSubjects[0]?.id || 'sub-gmath');

  const activeSubject = db.subjects.find(s => s.id === selectedSubjectId) || classSubjects[0];
  const activeExam = db.examinations.find(e => e.id === selectedExamId) || db.examinations[0];

  // Filter students for the class, section, shift, and group
  const sectionStudents = db.students.filter(s => {
    if (s.status !== 'active') return false;
    if (s.classId !== selectedClassId) return false;
    if (selectedSectionId !== 'all' && s.sectionId !== selectedSectionId) return false;
    if (selectedShift !== 'all' && s.shift && s.shift !== selectedShift) return false;
    if (isGroupRequired && selectedGroup !== 'all' && s.group && s.group !== selectedGroup) return false;
    return true;
  });

  // Local entry cache: map of studentId -> { componentScores: Record<string, number>, isAbsent: boolean }
  const [localScores, setLocalScores] = useState<Record<string, { scores: Record<string, number>; isAbsent: boolean }>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Sync local scores whenever filters change
  useEffect(() => {
    const initial: Record<string, { scores: Record<string, number>; isAbsent: boolean }> = {};
    for (const st of sectionStudents) {
      const existing = db.marks.find(
        m => m.studentId === st.id && m.examId === selectedExamId && m.subjectId === (activeSubject?.id || '')
      );
      initial[st.id] = {
        scores: existing ? { ...existing.componentScores } : {},
        isAbsent: existing?.isAbsent || false
      };
    }
    setLocalScores(initial);
    setValidationErrors({});
    setSaveSuccessMsg('');
  }, [selectedExamId, selectedClassId, selectedSectionId, selectedShift, selectedGroup, selectedSubjectId]);

  // Handle class change
  const handleClassChange = (newClassId: string) => {
    setSelectedClassId(newClassId);
    const newCls = db.classes.find(c => c.id === newClassId);
    const newSubs = db.subjects.filter(s => s.classId === newClassId && s.active);
    if (newSubs.length > 0) {
      setSelectedSubjectId(newSubs[0].id);
    }
    if (!classSupportsGroups(newCls)) {
      setSelectedGroup('all');
    }
  };

  const handleScoreChange = (studentId: string, cmpId: string, value: string, maxMarks: number) => {
    const num = value === '' ? 0 : Number(value);

    // Validate
    const errorKey = `${studentId}-${cmpId}`;
    if (num < 0 || num > maxMarks) {
      setValidationErrors(prev => ({
        ...prev,
        [errorKey]: `Cannot exceed maximum mark of ${maxMarks}`
      }));
    } else {
      setValidationErrors(prev => {
        const next = { ...prev };
        delete next[errorKey];
        return next;
      });
    }

    setLocalScores(prev => ({
      ...prev,
      [studentId]: {
        scores: {
          ...(prev[studentId]?.scores || {}),
          [cmpId]: num
        },
        isAbsent: prev[studentId]?.isAbsent || false
      }
    }));
  };

  const toggleAbsent = (studentId: string) => {
    setLocalScores(prev => ({
      ...prev,
      [studentId]: {
        scores: prev[studentId]?.scores || {},
        isAbsent: !prev[studentId]?.isAbsent
      }
    }));
  };

  const handleSaveMarks = (isSubmitted = false) => {
    if (Object.keys(validationErrors).length > 0) {
      alert('Please fix the validation errors (marks exceeding maximum component limit) before saving.');
      return;
    }

    if (!activeSubject) return;

    // Build updated marks list
    const updatedMarks: StudentMark[] = [...db.marks];

    for (const st of sectionStudents) {
      const entry = localScores[st.id];
      const existingIndex = updatedMarks.findIndex(
        m => m.studentId === st.id && m.examId === selectedExamId && m.subjectId === activeSubject.id
      );

      const markRecord: StudentMark = {
        id: existingIndex >= 0 ? updatedMarks[existingIndex].id : `mrk-${Date.now()}-${st.id}`,
        examId: selectedExamId,
        studentId: st.id,
        subjectId: activeSubject.id,
        classId: selectedClassId,
        academicYear: activeExam?.academicYear || db.schoolSettings.currentAcademicYear,
        group: st.group || (isGroupRequired && selectedGroup !== 'all' ? selectedGroup : undefined),
        shift: st.shift || (selectedShift !== 'all' ? selectedShift : undefined),
        componentScores: entry?.scores || {},
        isAbsent: entry?.isAbsent || false,
        enteredBy: db.currentUser ? `${db.currentUser.fullName} (${db.currentUser.role})` : 'System Admin',
        enteredAt: new Date().toISOString().split('T')[0]
      };

      if (existingIndex >= 0) {
        updatedMarks[existingIndex] = markRecord;
      } else {
        updatedMarks.push(markRecord);
      }
    }

    let updatedDb: AppDatabase = {
      ...db,
      marks: updatedMarks
    };

    updatedDb = logAuditAction(
      updatedDb,
      isSubmitted ? 'SUBMIT_MARKS' : 'DRAFT_MARKS',
      `${isSubmitted ? 'Submitted' : 'Saved draft'} marks for ${activeSubject.nameEn} (${activeExam?.name || selectedExamId}, Class: ${activeClass?.nameEn}, ${sectionStudents.length} students)`
    );

    onUpdateDb(updatedDb);
    setSaveSuccessMsg(isSubmitted ? 'Marks submitted for approval!' : 'Marks saved as draft successfully!');
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  return (
    <div className="space-y-5">
      {/* Header and Workflow Selection */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-3">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <PenTool className="w-5 h-5 text-blue-600" />
              Marks Entry & Assessment Sheet
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Direct marks recording across assessment components (CQ, MCQ, Practical, Assignment) with instant validation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSaveMarks(false)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 border border-gray-300 cursor-pointer"
            >
              <Save className="w-4 h-4 text-gray-600" />
              Save Draft
            </button>
            <button
              onClick={() => handleSaveMarks(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Send className="w-4 h-4" />
              Submit Marks
            </button>
          </div>
        </div>

        {/* Dropdown Filters Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">1. Examination</label>
            <select
              value={selectedExamId}
              onChange={e => setSelectedExamId(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 font-bold text-blue-900"
            >
              {db.examinations.map(e => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">2. Class</label>
            <select
              value={selectedClassId}
              onChange={e => handleClassChange(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 font-bold text-gray-900"
            >
              {db.classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.nameEn}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">3. Section</label>
            <select
              value={selectedSectionId}
              onChange={e => setSelectedSectionId(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 font-medium"
            >
              <option value="all">All Sections</option>
              {db.sections.filter(s => s.classId === selectedClassId).map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">4. Shift</label>
            <select
              value={selectedShift}
              onChange={e => setSelectedShift(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 font-medium text-indigo-900"
            >
              <option value="all">All Shifts</option>
              {availableShifts.map(sh => (
                <option key={sh.id} value={sh.name}>
                  {sh.name}
                </option>
              ))}
            </select>
          </div>

          {/* Group Selection Dropdown: Enabled for Class 9, 10, and College levels */}
          {isGroupRequired ? (
            <div className="bg-purple-50 p-1.5 rounded-lg border border-purple-200">
              <label className="block font-bold text-purple-900 mb-1 flex items-center gap-1">
                <Boxes className="w-3.5 h-3.5 text-purple-600" />
                <span>5. Group Stream *</span>
              </label>
              <select
                value={selectedGroup}
                onChange={e => setSelectedGroup(e.target.value)}
                className="w-full bg-white border border-purple-300 rounded-md p-1 font-bold text-purple-900"
              >
                <option value="all">All Groups</option>
                {availableGroups.map(grp => (
                  <option key={grp.id} value={grp.name}>
                    {grp.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block font-semibold text-gray-400 mb-1">5. Group</label>
              <div className="bg-gray-100 border border-gray-200 rounded-lg p-2 text-gray-400 italic">
                Not Applicable
              </div>
            </div>
          )}

          <div>
            <label className="block font-semibold text-gray-700 mb-1">6. Subject</label>
            <select
              value={selectedSubjectId}
              onChange={e => setSelectedSubjectId(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 font-bold text-purple-900"
            >
              {classSubjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.nameEn} (Code: {s.code})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          {saveSuccessMsg}
        </div>
      )}

      {/* Marks Entry Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="p-3.5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900 text-xs">
              {activeSubject?.nameEn} (Total: {activeSubject?.fullMarks} Marks)
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-xs text-gray-600">
              Students: {sectionStudents.length}
            </span>
          </div>
          <span className="text-xs text-gray-500 font-mono">
            Pass Marks: {activeSubject?.passMarks}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-100 text-gray-700 uppercase font-semibold">
              <tr>
                <th className="py-2.5 px-3">Roll</th>
                <th className="py-2.5 px-3">Student Name</th>
                {isGroupRequired && <th className="py-2.5 px-3 text-center">Group</th>}
                <th className="py-2.5 px-3 text-center">Shift</th>
                {activeSubject?.components.map(cmp => (
                  <th key={cmp.id} className="py-2.5 px-3 text-center">
                    <div>{cmp.name}</div>
                    <div className="text-[10px] text-gray-500 font-mono font-normal">
                      Max: {cmp.maxMarks} | Pass: {cmp.passMarks}
                    </div>
                  </th>
                ))}
                <th className="py-2.5 px-3 text-center">Total Obtained</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Absent?</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sectionStudents.map(student => {
                const entry = localScores[student.id];
                const isAbsent = entry?.isAbsent || false;

                let studentSum = 0;
                if (!isAbsent && activeSubject) {
                  for (const cmp of activeSubject.components) {
                    studentSum += Number(entry?.scores[cmp.id] || 0);
                  }
                }

                return (
                  <tr key={student.id} className={`hover:bg-blue-50/40 ${isAbsent ? 'bg-red-50/40' : ''}`}>
                    <td className="py-2 px-3 font-mono font-bold text-gray-900">
                      #{student.rollNo}
                    </td>
                    <td className="py-2 px-3">
                      <div className="font-bold text-gray-900">{student.nameEn}</div>
                      {student.studentId && (
                        <div className="text-[11px] font-mono text-gray-500">ID: {student.studentId}</div>
                      )}
                    </td>
                    {isGroupRequired && (
                      <td className="py-2 px-3 text-center">
                        <span className="text-[10px] font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-200">
                          {student.group || 'Science'}
                        </span>
                      </td>
                    )}
                    <td className="py-2 px-3 text-center">
                      <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-200">
                        {student.shift || 'Morning Shift'}
                      </span>
                    </td>

                    {/* Component Input Columns */}
                    {activeSubject?.components.map(cmp => {
                      const scoreVal = entry?.scores[cmp.id] ?? '';
                      const errorKey = `${student.id}-${cmp.id}`;
                      const hasError = !!validationErrors[errorKey];

                      return (
                        <td key={cmp.id} className="py-2 px-3 text-center">
                          <input
                            type="number"
                            min="0"
                            max={cmp.maxMarks}
                            disabled={isAbsent}
                            value={isAbsent ? '' : scoreVal}
                            placeholder={isAbsent ? 'ABS' : '0'}
                            onChange={e => handleScoreChange(student.id, cmp.id, e.target.value, cmp.maxMarks)}
                            className={`w-20 text-center font-bold p-1 rounded border text-xs ${
                              hasError
                                ? 'border-red-500 bg-red-50 text-red-700'
                                : 'border-gray-300 bg-white focus:border-blue-500'
                            }`}
                          />
                          {hasError && (
                            <div className="text-[9px] text-red-600 font-bold mt-0.5">
                              Exceeds {cmp.maxMarks}
                            </div>
                          )}
                        </td>
                      );
                    })}

                    <td className="py-2 px-3 text-center">
                      <span className="font-extrabold text-blue-900 bg-blue-50 px-2.5 py-1 rounded">
                        {isAbsent ? 'ABS' : studentSum}
                      </span>
                    </td>

                    <td className="py-2 px-3 text-center">
                      {isAbsent ? (
                        <span className="text-[10px] font-bold bg-red-100 text-red-800 px-2 py-0.5 rounded">
                          ABSENT
                        </span>
                      ) : studentSum >= (activeSubject?.passMarks || 33) ? (
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                          PASSED
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                          FAILED
                        </span>
                      )}
                    </td>

                    <td className="py-2 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={isAbsent}
                        onChange={() => toggleAbsent(student.id)}
                        className="w-4 h-4 text-red-600 rounded cursor-pointer"
                        title="Mark Absent"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            Tip: Press <kbd className="bg-white border px-1 rounded font-mono">Tab</kbd> to move quickly between component inputs.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSaveMarks(false)}
              className="bg-white hover:bg-gray-100 text-gray-800 font-semibold px-4 py-2 rounded-lg border text-xs"
            >
              Save as Draft
            </button>
            <button
              onClick={() => handleSaveMarks(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2 rounded-lg text-xs shadow-xs"
            >
              Submit & Finalize Marks
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
