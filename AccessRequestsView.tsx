import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Key,
  Users,
  Copy,
  Check,
  Building,
  Calendar,
  AlertCircle,
  X,
  Edit,
  Trash2,
  UserCheck,
  Phone,
  Mail,
  Send
} from 'lucide-react';
import { AccessRequest, User } from '../types';
import { AppDatabase, logAuditAction } from '../services/storage';

interface AccessRequestsViewProps {
  db: AppDatabase;
  onUpdateDb: (updated: AppDatabase) => void;
}

export const AccessRequestsView: React.FC<AccessRequestsViewProps> = ({
  db,
  onUpdateDb
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved'>('all');
  const [approvingReq, setApprovingReq] = useState<AccessRequest | null>(null);

  // Approval form state
  const [generatedUsername, setGeneratedUsername] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [studentLimit, setStudentLimit] = useState(500);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Editing existing user quota state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUserLimit, setNewUserLimit] = useState<number>(500);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleOpenApproveModal = (req: AccessRequest) => {
    setApprovingReq(req);
    const slug = req.instituteName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 8);
    const rnd = Math.floor(100 + Math.random() * 900);
    setGeneratedUsername(`${slug}_admin`);
    setGeneratedPassword(`Pass#${rnd}BD`);
    setStudentLimit(req.expectedStudents || 500);
  };

  const handleConfirmApproval = (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvingReq) return;

    // Create new User in database
    const newUser: User = {
      id: `usr-${Date.now()}`,
      username: generatedUsername.trim(),
      password: generatedPassword.trim(),
      fullName: approvingReq.applicantName,
      role: 'School Administrator',
      email: approvingReq.email || `${generatedUsername}@schoolportal.bd`,
      mobileNumber: approvingReq.phone,
      instituteName: approvingReq.instituteName,
      studentLimit: Number(studentLimit),
      status: 'active',
      isMasterAdmin: false
    };

    // Update request status
    const updatedRequests = db.accessRequests.map(r => {
      if (r.id === approvingReq.id) {
        return {
          ...r,
          status: 'approved' as const,
          issuedUsername: generatedUsername.trim(),
          issuedPassword: generatedPassword.trim(),
          approvedStudentLimit: Number(studentLimit),
          approvedAt: new Date().toISOString().split('T')[0],
          approvedBy: db.currentUser?.fullName || 'Super Admin'
        };
      }
      return r;
    });

    let updatedDb: AppDatabase = {
      ...db,
      users: [...db.users, newUser],
      accessRequests: updatedRequests
    };

    updatedDb = logAuditAction(
      updatedDb,
      'APPROVE_ACCESS_REQUEST',
      `Approved access for ${approvingReq.instituteName}. Issued user: ${generatedUsername} (Limit: ${studentLimit} students)`
    );

    onUpdateDb(updatedDb);
    setApprovingReq(null);
    showToast(`Access granted! Login ID: ${generatedUsername} | Password: ${generatedPassword} | Limit: ${studentLimit} students.`);
  };

  const handleReject = (req: AccessRequest) => {
    if (!confirm(`Reject access request from ${req.instituteName}?`)) return;

    const updatedRequests = db.accessRequests.map(r => {
      if (r.id === req.id) {
        return { ...r, status: 'rejected' as const };
      }
      return r;
    });

    let updatedDb: AppDatabase = { ...db, accessRequests: updatedRequests };
    updatedDb = logAuditAction(
      updatedDb,
      'REJECT_ACCESS_REQUEST',
      `Rejected access request from ${req.instituteName}`
    );

    onUpdateDb(updatedDb);
    showToast(`Request from ${req.instituteName} has been declined.`);
  };

  const handleCopyCredentials = (req: AccessRequest) => {
    const text = `School Management System Access\nInstitution: ${req.instituteName}\nLogin ID / Username: ${req.issuedUsername}\nPassword: ${req.issuedPassword}\nLicensed Student Limit: ${req.approvedStudentLimit || req.expectedStudents} Students\nPortal: Sign in at portal homepage`;
    navigator.clipboard.writeText(text);
    setCopiedId(req.id);
    showToast(`Login credentials copied to clipboard! You can now send them to ${req.applicantName}.`);
    setTimeout(() => setCopiedId(null), 3000);
  };

  const handleSaveUserLimit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const updatedUsers = db.users.map(u => {
      if (u.id === editingUser.id) {
        return { ...u, studentLimit: Number(newUserLimit) };
      }
      return u;
    });

    let updatedDb: AppDatabase = { ...db, users: updatedUsers };
    updatedDb = logAuditAction(
      updatedDb,
      'UPDATE_USER_LIMIT',
      `Updated student limit for ${editingUser.fullName} to ${newUserLimit}`
    );

    onUpdateDb(updatedDb);
    setEditingUser(null);
    showToast(`Student limit updated to ${newUserLimit} for ${editingUser.fullName}.`);
  };

  const handleToggleUserStatus = (user: User) => {
    if (user.isMasterAdmin) {
      alert('Master Admin status cannot be toggled.');
      return;
    }

    const nextStatus = user.status === 'active' ? 'suspended' : 'active';
    const updatedUsers = db.users.map(u => (u.id === user.id ? { ...u, status: nextStatus as any } : u));

    let updatedDb: AppDatabase = { ...db, users: updatedUsers };
    updatedDb = logAuditAction(
      updatedDb,
      'TOGGLE_USER_STATUS',
      `Changed user ${user.username} status to ${nextStatus}`
    );

    onUpdateDb(updatedDb);
    showToast(`User ${user.username} is now ${nextStatus}.`);
  };

  const filtered = db.accessRequests.filter(r => filterStatus === 'all' || r.status === filterStatus);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-emerald-50 border-2 border-emerald-400 text-emerald-900 p-4 rounded-xl text-xs font-bold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-700 hover:text-emerald-950">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            License & Access Requests Management
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Review incoming school registration requests, generate custom Login IDs and passwords, and set student limits.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1 text-xs font-bold rounded-md cursor-pointer ${filterStatus === 'all' ? 'bg-white shadow-xs text-blue-600' : 'text-gray-600'}`}
          >
            All Requests ({db.accessRequests.length})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1 text-xs font-bold rounded-md cursor-pointer ${filterStatus === 'pending' ? 'bg-white shadow-xs text-amber-600' : 'text-gray-600'}`}
          >
            Pending ({db.accessRequests.filter(r => r.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilterStatus('approved')}
            className={`px-3 py-1 text-xs font-bold rounded-md cursor-pointer ${filterStatus === 'approved' ? 'bg-white shadow-xs text-emerald-600' : 'text-gray-600'}`}
          >
            Approved ({db.accessRequests.filter(r => r.status === 'approved').length})
          </button>
        </div>
      </div>

      {/* Requests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(req => (
          <div key={req.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                  Tracking ID: {req.id}
                </span>
                <h4 className="text-sm font-bold text-gray-900 mt-1">{req.instituteName}</h4>
                <p className="text-xs text-gray-600">Contact: <strong className="text-gray-900">{req.applicantName}</strong></p>
              </div>

              <span
                className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded ${
                  req.status === 'approved'
                    ? 'bg-emerald-100 text-emerald-800'
                    : req.status === 'pending'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {req.status}
              </span>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg text-xs space-y-1 text-gray-700">
              <div className="flex justify-between">
                <span>Phone Number:</span>
                <strong className="font-mono">{req.phone}</strong>
              </div>
              <div className="flex justify-between">
                <span>Email Address:</span>
                <span>{req.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span>Requested Quota:</span>
                <strong className="text-blue-700">{req.expectedStudents} Students</strong>
              </div>
              <div className="flex justify-between">
                <span>Submitted Date:</span>
                <span className="font-mono text-gray-500">{req.submittedAt}</span>
              </div>
            </div>

            {req.notes && (
              <p className="text-[11px] text-gray-600 italic bg-blue-50/40 p-2 rounded border border-blue-100">
                "{req.notes}"
              </p>
            )}

            {req.status === 'approved' && req.issuedUsername && (
              <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-lg text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                    Issued Credentials & Quota
                  </span>
                  <button
                    onClick={() => handleCopyCredentials(req)}
                    className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer bg-white px-2 py-0.5 rounded border border-emerald-200"
                  >
                    {copiedId === req.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === req.id ? 'Copied!' : 'Copy Credentials'}</span>
                  </button>
                </div>
                <div className="flex justify-between font-mono">
                  <span>User ID / Username:</span>
                  <strong className="text-blue-900">{req.issuedUsername}</strong>
                </div>
                <div className="flex justify-between font-mono">
                  <span>Password:</span>
                  <strong>{req.issuedPassword}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Authorized Student Limit:</span>
                  <strong className="text-emerald-700">{req.approvedStudentLimit || req.expectedStudents} Students</strong>
                </div>
              </div>
            )}

            {req.status === 'pending' && (
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  onClick={() => handleReject(req)}
                  className="px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Decline
                </button>
                <button
                  onClick={() => handleOpenApproveModal(req)}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Key className="w-3.5 h-3.5" />
                  Approve & Issue Access
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Active Tenant Accounts & Student Quota Management */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              Active Tenant Accounts & Enforced Quotas
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">
              Manage client login accounts, change allowed student limits, and toggle active/suspended status.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-100 text-gray-700 uppercase font-semibold">
              <tr>
                <th className="py-2.5 px-3">School / Organization</th>
                <th className="py-2.5 px-3">Username / Login ID</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Contact</th>
                <th className="py-2.5 px-3 text-center">Student Limit</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {db.users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50/50">
                  <td className="py-2.5 px-3 font-bold text-gray-900">
                    {u.instituteName || db.schoolSettings.nameEn}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-blue-900">
                    {u.username}
                  </td>
                  <td className="py-2.5 px-3 text-gray-600">
                    {u.role}
                  </td>
                  <td className="py-2.5 px-3 text-gray-600">
                    <div>{u.fullName}</div>
                    <div className="text-[10px] text-gray-400 font-mono">{u.mobileNumber || u.email}</div>
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold">
                    {u.isMasterAdmin ? (
                      <span className="text-purple-700 bg-purple-50 px-2 py-0.5 rounded">Unlimited (Owner)</span>
                    ) : (
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        {u.studentLimit || 500} Students
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        u.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {!u.isMasterAdmin && (
                        <>
                          <button
                            onClick={() => {
                              setEditingUser(u);
                              setNewUserLimit(u.studentLimit || 500);
                            }}
                            className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
                            title="Edit Student Limit"
                          >
                            <Edit className="w-3 h-3" />
                            Edit Limit
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={() => handleToggleUserStatus(u)}
                            className={`text-xs font-bold cursor-pointer ${
                              u.status === 'active' ? 'text-amber-600 hover:text-amber-800' : 'text-emerald-600 hover:text-emerald-800'
                            }`}
                          >
                            {u.status === 'active' ? 'Suspend' : 'Activate'}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approval Modal */}
      {approvingReq && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Key className="w-4 h-4 text-blue-600" />
                Issue Access Credentials & Student Limit
              </h3>
              <button onClick={() => setApprovingReq(null)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmApproval} className="space-y-4 text-xs">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="font-bold text-blue-950">{approvingReq.instituteName}</p>
                <p className="text-blue-800 text-[11px]">Contact Person: {approvingReq.applicantName} ({approvingReq.phone})</p>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Assign User ID / Username *
                </label>
                <input
                  type="text"
                  required
                  value={generatedUsername}
                  onChange={e => setGeneratedUsername(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg font-mono font-bold text-blue-900"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Assign Password *
                </label>
                <input
                  type="text"
                  required
                  value={generatedPassword}
                  onChange={e => setGeneratedPassword(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Authorized Student Quota / Limit *
                </label>
                <input
                  type="number"
                  min="10"
                  max="50000"
                  required
                  value={studentLimit}
                  onChange={e => setStudentLimit(Number(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-lg font-bold text-emerald-800"
                />
                <span className="text-[10px] text-gray-500 mt-1 block">
                  The client cannot enroll more than this number of students without requesting an upgrade from you.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setApprovingReq(null)}
                  className="px-4 py-2 border rounded-lg font-semibold text-gray-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-sm cursor-pointer"
                >
                  Authorize & Issue Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Limit Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between border-b pb-2 mb-3">
              <h3 className="text-sm font-bold text-gray-900">Update Student Limit</h3>
              <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUserLimit} className="space-y-3 text-xs">
              <p className="text-gray-600">
                Updating quota for: <strong className="text-gray-900">{editingUser.fullName}</strong> ({editingUser.username})
              </p>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Allowed Student Limit
                </label>
                <input
                  type="number"
                  min="10"
                  max="50000"
                  required
                  value={newUserLimit}
                  onChange={e => setNewUserLimit(Number(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-lg font-bold text-emerald-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-3 py-1.5 border rounded-lg text-gray-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg cursor-pointer"
                >
                  Save Limit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
