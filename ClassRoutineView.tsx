import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Printer,
  BookOpen,
  GraduationCap,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  AlertTriangle,
  CheckCircle2,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { AppDatabase, logAuditAction } from '../services/storage';
import { RoutinePeriod, ClassRoutine } from '../types';

interface ClassRoutineViewProps {
  db: AppDatabase;
  onUpdateDb?: (updated: AppDatabase) => void;
}

export const ClassRoutineView: React.FC<ClassRoutineViewProps> = ({ db, onUpdateDb }) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(db.classes[0]?.id || 'c10');
  const [selectedShiftId, setSelectedShiftId] = useState<string>(db.shifts?.[0]?.id || 'shift-morning');
  const [bannerMsg, setBannerMsg] = useState('');

  // Editing state
  const [isEditingModalOpen, setIsEditingModalOpen] = useState(false);
  const [editTab, setEditTab] = useState<'periods' | 'timetable'>('timetable');
  const [activeDayEdit, setActiveDayEdit] = useState<string>('Saturday');

  // Days list
  const days = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];

  // Current active routine from database or template fallback
  const currentRoutine = db.routines?.find(
    r => r.classId === selectedClassId && r.shiftId === selectedShiftId
  ) || db.routines?.[0] || {
    id: `routine-${selectedClassId}-${selectedShiftId}`,
    classId: selectedClassId,
    shiftId: selectedShiftId,
    academicYear: db.schoolSettings.currentAcademicYear,
    periods: [
      { id: 'p1', name: '1st', time: '09:00 - 09:45 AM', startTime: '09:00 AM', endTime: '09:45 AM', ordering: 1 },
      { id: 'p2', name: '2nd', time: '09:45 - 10:30 AM', startTime: '09:45 AM', endTime: '10:30 AM', ordering: 2 },
      { id: 'p3', name: '3rd', time: '10:30 - 11:15 AM', startTime: '10:30 AM', endTime: '11:15 AM', ordering: 3 },
      { id: 'p4', name: '4th', time: '11:15 - 12:00 PM', startTime: '11:15 AM', endTime: '12:00 PM', ordering: 4 },
      { id: 'p-break', name: 'Tiffin Break', time: '12:00 - 12:45 PM', startTime: '12:00 PM', endTime: '12:45 PM', isBreak: true, ordering: 5 },
      { id: 'p5', name: '5th', time: '12:45 - 01:30 PM', startTime: '12:45 PM', endTime: '01:30 PM', ordering: 6 },
      { id: 'p6', name: '6th', time: '01:30 - 02:15 PM', startTime: '01:30 PM', endTime: '02:15 PM', ordering: 7 },
      { id: 'p7', name: '7th', time: '02:15 - 03:00 PM', startTime: '02:15 PM', endTime: '03:00 PM', ordering: 8 }
    ],
    schedule: {
      Saturday: ['Bangla 1st', 'English 1st', 'General Math', 'Physics', 'Tiffin', 'Chemistry', 'Biology', 'ICT'],
      Sunday: ['English 2nd', 'Bangla 2nd', 'Higher Math', 'General Math', 'Tiffin', 'Physics (PR)', 'Physics (PR)', 'BGS'],
      Monday: ['Bangla 1st', 'Physics', 'Chemistry', 'English 1st', 'Tiffin', 'General Math', 'Religion', 'ICT'],
      Tuesday: ['General Math', 'Chemistry (PR)', 'Chemistry (PR)', 'Bangla 2nd', 'Tiffin', 'English 2nd', 'Biology', 'BGS'],
      Wednesday: ['Higher Math', 'Biology (PR)', 'Biology (PR)', 'Physics', 'Tiffin', 'Chemistry', 'General Math', 'Physical Ed'],
      Thursday: ['Bangla 1st', 'English 1st', 'General Math', 'Class Test / Revision', 'Tiffin', 'Cultural / Sports', 'Weekly Assembly', 'Club Activity']
    }
  };

  // Draft state for modal editing
  const [draftPeriods, setDraftPeriods] = useState<RoutinePeriod[]>([]);
  const [draftSchedule, setDraftSchedule] = useState<Record<string, string[]>>({});
  const [overlapWarning, setOverlapWarning] = useState<string>('');

  // Add new period form in modal
  const [newPeriodName, setNewPeriodName] = useState('');
  const [newPeriodStart, setNewPeriodStart] = useState('03:00 PM');
  const [newPeriodEnd, setNewPeriodEnd] = useState('03:45 PM');
  const [newPeriodIsBreak, setNewPeriodIsBreak] = useState(false);

  // Helper to open edit modal
  const handleOpenEditModal = () => {
    setDraftPeriods(JSON.parse(JSON.stringify(currentRoutine.periods || [])));
    setDraftSchedule(JSON.parse(JSON.stringify(currentRoutine.schedule || {})));
    setOverlapWarning('');
    setIsEditingModalOpen(true);
  };

  // Parse time string e.g. "09:30 AM" into minutes from midnight for overlap comparison
  const parseTimeToMinutes = (timeStr?: string): number => {
    if (!timeStr) return 0;
    const parts = timeStr.trim().split(/[:\s]/);
    if (parts.length < 3) return 0;
    let hours = parseInt(parts[0], 10) || 0;
    const mins = parseInt(parts[1], 10) || 0;
    const ampm = parts[2]?.toUpperCase();
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    return hours * 60 + mins;
  };

  // Validate period overlaps
  const checkPeriodOverlaps = (periodList: RoutinePeriod[]): string => {
    for (let i = 0; i < periodList.length; i++) {
      const p1 = periodList[i];
      const s1 = parseTimeToMinutes(p1.startTime);
      const e1 = parseTimeToMinutes(p1.endTime);
      if (s1 > 0 && e1 > 0 && s1 >= e1) {
        return `Period "${p1.name}" has an invalid interval: start time (${p1.startTime}) must be before end time (${p1.endTime}).`;
      }
      for (let j = i + 1; j < periodList.length; j++) {
        const p2 = periodList[j];
        const s2 = parseTimeToMinutes(p2.startTime);
        const e2 = parseTimeToMinutes(p2.endTime);
        if (s1 > 0 && e1 > 0 && s2 > 0 && e2 > 0) {
          if (Math.max(s1, s2) < Math.min(e1, e2)) {
            return `Overlap conflict detected between period "${p1.name}" (${p1.startTime} - ${p1.endTime}) and "${p2.name}" (${p2.startTime} - ${p2.endTime}). Please adjust times.`;
          }
        }
      }
    }
    return '';
  };

  // Add new period to draft
  const handleAddPeriodToDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPeriodName.trim()) return;

    const newPeriod: RoutinePeriod = {
      id: `period-${Date.now()}`,
      name: newPeriodName.trim(),
      time: `${newPeriodStart} - ${newPeriodEnd}`,
      startTime: newPeriodStart,
      endTime: newPeriodEnd,
      isBreak: newPeriodIsBreak,
      ordering: draftPeriods.length + 1
    };

    const nextPeriods = [...draftPeriods, newPeriod];
    const conflict = checkPeriodOverlaps(nextPeriods);
    if (conflict) {
      setOverlapWarning(conflict);
    } else {
      setOverlapWarning('');
    }

    setDraftPeriods(nextPeriods);

    // Expand draft schedule for each day to include empty slot for new period
    const nextSchedule = { ...draftSchedule };
    days.forEach(day => {
      if (!nextSchedule[day]) nextSchedule[day] = [];
      nextSchedule[day].push(newPeriodIsBreak ? 'Tiffin' : 'Study Period');
    });
    setDraftSchedule(nextSchedule);

    setNewPeriodName('');
  };

  // Delete period from draft
  const handleDeletePeriodFromDraft = (index: number) => {
    const nextPeriods = draftPeriods.filter((_, i) => i !== index);
    setDraftPeriods(nextPeriods);

    const nextSchedule = { ...draftSchedule };
    days.forEach(day => {
      if (nextSchedule[day]) {
        nextSchedule[day] = nextSchedule[day].filter((_, i) => i !== index);
      }
    });
    setDraftSchedule(nextSchedule);
    setOverlapWarning(checkPeriodOverlaps(nextPeriods));
  };

  // Update cell subject in draft
  const handleCellSubjectChange = (day: string, periodIdx: number, val: string) => {
    const nextSchedule = { ...draftSchedule };
    if (!nextSchedule[day]) {
      nextSchedule[day] = draftPeriods.map(() => 'General Class');
    }
    nextSchedule[day] = [...nextSchedule[day]];
    nextSchedule[day][periodIdx] = val;
    setDraftSchedule(nextSchedule);
  };

  // Save routine changes to database
  const handleSaveRoutineToDatabase = () => {
    const conflict = checkPeriodOverlaps(draftPeriods);
    if (conflict) {
      setOverlapWarning(conflict);
      return;
    }

    const updatedRoutine: ClassRoutine = {
      id: currentRoutine.id,
      classId: selectedClassId,
      shiftId: selectedShiftId,
      academicYear: db.schoolSettings.currentAcademicYear,
      periods: draftPeriods,
      schedule: draftSchedule
    };

    const existingRoutines = db.routines || [];
    const otherRoutines = existingRoutines.filter(
      r => !(r.classId === selectedClassId && r.shiftId === selectedShiftId)
    );
    const updatedRoutines = [...otherRoutines, updatedRoutine];

    let updatedDb: AppDatabase = {
      ...db,
      routines: updatedRoutines
    };

    const selectedCls = db.classes.find(c => c.id === selectedClassId);
    const selectedShift = db.shifts?.find(s => s.id === selectedShiftId);

    updatedDb = logAuditAction(
      updatedDb,
      'UPDATE_CLASS_ROUTINE',
      `Updated class routine & timetable for ${selectedCls?.nameEn || 'Class'} (${selectedShift?.name || 'Shift'}) with ${draftPeriods.length} periods`
    );

    if (onUpdateDb) {
      onUpdateDb(updatedDb);
    }

    setIsEditingModalOpen(false);
    setBannerMsg(`Class routine for ${selectedCls?.nameEn} (${selectedShift?.name} Shift) saved successfully.`);
    setTimeout(() => setBannerMsg(''), 3500);
  };

  const selectedClass = db.classes.find(c => c.id === selectedClassId);
  const selectedShift = db.shifts?.find(s => s.id === selectedShiftId);
  const classSubjects = db.subjects.filter(s => s.classId === selectedClassId);

  return (
    <div className="space-y-5">
      {/* Top Header Controls (Hidden during print) */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <div>
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            Class Routine & Timetable Management
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure flexible periods, assign subjects and teachers, prevent overlapping periods, and print official schedules.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Class Selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-semibold text-gray-600">Class:</span>
            <select
              value={selectedClassId}
              onChange={e => setSelectedClassId(e.target.value)}
              className="font-bold bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1.5 text-gray-800"
            >
              {db.classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.nameEn}
                </option>
              ))}
            </select>
          </div>

          {/* Shift Selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-semibold text-gray-600">Shift:</span>
            <select
              value={selectedShiftId}
              onChange={e => setSelectedShiftId(e.target.value)}
              className="font-bold bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1.5 text-gray-800"
            >
              {(db.shifts || []).map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.startTime || 'Morning'})
                </option>
              ))}
            </select>
          </div>

          {/* Edit Routine Button */}
          <button
            onClick={handleOpenEditModal}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Routine</span>
          </button>

          {/* Print Button */}
          <button
            onClick={() => window.print()}
            className="bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Timetable</span>
          </button>
        </div>
      </div>

      {/* Success Banner */}
      {bannerMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold p-3 rounded-xl flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{bannerMsg}</span>
          </div>
          <button onClick={() => setBannerMsg('')} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Official Timetable Document Card */}
      <div className="bg-white rounded-2xl border-2 border-gray-300 p-6 shadow-md print-card overflow-x-auto">
        {/* Printable Official Header */}
        <div className="text-center border-b pb-4 mb-4">
          <div className="flex items-center justify-center gap-3 mb-1">
            {db.schoolSettings.logoUrl && (
              <img
                src={db.schoolSettings.logoUrl}
                alt={db.schoolSettings.nameEn}
                className="w-12 h-12 object-contain"
              />
            )}
            <div>
              <h4 className="text-base font-extrabold uppercase text-gray-900 tracking-wide">
                {db.schoolSettings.nameEn}
              </h4>
              <p className="text-xs text-gray-600">
                {db.schoolSettings.address}
              </p>
            </div>
          </div>
          <div className="text-[11px] text-gray-500 font-mono mt-0.5">
            Academic Session: <strong>{db.schoolSettings.currentAcademicYear}</strong> • EIIN: <strong>{db.schoolSettings.eiin}</strong> • Board: {db.schoolSettings.boardName}
          </div>
          <div className="mt-2 inline-block bg-indigo-50 border border-indigo-200 px-4 py-1 rounded-full text-indigo-900 font-bold text-xs uppercase tracking-wider">
            Weekly Class Schedule – {selectedClass?.nameEn} ({selectedShift?.name || 'Morning'} Shift)
          </div>
        </div>

        {/* Timetable Matrix */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-center border-collapse border border-gray-400">
            <thead className="bg-gray-100 font-bold text-gray-800">
              <tr>
                <th className="border border-gray-400 p-2.5 bg-gray-200 min-w-[90px]">
                  Day / Period
                </th>
                {currentRoutine.periods?.map((p, idx) => (
                  <th
                    key={p.id || idx}
                    className={`border border-gray-400 p-2 min-w-[110px] ${
                      p.isBreak ? 'bg-amber-100 text-amber-900' : 'bg-gray-100'
                    }`}
                  >
                    <div className="font-extrabold text-xs">{p.name}</div>
                    <div className="text-[10px] text-gray-500 font-mono font-normal mt-0.5">
                      {p.time || `${p.startTime} - ${p.endTime}`}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300">
              {days.map(day => {
                const daySchedule = currentRoutine.schedule?.[day] || [];
                return (
                  <tr key={day} className="hover:bg-gray-50/50">
                    <td className="border border-gray-400 p-2.5 font-bold bg-gray-50 text-gray-900 text-left">
                      {day}
                    </td>
                    {currentRoutine.periods?.map((p, pIdx) => {
                      const subjectEntry = daySchedule[pIdx] || (p.isBreak ? 'Tiffin' : '—');
                      const isBreak = p.isBreak || subjectEntry === 'Tiffin';
                      return (
                        <td
                          key={pIdx}
                          className={`border border-gray-400 p-2 text-xs ${
                            isBreak
                              ? 'bg-amber-50 font-bold text-amber-800'
                              : 'text-gray-800 font-medium'
                          }`}
                        >
                          <div className="leading-tight">{subjectEntry}</div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Official Signatures Section for Printing */}
        <div className="mt-12 pt-6 border-t border-gray-300 grid grid-cols-3 gap-4 text-center text-xs">
          <div>
            <div className="h-10"></div>
            <div className="border-t border-gray-500 w-36 mx-auto pt-1 font-bold text-gray-800">
              Class Teacher
            </div>
          </div>
          <div>
            <div className="h-10"></div>
            <div className="border-t border-gray-500 w-36 mx-auto pt-1 font-bold text-gray-800">
              Routine Convener
            </div>
          </div>
          <div>
            <div className="h-10"></div>
            <div className="border-t border-gray-500 w-44 mx-auto pt-1 font-bold text-gray-800">
              Headmaster / Principal
            </div>
          </div>
        </div>
      </div>

      {/* ================== EDIT ROUTINE MODAL ================== */}
      {isEditingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-5 no-print">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-gray-200">
            {/* Modal Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-indigo-600" />
                  Customize Timetable: {selectedClass?.nameEn} ({selectedShift?.name} Shift)
                </h3>
                <p className="text-xs text-gray-500">
                  Add or edit periods, configure operational times, assign subjects, and validate period overlaps.
                </p>
              </div>
              <button
                onClick={() => setIsEditingModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex items-center gap-2 px-4 pt-3 border-b bg-gray-50 text-xs font-bold">
              <button
                onClick={() => setEditTab('timetable')}
                className={`pb-2.5 px-3 border-b-2 cursor-pointer transition-colors ${
                  editTab === 'timetable'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                1. Assign Subjects by Day
              </button>
              <button
                onClick={() => setEditTab('periods')}
                className={`pb-2.5 px-3 border-b-2 cursor-pointer transition-colors ${
                  editTab === 'periods'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                2. Configure Periods & Timings ({draftPeriods.length})
              </button>
            </div>

            {/* Overlap Error Warning */}
            {overlapWarning && (
              <div className="mx-4 mt-3 p-3 bg-red-50 border border-red-300 text-red-900 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{overlapWarning}</span>
              </div>
            )}

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              {/* TAB 1: ASSIGN SUBJECTS BY DAY */}
              {editTab === 'timetable' && (
                <div className="space-y-4">
                  {/* Day Picker */}
                  <div className="flex flex-wrap items-center gap-2 bg-gray-100 p-2 rounded-xl">
                    <span className="font-bold text-gray-700 text-xs px-2">Select Day:</span>
                    {days.map(d => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setActiveDayEdit(d)}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer transition-colors ${
                          activeDayEdit === d
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-white text-gray-700 hover:bg-gray-200 border'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>

                  {/* Grid for Active Day */}
                  <div className="border rounded-xl overflow-hidden">
                    <div className="bg-gray-100 p-2.5 font-bold text-gray-800 flex justify-between items-center">
                      <span>Periods Schedule for {activeDayEdit}</span>
                      <span className="text-gray-500 text-[11px] font-normal font-mono">
                        {draftPeriods.length} Periods configured
                      </span>
                    </div>

                    <div className="divide-y divide-gray-200">
                      {draftPeriods.map((period, idx) => {
                        const currentVal = draftSchedule[activeDayEdit]?.[idx] || (period.isBreak ? 'Tiffin' : '');
                        return (
                          <div
                            key={period.id || idx}
                            className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50"
                          >
                            <div className="sm:w-1/3">
                              <span className="font-bold text-gray-900 block">{period.name}</span>
                              <span className="text-[11px] text-gray-500 font-mono">
                                {period.time || `${period.startTime} - ${period.endTime}`}
                                {period.isBreak && ' (Break)'}
                              </span>
                            </div>

                            <div className="flex-1 flex items-center gap-2">
                              {/* Subject Quick Selector */}
                              <select
                                value={currentVal}
                                onChange={e => handleCellSubjectChange(activeDayEdit, idx, e.target.value)}
                                className="w-full bg-white border border-gray-300 rounded-lg p-2 font-semibold text-gray-800"
                              >
                                {period.isBreak ? (
                                  <>
                                    <option value="Tiffin">Tiffin Break</option>
                                    <option value="Lunch Break">Lunch Break</option>
                                    <option value="Prayer Break">Prayer Break</option>
                                  </>
                                ) : (
                                  <>
                                    <option value="">— Select Subject —</option>
                                    {classSubjects.map(sub => (
                                      <option key={sub.id} value={sub.nameEn}>
                                        {sub.nameEn} ({sub.code})
                                      </option>
                                    ))}
                                    <option value="Class Test / Revision">Class Test / Revision</option>
                                    <option value="Physical Ed">Physical Education</option>
                                    <option value="Cultural / Sports">Cultural / Sports</option>
                                    <option value="Club Activity">Club Activity</option>
                                    <option value="Weekly Assembly">Weekly Assembly</option>
                                    <option value="Library Hour">Library Hour</option>
                                  </>
                                )}
                              </select>

                              {/* Manual Override Text Input */}
                              <input
                                type="text"
                                placeholder="Custom note / teacher"
                                value={currentVal}
                                onChange={e => handleCellSubjectChange(activeDayEdit, idx, e.target.value)}
                                className="w-1/2 bg-white border border-gray-300 rounded-lg p-2 font-medium"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CONFIGURE PERIODS & TIMINGS */}
              {editTab === 'periods' && (
                <div className="space-y-4">
                  {/* Add New Period Section */}
                  <form
                    onSubmit={handleAddPeriodToDraft}
                    className="bg-indigo-50/60 border border-indigo-200 rounded-xl p-3.5 space-y-3"
                  >
                    <span className="font-bold text-indigo-950 block text-xs flex items-center gap-1.5">
                      <Plus className="w-4 h-4 text-indigo-600" />
                      Add New Period to Routine
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <div className="sm:col-span-2">
                        <label className="block text-gray-700 font-semibold mb-1">Period Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 8th Period, Special Coaching"
                          value={newPeriodName}
                          onChange={e => setNewPeriodName(e.target.value)}
                          className="w-full bg-white border rounded p-1.5 font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-semibold mb-1">Start Time</label>
                        <input
                          type="text"
                          required
                          placeholder="03:00 PM"
                          value={newPeriodStart}
                          onChange={e => setNewPeriodStart(e.target.value)}
                          className="w-full bg-white border rounded p-1.5 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-semibold mb-1">End Time</label>
                        <input
                          type="text"
                          required
                          placeholder="03:45 PM"
                          value={newPeriodEnd}
                          onChange={e => setNewPeriodEnd(e.target.value)}
                          className="w-full bg-white border rounded p-1.5 font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="isBreakPeriod"
                          checked={newPeriodIsBreak}
                          onChange={e => setNewPeriodIsBreak(e.target.checked)}
                          className="rounded text-indigo-600"
                        />
                        <label htmlFor="isBreakPeriod" className="font-semibold text-gray-700 text-xs">
                          Mark as Break (Tiffin / Lunch / Prayer)
                        </label>
                      </div>

                      <button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-1.5 rounded-lg cursor-pointer shadow-xs text-xs"
                      >
                        Add Period
                      </button>
                    </div>
                  </form>

                  {/* Existing Periods Table */}
                  <div className="border rounded-xl overflow-hidden">
                    <div className="bg-gray-100 p-2.5 font-bold text-gray-800">
                      Configured Periods ({draftPeriods.length})
                    </div>
                    <div className="divide-y divide-gray-200">
                      {draftPeriods.map((p, idx) => (
                        <div
                          key={p.id || idx}
                          className="p-3 flex items-center justify-between hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-800 flex items-center justify-center font-bold text-xs">
                              {idx + 1}
                            </span>
                            <div>
                              <strong className="text-gray-900 text-xs">{p.name}</strong>
                              <span className="text-[11px] text-gray-500 font-mono ml-2">
                                {p.startTime || '—'} - {p.endTime || '—'}
                              </span>
                              {p.isBreak && (
                                <span className="ml-2 text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">
                                  Break
                                </span>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeletePeriodFromDraft(idx)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer transition-colors"
                            title="Delete Period"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t flex justify-end gap-2 bg-gray-50 rounded-b-2xl">
              <button
                type="button"
                onClick={() => setIsEditingModalOpen(false)}
                className="px-4 py-2 border rounded-xl text-gray-700 font-semibold hover:bg-white cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveRoutineToDatabase}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl cursor-pointer shadow-xs text-xs flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Save Timetable</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
