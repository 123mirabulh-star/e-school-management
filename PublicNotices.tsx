import React, { useState } from 'react';
import { Search, Download, Calendar, X, FileText } from 'lucide-react';
import { WebsiteData, WebsiteNotice } from '../../types/website';
import { useLanguage } from '../../context/LanguageContext';
import { t, formatNumber, getLocalizedField } from '../../services/i18n';

interface PublicNoticesProps {
  website: WebsiteData;
}

export const PublicNotices: React.FC<PublicNoticesProps> = ({ website }) => {
  const { language } = useLanguage();
  const { notices, settings } = website;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeNoticeModal, setActiveNoticeModal] = useState<WebsiteNotice | null>(null);

  const categories = ['Academic', 'Exam', 'Admission', 'Administrative', 'General'];

  const getCategoryLabel = (cat: string) => {
    if (language !== 'bn') return cat;
    const catMap: Record<string, string> = {
      Academic: 'শিক্ষা সংক্রান্ত',
      Exam: 'পরীক্ষা',
      Admission: 'ভর্তি',
      Administrative: 'প্রশাসনিক',
      General: 'সাধারণ'
    };
    return catMap[cat] || cat;
  };

  const filteredNotices = notices
    .filter(n => n.isPublished)
    .sort((a, b) => {
      // Pinned notices first, then date descending
      if (a.isPinned && !b.isPinned) return -1;
      const dateB = new Date(b.publishDate || b.date || 0).getTime();
      const dateA = new Date(a.publishDate || a.date || 0).getTime();
      return dateB - dateA;
    })
    .filter(n => {
      const title = getLocalizedField(n, 'title', language);
      const content = getLocalizedField(n, 'content', language);
      const matchesSearch =
        title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || n.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          {t('notices.badge', language)}
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {t('notices.heading', language)}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          {t('notices.subheading', language)}
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t('notices.search_placeholder', language)}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 focus:bg-white font-medium"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`text-xs px-3 py-1.5 rounded-lg font-bold shrink-0 transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t('notices.all_notices', language)}
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3 py-1.5 rounded-lg font-bold shrink-0 transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {getCategoryLabel(cat)}
            </button>
          ))}
        </div>
      </div>

      {/* Notices List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 divide-y divide-slate-100 overflow-hidden">
        {filteredNotices.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            {language === 'bn' ? 'কোনো নোটিশ পাওয়া যায়নি।' : 'No notices found matching your criteria.'}
          </div>
        ) : (
          filteredNotices.map(notice => {
            const title = getLocalizedField(notice, 'title', language);
            const content = getLocalizedField(notice, 'content', language);
            return (
              <div
                key={notice.id}
                className={`p-5 sm:p-6 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-blue-50/40 ${
                  notice.isPinned ? 'bg-amber-50/30' : ''
                }`}
              >
                <div className="space-y-1.5 max-w-3xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      notice.category === 'Exam'
                        ? 'bg-red-100 text-red-800'
                        : notice.category === 'Admission'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {getCategoryLabel(notice.category)}
                    </span>

                    {notice.isPinned && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                        {language === 'bn' ? '★ গুরুত্বপূর্ণ নোটিশ' : '★ Pinned Circular'}
                      </span>
                    )}

                    <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {t('notices.published_on', language)}: {formatNumber(notice.publishDate || notice.date, language)}
                    </span>
                  </div>

                  <h3
                    onClick={() => setActiveNoticeModal(notice)}
                    className="font-extrabold text-slate-900 text-sm sm:text-base hover:text-blue-700 cursor-pointer transition-colors"
                  >
                    {title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {content}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {(notice.fileUrl || (notice.pdfUrl && notice.pdfUrl !== '#')) && (
                    <a
                      href={notice.fileUrl || notice.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{t('home.notices.download_pdf', language)}</span>
                    </a>
                  )}
                  <button
                    onClick={() => setActiveNoticeModal(notice)}
                    className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    {t('notices.view_details', language)}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Notice Detail Modal */}
      {activeNoticeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded">
                  {getCategoryLabel(activeNoticeModal.category)} {language === 'bn' ? 'সার্কুলার' : 'Circular'}
                </span>
                <span className="text-xs text-slate-400 font-mono ml-2">
                  {t('notices.published_on', language)}: {formatNumber(activeNoticeModal.publishDate || activeNoticeModal.date, language)}
                </span>
              </div>
              <button
                onClick={() => setActiveNoticeModal(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-lg font-extrabold text-slate-900 leading-snug">
              {getLocalizedField(activeNoticeModal, 'title', language)}
            </h3>

            <div className="p-4 bg-slate-50 rounded-xl text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed">
              {getLocalizedField(activeNoticeModal, 'content', language)}
            </div>

            {(activeNoticeModal.fileUrl || (activeNoticeModal.pdfUrl && activeNoticeModal.pdfUrl !== '#')) && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                  <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate">{t('notices.attachment', language)}</span>
                </div>
                <a
                  href={activeNoticeModal.fileUrl || activeNoticeModal.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{t('notices.download_attachment', language)}</span>
                </a>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-400">
              <span>{getLocalizedField(settings, 'schoolName', language)}</span>
              <button
                onClick={() => setActiveNoticeModal(null)}
                className="px-4 py-2 bg-slate-900 text-white font-bold rounded-lg cursor-pointer"
              >
                {t('notices.close', language)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
