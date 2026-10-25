import React, { useState } from 'react';
import {
  ShieldCheck,
  UserCheck,
  Key,
  Lock,
  Plus,
  CheckCircle2,
  Trash2,
  AlertCircle,
  Camera,
  X,
  Mail,
  Phone,
  Building,
  Shield,
  Edit3
} from 'lucide-react';
import { User, UserRole } from '../types';
import { AppDatabase, logAuditAction, saveDatabase, DESIGNATED_SUPER_ADMIN_ID } from '../services/storage';
import { SuperAdminProfileModal } from './SuperAdminProfileModal';

interface UserManagementViewProps {
  db: AppDatabase;
  onUpdateDb: (updated: AppDatabase) => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  db,
  onUpdateDb
}) => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState('');
  const [errorToast, setErrorToast] = useState('');

  // Delete confirmation modal state
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  // New user form state
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    fullName: '',
    role: 'Teacher' as UserRole,
    email: '',
    mobileNumber: '',
    instituteName: db.schoolSettings.nameEn || 'Dhaka Ideal Model High School & College'
  });

  const superAdmin = db.users.find(
    u => u.username === DESIGNATED_SUPER_ADMIN_ID || (u.mobileNumber && u.mobileNumber === DESIGNATED_SUPER_ADMIN_ID)
  ) || db.currentUser;

  const otherUsers = db.users.filter(
    u => u.username !== DESIGNATED_SUPER_ADMIN_ID && u.mobileNumber !== DESIGNATED_SUPER_ADMIN_ID
  );

  const allowedNewRoles: UserRole[] = [
    'School Administrator',
    'Accountant',
    'Teacher',
    'Office Staff'
  ];

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorToast('');

    const cleanUsername = newUser.username.trim();
    if (!cleanUsername || !newUser.fullName.trim() || !newUser.password) {
      setErrorToast('Please fill in all required fields (Username, Password, Full Name).');
      return;
    }

    if (cleanUsername === DESIGNATED_SUPER_ADMIN_ID) {
      setErrorToast('Security Error: Cannot create an account with the designated Super Admin ID.');
      return;
    }

    if (db.users.some(u => u.username.toLowerCase() === cleanUsername.toLowerCase())) {
      setErrorToast(`Username "${cleanUsername}" is already in use. Please select a different username.`);
      return;
    }

    // Strictly disallow assigning Super Admin role
    if ((newUser.role as string) === 'Super Admin') {
      setErrorToast('Privilege Error: Only Md. Mirabul Hossen (01936988967) can hold the Super Admin role.');
      return;
    }

    const createdUser: User = {
      id: `usr-${Date.now()}`,
      username: cleanUsername,
      password: newUser.password,
      fullName: newUser.fullName.trim(),
      role: newUser.role,
      email: newUser.email.trim() || `${cleanUsername}@school.edu.bd`,
      mobileNumber: newUser.mobileNumber.trim(),
      instituteName: newUser.instituteName,
      status: 'active',
      isMasterAdmin: false
    };

    let updatedDb: AppDatabase = {
      ...db,
      users: [...db.users, createdUser]
    };

    updatedDb = logAuditAction(
      updatedDb,
      'CREATE_USER',
      `Registered new user ${createdUser.fullName} (${createdUser.username}) with role ${createdUser.role}`
    );

    saveDatabase(updatedDb);
    onUpdateDb(updatedDb);

    setIsAddUserModalOpen(false);
    setNewUser({
      username: '',
      password: '',
      fullName: '',
      role: 'Teacher',
      email: '',
      mobileNumber: '',
      instituteName: db.schoolSettings.nameEn || 'Dhaka Ideal Model High School & College'
    });

    setSuccessToast(`User "${createdUser.fullName}" created successfully.`);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.username === DESIGNATED_SUPER_ADMIN_ID || deleteTarget.role === 'Super Admin') {
      setErrorToast('Security Violation: The designated Super Admin account cannot be deleted.');
      setDeleteTarget(null);
      return;
    }

    const updatedUsers = db.users.filter(u => u.id !== deleteTarget.id);
    let updatedDb: AppDatabase = {
      ...db,
      users: updatedUsers
    };

    updatedDb = logAuditAction(
      updatedDb,
      'DELETE_USER',
      `Deleted user account ${deleteTarget.fullName} (${deleteTarget.username})`
    );

    saveDatabase(updatedDb);
    onUpdateDb(updatedDb);

    setSuccessToast(`User account "${deleteTarget.fullName}" deleted successfully.`);
    setDeleteTarget(null);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const rolesMatrix: { role: UserRole; desc: string; permissions: string[] }[] = [
    { role: 'Super Admin', desc: 'Sole Master owner (Md. Mirabul Hossen), complete disaster recovery, backup/restore, license quota limits', permissions: ['Sole Master Authority', 'Database Null Slate Initialization', 'Global User Role Governance', 'Full Audit Log Ledger'] },
    { role: 'School Administrator', desc: 'Institutional manager, student admissions, routine and exam coordination', permissions: ['Student Admissions & ID Cards', 'Subject & Mark Distribution Config', 'Examinations Management'] },
    { role: 'Accountant', desc: 'Financial collections, fee receipts, expense logging', permissions: ['Collect Fees & Issue Money Receipts', 'Income & Expense Logging', 'Defaulter Reports Export'] },
    { role: 'Teacher', desc: 'Subject marks submission, classroom evaluation, attendance', permissions: ['Enter & Draft Subject Marks', 'Mark Daily Attendance', 'View Class Routine & Student Profile'] },
    { role: 'Office Staff', desc: 'Data operator and student registration verification', permissions: ['Student Register Lookup', 'Print ID Cards & Receipts', 'Notice Board Viewer'] }
  ];

  return (
    <div className="space-y-6">
      {/* Toast notifications */}
      {successToast && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {errorToast && (
        <div className="bg-red-50 border border-red-300 text-red-800 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorToast}</span>
        </div>
      )}

      {/* Header bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <span>User Roles & Access Control Governance</span>
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Strict single Super Admin architecture, verified credential encryption, and role-based permissions.
          </p>
        </div>

        <button
          onClick={() => setIsAddUserModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Authorized User</span>
        </button>
      </div>

      {/* SECTION 1: DESIGNATED SUPER ADMIN SOLE MASTER CARD (Requirement 3 & 4) */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white rounded-2xl p-6 shadow-xl border border-blue-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-44 h-44 bg-blue-600/20 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-white/10 border-2 border-yellow-400/50 flex items-center justify-center overflow-hidden shrink-0 shadow-lg relative group">
              {superAdmin?.avatar ? (
                <img
                  src={superAdmin.avatar}
                  alt={superAdmin.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-blue-800 flex items-center justify-center font-black text-2xl text-yellow-300">
                  M
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-yellow-400 text-gray-950 font-black px-2 py-0.5 rounded shadow-xs uppercase tracking-wider">
                  Sole Super Admin & System Owner
                </span>
                <span className="text-[10px] bg-emerald-500/30 text-emerald-300 font-bold px-2 py-0.5 rounded">
                  Active & Protected
                </span>
              </div>
              <h4 className="text-lg font-black text-white">
                {superAdmin?.fullName || 'Md. Mirabul Hossen'}
              </h4>
              <div className="text-xs text-blue-200 flex flex-wrap items-center gap-4 font-mono">
                <span>User ID: <strong className="text-white">{DESIGNATED_SUPER_ADMIN_ID}</strong></span>
                <span>Email: <strong className="text-white">{superAdmin?.email || 'mirabul@schoolportal.com'}</strong></span>
                <span>Role: <strong className="text-yellow-300">Super Admin</strong></span>
              </div>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="bg-yellow-400 hover:bg-yellow-300 text-gray-950 font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Change Photo & Password</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2: OTHER AUTHORIZED ACCOUNTS TABLE */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="p-3.5 border-b border-gray-200 bg-gray-50 flex items-center justify-between text-xs">
          <span className="font-bold text-gray-700 uppercase tracking-wider">
            Institutional Users & Staff Accounts ({otherUsers.length})
          </span>
          <span className="text-gray-500 font-mono text-[11px]">
            Super Admin Access: Exclusively 01936988967
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-100 text-gray-600 uppercase font-semibold">
              <tr>
                <th className="py-2.5 px-3">Username / ID</th>
                <th className="py-2.5 px-3">Full Name</th>
                <th className="py-2.5 px-3">Email</th>
                <th className="py-2.5 px-3">Phone</th>
                <th className="py-2.5 px-3">Assigned Role</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {otherUsers.map(u => (
                <tr key={u.id} className="hover:bg-gray-50/50">
                  <td className="py-2.5 px-3 font-mono font-bold text-blue-900">
                    {u.username}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-gray-900">
                    {u.fullName}
                  </td>
                  <td className="py-2.5 px-3 text-gray-600 font-mono">
                    {u.email}
                  </td>
                  <td className="py-2.5 px-3 text-gray-600 font-mono">
                    {u.mobileNumber || '-'}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        u.role === 'School Administrator'
                          ? 'bg-purple-100 text-purple-800'
                          : u.role === 'Accountant'
                          ? 'bg-emerald-100 text-emerald-800'
                          : u.role === 'Teacher'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded uppercase">
                      {u.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(u)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                      title="Delete User Account"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 3: ROLES & PRIVILEGES MATRIX */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rolesMatrix.map(r => (
          <div key={r.role} className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-gray-900">{r.role}</h4>
              <span className={`w-2 h-2 rounded-full ${r.role === 'Super Admin' ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
            </div>
            <p className="text-[11px] text-gray-500">{r.desc}</p>
            <div className="pt-2 border-t space-y-1">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Permissions:</span>
              {r.permissions.map((p, idx) => (
                <div key={idx} className="text-[11px] text-gray-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>{p}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL 1: ADD USER MODAL */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 text-xs">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span>Register Authorized Institutional Account</span>
              </h3>
              <button onClick={() => setIsAddUserModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mohammad Rafiqul Islam"
                  value={newUser.fullName}
                  onChange={e => setNewUser({ ...newUser, fullName: e.target.value })}
                  className="w-full border rounded-lg p-2 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">User ID / Username *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. rafiq2026"
                    value={newUser.username}
                    onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                    className="w-full border rounded-lg p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Initial password"
                    value={newUser.password}
                    onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full border rounded-lg p-2 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Assigned Role *</label>
                <select
                  value={newUser.role}
                  onChange={e => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                  className="w-full border rounded-lg p-2 font-bold bg-white"
                >
                  {allowedNewRoles.map(role => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-gray-500 mt-0.5 block">
                  * Only one Super Admin exists permanently (Md. Mirabul Hossen).
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="user@school.edu.bd"
                    value={newUser.email}
                    onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full border rounded-lg p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Mobile Phone</label>
                  <input
                    type="text"
                    placeholder="+880 17..."
                    value={newUser.mobileNumber}
                    onChange={e => setNewUser({ ...newUser, mobileNumber: e.target.value })}
                    className="w-full border rounded-lg p-2 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-xs"
                >
                  Create User Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: DELETE USER CONFIRMATION */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-gray-200 text-xs space-y-3">
            <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>Confirm Account Deletion</span>
            </div>
            <p className="text-gray-600">
              Are you sure you want to delete the user account for <strong>{deleteTarget.fullName}</strong> ({deleteTarget.username})?
              This user will no longer be able to log in.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-3.5 py-1.5 border rounded-lg text-gray-700 font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-xs"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: SUPER ADMIN PROFILE & SECURITY MODAL */}
      <SuperAdminProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        db={db}
        onUpdateDb={onUpdateDb}
      />
    </div>
  );
};
