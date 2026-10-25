import React, { useState, useEffect } from 'react';
import { User, WebsiteCustomPage } from '../../types';
import { AppDatabase } from '../../services/storage';
import { PublicNavbar } from './PublicNavbar';
import { PublicFooter } from './PublicFooter';
import { PublicHome } from './PublicHome';
import { PublicAbout } from './PublicAbout';
import { PublicPrincipalMessage } from './PublicPrincipalMessage';
import { PublicFaculty } from './PublicFaculty';
import { PublicCommittee } from './PublicCommittee';
import { PublicAcademics } from './PublicAcademics';
import { PublicNotices } from './PublicNotices';
import { PublicNews } from './PublicNews';
import { PublicGallery } from './PublicGallery';
import { PublicAdmissions } from './PublicAdmissions';
import { PublicResults } from './PublicResults';
import { PublicContact } from './PublicContact';
import { PublicCustomPage } from './PublicCustomPage';
import { LayoutDashboard, Settings2, ShieldCheck, ArrowRight } from 'lucide-react';

interface PublicWebsiteProps {
  db: AppDatabase;
  onUpdateDb: (updated: AppDatabase) => void;
  currentUser?: User | null;
  onGoToPortal: () => void;
  onGoToCMS?: () => void;
  initialPage?: string;
}

export const PublicWebsite: React.FC<PublicWebsiteProps> = ({
  db,
  onUpdateDb,
  currentUser,
  onGoToPortal,
  onGoToCMS,
  initialPage = 'home',
}) => {
  const [currentPage, setCurrentPage] = useState<string>(initialPage);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const handleNavigate = (page: string, slug?: string) => {
    if (page === 'custom-page' && slug) {
      setCurrentPage(slug.replace(/^\//, ''));
    } else if (slug) {
      setCurrentPage(slug.replace(/^\//, ''));
    } else {
      setCurrentPage(page.replace(/^\//, ''));
    }
  };

  // Find if current page is a custom page
  const cleanCurrentPage = currentPage.replace(/^\//, '').replace(/^page-/, '');
  const customPage = (db.website?.customPages || []).find(
    (p: WebsiteCustomPage) => {
      const cleanSlug = (p.slug || '').replace(/^\//, '');
      const matches = cleanSlug === cleanCurrentPage || p.slug === currentPage || p.id === currentPage || `page-${cleanSlug}` === currentPage;
      if (!matches) return false;
      // Allow viewing if published or if admin is logged in
      return p.isPublished !== false || !!currentUser;
    }
  );

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans selection:bg-amber-500 selection:text-white">
      {/* Top Admin Switcher Bar (Visible only when an authorized user is logged in) */}
      {currentUser && (
        <div className="bg-slate-900 text-slate-200 px-4 py-2 border-b border-slate-800 text-xs flex flex-wrap items-center justify-between gap-3 sticky top-0 z-50 shadow-md">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>
              Administrator Session Active: <strong className="text-white">{currentUser.fullName}</strong> ({currentUser.role})
            </span>
          </div>

          <div className="flex items-center gap-3">
            {onGoToCMS && (
              <button
                onClick={onGoToCMS}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold rounded transition border border-slate-700"
              >
                <Settings2 className="w-3.5 h-3.5" />
                Website CMS Manager
              </button>
            )}
            <button
              onClick={onGoToPortal}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded transition shadow-sm"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Return to Admin Portal
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Main Public Navbar */}
      <PublicNavbar
        website={db.website}
        activePage={currentPage}
        onNavigate={handleNavigate}
        onOpenPortal={onGoToPortal}
        onOpenCMS={onGoToCMS}
        isLoggedInAdmin={!!currentUser}
      />

      {/* Page Body */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <PublicHome website={db.website} db={db} onNavigate={handleNavigate} />
        )}

        {currentPage === 'about' && (
          <PublicAbout website={db.website} onNavigate={handleNavigate} />
        )}

        {currentPage === 'principal-message' && (
          <PublicPrincipalMessage website={db.website} />
        )}

        {currentPage === 'faculty' && (
          <PublicFaculty website={db.website} />
        )}

        {currentPage === 'committee' && (
          <PublicCommittee website={db.website} />
        )}

        {currentPage === 'academics' && (
          <PublicAcademics website={db.website} db={db} onNavigate={handleNavigate} />
        )}

        {currentPage === 'notices' && (
          <PublicNotices website={db.website} />
        )}

        {currentPage === 'news' && (
          <PublicNews website={db.website} />
        )}

        {currentPage === 'gallery' && (
          <PublicGallery website={db.website} />
        )}

        {currentPage === 'admissions' && (
          <PublicAdmissions website={db.website} db={db} onUpdateDb={onUpdateDb} onNavigate={handleNavigate} />
        )}

        {currentPage === 'results' && (
          <PublicResults db={db} onNavigate={handleNavigate} />
        )}

        {currentPage === 'contact' && (
          <PublicContact db={db} onUpdateDb={onUpdateDb} />
        )}

        {customPage && (
          <PublicCustomPage page={customPage} db={db} onNavigate={handleNavigate} />
        )}

        {/* Fallback if route not found and not a custom page */}
        {currentPage !== 'home' &&
          currentPage !== 'about' &&
          currentPage !== 'principal-message' &&
          currentPage !== 'faculty' &&
          currentPage !== 'committee' &&
          currentPage !== 'academics' &&
          currentPage !== 'notices' &&
          currentPage !== 'news' &&
          currentPage !== 'gallery' &&
          currentPage !== 'admissions' &&
          currentPage !== 'results' &&
          currentPage !== 'contact' &&
          !customPage && (
            <div className="py-24 px-4 text-center">
              <h2 className="text-3xl font-bold text-slate-900">Page Not Found</h2>
              <p className="mt-2 text-slate-500">The requested page could not be located.</p>
              <button
                onClick={() => handleNavigate('home')}
                className="mt-6 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 font-bold text-slate-900 rounded-lg text-sm transition"
              >
                Return to Homepage
              </button>
            </div>
          )}
      </main>

      {/* Main Public Footer */}
      <PublicFooter
        website={db.website}
        onNavigate={handleNavigate}
        onOpenPortal={onGoToPortal}
        onOpenCMS={onGoToCMS}
      />
    </div>
  );
};
