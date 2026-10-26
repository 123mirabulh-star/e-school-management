import React, { useState, useEffect } from 'react';
import { Sidebar, NavItemKey } from './Sidebar';
import { Navbar } from './Navbar';
import { AuthScreen } from './AuthScreen';
import { DashboardView } from './DashboardView';
import { StudentsView } from './StudentsView';
import { SubjectsView } from './SubjectsView';
import { MarkDistributionView } from './MarkDistributionView';
import { MarkConversionView } from './MarkConversionView';
import { MarksEntryView } from './MarksEntryView';
import { ResultsView } from './ResultsView';
import { GradingSettingsView } from './GradingSettingsView';
import { AttendanceView } from './AttendanceView';
import { FeesManagementView } from './FeesManagementView';
import { IncomeExpenseView } from './IncomeExpenseView';
import { NoticesView } from './NoticesView';
import { ReportsView } from './ReportsView';
import { SchoolSettingsView } from './SchoolSettingsView';
import { AuditLogsView } from './AuditLogsView';
import { BackupRestoreView } from './BackupRestoreView';
import { ClassRoutineView } from './ClassRoutineView';
import { ClassesSectionsView } from './ClassesSectionsView';
import { GroupSettingsView } from './GroupSettingsView';
import { FacultyView } from './FacultyView';
import { UserManagementView } from './UserManagementView';
import { AccessRequestsView } from './AccessRequestsView';
import { PromotionView } from './PromotionView';
import { ExaminationsView } from './ExaminationsView';
import { ZipDownloaderModal } from './ZipDownloaderModal';
import { SuperAdminProfileModal } from './SuperAdminProfileModal';
import { PublicWebsite } from './PublicWebsite';
import { WebsiteManagementView } from './WebsiteManagementView';
import { AppDatabase, loadDatabase, saveDatabase, setSessionUser, clearSessionAuth, getSessionToken, logAuditAction, syncDatabaseFromServer } from './storage';
import { User } from './initialData';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function App() {
  const [db, setDb] = useState<AppDatabase>(() => loadDatabase());
  const [viewMode, setViewMode] = useState<'website' | 'portal' | 'auth'>('website');
  const [currentNav, setCurrentNav] = useState<NavItemKey>('dashboard');
  const [selectedMarksExamId, setSelectedMarksExamId] = useState<string>('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isZipModalOpen, setIsZipModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Synchronize database records from server and verify active session on startup
  useEffect(() => {
    const token = getSessionToken();
    if (token) {
      fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-session-token': token
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.authenticated && data.user) {
            setDb(prev => ({
              ...prev,
              currentUser: data.user,
              isAuthenticated: true
            }));
          } else {
            clearSessionAuth();
            setDb(prev => ({
              ...prev,
              currentUser: null,
              isAuthenticated: false
            }));
          }
        })
        .catch(() => {
          // If network error, preserve local state
        });
    }

    syncDatabaseFromServer().then(serverDb => {
      if (serverDb) {
        setDb(prev => ({
          ...serverDb,
          currentUser: prev.currentUser,
          isAuthenticated: prev.isAuthenticated
        }));
      }
    });
  }, []);

  // Sync state with storage on update
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [intendedDestination, setIntendedDestination] = useState<NavItemKey | null>(null);

  const handleUpdateDb = (updated: AppDatabase) => {
    setDb(updated);
    saveDatabase(updated);
  };

  const handleLoginSuccess = (user: User) => {
    setDb(prev => ({
      ...prev,
      currentUser: user,
      isAuthenticated: true
    }));
    if (intendedDestination === 'website_management') {
      if (['Super Admin', 'School Administrator'].includes(user.role)) {
        setCurrentNav('website_management');
        setIntendedDestination(null);
        setAuthNotice(null);
        setViewMode('portal');
        return;
      }
    }
    setCurrentNav('dashboard');
    setIntendedDestination(null);
    setAuthNotice(null);
    setViewMode('portal');
  };

  const handleLogout = () => {
    const token = getSessionToken();
    if (token) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(() => {});
    }
    clearSessionAuth();
    const updated = logAuditAction(
      { ...db, currentUser: null, isAuthenticated: false },
      'USER_LOGOUT',
      `User signed out of portal`
    );
    handleUpdateDb(updated);
    setViewMode('website');
  };

  const handleSwitchUser = (newUser: User) => {
    setSessionUser(newUser);
    const updated: AppDatabase = { ...db, currentUser: newUser };
    handleUpdateDb(updated);
  };

  const handleSelectAcademicYear = (newYear: string) => {
    const updatedSettings = { ...db.schoolSettings, currentAcademicYear: newYear };
    const updatedYears = db.academicYears.map(y => ({ ...y, isCurrent: y.year === newYear }));
    handleUpdateDb({ ...db, schoolSettings: updatedSettings, academicYears: updatedYears });
  };

  // Intercept 'code_zip' nav item to open the modal
  const handleSelectNav = (key: NavItemKey) => {
    if (key === 'code_zip') {
      setIsZipModalOpen(true);
    } else {
      setCurrentNav(key);
    }
  };

  const handleGoToCMS = () => {
    if (db.isAuthenticated && db.currentUser) {
      if (['Super Admin', 'School Administrator'].includes(db.currentUser.role)) {
        setCurrentNav('website_management');
        setViewMode('portal');
      } else {
        setAuthNotice('Access Denied: Your current login role does not have administrative permissions to edit the public website. Please sign in with an Administrator account.');
        setIntendedDestination('website_management');
        setViewMode('auth');
      }
    } else {
      setAuthNotice('Admin Authentication Required: Please sign in with your Administrator credentials to access the Website CMS Manager.');
      setIntendedDestination('website_management');
      setViewMode('auth');
    }
  };

  // If viewing the public school website (default for visitors and can be previewed by admin)
  if (viewMode === 'website') {
    return (
      <PublicWebsite
        db={db}
        onUpdateDb={handleUpdateDb}
        currentUser={db.isAuthenticated ? db.currentUser : null}
        onGoToPortal={() => {
          if (db.isAuthenticated && db.currentUser) {
            setViewMode('portal');
          } else {
            setAuthNotice(null);
            setIntendedDestination(null);
            setViewMode('auth');
          }
        }}
        onGoToCMS={handleGoToCMS}
      />
    );
  }

  // If unauthenticated and user clicked 'Portal Login', show secure AuthScreen with back link
  if (!db.isAuthenticated || !db.currentUser) {
    return (
      <div className="relative">
        <div className="fixed top-3 left-3 z-50">
          <button
            onClick={() => {
              setAuthNotice(null);
              setIntendedDestination(null);
              setViewMode('website');
            }}
            className="px-3.5 py-1.5 bg-slate-900/95 hover:bg-slate-950 text-white text-xs font-bold rounded-lg shadow-lg flex items-center gap-1.5 border border-slate-700 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
            Return to Public Website
          </button>
        </div>
        <AuthScreen
          db={db}
          onLoginSuccess={handleLoginSuccess}
          onUpdateDb={handleUpdateDb}
          initialNotice={authNotice}
          requiredRoleForDestination={intendedDestination === 'website_management' ? 'admin' : null}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex text-[#1E293B]">
      {/* 26-module responsive Sidebar */}
      <Sidebar
        currentNav={currentNav}
        onSelectNav={handleSelectNav}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        schoolSettings={db.schoolSettings}
        currentUser={db.currentUser}
        onOpenZipModal={() => setIsZipModalOpen(true)}
        onLogout={handleLogout}
        totalStudentsCount={db.students.length}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Navbar */}
        <Navbar
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          currentNav={currentNav}
          schoolSettings={db.schoolSettings}
          currentUser={db.currentUser}
          onSwitchUser={handleSwitchUser}
          allUsers={db.users}
          academicYears={db.academicYears}
          currentAcademicYear={db.schoolSettings.currentAcademicYear}
          onSelectAcademicYear={handleSelectAcademicYear}
          onOpenZipModal={() => setIsZipModalOpen(true)}
          onOpenProfileModal={() => setIsProfileModalOpen(true)}
          onSelectNav={handleSelectNav}
          onLogout={handleLogout}
          onViewLiveSite={() => setViewMode('website')}
        />

        {/* Dynamic Route Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentNav === 'dashboard' && (
            <DashboardView
              db={db}
              onNavigate={handleSelectNav}
              onOpenZipModal={() => setIsZipModalOpen(true)}
            />
          )}

          {currentNav === 'website_management' && (
            ['Super Admin', 'School Administrator'].includes(db.currentUser?.role || '') ? (
              <WebsiteManagementView
                db={db}
                onUpdateDb={handleUpdateDb}
                onViewLiveSite={() => setViewMode('website')}
              />
            ) : (
              <div className="bg-white rounded-2xl p-8 border border-red-200 text-center max-w-xl mx-auto my-12 space-y-4 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Access Denied: Administrator Required</h3>
                <p className="text-xs text-gray-600">
                  Your current login role ({db.currentUser?.role || 'Guest'}) does not have permission to manage the public website. Only Super Administrators and School Administrators are authorized to edit website content.
                </p>
                <button
                  onClick={() => setCurrentNav('dashboard')}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs cursor-pointer"
                >
                  Return to Portal Dashboard
                </button>
              </div>
            )
          )}

          {currentNav === 'students' && (
            <StudentsView
              db={db}
              onUpdateDb={handleUpdateDb}
              initialMode="list"
            />
          )}

          {currentNav === 'admissions' && (
            <StudentsView
              db={db}
              onUpdateDb={handleUpdateDb}
              initialMode="admission"
            />
          )}

          {currentNav === 'classes' && (
            <ClassesSectionsView
              db={db}
              onUpdateDb={handleUpdateDb}
            />
          )}

          {currentNav === 'group_settings' && (
            <GroupSettingsView
              db={db}
              onUpdateDb={handleUpdateDb}
            />
          )}

          {currentNav === 'subjects' && (
            <SubjectsView
              db={db}
              onUpdateDb={handleUpdateDb}
              onNavigateToMarkDistribution={() => setCurrentNav('mark_distribution')}
            />
          )}

          {currentNav === 'teachers' && (
            <FacultyView
              db={db}
              onUpdateDb={handleUpdateDb}
              mode="teachers"
            />
          )}

          {currentNav === 'staff' && (
            <FacultyView
              db={db}
              onUpdateDb={handleUpdateDb}
              mode="staff"
            />
          )}

          {currentNav === 'attendance' && (
            <AttendanceView
              db={db}
              onUpdateDb={handleUpdateDb}
            />
          )}

          {(currentNav === 'fee_structure' || currentNav === 'fee_collection' || currentNav === 'payments') && (
            <FeesManagementView
              db={db}
              onUpdateDb={handleUpdateDb}
            />
          )}

          {currentNav === 'income_expenses' && (
            <IncomeExpenseView
              db={db}
              onUpdateDb={handleUpdateDb}
            />
          )}

          {currentNav === 'examinations' && (
            <ExaminationsView
              db={db}
              onUpdateDb={handleUpdateDb}
              onNavigateToMarksEntry={(examId?: string) => {
                if (examId) setSelectedMarksExamId(examId);
                setCurrentNav('marks_entry');
              }}
            />
          )}

          {currentNav === 'mark_distribution' && (
            <MarkDistributionView
              db={db}
              onUpdateDb={handleUpdateDb}
            />
          )}

          {currentNav === 'mark_conversion' && (
            <MarkConversionView
              db={db}
              onUpdateDb={handleUpdateDb}
            />
          )}

          {currentNav === 'marks_entry' && (
            <MarksEntryView
              db={db}
              onUpdateDb={handleUpdateDb}
              initialExamId={selectedMarksExamId}
              onNavigateToResults={() => setCurrentNav('results')}
              onNavigateToExaminations={() => setCurrentNav('examinations')}
            />
          )}

          {currentNav === 'results' && (
            <ResultsView
              db={db}
              onUpdateDb={handleUpdateDb}
            />
          )}

          {currentNav === 'promotion' && (
            <PromotionView
              db={db}
              onUpdateDb={handleUpdateDb}
            />
          )}

          {currentNav === 'grading_settings' && (
            <GradingSettingsView
              db={db}
              onUpdateDb={handleUpdateDb}
            />
          )}

          {currentNav === 'class_routine' && (
            <ClassRoutineView
              db={db}
              onUpdateDb={handleUpdateDb}
            />
          )}

          {currentNav === 'notices' && (
            <NoticesView
              db={db}
              onUpdateDb={handleUpdateDb}
            />
          )}

          {currentNav === 'reports' && (
            <ReportsView
              db={db}
            />
          )}

          {currentNav === 'users' && (
            <UserManagementView
              db={db}
              onUpdateDb={handleUpdateDb}
            />
          )}

          {currentNav === 'access_requests' && (
            <AccessRequestsView
              db={db}
              onUpdateDb={handleUpdateDb}
            />
          )}

          {currentNav === 'audit_logs' && (
            <AuditLogsView
              db={db}
              onUpdateDb={handleUpdateDb}
            />
          )}

          {currentNav === 'backup_restore' && (
            <BackupRestoreView
              db={db}
              onUpdateDb={handleUpdateDb}
            />
          )}

          {currentNav === 'school_settings' && (
            <SchoolSettingsView
              db={db}
              onUpdateDb={handleUpdateDb}
            />
          )}
        </main>

        <footer className="py-4 border-t border-gray-200 bg-white text-center text-xs text-gray-500 no-print">
          <p className="font-bold text-gray-800">Web Software Create by Md. Mirabul Hossen</p>
          <p className="text-[11px] text-gray-400 mt-0.5">E-Biddalay Cloud School Management • Enterprise Edition</p>
        </footer>
      </div>

      {/* Standalone Project Source Code ZIP Download Modal */}
      <ZipDownloaderModal
        isOpen={isZipModalOpen}
        onClose={() => setIsZipModalOpen(false)}
      />

      {/* Super Admin Profile & Security Modal */}
      <SuperAdminProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        db={db}
        onUpdateDb={handleUpdateDb}
      />
    </div>
  );
}
