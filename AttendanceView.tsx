import React, { useState } from 'react';
import {
  CalendarCheck,
  Check,
  X,
  Clock,
  Calendar,
  Save,
  CheckCircle2,
  Users
} from 'lucide-react';
import { AppDatabase, logAuditAction } from '../services/storage';

interface AttendanceViewProps {
  db: AppDatabase;
  onUpdateDb: (updated: AppDatabase) => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  db,
  onUpdateDb
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedClassId, setSelectedClassId] = useState<string>(db.classes[0]?.id || 'c10');
  const [selectedSectionId, setSelectedSectionId] = useState<string>(db.sections[0]?.id || 's-padma-10');

  const students = db.students.filter(
    s => s.classId === selectedClassId && s.sectionId === selectedSectionId && s.status === 'active'
  );

  // Status mapping: studentId -> 'present' | 'absent' | 'late' | 'leave'
  const [statusMap, setStatusMap] = useState<Record<string, 'present' | 'absent' | 'late' | 'leave'>>(() => {
    const map: Record<string, 'present' | 'absent' | 'late' | 'leave'> = {};
    for (const s of students) {
      map[s.id] = 'present'; // default present
    }
    return map;
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const markAll = (status: 'present' | 'absent') => {
    const map: Record<string, 'present' | 'absent' | 'late' | 'leave'> = {};
    for (const s of students) {
      map[s.id] = status;
    }
    setStatusMap(map);
  };

  const handleSaveAttendance = () => {
    const presentCount = Object.values(statusMap).filter(v => v === 'present').length;
    let updatedDb = logAuditAction(
      db,
      'MARK_ATTENDANCE',
      `Marked attendance for ${students.length} students on ${selectedDate} (${presentCount} present)`
    );

    onUpdateDb(updatedDb);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const presentCount = Object.values(statusMap).filter(v => v === 'present').length;
  const absentCount = Object.values(statusMap).filter(v => v === 'absent').length;
  const lateCount = Object.values(statusMap).filter(v => v === 'late').length;
  const leaveCount = Object.values(statusMap).filter(v => v === 'leave').length;
  const attendanceRate = students.length > 0 ? ((presentCount + lateCount) / students.length) * 100 : 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-cyan-600" />
            Attendance Management & Daily Roll Call
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Record student daily presence, absence, late arrivals, and approved leave records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => markAll('present')}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-2 rounded-lg border border-emerald-200"
          >
            Mark All Present
          </button>
          <button
            onClick={handleSaveAttendance}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-5 py-2 rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Save Attendance
          </button>
        </div>
      </div>

      {/* Selectors and Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-2xs text-xs">
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 font-mono"
          />
        </div>
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Class</label>
          <select
            value={selectedClassId}
            onChange={e => setSelectedClassId(e.target.value)}
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
          <label className="block font-semibold text-gray-700 mb-1">Section</label>
          <select
            value={selectedSectionId}
            onChange={e => setSelectedSectionId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2"
          >
            {db.sections.map(s => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-2.5 text-center flex flex-col justify-center">
          <span className="text-[10px] uppercase font-bold text-cyan-800 tracking-wider">
            Today's Rate
          </span>
          <span className="text-xl font-black text-cyan-900">
            {attendanceRate.toFixed(1)}%
          </span>
        </div>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3 rounded-lg text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Attendance marked successfully!
        </div>
      )}

      {/* Attendance Sheet */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="p-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between text-xs">
          <span className="font-bold text-gray-700">
            Student Register ({students.length} Students)
          </span>
          <div className="flex items-center gap-3 font-semibold">
            <span className="text-emerald-700">Present: {presentCount}</span>
            <span className="text-red-600">Absent: {absentCount}</span>
            <span className="text-amber-600">Late: {lateCount}</span>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {students.map(st => {
            const currentStatus = statusMap[st.id] || 'present';
            return (
              <div key={st.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center font-bold font-mono text-xs">
                    #{st.rollNo}
                  </span>
                  <div>
                    <h5 className="font-bold text-gray-900 text-xs">{st.nameEn}</h5>
                    <p className="text-[11px] font-mono text-gray-500">{st.studentId}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setStatusMap(prev => ({ ...prev, [st.id]: 'present' }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      currentStatus === 'present'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Present (P)
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusMap(prev => ({ ...prev, [st.id]: 'absent' }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      currentStatus === 'absent'
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Absent (A)
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusMap(prev => ({ ...prev, [st.id]: 'late' }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      currentStatus === 'late'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Late (L)
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusMap(prev => ({ ...prev, [st.id]: 'leave' }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      currentStatus === 'leave'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Leave
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
