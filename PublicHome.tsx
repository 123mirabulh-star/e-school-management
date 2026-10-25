import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Bell,
  ArrowRight,
  BookOpen,
  Award,
  Users,
  Calendar,
  FileText,
  Search,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  Download,
  Building,
  Clock,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Eye,
  Trophy,
  ShieldCheck
} from 'lucide-react';
import { WebsiteData } from '../../types/website';
import { AppDatabase } from '../../services/storage';
import { useLanguage } from '../../context/LanguageContext';

interface PublicHomeProps {
  website: WebsiteData;
  db: AppDatabase;
  onNavigate: (page: string, slug?: string) => void;
  onSelectNotice?: (id: string) => void;
  onSelectNews?: (id: string) => void;
  onOpenLightbox?: (imageUrl: string, caption?: string) => void;
}

export const PublicHome: React.FC<PublicHomeProps> = ({
  website,
  db,
  onNavigate,
  onSelectNotice,
  onSelectNews,
  onOpenLightbox
}) => {
  const { language, t, formatNumber, getLocalizedField } = useLanguage();
  const { settings, banners, principalMessage, about, statistics, notices, newsArticles, galleryAlbums, featuredAwards, facultyProfiles } = website;

  // Active banner slider index
  const activeBanners = (banners || []).filter(b => b.isActive).sort((a, b) => a.order - b.order);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-advance hero slider every 6 seconds
  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % activeBanners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  const handlePrevSlide = () => {
    setCurrentSlide(prev => (prev === 0 ? activeBanners.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % activeBanners.length);
  };

  // Published recent notices
  const publishedNotices = (notices || []).filter(n => n.isPublished !== false).slice(0, 5);

  // Published news articles
  const allNews = newsArticles || website.news || [];
  const publishedNews = allNews.filter(n => n.isPublished !== false).slice(0, 3);

  // Gallery preview images
  const allAlbums = galleryAlbums || [];
  const previewImages = [
    ...allAlbums.filter(a => a.isPublished !== false).flatMap(a => a.images || []),
    ...(website.gallery || [])
  ].slice(0, 6);

  const allAwards = featuredAwards || website.awards || [];

  // Live or manual counts
  const studentCount = statistics.useLiveStudentCount && db.students.length > 0
    ? db.students.filter(s => s.status === 'active').length
    : (statistics.totalStudentsManual || 1850);

  const teacherCount = statistics.useLiveTeacherCount && db.teachers.length > 0
    ? db.teachers.length
    : (statistics.totalTeachersManual || 64);

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      {/* 1. HERO SLIDER BANNER */}
      <section className="relative w-full overflow-hidden bg-slate-900 min-h-[420px] sm:min-h-[500px] lg:min-h-[560px] flex items-center">
        {activeBanners.length > 0 ? (
          activeBanners.map((slide, idx) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Background Image with Gradient Overlay */}
              <img
                src={slide.imageUrl}
                alt={slide.title}
                className="w-full h-full object-cover object-center scale-105 transition-transform duration-10000"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-950/95 via-blue-950/75 to-slate-900/60" />

              {/* Slide Content */}
              <div className="relative z-20 max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-center py-16">
                <div className="max-w-2xl space-y-4 text-white">
                  {(getLocalizedField(slide, 'subtitle', language) || slide.subtitle) && (
                    <div className="inline-flex items-center gap-2 bg-blue-500/25 border border-blue-400/40 text-blue-200 text-xs sm:text-sm font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-xs">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>{getLocalizedField(slide, 'subtitle', language) || slide.subtitle}</span>
                    </div>
                  )}

                  <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-md">
                    {getLocalizedField(slide, 'title', language) || slide.title}
                  </h2>

                  <p className="text-sm sm:text-base text-slate-200 leading-relaxed drop-shadow-sm font-normal">
                    {getLocalizedField(slide, 'description', language) || slide.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-3">
                    <button
                      onClick={() => onNavigate(slide.buttonLink || 'admissions')}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition-all hover:scale-102"
                    >
                      <span>{getLocalizedField(slide, 'buttonText', language) || slide.buttonText || (language === 'bn' ? 'বিস্তারিত দেখুন' : 'Learn More')}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onNavigate('about')}
                      className="bg-white/10 hover:bg-white/20 text-white border border-white/30 font-bold text-xs sm:text-sm px-5 py-3 rounded-xl backdrop-blur-xs flex items-center gap-2 cursor-pointer transition-all"
                    >
                      <span>{language === 'bn' ? 'ক্যাম্পাস পরিচিতি' : 'Explore Campus'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="max-w-7xl mx-auto px-4 py-20 text-white text-center">
            <h2 className="text-3xl font-extrabold">{language === 'bn' && settings.schoolNameBn ? settings.schoolNameBn : settings.schoolName}</h2>
            <p className="mt-2 text-blue-200">{language === 'bn' && settings.mottoBn ? settings.mottoBn : settings.motto}</p>
          </div>
        )}

        {/* Carousel Arrow Controls */}
        {activeBanners.length > 1 && (
          <>
            <button
              onClick={handlePrevSlide}
              className="absolute left-4 z-30 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-colors cursor-pointer border border-white/20"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNextSlide}
              className="absolute right-4 z-30 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-colors cursor-pointer border border-white/20"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Slide Indicators */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
              {activeBanners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    idx === currentSlide ? 'w-8 bg-blue-500' : 'w-2.5 bg-white/50 hover:bg-white'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* 2. QUICK ACTION CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-12 relative z-30">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <div
            onClick={() => onNavigate('admissions')}
            className="bg-white p-4 rounded-xl shadow-md border border-slate-100 hover:border-emerald-300 hover:shadow-lg transition-all cursor-pointer group text-center"
          >
            <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-800 text-xs group-hover:text-emerald-700">
              {t('nav.online_admission')}
            </h4>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {language === 'bn' ? 'ভর্তি আবেদন' : 'Apply 2026-27'}
            </span>
          </div>

          <div
            onClick={() => onNavigate('results')}
            className="bg-white p-4 rounded-xl shadow-md border border-slate-100 hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer group text-center"
          >
            <div className="w-10 h-10 mx-auto rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
              <Search className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-800 text-xs group-hover:text-blue-700">
              {language === 'bn' ? 'ফলাফল অনুসন্ধান' : 'Result Search'}
            </h4>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {language === 'bn' ? 'মার্কশিট যাচাই' : 'Verify Student Marks'}
            </span>
          </div>

          <div
            onClick={() => onNavigate('notices')}
            className="bg-white p-4 rounded-xl shadow-md border border-slate-100 hover:border-amber-300 hover:shadow-lg transition-all cursor-pointer group text-center"
          >
            <div className="w-10 h-10 mx-auto rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
              <Bell className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-800 text-xs group-hover:text-amber-700">
              {t('nav.notices')}
            </h4>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {language === 'bn' ? 'পরীক্ষা ও সার্কুলার' : 'Exam Circulars'}
            </span>
          </div>

          <div
            onClick={() => onNavigate('academics')}
            className="bg-white p-4 rounded-xl shadow-md border border-slate-100 hover:border-purple-300 hover:shadow-lg transition-all cursor-pointer group text-center"
          >
            <div className="w-10 h-10 mx-auto rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-800 text-xs group-hover:text-purple-700">
              {language === 'bn' ? 'ক্লাস রুটিন' : 'Class Routine'}
            </h4>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {language === 'bn' ? 'শিফট ও সময়সূচি' : 'Shifts & Timings'}
            </span>
          </div>

          <div
            onClick={() => onNavigate('results')}
            className="bg-white p-4 rounded-xl shadow-md border border-slate-100 hover:border-teal-300 hover:shadow-lg transition-all cursor-pointer group text-center"
          >
            <div className="w-10 h-10 mx-auto rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
              <Download className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-800 text-xs group-hover:text-teal-700">
              {language === 'bn' ? 'ডাউনলোড' : 'Downloads'}
            </h4>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {language === 'bn' ? 'সিলেবাস ও ফর্ম' : 'Syllabus & Forms'}
            </span>
          </div>

          <div
            onClick={() => onNavigate('contact')}
            className="bg-white p-4 rounded-xl shadow-md border border-slate-100 hover:border-rose-300 hover:shadow-lg transition-all cursor-pointer group text-center"
          >
            <div className="w-10 h-10 mx-auto rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
              <Phone className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-800 text-xs group-hover:text-rose-700">
              {t('nav.contact')}
            </h4>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {language === 'bn' ? 'ঠিকানা ও ফোন' : 'Location & Phone'}
            </span>
          </div>
        </div>
      </section>

      {/* 3. PRINCIPAL'S DESK & ABOUT PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Principal Card */}
          <div className="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-7 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10" />

            <div className="flex flex-col sm:flex-row items-center gap-5 pb-5 border-b border-slate-100">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-blue-100 p-1 shadow-md shrink-0 border border-blue-200">
                <img
                  src={principalMessage.photoUrl}
                  alt={getLocalizedField(principalMessage, 'name', language) || principalMessage.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>

              <div className="text-center sm:text-left">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  {t('home.principal.badge')}
                </span>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mt-1">
                  {getLocalizedField(principalMessage, 'name', language) || principalMessage.name}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {getLocalizedField(principalMessage, 'designation', language) || principalMessage.designation}
                </p>
              </div>
            </div>

            {(getLocalizedField(principalMessage, 'quote', language) || principalMessage.quote) && (
              <blockquote className="my-4 p-3 bg-slate-50 rounded-xl border-l-4 border-blue-600 text-xs italic text-slate-700 leading-relaxed font-medium">
                "{getLocalizedField(principalMessage, 'quote', language) || principalMessage.quote}"
              </blockquote>
            )}

            <p className="text-xs text-slate-600 leading-relaxed line-clamp-4">
              {getLocalizedField(principalMessage, 'content', language) || principalMessage.content || (principalMessage as any).message}
            </p>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => onNavigate('principal-message')}
                className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
              >
                <span>{t('home.principal.read_full')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] text-slate-400">
                {language === 'bn' ? 'প্রতিষ্ঠান প্রধান' : 'Head of Institution'}
              </span>
            </div>
          </div>

          {/* About Overview */}
          <div className="lg:col-span-7 space-y-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                {t('about.badge')}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
                {t('about.heading')}
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {getLocalizedField(about, 'history', language) || about.history}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-gradient-to-br from-blue-50/70 to-indigo-50/50 p-4 rounded-xl border border-blue-100 space-y-1.5">
                <div className="flex items-center gap-2 text-blue-900 font-extrabold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span>{t('about.mission.title')}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {getLocalizedField(about, 'mission', language) || about.mission}
                </p>
              </div>

              <div className="bg-gradient-to-br from-emerald-50/70 to-teal-50/50 p-4 rounded-xl border border-emerald-100 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-xs">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>{t('about.vision.title')}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {getLocalizedField(about, 'vision', language) || about.vision}
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => onNavigate('about')}
                className="bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
              >
                <span>{language === 'bn' ? 'আমাদের ইতিহাস দেখুন' : 'Discover Our Heritage'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onNavigate('faculty')}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-lg cursor-pointer transition-colors"
              >
                <span>{t('nav.about.faculty')}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. STATISTICS COUNTER BAR */}
      <section className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white py-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 text-center">
            <div className="space-y-1">
              <div className="text-2xl sm:text-4xl font-black text-blue-300 font-mono tracking-tight">
                {formatNumber(studentCount, language)}+
              </div>
              <p className="text-xs text-slate-300 font-medium uppercase tracking-wider">{t('home.stats.students')}</p>
            </div>

            <div className="space-y-1">
              <div className="text-2xl sm:text-4xl font-black text-emerald-300 font-mono tracking-tight">
                {formatNumber(teacherCount, language)}+
              </div>
              <p className="text-xs text-slate-300 font-medium uppercase tracking-wider">{t('home.stats.teachers')}</p>
            </div>

            <div className="space-y-1">
              <div className="text-2xl sm:text-4xl font-black text-amber-300 font-mono tracking-tight">
                {formatNumber(statistics.passRatePercentage, language)}%
              </div>
              <p className="text-xs text-slate-300 font-medium uppercase tracking-wider">{t('home.stats.pass_rate')}</p>
            </div>

            <div className="space-y-1">
              <div className="text-2xl sm:text-4xl font-black text-purple-300 font-mono tracking-tight">
                {formatNumber(statistics.totalClassrooms, language)}+
              </div>
              <p className="text-xs text-slate-300 font-medium uppercase tracking-wider">{language === 'bn' ? 'আধুনিক ক্লাসরুম' : 'Smart Classrooms'}</p>
            </div>

            <div className="space-y-1">
              <div className="text-2xl sm:text-4xl font-black text-cyan-300 font-mono tracking-tight">
                {formatNumber(statistics.yearsOfExcellence, language)}
              </div>
              <p className="text-xs text-slate-300 font-medium uppercase tracking-wider">{t('home.stats.established')}</p>
            </div>

            <div className="space-y-1">
              <div className="text-2xl sm:text-4xl font-black text-rose-300 font-mono tracking-tight">
                {formatNumber(statistics.clubsAndActivities, language)}+
              </div>
              <p className="text-xs text-slate-300 font-medium uppercase tracking-wider">{language === 'bn' ? 'ক্লাব ও সহশিক্ষা কার্যক্রম' : 'Clubs & Activities'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. NOTICE BOARD & ANNOUNCEMENTS PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 sm:p-6 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-600" />
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                  {t('home.notices.heading')}
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {t('home.notices.subheading')}
              </p>
            </div>

            <button
              onClick={() => onNavigate('notices')}
              className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span>{t('home.notices.view_all')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {publishedNotices.map(notice => (
              <div
                key={notice.id}
                className="p-4 sm:p-5 hover:bg-blue-50/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 max-w-3xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-blue-100 text-blue-800">
                      {getLocalizedField(notice, 'category', language) || notice.category}
                    </span>
                    {notice.isPinned && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 flex items-center gap-0.5">
                        ★ {t('home.notices.pinned')}
                      </span>
                    )}
                    <span className="text-[11px] text-slate-400 font-mono">
                      {language === 'bn' ? 'প্রকাশ:' : 'Published:'} {formatNumber(notice.publishDate, language)}
                    </span>
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    {getLocalizedField(notice, 'title', language) || notice.title}
                  </h4>

                  <p className="text-xs text-slate-500 line-clamp-2">
                    {getLocalizedField(notice, 'content', language) || notice.content}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onNavigate('notices')}
                    className="text-xs text-blue-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>{language === 'bn' ? 'বিস্তারিত দেখুন' : 'Read Details'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CAMPUS FACILITIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
            {language === 'bn' ? 'আধুনিক পরিকাঠামো' : 'Modern Infrastructure'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('about.facilities.title')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {language === 'bn'
              ? 'বিজ্ঞান, প্রযুক্তি, সাংস্কৃতিক সৃজনশীলতা ও খেলাধুলার জন্য প্রস্তুত সুবিশাল ক্যাম্পাস।'
              : 'Designed to stimulate innovation, athletic vigor, and cultural creativity in a secure campus environment.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {about.facilities.map(facility => (
            <div
              key={facility.id}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group hover:shadow-lg transition-all"
            >
              <div className="h-44 overflow-hidden relative">
                <img
                  src={facility.imageUrl}
                  alt={getLocalizedField(facility, 'title', language) || facility.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <h4 className="absolute bottom-3 left-3 right-3 text-white font-bold text-sm drop-shadow-md">
                  {getLocalizedField(facility, 'title', language) || facility.title}
                </h4>
              </div>

              <div className="p-4 space-y-2">
                <p className="text-xs text-slate-600 leading-relaxed">
                  {getLocalizedField(facility, 'description', language) || facility.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. LATEST NEWS & EVENTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              {t('home.news.badge')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">
              {t('home.news.heading')}
            </h2>
          </div>

          <button
            onClick={() => onNavigate('news')}
            className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
          >
            <span>{t('home.news.view_all')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {publishedNews.map(item => (
            <div
              key={item.id}
              onClick={() => onNavigate('news')}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group hover:shadow-md transition-all cursor-pointer flex flex-col"
            >
              <div className="h-44 overflow-hidden relative shrink-0">
                <img
                  src={item.imageUrl}
                  alt={getLocalizedField(item, 'title', language) || item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className={`absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider text-white shadow-sm ${
                  item.type === 'event' ? 'bg-purple-600' : 'bg-blue-600'
                }`}>
                  {item.type === 'event' ? (language === 'bn' ? 'ইভেন্ট' : 'Event') : (language === 'bn' ? 'সংবাদ' : 'News')}
                </span>
                <span className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded">
                  {formatNumber(item.date, language)}
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-2">
                    {getLocalizedField(item, 'title', language) || item.title}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-3">
                    {getLocalizedField(item, 'summary', language) || item.summary}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-blue-700">
                  <span>{t('home.news.read_more')}</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. STUDENT AWARDS & WALL OF FAME */}
      <section className="bg-slate-50 py-12 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-8 space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              {t('home.awards.badge')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t('home.awards.heading')}
            </h2>
            <p className="text-xs text-slate-500">
              {language === 'bn' ? 'অলিম্পিয়াড বিজয়ী, জাতীয় তার্কিক ও মেধা তালিকায় স্থান পাওয়া কৃতি শিক্ষার্থীদের সম্মাননা।' : 'Honoring our Olympiad champions, national debaters, and GPA-5 board toppers.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {allAwards.map(award => (
              <div
                key={award.id}
                className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-start gap-4 hover:shadow-md transition-shadow"
              >
                <div className="w-16 h-16 rounded-xl bg-amber-100 p-0.5 shrink-0 overflow-hidden border border-amber-200">
                  {award.photoUrl ? (
                    <img
                      src={award.photoUrl}
                      alt={getLocalizedField(award, 'studentName', language) || award.studentName}
                      className="w-full h-full object-cover rounded-[10px]"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-amber-800 font-bold">
                      <Trophy className="w-6 h-6" />
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] bg-amber-50 text-amber-800 px-1.5 py-0.2 rounded font-bold">
                      {formatNumber(award.year, language)}
                    </span>
                    <span className="text-[11px] text-slate-500">{formatNumber(award.classGrade, language)}</span>
                  </div>

                  <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                    {getLocalizedField(award, 'studentName', language) || award.studentName}
                  </h4>
                  <p className="text-xs font-semibold text-blue-700">
                    {getLocalizedField(award, 'awardTitle', language) || award.awardTitle}
                  </p>
                  <p className="text-[11px] text-slate-500 line-clamp-2">
                    {getLocalizedField(award, 'description', language) || award.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. PHOTO GALLERY PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">
              {t('home.gallery.badge')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">
              {t('home.gallery.heading')}
            </h2>
          </div>

          <button
            onClick={() => onNavigate('gallery')}
            className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
          >
            <span>{t('home.gallery.view_all')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {previewImages.map(img => (
            <div
              key={img.id}
              onClick={() => onOpenLightbox ? onOpenLightbox(img.url || img.imageUrl || '', img.caption) : onNavigate('gallery')}
              className="h-32 sm:h-36 rounded-xl overflow-hidden relative group cursor-pointer shadow-xs border border-slate-200"
            >
              <img
                src={img.url || img.imageUrl}
                alt={img.caption}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-blue-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2 text-center">
                <Eye className="w-5 h-5 text-white" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 10. ADMISSIONS CALLOUT BANNER */}
      {settings.showAdmissionBanner && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 rounded-2xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-60 h-60 bg-blue-500/20 rounded-full blur-3xl" />

            <div className="space-y-2 max-w-2xl text-center md:text-left relative z-10">
              <span className="bg-emerald-500/25 border border-emerald-400/40 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5" />
                {t('home.hero.admissions_open')} {formatNumber('2026-2027', language)}
              </span>
              <h3 className="text-xl sm:text-3xl font-black text-white tracking-tight">
                {t('home.cta.heading')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-200">
                {getLocalizedField(settings, 'admissionBannerText', language) || settings.admissionBannerText || t('home.cta.subheading')}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 relative z-10">
              <button
                onClick={() => onNavigate('admissions')}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs sm:text-sm font-black px-6 py-3 rounded-xl shadow-lg transition-transform hover:scale-103 cursor-pointer"
              >
                {t('home.cta.apply_btn')}
              </button>
              <button
                onClick={() => onNavigate('contact')}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/30 text-xs sm:text-sm font-bold px-5 py-3 rounded-xl cursor-pointer"
              >
                {t('home.cta.contact_btn')}
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
