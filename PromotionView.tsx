import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Award,
  Layers,
  Users,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Printer,
  Download,
  Filter,
  RefreshCw,
  Calendar,
  CheckSquare,
  Square,
  ChevronRight,
  FileSpreadsheet,
  Plus,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { Student, Examination, ClassLevel, Section } from '../types';
import { AppDatabase, logAuditAction } from '../services/storage';
import { printDocument, downloadHtmlDocument, downloadCsv } from '../utils/downloadHelper';

interface PromotionViewProps {
  db: AppDatabase;
  onUpdateDb: (updated: AppDatabase) => void;
}

interface StudentAnnualRecord {
  student: Student;
  examMarksMap: Record<string, { total: number; full: number; gpa: number }>;
  annualTotalMarks: number;
  annualFullMarks: number;
  annualPercentage: number;
  annualGpa: number;
  meritRank: number;
  isEligible: boolean;
  assignedNewRoll: number;
}

export const PromotionView: React.FC<PromotionViewProps> = ({ db, onUpdateDb }) => {
  // Current session & source class
  const [currentYear, setCurrentYear] = useState<string>(db.schoolSettings.currentAcademicYear || '2026');
  const [nextYear, setNextYear] = useState<string>(
    String(Number(db.schoolSettings.currentAcademicYear || '2026') + 1)
  );

  const [sourceClassId, setSourceClassId] = useState<string>(db.classes[0]?.id || 'c6');
  const [targetClassId, setTargetClassId] = useState<string>('');
  const [targetSectionId, setTargetSectionId] = useState<string>('same');
  const [rollAssignmentMethod, setRollAssignmentMethod] = useState<'merit' | 'retain'>('merit');

  // Selected examinations in the year to combine for annual merit
  const currentYearExams = useMemo(() => {
    return db.examinations.filter(e => e.academicYear === currentYear || !e.academicYear);
  }, [db.examinations, currentYear]);

  const [selectedExamIds, setSelectedExamIds] = useState<string[]>([]);

  // Initialize selected exams when year changes
  React.useEffect(() => {
    if (currentYearExams.length > 0) {
      setSelectedExamIds(currentYearExams.map(e => e.id));
    } else {
      setSelectedExamIds([]);
    }
  }, [currentYearExams]);

  // Determine natural next class
  const sourceClass = db.classes.find(c => c.id === sourceClassId);
  const nextClassSuggestion = useMemo(() => {
    if (!sourceClass) return null;
    const sorted = [...db.classes].sort((a, b) => (a.numericValue ?? 0) - (b.numericValue ?? 0));
    const currentIndex = sorted.findIndex(c => c.id === sourceClass.id);
    if (currentIndex >= 0 && currentIndex < sorted.length - 1) {
      return sorted[currentIndex + 1];
    }
    return null;
  }, [db.classes, sourceClass]);

  // Auto-set target class suggestion
  React.useEffect(() => {
    if (nextClassSuggestion) {
      setTargetClassId(nextClassSuggestion.id);
    } else {
      setTargetClassId('');
    }
  }, [nextClassSuggestion]);

  // Students in source class and session
  const classStudents = useMemo(() => {
    return db.students.filter(
      s => s.classId === sourceClassId && (s.academicYear === currentYear || !s.academicYear)
    );
  }, [db.students, sourceClassId, currentYear]);

  // Calculate Annual Marks & Merit List across all selected examinations
  const annualRecords: StudentAnnualRecord[] = useMemo(() => {
    const rawList = classStudents.map(student => {
      const examMarksMap: Record<string, { total: number; full: number; gpa: number }> = {};
      let annualTotalMarks = 0;
      let annualFullMarks = 0;
      let gpaSum = 0;
      let examsCounted = 0;

      selectedExamIds.forEach(examId => {
        // Try to find calculated result first
        const calcRes = db.results.find(r => r.studentId === student.id && r.examId === examId);
        if (calcRes) {
          examMarksMap[examId] = {
            total: calcRes.totalObtainedMarks,
            full: calcRes.totalFullMarks,
            gpa: calcRes.gpa
          };
          annualTotalMarks += calcRes.totalObtainedMarks;
          annualFullMarks += calcRes.totalFullMarks;
          gpaSum += calcRes.gpa;
          examsCounted++;
        } else {
          // Compute directly from student marks
          const studentMarks = db.marks.filter(
            m => m.studentId === student.id && m.examId === examId
          );
          let examObtained = 0;
          let examFull = 0;

          studentMarks.forEach(sm => {
            const scores = sm.componentScores || {};
            const sumScores = Object.values(scores).reduce((a, b) => a + (Number(b) || 0), 0);
            examObtained += sumScores;
            const sub = db.subjects.find(s => s.id === sm.subjectId);
            examFull += sub?.fullMarks || 100;
          });

          const examGpa = examFull > 0 ? Math.min(5.0, (examObtained / examFull) * 5.0) : 0;
          examMarksMap[examId] = {
            total: examObtained,
            full: examFull,
            gpa: examGpa
          };
          annualTotalMarks += examObtained;
          annualFullMarks += examFull;
          if (examFull > 0) {
            gpaSum += examGpa;
            examsCounted++;
          }
        }
      });

      const annualPercentage = annualFullMarks > 0 ? (annualTotalMarks / annualFullMarks) * 100 : 0;
      const annualGpa = examsCounted > 0 ? Number((gpaSum / examsCounted).toFixed(2)) : 0;
      const isEligible = annualPercentage >= 33;

      return {
        student,
        examMarksMap,
        annualTotalMarks,
        annualFullMarks,
        annualPercentage,
        annualGpa,
        meritRank: 0,
        isEligible,
        assignedNewRoll: student.rollNo
      };
    });

    // Sort by Annual Total Marks descending to establish Annual Merit Rank
    rawList.sort((a, b) => {
      if (b.annualTotalMarks !== a.annualTotalMarks) {
        return b.annualTotalMarks - a.annualTotalMarks;
      }
      return b.annualGpa - a.annualGpa;
    });

    // Assign merit ranks and new rolls
    return rawList.map((rec, index) => {
      const meritRank = index + 1;
      return {
        ...rec,
        meritRank,
        assignedNewRoll: meritRank
      };
    });
  }, [classStudents, selectedExamIds, db.results, db.marks, db.subjects]);

  // Selected students for promotion
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [customRolls, setCustomRolls] = useState<Record<string, number>>({});

  // Reset selected students when class changes
  React.useEffect(() => {
    // By default select all eligible students
    setSelectedStudentIds(annualRecords.filter(r => r.isEligible).map(r => r.student.id));
  }, [annualRecords]);

  const toggleSelectStudent = (id: string) => {
    setSelectedStudentIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudentIds.length === annualRecords.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(annualRecords.map(r => r.student.id));
    }
  };

  const [promotionSuccessMessage, setPromotionSuccessMessage] = useState<string | null>(null);

  // Execute Promotion Action
  const handlePromoteStudents = () => {
    if (selectedStudentIds.length === 0) {
      alert('Please select at least one student to promote.');
      return;
    }

    if (!targetClassId) {
      alert('Please select a target class for promotion.');
      return;
    }

    const targetClass = db.classes.find(c => c.id === targetClassId);
    if (!targetClass) return;

    const confirmMsg = `Are you sure you want to promote ${selectedStudentIds.length} students from ${sourceClass?.nameEn} (${currentYear}) to ${targetClass.nameEn} (${nextYear})?`;
    if (!confirm(confirmMsg)) return;

    // Update students
    const updatedStudents = db.students.map(st => {
      if (!selectedStudentIds.includes(st.id)) return st;

      const record = annualRecords.find(r => r.student.id === st.id);
      const newRoll =
        rollAssignmentMethod === 'merit'
          ? customRolls[st.id] ?? (record?.meritRank || st.rollNo)
          : st.rollNo;

      let newSectionId = st.sectionId;
      if (targetSectionId !== 'same') {
        newSectionId = targetSectionId;
      }

      return {
        ...st,
        classId: targetClassId,
        academicYear: nextYear,
        rollNo: Number(newRoll),
        sectionId: newSectionId
      };
    });

    // Ensure next academic year exists in db.academicYears
    let updatedYears = [...db.academicYears];
    if (!updatedYears.some(y => y.year === nextYear)) {
      updatedYears.push({
        id: nextYear,
        year: nextYear,
        isCurrent: false
      });
    }

    let updatedDb: AppDatabase = {
      ...db,
      students: updatedStudents,
      academicYears: updatedYears
    };

    updatedDb = logAuditAction(
      updatedDb,
      'STUDENT_PROMOTION',
      `Promoted ${selectedStudentIds.length} students from ${sourceClass?.nameEn} to ${targetClass.nameEn} for session ${nextYear} based on Annual Cumulative Merit List`
    );

    onUpdateDb(updatedDb);

    setPromotionSuccessMessage(
      `Successfully promoted ${selectedStudentIds.length} students to ${targetClass.nameEn} (Academic Session ${nextYear})! Merit rolls and class assignments have been saved.`
    );

    setTimeout(() => {
      setPromotionSuccessMessage(null);
    }, 8000);
  };

  // Printing & Downloading Merit List
  const handlePrintMeritList = () => {
    const cardEl = document.getElementById('annual-merit-print-table');
    if (cardEl) {
      printDocument(
        `${db.schoolSettings.nameEn} - Annual Merit List (${sourceClass?.nameEn} • ${currentYear})`,
        cardEl.innerHTML
      );
    } else {
      window.print();
    }
  };

  const handleDownloadMeritHtml = () => {
    const cardEl = document.getElementById('annual-merit-print-table');
    if (cardEl) {
      downloadHtmlDocument(
        `Annual_Merit_List_${sourceClass?.nameEn.replace(/\s+/g, '_')}_${currentYear}`,
        `${db.schoolSettings.nameEn} - Consolidated Annual Merit List`,
        cardEl.innerHTML
      );
    }
  };

  const handleDownloadMeritCsv = () => {
    const headers = [
      'Merit Rank',
      'Roll No',
      'Student ID',
      'Student Name',
      'Class',
      ...selectedExamIds.map(eid => db.examinations.find(e => e.id === eid)?.name || 'Exam'),
      'Annual Total Marks',
      'Annual Percentage',
      'Annual GPA',
      'Promotion Status'
    ];

    const rows = annualRecords.map(rec => [
      rec.meritRank,
      rec.student.rollNo,
      rec.student.studentId,
      rec.student.nameEn,
      sourceClass?.nameEn || '',
      ...selectedExamIds.map(eid => rec.examMarksMap[eid]?.total ?? 0),
      rec.annualTotalMarks,
      `${rec.annualPercentage.toFixed(1)}%`,
      rec.annualGpa.toFixed(2),
      rec.isEligible ? 'Promoted' : 'Not Eligible'
    ]);

    downloadCsv(`Annual_Merit_Tabulation_${sourceClass?.nameEn.replace(/\s+/g, '_')}_${currentYear}`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span>Student Promotion & Annual Consolidated Merit Engine</span>
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Combines all semester/term examinations conducted in the year into a final consolidated Merit List, and promotes students from Class 6 to 7, 7 to 8, etc.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadMeritCsv}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-gray-600" />
            <span>Download CSV</span>
          </button>
          <button
            onClick={handleDownloadMeritHtml}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-gray-600" />
            <span>Export HTML</span>
          </button>
          <button
            onClick={handlePrintMeritList}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Merit Tabulation</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {promotionSuccessMessage && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-300 text-emerald-950 rounded-2xl flex items-center gap-3 text-xs font-semibold shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="flex-1">
            <p className="font-bold text-sm">Promotion Successful!</p>
            <p className="text-emerald-800 mt-0.5">{promotionSuccessMessage}</p>
          </div>
        </div>
      )}

      {/* Configuration & Selection Panel */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-4 no-print text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {/* Source Class */}
          <div>
            <label className="block font-bold text-gray-700 mb-1">
              1. Source Class to Promote *
            </label>
            <select
              value={sourceClassId}
              onChange={e => setSourceClassId(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 font-bold text-gray-900"
            >
              {db.classes.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.nameEn} (Level {cls.numericValue})
                </option>
              ))}
            </select>
          </div>

          {/* Current Academic Session */}
          <div>
            <label className="block font-bold text-gray-700 mb-1">
              2. Current Academic Session *
            </label>
            <select
              value={currentYear}
              onChange={e => setCurrentYear(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 font-bold text-gray-900"
            >
              {db.academicYears.map(ay => (
                <option key={ay.id} value={ay.year}>
                  Session {ay.year} {ay.isCurrent ? '(Active)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Target Next Class */}
          <div>
            <label className="block font-bold text-gray-700 mb-1">
              3. Target Next Class *
            </label>
            <select
              value={targetClassId}
              onChange={e => setTargetClassId(e.target.value)}
              className="w-full bg-blue-50 border border-blue-300 text-blue-950 rounded-xl p-2.5 font-bold"
            >
              <option value="">Select Target Class...</option>
              {db.classes.map(cls => (
                <option key={cls.id} value={cls.id}>
                  Promote to {cls.nameEn}
                </option>
              ))}
            </select>
          </div>

          {/* Target Next Academic Session */}
          <div>
            <label className="block font-bold text-gray-700 mb-1">
              4. Target Next Session *
            </label>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={nextYear}
                onChange={e => setNextYear(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 font-bold font-mono text-gray-900"
                placeholder="e.g. 2027"
              />
            </div>
          </div>
        </div>

        {/* Multi-Exam Combination Selection (Requirement 8) */}
        <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="font-bold text-blue-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Award className="w-4 h-4 text-blue-700" />
                Examinations / Semesters to Include in Annual Merit List:
              </span>
              <p className="text-[11px] text-blue-800">
                All selected exams will be combined to sum the students' cumulative marks across the entire year.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (selectedExamIds.length === currentYearExams.length) {
                  setSelectedExamIds([]);
                } else {
                  setSelectedExamIds(currentYearExams.map(e => e.id));
                }
              }}
              className="text-[11px] font-bold text-blue-700 hover:text-blue-900 hover:underline cursor-pointer"
            >
              {selectedExamIds.length === currentYearExams.length ? 'Deselect All' : 'Select All Examinations'}
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {currentYearExams.length > 0 ? (
              currentYearExams.map(exam => {
                const isSelected = selectedExamIds.includes(exam.id);
                return (
                  <button
                    key={exam.id}
                    type="button"
                    onClick={() => {
                      setSelectedExamIds(prev =>
                        isSelected ? prev.filter(x => x !== exam.id) : [...prev, exam.id]
                      );
                    }}
                    className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 transition-colors cursor-pointer text-xs ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {isSelected ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                    <span>{exam.name}</span>
                  </button>
                );
              })
            ) : (
              <span className="text-gray-500 italic">No exams recorded for session {currentYear}.</span>
            )}
          </div>
        </div>

        {/* Section & Roll Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="block font-bold text-gray-700 mb-1">
              Target Section Assignment in New Class
            </label>
            <select
              value={targetSectionId}
              onChange={e => setTargetSectionId(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 font-medium"
            >
              <option value="same">Keep Current Section (or Match Section Name)</option>
              {db.sections
                .filter(s => !targetClassId || s.classId === targetClassId)
                .map(sec => (
                  <option key={sec.id} value={sec.id}>
                    Assign to {sec.name} ({sec.capacity} seats)
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">
              Roll Number Assignment Strategy
            </label>
            <select
              value={rollAssignmentMethod}
              onChange={e => setRollAssignmentMethod(e.target.value as any)}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 font-medium"
            >
              <option value="merit">
                Auto-assign Roll Number by Annual Merit Rank (1st = Roll 1, 2nd = Roll 2)
              </option>
              <option value="retain">Retain Existing Roll Number</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs no-print">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-gray-500 block">Class Students</span>
          <strong className="text-lg font-black text-gray-900">{classStudents.length} Enrolled</strong>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-gray-500 block">Examinations Combined</span>
          <strong className="text-lg font-black text-blue-700">{selectedExamIds.length} Terms / Semesters</strong>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-gray-500 block">Eligible for Promotion</span>
          <strong className="text-lg font-black text-emerald-700">
            {annualRecords.filter(r => r.isEligible).length} Students
          </strong>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-gray-500 block">Selected for Promotion</span>
          <strong className="text-lg font-black text-purple-700">
            {selectedStudentIds.length} Students
          </strong>
        </div>
      </div>

      {/* Annual Merit Table & Promotion Execution */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
        {/* Table Action Bar */}
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-3">
            <button
              onClick={handleSelectAll}
              className="bg-white hover:bg-gray-100 text-gray-800 text-xs font-bold px-3 py-1.5 rounded-lg border flex items-center gap-1.5 cursor-pointer"
            >
              {selectedStudentIds.length === annualRecords.length ? (
                <>
                  <CheckSquare className="w-4 h-4 text-blue-600" />
                  <span>Deselect All</span>
                </>
              ) : (
                <>
                  <Square className="w-4 h-4 text-gray-400" />
                  <span>Select All ({annualRecords.length})</span>
                </>
              )}
            </button>
            <span className="text-xs text-gray-500 font-medium">
              {selectedStudentIds.length} of {annualRecords.length} students selected
            </span>
          </div>

          <button
            onClick={handlePromoteStudents}
            disabled={selectedStudentIds.length === 0 || !targetClassId}
            className={`font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all ${
              selectedStudentIds.length > 0 && targetClassId
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span>
              Promote {selectedStudentIds.length} Selected Students to {db.classes.find(c => c.id === targetClassId)?.nameEn || 'Next Class'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Printable & Screen Annual Merit Table */}
        <div id="annual-merit-print-table" className="p-4 sm:p-6 overflow-x-auto">
          {/* Institutional Print Header */}
          <div className="text-center border-b-2 border-gray-800 pb-3 mb-4">
            <h2 className="text-lg font-black uppercase text-gray-900">
              {db.schoolSettings.nameEn}
            </h2>
            <p className="text-xs text-gray-600">
              {db.schoolSettings.address} • EIIN: {db.schoolSettings.eiin}
            </p>
            <div className="inline-block mt-2 bg-blue-900 text-white text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
              Official Annual Consolidated Merit List & Student Promotion Statement
            </div>
            <p className="text-xs font-bold text-gray-800 mt-1">
              Class: {sourceClass?.nameEn} • Academic Session: {currentYear} • Combined Semesters / Examinations: {selectedExamIds.length}
            </p>
          </div>

          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-800 border">
                <th className="py-2.5 px-3 text-center border w-10 no-print">Select</th>
                <th className="py-2.5 px-3 text-center border font-bold">Merit Rank</th>
                <th className="py-2.5 px-3 text-center border font-mono">Current Roll</th>
                <th className="py-2.5 px-3 text-left border">Student Name & ID</th>
                <th className="py-2.5 px-3 text-center border">Section</th>

                {/* Columns for each included Examination */}
                {selectedExamIds.map(eid => {
                  const ex = db.examinations.find(e => e.id === eid);
                  return (
                    <th key={eid} className="py-2.5 px-2 text-center border font-semibold">
                      {ex?.name || 'Exam'}
                    </th>
                  );
                })}

                <th className="py-2.5 px-3 text-center border font-black bg-blue-50 text-blue-950">
                  Annual Grand Total
                </th>
                <th className="py-2.5 px-2 text-center border font-bold">Percentage</th>
                <th className="py-2.5 px-2 text-center border font-bold text-blue-900">Annual GPA</th>
                <th className="py-2.5 px-3 text-center border font-bold">Status</th>
                <th className="py-2.5 px-3 text-center border font-bold text-emerald-900 bg-emerald-50 no-print">
                  Next Roll in {db.classes.find(c => c.id === targetClassId)?.nameEn || 'Next Class'}
                </th>
              </tr>
            </thead>
            <tbody>
              {annualRecords.length > 0 ? (
                annualRecords.map(rec => {
                  const isSelected = selectedStudentIds.includes(rec.student.id);

                  return (
                    <tr
                      key={rec.student.id}
                      className={`border-b transition-colors hover:bg-blue-50/40 ${
                        isSelected ? 'bg-blue-50/20' : ''
                      }`}
                    >
                      <td className="py-2 px-3 text-center border no-print">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectStudent(rec.student.id)}
                          className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                        />
                      </td>

                      <td className="py-2 px-3 text-center border">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-black ${
                            rec.meritRank === 1
                              ? 'bg-yellow-100 text-yellow-900 border border-yellow-300'
                              : rec.meritRank === 2
                              ? 'bg-gray-200 text-gray-800'
                              : rec.meritRank === 3
                              ? 'bg-amber-100 text-amber-900'
                              : 'text-gray-700 font-mono'
                          }`}
                        >
                          #{rec.meritRank}
                        </span>
                      </td>

                      <td className="py-2 px-3 text-center border font-mono font-bold text-gray-700">
                        #{rec.student.rollNo}
                      </td>

                      <td className="py-2 px-3 border">
                        <div className="font-bold text-gray-900">{rec.student.nameEn}</div>
                        <div className="text-[10px] text-gray-400 font-mono">
                          ID: {rec.student.studentId}
                        </div>
                      </td>

                      <td className="py-2 px-3 text-center border text-gray-600">
                        {db.sections.find(s => s.id === rec.student.sectionId)?.name || 'Section A'}
                      </td>

                      {/* Semester / Exam Marks */}
                      {selectedExamIds.map(eid => {
                        const scoreObj = rec.examMarksMap[eid];
                        return (
                          <td key={eid} className="py-2 px-2 text-center border font-mono text-gray-700">
                            {scoreObj ? (
                              <div>
                                <span className="font-bold">{scoreObj.total}</span>
                                <span className="text-[10px] text-gray-400 block">
                                  GPA {scoreObj.gpa.toFixed(2)}
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-300">-</span>
                            )}
                          </td>
                        );
                      })}

                      {/* Cumulative Total */}
                      <td className="py-2 px-3 text-center border font-mono font-black text-sm bg-blue-50/60 text-blue-950">
                        {rec.annualTotalMarks}
                      </td>

                      <td className="py-2 px-2 text-center border font-mono font-bold text-gray-800">
                        {rec.annualPercentage.toFixed(1)}%
                      </td>

                      <td className="py-2 px-2 text-center border font-mono font-extrabold text-blue-900">
                        {rec.annualGpa.toFixed(2)}
                      </td>

                      <td className="py-2 px-3 text-center border font-bold">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] uppercase ${
                            rec.isEligible
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {rec.isEligible ? 'Promoted' : 'Retain'}
                        </span>
                      </td>

                      {/* Next Roll input */}
                      <td className="py-2 px-3 text-center border bg-emerald-50/30 no-print">
                        <input
                          type="number"
                          min="1"
                          value={
                            customRolls[rec.student.id] ??
                            (rollAssignmentMethod === 'merit' ? rec.meritRank : rec.student.rollNo)
                          }
                          onChange={e => {
                            setCustomRolls({
                              ...customRolls,
                              [rec.student.id]: Number(e.target.value) || 1
                            });
                          }}
                          className="w-16 text-center border rounded p-1 font-mono font-bold bg-white text-xs"
                        />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={8 + selectedExamIds.length}
                    className="py-8 text-center text-gray-400 italic"
                  >
                    No students found in {sourceClass?.nameEn} for session {currentYear}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Institutional Signature Footer */}
          <div className="pt-10 grid grid-cols-3 text-center text-[10px] text-gray-600">
            <div className="border-t border-gray-400 pt-1">Prepared By (Class Teacher)</div>
            <div className="border-t border-gray-400 pt-1">Checked By (Exam Controller)</div>
            <div className="border-t border-gray-400 pt-1 font-bold text-gray-900">
              Approved By (Principal / Headmaster)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
