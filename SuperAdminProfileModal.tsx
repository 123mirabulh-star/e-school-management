import React, { useState } from 'react';
import {
  X,
  Upload,
  Lock,
  UserCheck,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Key,
  Camera,
  Trash2,
  Save,
  Sparkles
} from 'lucide-react';
import { AppDatabase, logAuditAction, saveDatabase, DESIGNATED_SUPER_ADMIN_ID, updateSuperAdminProfileServer, updateSuperAdminPasswordServer } from '../services/storage';

interface SuperAdminProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  db: AppDatabase;
  onUpdateDb: (updated: AppDatabase) => void;
}

export const SuperAdminProfileModal: React.FC<SuperAdminProfileModalProps> = ({
  isOpen,
  onClose,
  db,
  onUpdateDb
}) => {
  const superAdminUser = db.users.find(
    u => u.username === DESIGNATED_SUPER_ADMIN_ID || (u.mobileNumber && u.mobileNumber === DESIGNATED_SUPER_ADMIN_ID)
  ) || db.currentUser;

  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

  // Profile Form State
  const [fullName, setFullName] = useState(superAdminUser?.fullName || 'Md. Mirabul Hossen');
  const [email, setEmail] = useState(superAdminUser?.email || '123mirabulh@gmail.com');
  const [photoPreview, setPhotoPreview] = useState<string>(superAdminUser?.avatar || '');

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & feedback
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  // Handle Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setErrorMessage('Profile photo size exceeds 3MB limit. Please choose a smaller image.');
      return;
    }

    setErrorMessage('');
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setPhotoPreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoPreview('');
  };

  // Save Profile Photo & Info
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSaving(true);

    try {
      const updatedUsers = db.users.map(u => {
        if (u.username === DESIGNATED_SUPER_ADMIN_ID || (u.mobileNumber && u.mobileNumber === DESIGNATED_SUPER_ADMIN_ID)) {
          return {
            ...u,
            fullName: fullName.trim() || 'Md. Mirabul Hossen',
            email: email.trim() || '123mirabulh@gmail.com',
            avatar: photoPreview
          };
        }
        return u;
      });

      const updatedCurrentUser = db.currentUser && (
        db.currentUser.username === DESIGNATED_SUPER_ADMIN_ID || db.currentUser.mobileNumber === DESIGNATED_SUPER_ADMIN_ID
      )
        ? {
            ...db.currentUser,
            fullName: fullName.trim() || 'Md. Mirabul Hossen',
            email: email.trim() || 'mirabul@schoolportal.com',
            avatar: photoPreview
          }
        : db.currentUser;

      let updatedDb: AppDatabase = {
        ...db,
        users: updatedUsers,
        currentUser: updatedCurrentUser
      };

      updatedDb = logAuditAction(
        updatedDb,
        'SUPER_ADMIN_PROFILE_UPDATE',
        `Super Admin ${fullName} updated profile photo and contact details.`
      );

      saveDatabase(updatedDb);
      onUpdateDb(updatedDb);

      // Async backend sync
      await updateSuperAdminProfileServer(photoPreview, fullName, email);

      setSuccessMessage('Super Admin profile photo and details saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3500);
    } catch (err: any) {
      setErrorMessage('Failed to save profile: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  // Change Password
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!currentPassword) {
      setErrorMessage('Please enter your current password.');
      return;
    }

    // Verify current password
    const existingPass = superAdminUser?.password || '420mirabul420';
    if (currentPassword !== existingPass) {
      setErrorMessage('Verification failed: Current password is incorrect.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('New password and confirmation password do not match.');
      return;
    }

    setIsSaving(true);
    try {
      const updatedUsers = db.users.map(u => {
        if (u.username === DESIGNATED_SUPER_ADMIN_ID || (u.mobileNumber && u.mobileNumber === DESIGNATED_SUPER_ADMIN_ID)) {
          return {
            ...u,
            password: newPassword
          };
        }
        return u;
      });

      const updatedCurrentUser = db.currentUser && (
        db.currentUser.username === DESIGNATED_SUPER_ADMIN_ID || db.currentUser.mobileNumber === DESIGNATED_SUPER_ADMIN_ID
      )
        ? { ...db.currentUser, password: newPassword }
        : db.currentUser;

      let updatedDb: AppDatabase = {
        ...db,
        users: updatedUsers,
        currentUser: updatedCurrentUser
      };

      updatedDb = logAuditAction(
        updatedDb,
        'SUPER_ADMIN_PASSWORD_CHANGE',
        `Super Admin ${superAdminUser?.fullName || 'Md. Mirabul Hossen'} updated security credentials.`
      );

      saveDatabase(updatedDb);
      onUpdateDb(updatedDb);

      // Async backend update
      await updateSuperAdminPasswordServer(currentPassword, newPassword);

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccessMessage('Password updated successfully! Your new password is now active.');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      setErrorMessage('Failed to update password: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-gray-200 overflow-hidden flex flex-col text-xs max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-400/20 border border-yellow-400/40 flex items-center justify-center text-yellow-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Super Admin Profile & Security</h3>
                <span className="text-[9px] bg-yellow-400 text-gray-950 font-black px-1.5 py-0.5 rounded">
                  Sole Owner
                </span>
              </div>
              <p className="text-[11px] text-blue-200 mt-0.5">
                User ID: <span className="font-mono text-white font-bold">{DESIGNATED_SUPER_ADMIN_ID}</span> (Md. Mirabul Hossen)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex items-center border-b border-gray-200 bg-gray-50 px-4 pt-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab('profile');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`px-3 py-2 font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'profile'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Profile Photo & Details</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('password');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`px-3 py-2 font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'password'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Security Password</span>
          </button>
        </div>

        {/* Body content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-300 text-red-800 rounded-xl font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* TAB 1: PROFILE & PHOTO */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Photo Upload Box */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-white border-2 border-dashed border-blue-400 flex items-center justify-center overflow-hidden shrink-0 shadow-sm relative group">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Super Admin Avatar"
                      className="w-full h-full object-cover"
                      onError={() => setPhotoPreview('')}
                    />
                  ) : (
                    <div className="w-full h-full bg-blue-700 text-white flex items-center justify-center font-black text-2xl">
                      M
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-bold text-gray-900 flex items-center gap-1">
                    <Camera className="w-4 h-4 text-blue-600" />
                    <span>Super Admin Profile Photo</span>
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    Upload a high-resolution portrait or photo. Maximum file size 3MB.
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    <label className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-2xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoUpload}
                      />
                    </label>

                    {photoPreview && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="bg-white border border-red-300 text-red-600 hover:bg-red-50 font-bold text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Account Details */}
              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Designated User ID (System Master Login)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={DESIGNATED_SUPER_ADMIN_ID}
                    className="w-full bg-gray-100 border border-gray-300 rounded-lg p-2 font-mono font-bold text-gray-700 cursor-not-allowed"
                  />
                  <span className="text-[10px] text-gray-400 mt-0.5 block">
                    Fixed system master phone identifier.
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 font-bold text-gray-900"
                    placeholder="Md. Mirabul Hossen"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 font-mono text-gray-900"
                    placeholder="mirabul@schoolportal.com"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Assigned Role
                  </label>
                  <div className="flex items-center justify-between p-2.5 bg-blue-50 border border-blue-200 rounded-lg font-bold text-blue-900">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-blue-700" />
                      Super Admin (Sole Master Authority)
                    </span>
                    <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded uppercase">
                      Permanent
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-bold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: PASSWORD CHANGE */}
          {activeTab === 'password' && (
            <form onSubmit={handleSavePassword} className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] space-y-1">
                <span className="font-bold block">🔒 Credential Security Protocol:</span>
                <p>
                  To change your Super Admin password, verify your existing security password first. Passwords must be at least 6 characters and never shared.
                </p>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Current Password *
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter current password (e.g. 420mirabul420)"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    className="w-full pr-9 pl-3 py-2 border border-gray-300 rounded-lg font-mono text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  New Security Password * (min 6 characters)
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="Enter new strong password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full pr-9 pl-3 py-2 border border-gray-300 rounded-lg font-mono text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="Re-enter new password to confirm"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full pr-9 pl-3 py-2 border border-gray-300 rounded-lg font-mono text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-bold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                >
                  <Key className="w-4 h-4" />
                  <span>{isSaving ? 'Updating...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
