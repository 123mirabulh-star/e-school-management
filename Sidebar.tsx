import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Layers,
  BookOpen,
  GraduationCap,
  Briefcase,
  CalendarCheck,
  CreditCard,
  Receipt,
  TrendingDown,
  FileCheck2,
  Sliders,
  Calculator,
  PenTool,
  Award,
  Settings2,
  Calendar,
  Bell,
  FileSpreadsheet,
  ShieldCheck,
  History,
  Database,
  Building,
  Download,
  Search,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  LogOut,
  Key,
  Boxes,
  X,
  Globe
} from 'lucide-react';
import { SchoolSettings, User } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { getNavTitle } from '../services/i18n';

export type NavItemKey =
  | 'dashboard'
  | 'website_management'
  | 'students'
  | 'admissions'
  | 'classes'
  | 'subjects'
  | 'group_settings'
  | 'teachers'
  | 'staff'
  | 'attendance'
  | 'fee_structure'
  | 'fee_collection'
  | 'payments'
  | 'income_expenses'
  | 'examinations'
  | 'mark_distribution'
  | 'mark_conversion'
  | 'marks_entry'
  | 'results'
  | 'promotion'
  | 'grading_settings'
  | 'class_routine'
  | 'notices'
  | 'reports'
  | 'users'
  | 'access_requests'
  | 'audit_logs'
  | 'backup_restore'
  | 'school_settings'
  | 'code_zip';

interface SidebarProps {
  currentNav: NavItemKey;
  onSelectNav: (key: NavItemKey) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  schoolSettings: SchoolSettings;
  currentUser: User | null;
  onOpenZipModal: () => void;
  onLogout: () => void;
  totalStudentsCount: number;
}

