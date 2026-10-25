import React, { useState, useEffect } from 'react';
import {
  Lock,
  UserCheck,
  ShieldCheck,
  Building,
  Key,
  Phone,
  Mail,
  Users,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  School,
  Search,
  Clock,
  Check,
  Copy,
  Award,
  Printer,
  Download,
  GraduationCap,
  FileText,
  X,
  RefreshCw,
  Send,
  Smartphone
} from 'lucide-react';
import { AppDatabase, setSessionAuth, setSessionUser, logAuditAction } from '../services/storage';
import { User, AccessRequest, Student, CalculatedResult } from '../types';
import { calculateAllResults } from '../services/resultEngine';
import { printDocument, downloadHtmlDocument } from '../utils/downloadHelper';

function matchUserByIdentifier(users: User[], cleanId: string): User | undefined {
  if (!cleanId || !Array.isArray(users)) return undefined;
  const parts = cleanId.split(/[\s+,/]+/).filter(Boolean);

  for (const u of users) {
    const uUsername = String(u.username || '').toLowerCase();
    const uEmail = String(u.email || '').toLowerCase();
    const uPhone = String(u.mobileNumber || '').replace(/\D/g, '');
    const uUserNumeric = uUsername.replace(/\D/g, '');

    if (uUsername === cleanId || uEmail === cleanId) return u;
    if (u.username === '01936988967' || u.mobileNumber === '01936988967') {
      if (cleanId === '123mirabulh@gmail.com' || cleanId === 'mirabul@schoolportal.com') return u;
      if (cleanId.includes('123mirabulh@gmail.com') || cleanId.includes('01936988967')) return u;
    }

    for (const part of parts) {
      if (part === uUsername || part === uEmail) return u;
      const partDigits = part.replace(/\D/g, '');
      if (partDigits.length >= 10) {
        if (uPhone.endsWith(partDigits.slice(-10)) || uUserNumeric.endsWith(partDigits.slice(-10))) {
          return u;
        }
      }
    }

    const numericId = cleanId.replace(/\D/g, '');
    if (numericId.length >= 10) {
      const last10 = numericId.slice(-10);
      if (uPhone.endsWith(last10) || uUserNumeric.endsWith(last10)) {
        return u;
      }
    }
  }
  return undefined;
}

interface AuthScreenProps {
  db: AppDatabase;
  onLoginSuccess: (user: User) => void;
  onUpdateDb: (updated: AppDatabase) => void;
  initialNotice?: string | null;
  requiredRoleForDestination?: string | null;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  db,
  onLoginSuccess,
  onUpdateDb,
  initialNotice,
  requiredRoleForDestination
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'result' | 'register' | 'status'>('login');

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register / Access Request state
  const [instName, setInstName] = useState('');
  const [eiin, setEiin] = useState('');
  const [applicantName, setApplicantName] = useState('');
  const [phone, setPhone] = useState('+880 17');
  const [email, setEmail] = useState('');
  const [expectedStudents, setExpectedStudents] = useState<number>(500);
  const [requestedPlan, setRequestedPlan] = useState<'trial' | 'standard' | 'enterprise'>('standard');
  const [notes, setNotes] = useState('');
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [submittedRequestId, setSubmittedRequestId] = useState('');

  // Status Check state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedRequest, setSearchedRequest] = useState<AccessRequest | null>(null);
  const [statusSearched, setStatusSearched] = useState(false);
  const [copiedCreds, setCopiedCreds] = useState(false);

  // Student Result Check state
  const [resultExamId, setResultExamId] = useState(db.examinations[0]?.id || '');
  const [resultClassId, setResultClassId] = useState(db.classes[0]?.id || '');
  const [resultSectionId, setResultSectionId] = useState('');
  const [resultStudentQuery, setResultStudentQuery] = useState('');
  const [searchedStudent, setSearchedStudent] = useState<Student | null>(null);
  const [searchedResult, setSearchedResult] = useState<CalculatedResult | null>(null);
  const [resultSearchDone, setResultSearchDone] = useState(false);
  const [resultError, setResultError] = useState('');

