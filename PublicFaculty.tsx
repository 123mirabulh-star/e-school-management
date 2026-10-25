import React, { useState } from 'react';
import { Search, GraduationCap, Mail, Phone, BookOpen, Filter } from 'lucide-react';
import { WebsiteData } from '../../types/website';
import { useLanguage } from '../../context/LanguageContext';

interface PublicFacultyProps {
  website: WebsiteData;
}

export const PublicFaculty: React.FC<PublicFacultyProps> = ({ website }) => {
  const { language, t, formatNumber, getLocalizedField } = useLanguage();
  const facultyProfiles = website.facultyProfiles || website.faculty || [];
  const settings = website.settings;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');

  const departments = Array.from(new Set(facultyProfiles.map(f => f.department))).filter(Boolean);

  const filteredFaculty = facultyProfiles
    .filter(f => f.isPublished !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .filter(f => {
      const name = getLocalizedField(f, 'name', language) || f.name;
      const dept = getLocalizedField(f, 'department', language) || f.department;
      const desig = getLocalizedField(f, 'designation', language) || f.designation;
      const subj = getLocalizedField(f, 'subject', language) || f.subject || '';

      const matchesSearch =
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subj.toLowerCase().includes(searchTerm.toLowerCase()) ||
        desig.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = selectedDept === 'all' || f.department === selectedDept;
      return matchesSearch && matchesDept;
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          {t('faculty.badge')}
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {t('faculty.heading')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          {t('faculty.subheading')}
        </p>
      </div>

      {/* Search & Department Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t('faculty.search_placeholder')}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 focus:bg-white transition-all font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <button
            onClick={() => setSelectedDept('all')}
            className={`text-xs px-3 py-1.5 rounded-lg font-bold shrink-0 transition-colors cursor-pointer ${
              selectedDept === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t('faculty.all_departments')} ({formatNumber(facultyProfiles.filter(f => f.isPublished !== false).length, language)})
          </button>
          {departments.map(dept => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`text-xs px-3 py-1.5 rounded-lg font-bold shrink-0 transition-colors cursor-pointer ${
                selectedDept === dept
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Faculty Cards Grid */}
      {filteredFaculty.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
          {t('faculty.no_results')}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFaculty.map(faculty => {
            const facName = getLocalizedField(faculty, 'name', language) || faculty.name;
            const facDept = getLocalizedField(faculty, 'department', language) || faculty.department;
            const facDesig = getLocalizedField(faculty, 'designation', language) || faculty.designation;
            const facSubj = getLocalizedField(faculty, 'subject', language) || faculty.subject;
            const facQual = getLocalizedField(faculty, 'qualification', language) || faculty.qualification;
            const facBio = getLocalizedField(faculty, 'bio', language) || faculty.bio;

            return (
              <div
                key={faculty.id}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-all space-y-4 group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-blue-50 p-1 shadow-sm shrink-0 border border-blue-100 overflow-hidden">
                    {faculty.photoUrl ? (
                      <img
                        src={faculty.photoUrl}
                        alt={facName}
                        className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full rounded-xl bg-blue-600 text-white font-extrabold text-xl flex items-center justify-center">
                        {facName.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded uppercase">
                      {facDept}
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-sm leading-snug truncate">
                      {facName}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {facDesig}
                    </p>
                    <p className="text-[11px] text-emerald-700 font-bold">
                      {facSubj}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl space-y-1 text-xs">
                  <div className="text-[11px] text-slate-500 font-medium">
                    <strong>{t('faculty.qualification')}:</strong> {facQual}
                  </div>
                  {faculty.email && (
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span>{faculty.email}</span>
                    </div>
                  )}
                </div>

                {facBio && (
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {facBio}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