interface NavGroup {
  groupKey: string;
  label: string;
  items: {
    key: NavItemKey;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    adminOnly?: boolean;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentNav,
  onSelectNav,
  isOpenMobile,
  onCloseMobile,
  schoolSettings,
  currentUser,
  onOpenZipModal,
  onLogout,
  totalStudentsCount
}) => {
  const { language, t, formatNumber } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (groupLabel: string) => {
    setCollapsedGroups(prev => ({ ...prev, [groupLabel]: !prev[groupLabel] }));
  };

  const navGroups: NavGroup[] = [
    {
      groupKey: 'admin.group.core',
      label: 'Core',
      items: [
        { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }
      ]
    },
    {
      groupKey: 'admin.group.website',
      label: 'Public Website & CMS',
      items: [
        { key: 'website_management', label: 'Website Management', icon: Globe, badge: language === 'bn' ? 'লাইভ সিএমএস' : 'Live CMS', adminOnly: true }
      ]
    },
    {
      groupKey: 'admin.group.academics',
      label: 'Academics & Configuration',
      items: [
        { key: 'classes', label: 'Classes & Sections', icon: Layers },
        { key: 'group_settings', label: 'Group Settings', icon: Boxes, badge: 'Dynamic' },
        { key: 'subjects', label: 'Dynamic Subjects', icon: BookOpen, badge: 'Editable' },
        { key: 'mark_distribution', label: 'Mark Distribution', icon: Sliders, badge: 'CQ/MCQ' },
        { key: 'mark_conversion', label: 'Mark Conversion', icon: Calculator, badge: 'Formulas' },
        { key: 'grading_settings', label: 'Grading Settings', icon: Settings2, badge: 'GPA 5.0' },
        { key: 'class_routine', label: 'Class Routine', icon: Calendar }
      ]
    },
    {
      groupKey: 'admin.group.students',
      label: 'Students & Faculty',
      items: [
        { key: 'students', label: 'Students Directory', icon: Users },
        { key: 'admissions', label: 'New Admission', icon: UserPlus },
        { key: 'teachers', label: 'Teachers', icon: GraduationCap },
        { key: 'staff', label: 'Office Staff', icon: Briefcase },
        { key: 'attendance', label: 'Attendance', icon: CalendarCheck }
      ]
    },
    {
      groupKey: 'admin.group.exams',
      label: 'Exams & Results',
      items: [
        { key: 'examinations', label: 'Examinations', icon: FileCheck2 },
        { key: 'marks_entry', label: 'Marks Entry', icon: PenTool, badge: 'Bulk' },
        { key: 'results', label: 'Results & Mark Sheets', icon: Award, badge: 'Print/PDF' },
        { key: 'promotion', label: 'Student Promotion & Merit', icon: TrendingUp, badge: 'Annual' }
      ]
    },
    {
      groupKey: 'admin.group.finance',
      label: 'Finance & Accounts',
      items: [
        { key: 'fee_structure', label: 'Fee Structure', icon: CreditCard },
        { key: 'fee_collection', label: 'Fee Collection', icon: Receipt },
        { key: 'income_expenses', label: 'Income & Expense', icon: TrendingDown }
      ]
    },
    {
      groupKey: 'admin.group.admin',
      label: 'Administration & System',
      items: [
        { key: 'access_requests', label: 'License & Access Requests', icon: Key, badge: 'Admin', adminOnly: true },
        { key: 'notices', label: 'Notice Board', icon: Bell },
        { key: 'reports', label: 'Reports & Exports', icon: FileSpreadsheet },
        { key: 'users', label: 'User Roles & Access', icon: ShieldCheck },
        { key: 'audit_logs', label: 'Audit Logs', icon: History },
        { key: 'backup_restore', label: 'Backup & Restore', icon: Database },
        { key: 'school_settings', label: 'School Settings', icon: Building }
      ]
    }
  ];

  return (
    <>
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-72 bg-[#101B35] text-white flex flex-col z-50 transition-transform duration-200 ease-in-out shrink-0 select-none ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#0b1326]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-lg shrink-0 shadow-md overflow-hidden bg-white/10">
              {schoolSettings.logoUrl ? (
                <img
                  src={schoolSettings.logoUrl}
                  alt="School Logo"
                  className="w-full h-full object-contain p-0.5 bg-white rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <span>{schoolSettings.nameEn.charAt(0) || 'S'}</span>
              )}
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-white truncate leading-tight">
                {language === 'bn' && schoolSettings.nameBn ? schoolSettings.nameBn : schoolSettings.nameEn}
              </h1>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded font-mono font-medium">
                  {t('nav.eiin')}: {formatNumber(schoolSettings.eiin, language)}
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-medium">
                  {language === 'bn' ? 'অনুমোদিত' : 'Verified'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="lg:hidden text-gray-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Student Quota / Limit Indicator */}
        {currentUser?.studentLimit && (
          <div className="px-4 py-2 bg-white/5 border-b border-white/5 text-[11px] flex items-center justify-between text-gray-300">
            <span>{language === 'bn' ? 'শিক্ষার্থী কোটা:' : 'Student Quota:'}</span>
            <span className={`font-mono font-bold ${totalStudentsCount >= currentUser.studentLimit ? 'text-red-400' : 'text-emerald-400'}`}>
              {formatNumber(totalStudentsCount, language)} / {formatNumber(currentUser.studentLimit, language)}
            </span>
          </div>
        )}

        {/* Search Bar */}
        <div className="p-3 border-b border-white/5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('admin.sidebar.search_placeholder')}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-md text-white placeholder-gray-400 focus:outline-hidden focus:border-blue-500 font-medium"
            />
          </div>
        </div>

        {/* Nav Items List */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
          {navGroups.map(group => {
            const groupTitle = t(group.groupKey);
            const filteredItems = group.items.filter(item => {
              if (item.adminOnly && currentUser?.role !== 'Super Admin' && currentUser?.role !== 'School Administrator') return false;
              const localizedLabel = getNavTitle(item.key, language);
              return (
                item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                localizedLabel.toLowerCase().includes(searchTerm.toLowerCase())
              );
            });

            if (filteredItems.length === 0) return null;
            const isCollapsed = collapsedGroups[group.label];

            return (
              <div key={group.label} className="space-y-1">
                <button
                  type="button"
                  onClick={() => toggleGroup(group.label)}
                  className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-semibold tracking-wider uppercase text-gray-400 hover:text-gray-200"
                >
                  <span>{groupTitle}</span>
                  {isCollapsed ? (
                    <ChevronRight className="w-3 h-3 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-3 h-3 text-gray-500" />
                  )}
                </button>

                {!isCollapsed && (
                  <div className="space-y-0.5">
                    {filteredItems.map(item => {
                      const Icon = item.icon;
                      const isActive = currentNav === item.key;
                      const itemTitle = getNavTitle(item.key, language);
                      return (
                        <button
                          key={item.key}
                          onClick={() => {
                            onSelectNav(item.key);
                            onCloseMobile();
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-2 text-xs rounded-md transition-colors ${
                            isActive
                              ? 'bg-blue-600 text-white font-semibold shadow-xs'
                              : 'text-gray-300 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <Icon
                              className={`w-4 h-4 shrink-0 ${
                                isActive ? 'text-white' : 'text-gray-400'
                              }`}
                            />
                            <span className="truncate">{itemTitle}</span>
                          </div>
                          {item.badge && (
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                isActive
                                  ? 'bg-white/20 text-white'
                                  : 'bg-white/10 text-blue-300'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* User Footer with Log Out */}
        <div className="p-3 border-t border-white/10 bg-[#0b1326] flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center font-bold text-white text-xs shrink-0">
              {currentUser?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {currentUser?.fullName || 'Guest User'}
              </p>
              <p className="text-[10px] text-blue-400 truncate">
                {currentUser?.role || 'Guest'}
              </p>
            </div>
          </div>
          <button
            title={t('admin.sidebar.logout')}
            onClick={onLogout}
            className="p-1.5 text-red-400 hover:text-red-300 rounded hover:bg-red-500/10 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Creator Credit */}
        <div className="px-3 py-2 bg-[#070d1a] border-t border-white/5 text-center">
          <p className="text-[10.5px] font-bold text-blue-300 tracking-wide">
            Web Software Create by Md. Mirabul Hossen
          </p>
        </div>
      </aside>
    </>
  );
};
