import React from 'react';
import { Quote, Award, Mail, Phone, Building } from 'lucide-react';
import { WebsiteData } from '../../types/website';
import { useLanguage } from '../../context/LanguageContext';

interface PublicPrincipalMessageProps {
  website: WebsiteData;
}

export const PublicPrincipalMessage: React.FC<PublicPrincipalMessageProps> = ({ website }) => {
  const { language, t, formatNumber, getLocalizedField } = useLanguage();
  const { principalMessage, settings } = website;

  const schoolName = language === 'bn' && settings.schoolNameBn ? settings.schoolNameBn : settings.schoolName;
  const principalName = getLocalizedField(principalMessage, 'name', language) || principalMessage.name || 'Principal';
  const principalDesignation = getLocalizedField(principalMessage, 'designation', language) || principalMessage.designation || 'Head of Institution';
  const quote = getLocalizedField(principalMessage, 'quote', language) || principalMessage.quote;
  const content = getLocalizedField(principalMessage, 'content', language) || principalMessage.content || (principalMessage as any).message;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          {t('principal.badge')}
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {getLocalizedField(principalMessage, 'title', language) || principalMessage.title || t('principal.heading')}
        </h1>
        <p className="text-xs text-slate-500">
          {schoolName}
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Profile Banner */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center gap-6">
          <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-2xl overflow-hidden bg-white/10 p-1 border-2 border-blue-400/40 shadow-xl shrink-0">
            {principalMessage.photoUrl ? (
              <img
                src={principalMessage.photoUrl}
                alt={principalName}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-blue-800 text-white font-extrabold text-3xl rounded-xl">
                {principalName.charAt(0)}
              </div>
            )}
          </div>

          <div className="text-center sm:text-left space-y-1.5">
            <span className="text-xs bg-blue-500/30 text-blue-300 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {language === 'bn' ? 'অধ্যক্ষ ও প্রতিষ্ঠান প্রধান' : 'Principal & Head of Institution'}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {principalName}
            </h2>
            <p className="text-xs text-slate-300">
              {principalDesignation}
            </p>
            <p className="text-[11px] text-blue-300 font-mono">
              {t('nav.eiin')}: {formatNumber(settings.eiin, language)} • {schoolName}
            </p>
          </div>
        </div>

        {/* Message Body */}
        <div className="p-6 sm:p-10 space-y-6">
          {quote && (
            <div className="relative p-5 bg-blue-50/70 border-l-4 border-blue-600 rounded-xl">
              <Quote className="w-8 h-8 text-blue-300 absolute top-3 right-3 opacity-40" />
              <p className="text-xs sm:text-sm italic font-medium text-blue-950 leading-relaxed">
                "{quote}"
              </p>
            </div>
          )}

          <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-4 whitespace-pre-line">
            {content}
          </div>

          <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-extrabold text-slate-900 text-sm">
                {principalName}
              </p>
              <p className="text-xs text-slate-500">
                {language === 'bn' ? `অধ্যক্ষ, ${schoolName}` : `Principal, ${schoolName}`}
              </p>
            </div>

            <div className="text-xs text-slate-400 font-mono">
              {language === 'bn' ? 'ক্যাম্পাস ঠিকানা:' : 'Official Institutional Address:'} {settings.address}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
