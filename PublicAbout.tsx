import React from 'react';
import {
  Building,
  Target,
  Sparkles,
  Award,
  CheckCircle2,
  Calendar,
  Layers,
  GraduationCap
} from 'lucide-react';
import { WebsiteData } from '../../types/website';
import { useLanguage } from '../../context/LanguageContext';

interface PublicAboutProps {
  website: WebsiteData;
  onNavigate: (page: string) => void;
}

export const PublicAbout: React.FC<PublicAboutProps> = ({ website, onNavigate }) => {
  const { language, t, formatNumber, getLocalizedField } = useLanguage();
  const { about, settings } = website;

  const schoolName = language === 'bn' && settings.schoolNameBn ? settings.schoolNameBn : settings.schoolName;
  const schoolMotto = language === 'bn' && settings.mottoBn ? settings.mottoBn : settings.motto;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-14">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          {t('about.badge')}
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {language === 'bn' ? `${schoolName} সম্পর্কে` : `About ${schoolName}`}
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed italic">
          "{schoolMotto}"
        </p>
      </div>

      {/* History & Inception */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-10 space-y-5">
        <div className="flex items-center gap-2.5 text-blue-900 font-extrabold text-base border-b border-slate-100 pb-3">
          <Building className="w-5 h-5 text-blue-600" />
          <span>{t('about.history.title')}</span>
        </div>

        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          {getLocalizedField(about, 'history', language) || about.history}
        </p>

        {/* Milestones Timeline */}
        <div className="pt-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-6">
            {t('about.milestones.title')}
          </h4>

          <div className="relative border-l-2 border-blue-200 ml-4 space-y-6">
            {(about.historyMilestones || about.milestones || []).map((item, idx) => (
              <div key={idx} className="relative pl-6">
                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-xs" />
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    {formatNumber(item.year, language)}
                  </span>
                  <h5 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                    {getLocalizedField(item, 'title', language) || item.title}
                  </h5>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {getLocalizedField(item, 'description', language) || item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission & Vision Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-md space-y-3">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-blue-300">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black tracking-tight">{t('about.mission.title')}</h3>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            {getLocalizedField(about, 'mission', language) || about.mission}
          </p>
        </div>

        <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white rounded-2xl p-6 sm:p-8 shadow-md space-y-3">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-emerald-300">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black tracking-tight">{t('about.vision.title')}</h3>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            {getLocalizedField(about, 'vision', language) || about.vision}
          </p>
        </div>
      </div>

      {/* Core Objectives */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{language === 'bn' ? 'মূল প্রাতিষ্ঠানিক উদ্দেশ্য' : 'Core Institutional Objectives'}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {(about.objectives || []).map((obj, idx) => (
            <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                {formatNumber(idx + 1, language)}
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">{obj}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Facilities Grid */}
      <div className="space-y-6">
        <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900">
              {t('about.facilities.title')}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'bn' ? 'বিজ্ঞান, কলা এবং শারীরিক উৎকর্ষের জন্য নির্মিত সুবিশাল ক্যাম্পাস।' : 'Spacious environments purposefully built for science, arts, and physical fitness.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {about.facilities.map(fac => (
            <div
              key={fac.id}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="h-44 overflow-hidden relative">
                <img
                  src={fac.imageUrl}
                  alt={getLocalizedField(fac, 'title', language) || fac.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <h4 className="absolute bottom-3 left-3 right-3 text-white font-bold text-sm">
                  {getLocalizedField(fac, 'title', language) || fac.title}
                </h4>
              </div>
              <div className="p-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  {getLocalizedField(fac, 'description', language) || fac.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