  // Forgot Password & OTP state
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<'request' | 'verify' | 'reset' | 'success'>('request');
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotDeliveryMethod, setForgotDeliveryMethod] = useState<'email'>('email');
  const [forgotSessionId, setForgotSessionId] = useState('');
  const [forgotMaskedEmail, setForgotMaskedEmail] = useState('');
  const [forgotMaskedPhone, setForgotMaskedPhone] = useState('');
  const [forgotProviderConfigured, setForgotProviderConfigured] = useState(true);
  const [forgotDevCode, setForgotDevCode] = useState<string | null>(null);
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotResetToken, setForgotResetToken] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotCooldown, setForgotCooldown] = useState(0);

  // Cooldown countdown
  useEffect(() => {
    if (forgotCooldown > 0) {
      const timer = setTimeout(() => setForgotCooldown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [forgotCooldown]);

  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    if (!forgotIdentifier.trim()) {
      setForgotError('Please enter your registered User ID, Mobile Number, or Email.');
      return;
    }
    setForgotLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: forgotIdentifier.trim(),
          deliveryMethod: forgotDeliveryMethod
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setForgotError(data.error || 'Failed to request verification code.');
        setForgotLoading(false);
        return;
      }

      if (data.genericNotice) {
        setForgotSuccess(data.message);
        setForgotStep('verify');
        setForgotLoading(false);
        return;
      }

      setForgotSessionId(data.resetSessionId);
      setForgotMaskedEmail(data.maskedEmail || '');
      setForgotMaskedPhone(data.maskedPhone || '');
      setForgotProviderConfigured(data.providerConfigured !== false);
      setForgotDevCode(data.devCode || null);
      setForgotCooldown(data.cooldownSeconds || 60);
      setForgotSuccess(data.message || 'One-time verification code generated.');
      setForgotStep('verify');
    } catch (err: any) {
      setForgotError('Failed to communicate with authentication server. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    if (!forgotOtp.trim() || forgotOtp.trim().length !== 6) {
      setForgotError('Please enter the 6-digit verification code.');
      return;
    }
    setForgotLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resetSessionId: forgotSessionId,
          otp: forgotOtp.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setForgotError(data.error || 'Invalid verification code.');
        setForgotLoading(false);
        return;
      }

      setForgotResetToken(data.resetToken);
      setForgotSuccess(data.message || 'Verification successful. Please choose a new password.');
      setForgotStep('reset');
    } catch (err: any) {
      setForgotError('Failed to verify OTP with server.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError('Passwords do not match. Please ensure both passwords match.');
      return;
    }

    if (forgotNewPassword.length < 8) {
      setForgotError('Password must be at least 8 characters long.');
      return;
    }

    if (!/[a-zA-Z]/.test(forgotNewPassword) || !/\d/.test(forgotNewPassword)) {
      setForgotError('Password must contain letters and at least one number.');
      return;
    }

    setForgotLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resetToken: forgotResetToken,
          newPassword: forgotNewPassword,
          confirmPassword: forgotConfirmPassword
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setForgotError(data.error || 'Failed to reset password.');
        setForgotLoading(false);
        return;
      }

      setForgotSuccess(data.message || 'Password reset successfully.');
      setForgotStep('success');
    } catch (err: any) {
      setForgotError('Failed to communicate with password reset service.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const cleanId = loginIdentifier.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanId || !cleanPass) {
      setLoginError('Please enter both your Login ID and Password.');
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: cleanId, password: cleanPass })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({ error: 'Invalid User ID or Password.' }));
        setLoginError(errJson.error || 'Authentication failed. Please verify your credentials.');
        return;
      }

      const data = await res.json();
      if (!data.success || !data.token || !data.user) {
        setLoginError('Authentication failed. Please verify your credentials.');
        return;
      }

      if (requiredRoleForDestination === 'admin' && !['Super Admin', 'School Administrator'].includes(data.user.role)) {
        setLoginError(`Access Denied: Your account role (${data.user.role}) does not have permission to access Web CMS Manager. Administrator credentials required.`);
        return;
      }

      // Login Successful
      setSessionAuth(data.token, data.user);
      const updated = logAuditAction(
        { ...db, currentUser: data.user, isAuthenticated: true },
        'USER_LOGIN',
        `User ${data.user.fullName} (${data.user.role}) signed in successfully`
      );
      onUpdateDb(updated);
      onLoginSuccess(data.user);
    } catch (err: any) {
      // Fallback verification if network unavailable
      const user = matchUserByIdentifier(db.users, cleanId);

      if (!user) {
        setLoginError('Invalid User ID, Mobile Number, or Email. If you are a new school, please click "Request Access" to register.');
        return;
      }

      if (user.status !== 'active') {
        setLoginError('This account is suspended or awaiting Super Administrator activation.');
        return;
      }

      if (user.password) {
        if (user.password.startsWith('pbkdf2:') || user.password.startsWith('scrypt:')) {
          setLoginError('Authentication server is temporarily unreachable. Please ensure the backend service is running to verify cryptographic credentials.');
          return;
        } else if (user.password !== cleanPass) {
          setLoginError('Incorrect password. Please verify your credentials or contact the Master Administrator.');
          return;
        }
      }

      if (requiredRoleForDestination === 'admin' && !['Super Admin', 'School Administrator'].includes(user.role)) {
        setLoginError(`Access Denied: Your account role (${user.role}) does not have permission to access Web CMS Manager. Administrator credentials required.`);
        return;
      }

      setSessionAuth(`local_${Date.now()}`, user);
      const updated = logAuditAction(
        { ...db, currentUser: user, isAuthenticated: true },
        'USER_LOGIN',
        `User ${user.fullName} (${user.role}) signed in successfully`
      );
      onUpdateDb(updated);
      onLoginSuccess(user);
    }
  };


  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!instName.trim() || !applicantName.trim() || !phone.trim()) {
      alert('Please fill in Institution Name, Applicant Name, and Phone Number.');
      return;
    }

    const newRequest: AccessRequest = {
      id: `req-${Date.now()}`,
      instituteName: instName.trim(),
      eiin: eiin.trim(),
      applicantName: applicantName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      expectedStudents: Number(expectedStudents) || 500,
      requestedPlan,
      notes: notes.trim(),
      submittedAt: new Date().toISOString().split('T')[0],
      status: 'pending'
    };

    const updatedDb = logAuditAction(
      {
        ...db,
        accessRequests: [newRequest, ...db.accessRequests]
      },
      'ACCESS_REQUEST_SUBMITTED',
      `New school access request submitted by ${newRequest.applicantName} for "${newRequest.instituteName}"`
    );

    onUpdateDb(updatedDb);
    setSubmittedRequestId(newRequest.id);
    setRequestSuccess(true);
  };

  const handleSearchStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const query = searchQuery.trim().toLowerCase();
    const found = db.accessRequests.find(r =>
      r.id.toLowerCase() === query ||
      r.phone.replace(/\s+/g, '').includes(query.replace(/\s+/g, '')) ||
      (r.email && r.email.toLowerCase().includes(query)) ||
      r.instituteName.toLowerCase().includes(query)
    );

    setSearchedRequest(found || null);
    setStatusSearched(true);
  };

  const handleUseApprovedCredentials = (req: AccessRequest) => {
    if (req.issuedUsername && req.issuedPassword) {
      setLoginIdentifier(req.issuedUsername);
      setPassword(req.issuedPassword);
      setActiveTab('login');
    }
  };

  // Student Result Check Handler
  const handleCheckStudentResult = (e: React.FormEvent) => {
    e.preventDefault();
    setResultError('');
    setResultSearchDone(true);
    setSearchedStudent(null);
    setSearchedResult(null);

    const query = resultStudentQuery.trim().toLowerCase();
    if (!query) {
      setResultError('Please enter Student Roll Number or Student ID.');
      return;
    }

    // Match student by Roll or Student ID, with optional class and section filters
    const matched = db.students.find(s => {
      const matchRoll = s.rollNo.toString() === query || s.rollNo.toString().padStart(2, '0') === query;
      const matchId = s.studentId && s.studentId.toLowerCase() === query;
      const matchClass = !resultClassId || s.classId === resultClassId;
      const matchSection = !resultSectionId || s.sectionId === resultSectionId;
      return (matchRoll || matchId) && matchClass && matchSection;
    });

    if (!matched) {
      setResultError(`No student record found matching Roll/ID "${resultStudentQuery}". Please verify Class, Section, and Roll No.`);
      return;
    }

    setSearchedStudent(matched);

    // Look up or calculate result
    const examId = resultExamId || db.examinations[0]?.id || 'exam-hy-2026';
    let res = db.results.find(r => r.studentId === matched.id && r.examId === examId);

    if (!res) {
      const calculated = calculateAllResults(
        [matched],
        examId,
        db.schoolSettings.currentAcademicYear,
        db.subjects,
        db.marks,
        db.gradingPolicy,
        db.conversionRules
      );
      if (calculated.length > 0) {
        res = calculated[0];
      }
    }

    setSearchedResult(res || null);
  };

  const handlePrintStudentResult = () => {
    const cardEl = document.getElementById('student-portal-marksheet');
    if (cardEl && searchedStudent) {
      printDocument(`${searchedStudent.nameEn} - Official Mark Sheet`, cardEl.innerHTML);
    } else {
      window.print();
    }
  };

  const handleDownloadStudentResult = () => {
    const cardEl = document.getElementById('student-portal-marksheet');
    if (cardEl && searchedStudent) {
      downloadHtmlDocument(
        `MarkSheet_${searchedStudent.studentId || searchedStudent.rollNo}_${searchedStudent.nameEn.replace(/\s+/g, '_')}`,
        `${searchedStudent.nameEn} - Official Mark Sheet`,
        cardEl.innerHTML
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0c192c] via-[#0f243e] to-[#0a1220] flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Portal Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 p-6 sm:p-8 text-white text-center relative">
          <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner border border-white/20">
            <School className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight uppercase">
            E-Biddalay School Management System
          </h1>
          <p className="text-xs text-blue-200 mt-1">
            Enterprise Education Administration, Results & Licensing Portal
          </p>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap justify-center gap-1.5 mt-5">
            <button
              onClick={() => { setActiveTab('login'); setLoginError(''); }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'login'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white/10 text-gray-200 hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Sign In to Portal</span>
            </button>
            <button
              onClick={() => { setActiveTab('result'); setResultError(''); }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'result'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white/10 text-gray-200 hover:text-white'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-yellow-300" />
              <span>Check Student Result</span>
            </button>
            <button
              onClick={() => { setActiveTab('register'); setRequestSuccess(false); }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'register'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white/10 text-gray-200 hover:text-white'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>Request Access / Register</span>
            </button>
            <button
              onClick={() => { setActiveTab('status'); setStatusSearched(false); }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'status'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white/10 text-gray-200 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Check Request Status</span>
            </button>
          </div>
        </div>

        {/* TAB 1: LOGIN FORM */}
        {activeTab === 'login' && (
          <div className="p-6 sm:p-8 space-y-5">
            {initialNotice && (
              <div className="bg-amber-50 border border-amber-300 text-amber-900 p-3.5 rounded-xl text-xs flex items-center gap-2.5 font-bold shadow-xs">
                <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
                <span>{initialNotice}</span>
              </div>
            )}

            {loginError && (
              <div className="bg-red-50 border border-red-300 text-red-800 p-3 rounded-xl text-xs flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  User ID, Mobile Number or Email *
                </label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Enter your User ID, Mobile Number or Email"
                    value={loginIdentifier}
                    onChange={e => setLoginIdentifier(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium text-gray-900 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-xs"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-gray-700">
                    Security Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showPassword ? 'Hide' : 'Show'}</span>
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter assigned password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium text-gray-900 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-xs font-mono"
                  />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-gray-500 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>Institutional Authentication</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPasswordModal(true);
                       setForgotStep('request');
                       setForgotIdentifier(loginIdentifier || '');
                       setForgotError('');
                       setForgotSuccess('');
                    }}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Key className="w-3 h-3 text-amber-500" />
                    <span>Forgot Password?</span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer text-xs"
              >
                <span>Authorize & Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="pt-3 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-500">
                New institution wanting to use this system?{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className="font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  Request Institution Access / License
                </button>
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: STUDENT & PARENT RESULT CHECK PORTAL */}
        {activeTab === 'result' && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-base font-bold text-gray-900 flex items-center justify-center gap-1.5">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                Student & Guardian Online Result Portal
              </h2>
              <p className="text-xs text-gray-500">
                Check and download academic mark sheets by Roll Number, Class, Section, or Student ID.
              </p>
            </div>

            {/* Result Search Form */}
            <form onSubmit={handleCheckStudentResult} className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Select Examination *</label>
                  <select
                    value={resultExamId}
                    onChange={e => setResultExamId(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg p-2 font-medium"
                    required
                  >
                    {db.examinations.map(ex => (
                      <option key={ex.id} value={ex.id}>
                        {ex.name} ({ex.academicYear})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Select Class *</label>
                  <select
                    value={resultClassId}
                    onChange={e => {
                      setResultClassId(e.target.value);
                      setResultSectionId('');
                    }}
                    className="w-full bg-white border border-gray-300 rounded-lg p-2 font-medium"
                  >
                    <option value="">All Classes</option>
                    {db.classes.map(cls => (
                      <option key={cls.id} value={cls.id}>
                        {cls.nameEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Section (Optional)</label>
                  <select
                    value={resultSectionId}
                    onChange={e => setResultSectionId(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg p-2 font-medium"
                  >
                    <option value="">All Sections</option>
                    {db.sections
                      .filter(s => !resultClassId || s.classId === resultClassId)
                      .map(sec => (
                        <option key={sec.id} value={sec.id}>
                          {sec.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Student Roll Number or Student ID *
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. 1, 2, or STU-2026-901"
                      value={resultStudentQuery}
                      onChange={e => setResultStudentQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg font-bold text-gray-900 text-xs"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2 rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Search className="w-4 h-4" />
                    <span>Search Result</span>
                  </button>
                </div>
              </div>

              {/* Quick sample hints */}
              <div className="flex items-center gap-2 pt-1 text-[11px] text-gray-500">
                <span>Sample Student Rolls:</span>
                <button
                  type="button"
                  onClick={() => {
                    setResultClassId('c10');
                    setResultStudentQuery('1');
                  }}
                  className="font-mono text-blue-600 hover:underline bg-white px-2 py-0.5 rounded border border-gray-200"
                >
                  Class 10 - Roll 1
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setResultClassId('c10');
                    setResultStudentQuery('2');
                  }}
                  className="font-mono text-blue-600 hover:underline bg-white px-2 py-0.5 rounded border border-gray-200"
                >
                  Class 10 - Roll 2
                </button>
              </div>
            </form>

            {resultError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{resultError}</span>
              </div>
            )}

            {/* Display Found Mark Sheet */}
            {searchedStudent && (
              <div className="space-y-4">
                <div className="flex items-center justify-between no-print">
                  <span className="text-xs font-bold text-gray-700">Official Student Academic Record</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDownloadStudentResult}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-gray-600" />
                      Download Mark Sheet (.HTML)
                    </button>
                    <button
                      onClick={handlePrintStudentResult}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Print Mark Sheet
                    </button>
                  </div>
                </div>

                <div
                  id="student-portal-marksheet"
                  className="bg-white border-2 border-gray-300 rounded-2xl p-6 shadow-md space-y-4"
                >
                  {/* Mark Sheet Header */}
                  <div className="text-center border-b-2 border-gray-800 pb-3">
                    <h3 className="text-base font-black uppercase text-gray-900 tracking-wide">
                      {db.schoolSettings.nameEn}
                    </h3>
                    <p className="text-[11px] text-gray-600">
                      {db.schoolSettings.address} • EIIN: {db.schoolSettings.eiin}
                    </p>
                    <div className="inline-block mt-2 bg-blue-900 text-white text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
                      Academic Progress Report & Mark Sheet
                    </div>
                    <p className="text-xs font-bold text-blue-900 mt-1">
                      {db.examinations.find(e => e.id === resultExamId)?.name || 'Annual Examination'} • Session {db.schoolSettings.currentAcademicYear}
                    </p>
                  </div>

                  {/* Student Details Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-3 rounded-xl text-xs">
                    <div>
                      <span className="text-gray-500 block text-[10px]">Student Name</span>
                      <strong className="text-gray-900">{searchedStudent.nameEn}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[10px]">Student ID & Roll</span>
                      <strong className="text-gray-900">
                        Roll #{searchedStudent.rollNo} {searchedStudent.studentId ? `• ${searchedStudent.studentId}` : ''}
                      </strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[10px]">Class & Section</span>
                      <strong className="text-gray-900">
                        {db.classes.find(c => c.id === searchedStudent.classId)?.nameEn || 'Class'} •{' '}
                        {db.sections.find(s => s.id === searchedStudent.sectionId)?.name || 'Section A'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[10px]">Blood Group & Gender</span>
                      <strong className="text-gray-900">
                        {searchedStudent.bloodGroup || 'A+'} ({searchedStudent.gender || 'Male'})
                      </strong>
                    </div>
                  </div>

                  {/* Overall Result Status Summary */}
                  {searchedResult ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                      <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl">
                        <span className="text-[10px] text-blue-700 font-bold block uppercase">GPA Score</span>
                        <strong className="text-lg font-black text-blue-950 font-mono">
                          {searchedResult.gpa.toFixed(2)}
                        </strong>
                      </div>
                      <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded-xl">
                        <span className="text-[10px] text-indigo-700 font-bold block uppercase">Letter Grade</span>
                        <strong className="text-lg font-black text-indigo-950">
                          {searchedResult.letterGrade}
                        </strong>
                      </div>
                      <div className={`p-2.5 rounded-xl border ${searchedResult.resultStatus === 'PASSED' ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-red-50 border-red-200 text-red-950'}`}>
                        <span className="text-[10px] font-bold block uppercase">Final Status</span>
                        <strong className="text-sm font-black uppercase">
                          {searchedResult.resultStatus}
                        </strong>
                      </div>
                      <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl">
                        <span className="text-[10px] text-amber-700 font-bold block uppercase">Total Marks</span>
                        <strong className="text-lg font-black text-amber-950 font-mono">
                          {searchedResult.totalObtainedMarks}
                        </strong>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-50 text-center text-xs text-gray-500 rounded-xl">
                      Examination marks are being compiled by the academic board.
                    </div>
                  )}

                  {/* Subject Wise Performance Table */}
                  {searchedResult && searchedResult.subjectResults && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs border-collapse">
                        <thead>
                          <tr className="bg-gray-100 border text-gray-800">
                            <th className="py-2 px-3 text-left border">Subject Name</th>
                            <th className="py-2 px-2 text-center border">CQ</th>
                            <th className="py-2 px-2 text-center border">MCQ</th>
                            <th className="py-2 px-2 text-center border">Prac</th>
                            <th className="py-2 px-2 text-center border font-bold">Obtained</th>
                            <th className="py-2 px-2 text-center border">Full</th>
                            <th className="py-2 px-2 text-center border">Grade</th>
                            <th className="py-2 px-2 text-center border">GPA</th>
                          </tr>
                        </thead>
                        <tbody>
                          {searchedResult.subjectResults.map((sr, idx) => {
                            const cqVal = sr.componentBreakdown?.find(c => c.code === 'CQ')?.obtainedMarks ?? '-';
                            const mcqVal = sr.componentBreakdown?.find(c => c.code === 'MCQ')?.obtainedMarks ?? '-';
                            const prVal = sr.componentBreakdown?.find(c => c.code === 'PR')?.obtainedMarks ?? '-';

                            return (
                              <tr key={idx} className="border-b hover:bg-gray-50">
                                <td className="py-2 px-3 border font-semibold text-gray-900">
                                  {sr.subjectNameEn}
                                  {sr.isOptional && (
                                    <span className="ml-1 text-[9px] bg-purple-100 text-purple-800 font-bold px-1 rounded">
                                      4th Subject
                                    </span>
                                  )}
                                </td>
                                <td className="py-2 px-2 text-center border font-mono">{cqVal}</td>
                                <td className="py-2 px-2 text-center border font-mono">{mcqVal}</td>
                                <td className="py-2 px-2 text-center border font-mono">{prVal}</td>
                                <td className="py-2 px-2 text-center border font-mono font-bold text-gray-900">
                                  {sr.totalObtained}
                                </td>
                                <td className="py-2 px-2 text-center border font-mono text-gray-500">{sr.fullMarks}</td>
                                <td className="py-2 px-2 text-center border font-bold">
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                                    sr.letterGrade === 'F' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-800'
                                  }`}>
                                    {sr.letterGrade}
                                  </span>
                                </td>
                                <td className="py-2 px-2 text-center border font-mono font-bold text-blue-900">
                                  {sr.gradePoint.toFixed(2)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Institution Signature Footer */}
                  <div className="pt-8 grid grid-cols-3 text-center text-[10px] text-gray-600">
                    <div className="border-t border-gray-400 pt-1">Class Teacher</div>
                    <div className="border-t border-gray-400 pt-1">Exam Controller</div>
                    <div className="border-t border-gray-400 pt-1 font-bold text-gray-900">
                      Headmaster / Principal
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: REGISTER / REQUEST ACCESS FORM */}
        {activeTab === 'register' && (
          <div className="p-6 sm:p-8 space-y-5">
            {requestSuccess ? (
              <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-emerald-950">
                  Access Application Submitted Successfully!
                </h3>
                <p className="text-xs text-emerald-800 max-w-md mx-auto">
                  Your request has been forwarded to the Super Administrator. Once verified, you will be issued a unique <strong>User ID</strong>, <strong>Password</strong>, and <strong>Student Quota Limit</strong>.
                </p>
                <div className="bg-white p-3 rounded-xl border border-emerald-200 inline-block text-xs font-mono">
                  <span className="text-gray-500">Tracking Reference ID: </span>
                  <strong className="text-emerald-800">{submittedRequestId}</strong>
                </div>
                <div className="pt-2 flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery(submittedRequestId);
                      setActiveTab('status');
                      setStatusSearched(false);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer"
                  >
                    Track Application Status
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('login')}
                    className="border border-emerald-400 text-emerald-800 font-bold text-xs px-4 py-2 rounded-xl hover:bg-emerald-100 transition-colors cursor-pointer"
                  >
                    Return to Sign In
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Register Institution for Software Access
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Submit your school details. The Master Administrator will review and provide custom login credentials with student limits.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Institution Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Chittagong Government High School"
                      value={instName}
                      onChange={e => setInstName(e.target.value)}
                      className="w-full border rounded-lg p-2 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">EIIN Identifier</label>
                    <input
                      type="text"
                      placeholder="e.g. 104231"
                      value={eiin}
                      onChange={e => setEiin(e.target.value)}
                      className="w-full border rounded-lg p-2 font-mono font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Applicant / Principal Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Md. Shahidul Islam"
                      value={applicantName}
                      onChange={e => setApplicantName(e.target.value)}
                      className="w-full border rounded-lg p-2"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Mobile Contact *</label>
                    <input
                      type="text"
                      required
                      placeholder="+880 1711-000000"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full border rounded-lg p-2 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Official Email</label>
                    <input
                      type="email"
                      placeholder="admin@school.edu.bd"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full border rounded-lg p-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Estimated Student Capacity *</label>
                    <select
                      value={expectedStudents}
                      onChange={e => setExpectedStudents(Number(e.target.value))}
                      className="w-full border rounded-lg p-2 font-medium"
                    >
                      <option value={200}>Up to 200 Students</option>
                      <option value={500}>Up to 500 Students (Standard)</option>
                      <option value={1000}>Up to 1,000 Students</option>
                      <option value={2500}>Up to 2,500 Students</option>
                      <option value={5000}>Unlimited / Multi-Branch</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Requested License Type</label>
                    <select
                      value={requestedPlan}
                      onChange={e => setRequestedPlan(e.target.value as any)}
                      className="w-full border rounded-lg p-2 font-medium"
                    >
                      <option value="trial">Evaluation License (30 Days)</option>
                      <option value="standard">Standard Institutional License</option>
                      <option value="enterprise">Enterprise Multi-Campus License</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Additional Requirements / Notes</label>
                  <textarea
                    rows={2}
                    placeholder="Enter any specific requests (e.g. number of teachers, academic sessions)..."
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="w-full border rounded-lg p-2"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                >
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span>Submit License Request to Administrator</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* TAB 4: CHECK REQUEST STATUS */}
        {activeTab === 'status' && (
          <div className="p-6 sm:p-8 space-y-5">
            <div className="text-center space-y-1">
              <h2 className="text-sm font-bold text-gray-900">Check Your Access Application Status</h2>
              <p className="text-xs text-gray-500">
                Track approval status or retrieve your assigned credentials using your phone number or reference ID.
              </p>
            </div>

            <form onSubmit={handleSearchStatus} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Enter your Mobile Number, Email or Request ID (e.g. req-...)"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border rounded-xl text-xs font-medium"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1 cursor-pointer"
              >
                <span>Check</span>
              </button>
            </form>

            {statusSearched && (
              <div>
                {searchedRequest ? (
                  <div className="border rounded-2xl p-4 bg-gray-50 space-y-3 text-xs">
                    <div className="flex items-center justify-between border-b pb-2">
                      <div>
                        <h4 className="font-bold text-gray-900">{searchedRequest.instituteName}</h4>
                        <p className="text-[11px] text-gray-500">
                          Applicant: {searchedRequest.applicantName} • {searchedRequest.phone}
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                        searchedRequest.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : searchedRequest.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {searchedRequest.status}
                      </span>
                    </div>

                    {searchedRequest.status === 'pending' && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Your request is under review. Please check back shortly or call the master admin.</span>
                      </div>
                    )}

                    {searchedRequest.status === 'approved' && (
                      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
                        <div className="flex items-center gap-2 text-emerald-900 font-bold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Congratulations! Your License Has Been Approved & Provisioned.</span>
                        </div>

                        <div className="bg-white p-3 rounded-lg border border-emerald-200 font-mono text-xs space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Login ID / Username:</span>
                            <span className="font-bold text-blue-900">{searchedRequest.issuedUsername}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Password:</span>
                            <span className="font-bold text-gray-900">{searchedRequest.issuedPassword}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Authorized Student Limit:</span>
                            <span className="font-bold text-emerald-700">{searchedRequest.approvedStudentLimit || searchedRequest.expectedStudents} Students</span>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleUseApprovedCredentials(searchedRequest)}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <span>Proceed to Sign In</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {searchedRequest.status === 'rejected' && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-900 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                        <span>This application was not approved. Please contact the administrator.</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-center text-xs text-gray-500">
                    No application found matching "{searchQuery}". Please check your tracking ID, phone, or email.
                  </div>
                )}
              </div>
            )}

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
              >
                ← Return to Sign In
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FORGOT PASSWORD & OTP RECOVERY MODAL */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-slate-900 p-5 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
                  <Key className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <span>Admin Password Recovery</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                      OTP Secure
                    </span>
                  </h3>
                  <p className="text-[11px] text-gray-400">E-Biddalay Cloud Authentication Engine</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowForgotPasswordModal(false);
                  setForgotError('');
                  setForgotSuccess('');
                  setForgotOtp('');
                  setForgotStep('request');
                }}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Progress Bar */}
            <div className="bg-slate-50 px-6 py-2.5 border-b border-gray-200 flex items-center justify-between text-[11px] font-semibold text-gray-500">
              <div className={`flex items-center gap-1.5 ${forgotStep === 'request' ? 'text-blue-600 font-bold' : 'text-emerald-600'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${forgotStep === 'request' ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'}`}>
                  {forgotStep !== 'request' ? '✓' : '1'}
                </span>
                <span>Request</span>
              </div>
              <span className="text-gray-300">───</span>
              <div className={`flex items-center gap-1.5 ${forgotStep === 'verify' ? 'text-blue-600 font-bold' : ['reset', 'success'].includes(forgotStep) ? 'text-emerald-600' : ''}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${forgotStep === 'verify' ? 'bg-blue-600 text-white' : ['reset', 'success'].includes(forgotStep) ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                  {['reset', 'success'].includes(forgotStep) ? '✓' : '2'}
                </span>
                <span>Verify OTP</span>
              </div>
              <span className="text-gray-300">───</span>
              <div className={`flex items-center gap-1.5 ${forgotStep === 'reset' ? 'text-blue-600 font-bold' : forgotStep === 'success' ? 'text-emerald-600' : ''}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${forgotStep === 'reset' ? 'bg-blue-600 text-white' : forgotStep === 'success' ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                  {forgotStep === 'success' ? '✓' : '3'}
                </span>
                <span>New Password</span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              {forgotError && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-xl flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{forgotError}</span>
                </div>
              )}

              {forgotSuccess && forgotStep !== 'success' && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{forgotSuccess}</span>
                </div>
              )}

              {/* STEP 1: REQUEST OTP */}
              {forgotStep === 'request' && (
                <form onSubmit={handleRequestOtp} className="space-y-4">
                  <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-blue-900 text-xs">
                    <p className="font-semibold mb-1">Recover Admin Access</p>
                    <p className="text-blue-700 text-[11px] leading-relaxed">
                      Enter your registered Super Admin User ID, mobile number, or email. A time-limited 6-digit verification code will be dispatched to your authorized recovery contact.
                    </p>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      Registered User ID / Mobile / Email *
                    </label>
                    <div className="relative">
                      <UserCheck className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={forgotIdentifier}
                        onChange={e => setForgotIdentifier(e.target.value)}
                        placeholder="Enter your registered User ID, Mobile Number or Email"
                        className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium text-gray-900 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      Password Recovery Channel
                    </label>
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-900">
                      <Mail className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div>
                        <span className="font-bold block">Official Recovery Email (SMTP)</span>
                        <span className="text-[11px] text-emerald-700">A secure 6-digit one-time verification code (OTP) will be dispatched directly to your registered email address.</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-300 text-white font-bold py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer text-xs"
                    >
                      {forgotLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Generating Secure Code...</span>
                        </>
                      ) : (
                        <>
                          <span>Send 6-Digit Verification Code</span>
                          <Send className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 2: VERIFY OTP */}
              {forgotStep === 'verify' && (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="p-3 bg-slate-50 border border-gray-200 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between text-gray-600 text-[11px]">
                      <span>Recipient Contact:</span>
                      <span className="font-mono font-bold text-gray-800">
                        {forgotMaskedPhone || forgotMaskedEmail || 'Registered Administrator Contact'}
                      </span>
                    </div>
                    {forgotMaskedEmail && forgotMaskedPhone && (
                      <div className="flex items-center justify-between text-gray-500 text-[11px]">
                        <span>Alternate:</span>
                        <span className="font-mono text-gray-600">{forgotMaskedEmail}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-[11px] text-amber-700 pt-1 border-t border-gray-200/60">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>Code Expiry:</span>
                      </span>
                      <span className="font-bold">5 minutes</span>
                    </div>
                  </div>

                  {/* Dev Code indicator when external gateway is not yet configured */}
                  {!forgotProviderConfigured && forgotDevCode && (
                    <div className="p-3 bg-amber-50/80 border border-amber-300 rounded-xl space-y-1.5">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div className="text-[11px] text-amber-900 leading-snug">
                          <p className="font-bold">Gateway Credentials Pending in .env</p>
                          <p className="text-amber-800 text-[10px]">
                            Live SMS/SMTP keys are not yet set. For administrator recovery verification, use generated code:
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between bg-white px-3 py-1.5 rounded-lg border border-amber-200">
                        <span className="text-[11px] text-gray-500 font-medium">OTP Verification Code:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-base text-blue-700 tracking-wider">
                            {forgotDevCode}
                          </span>
                          <button
                            type="button"
                            onClick={() => setForgotOtp(forgotDevCode)}
                            className="px-2 py-0.5 text-[10px] bg-blue-100 text-blue-700 hover:bg-blue-200 rounded font-bold cursor-pointer"
                          >
                            Fill
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block font-bold text-gray-700 mb-1 text-center">
                      Enter 6-Digit Verification Code *
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      autoFocus
                      required
                      value={forgotOtp}
                      onChange={e => setForgotOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="• • • • • •"
                      className="w-full py-3 bg-gray-50 border-2 border-blue-400 rounded-xl text-center text-2xl font-bold font-mono tracking-widest text-gray-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    />
                    <p className="text-center text-[11px] text-gray-500 mt-1">
                      Enter the 6-digit number dispatched to your contact
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => setForgotStep('request')}
                      className="text-[11px] text-gray-500 hover:text-gray-800 underline cursor-pointer"
                    >
                      ← Re-enter User ID
                    </button>
                    <button
                      type="button"
                      disabled={forgotCooldown > 0 || forgotLoading}
                      onClick={() => handleRequestOtp()}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:no-underline underline cursor-pointer flex items-center gap-1"
                    >
                      <RefreshCw className={`w-3 h-3 ${forgotLoading ? 'animate-spin' : ''}`} />
                      <span>{forgotCooldown > 0 ? `Resend Code (${forgotCooldown}s)` : 'Resend Code'}</span>
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading || forgotOtp.length !== 6}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-300 text-white font-bold py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer text-xs"
                  >
                    {forgotLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Verifying Code...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify Code & Continue</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* STEP 3: SET NEW PASSWORD */}
              {forgotStep === 'reset' && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs">
                    <p className="font-semibold mb-1 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>OTP Verified Successfully</span>
                    </p>
                    <p className="text-emerald-700 text-[11px] leading-relaxed">
                      Create a strong new password for your administrator account. All existing active sessions will be revoked upon confirmation.
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-bold text-gray-700">
                        New Security Password *
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                        className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {showForgotNewPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        <span>{showForgotNewPassword ? 'Hide' : 'Show'}</span>
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showForgotNewPassword ? 'text' : 'password'}
                        required
                        value={forgotNewPassword}
                        onChange={e => setForgotNewPassword(e.target.value)}
                        placeholder="Minimum 8 characters with letters & numbers"
                        className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium text-gray-900 focus:bg-white focus:border-blue-600 font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      Confirm New Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showForgotNewPassword ? 'text' : 'password'}
                        required
                        value={forgotConfirmPassword}
                        onChange={e => setForgotConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium text-gray-900 focus:bg-white focus:border-blue-600 font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-[11px] text-gray-600 space-y-1">
                    <p className="font-bold text-gray-700">Password Requirements:</p>
                    <div className="flex items-center gap-1.5">
                      <Check className={`w-3.5 h-3.5 ${forgotNewPassword.length >= 8 ? 'text-emerald-600' : 'text-gray-300'}`} />
                      <span className={forgotNewPassword.length >= 8 ? 'text-emerald-700 font-medium' : ''}>At least 8 characters in length</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className={`w-3.5 h-3.5 ${/[a-zA-Z]/.test(forgotNewPassword) && /\d/.test(forgotNewPassword) ? 'text-emerald-600' : 'text-gray-300'}`} />
                      <span className={/[a-zA-Z]/.test(forgotNewPassword) && /\d/.test(forgotNewPassword) ? 'text-emerald-700 font-medium' : ''}>Includes both letters and numbers</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className={`w-3.5 h-3.5 ${forgotNewPassword.length > 0 && forgotNewPassword === forgotConfirmPassword ? 'text-emerald-600' : 'text-gray-300'}`} />
                      <span className={forgotNewPassword.length > 0 && forgotNewPassword === forgotConfirmPassword ? 'text-emerald-700 font-medium' : ''}>Passwords match exactly</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading || forgotNewPassword.length < 8 || forgotNewPassword !== forgotConfirmPassword}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-300 text-white font-bold py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer text-xs"
                  >
                    {forgotLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <span>Update Password & Revoke Old Sessions</span>
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* STEP 4: SUCCESS */}
              {forgotStep === 'success' && (
                <div className="text-center py-4 space-y-4">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-bold text-gray-900 text-sm">Password Updated Successfully!</h4>
                    <p className="text-gray-600 text-xs leading-relaxed max-w-xs mx-auto">
                      Your administrator credentials have been securely refreshed with PBKDF2 cryptography. All prior active sessions have been invalidated.
                    </p>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-left text-xs space-y-1">
                    <div className="flex justify-between text-gray-500">
                      <span>Account Security:</span>
                      <span className="text-emerald-600 font-bold">Updated & Verified</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>Authentication Status:</span>
                      <span className="text-gray-800 font-medium">Ready for Sign In</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPasswordModal(false);
                      setLoginIdentifier(forgotIdentifier);
                      setPassword('');
                      setLoginError('');
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer text-xs"
                  >
                    <span>Proceed to Admin Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mandatory Creator Credit Footer */}
      <footer className="mt-5 text-center text-xs text-gray-400 space-y-1">
        <p className="font-bold text-gray-300 tracking-wide text-xs">
          Web Software Create by Md. Mirabul Hossen
        </p>
        <p className="text-[11px] text-gray-500">
          E-Biddalay Cloud School Management • Role-Based Authentication & Result Automation
        </p>
      </footer>
    </div>
  );
};
