import React from 'react';
import {
  Users,
  GraduationCap,
  Briefcase,
  DollarSign,
  TrendingDown,
  CalendarCheck,
  UserPlus,
  AlertCircle,
  Award,
  BookOpen,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Calendar,
  Bell,
  Clock,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { AppDatabase } from '../services/storage';
import { NavItemKey } from './Sidebar';

import { useLanguage } from '../context/LanguageContext';

interface DashboardViewProps {
  db: AppDatabase;
  onNavigate: (key: NavItemKey) => void;
  onOpenZipModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  db,
  onNavigate,
  onOpenZipModal
}) => {
  const { language, t, formatNumber } = useLanguage();
  const totalStudents = db.students.filter(s => s.status === 'active').length;
  const totalTeachers = db.teachers.filter(t => t.status === 'active').length;
  const totalStaff = db.staff.filter(s => s.status === 'active').length;

  const totalFeesCollected = db.feePayments.reduce((acc, p) => acc + p.amountPaid, 0);
  const totalOutstandingFees = db.students.reduce((acc, s) => acc + (s.duesAmount || 0), 0);
  const totalExpenses = db.transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);
  const totalIncome = db.transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const netBalance = (totalIncome + totalFeesCollected) - totalExpenses;

  const defaulters = db.students.filter(s => (s.duesAmount || 0) > 0);
  const activeNotices = db.notices.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#101B35] via-[#1a2b54] to-blue-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded font-mono font-medium">
                {language === 'bn' ? 'শিক্ষা বর্ষ:' : 'Academic Session:'} {formatNumber(db.schoolSettings.currentAcademicYear, language)}
              </span>
              <span className="text-xs bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded font-medium">
                {language === 'bn' ? 'জাতীয় শিক্ষাক্রম ও বোর্ড অনুমোদিত' : 'Standard Board Curriculum'}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              {language === 'bn' && db.schoolSettings.nameBn ? db.schoolSettings.nameBn : db.schoolSettings.nameEn}
            </h1>
            <p className="text-sm text-blue-200 mt-0.5">
              {language === 'bn' ? 'ক্যাম্পাস:' : 'Campus:'} {db.schoolSettings.address} • {t('nav.eiin')}: {formatNumber(db.schoolSettings.eiin, language)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigate('marks_entry')}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Award className="w-4 h-4" />
              {language === 'bn' ? 'নম্বর এন্ট্রি' : 'Enter Marks'}
            </button>
            <button
              onClick={() => onNavigate('results')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Award className="w-4 h-4" />
              {language === 'bn' ? 'ফলাফল তৈরি' : 'Generate Results'}
            </button>
          </div>
        </div>
      </div>

      {/* 8 Metric Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {language === 'bn' ? 'অধ্যয়নরত শিক্ষার্থী' : 'Active Students'}
            </span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-gray-900 mt-2">
            {formatNumber(totalStudents, language)}
          </p>
          <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
            <span>{language === 'bn' ? `${formatNumber(db.classes.length, language)} টি শ্রেণিতে অন্তর্ভুক্ত` : `Enrolled in ${db.classes.length} classes`}</span>
            <button
              onClick={() => onNavigate('students')}
              className="text-blue-600 hover:underline font-medium text-[11px] cursor-pointer"
            >
              {language === 'bn' ? 'তালিকা দেখুন →' : 'View list →'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {language === 'bn' ? 'আদায়কৃত ফি' : 'Fees Collected'}
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-600 mt-2">
            {language === 'bn' ? `৳ ${formatNumber(totalFeesCollected.toLocaleString(), language)}` : `BDT ${totalFeesCollected.toLocaleString()}`}
          </p>
          <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
            <span>{language === 'bn' ? `${formatNumber(db.feePayments.length, language)} টি লেনদেন` : `${db.feePayments.length} transactions`}</span>
            <button
              onClick={() => onNavigate('fee_collection')}
              className="text-emerald-700 hover:underline font-medium text-[11px] cursor-pointer"
            >
              {language === 'bn' ? 'ফি আদায় →' : 'Collect fee →'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {language === 'bn' ? 'বকেয়া ফি' : 'Outstanding Dues'}
            </span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-amber-600 mt-2">
            {language === 'bn' ? `৳ ${formatNumber(totalOutstandingFees.toLocaleString(), language)}` : `BDT ${totalOutstandingFees.toLocaleString()}`}
          </p>
          <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
            <span>{language === 'bn' ? `${formatNumber(defaulters.length, language)} জন বকেয়াদার শিক্ষার্থী` : `${defaulters.length} student defaulters`}</span>
            <span className="text-amber-700 font-semibold text-[11px]">{language === 'bn' ? 'অনাদায়ী' : 'Pending'}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {language === 'bn' ? 'মোট ব্যয়' : 'Total Expenses'}
            </span>
            <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-red-600 mt-2">
            {language === 'bn' ? `৳ ${formatNumber(totalExpenses.toLocaleString(), language)}` : `BDT ${totalExpenses.toLocaleString()}`}
          </p>
          <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
            <span>{language === 'bn' ? 'বেতন, বিদ্যুৎ, ল্যাব ইত্যাদি' : 'Salaries, utilities, labs'}</span>
            <button
              onClick={() => onNavigate('income_expenses')}
              className="text-red-700 hover:underline font-medium text-[11px] cursor-pointer"
            >
              {language === 'bn' ? 'বিস্তারিত →' : 'Details →'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {language === 'bn' ? 'শিক্ষকমণ্ডলী' : 'Faculty / Teachers'}
            </span>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-gray-900 mt-2">
            {formatNumber(totalTeachers, language)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {language === 'bn' ? 'বিজ্ঞান, বাণিজ্য ও মানবিক শাখা' : 'Science, Commerce & Humanities'}
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {language === 'bn' ? 'কর্মচারীবৃন্দ' : 'Office Staff'}
            </span>
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-gray-900 mt-2">
            {formatNumber(totalStaff, language)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {language === 'bn' ? 'হিসাব, প্রশাসন ও ল্যাব সহকারী' : 'Accounts, Admin & Lab assistants'}
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {language === 'bn' ? 'আজকের উপস্থিতি' : "Today's Attendance"}
            </span>
            <div className="w-9 h-9 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-cyan-700 mt-2">
            {formatNumber('96.4%', language)}
          </p>
          <p className="text-xs text-emerald-600 font-medium mt-1">
            {language === 'bn' ? 'সন্তোষজনক নিয়মিত উপস্থিতি' : 'High regular attendance rate'}
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {language === 'bn' ? 'নীট স্থিতি' : 'Net Balance'}
            </span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-blue-700 mt-2">
            BDT {netBalance.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Verified institutional treasury
          </p>
        </div>
      </div>

      {/* Quick Action Hub */}
      <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-2xs">
        <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
          <span>⚡ Quick Action Hub</span>
          <span className="text-xs font-normal text-gray-500">
            One-click access to critical workflows
          </span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
          <button
            onClick={() => onNavigate('admissions')}
            className="p-3 bg-gray-50 hover:bg-blue-50 hover:border-blue-300 border border-gray-200 rounded-lg text-left transition-all cursor-pointer group"
          >
            <UserPlus className="w-4 h-4 text-blue-600 mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-gray-800">Add Student</div>
            <div className="text-[10px] text-gray-500">New admission</div>
          </button>

          <button
            onClick={() => onNavigate('subjects')}
            className="p-3 bg-gray-50 hover:bg-blue-50 hover:border-blue-300 border border-gray-200 rounded-lg text-left transition-all cursor-pointer group"
          >
            <BookOpen className="w-4 h-4 text-purple-600 mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-gray-800">Add Subject</div>
            <div className="text-[10px] text-gray-500">Configure full marks</div>
          </button>

          <button
            onClick={() => onNavigate('mark_distribution')}
            className="p-3 bg-gray-50 hover:bg-blue-50 hover:border-blue-300 border border-gray-200 rounded-lg text-left transition-all cursor-pointer group"
          >
            <BookOpen className="w-4 h-4 text-emerald-600 mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-gray-800">Mark Distribution</div>
            <div className="text-[10px] text-gray-500">CQ/MCQ breakdown</div>
          </button>

          <button
            onClick={() => onNavigate('marks_entry')}
            className="p-3 bg-gray-50 hover:bg-blue-50 hover:border-blue-300 border border-gray-200 rounded-lg text-left transition-all cursor-pointer group"
          >
            <Award className="w-4 h-4 text-amber-600 mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-gray-800">Enter Marks</div>
            <div className="text-[10px] text-gray-500">Roll-wise bulk entry</div>
          </button>

          <button
            onClick={() => onNavigate('results')}
            className="p-3 bg-gray-50 hover:bg-blue-50 hover:border-blue-300 border border-gray-200 rounded-lg text-left transition-all cursor-pointer group"
          >
            <Award className="w-4 h-4 text-blue-600 mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-gray-800">Generate Results</div>
            <div className="text-[10px] text-gray-500">GPA 5.0 transcript</div>
          </button>

          <button
            onClick={() => onNavigate('fee_collection')}
            className="p-3 bg-gray-50 hover:bg-blue-50 hover:border-blue-300 border border-gray-200 rounded-lg text-left transition-all cursor-pointer group"
          >
            <DollarSign className="w-4 h-4 text-green-600 mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-gray-800">Collect Fees</div>
            <div className="text-[10px] text-gray-500">Print BDT receipt</div>
          </button>
        </div>
      </div>

      {/* Main Charts & Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Published Examination Results Summary
                </h3>
                <p className="text-xs text-gray-500">
                  Top performing students and GPA summary
                </p>
              </div>
              <button
                onClick={() => onNavigate('results')}
                className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                Full Tabulation Sheet <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-100 text-gray-600 uppercase font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Roll</th>
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3 text-center">Total Marks</th>
                    <th className="py-2.5 px-3 text-center">GPA (5.00)</th>
                    <th className="py-2.5 px-3 text-center">Grade</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {db.results.slice(0, 4).map(res => (
                    <tr key={res.id} className="hover:bg-blue-50/50">
                      <td className="py-2.5 px-3 font-bold font-mono">
                        #{res.studentRoll}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-gray-900">
                        {res.studentNameEn}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-gray-800">
                        {res.totalObtainedMarks} / {res.totalFullMarks}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                          {res.gpa.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-emerald-600">
                        {res.letterGrade}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          PASSED
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => onNavigate('results')}
                          className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                        >
                          Mark Sheet
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-gray-900">
                  Fee Defaulters & Arrears
                </h3>
              </div>
              <button
                onClick={() => onNavigate('fee_collection')}
                className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
              >
                Go to Fee Collection →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-100 text-gray-600 uppercase font-semibold">
                  <tr>
                    <th className="py-2 px-3">Student ID</th>
                    <th className="py-2 px-3">Name</th>
                    <th className="py-2 px-3">Guardian Contact</th>
                    <th className="py-2 px-3 text-right">Dues Amount</th>
                    <th className="py-2 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {defaulters.map(st => (
                    <tr key={st.id} className="hover:bg-amber-50/50">
                      <td className="py-2 px-3 font-mono font-bold text-gray-700">
                        {st.studentId}
                      </td>
                      <td className="py-2 px-3 font-medium text-gray-900">
                        {st.nameEn} (Roll {st.rollNo})
                      </td>
                      <td className="py-2 px-3 text-gray-600 font-mono">
                        {st.guardianPhone}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-red-600">
                        BDT {st.duesAmount?.toLocaleString()}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button
                          onClick={() => onNavigate('fee_collection')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-2.5 py-1 rounded text-[11px] cursor-pointer"
                        >
                          Collect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xs p-4">
            <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-600" />
                Latest Announcements
              </h3>
              <button
                onClick={() => onNavigate('notices')}
                className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
              >
                All notices
              </button>
            </div>

            <div className="space-y-3">
              {activeNotices.map(notice => (
                <div
                  key={notice.id}
                  className="p-3 bg-gray-50 hover:bg-blue-50/60 rounded-lg border border-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span
                      className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                        notice.priority === 'urgent'
                          ? 'bg-red-100 text-red-700'
                          : notice.priority === 'important'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {notice.priority}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {notice.publishDate}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-gray-900 leading-tight">
                    {notice.title}
                  </h4>
                  <p className="text-[11px] text-gray-600 mt-1 line-clamp-2">
                    {notice.contentEn}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-[#101B35] text-white rounded-xl p-4 shadow-md">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-300 mb-2">
              License & Deployment Specifications
            </h3>
            <ul className="text-xs space-y-1.5 text-gray-300">
              <li className="flex items-center justify-between">
                <span>Database:</span>
                <span className="font-mono text-emerald-400 font-bold">SQLite / PostgreSQL</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Backend Framework:</span>
                <span className="font-mono text-blue-300">Python 3 + Flask</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Grading Standard:</span>
                <span className="font-bold text-yellow-300">Board GPA 5.0 Standard</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Student Quota:</span>
                <span className="text-white font-mono">{db.currentUser?.studentLimit || 500} Max Students</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Timezone:</span>
                <span className="font-mono text-gray-400">Asia/Dhaka</span>
              </li>
            </ul>

            <button
              onClick={onOpenZipModal}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download Complete Code Package (.zip)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
