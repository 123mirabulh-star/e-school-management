import React, { useState } from 'react';
import {
  Menu,
  Download,
  PlusCircle,
  Clock,
  Shield,
  ChevronDown,
  UserCheck,
  Award,
  BookOpen,
  DollarSign,
  LogOut,
  Key,
  Globe
} from 'lucide-react';
import { SchoolSettings, User, AcademicYear } from '../types';
import { NavItemKey } from './Sidebar';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSwitcher } from './common/LanguageSwitcher';
import { getNavTitle } from '../services/i18n';

interface NavbarProps {
  onToggleMobileSidebar: () => void;
  currentNav: NavItemKey;
  schoolSettings: SchoolSettings;
  currentUser: User | null;
  onSwitchUser: (user: User) => void;
  allUsers: User[];
  academicYears: AcademicYear[];
  currentAcademicYear: string;
  onSelectAcademicYear: (year: string) => void;
  onOpenZipModal: () => void;
  onOpenProfileModal?: () => void;
  onSelectNav: (key: NavItemKey) => void;
  onLogout: () => void;
  onViewLiveSite?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleMobileSidebar,
  currentNav,
  schoolSettings,
  currentUser,
  onSwitchUser,
  allUsers,
  academicYears,
  currentAcademicYear,
  onSelectAcademicYear,
  onOpenZipModal,
  onOpenProfileModal,
  onSelectNav,
  onLogout,
  onViewLiveSite
}) => {
  const { language, t, formatNumber } = useLanguage();
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navTitle = getNavTitle(currentNav, language);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between shadow-2xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg cursor-pointer"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-sm font-bold text-gray-900 leading-tight">
            {navTitle}
          </h2>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] text-gray-500 font-medium">
              {language === 'bn' && schoolSettings.nameBn ? schoolSettings.nameBn : schoolSettings.nameEn}
            </span>
            <span className="text-gray-300">•</span>
            <span className="text-[11px] font-mono text-gray-500">
              {t('nav.eiin')}: {formatNumber(schoolSettings.eiin, language)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Language Switcher */}
        <LanguageSwitcher compact={true} />

        {/* Academic Session */}
        <div className="hidden md:flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200">
          <Clock className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-xs text-gray-600 font-medium">{language === 'bn' ? 'সেশন:' : 'Session:'}</span>
          <select
            value={currentAcademicYear}
            onChange={e => onSelectAcademicYear(e.target.value)}
            className="text-xs font-bold text-blue-800 bg-transparent border-none focus:outline-hidden cursor-pointer"
          >
            {academicYears.map(yr => (
              <option key={yr.id} value={yr.year}>
                {formatNumber(yr.year, language)}
              </option>
            ))}
          </select>
        </div>

        {/* View Live Public Website */}
        {onViewLiveSite && (
          <button
            onClick={onViewLiveSite}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-2.5 py-1.5 rounded-lg border border-amber-400 transition-colors cursor-pointer shadow-xs"
            title={t('admin.switch_to_website')}
          >
            <Globe className="w-3.5 h-3.5 text-slate-950" />
            <span className="hidden sm:inline">{language === 'bn' ? 'লাইভ ওয়েবসাইট' : 'Live Website'}</span>
          </button>
        )}

        {/* Quick Actions Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowQuickMenu(!showQuickMenu)}
            className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-gray-300 transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">{t('admin.quick_action')}</span>
            <ChevronDown className="w-3 h-3 text-gray-500" />
          </button>

          {showQuickMenu && (
            <div
              className="absolute right-0 mt-1 w-52 bg-white rounded-lg shadow-xl border border-gray-200 py-1.5 z-50 text-xs text-gray-700 animate-in fade-in zoom-in-95 duration-100"
              onMouseLeave={() => setShowQuickMenu(false)}
            >
              <div className="px-3 py-1 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                {t('admin.fast_nav')}
              </div>
              <button
                onClick={() => {
                  onSelectNav('marks_entry');
                  setShowQuickMenu(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-blue-50 flex items-center gap-2"
              >
                <Award className="w-4 h-4 text-purple-600" />
                {language === 'bn' ? 'নম্বর এন্ট্রি করুন' : 'Enter Subject Marks'}
              </button>
              <button
                onClick={() => {
                  onSelectNav('results');
                  setShowQuickMenu(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-blue-50 flex items-center gap-2"
              >
                <Award className="w-4 h-4 text-blue-600" />
                {language === 'bn' ? 'ফলাফল ও মার্কশিট' : 'Generate Examination Results'}
              </button>
              <button
                onClick={() => {
                  onSelectNav('fee_collection');
                  setShowQuickMenu(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-blue-50 flex items-center gap-2"
              >
                <DollarSign className="w-4 h-4 text-emerald-600" />
                {language === 'bn' ? 'শিক্ষার্থী ফি আদায়' : 'Collect Student Fees'}
              </button>
              <button
                onClick={() => {
                  onSelectNav('subjects');
                  setShowQuickMenu(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-blue-50 flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4 text-amber-600" />
                {language === 'bn' ? 'বিষয় ও নম্বর বিন্যাস' : 'Configure Subject Marks'}
              </button>
              <button
                onClick={() => {
                  onSelectNav('admissions');
                  setShowQuickMenu(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-blue-50 flex items-center gap-2"
              >
                <UserCheck className="w-4 h-4 text-indigo-600" />
                {language === 'bn' ? 'নতুন শিক্ষার্থী ভর্তি' : 'New Student Admission'}
              </button>
            </div>
          )}
        </div>

        {/* User Account / Role Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 p-1.5 rounded-lg border border-gray-200 transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-xs overflow-hidden shrink-0">
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.fullName}
                  className="w-full h-full object-cover"
                  onError={e => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <span>{currentUser?.fullName?.charAt(0) || 'U'}</span>
              )}
            </div>
            <div className="hidden xl:block text-left">
              <p className="text-xs font-bold text-gray-800 leading-tight">
                {currentUser?.fullName || 'User'}
              </p>
              <span className="text-[10px] font-semibold text-blue-600">
                {currentUser?.role}
              </span>
            </div>
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </button>

          {showUserMenu && (
            <div
              className="absolute right-0 mt-1 w-60 bg-white rounded-xl shadow-xl border border-gray-200 py-1.5 z-50 text-xs text-gray-700"
              onMouseLeave={() => setShowUserMenu(false)}
            >
              <div className="px-3.5 py-2.5 border-b border-gray-100 flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-700 text-white flex items-center justify-center font-bold text-sm overflow-hidden shrink-0">
                  {currentUser?.avatar ? (
                    <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span>{currentUser?.fullName?.charAt(0) || 'U'}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 truncate">{currentUser?.fullName}</p>
                  <p className="text-[11px] text-gray-500 font-mono truncate">{currentUser?.email}</p>
                  <span className="inline-block mt-0.5 text-[9px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.2 rounded">
                    {currentUser?.role}
                  </span>
                </div>
              </div>

              {onOpenProfileModal && (
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onOpenProfileModal();
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-blue-50 text-blue-700 font-bold flex items-center gap-2 border-b cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>{t('admin.profile_security')}</span>
                </button>
              )}

              {currentUser?.role === 'Super Admin' && (
                <button
                  onClick={() => {
                    onSelectNav('access_requests');
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-blue-50 text-blue-700 font-semibold flex items-center gap-2 border-b cursor-pointer"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>{t('admin.manage_access')}</span>
                </button>
              )}

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  onLogout();
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-red-50 text-red-600 font-bold flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t('admin.sidebar.logout')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
