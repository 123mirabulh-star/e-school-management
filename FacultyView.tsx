import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Briefcase,
  Phone,
  Mail,
  Plus,
  Search,
  CheckCircle2,
  X,
  Trash2,
  AlertCircle,
  Building,
  UserCheck,
  ShieldAlert,
  Award
} from 'lucide-react';
import { Teacher, Staff } from '../types';
import { AppDatabase, logAuditAction, saveDatabase } from '../services/storage';

interface FacultyViewProps {
  db: AppDatabase;
  onUpdateDb: (updated: AppDatabase) => void;
  mode?: 'teachers' | 'staff';
}

export const FacultyView: React.FC<FacultyViewProps> = ({
  db,
  onUpdateDb,
  mode = 'teachers'
}) => {
  const [activeTab, setActiveTab] = useState<'teachers' | 'staff'>(mode);
  const [isAdding, setIsAdding] = useState(false);
  const [memberType, setMemberType] = useState<'teacher' | 'staff'>(mode === 'staff' ? 'staff' : 'teacher');

  // Sync with prop when sidebar changes navigation between teachers and staff
  useEffect(() => {
    setActiveTab(mode);
    setMemberType(mode === 'staff' ? 'staff' : 'teacher');
  }, [mode]);

  // Toast notifications
  const [successToast, setSuccessToast] = useState('');
  const [errorToast, setErrorToast] = useState('');

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
    type: 'teacher' | 'staff';
  } | null>(null);

  // Form state
  const [formState, setFormState] = useState({
    nameEn: '',
    roleOrDesignation: 'Assistant Teacher',
    department: 'Science',
    phone: '',
    email: '',
    qualification: 'M.Sc'
  });

  // Authorization check
  const isAuthorized = !db.currentUser || db.currentUser.role === 'Super Admin' || db.currentUser.role === 'School Administrator';

  // Open add modal
  const handleOpenAddModal = (type: 'teacher' | 'staff') => {
    if (!isAuthorized) {
      setErrorToast('Permission Denied: Only Administrators can add faculty or staff members.');
      return;
    }
    setMemberType(type);
    setFormState({
      nameEn: '',
      roleOrDesignation: type === 'teacher' ? 'Assistant Teacher' : 'Office Assistant',
      department: 'Science',
      phone: '',
      email: '',
      qualification: type === 'teacher' ? 'M.Sc' : 'B.A / Graduate'
    });
    setErrorToast('');
    setIsAdding(true);
  };

  // Add Member Handler
  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorToast('');

    if (!isAuthorized) {
      setErrorToast('Permission Denied: You are not authorized to perform this action.');
      return;
    }

    const cleanName = formState.nameEn.trim();
    if (!cleanName) {
      setErrorToast('Please enter the full name of the member.');
      return;
    }

    const cleanPhone = formState.phone.trim();
    if (!cleanPhone) {
      setErrorToast('Please provide a valid contact phone number.');
      return;
    }

    if (memberType === 'teacher') {
      // Check for duplicate teacher by phone
      if (db.teachers.some(t => t.phone.replace(/\s+/g, '') === cleanPhone.replace(/\s+/g, ''))) {
        setErrorToast(`A teacher with phone number "${cleanPhone}" is already registered.`);
        return;
      }

      // Generate next Teacher ID
      const nextNum = db.teachers.length + 1;
      const teacherId = `TCH-${String(nextNum).padStart(3, '0')}`;

      const newTeacherObj: Teacher = {
        id: `tch-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        teacherId,
        nameEn: cleanName,
        designation: formState.roleOrDesignation.trim() || 'Assistant Teacher',
        department: formState.department.trim() || 'General',
        phone: cleanPhone,
        email: formState.email.trim() || `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '')}@school.edu.bd`,
        joinDate: new Date().toISOString().split('T')[0],
        qualification: formState.qualification.trim() || 'Graduate',
        status: 'active'
      };

      let updatedDb: AppDatabase = {
        ...db,
        teachers: [newTeacherObj, ...db.teachers]
      };

      updatedDb = logAuditAction(
        updatedDb,
        'ADD_TEACHER',
        `Registered teaching faculty member ${newTeacherObj.nameEn} (${newTeacherObj.designation}, ID: ${teacherId})`
      );

      saveDatabase(updatedDb);
      onUpdateDb(updatedDb);

      setIsAdding(false);
      setSuccessToast(`Teacher "${cleanName}" (${newTeacherObj.designation}) added successfully.`);
      setTimeout(() => setSuccessToast(''), 4000);
    } else {
      // Check for duplicate staff by phone
      if (db.staff.some(s => s.phone.replace(/\s+/g, '') === cleanPhone.replace(/\s+/g, ''))) {
        setErrorToast(`A staff member with phone number "${cleanPhone}" is already registered.`);
        return;
      }

      // Generate next Staff ID
      const nextNum = db.staff.length + 1;
      const staffId = `STF-${String(nextNum).padStart(3, '0')}`;

      const newStaffObj: Staff = {
        id: `stf-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        staffId,
        nameEn: cleanName,
        role: formState.roleOrDesignation.trim() || 'Office Assistant',
        phone: cleanPhone,
        status: 'active'
      };

      let updatedDb: AppDatabase = {
        ...db,
        staff: [newStaffObj, ...db.staff]
      };

      updatedDb = logAuditAction(
        updatedDb,
        'ADD_STAFF',
        `Registered office staff member ${newStaffObj.nameEn} (${newStaffObj.role}, ID: ${staffId})`
      );

      saveDatabase(updatedDb);
      onUpdateDb(updatedDb);

      setIsAdding(false);
      setSuccessToast(`Office staff member "${cleanName}" (${newStaffObj.role}) added successfully.`);
      setTimeout(() => setSuccessToast(''), 4000);
    }
  };

  // Delete Member Confirm Handler (invoked from custom modal)
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    if (!isAuthorized) {
      setErrorToast('Permission Denied: Only Administrators can delete faculty records.');
      setDeleteTarget(null);
      return;
    }

    if (deleteTarget.type === 'teacher') {
      const targetTeacher = db.teachers.find(t => t.id === deleteTarget.id);
      const updatedTeachers = db.teachers.filter(t => t.id !== deleteTarget.id);

      let updatedDb: AppDatabase = {
        ...db,
        teachers: updatedTeachers
      };

      updatedDb = logAuditAction(
        updatedDb,
        'DELETE_TEACHER',
        `Deleted teacher ${deleteTarget.name} (ID: ${targetTeacher?.teacherId || deleteTarget.id}) from faculty directory`
      );

      saveDatabase(updatedDb);
      onUpdateDb(updatedDb);

      setSuccessToast(`Teacher record "${deleteTarget.name}" deleted successfully.`);
    } else {
      const targetStaff = db.staff.find(s => s.id === deleteTarget.id);
      const updatedStaff = db.staff.filter(s => s.id !== deleteTarget.id);

      let updatedDb: AppDatabase = {
        ...db,
        staff: updatedStaff
      };

      updatedDb = logAuditAction(
        updatedDb,
        'DELETE_STAFF',
        `Deleted office staff member ${deleteTarget.name} (ID: ${targetStaff?.staffId || deleteTarget.id})`
      );

      saveDatabase(updatedDb);
      onUpdateDb(updatedDb);

      setSuccessToast(`Staff record "${deleteTarget.name}" deleted successfully.`);
    }

    setDeleteTarget(null);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  return (
    <div className="space-y-5 text-xs">
      {/* Toast notifications */}
      {successToast && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3.5 rounded-xl font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {errorToast && (
        <div className="bg-red-50 border border-red-300 text-red-800 p-3.5 rounded-xl font-bold flex items-center gap-2 shadow-xs">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorToast}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
            <span>Teachers & Staff Faculty Directory</span>
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Faculty member profiles, educational credentials, subject assignments, and contact details.
          </p>
        </div>

        <button
          onClick={() => handleOpenAddModal(activeTab === 'staff' ? 'staff' : 'teacher')}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add {activeTab === 'staff' ? 'Office Staff' : 'Faculty Teacher'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('teachers')}
          className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'teachers'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Teaching Faculty ({db.teachers.length})
        </button>
        <button
          onClick={() => setActiveTab('staff')}
          className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'staff'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Office Staff ({db.staff.length})
        </button>
      </div>

      {/* TEACHERS LIST */}
      {activeTab === 'teachers' ? (
        db.teachers.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-xl border border-gray-200 text-gray-500 space-y-2">
            <GraduationCap className="w-8 h-8 text-indigo-400 mx-auto" />
            <p className="font-bold">No teachers registered in directory yet.</p>
            <p className="text-xs">Click the <strong>Add Faculty Teacher</strong> button above to add faculty members.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {db.teachers.map(t => (
              <div key={t.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{t.nameEn}</h4>
                    <p className="text-xs font-medium text-gray-600 mt-0.5">{t.designation}</p>
                  </div>
                  <span className="font-mono text-[10px] bg-indigo-50 text-indigo-800 font-bold px-2 py-0.5 rounded">
                    {t.teacherId}
                  </span>
                </div>

                <div className="bg-gray-50 p-2.5 rounded-lg text-xs space-y-1 text-gray-600">
                  <div className="flex justify-between">
                    <span>Department:</span>
                    <strong className="text-gray-800">{t.department}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Qualification:</span>
                    <span className="font-medium text-gray-800">{t.qualification}</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span>Phone:</span>
                    <span className="font-bold text-gray-900">{t.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <span className="text-blue-600 font-mono">{t.email}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t text-xs">
                  <span className="text-[11px] text-gray-500">Joined: {t.joinDate || '2024'}</span>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget({ id: t.id, name: t.nameEn, type: 'teacher' })}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    title="Delete Teacher Record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Record</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* STAFF LIST */
        db.staff.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-xl border border-gray-200 text-gray-500 space-y-2">
            <Briefcase className="w-8 h-8 text-purple-400 mx-auto" />
            <p className="font-bold">No office staff registered yet.</p>
            <p className="text-xs">Click the <strong>Add Office Staff</strong> button above to register office staff.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {db.staff.map(s => (
              <div key={s.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{s.nameEn}</h4>
                    <p className="text-xs font-bold text-purple-700">{s.role}</p>
                  </div>
                  <span className="font-mono text-[10px] bg-gray-100 px-2 py-0.5 rounded font-bold">
                    {s.staffId}
                  </span>
                </div>
                <div className="bg-gray-50 p-2.5 rounded-lg text-xs space-y-1">
                  <p className="font-mono text-gray-700 flex justify-between">
                    <span>Phone:</span>
                    <strong className="text-gray-900">{s.phone}</strong>
                  </p>
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t text-xs">
                  <span className="text-[11px] text-gray-500 capitalize">Status: {s.status}</span>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget({ id: s.id, name: s.nameEn, type: 'staff' })}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    title="Delete Staff Record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Record</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* IN-APP CONFIRMATION MODAL: DELETE RECORD (Safe against iframe confirm blocks) */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-gray-200 space-y-3">
            <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <span>Confirm Record Deletion</span>
            </div>
            <p className="text-gray-700 text-xs">
              Are you sure you want to permanently delete the {deleteTarget.type === 'teacher' ? 'teacher' : 'staff'} record for:
            </p>
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg font-bold text-red-900 text-xs">
              {deleteTarget.name}
            </div>
            <p className="text-[11px] text-gray-500">
              This action will remove the record from the institution faculty directory immediately.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-3.5 py-1.5 border rounded-lg text-gray-700 font-bold hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-xs cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Delete Record</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD TEACHER / STAFF MODAL */}
      {isAdding && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-indigo-600" />
                <span>Register {memberType === 'teacher' ? 'Teaching Faculty' : 'Office Staff'}</span>
              </h3>
              <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-3.5">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Select Member Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMemberType('teacher');
                      setFormState(prev => ({
                        ...prev,
                        roleOrDesignation: 'Assistant Teacher',
                        qualification: 'M.Sc'
                      }));
                    }}
                    className={`py-2 rounded-lg font-bold border cursor-pointer ${
                      memberType === 'teacher' ? 'bg-indigo-600 text-white border-indigo-700 shadow-2xs' : 'bg-gray-50 text-gray-700'
                    }`}
                  >
                    Teaching Faculty
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMemberType('staff');
                      setFormState(prev => ({
                        ...prev,
                        roleOrDesignation: 'Office Assistant',
                        qualification: 'Graduate'
                      }));
                    }}
                    className={`py-2 rounded-lg font-bold border cursor-pointer ${
                      memberType === 'staff' ? 'bg-indigo-600 text-white border-indigo-700 shadow-2xs' : 'bg-gray-50 text-gray-700'
                    }`}
                  >
                    Office Staff
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Full Name (English) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mohammad Rafiqul Islam"
                  value={formState.nameEn}
                  onChange={e => setFormState({ ...formState, nameEn: e.target.value })}
                  className="w-full border rounded-lg p-2 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    {memberType === 'teacher' ? 'Designation *' : 'Role *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formState.roleOrDesignation}
                    onChange={e => setFormState({ ...formState, roleOrDesignation: e.target.value })}
                    className="w-full border rounded-lg p-2 font-medium"
                    placeholder={memberType === 'teacher' ? 'Assistant Teacher' : 'Office Assistant'}
                  />
                </div>
                {memberType === 'teacher' ? (
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Department</label>
                    <input
                      type="text"
                      value={formState.department}
                      onChange={e => setFormState({ ...formState, department: e.target.value })}
                      className="w-full border rounded-lg p-2 font-medium"
                      placeholder="e.g. Mathematics"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Phone *</label>
                    <input
                      type="text"
                      required
                      placeholder="+880 17..."
                      value={formState.phone}
                      onChange={e => setFormState({ ...formState, phone: e.target.value })}
                      className="w-full border rounded-lg p-2 font-mono"
                    />
                  </div>
                )}
              </div>

              {memberType === 'teacher' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Phone Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="+880 17..."
                      value={formState.phone}
                      onChange={e => setFormState({ ...formState, phone: e.target.value })}
                      className="w-full border rounded-lg p-2 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Qualification</label>
                    <input
                      type="text"
                      value={formState.qualification}
                      onChange={e => setFormState({ ...formState, qualification: e.target.value })}
                      className="w-full border rounded-lg p-2"
                      placeholder="e.g. M.Sc (DU)"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Official Email (Optional)</label>
                <input
                  type="email"
                  placeholder="e.g. teacher@school.edu.bd"
                  value={formState.email}
                  onChange={e => setFormState({ ...formState, email: e.target.value })}
                  className="w-full border rounded-lg p-2 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 border rounded-lg text-gray-700 font-bold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-sm cursor-pointer"
                >
                  Save {memberType === 'teacher' ? 'Teacher' : 'Staff'} Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
