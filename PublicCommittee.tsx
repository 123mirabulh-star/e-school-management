import React from 'react';
import { ShieldCheck, Users, Award, Building } from 'lucide-react';
import { WebsiteData } from '../../types/website';
import { useLanguage } from '../../context/LanguageContext';

interface PublicCommitteeProps {
  website: WebsiteData;
}

export const PublicCommittee: React.FC<PublicCommitteeProps> = ({ website }) => {
  const { language, t, getLocalizedField } = useLanguage();
  const committeeMembers = website.committeeMembers || website.committee || [];
  const settings = website.settings;
  const schoolName = language === 'bn' && settings.schoolNameBn ? settings.schoolNameBn : settings.schoolName;

  const publishedMembers = committeeMembers
    .filter(m => m.isPublished !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          {t('committee.badge')}
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {t('committee.heading')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          {t('committee.subheading')}
        </p>
      </div>

      {/* Committee Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {publishedMembers.map(member => {
          const mName = getLocalizedField(member, 'name', language) || member.name;
          const mPos = getLocalizedField(member, 'position', language) || member.position;
          const mBio = getLocalizedField(member, 'bio', language) || member.bio;

          return (
            <div
              key={member.id}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col items-center text-center space-y-3.5 hover:shadow-md transition-shadow"
            >
              <div className="w-28 h-28 rounded-2xl overflow-hidden bg-blue-50 p-1 border-2 border-blue-200 shadow-sm">
                {member.photoUrl ? (
                  <img
                    src={member.photoUrl}
                    alt={mName}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-full h-full rounded-xl bg-blue-600 text-white font-extrabold text-2xl flex items-center justify-center">
                    {mName.charAt(0)}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-3 py-0.5 rounded-full uppercase tracking-wider">
                  {mPos}
                </span>
                <h3 className="font-extrabold text-slate-900 text-base">
                  {mName}
                </h3>
              </div>

              {mBio && (
                <p className="text-xs text-slate-600 leading-relaxed max-w-sm">
                  {mBio}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
