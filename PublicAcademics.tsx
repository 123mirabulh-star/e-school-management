import React from 'react';
import {
  Clock,
  Award,
  Layers
} from 'lucide-react';
import { WebsiteData } from '../../types/website';
import { AppDatabase } from '../../services/storage';
import { useLanguage } from '../../context/LanguageContext';
import { t, formatNumber, getLocalizedField } from '../../services/i18n';

interface PublicAcademicsProps {
  website: WebsiteData;
  db: AppDatabase;
  onNavigate: (page: string) => void;
}

export const PublicAcademics: React.FC<PublicAcademicsProps> = ({ website, db, onNavigate }) => {
  const { language } = useLanguage();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          {t('academics.badge', language)}
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {t('academics.heading', language)}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          {t('academics.subheading', language)}
        </p>
      </div>

      {/* Classes & Academic Streams */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
              {t('academics.streams_title', language)}
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-500">
            {language === 'bn' ? 'প্রাথমিক থেকে উচ্চ মাধ্যমিক' : 'Primary to Higher Secondary'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm font-mono">
              {language === 'bn' ? '১-৫' : '1-5'}
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm">
              {language === 'bn' ? 'প্রাথমিক শাখা' : 'Primary Section'}
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              {language === 'bn'
                ? 'মৌলিক সাক্ষরতা, গণিত, সাধারণ বিজ্ঞান, নৈতিক শিক্ষা ও প্রাণবন্ত ইংরেজি কথোপকথন সমৃদ্ধ শিক্ষাপদ্ধতি।'
                : 'Foundational literacy, mathematics, general science, ethics, and interactive English phonetics designed for curious young learners.'}
            </p>
            <div className="text-[11px] font-semibold text-blue-700">
              {language === 'bn' ? 'শ্রেণি ১, ২, ৩, ৪, ৫ • সাধারণ পাঠ্যক্রম' : 'Classes 1, 2, 3, 4, 5 • General Curriculum'}
            </div>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm font-mono">
              {language === 'bn' ? '৬-৮' : '6-8'}
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm">
              {language === 'bn' ? 'জুনিয়র মাধ্যমিক শাখা' : 'Junior Secondary Section'}
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              {language === 'bn'
                ? 'আইসিটি, কম্পিউটার প্রযুক্তি, বিজ্ঞান অনুসন্ধান, সমাজ বিজ্ঞান এবং নৈতিক জীবনভিত্তিক সমন্বিত পাঠ্যক্রম।'
                : 'Integrated curriculum bridging core STEM foundations, computer technology, social sciences, life orientation, and physical education.'}
            </p>
            <div className="text-[11px] font-semibold text-purple-700">
              {language === 'bn' ? 'শ্রেণি ৬, ৭, ৮ • জাতীয় জুনিয়র কারিকুলাম' : 'Classes 6, 7, 8 • Junior National Curriculum'}
            </div>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm font-mono">
              {language === 'bn' ? '৯-১২' : '9-12'}
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm">
              {language === 'bn' ? 'মাধ্যমিক ও কলেজ শাখা' : 'Secondary & College Section'}
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              {language === 'bn'
                ? 'বিজ্ঞান, মানবিক ও ব্যবসায় শিক্ষা শাখায় আধুনিক গবেষণাগারভিত্তিক পাঠদান ও বোর্ড পরীক্ষার নিবিড় প্রস্তুতি।'
                : 'Specialized streams in Science, Humanities, and Business Studies with dedicated laboratory research and board preparation.'}
            </p>
            <div className="text-[11px] font-semibold text-emerald-700">
              {language === 'bn' ? 'শ্রেণি ৯, ১০ (এসএসসি) ও শ্রেণি ১১, ১২ (এইচএসসি)' : 'Class 9, 10 (SSC) & Class 11, 12 (HSC)'}
            </div>
          </div>
        </div>

        {/* Classes Table */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            {language === 'bn'
              ? `সক্রিয় শ্রেণি ও শাখা ধারণক্ষমতা (${formatNumber(db.classes.length, 'bn')} টি স্তর)`
              : `Active Classes & Section Capacities (${db.classes.length} Academic Levels)`}
          </h4>
          <div className="flex flex-wrap gap-2">
            {db.classes.map(cls => (
              <span
                key={cls.id}
                className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-900 border border-blue-200 text-xs font-bold flex items-center gap-1.5"
              >
                <span>{language === 'bn' ? (cls.nameBn || cls.nameEn) : (cls.nameEn || cls.nameBn)}</span>
                {cls.shifts && cls.shifts.length > 0 && (
                  <span className="text-[10px] text-blue-600 font-normal">
                    ({cls.shifts.join(', ')})
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Shifts & Timetable */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base border-b border-slate-100 pb-3">
            <Clock className="w-5 h-5 text-blue-600" />
            <span>{t('academics.shifts_title', language)}</span>
          </div>

          <div className="space-y-3">
            {db.shifts.map(shift => (
              <div
                key={shift.id}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
              >
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">
                    {getLocalizedField(shift, 'name', language)}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {shift.name.toLowerCase().includes('morning') || (shift.nameBn && shift.nameBn.includes('প্রভাতী'))
                      ? (language === 'bn' ? 'জুনিয়র শ্রেণি ও প্রাথমিক শাখাসমূহ' : 'Junior classes and early primary sections')
                      : (language === 'bn' ? 'মাধ্যমিক ও উচ্চ মাধ্যমিক শ্রেণিসমূহ' : 'Secondary and higher secondary classes')}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black font-mono text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                    {formatNumber(shift.startTime || '07:30 AM', language)} - {formatNumber(shift.endTime || '12:00 PM', language)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Board Grading Scale */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base border-b border-slate-100 pb-3">
            <Award className="w-5 h-5 text-amber-500" />
            <span>{t('academics.grading_title', language)}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="py-2 px-2.5">{t('academics.marks_col', language)}</th>
                  <th className="py-2 px-2.5 text-center">{t('academics.grade_col', language)}</th>
                  <th className="py-2 px-2.5 text-center">{t('academics.point_col', language)}</th>
                  <th className="py-2 px-2.5">{t('academics.remarks_col', language)}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-2 px-2.5 font-mono">{formatNumber('80% - 100%', language)}</td>
                  <td className="py-2 px-2.5 text-center font-bold text-emerald-700">A+</td>
                  <td className="py-2 px-2.5 text-center font-bold font-mono">{formatNumber('5.00', language)}</td>
                  <td className="py-2 px-2.5 text-slate-600">{language === 'bn' ? 'অসাধারণ (Outstanding)' : 'Outstanding'}</td>
                </tr>
                <tr>
                  <td className="py-2 px-2.5 font-mono">{formatNumber('70% - 79%', language)}</td>
                  <td className="py-2 px-2.5 text-center font-bold text-emerald-600">A</td>
                  <td className="py-2 px-2.5 text-center font-bold font-mono">{formatNumber('4.00', language)}</td>
                  <td className="py-2 px-2.5 text-slate-600">{language === 'bn' ? 'চমৎকার (Excellent)' : 'Excellent'}</td>
                </tr>
                <tr>
                  <td className="py-2 px-2.5 font-mono">{formatNumber('60% - 69%', language)}</td>
                  <td className="py-2 px-2.5 text-center font-bold text-blue-600">A-</td>
                  <td className="py-2 px-2.5 text-center font-bold font-mono">{formatNumber('3.50', language)}</td>
                  <td className="py-2 px-2.5 text-slate-600">{language === 'bn' ? 'খুব ভালো (Very Good)' : 'Very Good'}</td>
                </tr>
                <tr>
                  <td className="py-2 px-2.5 font-mono">{formatNumber('50% - 59%', language)}</td>
                  <td className="py-2 px-2.5 text-center font-bold text-purple-600">B</td>
                  <td className="py-2 px-2.5 text-center font-bold font-mono">{formatNumber('3.00', language)}</td>
                  <td className="py-2 px-2.5 text-slate-600">{language === 'bn' ? 'ভালো (Good)' : 'Good'}</td>
                </tr>
                <tr>
                  <td className="py-2 px-2.5 font-mono">{formatNumber('40% - 49%', language)}</td>
                  <td className="py-2 px-2.5 text-center font-bold text-amber-600">C</td>
                  <td className="py-2 px-2.5 text-center font-bold font-mono">{formatNumber('2.00', language)}</td>
                  <td className="py-2 px-2.5 text-slate-600">{language === 'bn' ? 'সন্তোষজনক (Satisfactory)' : 'Satisfactory'}</td>
                </tr>
                <tr>
                  <td className="py-2 px-2.5 font-mono">{formatNumber('33% - 39%', language)}</td>
                  <td className="py-2 px-2.5 text-center font-bold text-orange-600">D</td>
                  <td className="py-2 px-2.5 text-center font-bold font-mono">{formatNumber('1.00', language)}</td>
                  <td className="py-2 px-2.5 text-slate-600">{language === 'bn' ? 'উত্তীর্ণ (Pass)' : 'Pass'}</td>
                </tr>
                <tr>
                  <td className="py-2 px-2.5 font-mono">{formatNumber('00% - 32%', language)}</td>
                  <td className="py-2 px-2.5 text-center font-bold text-red-600">F</td>
                  <td className="py-2 px-2.5 text-center font-bold font-mono">{formatNumber('0.00', language)}</td>
                  <td className="py-2 px-2.5 text-slate-600">{language === 'bn' ? 'অনুত্তীর্ণ (Fail)' : 'Fail'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
