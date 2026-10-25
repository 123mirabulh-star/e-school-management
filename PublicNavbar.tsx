import React, { useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  LogIn,
  Menu,
  X,
  ChevronDown,
  Globe,
  Bell,
  Award,
  BookOpen,
  Calendar,
  Users,
  FileText,
  Image,
  ExternalLink,
  ShieldCheck,
  Search,
  Settings2
} from 'lucide-react';
import { WebsiteData, WebsiteNavigationItem } from '../../types/website';
import { INITIAL_WEBSITE_NAVIGATION } from '../../data/initialWebsiteData';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageSwitcher } from '../common/LanguageSwitcher';

interface PublicNavbarProps {
  website: WebsiteData;
  activePage: string;
  onNavigate: (page: string, slug?: string) => void;
  onOpenPortal: () => void;
  onOpenCMS?: () => void;
  isLoggedInAdmin?: boolean;
}

export const PublicNavbar: React.FC<PublicNavbarProps> = ({
  website,
  activePage,
  onNavigate,
  onOpenPortal,
  onOpenCMS,
  isLoggedInAdmin = false
}) => {
  const { t, getLocalizedField, formatNumber, language } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});

  const { settings, customPages } = website;

  // Determine active navigation items
  const navItems: WebsiteNavigationItem[] = (
    website.navigation && website.navigation.length > 0
      ? website.navigation
      : INITIAL_WEBSITE_NAVIGATION
  )
    .filter(item => item.isActive !== false)
    .sort((a, b) => a.order - b.order);

  // Additional custom pages not already included in navigation
  const additionalCustomPages = customPages
    .filter(p => p.isPublished && p.showInNav)
    .filter(p => !navItems.some(n => n.destination === p.slug || n.destination === `page-${p.slug}`));

  const toggleMobileDropdown = (itemId: string) => {
    setOpenDropdowns(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const handleNavClick = (page: string, slug?: string) => {
    onNavigate(page, slug);
    setIsMobileMenuOpen(false);
    setOpenDropdowns({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="w-full bg-white shadow-xs sticky top-0 z-50">
      {/* Top Notification / Emergency Announcement Bar */}
      {settings.showEmergencyNotice && settings.emergencyNotice && (
        <div className="bg-amber-600 text-white text-xs py-1.5 px-4 font-medium flex items-center justify-between">
          <div className="max-w-7xl mx-auto w-full flex items-center gap-2 overflow-hidden">
            <span className="bg-white/20 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Bell className="w-3 h-3" />
              {t('nav.emergency_notice')}
            </span>
            <span className="truncate">{getLocalizedField(settings, 'emergencyNotice')}</span>
          </div>
        </div>
      )}

      {/* Top Institutional Info Bar */}
      <div className="hidden lg:block bg-slate-900 text-slate-300 text-xs py-2 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Phone className="w-3.5 h-3.5 text-blue-400" />
              <span>{settings.phone}</span>
            </div>
            <div className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Mail className="w-3.5 h-3.5 text-blue-400" />
              <span>{settings.email}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>{settings.openingHours}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="bg-blue-900/60 text-blue-300 px-2 py-0.5 rounded font-mono font-semibold text-[11px] border border-blue-700/50">
              {t('nav.eiin')}: {settings.eiin}
            </span>
            <span className="text-slate-400">
              {t('nav.est')} {formatNumber(settings.establishedYear)}
            </span>

            {/* Language Switcher */}
            <LanguageSwitcher variant="dark" />

            {/* Web CMS Manager Button (Requires Admin Login) */}
            {onOpenCMS && (
              <button
                onClick={onOpenCMS}
                className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                title="Manage public website content (Admin Login Required)"
              >
                <Settings2 className="w-3.5 h-3.5" />
                <span>Web CMS</span>
              </button>
            )}

            {/* Portal Login Button */}
            <button
              onClick={onOpenPortal}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-md flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{isLoggedInAdmin ? 'Admin Dashboard' : 'Portal Login'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Branding Header */}
      <div className="border-b border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          {/* Logo & School Name */}
          <div
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3.5 cursor-pointer group"
          >
            <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-xl bg-gradient-to-tr from-blue-950 to-blue-800 p-0.5 shadow-md flex items-center justify-center shrink-0 border border-blue-200 group-hover:scale-102 transition-transform">
              {settings.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={settings.schoolName}
                  className="w-full h-full object-cover rounded-[10px]"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-extrabold text-2xl">
                  {(settings.shortName || settings.schoolName || 'E').charAt(0)}
                </div>
              )}
            </div>

            <div>
              <h1 className="text-base sm:text-xl font-extrabold text-slate-900 leading-tight group-hover:text-blue-900 transition-colors tracking-tight">
                {getLocalizedField(settings, 'schoolName')}
              </h1>
              <p className="text-[11px] sm:text-xs text-blue-700 font-semibold italic mt-0.5">
                {getLocalizedField(settings, 'motto')}
              </p>
              <p className="hidden sm:block text-[11px] text-slate-500 font-medium">
                {getLocalizedField(settings, 'address')}
              </p>
            </div>
          </div>

          {/* Quick CTA & Mobile Menu Toggle */}
          <div className="flex items-center gap-2">
            <div className="lg:hidden">
              <LanguageSwitcher variant="light" variant-type="compact" />
            </div>

            <button
              onClick={() => handleNavClick('admissions')}
              className="hidden sm:inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <span>{t('nav.online_admission')}</span>
            </button>

            <button
              onClick={onOpenPortal}
              className="lg:hidden bg-slate-900 text-white p-2 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
              title={isLoggedInAdmin ? t('nav.admin_dashboard') : t('nav.portal_login')}
            >
              <LogIn className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
              aria-label="Toggle Navigation"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Desktop Navigation Bar */}
      <nav className="hidden lg:block bg-blue-950 text-white text-xs font-semibold">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <ul className="flex items-center flex-wrap">
            {navItems.map(item => {
              const itemLabel = language === 'bn' && item.labelBn ? item.labelBn : item.labelEn;
              const isDropdownActive = item.hasDropdown && item.dropdownItems?.some(
                d => d.destination === activePage || (activePage.startsWith('page-') && activePage === `page-${d.destination}`)
              );
              const isDirectActive = item.destination === activePage || (activePage.startsWith('page-') && activePage === `page-${item.destination}`);
              const isItemActive = isDirectActive || isDropdownActive;

              if (item.hasDropdown && item.dropdownItems && item.dropdownItems.length > 0) {
                const activeSubItems = item.dropdownItems.filter(d => d.isActive !== false).sort((a, b) => a.order - b.order);
                return (
                  <li key={item.id} className="relative group">
                    <button
                      onClick={() => {
                        if (item.destination && item.destination !== '#') {
                          handleNavClick(item.destination);
                        }
                      }}
                      className={`px-3.5 py-3 transition-colors flex items-center gap-1 cursor-pointer ${
                        isItemActive ? 'bg-blue-800 text-white font-bold' : 'text-slate-200 hover:bg-blue-900 hover:text-white'
                      }`}
                    >
                      <span>{itemLabel}</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>

                    <div className="absolute top-full left-0 min-w-56 bg-white text-slate-800 rounded-b-xl shadow-xl border border-slate-200 py-2 hidden group-hover:block z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                      {activeSubItems.map(sub => {
                        const subLabel = language === 'bn' && sub.labelBn ? sub.labelBn : sub.labelEn;
                        const isSubActive = sub.destination === activePage || (activePage.startsWith('page-') && activePage === `page-${sub.destination}`);
                        if (sub.isExternal || sub.destination.startsWith('http')) {
                          return (
                            <a
                              key={sub.id}
                              href={sub.destination}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full text-left px-4 py-2 hover:bg-blue-50 hover:text-blue-700 text-xs font-medium flex items-center justify-between cursor-pointer"
                            >
                              <span>{subLabel}</span>
                              <ExternalLink className="w-3 h-3 text-slate-400" />
                            </a>
                          );
                        }
                        return (
                          <button
                            key={sub.id}
                            onClick={() => handleNavClick(sub.destination)}
                            className={`w-full text-left px-4 py-2 hover:bg-blue-50 hover:text-blue-700 text-xs font-medium cursor-pointer ${
                              isSubActive ? 'bg-blue-50 text-blue-700 font-bold' : ''
                            }`}
                          >
                            {subLabel}
                          </button>
                        );
                      })}
                    </div>
                  </li>
                );
              }

              if (item.isExternal || item.destination.startsWith('http')) {
                return (
                  <li key={item.id}>
                    <a
                      href={item.destination}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-3 text-slate-200 hover:bg-blue-900 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>{itemLabel}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  </li>
                );
              }

              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavClick(item.destination)}
                    className={`px-3.5 py-3 transition-colors flex items-center gap-1 cursor-pointer ${
                      isItemActive ? 'bg-blue-800 text-white font-bold' : 'text-slate-200 hover:bg-blue-900 hover:text-white'
                    }`}
                  >
                    <span>{itemLabel}</span>
                    {item.destination === 'notices' && website.notices.some(n => n.isPublished && n.isPinned) && (
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    )}
                  </button>
                </li>
              );
            })}

            {/* Additional Custom Pages */}
            {additionalCustomPages.map(page => (
              <li key={page.id}>
                <button
                  onClick={() => handleNavClick('custom-page', page.slug)}
                  className={`px-3.5 py-3 transition-colors flex items-center gap-1 cursor-pointer ${
                    activePage === `page-${page.slug}`
                      ? 'bg-blue-800 text-white font-bold'
                      : 'text-slate-200 hover:bg-blue-900 hover:text-white'
                  }`}
                >
                  {getLocalizedField(page, 'title')}
                </button>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleNavClick('results')}
              className="text-xs text-blue-200 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded bg-blue-900/60 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-blue-300" />
              <span>{t('results.search_btn')}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 max-h-[85vh] overflow-y-auto shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('auth.lang_toggle')}</span>
            <LanguageSwitcher variant="light" />
          </div>

          {navItems.map(item => {
            const itemLabel = language === 'bn' && item.labelBn ? item.labelBn : item.labelEn;
            const isDropdownActive = item.hasDropdown && item.dropdownItems?.some(
              d => d.destination === activePage || (activePage.startsWith('page-') && activePage === `page-${d.destination}`)
            );
            const isDirectActive = item.destination === activePage || (activePage.startsWith('page-') && activePage === `page-${item.destination}`);
            const isItemActive = isDirectActive || isDropdownActive;
            const isDropdownOpen = !!openDropdowns[item.id];

            if (item.hasDropdown && item.dropdownItems && item.dropdownItems.length > 0) {
              const activeSubItems = item.dropdownItems.filter(d => d.isActive !== false).sort((a, b) => a.order - b.order);
              return (
                <div key={item.id} className="border-t border-slate-100 pt-1">
                  <button
                    onClick={() => toggleMobileDropdown(item.id)}
                    className="w-full flex items-center justify-between py-2 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer"
                  >
                    <span>{itemLabel}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180 text-blue-600' : 'text-slate-400'}`} />
                  </button>
                  {isDropdownOpen && (
                    <div className="pl-4 space-y-1">
                      {activeSubItems.map(sub => {
                        const subLabel = language === 'bn' && sub.labelBn ? sub.labelBn : sub.labelEn;
                        if (sub.isExternal || sub.destination.startsWith('http')) {
                          return (
                            <a
                              key={sub.id}
                              href={sub.destination}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full text-left py-1.5 px-3 text-xs text-slate-600 hover:text-blue-600 flex items-center justify-between"
                            >
                              <span>{subLabel}</span>
                              <ExternalLink className="w-3 h-3 text-slate-400" />
                            </a>
                          );
                        }
                        return (
                          <button
                            key={sub.id}
                            onClick={() => handleNavClick(sub.destination)}
                            className="w-full text-left py-1.5 px-3 text-xs text-slate-600 hover:text-blue-600 cursor-pointer"
                          >
                            {subLabel}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            if (item.isExternal || item.destination.startsWith('http')) {
              return (
                <a
                  key={item.id}
                  href={item.destination}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-left py-2.5 px-3 rounded-lg text-xs font-bold text-slate-700 flex items-center justify-between hover:bg-slate-50"
                >
                  <span>{itemLabel}</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.destination)}
                className={`w-full text-left py-2.5 px-3 rounded-lg text-xs font-bold cursor-pointer ${
                  isItemActive ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {itemLabel}
              </button>
            );
          })}

          {/* Additional Custom Pages in Mobile Drawer */}
          {additionalCustomPages.map(page => (
            <button
              key={page.id}
              onClick={() => handleNavClick('custom-page', page.slug)}
              className={`w-full text-left py-2.5 px-3 rounded-lg text-xs font-bold cursor-pointer ${
                activePage === `page-${page.slug}` ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {getLocalizedField(page, 'title')}
            </button>
          ))}

          <div className="pt-3 border-t border-slate-200 space-y-2">
            {onOpenCMS && (
              <button
                onClick={onOpenCMS}
                className="w-full bg-amber-600 hover:bg-amber-500 text-white py-2 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Settings2 className="w-4 h-4" />
                <span>Web CMS Manager</span>
              </button>
            )}

            <button
              onClick={onOpenPortal}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>{isLoggedInAdmin ? t('nav.admin_dashboard') : t('nav.portal_login')}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
