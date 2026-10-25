import React from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Heart,
  LogIn,
  Settings2
} from 'lucide-react';
import { WebsiteData } from '../../types/website';
import { useLanguage } from '../../context/LanguageContext';

interface PublicFooterProps {
  website: WebsiteData;
  onNavigate: (page: string, slug?: string) => void;
  onOpenPortal: () => void;
  onOpenCMS?: () => void;
}

export const PublicFooter: React.FC<PublicFooterProps> = ({
  website,
  onNavigate,
  onOpenPortal,
  onOpenCMS
}) => {
  const { t, getLocalizedField, formatNumber } = useLanguage();
  const { settings, customPages } = website;
  const footerCustomPages = customPages.filter(p => p.isPublished && p.showInFooter);

  return (
    <footer className="bg-slate-950 text-slate-300 text-xs border-t border-slate-800">
      {/* Upper Footer Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {/* Column 1: Institutional Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-900 to-blue-700 p-0.5 shadow-md flex items-center justify-center shrink-0 border border-blue-400/40">
                {settings.logoUrl ? (
                  <img
                    src={settings.logoUrl}
                    alt={settings.schoolName}
                    className="w-full h-full object-cover rounded-[10px]"
                  />
                ) : (
                  <div className="text-white font-extrabold text-xl">
                    {(settings.shortName || settings.schoolName || 'E').charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-extrabold text-white text-sm leading-tight">
                  {getLocalizedField(settings, 'schoolName')}
                </h3>
                <span className="text-[11px] text-blue-400 font-semibold block mt-0.5">
                  {t('nav.eiin')}: {settings.eiin} • {t('nav.est')} {formatNumber(settings.establishedYear)}
                </span>
              </div>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed">
              {getLocalizedField(settings, 'footerText') || getLocalizedField(settings, 'schoolDescription')}
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-2 pt-1">
              {settings.facebookUrl && (
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-blue-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors border border-slate-800"
                  aria-label="Facebook"
                >
                  <span className="font-bold text-xs">f</span>
                </a>
              )}
              {settings.youtubeUrl && (
                <a
                  href={settings.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-red-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors border border-slate-800"
                  aria-label="YouTube"
                >
                  <span className="font-bold text-xs">▶</span>
                </a>
              )}
              {settings.twitterUrl && (
                <a
                  href={settings.twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-sky-500 text-slate-300 hover:text-white flex items-center justify-center transition-colors border border-slate-800"
                  aria-label="X / Twitter"
                >
                  <span className="font-bold text-xs">𝕏</span>
                </a>
              )}
              {settings.linkedinUrl && (
                <a
                  href={settings.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-blue-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors border border-slate-800"
                  aria-label="LinkedIn"
                >
                  <span className="font-bold text-xs">in</span>
                </a>
              )}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4 border-l-2 border-blue-500 pl-2.5">
              {t('footer.quick_links')}
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-blue-500" />
                  <span>{t('nav.home')}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-blue-500" />
                  <span>{t('nav.about')}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('principal-message')}
                  className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-blue-500" />
                  <span>{t('nav.about.principal')}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('faculty')}
                  className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-blue-500" />
                  <span>{t('nav.about.faculty')}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('committee')}
                  className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-blue-500" />
                  <span>{t('nav.about.committee')}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('gallery')}
                  className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-blue-500" />
                  <span>{t('nav.gallery')}</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Academics & Admissions */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4 border-l-2 border-emerald-500 pl-2.5">
              {t('footer.academic_links')}
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button
                  onClick={() => onNavigate('admissions')}
                  className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{t('nav.admissions')}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('academics')}
                  className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{t('nav.academics')}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('results')}
                  className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{t('nav.results')}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('notices')}
                  className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{t('nav.notices')}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('news')}
                  className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{t('nav.news')}</span>
                </button>
              </li>
              {footerCustomPages.map(page => (
                <li key={page.id}>
                  <button
                    onClick={() => onNavigate('custom-page', page.slug)}
                    className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{getLocalizedField(page, 'title')}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact & Office Info */}
          <div className="space-y-3.5">
            <h4 className="text-white font-bold text-sm mb-4 border-l-2 border-amber-500 pl-2.5">
              {t('footer.contact_info')}
            </h4>

            <div className="flex items-start gap-2.5 text-slate-400">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{getLocalizedField(settings, 'address')}</span>
            </div>

            <div className="flex items-center gap-2.5 text-slate-400">
              <Phone className="w-4 h-4 text-blue-400 shrink-0" />
              <span>{settings.phone}</span>
            </div>

            <div className="flex items-center gap-2.5 text-slate-400">
              <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{settings.email}</span>
            </div>

            <div className="flex items-start gap-2.5 text-slate-400">
              <Clock className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <span>{settings.openingHours}</span>
            </div>

            <div className="pt-2 space-y-2">
              {onOpenCMS && (
                <button
                  onClick={onOpenCMS}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-amber-400 hover:text-amber-300 px-3.5 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 border border-slate-800 transition-colors cursor-pointer text-xs"
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  <span>Web CMS (Admin Login)</span>
                </button>
              )}
              <button
                onClick={onOpenPortal}
                className="w-full bg-slate-900 hover:bg-slate-800 text-blue-300 hover:text-white px-3.5 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 border border-slate-800 transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Teacher & Admin Portal Access</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Copyright & Software Credit */}
      <div className="border-t border-slate-900 bg-black/40 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
          <div>
            {settings.copyrightText || `© ${new Date().getFullYear()} ${settings.schoolName}. All Rights Reserved.`}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('contact')}
              className="hover:text-slate-300 cursor-pointer"
            >
              Contact Webmaster
            </button>
            {onOpenCMS && (
              <>
                <span>•</span>
                <button
                  onClick={onOpenCMS}
                  className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  <span>Web CMS</span>
                </button>
              </>
            )}
            <span>•</span>
            <button
              onClick={onOpenPortal}
              className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Portal Login</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
