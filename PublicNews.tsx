import React, { useState } from 'react';
import { MapPin, ArrowRight, X } from 'lucide-react';
import { WebsiteData, WebsiteNewsArticle } from '../../types/website';
import { useLanguage } from '../../context/LanguageContext';
import { t, formatNumber, getLocalizedField } from '../../services/i18n';

interface PublicNewsProps {
  website: WebsiteData;
}

export const PublicNews: React.FC<PublicNewsProps> = ({ website }) => {
  const { language } = useLanguage();
  const newsArticles = website.newsArticles || website.news || [];
  const [filterType, setFilterType] = useState<'all' | 'news' | 'event'>('all');
  const [activeArticle, setActiveArticle] = useState<WebsiteNewsArticle | null>(null);

  const filteredNews = newsArticles
    .filter(n => n.isPublished !== false)
    .filter(n => filterType === 'all' || n.type === filterType)
    .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());

  const totalPublished = newsArticles.filter(n => n.isPublished !== false).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
          {t('news.badge', language)}
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {t('news.heading', language)}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          {t('news.subheading', language)}
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex justify-center gap-2">
        <button
          onClick={() => setFilterType('all')}
          className={`text-xs px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
            filterType === 'all'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          {language === 'bn'
            ? `সকল সংবাদ ও ইভেন্ট (${formatNumber(totalPublished, 'bn')})`
            : `All Stories (${totalPublished})`}
        </button>
        <button
          onClick={() => setFilterType('news')}
          className={`text-xs px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
            filterType === 'news'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          {language === 'bn' ? 'ক্যাম্পাস সংবাদ' : 'Campus News'}
        </button>
        <button
          onClick={() => setFilterType('event')}
          className={`text-xs px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
            filterType === 'event'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          {language === 'bn' ? 'আসন্ন অনুষ্ঠানমালা' : 'Upcoming Events'}
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNews.map(item => {
          const title = getLocalizedField(item, 'title', language);
          const summary = getLocalizedField(item, 'summary', language);
          const location = getLocalizedField(item, 'eventLocation', language);
          return (
            <div
              key={item.id}
              onClick={() => setActiveArticle(item)}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col group hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="h-48 overflow-hidden relative">
                <img
                  src={item.imageUrl}
                  alt={title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className={`absolute top-3 left-3 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider text-white shadow-md ${
                  item.type === 'event' ? 'bg-purple-600' : 'bg-blue-600'
                }`}>
                  {item.type === 'event'
                    ? (language === 'bn' ? 'ইভেন্ট' : 'Event')
                    : (language === 'bn' ? 'সংবাদ' : 'News')}
                </span>
                <span className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[11px] font-mono px-2 py-0.5 rounded">
                  {formatNumber(item.date, language)}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  {location && (
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      <span>{location}</span>
                    </div>
                  )}
                  <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-2 leading-snug">
                    {title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                    {summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-700">
                  <span>{t('home.news.read_more', language)}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Article Detail Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                  {activeArticle.type === 'event'
                    ? (language === 'bn' ? 'ইভেন্ট' : 'Event')
                    : (language === 'bn' ? 'সংবাদ' : 'News')}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {formatNumber(activeArticle.date, language)}
                </span>
              </div>
              <button
                onClick={() => setActiveArticle(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="h-60 rounded-xl overflow-hidden">
              <img
                src={activeArticle.imageUrl}
                alt={getLocalizedField(activeArticle, 'title', language)}
                className="w-full h-full object-cover"
              />
            </div>

            <h3 className="text-lg font-black text-slate-900">
              {getLocalizedField(activeArticle, 'title', language)}
            </h3>

            {activeArticle.eventLocation && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <MapPin className="w-4 h-4 text-rose-500" />
                <span>
                  {t('news.location', language)}: {getLocalizedField(activeArticle, 'eventLocation', language)}
                </span>
              </div>
            )}

            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line space-y-3">
              {getLocalizedField(activeArticle, 'content', language)}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setActiveArticle(null)}
                className="px-5 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                {language === 'bn' ? 'বন্ধ করুন' : 'Close Story'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
