import React, { useState } from 'react';
import { Eye, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { WebsiteData } from '../../types/website';
import { useLanguage } from '../../context/LanguageContext';
import { t, formatNumber, getLocalizedField } from '../../services/i18n';

interface PublicGalleryProps {
  website: WebsiteData;
}

export const PublicGallery: React.FC<PublicGalleryProps> = ({ website }) => {
  const { language } = useLanguage();
  const galleryAlbums = website.galleryAlbums || [];
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);

  // Flatten all images from published albums or direct gallery items
  const directImages = website.gallery || [];
  const albumImages = galleryAlbums
    .filter(a => a.isPublished !== false)
    .flatMap(a => a.images || []);

  const allImages = [...albumImages, ...directImages]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const categories = Array.from(new Set(allImages.map(img => img.category))).filter(Boolean);

  const getCategoryLabel = (cat: string) => {
    if (language !== 'bn') return cat;
    const catMap: Record<string, string> = {
      Campus: 'ক্যাম্পাস',
      Events: 'ইভেন্ট ও উৎসব',
      Academic: 'শিক্ষা ও ল্যাব',
      Sports: 'খেলাধুলা ও অ্যাথলেটিকস',
      Cultural: 'সাংস্কৃতিক অনুষ্ঠান',
      Awards: 'পুরস্কার ও সম্মাননা'
    };
    return catMap[cat] || cat;
  };

  const filteredImages = allImages.filter(img =>
    selectedCategory === 'all' || img.category === selectedCategory
  );

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeLightboxIndex === null) return;
    setActiveLightboxIndex(prev => (prev === 0 ? filteredImages.length - 1 : (prev ?? 0) - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeLightboxIndex === null) return;
    setActiveLightboxIndex(prev => ((prev ?? 0) + 1) % filteredImages.length);
  };

  const currentLightboxImage = activeLightboxIndex !== null ? filteredImages[activeLightboxIndex] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
          {t('gallery.badge', language)}
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {t('gallery.heading', language)}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          {t('gallery.subheading', language)}
        </p>
      </div>

      {/* Category Filter Bar */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`text-xs px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          {language === 'bn'
            ? `সকল ছবি (${formatNumber(allImages.length, 'bn')})`
            : `All Photos (${allImages.length})`}
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`text-xs px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {getCategoryLabel(cat)}
          </button>
        ))}
      </div>

      {/* Images Masonry / Grid */}
      {filteredImages.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
          {t('gallery.empty', language)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredImages.map((img, idx) => {
            const caption = getLocalizedField(img, 'caption', language);
            return (
              <div
                key={img.id}
                onClick={() => setActiveLightboxIndex(idx)}
                className="h-52 sm:h-60 rounded-2xl overflow-hidden relative group cursor-pointer shadow-sm border border-slate-200"
              >
                <img
                  src={img.url || img.imageUrl}
                  alt={caption}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3.5 text-white">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">
                    {getCategoryLabel(img.category)}
                  </span>
                  <p className="text-xs font-semibold line-clamp-2">
                    {caption}
                  </p>
                  <div className="mt-2 flex items-center gap-1 text-[11px] text-blue-200">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'সম্পূর্ণ ছবি দেখতে ক্লিক করুন' : 'Click to view full photo'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full-screen Lightbox Modal */}
      {currentLightboxImage && activeLightboxIndex !== null && (
        <div
          onClick={() => setActiveLightboxIndex(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
        >
          <button
            onClick={() => setActiveLightboxIndex(null)}
            className="absolute top-5 right-5 text-white/80 hover:text-white p-2 rounded-full bg-black/40 border border-white/20 z-50 cursor-pointer"
            aria-label="Close Lightbox"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-3 rounded-full bg-black/50 border border-white/20 z-50 cursor-pointer transition-all hover:scale-110"
            aria-label="Previous Image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-3 rounded-full bg-black/50 border border-white/20 z-50 cursor-pointer transition-all hover:scale-110"
            aria-label="Next Image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div
            onClick={e => e.stopPropagation()}
            className="max-w-4xl max-h-[85vh] w-full flex flex-col items-center justify-center space-y-3"
          >
            <img
              src={currentLightboxImage.url || currentLightboxImage.imageUrl}
              alt={getLocalizedField(currentLightboxImage, 'caption', language)}
              className="max-h-[75vh] w-auto max-w-full object-contain rounded-xl shadow-2xl border border-white/10"
            />
            <div className="text-center text-white space-y-0.5">
              <span className="text-[11px] uppercase tracking-wider text-blue-400 font-bold">
                {getCategoryLabel(currentLightboxImage.category)} • {formatNumber(activeLightboxIndex + 1, language)} / {formatNumber(filteredImages.length, language)}
              </span>
              <p className="text-sm font-semibold">
                {getLocalizedField(currentLightboxImage, 'caption', language)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
