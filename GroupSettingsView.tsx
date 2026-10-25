import React, { useState } from 'react';
import {
  Boxes,
  Plus,
  Edit2,
  Trash2,
  Users,
  CheckCircle2,
  AlertTriangle,
  X,
  Check,
  GraduationCap,
  Sparkles,
  Layers,
  BookOpen,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { AcademicGroup, ClassLevel } from '../types';
import { AppDatabase, logAuditAction, classSupportsGroups } from '../services/storage';

interface GroupSettingsViewProps {
  db: AppDatabase;
  onUpdateDb: (updated: AppDatabase) => void;
}

export const GroupSettingsView: React.FC<GroupSettingsViewProps> = ({
  db,
  onUpdateDb
}) => {
  const groups: AcademicGroup[] = db.groups || [];
  const [activeTab, setActiveTab] = useState<'groups' | 'classes'>('groups');
  const [bannerMsg, setBannerMsg] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<AcademicGroup | null>(null);
  const [groupForm, setGroupForm] = useState({
    name: '',
    code: '',
    description: '',
    active: true
  });
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<AcademicGroup | null>(null);

  const showBanner = (msg: string) => {
    setBannerMsg(msg);
    setTimeout(() => setBannerMsg(''), 4000);
  };

  const handleOpenAdd = () => {
    setEditingGroup(null);
    setGroupForm({
      name: '',
      code: '',
      description: '',
      active: true
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (grp: AcademicGroup) => {
    setEditingGroup(grp);
    setGroupForm({
      name: grp.name,
      code: grp.code || '',
      description: grp.description || '',
      active: grp.active
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleSaveGroup = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = groupForm.name.trim();

    if (!trimmedName) {
      setFormError('Group name is required.');
      return;
    }

    // Validate duplicate name (case-insensitive)
    const isDuplicate = groups.some(
      g => g.name.toLowerCase() === trimmedName.toLowerCase() && (!editingGroup || g.id !== editingGroup.id)
    );

    if (isDuplicate) {
      setFormError(`A group with the name "${trimmedName}" already exists. Please choose a unique name.`);
      return;
    }

    let updatedGroups: AcademicGroup[] = [...groups];
    let updatedStudents = [...db.students];

    if (editingGroup) {
      const oldName = editingGroup.name;
      updatedGroups = updatedGroups.map(g =>
        g.id === editingGroup.id
          ? {
              ...g,
              name: trimmedName,
              code: groupForm.code.trim().toUpperCase() || undefined,
              description: groupForm.description.trim() || undefined,
              active: groupForm.active
            }
          : g
      );

      // If group name changed, cascade update to existing assigned students safely
      if (oldName !== trimmedName) {
        updatedStudents = updatedStudents.map(s =>
          s.group === oldName ? { ...s, group: trimmedName } : s
        );
      }
    } else {
      const newGroup: AcademicGroup = {
        id: `grp-${Date.now()}`,
        name: trimmedName,
        code: groupForm.code.trim().toUpperCase() || trimmedName.substring(0, 3).toUpperCase(),
        description: groupForm.description.trim() || undefined,
        active: groupForm.active
      };
      updatedGroups.push(newGroup);
    }

    let updatedDb: AppDatabase = {
      ...db,
      groups: updatedGroups,
      students: updatedStudents
    };

    updatedDb = logAuditAction(
      updatedDb,
      editingGroup ? 'UPDATE_GROUP' : 'ADD_GROUP',
      `${editingGroup ? 'Updated' : 'Added'} academic group "${trimmedName}" in Group Assignment Settings`
    );

    onUpdateDb(updatedDb);
    setIsAddModalOpen(false);
    setEditingGroup(null);
    showBanner(`Group "${trimmedName}" saved successfully.`);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    const target = deleteTarget;

    // Remove group from list
    const updatedGroups = groups.filter(g => g.id !== target.id);

    // Safely unassign group from students without deleting student profile, marks, or records
    const updatedStudents = db.students.map(s =>
      s.group === target.name ? { ...s, group: undefined } : s
    );

    let updatedDb: AppDatabase = {
      ...db,
      groups: updatedGroups,
      students: updatedStudents
    };

    updatedDb = logAuditAction(
      updatedDb,
      'DELETE_GROUP',
      `Deleted academic group "${target.name}". Handled student assignments safely.`
    );

    onUpdateDb(updatedDb);
    setDeleteTarget(null);
    showBanner(`Group "${target.name}" removed safely.`);
  };

  const handleToggleClassGroupSupport = (cls: ClassLevel) => {
    const currentEnabled = classSupportsGroups(cls);
    const updatedClasses = db.classes.map(c =>
      c.id === cls.id ? { ...c, hasGroups: !currentEnabled } : c
    );

    let updatedDb: AppDatabase = {
      ...db,
      classes: updatedClasses
    };

    updatedDb = logAuditAction(
      updatedDb,
      'TOGGLE_CLASS_GROUPS',
      `${!currentEnabled ? 'Enabled' : 'Disabled'} academic group assignment for ${cls.nameEn}`
    );

    onUpdateDb(updatedDb);
    showBanner(`Group stream assignment ${!currentEnabled ? 'enabled' : 'disabled'} for ${cls.nameEn}.`);
  };

  // Group statistics
  const assignedStudentsTotal = db.students.filter(s => s.group && s.status === 'active').length;
  const classesWithGroupsCount = db.classes.filter(c => classSupportsGroups(c)).length;

  return (
    <div className="space-y-5 text-xs">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Group Assignment Settings & Academic Streams
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Dynamic management of academic groups (Science, Humanities, Business Studies, etc.) for secondary and college classes.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Group</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-gray-500 block">Total Groups</span>
          <span className="text-lg font-bold text-gray-900 mt-1 block">{groups.length}</span>
          <span className="text-[10px] text-gray-400">Configured in system</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-gray-500 block">Active Groups</span>
          <span className="text-lg font-bold text-emerald-600 mt-1 block">
            {groups.filter(g => g.active).length}
          </span>
          <span className="text-[10px] text-gray-400">Available for selection</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-gray-500 block">Assigned Students</span>
          <span className="text-lg font-bold text-purple-600 mt-1 block">
            {assignedStudentsTotal}
          </span>
          <span className="text-[10px] text-gray-400">In Science/Humanities/Business</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-gray-500 block">Classes with Groups</span>
          <span className="text-lg font-bold text-blue-600 mt-1 block">
            {classesWithGroupsCount}
          </span>
          <span className="text-[10px] text-gray-400">Nine, Ten & College levels</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-1">
        <button
          onClick={() => setActiveTab('groups')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
            activeTab === 'groups'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Academic Groups ({groups.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('classes')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
            activeTab === 'classes'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Class Group Support Matrix ({db.classes.length})</span>
        </button>
      </div>

      {/* Banner */}
      {bannerMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold p-3 rounded-xl flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{bannerMsg}</span>
          </div>
          <button onClick={() => setBannerMsg('')} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TAB 1: ACADEMIC GROUPS */}
      {activeTab === 'groups' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map(grp => {
            const studentCount = db.students.filter(
              s => s.group === grp.name && s.status === 'active'
            ).length;

            return (
              <div
                key={grp.id}
                className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs flex flex-col justify-between space-y-4 hover:border-blue-300 transition-colors"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-gray-900">{grp.name}</h4>
                        {grp.code && (
                          <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded">
                            {grp.code}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {grp.description || 'No description provided.'}
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        grp.active
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-gray-100 text-gray-600 border border-gray-200'
                      }`}
                    >
                      {grp.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 flex items-center justify-between text-xs">
                    <span className="text-gray-600 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-gray-400" />
                      Enrolled Students:
                    </span>
                    <strong className="text-blue-900 font-bold">{studentCount} Students</strong>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleOpenEdit(grp)}
                    className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Group</span>
                  </button>

                  <button
                    onClick={() => setDeleteTarget(grp)}
                    className="text-red-600 hover:text-red-800 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: CLASS GROUP SUPPORT MATRIX */}
      {activeTab === 'classes' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
          <div className="p-4 bg-gray-50/70 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Class & Level Group Support Configuration</h4>
              <p className="text-xs text-gray-500 mt-0.5">
                Enable or disable stream assignment (Science, Humanities, Business Studies) for specific classes. Supports Class 9, 10, and college programs.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                  <th className="px-4 py-3">Class Name</th>
                  <th className="px-4 py-3">Numeric Level</th>
                  <th className="px-4 py-3">Assigned Shifts</th>
                  <th className="px-4 py-3">Enrolled Students</th>
                  <th className="px-4 py-3 text-center">Group Stream Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {db.classes.map(cls => {
                  const isEnabled = classSupportsGroups(cls);
                  const enrolled = db.students.filter(s => s.classId === cls.id && s.status === 'active').length;
                  const withGroup = db.students.filter(s => s.classId === cls.id && s.group && s.status === 'active').length;

                  return (
                    <tr key={cls.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-4 py-3 font-bold text-gray-900">
                        {cls.nameEn}
                      </td>
                      <td className="px-4 py-3 text-gray-600 font-mono">
                        {cls.numericValue !== undefined ? cls.numericValue : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {cls.shifts && cls.shifts.length > 0 ? (
                            cls.shifts.map((sh, idx) => (
                              <span key={idx} className="bg-indigo-50 text-indigo-700 text-[10px] font-semibold px-2 py-0.5 rounded border border-indigo-200">
                                {sh}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400 text-[11px] italic">Morning & Day Shifts</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-800 font-semibold">{enrolled} Students</span>
                        {isEnabled && withGroup > 0 && (
                          <span className="text-purple-700 font-bold ml-1.5">({withGroup} grouped)</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isEnabled
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-gray-100 text-gray-600 border border-gray-200'
                          }`}
                        >
                          {isEnabled ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>Groups Enabled</span>
                            </>
                          ) : (
                            <span>Standard / General (No Groups)</span>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleToggleClassGroupSupport(cls)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                            isEnabled
                              ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
                              : 'bg-purple-600 hover:bg-purple-500 text-white shadow-xs'
                          }`}
                        >
                          {isEnabled ? 'Disable Groups' : 'Enable Groups'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT ACADEMIC GROUP */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-blue-600" />
                <h4 className="text-sm font-bold text-gray-900">
                  {editingGroup ? 'Edit Academic Group' : 'Add New Academic Group'}
                </h4>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingGroup(null);
                }}
                className="text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-2.5 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveGroup} className="space-y-3.5">
              <div>
                <label className="block text-gray-700 font-bold mb-1">
                  Group Name (English) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Science, Humanities, Business Studies"
                  value={groupForm.name}
                  onChange={e => {
                    setGroupForm(prev => ({ ...prev, name: e.target.value }));
                    setFormError('');
                  }}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-xs text-gray-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
                <span className="text-[10px] text-gray-500 mt-0.5 block">
                  Must be in English. No Bengali characters allowed in English interface.
                </span>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">
                  Group Code / Abbreviation
                </label>
                <input
                  type="text"
                  placeholder="e.g. SCI, HUM, BUS"
                  value={groupForm.code}
                  onChange={e => setGroupForm(prev => ({ ...prev, code: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-xs text-gray-900 focus:bg-white uppercase font-mono"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">
                  Description / Subject Focus
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Physics, Chemistry, Higher Math, Biology"
                  value={groupForm.description}
                  onChange={e => setGroupForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-xs text-gray-900 focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="grpActive"
                  checked={groupForm.active}
                  onChange={e => setGroupForm(prev => ({ ...prev, active: e.target.checked }))}
                  className="rounded text-blue-600 w-4 h-4"
                />
                <label htmlFor="grpActive" className="text-gray-800 font-semibold cursor-pointer">
                  Active (available for student admission, edit & marks entry)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingGroup(null);
                  }}
                  className="px-4 py-2 border rounded-lg text-gray-700 font-bold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-xs cursor-pointer"
                >
                  {editingGroup ? 'Save Changes' : 'Create Group'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL: DELETE GROUP */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
                <AlertTriangle className="w-5 h-5" />
                <span>Confirm Academic Group Deletion</span>
              </div>
              <button
                onClick={() => setDeleteTarget(null)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-2 text-red-900 text-xs">
              <p className="font-bold">
                Are you sure you want to delete the "{deleteTarget.name}" group?
              </p>
              {db.students.filter(s => s.group === deleteTarget.name).length > 0 && (
                <p className="text-red-700 font-semibold">
                  Notice: {db.students.filter(s => s.group === deleteTarget.name).length} students are currently assigned to this group. Their student records, marks, and profiles will be protected safely (their group field will be cleared).
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 border rounded-lg text-gray-700 font-bold hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Confirm & Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
