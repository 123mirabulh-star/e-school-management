import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Users,
  CheckCircle2,
  X,
  Settings2,
  DoorOpen,
  Clock,
  Sun,
  Sunrise,
  Sunset,
  AlertTriangle,
  Check,
  Boxes
} from 'lucide-react';
import { ClassLevel, Section, Shift } from '../types';
import { AppDatabase, logAuditAction, classSupportsGroups } from '../services/storage';
import { GroupSettingsView } from './GroupSettingsView';

interface ClassesSectionsViewProps {
  db: AppDatabase;
  onUpdateDb: (updated: AppDatabase) => void;
}

export const ClassesSectionsView: React.FC<ClassesSectionsViewProps> = ({
  db,
  onUpdateDb
}) => {
  const [activeTab, setActiveTab] = useState<'classes' | 'shifts' | 'groups'>('classes');
  const [bannerMsg, setBannerMsg] = useState('');

  // Shift Management State
  const shifts: Shift[] = db.shifts || [
    { id: 'shift-morning', name: 'Morning Shift', startTime: '07:30 AM', endTime: '12:00 PM', active: true },
    { id: 'shift-day', name: 'Day Shift', startTime: '12:30 PM', endTime: '05:00 PM', active: true }
  ];

  // Class Management State
  const [isAddingClass, setIsAddingClass] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassLevel | null>(null);
  const [classForm, setClassForm] = useState({
    nameEn: '',
    numericValue: '' as string | number,
    shifts: ['Morning Shift', 'Day Shift'] as string[],
    hasGroups: false
  });
  const [classFormError, setClassFormError] = useState('');
  const [deleteClassTarget, setDeleteClassTarget] = useState<ClassLevel | null>(null);

  // Section Management State
  const [isManagingSections, setIsManagingSections] = useState(false);
  const [selectedClassForSections, setSelectedClassForSections] = useState<ClassLevel | null>(null);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [secName, setSecName] = useState('Section A');
  const [secRoomNo, setSecRoomNo] = useState('');
  const [secCapacity, setSecCapacity] = useState(50);
  const [deleteSectionTarget, setDeleteSectionTarget] = useState<{ id: string; name: string } | null>(null);

  // Shift Management State
  const [isAddingShift, setIsAddingShift] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [shiftForm, setShiftForm] = useState({
    name: '',
    startTime: '07:30 AM',
    endTime: '12:00 PM',
    active: true
  });
  const [deleteShiftTarget, setDeleteShiftTarget] = useState<Shift | null>(null);

  const showBanner = (msg: string) => {
    setBannerMsg(msg);
    setTimeout(() => setBannerMsg(''), 3500);
  };

  /* ================== CLASS HANDLERS ================== */
  const handleOpenAddClass = () => {
    setEditingClass(null);
    const activeShiftNames = shifts.filter(s => s.active).map(s => s.name);
    setClassForm({
      nameEn: '',
      numericValue: '',
      shifts: activeShiftNames.length > 0 ? activeShiftNames : ['Morning Shift', 'Day Shift'],
      hasGroups: false
    });
    setClassFormError('');
    setIsAddingClass(true);
  };

  const handleOpenEditClass = (cls: ClassLevel) => {
    setEditingClass(cls);
    const assignedShifts = cls.shifts && cls.shifts.length > 0
      ? cls.shifts
      : ['Morning Shift', 'Day Shift'];
    setClassForm({
      nameEn: cls.nameEn,
      numericValue: cls.numericValue !== undefined ? cls.numericValue : '',
      shifts: assignedShifts,
      hasGroups: classSupportsGroups(cls)
    });
    setClassFormError('');
    setIsAddingClass(true);
  };

  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = classForm.nameEn.trim();
    if (!trimmedName) {
      setClassFormError('Class name is required.');
      return;
    }

    // Check duplicate class name (case-insensitive)
    const isDup = db.classes.some(
      c => c.nameEn.toLowerCase() === trimmedName.toLowerCase() && (!editingClass || c.id !== editingClass.id)
    );
    if (isDup) {
      setClassFormError(`A class named "${trimmedName}" already exists. Please choose a unique name.`);
      return;
    }

    const numVal = classForm.numericValue !== '' && !isNaN(Number(classForm.numericValue))
      ? Number(classForm.numericValue)
      : undefined;

    let updatedClasses = [...db.classes];
    let updatedSections = [...db.sections];

    if (editingClass) {
      updatedClasses = updatedClasses.map(c =>
        c.id === editingClass.id
          ? {
              ...c,
              nameEn: trimmedName,
              numericValue: numVal,
              shifts: classForm.shifts,
              hasGroups: classForm.hasGroups
            }
          : c
      );

      const updatedDb = logAuditAction(
        { ...db, classes: updatedClasses },
        'UPDATE_CLASS',
        `Updated class "${trimmedName}" (Shifts: ${classForm.shifts.join(', ') || 'None'}, Groups: ${classForm.hasGroups ? 'Enabled' : 'Disabled'})`
      );

      onUpdateDb(updatedDb);
      setIsAddingClass(false);
      setEditingClass(null);
      showBanner(`Class "${trimmedName}" updated successfully.`);
    } else {
      const newClass: ClassLevel = {
        id: `c${Date.now()}`,
        nameEn: trimmedName,
        numericValue: numVal,
        shifts: classForm.shifts,
        hasGroups: classForm.hasGroups
      };

      // Automatically create default Sections A, B, C, D for this new class
      const defaultSections: Section[] = [
        { id: `s-${newClass.id}-a`, classId: newClass.id, name: 'Section A', roomNo: '', capacity: 50 },
        { id: `s-${newClass.id}-b`, classId: newClass.id, name: 'Section B', roomNo: '', capacity: 50 },
        { id: `s-${newClass.id}-c`, classId: newClass.id, name: 'Section C', roomNo: '', capacity: 50 },
        { id: `s-${newClass.id}-d`, classId: newClass.id, name: 'Section D', roomNo: '', capacity: 50 }
      ];

      updatedClasses.push(newClass);
      updatedSections = [...updatedSections, ...defaultSections];

      let updatedDb: AppDatabase = {
        ...db,
        classes: updatedClasses,
        sections: updatedSections
      };

      updatedDb = logAuditAction(
        updatedDb,
        'ADD_CLASS',
        `Added new academic class: ${newClass.nameEn} with default Sections A, B, C, D (Shifts: ${classForm.shifts.join(', ')})`
      );

      onUpdateDb(updatedDb);
      setIsAddingClass(false);
      setEditingClass(null);
      showBanner(`Class "${newClass.nameEn}" created successfully.`);
    }
  };

  const handleConfirmDeleteClass = () => {
    if (!deleteClassTarget) return;
    const target = deleteClassTarget;

    const remainingClasses = db.classes.filter(c => c.id !== target.id);
    const remainingSections = db.sections.filter(s => s.classId !== target.id);

    let updatedDb: AppDatabase = {
      ...db,
      classes: remainingClasses,
      sections: remainingSections
    };

    updatedDb = logAuditAction(
      updatedDb,
      'DELETE_CLASS',
      `Deleted class ${target.nameEn} (Level: ${target.numericValue}) and its sections`
    );

    onUpdateDb(updatedDb);
    setDeleteClassTarget(null);
    showBanner(`Class "${target.nameEn}" and its sections deleted successfully.`);
  };

  /* ================== SECTION HANDLERS ================== */
  const handleOpenSectionManager = (cls: ClassLevel) => {
    setSelectedClassForSections(cls);
    setEditingSection(null);
    setSecName('Section A');
    setSecRoomNo('');
    setSecCapacity(50);
    setIsManagingSections(true);
  };

  const handleSaveSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassForSections || !secName.trim()) return;

    let updatedSections = [...db.sections];

    if (editingSection) {
      updatedSections = updatedSections.map(s =>
        s.id === editingSection.id
          ? { ...s, name: secName.trim(), roomNo: secRoomNo.trim(), capacity: Number(secCapacity) || 50 }
          : s
      );
    } else {
      const newSec: Section = {
        id: `sec-${Date.now()}`,
        classId: selectedClassForSections.id,
        name: secName.trim(),
        roomNo: secRoomNo.trim(),
        capacity: Number(secCapacity) || 50
      };
      updatedSections.push(newSec);
    }

    const updatedDb = logAuditAction(
      { ...db, sections: updatedSections },
      'UPDATE_SECTION',
      `${editingSection ? 'Updated' : 'Added'} section "${secName}" in ${selectedClassForSections.nameEn}`
    );

    onUpdateDb(updatedDb);
    setEditingSection(null);
    setSecName('');
    setSecRoomNo('');
    showBanner(`Section "${secName}" saved.`);
  };

  const handleConfirmDeleteSection = () => {
    if (!deleteSectionTarget) return;
    const updatedSections = db.sections.filter(s => s.id !== deleteSectionTarget.id);
    const updatedDb = logAuditAction(
      { ...db, sections: updatedSections },
      'DELETE_SECTION',
      `Deleted section "${deleteSectionTarget.name}"`
    );
    onUpdateDb(updatedDb);
    setDeleteSectionTarget(null);
    showBanner(`Section "${deleteSectionTarget.name}" deleted.`);
  };

  const handleApplyStandardSectionsABCD = () => {
    if (!selectedClassForSections) return;
    const cid = selectedClassForSections.id;
    const otherSections = db.sections.filter(s => s.classId !== cid);
    const standardABCD: Section[] = [
      { id: `s-${cid}-a`, classId: cid, name: 'Section A', roomNo: 'Room 1', capacity: 50 },
      { id: `s-${cid}-b`, classId: cid, name: 'Section B', roomNo: 'Room 2', capacity: 50 },
      { id: `s-${cid}-c`, classId: cid, name: 'Section C', roomNo: 'Room 3', capacity: 50 },
      { id: `s-${cid}-d`, classId: cid, name: 'Section D', roomNo: 'Room 4', capacity: 50 },
    ];

    const updatedDb = logAuditAction(
      { ...db, sections: [...otherSections, ...standardABCD] },
      'SET_STANDARD_SECTIONS',
      `Configured standard Sections A, B, C, D for ${selectedClassForSections.nameEn}`
    );
    onUpdateDb(updatedDb);
    showBanner(`Standard Sections A, B, C, D applied to ${selectedClassForSections.nameEn}.`);
  };

  /* ================== SHIFT HANDLERS ================== */
  const handleOpenAddShift = () => {
    setEditingShift(null);
    setShiftForm({
      name: '',
      startTime: '07:30 AM',
      endTime: '12:00 PM',
      active: true
    });
    setIsAddingShift(true);
  };

  const handleOpenEditShift = (shift: Shift) => {
    setEditingShift(shift);
    setShiftForm({
      name: shift.name,
      startTime: shift.startTime || '07:30 AM',
      endTime: shift.endTime || '12:00 PM',
      active: shift.active
    });
    setIsAddingShift(true);
  };

  const handleSaveShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shiftForm.name.trim()) return;

    let updatedShifts = [...shifts];
    if (editingShift) {
      updatedShifts = updatedShifts.map(s =>
        s.id === editingShift.id
          ? {
              ...s,
              name: shiftForm.name.trim(),
              startTime: shiftForm.startTime,
              endTime: shiftForm.endTime,
              active: shiftForm.active
            }
          : s
      );
    } else {
      const newShift: Shift = {
        id: `shift-${Date.now()}`,
        name: shiftForm.name.trim(),
        startTime: shiftForm.startTime,
        endTime: shiftForm.endTime,
        active: shiftForm.active
      };
      updatedShifts.push(newShift);
    }

    const updatedDb = logAuditAction(
      { ...db, shifts: updatedShifts },
      editingShift ? 'UPDATE_SHIFT' : 'ADD_SHIFT',
      `${editingShift ? 'Updated' : 'Added'} shift: ${shiftForm.name.trim()} (${shiftForm.startTime} - ${shiftForm.endTime})`
    );

    onUpdateDb(updatedDb);
    setIsAddingShift(false);
    setEditingShift(null);
    showBanner(`Shift "${shiftForm.name.trim()}" saved successfully.`);
  };

  const handleConfirmDeleteShift = () => {
    if (!deleteShiftTarget) return;
    const target = deleteShiftTarget;
    const updatedShifts = shifts.filter(s => s.id !== target.id);

    const updatedDb = logAuditAction(
      { ...db, shifts: updatedShifts },
      'DELETE_SHIFT',
      `Deleted shift: ${target.name}`
    );

    onUpdateDb(updatedDb);
    setDeleteShiftTarget(null);
    showBanner(`Shift "${target.name}" deleted.`);
  };

  return (
    <div className="space-y-5">
      {/* Top Header Card */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            Classes & Section Management
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure academic classes, section allocations, and institutional shift schedules (Morning, Day).
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'classes' && (
            <button
              onClick={handleOpenAddClass}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add New Class
            </button>
          )}
          {activeTab === 'shifts' && (
            <button
              onClick={handleOpenAddShift}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add New Shift
            </button>
          )}
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-1">
        <button
          onClick={() => setActiveTab('classes')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
            activeTab === 'classes'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Academic Classes & Sections ({db.classes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('shifts')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
            activeTab === 'shifts'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Shift Management ({shifts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('groups')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
            activeTab === 'groups'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Group Assignment Settings ({db.groups?.length || 0})</span>
        </button>
      </div>

      {/* Success Banner */}
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

      {/* ================== TAB 1: CLASSES & SECTIONS ================== */}
      {activeTab === 'classes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {db.classes.map(cls => {
            const classStudents = db.students.filter(s => s.classId === cls.id);
            const classSubjects = db.subjects.filter(s => s.classId === cls.id);
            const sections = db.sections.filter(s => s.classId === cls.id);
            const hasGroups = classSupportsGroups(cls);
            const assignedShifts = cls.shifts && cls.shifts.length > 0 ? cls.shifts : ['Morning Shift', 'Day Shift'];

            return (
              <div key={cls.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-start justify-between border-b pb-2">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">{cls.nameEn}</h4>
                      <p className="text-xs text-blue-700">
                        {cls.numericValue !== undefined ? `Numeric Level: ${cls.numericValue}` : 'Alphabetic / Word Class'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditClass(cls)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded border border-gray-200 hover:border-blue-300 cursor-pointer transition-colors"
                        title="Edit Class Name, Shifts & Group Settings"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenSectionManager(cls)}
                        className="bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 border border-blue-200 cursor-pointer"
                        title="Configure Sections"
                      >
                        <Settings2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>Sec ({sections.length})</span>
                      </button>
                      <button
                        onClick={() => setDeleteClassTarget(cls)}
                        className="p-1.5 text-red-600 hover:bg-red-50 hover:text-red-700 rounded border border-gray-200 hover:border-red-200 cursor-pointer transition-colors"
                        title={`Delete class ${cls.nameEn}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Assigned Shifts Badges */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-gray-500 block">Assigned Shifts:</span>
                    <div className="flex flex-wrap gap-1">
                      {assignedShifts.map((sh, idx) => (
                        <span key={idx} className="bg-indigo-50 text-indigo-700 text-[10px] font-semibold px-2 py-0.5 rounded border border-indigo-200">
                          {sh}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Group Stream Status Badge */}
                  {hasGroups && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-2 text-purple-900 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Boxes className="w-3.5 h-3.5 text-purple-600" />
                        <span className="text-[11px] font-bold">Groups: Science, Humanities, Business</span>
                      </div>
                      <span className="text-[9px] bg-purple-200/80 text-purple-800 font-bold px-1.5 py-0.5 rounded">
                        Active
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-2.5 rounded-lg">
                    <div>
                      <span className="text-gray-500 block">Enrolled:</span>
                      <strong className="text-gray-900">{classStudents.length} Students</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Subjects:</span>
                      <strong className="text-gray-900">{classSubjects.length} Assigned</strong>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] uppercase font-bold text-gray-500">
                        Active Sections ({sections.length}):
                      </span>
                      <button
                        onClick={() => handleOpenSectionManager(cls)}
                        className="text-[11px] text-blue-600 font-semibold hover:underline cursor-pointer"
                      >
                        Edit Sections
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {sections.length > 0 ? (
                        sections.map(sec => (
                          <span
                            key={sec.id}
                            onClick={() => handleOpenSectionManager(cls)}
                            className="text-xs font-semibold bg-gray-100 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 px-2 py-0.5 rounded-md text-gray-800 cursor-pointer transition-colors"
                            title="Click to edit section"
                          >
                            {sec.name} {sec.roomNo ? `• ${sec.roomNo}` : ''} ({sec.capacity} seats)
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400 italic">No sections configured.</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t text-[11px]">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditClass(cls)}
                      className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => setDeleteClassTarget(cls)}
                      className="text-red-600 hover:text-red-800 font-semibold flex items-center gap-1 cursor-pointer ml-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                  <button
                    onClick={() => handleOpenSectionManager(cls)}
                    className="text-blue-600 hover:underline font-semibold cursor-pointer"
                  >
                    Manage Sections →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================== TAB 3: GROUP ASSIGNMENT SETTINGS ================== */}
      {activeTab === 'groups' && (
        <GroupSettingsView db={db} onUpdateDb={onUpdateDb} />
      )}

      {/* ================== TAB 2: SHIFT MANAGEMENT ================== */}
      {activeTab === 'shifts' && (
        <div className="space-y-4">
          <div className="bg-indigo-50/60 border border-indigo-200 rounded-xl p-4 text-xs text-indigo-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-sm text-indigo-900 flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-500" />
                Institutional Shifts (Default: Morning & Day)
              </h4>
              <p className="text-[11px] text-indigo-800/80 mt-0.5">
                Manage operational shifts for classes, routines, and timetable schedules. Shifts can be edited, added, or safely deleted.
              </p>
            </div>
            <button
              onClick={handleOpenAddShift}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3.5 py-2 rounded-lg text-xs flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Shift</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shifts.map(shift => {
              const isMorning = shift.name.toLowerCase().includes('morning');
              const isDay = shift.name.toLowerCase().includes('day');
              return (
                <div key={shift.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        isMorning ? 'bg-amber-100 text-amber-700' : isDay ? 'bg-sky-100 text-sky-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {isMorning ? <Sunrise className="w-5 h-5" /> : isDay ? <Sun className="w-5 h-5" /> : <Sunset className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">{shift.name} Shift</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.2 rounded uppercase ${
                          shift.active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {shift.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditShift(shift)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded cursor-pointer transition-colors"
                        title="Edit Shift"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteShiftTarget(shift)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer transition-colors"
                        title="Delete Shift"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Operating Hours:</span>
                      <strong className="text-gray-900 font-mono">
                        {shift.startTime || '07:30 AM'} - {shift.endTime || '12:00 PM'}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Routines Linked:</span>
                      <span className="font-semibold text-gray-700">
                        {db.routines?.filter(r => r.shiftId === shift.id).length || 0} Routine(s)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t text-xs">
                    <button
                      onClick={() => handleOpenEditShift(shift)}
                      className="text-blue-600 hover:underline font-semibold cursor-pointer"
                    >
                      Edit Name & Hours
                    </button>
                    <button
                      onClick={() => setDeleteShiftTarget(shift)}
                      className="text-red-600 hover:text-red-800 font-semibold cursor-pointer flex items-center gap-1 text-[11px]"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================== MODALS ================== */}

      {/* Delete Class Confirmation Modal */}
      {deleteClassTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Confirm Class Deletion
              </h3>
              <button onClick={() => setDeleteClassTarget(null)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-gray-700">
              <p>
                Are you sure you want to permanently delete this academic class from the system?
              </p>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div className="font-bold text-gray-900 text-sm">{deleteClassTarget.nameEn}</div>
                <div className="text-gray-600 font-mono text-[11px]">Numeric Level Value: {deleteClassTarget.numericValue}</div>
              </div>

              {(() => {
                const stdCount = db.students.filter(s => s.classId === deleteClassTarget.id).length;
                const subCount = db.subjects.filter(s => s.classId === deleteClassTarget.id).length;
                if (stdCount > 0 || subCount > 0) {
                  return (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-900 space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-amber-800">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        Student & Academic Records Warning
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        This class currently contains <strong>{stdCount} active student records</strong> and <strong>{subCount} configured subjects</strong>.
                        Deleting will remove the class container and its configured sections.
                      </p>
                    </div>
                  );
                }
                return null;
              })()}

              <p className="text-gray-500 text-[11px]">
                This action is irreversible and will be logged in the system audit trail.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setDeleteClassTarget(null)}
                className="px-4 py-2 border rounded-lg text-gray-700 font-semibold hover:bg-gray-50 cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteClass}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs text-xs"
              >
                <Trash2 className="w-4 h-4" />
                Yes, Delete Class
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Shift Confirmation Modal */}
      {deleteShiftTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Confirm Shift Deletion
              </h3>
              <button onClick={() => setDeleteShiftTarget(null)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-gray-700">
              <p>
                Are you sure you want to delete the shift:
              </p>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div className="font-bold text-gray-900 text-sm">{deleteShiftTarget.name} Shift</div>
                <div className="text-gray-600 font-mono text-[11px]">
                  Hours: {deleteShiftTarget.startTime} - {deleteShiftTarget.endTime}
                </div>
              </div>

              {(() => {
                const linkedRoutines = db.routines?.filter(r => r.shiftId === deleteShiftTarget.id).length || 0;
                if (linkedRoutines > 0) {
                  return (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-900 space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-amber-800">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        Timetable Routine Association
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        This shift is currently referenced in <strong>{linkedRoutines} class routine timetable(s)</strong>. Deleting this shift will remove its schedule reference.
                      </p>
                    </div>
                  );
                }
                return null;
              })()}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setDeleteShiftTarget(null)}
                className="px-4 py-2 border rounded-lg text-gray-700 font-semibold hover:bg-gray-50 cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteShift}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs text-xs"
              >
                <Trash2 className="w-4 h-4" />
                Yes, Delete Shift
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Section Confirmation Modal */}
      {deleteSectionTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-gray-200 space-y-3">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Delete Section
            </h3>
            <p className="text-xs text-gray-700">
              Are you sure you want to delete section <strong>"{deleteSectionTarget.name}"</strong>?
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setDeleteSectionTarget(null)}
                className="px-3 py-1.5 border rounded-lg text-gray-700 font-semibold hover:bg-gray-50 cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteSection}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg cursor-pointer shadow-xs text-xs"
              >
                Delete Section
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Shift Modal */}
      {isAddingShift && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-sm font-bold text-gray-900">
                {editingShift ? `Edit Shift: ${editingShift.name}` : 'Add New Shift'}
              </h3>
              <button onClick={() => setIsAddingShift(false)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveShift} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Shift Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Morning, Day, Evening"
                  value={shiftForm.name}
                  onChange={e => setShiftForm({ ...shiftForm, name: e.target.value })}
                  className="w-full border rounded-lg p-2 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Start Time</label>
                  <input
                    type="text"
                    required
                    placeholder="07:30 AM"
                    value={shiftForm.startTime}
                    onChange={e => setShiftForm({ ...shiftForm, startTime: e.target.value })}
                    className="w-full border rounded-lg p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">End Time</label>
                  <input
                    type="text"
                    required
                    placeholder="12:00 PM"
                    value={shiftForm.endTime}
                    onChange={e => setShiftForm({ ...shiftForm, endTime: e.target.value })}
                    className="w-full border rounded-lg p-2 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="shiftActive"
                  checked={shiftForm.active}
                  onChange={e => setShiftForm({ ...shiftForm, active: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="shiftActive" className="text-xs font-semibold text-gray-700">
                  Active Operational Shift
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddingShift(false)}
                  className="px-4 py-2 border rounded-lg text-gray-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg cursor-pointer shadow-xs"
                >
                  Save Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Class Modal */}
      {isAddingClass && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                <span>{editingClass ? `Edit Class: ${editingClass.nameEn}` : 'Add New Academic Class'}</span>
              </h3>
              <button
                onClick={() => {
                  setIsAddingClass(false);
                  setEditingClass(null);
                }}
                className="text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {classFormError && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-2.5 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{classFormError}</span>
              </div>
            )}

            <form onSubmit={handleSaveClass} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Class Name (English) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1, 2, 5, Six, Seven, Eight, Nine, Ten, Eleven, Twelve, HSC 1st Year"
                  value={classForm.nameEn}
                  onChange={e => {
                    setClassForm({ ...classForm, nameEn: e.target.value });
                    setClassFormError('');
                  }}
                  className="w-full border border-gray-300 rounded-lg p-2.5 font-bold text-gray-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
                <span className="text-[10px] text-gray-500 mt-1 block">
                  Supports numeric (1, 2, 3...) or English word formats (Six, Seven, Eight, Nine, Ten, Eleven...).
                </span>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Numeric Level Value (Optional)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 1, 6, 9, 10, 11 (leave blank if not applicable)"
                  value={classForm.numericValue}
                  onChange={e => setClassForm({ ...classForm, numericValue: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-gray-800 focus:bg-white"
                />
              </div>

              {/* Shifts Selection */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Assigned Shifts to this Class *
                </label>
                <p className="text-[11px] text-gray-500 mb-2">
                  Select which shifts operate for this class (supports multiple shifts):
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {shifts.map(sh => {
                    const shiftLabel = sh.name.endsWith('Shift') ? sh.name : `${sh.name} Shift`;
                    const isChecked = classForm.shifts.includes(shiftLabel) || classForm.shifts.includes(sh.name);
                    return (
                      <label
                        key={sh.id}
                        className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-bold'
                            : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={e => {
                            if (e.target.checked) {
                              setClassForm(prev => ({
                                ...prev,
                                shifts: Array.from(new Set([...prev.shifts, shiftLabel]))
                              }));
                            } else {
                              setClassForm(prev => ({
                                ...prev,
                                shifts: prev.shifts.filter(s => s !== shiftLabel && s !== sh.name)
                              }));
                            }
                          }}
                          className="rounded text-indigo-600 w-4 h-4"
                        />
                        <span className="text-xs">{shiftLabel}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Academic Groups Stream Toggle */}
              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-purple-200 bg-purple-50/60 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={classForm.hasGroups}
                  onChange={e => setClassForm({ ...classForm, hasGroups: e.target.checked })}
                  className="mt-0.5 rounded text-purple-600 w-4 h-4"
                />
                <div>
                  <span className="text-xs font-bold text-purple-900 block">
                    Enable Academic Groups / Stream (Science, Humanities, Business Studies)
                  </span>
                  <span className="text-[11px] text-purple-700 block mt-0.5 leading-relaxed">
                    Enables group selection during student admission, marks entry, and transcript processing. Recommended for Class Nine, Class Ten, and College programs.
                  </span>
                </div>
              </label>

              {!editingClass && (
                <div className="p-3 bg-blue-50 text-blue-900 rounded-lg text-[11px]">
                  💡 Standard Section A, Section B, Section C, and Section D will automatically be initialized and can be edited anytime.
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingClass(false);
                    setEditingClass(null);
                  }}
                  className="px-4 py-2 border rounded-lg text-gray-700 font-semibold cursor-pointer hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg cursor-pointer shadow-xs"
                >
                  {editingClass ? 'Save Changes' : 'Create Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Sections Modal */}
      {isManagingSections && selectedClassForSections && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                  <DoorOpen className="w-4 h-4 text-blue-600" />
                  Manage Sections: {selectedClassForSections.nameEn}
                </h3>
                <p className="text-[11px] text-gray-500">Configure Section A, B, C, D or custom sections for this class</p>
              </div>
              <button onClick={() => setIsManagingSections(false)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Action: Reset to Standard Sections A, B, C, D */}
            <div className="flex items-center justify-between bg-blue-50 p-2.5 rounded-lg border border-blue-200">
              <span className="text-[11px] text-blue-900 font-medium">Standard Class Structure</span>
              <button
                type="button"
                onClick={handleApplyStandardSectionsABCD}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] px-3 py-1 rounded cursor-pointer shadow-xs"
              >
                Set Sections A, B, C, D
              </button>
            </div>

            {/* Existing Sections List */}
            <div>
              <span className="font-bold text-gray-700 block mb-2 uppercase text-[10px] tracking-wider">
                Current Sections for {selectedClassForSections.nameEn}
              </span>
              <div className="space-y-2">
                {db.sections.filter(s => s.classId === selectedClassForSections.id).map(sec => (
                  <div
                    key={sec.id}
                    className="flex items-center justify-between p-2.5 bg-gray-50 border rounded-lg hover:border-gray-300 transition-colors"
                  >
                    <div>
                      <div className="font-bold text-gray-900 text-xs">{sec.name}</div>
                      <div className="text-[11px] text-gray-500">
                        {sec.roomNo ? `Room: ${sec.roomNo} • ` : ''}Capacity: {sec.capacity} seats
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSection(sec);
                          setSecName(sec.name);
                          setSecRoomNo(sec.roomNo || '');
                          setSecCapacity(sec.capacity);
                        }}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                        title="Edit Section"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteSectionTarget({ id: sec.id, name: sec.name })}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                        title="Delete Section"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add or Edit Section Form */}
            <form onSubmit={handleSaveSection} className="p-3.5 bg-gray-100 rounded-xl space-y-3 border">
              <span className="font-bold text-gray-800 block text-xs">
                {editingSection ? `Edit Section: ${editingSection.name}` : 'Add New Section'}
              </span>

              {/* Preset buttons */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-gray-500">Presets:</span>
                {['Section A', 'Section B', 'Section C', 'Section D'].map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setSecName(preset)}
                    className="px-2 py-0.5 bg-white border border-gray-300 rounded text-[10px] font-semibold hover:bg-blue-50 hover:border-blue-400 cursor-pointer"
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-1">
                  <label className="block text-gray-700 font-semibold mb-1">Section Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Section A"
                    value={secName}
                    onChange={e => setSecName(e.target.value)}
                    className="w-full bg-white border rounded p-1.5 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Room No</label>
                  <input
                    type="text"
                    placeholder="e.g. 101"
                    value={secRoomNo}
                    onChange={e => setSecRoomNo(e.target.value)}
                    className="w-full bg-white border rounded p-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Capacity</label>
                  <input
                    type="number"
                    min="1"
                    max="200"
                    value={secCapacity}
                    onChange={e => setSecCapacity(Number(e.target.value))}
                    className="w-full bg-white border rounded p-1.5 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                {editingSection && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingSection(null);
                      setSecName('');
                      setSecRoomNo('');
                    }}
                    className="px-3 py-1 text-gray-600 border bg-white rounded text-xs cursor-pointer"
                  >
                    Cancel Edit
                  </button>
                )}
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded text-xs cursor-pointer shadow-xs"
                >
                  {editingSection ? 'Update Section' : 'Add Section'}
                </button>
              </div>
            </form>

            <div className="flex justify-end pt-2 border-t">
              <button
                type="button"
                onClick={() => setIsManagingSections(false)}
                className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
