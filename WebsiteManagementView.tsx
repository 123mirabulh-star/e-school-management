import React, { useState } from 'react';
import { AppDatabase } from '../../services/storage';
import {
  WebsiteData,
  WebsiteBanner,
  WebsiteNotice,
  WebsiteNewsArticle,
  WebsiteFacultyProfile,
  WebsiteCommitteeMember,
  WebsiteGalleryItem,
  WebsiteDownloadItem,
  WebsiteCustomPage,
  WebsitePageSection,
  WebsitePageSectionItem,
  WebsiteFeaturedAward,
  WebsiteFacility,
  WebsiteHistoryMilestone,
  WebsiteNavigationItem,
  WebsiteNavigationDropdownItem,
} from '../../types';
import { INITIAL_WEBSITE_NAVIGATION } from '../../data/initialWebsiteData';
import {
  Globe,
  LayoutTemplate,
  Sliders,
  UserCheck,
  Building2,
  Users,
  Award,
  Bell,
  Newspaper,
  Image as ImageIcon,
  Download,
  FileCode2,
  Inbox,
  Plus,
  Trash2,
  Edit,
  Save,
  CheckCircle2,
  ExternalLink,
  Eye,
  RefreshCw,
  Search,
  Check,
  X,
  FileText,
  Mail,
  Phone,
  Calendar,
  AlertTriangle,
  MoveUp,
  MoveDown,
  Sparkles,
  Target,
  Trophy,
  ShieldCheck,
  MapPin,
  Clock,
  Layers,
  Menu,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Compass,
  Link as LinkIcon,
} from 'lucide-react';
import { DeviceFileUpload } from '../common/DeviceFileUpload';
import { useLanguage } from '../../context/LanguageContext';

interface WebsiteManagementViewProps {
  db: AppDatabase;
  onUpdateDb: (updated: AppDatabase) => void;
  onViewLiveSite: () => void;
}

type CMSTab =
  | 'overview'
  | 'settings'
  | 'navigation'
  | 'banners'
  | 'principal'
  | 'about'
  | 'faculty'
  | 'committee'
  | 'notices'
  | 'news'
  | 'awards'
  | 'gallery'
  | 'downloads'
  | 'pages'
  | 'inquiries';

export const WebsiteManagementView: React.FC<WebsiteManagementViewProps> = ({
  db,
  onUpdateDb,
  onViewLiveSite,
}) => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<CMSTab>('overview');
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // In-app deletion confirmation modal state (replaces window.confirm which fails silently in iFrames)
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const requestConfirmDelete = (title: string, message: string, onConfirm: () => void) => {
    setDeleteConfirm({ isOpen: true, title, message, onConfirm });
  };

  // Normalize website object ensuring all collections exist
  const website: WebsiteData = {
    settings: {
      schoolName: db.website?.settings?.schoolName || db.schoolSettings?.nameEn || 'E-Biddalay Model High School & College',
      schoolNameBn: db.website?.settings?.schoolNameBn || '',
      shortName: db.website?.settings?.shortName || 'E-Biddalay',
      shortNameBn: db.website?.settings?.shortNameBn || '',
      motto: db.website?.settings?.motto || 'Knowledge, Character, Innovation, and Service',
      mottoBn: db.website?.settings?.mottoBn || '',
      logoUrl: db.website?.settings?.logoUrl || db.schoolSettings?.logoUrl || '',
      faviconUrl: db.website?.settings?.faviconUrl || '',
      eiin: db.website?.settings?.eiin || db.schoolSettings?.eiin || '108245',
      establishedYear: db.website?.settings?.establishedYear || db.schoolSettings?.establishedYear || '1995',
      phone: db.website?.settings?.phone || db.schoolSettings?.phone || '+880 2 9661234, +880 1711-234567',
      admissionHelpline: db.website?.settings?.admissionHelpline || '+880 1711-234568',
      email: db.website?.settings?.email || db.schoolSettings?.email || 'info@ebiddalay-school.edu.bd',
      address: db.website?.settings?.address || db.schoolSettings?.address || 'Road 12, Dhanmondi R/A, Dhaka-1209, Bangladesh',
      addressBn: db.website?.settings?.addressBn || '',
      openingHours: db.website?.settings?.openingHours || 'Saturday - Thursday: 8:00 AM - 4:30 PM (Friday Closed)',
      officeHours: db.website?.settings?.officeHours || 'Saturday - Thursday: 9:00 AM - 4:00 PM',
      schoolDescription: db.website?.settings?.schoolDescription || '',
      footerText: db.website?.settings?.footerText || 'Committed to fostering independent thinkers, scientific innovators, and ethical global citizens through transformative modern education.',
      copyrightText: db.website?.settings?.copyrightText || '© 2026 E-Biddalay Model High School & College. All Rights Reserved.',
      admissionsOpen: db.website?.settings?.admissionsOpen !== false,
      showAdmissionBanner: db.website?.settings?.showAdmissionBanner !== false,
      admissionBannerText: db.website?.settings?.admissionBannerText || 'Admissions Open for Academic Session 2026-2027. Apply online now!',
      showEmergencyNotice: !!db.website?.settings?.showEmergencyNotice,
      emergencyNotice: db.website?.settings?.emergencyNotice || '',
      academicSession: db.website?.settings?.academicSession || db.schoolSettings?.currentAcademicYear || '2026',
      facebookUrl: db.website?.settings?.facebookUrl || db.website?.settings?.facebook || 'https://facebook.com',
      youtubeUrl: db.website?.settings?.youtubeUrl || db.website?.settings?.youtube || 'https://youtube.com',
      twitterUrl: db.website?.settings?.twitterUrl || 'https://x.com',
      instagramUrl: db.website?.settings?.instagramUrl || 'https://instagram.com',
      linkedinUrl: db.website?.settings?.linkedinUrl || 'https://linkedin.com',
      googleMapEmbedUrl: db.website?.settings?.googleMapEmbedUrl || db.website?.settings?.mapEmbedUrl || 'https://maps.google.com/maps?q=Dhanmondi%20Dhaka&t=&z=13&ie=UTF8&iwloc=&output=embed',
      isPublished: db.website?.settings?.isPublished !== false,
    },
    banners: db.website?.banners || [],
    principalMessage: {
      title: db.website?.principalMessage?.title || 'Welcome from the Principal',
      name: db.website?.principalMessage?.name || 'Prof. Dr. Mohammad Rafiqul Islam',
      designation: db.website?.principalMessage?.designation || 'Principal & Head of Institution (M.Sc, M.Ed, Ph.D)',
      qualification: db.website?.principalMessage?.qualification || 'Ph.D. in Educational Leadership (DU), M.Sc. in Physics',
      photoUrl: db.website?.principalMessage?.photoUrl || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500&auto=format&fit=crop&q=80',
      quote: db.website?.principalMessage?.quote || 'Education is not merely the transmission of facts, but the ignition of curiosity, character, and empathy in young minds.',
      content: db.website?.principalMessage?.content || db.website?.principalMessage?.message || '',
      message: db.website?.principalMessage?.message || db.website?.principalMessage?.content || '',
      isPublished: db.website?.principalMessage?.isPublished !== false,
    },
    about: {
      history: db.website?.about?.history || '',
      historyMilestones: db.website?.about?.historyMilestones || db.website?.about?.milestones || [],
      milestones: db.website?.about?.historyMilestones || db.website?.about?.milestones || [],
      mission: db.website?.about?.mission || '',
      vision: db.website?.about?.vision || '',
      objectives: db.website?.about?.objectives || [],
      facilities: db.website?.about?.facilities || [],
      achievementsSummary: db.website?.about?.achievementsSummary || '',
    },
    statistics: {
      totalStudentsManual: db.website?.statistics?.totalStudentsManual ?? db.website?.statistics?.totalStudents ?? 1850,
      totalTeachersManual: db.website?.statistics?.totalTeachersManual ?? db.website?.statistics?.totalTeachers ?? 64,
      totalClassrooms: db.website?.statistics?.totalClassrooms ?? db.website?.statistics?.classroomsAndLabs ?? 42,
      passRatePercentage: db.website?.statistics?.passRatePercentage ?? 99.4,
      yearsOfExcellence: db.website?.statistics?.yearsOfExcellence ?? 31,
      clubsAndActivities: db.website?.statistics?.clubsAndActivities ?? 18,
      useLiveStudentCount: db.website?.statistics?.useLiveStudentCount !== false,
      useLiveTeacherCount: db.website?.statistics?.useLiveTeacherCount !== false,
    },
    faculty: db.website?.faculty || db.website?.facultyProfiles || [],
    facultyProfiles: db.website?.facultyProfiles || db.website?.faculty || [],
    committee: db.website?.committee || db.website?.committeeMembers || [],
    committeeMembers: db.website?.committeeMembers || db.website?.committee || [],
    awards: db.website?.awards || db.website?.featuredAwards || [],
    featuredAwards: db.website?.featuredAwards || db.website?.awards || [],
    notices: db.website?.notices || [],
    news: db.website?.news || db.website?.newsArticles || [],
    newsArticles: db.website?.newsArticles || db.website?.news || [],
    gallery: db.website?.gallery || (db.website?.galleryAlbums ? db.website.galleryAlbums.flatMap(a => a.images || []) : []),
    galleryAlbums: db.website?.galleryAlbums || [],
    downloads: db.website?.downloads || [],
    customPages: db.website?.customPages || [],
    contactMessages: db.website?.contactMessages || [],
    admissionInquiries: db.website?.admissionInquiries || [],
    navigation: (db.website?.navigation && db.website.navigation.length > 0) ? db.website.navigation : INITIAL_WEBSITE_NAVIGATION,
  };

  const handleSaveWebsite = (updatedWebsite: WebsiteData, message = 'Changes saved successfully!') => {
    // Synchronize dual fields
    updatedWebsite.facultyProfiles = updatedWebsite.faculty;
    updatedWebsite.committeeMembers = updatedWebsite.committee;
    updatedWebsite.newsArticles = updatedWebsite.news;
    updatedWebsite.featuredAwards = updatedWebsite.awards;

    const updatedDb: AppDatabase = {
      ...db,
      website: updatedWebsite,
      schoolSettings: {
        ...db.schoolSettings,
        ...(updatedWebsite.settings.logoUrl ? { logoUrl: updatedWebsite.settings.logoUrl } : {}),
        ...(updatedWebsite.settings.schoolName ? { nameEn: updatedWebsite.settings.schoolName } : {}),
        ...(updatedWebsite.settings.phone ? { phone: updatedWebsite.settings.phone } : {}),
        ...(updatedWebsite.settings.email ? { email: updatedWebsite.settings.email } : {}),
        ...(updatedWebsite.settings.address ? { address: updatedWebsite.settings.address } : {}),
        ...(updatedWebsite.settings.eiin ? { eiin: updatedWebsite.settings.eiin } : {}),
      }
    };
    onUpdateDb(updatedDb);
    setSaveSuccess(message);
    setTimeout(() => setSaveSuccess(null), 3500);
  };

 // ----------------------------------------------------
  // 1. GENERAL SETTINGS & LOGO MANAGEMENT (FIXED & CRASH-PROOF)
  // ----------------------------------------------------
  const SettingsTab = () => {
    const [formData, setFormData] = useState(website.settings);
    const [statsData, setStatsData] = useState(website.statistics);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [logoError, setLogoError] = useState<string | null>(null);

    // Compress & resize image to prevent browser freeze and RAM overflow
    const handleDirectLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        setLogoError('অনুগ্রহ করে একটি ছবি (JPG, PNG, WebP) নির্বাচন করুন');
        return;
      }

      setUploadingLogo(true);
      setLogoError(null);

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Resize image to max 600px width/height for fast loading & zero lag
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 600;

          if (width > height && width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Convert to lightweight data URL (quality 0.82)
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
            setFormData(prev => ({ ...prev, logoUrl: compressedDataUrl }));
          }
          setUploadingLogo(false);
        };
        img.onerror = () => {
          setLogoError('ছবিটি লোড করা সম্ভব হয়নি।');
          setUploadingLogo(false);
        };
        img.src = event.target?.result as string;
      };
      reader.onerror = () => {
        setLogoError('ফাইল রিড করতে ব্যর্থ হয়েছে।');
        setUploadingLogo(false);
      };
      reader.readAsDataURL(file);
    };

    const handleSave = (e: React.FormEvent) => {
      e.preventDefault();
      handleSaveWebsite({
        ...website,
        settings: formData,
        statistics: statsData,
      }, 'School branding & general settings updated successfully!');
    };

    return (
      <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">School Branding & Global Settings</h3>
            <p className="text-xs text-slate-500">Manage official school logo, titles, contact info, social channels, and public announcements.</p>
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition shadow-sm cursor-pointer"
          >
            <Save className="w-4 h-4 text-amber-400" />
            Save All Settings
          </button>
        </div>

        {/* SECTION A: SCHOOL LOGO MANAGEMENT (STABLE & CRASH-PROOF) */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h4 className="font-extrabold text-slate-900 text-sm">Official School Logo Management</h4>
          </div>
          <p className="text-xs text-slate-500">
            Upload the official school emblem or seal from your computer/mobile device, or provide an image web URL.
            The saved logo appears in the website header, navbar, footer, and academic reports.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start pt-2">
            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-4 shadow-2xs">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Logo Image
              </label>

              <div className="space-y-3">
                <input
                  type="file"
                  id="logoFileInput"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleDirectLogoUpload}
                  className="hidden"
                />
                <div className="flex items-center gap-2 flex-wrap">
                  <label
                    htmlFor="logoFileInput"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg cursor-pointer transition flex items-center gap-2 shadow-xs"
                  >
                    <ImageIcon className="w-4 h-4" />
                    {uploadingLogo ? 'প্রসেসিং হচ্ছে...' : 'Upload From Device'}
                  </label>

                  {formData.logoUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, logoUrl: '' }))}
                      className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold rounded-lg cursor-pointer transition flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove Logo
                    </button>
                  )}
                </div>

                {logoError && (
                  <p className="text-xs font-bold text-rose-600">{logoError}</p>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    Or Enter Image URL:
                  </label>
                  <input
                    type="text"
                    value={formData.logoUrl?.startsWith('data:') ? '✅ Device Image Uploaded' : (formData.logoUrl || '')}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val.startsWith('✅')) {
                        setFormData(prev => ({ ...prev, logoUrl: val }));
                      }
                    }}
                    placeholder="https://example.com/logo.png"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-slate-50 text-slate-800 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 shadow-2xs">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Public Header Preview
              </span>
              <div className="flex items-center gap-3 p-3 bg-slate-100/60 rounded-xl border border-slate-200">
                <div className="w-14 h-14 rounded-xl bg-blue-950 p-1 flex items-center justify-center shrink-0 shadow-sm border border-blue-800 overflow-hidden">
                  {formData.logoUrl ? (
                    <img 
                      src={formData.logoUrl} 
                      alt="Logo Preview" 
                      className="w-full h-full object-contain rounded-lg"
                      onError={(e) => {
                        // Prevent infinite loop on broken image URL
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <span className="text-white font-bold text-xl">{(formData.shortName || 'E').charAt(0)}</span>
                  )}
                </div>
                <div>
                  <h5 className="font-extrabold text-sm text-slate-900 leading-tight">
                    {formData.schoolName || 'Institution Name'}
                  </h5>
                  <p className="text-[11px] text-blue-700 font-semibold italic mt-0.5">
                    {formData.motto || 'Institutional Motto'}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    EIIN: {formData.eiin || '108245'} • Est. {formData.establishedYear || '1995'}
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                Tip: Changes will be immediately reflected across both the public website and administrative records upon clicking Save.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION B: INSTITUTIONAL NAMES & MOTTO */}
        <div className="space-y-4">
          <h4 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2">
            Institutional Names & Taglines
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Full School / College Name (English) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.schoolName}
                onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Short Name / Acronym
              </label>
              <input
                type="text"
                value={formData.shortName || ''}
                onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-800"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Full School / College Name (বাংলা / Optional Bengali)
              </label>
              <input
                type="text"
                value={formData.schoolNameBn || ''}
                onChange={(e) => setFormData({ ...formData, schoolNameBn: e.target.value })}
                placeholder="যেমন: ই-বিদ্যালয় মডেল হাই স্কুল অ্যান্ড কলেজ"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-800"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Institutional Motto / Tagline (English)
              </label>
              <input
                type="text"
                value={formData.motto || ''}
                onChange={(e) => setFormData({ ...formData, motto: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Institutional Motto (বাংলা)
              </label>
              <input
                type="text"
                value={formData.mottoBn || ''}
                onChange={(e) => setFormData({ ...formData, mottoBn: e.target.value })}
                placeholder="যেমন: জ্ঞান ও নৈতিকতায় সমৃদ্ধ ভবিষ্যৎ"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                EIIN Number
              </label>
              <input
                type="text"
                value={formData.eiin || ''}
                onChange={(e) => setFormData({ ...formData, eiin: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Established Year
              </label>
              <input
                type="text"
                value={formData.establishedYear || ''}
                onChange={(e) => setFormData({ ...formData, establishedYear: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Current Academic Session
              </label>
              <input
                type="text"
                value={formData.academicSession || ''}
                onChange={(e) => setFormData({ ...formData, academicSession: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* SECTION C: CONTACT & LOCATION */}
        <div className="space-y-4">
          <h4 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2">
            Contact Information & Campus Location
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Primary Phone Number(s)
              </label>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Admission Helpline
              </label>
              <input
                type="text"
                value={formData.admissionHelpline || ''}
                onChange={(e) => setFormData({ ...formData, admissionHelpline: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Official Email
              </label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-800"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Physical Campus Address (English)
              </label>
              <input
                type="text"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Opening Hours
              </label>
              <input
                type="text"
                value={formData.openingHours || ''}
                onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-800"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Physical Campus Address (বাংলা - ঐচ্ছিক)
              </label>
              <input
                type="text"
                value={formData.addressBn || ''}
                onChange={(e) => setFormData({ ...formData, addressBn: e.target.value })}
                placeholder="যেমন: রোড ১২, ধানমন্ডি আ/এ, ঢাকা-১২০৯, বাংলাদেশ"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-800"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Google Map Embed URL (iframe embed source)
              </label>
              <input
                type="text"
                value={formData.googleMapEmbedUrl || ''}
                onChange={(e) => setFormData({ ...formData, googleMapEmbedUrl: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 font-mono text-xs"
              />
            </div>
          </div>
        </div>

        {/* SECTION D: ADMISSION STATUS & EMERGENCY NOTICE */}
        <div className="space-y-4">
          <h4 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2">
            Admissions Banner & Emergency Notice Bar
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs uppercase text-slate-700">Online Admissions Banner</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.admissionsOpen !== false}
                    onChange={(e) => setFormData({ ...formData, admissionsOpen: e.target.checked, showAdmissionBanner: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
              <textarea
                rows={2}
                value={formData.admissionBannerText || ''}
                onChange={(e) => setFormData({ ...formData, admissionBannerText: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-800"
                placeholder="Admissions Open message text"
              />
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs uppercase text-slate-700">Top Emergency / Urgent Ticker</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!formData.showEmergencyNotice}
                    onChange={(e) => setFormData({ ...formData, showEmergencyNotice: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
              </div>
              <textarea
                rows={2}
                value={formData.emergencyNotice || ''}
                onChange={(e) => setFormData({ ...formData, emergencyNotice: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-800"
                placeholder="Urgent notice or exam alert shown in top bar"
              />
            </div>
          </div>
        </div>

        {/* SECTION E: SOCIAL CHANNELS & FOOTER */}
        <div className="space-y-4">
          <h4 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2">
            Social Media Handles & Footer Text
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Facebook URL</label>
              <input
                type="text"
                value={formData.facebookUrl || ''}
                onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value, facebook: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800"
                placeholder="https://facebook.com/..."
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">YouTube Channel URL</label>
              <input
                type="text"
                value={formData.youtubeUrl || ''}
                onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value, youtube: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800"
                placeholder="https://youtube.com/..."
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">X (Twitter) URL</label>
              <input
                type="text"
                value={formData.twitterUrl || ''}
                onChange={(e) => setFormData({ ...formData, twitterUrl: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800"
                placeholder="https://x.com/..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Footer Institutional Statement</label>
              <input
                type="text"
                value={formData.footerText || ''}
                onChange={(e) => setFormData({ ...formData, footerText: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Copyright Notice</label>
              <input
                type="text"
                value={formData.copyrightText || ''}
                onChange={(e) => setFormData({ ...formData, copyrightText: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* SECTION F: STATISTICAL METRICS */}
        <div className="space-y-4">
          <h4 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2">
            Homepage Statistical Metrics
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Pass Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={statsData.passRatePercentage ?? 99.4}
                onChange={(e) => setStatsData({ ...statsData, passRatePercentage: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Years of Excellence</label>
              <input
                type="number"
                value={statsData.yearsOfExcellence ?? 31}
                onChange={(e) => setStatsData({ ...statsData, yearsOfExcellence: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Classrooms & Labs</label>
              <input
                type="number"
                value={statsData.totalClassrooms ?? 42}
                onChange={(e) => setStatsData({ ...statsData, totalClassrooms: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Clubs & Activities</label>
              <input
                type="number"
                value={statsData.clubsAndActivities ?? 18}
                onChange={(e) => setStatsData({ ...statsData, clubsAndActivities: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-200">
          <button
            type="submit"
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition shadow-md cursor-pointer"
          >
            <Save className="w-4 h-4 text-amber-400" />
            Save All Settings
          </button>
        </div>
      </form>
    );
  };

  // ----------------------------------------------------
  // NAVIGATION & MENUS MANAGEMENT
  // ----------------------------------------------------
  const NavigationTab = () => {
    const navItems = website.navigation || INITIAL_WEBSITE_NAVIGATION;
    const [editingItem, setEditingItem] = useState<Partial<WebsiteNavigationItem> | null>(null);
    const [editingDropdownParentId, setEditingDropdownParentId] = useState<string | null>(null);
    const [editingSubItem, setEditingSubItem] = useState<Partial<WebsiteNavigationDropdownItem> | null>(null);

    const systemPages = [
      { id: 'home', labelEn: 'Homepage', labelBn: 'মূলপাতা' },
      { id: 'about', labelEn: 'About Us Overview', labelBn: 'আমাদের সম্পর্কে' },
      { id: 'principal-message', labelEn: "Principal's Desk", labelBn: 'অধ্যক্ষের বাণী' },
      { id: 'faculty', labelEn: 'Faculty & Teachers Directory', labelBn: 'শিক্ষক ও কর্মচারী বৃন্দ' },
      { id: 'committee', labelEn: 'Managing Committee & Governance', labelBn: 'ম্যানেজিং কমিটি ও পরিচালনা পর্ষদ' },
      { id: 'academics', labelEn: 'Academics & Curriculum', labelBn: 'একাডেমিক কার্যক্রম' },
      { id: 'admissions', labelEn: 'Online Admission & Form', labelBn: 'অনলাইন ভর্তি' },
      { id: 'results', labelEn: 'Results & Marksheet Portal', labelBn: 'ফলাফল ও মার্কশিট' },
      { id: 'notices', labelEn: 'Notice Board', labelBn: 'নোটিশ বোর্ড' },
      { id: 'news', labelEn: 'Campus News & Events', labelBn: 'সংবাদ ও ইভেন্ট' },
      { id: 'gallery', labelEn: 'Photo Gallery & Archives', labelBn: 'ফটো গ্যালারি' },
      { id: 'contact', labelEn: 'Contact Us & Campus Map', labelBn: 'যোগাযোগ' },
    ];

    const customPages = website.customPages || [];

    const handleSaveNavItem = (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingItem?.labelEn || !editingItem?.destination) return;

      let updatedList: WebsiteNavigationItem[];
      if (editingItem.id) {
        updatedList = navItems.map(item =>
          item.id === editingItem.id ? ({ ...item, ...editingItem } as WebsiteNavigationItem) : item
        );
      } else {
        const newItem: WebsiteNavigationItem = {
          id: `nav-${Date.now()}`,
          labelEn: editingItem.labelEn,
          labelBn: editingItem.labelBn || editingItem.labelEn,
          destination: editingItem.destination,
          isExternal: editingItem.isExternal || false,
          externalUrl: editingItem.externalUrl || '',
          openInNewTab: editingItem.openInNewTab || false,
          isActive: editingItem.isActive !== false,
          order: navItems.length + 1,
          hasDropdown: editingItem.hasDropdown || false,
          dropdownItems: editingItem.dropdownItems || [],
        };
        updatedList = [...navItems, newItem];
      }

      handleSaveWebsite({ ...website, navigation: updatedList }, 'Navigation menu item saved successfully!');
      setEditingItem(null);
    };

    const handleDeleteNavItem = (id: string, label: string) => {
      requestConfirmDelete(
        'Delete Navigation Item',
        `Are you sure you want to remove "${label}" from the public navigation menu?`,
        () => {
          const updatedList = navItems.filter(item => item.id !== id);
          const reordered = updatedList.map((item, idx) => ({ ...item, order: idx + 1 }));
          handleSaveWebsite({ ...website, navigation: reordered }, 'Navigation item deleted!');
        }
      );
    };

    const handleToggleActive = (id: string) => {
      const updatedList = navItems.map(item =>
        item.id === id ? { ...item, isActive: !item.isActive } : item
      );
      handleSaveWebsite({ ...website, navigation: updatedList }, 'Navigation visibility updated!');
    };

    const handleMoveItem = (index: number, direction: 'up' | 'down') => {
      if (
        (direction === 'up' && index === 0) ||
        (direction === 'down' && index === navItems.length - 1)
      ) {
        return;
      }
      const newItems = [...navItems];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      const temp = newItems[index];
      newItems[index] = newItems[targetIndex];
      newItems[targetIndex] = temp;

      const reordered = newItems.map((item, idx) => ({ ...item, order: idx + 1 }));
      handleSaveWebsite({ ...website, navigation: reordered }, 'Menu order reordered!');
    };

    const handleResetDefaults = () => {
      requestConfirmDelete(
        'Reset Navigation to Defaults',
        'Are you sure you want to restore the default institutional navigation structure? Any custom menu items will be reset.',
        () => {
          handleSaveWebsite({ ...website, navigation: INITIAL_WEBSITE_NAVIGATION }, 'Navigation restored to defaults!');
        }
      );
    };

    // Sub-item handlers
    const handleSaveSubItem = (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingDropdownParentId || !editingSubItem?.labelEn || !editingSubItem?.destination) return;

      const parent = navItems.find(n => n.id === editingDropdownParentId);
      if (!parent) return;

      const existingSubs = parent.dropdownItems || [];
      let updatedSubs: WebsiteNavigationDropdownItem[];

      if (editingSubItem.id) {
        updatedSubs = existingSubs.map(s =>
          s.id === editingSubItem.id ? ({ ...s, ...editingSubItem } as WebsiteNavigationDropdownItem) : s
        );
      } else {
        const newSub: WebsiteNavigationDropdownItem = {
          id: `sub-${Date.now()}`,
          labelEn: editingSubItem.labelEn,
          labelBn: editingSubItem.labelBn || editingSubItem.labelEn,
          destination: editingSubItem.destination,
          isExternal: editingSubItem.isExternal || false,
          externalUrl: editingSubItem.externalUrl || '',
          openInNewTab: editingSubItem.openInNewTab || false,
          isActive: editingSubItem.isActive !== false,
          order: existingSubs.length + 1,
        };
        updatedSubs = [...existingSubs, newSub];
      }

      const updatedNav = navItems.map(item =>
        item.id === editingDropdownParentId
          ? { ...item, hasDropdown: true, dropdownItems: updatedSubs }
          : item
      );

      handleSaveWebsite({ ...website, navigation: updatedNav }, 'Dropdown sub-item saved!');
      setEditingSubItem(null);
      setEditingDropdownParentId(null);
    };

    const handleDeleteSubItem = (parentId: string, subId: string, subLabel: string) => {
      requestConfirmDelete(
        'Delete Dropdown Sub-Item',
        `Are you sure you want to remove "${subLabel}" from this dropdown?`,
        () => {
          const updatedNav = navItems.map(item => {
            if (item.id === parentId) {
              const updatedSubs = (item.dropdownItems || []).filter(s => s.id !== subId);
              return {
                ...item,
                dropdownItems: updatedSubs.map((s, idx) => ({ ...s, order: idx + 1 })),
              };
            }
            return item;
          });
          handleSaveWebsite({ ...website, navigation: updatedNav }, 'Sub-item deleted!');
        }
      );
    };

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Compass className="w-5 h-5 text-blue-600" />
              Public Website Navigation & Header Links
            </h3>
            <p className="text-xs text-slate-500">
              Customize public website navigation bars, reorder tabs, manage dropdown sub-menus, connect custom pages or external portals, and configure English & Bengali labels.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetDefaults}
              className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              Reset Defaults
            </button>
            <button
              onClick={() => setEditingItem({
                labelEn: '',
                labelBn: '',
                destination: 'home',
                isExternal: false,
                externalUrl: '',
                openInNewTab: false,
                isActive: true,
                hasDropdown: false,
                dropdownItems: [],
              })}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Navigation Item
            </button>
          </div>
        </div>

        {/* Navigation Items List */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-600">
            <span>Navigation Items ({navItems.length})</span>
            <span className="text-[11px] text-slate-500 font-normal">Drag or use arrows to set appearance order in the header menu</span>
          </div>

          <div className="divide-y divide-slate-100">
            {navItems.map((item, index) => (
              <div key={item.id} className="p-4 hover:bg-slate-50/70 transition space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center">
                      {item.order || index + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{item.labelEn}</span>
                        {item.labelBn && (
                          <span className="text-xs text-slate-500 font-medium">({item.labelBn})</span>
                        )}
                        {item.hasDropdown && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                            Dropdown ({item.dropdownItems?.length || 0})
                          </span>
                        )}
                        {item.isExternal && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 flex items-center gap-1">
                            <ExternalLink className="w-2.5 h-2.5" />
                            External
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                          {item.isExternal ? item.externalUrl : `Destination: ${item.destination}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Order buttons */}
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveItem(index, 'up')}
                      className={`p-1.5 rounded-lg border text-slate-600 transition cursor-pointer ${
                        index === 0 ? 'opacity-30 cursor-not-allowed border-slate-200' : 'hover:bg-slate-100 border-slate-200'
                      }`}
                      title="Move Up"
                    >
                      <MoveUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === navItems.length - 1}
                      onClick={() => handleMoveItem(index, 'down')}
                      className={`p-1.5 rounded-lg border text-slate-600 transition cursor-pointer ${
                        index === navItems.length - 1 ? 'opacity-30 cursor-not-allowed border-slate-200' : 'hover:bg-slate-100 border-slate-200'
                      }`}
                      title="Move Down"
                    >
                      <MoveDown className="w-3.5 h-3.5" />
                    </button>

                    {/* Active toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleActive(item.id)}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition cursor-pointer ${
                        item.isActive !== false
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {item.isActive !== false ? 'Visible' : 'Hidden'}
                    </button>

                    {/* Add sub-item button */}
                    <button
                      type="button"
                      onClick={() => {
                        setEditingDropdownParentId(item.id);
                        setEditingSubItem({
                          labelEn: '',
                          labelBn: '',
                          destination: 'about',
                          isExternal: false,
                          externalUrl: '',
                          openInNewTab: false,
                          isActive: true,
                        });
                      }}
                      className="px-2.5 py-1 text-xs font-bold rounded-lg border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 transition cursor-pointer flex items-center gap-1"
                      title="Add sub-menu item"
                    >
                      <Plus className="w-3 h-3" />
                      Sub-link
                    </button>

                    {/* Edit button */}
                    <button
                      type="button"
                      onClick={() => setEditingItem(item)}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                      title="Edit Item"
                    >
                      <Edit className="w-3.5 h-3.5 text-blue-600" />
                    </button>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteNavItem(item.id, item.labelEn)}
                      className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="Delete Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Dropdown Sub-Items list */}
                {item.hasDropdown && item.dropdownItems && item.dropdownItems.length > 0 && (
                  <div className="ml-9 pl-4 border-l-2 border-purple-200 space-y-2 mt-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700">Dropdown Sub-Links:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {item.dropdownItems.map((sub, sIdx) => (
                        <div key={sub.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                          <div>
                            <div className="font-bold text-slate-800 flex items-center gap-1.5">
                              <span>{sub.labelEn}</span>
                              {sub.labelBn && <span className="text-slate-500 font-normal">({sub.labelBn})</span>}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                              {sub.isExternal ? sub.externalUrl : sub.destination}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingDropdownParentId(item.id);
                                setEditingSubItem(sub);
                              }}
                              className="p-1 text-slate-500 hover:text-blue-600 rounded"
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSubItem(item.id, sub.id, sub.labelEn)}
                              className="p-1 text-slate-500 hover:text-rose-600 rounded"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Modal: Add/Edit Navigation Item */}
        {editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <h4 className="font-bold text-slate-900 text-sm">
                  {editingItem.id ? 'Edit Navigation Menu Item' : 'Add New Navigation Menu Item'}
                </h4>
                <button
                  onClick={() => setEditingItem(null)}
                  className="p-1 rounded text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveNavItem} className="p-5 space-y-4 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Label (English) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. About Us"
                      value={editingItem.labelEn || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, labelEn: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Label (Bengali)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. আমাদের সম্পর্কে"
                      value={editingItem.labelBn || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, labelBn: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800"
                    />
                  </div>
                </div>

                {/* External link checkbox */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isExternalToggle"
                    checked={!!editingItem.isExternal}
                    onChange={(e) => setEditingItem({ ...editingItem, isExternal: e.target.checked })}
                    className="rounded text-blue-600 w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="isExternalToggle" className="text-xs font-bold text-slate-700 cursor-pointer">
                    Link to external website or online portal
                  </label>
                </div>

                {editingItem.isExternal ? (
                  <div className="space-y-3 p-3 bg-blue-50/50 rounded-xl border border-blue-200">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        External URL <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="url"
                        required
                        placeholder="https://example.com/portal"
                        value={editingItem.externalUrl || ''}
                        onChange={(e) => setEditingItem({
                          ...editingItem,
                          externalUrl: e.target.value,
                          destination: e.target.value
                        })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 bg-white"
                      />
                    </div>
                    <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingItem.openInNewTab !== false}
                        onChange={(e) => setEditingItem({ ...editingItem, openInNewTab: e.target.checked })}
                        className="rounded text-blue-600 w-4 h-4 cursor-pointer"
                      />
                      <span>Open link in new browser tab</span>
                    </label>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Destination Page <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={editingItem.destination || 'home'}
                      onChange={(e) => setEditingItem({ ...editingItem, destination: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 bg-white"
                    >
                      <optgroup label="System Pages">
                        {systemPages.map(sp => (
                          <option key={sp.id} value={sp.id}>
                            {sp.labelEn} ({sp.labelBn})
                          </option>
                        ))}
                      </optgroup>
                      {customPages.length > 0 && (
                        <optgroup label="Custom Created Pages">
                          {customPages.map(cp => (
                            <option key={cp.id} value={cp.slug}>
                              📄 {cp.title} (/page/{cp.slug})
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  </div>
                )}

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingItem.isActive !== false}
                      onChange={(e) => setEditingItem({ ...editingItem, isActive: e.target.checked })}
                      className="rounded text-blue-600 w-4 h-4 cursor-pointer"
                    />
                    <span>Show in Navigation Bar</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-bold text-purple-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!editingItem.hasDropdown}
                      onChange={(e) => setEditingItem({ ...editingItem, hasDropdown: e.target.checked })}
                      className="rounded text-purple-600 w-4 h-4 cursor-pointer"
                    />
                    <span>Has Dropdown Menu</span>
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-sm cursor-pointer"
                  >
                    Save Navigation Item
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Add/Edit Sub-Item */}
        {editingSubItem && editingDropdownParentId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <h4 className="font-bold text-slate-900 text-sm">
                  {editingSubItem.id ? 'Edit Dropdown Sub-Item' : 'Add Dropdown Sub-Item'}
                </h4>
                <button
                  onClick={() => {
                    setEditingSubItem(null);
                    setEditingDropdownParentId(null);
                  }}
                  className="p-1 rounded text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveSubItem} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sub-Link Label (English) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Faculty Directory"
                    value={editingSubItem.labelEn || ''}
                    onChange={(e) => setEditingSubItem({ ...editingSubItem, labelEn: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sub-Link Label (Bengali)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. শিক্ষক ও কর্মচারী বৃন্দ"
                    value={editingSubItem.labelBn || ''}
                    onChange={(e) => setEditingSubItem({ ...editingSubItem, labelBn: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Destination Page <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={editingSubItem.destination || 'about'}
                    onChange={(e) => setEditingSubItem({ ...editingSubItem, destination: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 bg-white"
                  >
                    <optgroup label="System Pages">
                      {systemPages.map(sp => (
                        <option key={sp.id} value={sp.id}>
                          {sp.labelEn} ({sp.labelBn})
                        </option>
                      ))}
                    </optgroup>
                    {customPages.length > 0 && (
                      <optgroup label="Custom Created Pages">
                        {customPages.map(cp => (
                          <option key={cp.id} value={cp.slug}>
                            📄 {cp.title} (/page/{cp.slug})
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingSubItem(null);
                      setEditingDropdownParentId(null);
                    }}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition shadow-sm cursor-pointer"
                  >
                    Save Sub-Link
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ----------------------------------------------------
  // 2. HERO SLIDER & BANNER MANAGEMENT
  // ----------------------------------------------------
  const BannersTab = () => {
    const banners = website.banners || [];
    const [editingBanner, setEditingBanner] = useState<Partial<WebsiteBanner> | null>(null);

    const handleSaveBanner = (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingBanner?.title || !editingBanner?.imageUrl) return;

      let updatedList: WebsiteBanner[];
      if (editingBanner.id) {
        updatedList = banners.map(b => b.id === editingBanner.id ? { ...b, ...editingBanner } as WebsiteBanner : b);
      } else {
        const newBanner: WebsiteBanner = {
          id: `banner_${Date.now()}`,
          title: editingBanner.title || '',
          subtitle: editingBanner.subtitle || '',
          description: editingBanner.description || '',
          tag: editingBanner.tag || 'Academic Excellence',
          imageUrl: editingBanner.imageUrl || '',
          buttonText: editingBanner.buttonText || 'Learn More',
          buttonLink: editingBanner.buttonLink || 'admissions',
          order: banners.length + 1,
          isActive: editingBanner.isActive !== false,
        };
        updatedList = [...banners, newBanner];
      }

      handleSaveWebsite({ ...website, banners: updatedList }, 'Hero banner saved successfully!');
      setEditingBanner(null);
    };

    const handleDeleteBanner = (id: string) => {
      requestConfirmDelete(
        'Delete Hero Banner',
        'Are you sure you want to permanently delete this hero banner? It will no longer display on the public website homepage.',
        () => {
          const updatedList = banners.filter(b => b.id !== id);
          handleSaveWebsite({ ...website, banners: updatedList }, 'Banner removed successfully!');
        }
      );
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Hero Slider & Banner Management</h3>
            <p className="text-xs text-slate-500">Configure high-resolution hero banners appearing on the public homepage header.</p>
          </div>
          <button
            onClick={() => setEditingBanner({
              title: '',
              subtitle: '',
              description: '',
              tag: 'New Academic Session',
              imageUrl: '',
              buttonText: 'Apply for Admission',
              buttonLink: 'admissions',
              order: banners.length + 1,
              isActive: true,
            })}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-xs rounded-lg flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add New Banner
          </button>
        </div>

        {editingBanner && (
          <form onSubmit={handleSaveBanner} className="bg-white p-6 rounded-xl border-2 border-amber-400 shadow-md space-y-4">
            <h4 className="font-bold text-slate-900 text-sm">
              {editingBanner.id ? 'Edit Hero Banner' : 'Create New Hero Banner'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Headline Title <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={editingBanner.title || ''}
                  onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  placeholder="e.g. Inspiring Minds, Shaping Tomorrow"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Badge Tag</label>
                <input
                  type="text"
                  value={editingBanner.tag || ''}
                  onChange={(e) => setEditingBanner({ ...editingBanner, tag: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  placeholder="e.g. Admissions Open 2026-2027"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subtitle / Highlight</label>
                <input
                  type="text"
                  value={editingBanner.subtitle || ''}
                  onChange={(e) => setEditingBanner({ ...editingBanner, subtitle: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  placeholder="e.g. Excellence in Secondary & Higher Secondary Education"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Description Paragraph</label>
                <textarea
                  rows={3}
                  value={editingBanner.description || ''}
                  onChange={(e) => setEditingBanner({ ...editingBanner, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  placeholder="Detailed welcome or announcement text"
                />
              </div>

              <div className="md:col-span-2">
                <DeviceFileUpload
                  label="Hero Banner Graphic / Background Image"
                  fileType="image"
                  required
                  value={editingBanner.imageUrl || ''}
                  onChange={(url) => setEditingBanner({ ...editingBanner, imageUrl: url })}
                  helperText="Upload banner photograph (JPG, PNG, WebP) from device or enter image link"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Call to Action Button Text</label>
                <input
                  type="text"
                  value={editingBanner.buttonText || ''}
                  onChange={(e) => setEditingBanner({ ...editingBanner, buttonText: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Button Destination Link</label>
                <input
                  type="text"
                  value={editingBanner.buttonLink || ''}
                  onChange={(e) => setEditingBanner({ ...editingBanner, buttonLink: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  placeholder="admissions, about, results, or external URL"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingBanner.isActive !== false}
                    onChange={(e) => setEditingBanner({ ...editingBanner, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  Banner is Active & Visible
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingBanner(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-slate-900 text-white font-bold text-xs rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                Save Banner
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {banners.map((banner) => (
            <div key={banner.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col group">
              <div className="h-44 bg-slate-800 relative overflow-hidden">
                <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 bg-slate-950/50 p-4 flex flex-col justify-between text-white">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-amber-500 text-slate-950 rounded">
                      {banner.tag || 'Banner'}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${banner.isActive ? 'bg-emerald-500/80 text-white' : 'bg-rose-500/80 text-white'}`}>
                      {banner.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-base leading-tight drop-shadow">{banner.title}</h4>
                    <p className="text-xs text-slate-200 line-clamp-1 mt-0.5 drop-shadow">{banner.subtitle}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 flex items-center justify-between text-xs border-t border-slate-100">
                <div className="flex items-center gap-2 text-slate-600">
                  <span className="font-semibold">{banner.buttonText}</span>
                  <span>→</span>
                  <span className="font-mono text-slate-500">{banner.buttonLink}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setEditingBanner(banner)}
                    className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-slate-100 rounded transition cursor-pointer"
                    title="Edit Banner"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteBanner(banner.id)}
                    className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                    title="Delete Banner"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ----------------------------------------------------
  // 3. PRINCIPAL'S DESK & MESSAGE
  // ----------------------------------------------------
  const PrincipalTab = () => {
    const [formData, setFormData] = useState({
      ...website.principalMessage,
      content: website.principalMessage.content || website.principalMessage.message || '',
    });

    const handleSave = (e: React.FormEvent) => {
      e.preventDefault();
      handleSaveWebsite({
        ...website,
        principalMessage: {
          ...formData,
          content: formData.content,
          message: formData.content,
        }
      }, "Principal's Desk and Welcome Message saved successfully!");
    };

    return (
      <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Principal&apos;s Secretariat & Welcome Address</h3>
            <p className="text-xs text-slate-500">Edit the principal&apos;s formal portrait, credentials, quote, and official welcome speech.</p>
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition cursor-pointer"
          >
            <Save className="w-4 h-4 text-amber-400" />
            Save Principal Details
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Principal&apos;s Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Official Title / Designation
            </label>
            <input
              type="text"
              value={formData.designation || 'Principal'}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-800"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Academic Qualifications & Honors
            </label>
            <input
              type="text"
              value={formData.qualification || ''}
              onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-800"
              placeholder="e.g. Ph.D. in Educational Leadership (DU), M.Sc. in Physics, B.Ed."
            />
          </div>

          <div className="md:col-span-2">
            <DeviceFileUpload
              label="Principal's Formal Portrait Photograph"
              fileType="image"
              value={formData.photoUrl || ''}
              onChange={(url) => setFormData({ ...formData, photoUrl: url })}
              onClear={() => setFormData({ ...formData, photoUrl: '' })}
              helperText="Upload official formal photo (JPG, PNG, WebP) from device or enter image link"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Featured Inspirational Quote
            </label>
            <input
              type="text"
              value={formData.quote || ''}
              onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 font-serif"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Official Welcome Speech / Message Content <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={8}
              value={formData.content || ''}
              onChange={(e) => setFormData({ ...formData, content: e.target.value, message: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-800 leading-relaxed font-sans"
            />
          </div>
        </div>
      </form>
    );
  };

  // ----------------------------------------------------
  // 4. ABOUT US & INSTITUTIONAL PROFILE
  // ----------------------------------------------------
  const AboutTab = () => {
    const [history, setHistory] = useState(website.about.history || '');
    const [mission, setMission] = useState(website.about.mission || '');
    const [vision, setVision] = useState(website.about.vision || '');
    const [achievements, setAchievements] = useState(website.about.achievementsSummary || '');
    const [milestones, setMilestones] = useState<WebsiteHistoryMilestone[]>(website.about.historyMilestones || website.about.milestones || []);
    const [facilities, setFacilities] = useState<WebsiteFacility[]>(website.about.facilities || []);
    const [objectives, setObjectives] = useState<string[]>(website.about.objectives || []);

    const [editingFacility, setEditingFacility] = useState<Partial<WebsiteFacility> | null>(null);
    const [editingMilestone, setEditingMilestone] = useState<Partial<WebsiteHistoryMilestone> | null>(null);
    const [newObjective, setNewObjective] = useState('');

    const handleSaveAbout = (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      handleSaveWebsite({
        ...website,
        about: {
          ...website.about,
          history,
          mission,
          vision,
          achievementsSummary: achievements,
          historyMilestones: milestones,
          milestones,
          facilities,
          objectives,
        }
      }, 'About Us section and facilities updated!');
    };

    const handleSaveFacility = (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingFacility?.title) return;
      let updated: WebsiteFacility[];
      if (editingFacility.id) {
        updated = facilities.map(f => f.id === editingFacility.id ? { ...f, ...editingFacility } as WebsiteFacility : f);
      } else {
        const newFac: WebsiteFacility = {
          id: `fac_${Date.now()}`,
          title: editingFacility.title || '',
          description: editingFacility.description || '',
          imageUrl: editingFacility.imageUrl || '',
          order: facilities.length + 1,
        };
        updated = [...facilities, newFac];
      }
      setFacilities(updated);
      setEditingFacility(null);
      handleSaveWebsite({
        ...website,
        about: { ...website.about, facilities: updated }
      }, 'Facility updated!');
    };

    const handleDeleteFacility = (id: string) => {
      requestConfirmDelete(
        'Delete Campus Facility',
        'Are you sure you want to delete this facility record from the About Us section?',
        () => {
          const updated = facilities.filter(f => f.id !== id);
          setFacilities(updated);
          handleSaveWebsite({ ...website, about: { ...website.about, facilities: updated } }, 'Facility removed!');
        }
      );
    };

    const handleSaveMilestone = (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingMilestone?.year || !editingMilestone?.title) return;
      const newM: WebsiteHistoryMilestone = {
        year: editingMilestone.year || '',
        title: editingMilestone.title || '',
        description: editingMilestone.description || '',
      };
      const updated = [...milestones, newM];
      setMilestones(updated);
      setEditingMilestone(null);
      handleSaveWebsite({ ...website, about: { ...website.about, historyMilestones: updated, milestones: updated } }, 'Milestone added!');
    };

    const handleDeleteMilestone = (idx: number) => {
      const updated = milestones.filter((_, i) => i !== idx);
      setMilestones(updated);
      handleSaveWebsite({ ...website, about: { ...website.about, historyMilestones: updated, milestones: updated } }, 'Milestone removed!');
    };

    const handleAddObjective = () => {
      if (!newObjective.trim()) return;
      const updated = [...objectives, newObjective.trim()];
      setObjectives(updated);
      setNewObjective('');
      handleSaveWebsite({ ...website, about: { ...website.about, objectives: updated } }, 'Objective added!');
    };

    const handleDeleteObjective = (idx: number) => {
      const updated = objectives.filter((_, i) => i !== idx);
      setObjectives(updated);
      handleSaveWebsite({ ...website, about: { ...website.about, objectives: updated } }, 'Objective removed!');
    };

    return (
      <div className="space-y-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900">About Us & Institutional Background</h3>
              <p className="text-xs text-slate-500">Edit history, mission, vision statements, timeline milestones, and campus facilities.</p>
            </div>
            <button
              onClick={() => handleSaveAbout()}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition cursor-pointer"
            >
              <Save className="w-4 h-4 text-amber-400" />
              Save About Us Content
            </button>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Institutional History & Inception
              </label>
              <textarea
                rows={5}
                value={history}
                onChange={(e) => setHistory(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-800"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Mission Statement
                </label>
                <textarea
                  rows={4}
                  value={mission}
                  onChange={(e) => setMission(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Vision Statement
                </label>
                <textarea
                  rows={4}
                  value={vision}
                  onChange={(e) => setVision(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Academic Achievements Summary
              </label>
              <textarea
                rows={3}
                value={achievements}
                onChange={(e) => setAchievements(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Milestones Management */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h4 className="font-extrabold text-slate-900 text-sm">Historical Milestones & Timeline</h4>
              <p className="text-xs text-slate-500">Add key institutional milestones shown on the About Us page timeline.</p>
            </div>
            <button
              onClick={() => setEditingMilestone({ year: new Date().getFullYear().toString(), title: '', description: '' })}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Milestone
            </button>
          </div>

          {editingMilestone && (
            <form onSubmit={handleSaveMilestone} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Year</label>
                  <input
                    type="text"
                    required
                    value={editingMilestone.year || ''}
                    onChange={(e) => setEditingMilestone({ ...editingMilestone, year: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Milestone Title</label>
                  <input
                    type="text"
                    required
                    value={editingMilestone.title || ''}
                    onChange={(e) => setEditingMilestone({ ...editingMilestone, title: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={editingMilestone.description || ''}
                    onChange={(e) => setEditingMilestone({ ...editingMilestone, description: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingMilestone(null)}
                  className="px-3 py-1 text-xs text-slate-600 border border-slate-300 rounded hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1 bg-slate-900 text-white font-bold text-xs rounded hover:bg-slate-800"
                >
                  Save Milestone
                </button>
              </div>
            </form>
          )}

          <div className="space-y-2">
            {milestones.map((m, idx) => (
              <div key={idx} className="p-3 bg-slate-50/70 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-black text-blue-700 bg-blue-100/70 px-2.5 py-1 rounded">
                    {m.year}
                  </span>
                  <div>
                    <h5 className="font-bold text-slate-900">{m.title}</h5>
                    <p className="text-slate-500 text-[11px]">{m.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteMilestone(idx)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Facilities Management */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h4 className="font-extrabold text-slate-900 text-sm">Campus Facilities & Infrastructure</h4>
              <p className="text-xs text-slate-500">Showcase science labs, digital libraries, auditorium, and sports grounds.</p>
            </div>
            <button
              onClick={() => setEditingFacility({ title: '', description: '', imageUrl: '' })}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Facility
            </button>
          </div>

          {editingFacility && (
            <form onSubmit={handleSaveFacility} className="p-5 bg-slate-50 rounded-xl border-2 border-amber-400 space-y-4">
              <h5 className="font-bold text-sm text-slate-900">{editingFacility.id ? 'Edit Facility' : 'Add New Facility'}</h5>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Facility Name</label>
                  <input
                    type="text"
                    required
                    value={editingFacility.title || ''}
                    onChange={(e) => setEditingFacility({ ...editingFacility, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white"
                    placeholder="e.g. Modern Robotics Laboratory"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={editingFacility.description || ''}
                    onChange={(e) => setEditingFacility({ ...editingFacility, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white"
                  />
                </div>
                <DeviceFileUpload
                  label="Facility Photograph"
                  fileType="image"
                  value={editingFacility.imageUrl || ''}
                  onChange={(url) => setEditingFacility({ ...editingFacility, imageUrl: url })}
                  onClear={() => setEditingFacility({ ...editingFacility, imageUrl: '' })}
                  helperText="Upload lab or campus image (JPG, PNG, WebP) or enter image link"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingFacility(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 border border-slate-300 rounded hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 text-white font-bold text-xs rounded hover:bg-slate-800"
                >
                  Save Facility
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {facilities.map((fac) => (
              <div key={fac.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs flex flex-col group">
                <div className="h-32 bg-slate-100 relative overflow-hidden">
                  {fac.imageUrl ? (
                    <img src={fac.imageUrl} alt={fac.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Building2 className="w-8 h-8 opacity-40" />
                    </div>
                  )}
                </div>
                <div className="p-3.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs">{fac.title}</h5>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">{fac.description}</p>
                  </div>
                  <div className="flex items-center justify-end gap-1 pt-2 border-t border-slate-100 mt-3">
                    <button
                      onClick={() => setEditingFacility(fac)}
                      className="p-1 text-slate-400 hover:text-amber-600 rounded"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteFacility(fac.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Core Objectives List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
          <h4 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2">
            Institutional Core Objectives
          </h4>
          <div className="flex gap-2">
            <input
              type="text"
              value={newObjective}
              onChange={(e) => setNewObjective(e.target.value)}
              placeholder="Add institutional objective..."
              className="flex-1 px-3 py-1.5 border border-slate-300 rounded text-xs"
            />
            <button
              type="button"
              onClick={handleAddObjective}
              className="px-4 py-1.5 bg-blue-600 text-white font-bold text-xs rounded hover:bg-blue-700 cursor-pointer"
            >
              Add Objective
            </button>
          </div>
          <div className="space-y-1.5">
            {objectives.map((obj, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <span>{idx + 1}. {obj}</span>
                <button
                  type="button"
                  onClick={() => handleDeleteObjective(idx)}
                  className="text-slate-400 hover:text-rose-600"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ----------------------------------------------------
  // 5. FACULTY & STAFF DIRECTORY (DEMO TEACHERS REPAIR)
  // ----------------------------------------------------
  const FacultyTab = () => {
    const faculty = website.faculty || [];
    const [editingMember, setEditingMember] = useState<Partial<WebsiteFacultyProfile> | null>(null);

    const handleSaveMember = (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingMember?.name || !editingMember?.designation) return;

      let updatedList: WebsiteFacultyProfile[];
      if (editingMember.id) {
        updatedList = faculty.map(f => f.id === editingMember.id ? { ...f, ...editingMember } as WebsiteFacultyProfile : f);
      } else {
        const newMember: WebsiteFacultyProfile = {
          id: `fac_${Date.now()}`,
          name: editingMember.name || '',
          designation: editingMember.designation || 'Senior Teacher',
          department: editingMember.department || 'Science',
          subject: editingMember.subject || '',
          qualification: editingMember.qualification || 'M.Sc., B.Ed.',
          photoUrl: editingMember.photoUrl || '',
          bio: editingMember.bio || '',
          email: editingMember.email || '',
          phone: editingMember.phone || '',
          order: faculty.length + 1,
          isPublished: editingMember.isPublished !== false,
        };
        updatedList = [...faculty, newMember];
      }

      handleSaveWebsite({ ...website, faculty: updatedList, facultyProfiles: updatedList }, 'Faculty member saved successfully!');
      setEditingMember(null);
    };

    const handleDeleteMember = (id: string) => {
      requestConfirmDelete(
        'Delete Faculty Profile',
        'Are you sure you want to remove this public faculty record? This will only remove their public website profile and will not delete any operational school records.',
        () => {
          const updatedList = faculty.filter(f => f.id !== id);
          handleSaveWebsite({ ...website, faculty: updatedList, facultyProfiles: updatedList }, 'Faculty profile deleted!');
        }
      );
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Faculty & Staff Public Directory</h3>
            <p className="text-xs text-slate-500">Manage public teacher profiles, subjects, credentials, and photographs.</p>
          </div>
          <button
            onClick={() => setEditingMember({
              name: '',
              designation: 'Senior Teacher',
              department: 'Science & Mathematics',
              subject: 'Physics & Higher Mathematics',
              qualification: 'M.Sc., B.Ed.',
              photoUrl: '',
              bio: '',
              email: '',
              isPublished: true,
            })}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-xs rounded-lg flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Faculty Profile
          </button>
        </div>

        {editingMember && (
          <form onSubmit={handleSaveMember} className="bg-white p-6 rounded-xl border-2 border-amber-400 shadow-md space-y-4">
            <h4 className="font-bold text-slate-900 text-sm">
              {editingMember.id ? 'Edit Faculty Profile' : 'Add New Faculty Member'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={editingMember.name || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  placeholder="e.g. Mohammad Kabir Hossain"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Designation <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={editingMember.designation || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, designation: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  placeholder="e.g. Senior Teacher & Head of Science"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                <input
                  type="text"
                  value={editingMember.department || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, department: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  placeholder="e.g. Science & Mathematics, Languages, Business Studies"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject(s)</label>
                <input
                  type="text"
                  value={editingMember.subject || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  placeholder="e.g. Physics & Higher Math"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Educational Qualifications</label>
                <input
                  type="text"
                  value={editingMember.qualification || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, qualification: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  placeholder="e.g. M.Sc in Applied Physics (DU), B.Ed"
                />
              </div>

              <div className="md:col-span-2">
                <DeviceFileUpload
                  label="Teacher Profile Photograph"
                  fileType="image"
                  value={editingMember.photoUrl || ''}
                  onChange={(url) => setEditingMember({ ...editingMember, photoUrl: url })}
                  onClear={() => setEditingMember({ ...editingMember, photoUrl: '' })}
                  helperText="Upload portrait photo (JPG, PNG, WebP) from device or enter image link"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Official Email</label>
                <input
                  type="email"
                  value={editingMember.email || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  placeholder="teacher@school.edu.bd"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={editingMember.phone || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Short Biography</label>
                <textarea
                  rows={3}
                  value={editingMember.bio || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, bio: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  placeholder="Experience, pedagogical achievements, or club mentorships"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingMember.isPublished !== false}
                    onChange={(e) => setEditingMember({ ...editingMember, isPublished: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  Publish Profile on Public Website
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-slate-900 text-white font-bold text-xs rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                Save Profile
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {faculty.map((f) => (
            <div key={f.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-3 group">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center">
                  {f.photoUrl ? (
                    <img src={f.photoUrl} alt={f.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-black text-slate-400 text-xl">{f.name.charAt(0)}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-slate-900 text-sm truncate">{f.name}</h4>
                  <p className="text-xs text-amber-700 font-semibold truncate">{f.designation}</p>
                  <p className="text-[11px] text-slate-400 truncate">{f.department}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setEditingMember(f)}
                  className="p-1.5 text-slate-400 hover:text-amber-600 rounded hover:bg-slate-100 cursor-pointer"
                  title="Edit Teacher"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteMember(f.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 cursor-pointer"
                  title="Delete Teacher"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ----------------------------------------------------
  // 6. MANAGING COMMITTEE
  // ----------------------------------------------------
  const CommitteeTab = () => {
    const committee = website.committee || [];
    const [editingMember, setEditingMember] = useState<Partial<WebsiteCommitteeMember> | null>(null);

    const handleSaveMember = (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingMember?.name || !editingMember?.position) return;

      let updatedList: WebsiteCommitteeMember[];
      if (editingMember.id) {
        updatedList = committee.map(c => c.id === editingMember.id ? { ...c, ...editingMember } as WebsiteCommitteeMember : c);
      } else {
        const newMember: WebsiteCommitteeMember = {
          id: `comm_${Date.now()}`,
          name: editingMember.name || '',
          position: editingMember.position || 'Member, Managing Committee',
          photoUrl: editingMember.photoUrl || '',
          bio: editingMember.bio || '',
          order: committee.length + 1,
          isPublished: editingMember.isPublished !== false,
        };
        updatedList = [...committee, newMember];
      }

      handleSaveWebsite({ ...website, committee: updatedList, committeeMembers: updatedList }, 'Committee member saved!');
      setEditingMember(null);
    };

    const handleDeleteMember = (id: string) => {
      requestConfirmDelete(
        'Delete Committee Member',
        'Are you sure you want to delete this committee member profile from the public governance page?',
        () => {
          const updatedList = committee.filter(c => c.id !== id);
          handleSaveWebsite({ ...website, committee: updatedList, committeeMembers: updatedList }, 'Committee member removed!');
        }
      );
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Managing Committee & Governance</h3>
            <p className="text-xs text-slate-500">Manage board members, patron president, and parent/teacher representatives.</p>
          </div>
          <button
            onClick={() => setEditingMember({
              name: '',
              position: 'Member, Managing Committee',
              photoUrl: '',
              bio: '',
              isPublished: true,
            })}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Committee Member
          </button>
        </div>

        {editingMember && (
          <form onSubmit={handleSaveMember} className="bg-white p-6 rounded-xl border-2 border-blue-400 shadow-md space-y-4">
            <h4 className="font-bold text-slate-900 text-sm">
              {editingMember.id ? 'Edit Committee Member' : 'Add New Committee Member'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editingMember.name || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Position / Office</label>
                <input
                  type="text"
                  required
                  value={editingMember.position || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, position: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  placeholder="e.g. President, Vice President, Guardian Representative"
                />
              </div>

              <div className="md:col-span-2">
                <DeviceFileUpload
                  label="Member Portrait Photo"
                  fileType="image"
                  value={editingMember.photoUrl || ''}
                  onChange={(url) => setEditingMember({ ...editingMember, photoUrl: url })}
                  onClear={() => setEditingMember({ ...editingMember, photoUrl: '' })}
                  helperText="Upload portrait photo (JPG, PNG, WebP) from device or enter image link"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Brief Background / Bio</label>
                <textarea
                  rows={3}
                  value={editingMember.bio || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, bio: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-slate-900 text-white font-bold text-xs rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                Save Member
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {committee.map((m) => (
            <div key={m.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center">
                  {m.photoUrl ? (
                    <img src={m.photoUrl} alt={m.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-black text-blue-700 text-lg">{m.name.charAt(0)}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-slate-900 text-sm truncate">{m.name}</h4>
                  <p className="text-xs text-blue-700 font-semibold truncate">{m.position}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setEditingMember(m)}
                  className="p-1.5 text-slate-400 hover:text-amber-600 rounded hover:bg-slate-100 cursor-pointer"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteMember(m.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ----------------------------------------------------
  // 7. STUDENT ACHIEVERS & WALL OF FAME (DEMO STUDENTS REPAIR)
  // ----------------------------------------------------
  const AwardsTab = () => {
    const awards = website.awards || [];
    const [editingAward, setEditingAward] = useState<Partial<WebsiteFeaturedAward> | null>(null);

    const handleSaveAward = (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingAward?.studentName || !editingAward?.awardTitle) return;

      let updatedList: WebsiteFeaturedAward[];
      if (editingAward.id) {
        updatedList = awards.map(a => a.id === editingAward.id ? { ...a, ...editingAward } as WebsiteFeaturedAward : a);
      } else {
        const newAward: WebsiteFeaturedAward = {
          id: `award_${Date.now()}`,
          studentName: editingAward.studentName || '',
          classGrade: editingAward.classGrade || 'Class 10 (Science)',
          awardTitle: editingAward.awardTitle || '',
          year: editingAward.year || new Date().getFullYear().toString(),
          category: editingAward.category || 'Olympiad',
          description: editingAward.description || '',
          photoUrl: editingAward.photoUrl || '',
          isPublished: editingAward.isPublished !== false,
        };
        updatedList = [...awards, newAward];
      }

      handleSaveWebsite({ ...website, awards: updatedList, featuredAwards: updatedList }, 'Student award saved!');
      setEditingAward(null);
    };

    const handleDeleteAward = (id: string) => {
      requestConfirmDelete(
        'Delete Student Achiever Record',
        'Are you sure you want to delete this public student achiever record? This will only remove their public website display record and will not affect any operational school student records.',
        () => {
          const updatedList = awards.filter(a => a.id !== id);
          handleSaveWebsite({ ...website, awards: updatedList, featuredAwards: updatedList }, 'Student record removed!');
        }
      );
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Student Achievers & Wall of Fame</h3>
            <p className="text-xs text-slate-500">Manage public student recognition, science olympiad winners, and board top rankers.</p>
          </div>
          <button
            onClick={() => setEditingAward({
              studentName: '',
              classGrade: 'Class 10 (Science)',
              awardTitle: '',
              year: new Date().getFullYear().toString(),
              description: '',
              photoUrl: '',
              isPublished: true,
            })}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Student Achiever
          </button>
        </div>

        {editingAward && (
          <form onSubmit={handleSaveAward} className="bg-white p-6 rounded-xl border-2 border-amber-400 shadow-md space-y-4">
            <h4 className="font-bold text-slate-900 text-sm">
              {editingAward.id ? 'Edit Student Achiever' : 'Add New Student Achiever'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Student Name <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={editingAward.studentName || ''}
                  onChange={(e) => setEditingAward({ ...editingAward, studentName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  placeholder="e.g. Tahmidur Rahman"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Class / Grade</label>
                <input
                  type="text"
                  value={editingAward.classGrade || ''}
                  onChange={(e) => setEditingAward({ ...editingAward, classGrade: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  placeholder="e.g. Class 10 (Science)"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Award / Honor Title <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={editingAward.awardTitle || ''}
                  onChange={(e) => setEditingAward({ ...editingAward, awardTitle: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  placeholder="e.g. Champion - National Science Olympiad 2025"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Year</label>
                <input
                  type="text"
                  value={editingAward.year || ''}
                  onChange={(e) => setEditingAward({ ...editingAward, year: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  placeholder="2026"
                />
              </div>

              <div className="md:col-span-2">
                <DeviceFileUpload
                  label="Student Photograph"
                  fileType="image"
                  value={editingAward.photoUrl || ''}
                  onChange={(url) => setEditingAward({ ...editingAward, photoUrl: url })}
                  onClear={() => setEditingAward({ ...editingAward, photoUrl: '' })}
                  helperText="Upload student photo (JPG, PNG, WebP) from device or enter image link"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Description / Achievement Summary</label>
                <textarea
                  rows={3}
                  value={editingAward.description || ''}
                  onChange={(e) => setEditingAward({ ...editingAward, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  placeholder="Details of the medal, distinction, or recognition"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingAward(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-slate-900 text-white font-bold text-xs rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                Save Achiever
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {awards.map((award) => (
            <div key={award.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3.5">
              <div className="w-14 h-14 rounded-xl bg-amber-100 border border-amber-200 shrink-0 overflow-hidden flex items-center justify-center">
                {award.photoUrl ? (
                  <img src={award.photoUrl} alt={award.studentName} className="w-full h-full object-cover" />
                ) : (
                  <Trophy className="w-6 h-6 text-amber-700" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded font-mono">
                    {award.year}
                  </span>
                  <span className="text-[11px] text-slate-500 truncate">{award.classGrade}</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm truncate mt-0.5">{award.studentName}</h4>
                <p className="text-xs text-blue-700 font-semibold truncate">{award.awardTitle}</p>
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{award.description}</p>
              </div>

              <div className="flex flex-col gap-1 shrink-0">
                <button
                  onClick={() => setEditingAward(award)}
                  className="p-1.5 text-slate-400 hover:text-amber-600 rounded hover:bg-slate-100 cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteAward(award.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ----------------------------------------------------
  // 8. OFFICIAL NOTICE BOARD
  // ----------------------------------------------------
  const NoticesTab = () => {
    const notices = website.notices || [];
    const [editingNotice, setEditingNotice] = useState<Partial<WebsiteNotice> | null>(null);

    const handleSaveNotice = (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingNotice?.title || !editingNotice?.content) return;

      let updatedList: WebsiteNotice[];
      if (editingNotice.id) {
        updatedList = notices.map(n => n.id === editingNotice.id ? { ...n, ...editingNotice } as WebsiteNotice : n);
      } else {
        const newNotice: WebsiteNotice = {
          id: `notice_${Date.now()}`,
          title: editingNotice.title || '',
          category: (editingNotice.category as any) || 'Academic',
          date: editingNotice.date || new Date().toISOString().split('T')[0],
          publishDate: editingNotice.date || new Date().toISOString().split('T')[0],
          content: editingNotice.content || '',
          fileUrl: editingNotice.fileUrl || editingNotice.pdfUrl || '',
          pdfUrl: editingNotice.fileUrl || editingNotice.pdfUrl || '',
          isPinned: !!editingNotice.isPinned,
          isImportant: !!editingNotice.isImportant,
          isPublished: editingNotice.isPublished !== false,
        };
        updatedList = [newNotice, ...notices];
      }

      handleSaveWebsite({ ...website, notices: updatedList }, 'Notice published successfully!');
      setEditingNotice(null);
    };

    const handleDeleteNotice = (id: string) => {
      requestConfirmDelete(
        'Delete Notice',
        'Are you sure you want to permanently delete this notice? It will be removed from the public notice board immediately.',
        () => {
          const updatedList = notices.filter(n => n.id !== id);
          handleSaveWebsite({ ...website, notices: updatedList }, 'Notice deleted!');
        }
      );
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Official Notice Board</h3>
            <p className="text-xs text-slate-500">Publish urgent notices, exam schedules, holidays, and circulars.</p>
          </div>
          <button
            onClick={() => setEditingNotice({
              title: '',
              category: 'Academic',
              date: new Date().toISOString().split('T')[0],
              content: '',
              fileUrl: '',
              isPinned: false,
              isImportant: false,
              isPublished: true,
            })}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-xs rounded-lg flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Publish New Notice
          </button>
        </div>

        {editingNotice && (
          <form onSubmit={handleSaveNotice} className="bg-white p-6 rounded-xl border-2 border-amber-400 shadow-md space-y-4">
            <h4 className="font-bold text-slate-900 text-sm">
              {editingNotice.id ? 'Edit Notice' : 'Draft New Notice'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Notice Title <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={editingNotice.title || ''}
                  onChange={(e) => setEditingNotice({ ...editingNotice, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={editingNotice.category || 'Academic'}
                  onChange={(e) => setEditingNotice({ ...editingNotice, category: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
                >
                  <option value="Academic">Academic</option>
                  <option value="Exam">Examination</option>
                  <option value="Admission">Admission</option>
                  <option value="Holiday">Holiday</option>
                  <option value="Event">Event</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Date Published</label>
                <input
                  type="date"
                  value={editingNotice.date || ''}
                  onChange={(e) => setEditingNotice({ ...editingNotice, date: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <DeviceFileUpload
                  label="Official PDF / Document Attachment"
                  fileType="document"
                  accept=".pdf,.doc,.docx"
                  value={editingNotice.fileUrl || editingNotice.pdfUrl || ''}
                  onChange={(url) => setEditingNotice({ ...editingNotice, fileUrl: url, pdfUrl: url })}
                  onClear={() => setEditingNotice({ ...editingNotice, fileUrl: '', pdfUrl: '' })}
                  helperText="Upload official notice circular (PDF) from device or enter web link"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-slate-700 mb-1">Notice Content <span className="text-rose-500">*</span></label>
                <textarea
                  required
                  rows={5}
                  value={editingNotice.content || ''}
                  onChange={(e) => setEditingNotice({ ...editingNotice, content: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div className="flex flex-wrap items-center gap-6 md:col-span-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={editingNotice.isPinned || false}
                    onChange={(e) => setEditingNotice({ ...editingNotice, isPinned: e.target.checked })}
                    className="w-4 h-4 text-amber-500 rounded"
                  />
                  Pin this notice to homepage ticker & top board
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={editingNotice.isImportant || false}
                    onChange={(e) => setEditingNotice({ ...editingNotice, isImportant: e.target.checked })}
                    className="w-4 h-4 text-rose-500 rounded"
                  />
                  Highlight as Urgent / Important
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingNotice(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-slate-900 text-white font-bold text-xs rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                Save Notice
              </button>
            </div>
          </form>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Flags</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {notices.map((n) => (
                <tr key={n.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 text-xs text-slate-500 font-medium whitespace-nowrap">{n.date || n.publishDate}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900 line-clamp-1">{n.title}</div>
                    <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">{n.content}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {n.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    {n.isPinned && (
                      <span className="inline-block px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold mr-1">
                        PINNED
                      </span>
                    )}
                    {n.isImportant && (
                      <span className="inline-block px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold">
                        URGENT
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => setEditingNotice(n)}
                      className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded mr-1 cursor-pointer"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteNotice(n.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // ----------------------------------------------------
  // 9. CAMPUS NEWS & EVENTS
  // ----------------------------------------------------
  const NewsTab = () => {
    const news = website.news || [];
    const [editingArticle, setEditingArticle] = useState<Partial<WebsiteNewsArticle> | null>(null);

    const handleSaveNews = (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingArticle?.title || !editingArticle?.content) return;

      let updatedList: WebsiteNewsArticle[];
      if (editingArticle.id) {
        updatedList = news.map(n => n.id === editingArticle.id ? { ...n, ...editingArticle } as WebsiteNewsArticle : n);
      } else {
        const newArt: WebsiteNewsArticle = {
          id: `news_${Date.now()}`,
          title: editingArticle.title || '',
          type: editingArticle.type || 'news',
          summary: editingArticle.summary || '',
          content: editingArticle.content || '',
          imageUrl: editingArticle.imageUrl || '',
          date: editingArticle.date || new Date().toISOString().split('T')[0],
          eventLocation: editingArticle.eventLocation || '',
          isPublished: editingArticle.isPublished !== false,
        };
        updatedList = [newArt, ...news];
      }

      handleSaveWebsite({ ...website, news: updatedList, newsArticles: updatedList }, 'Story published!');
      setEditingArticle(null);
    };

    const handleDeleteNews = (id: string) => {
      requestConfirmDelete(
        'Delete News Article / Event',
        'Are you sure you want to delete this news article or campus event? It will be removed from the news section.',
        () => {
          const updatedList = news.filter(n => n.id !== id);
          handleSaveWebsite({ ...website, news: updatedList, newsArticles: updatedList }, 'Article removed!');
        }
      );
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Campus News & Events Articles</h3>
            <p className="text-xs text-slate-500">Publish science fest reports, sports meet ceremonies, and upcoming events.</p>
          </div>
          <button
            onClick={() => setEditingArticle({
              title: '',
              type: 'news',
              summary: '',
              content: '',
              imageUrl: '',
              date: new Date().toISOString().split('T')[0],
              eventLocation: 'Campus Central Auditorium',
              isPublished: true,
            })}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Publish News / Event
          </button>
        </div>

        {editingArticle && (
          <form onSubmit={handleSaveNews} className="bg-white p-6 rounded-xl border-2 border-emerald-500 shadow-md space-y-4">
            <h4 className="font-bold text-slate-900 text-sm">
              {editingArticle.id ? 'Edit Story' : 'Draft New Story or Event'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Headline Title <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={editingArticle.title || ''}
                  onChange={(e) => setEditingArticle({ ...editingArticle, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Content Type</label>
                <select
                  value={editingArticle.type || 'news'}
                  onChange={(e) => setEditingArticle({ ...editingArticle, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
                >
                  <option value="news">Campus News Article</option>
                  <option value="event">Upcoming Event / Ceremony</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  value={editingArticle.date || ''}
                  onChange={(e) => setEditingArticle({ ...editingArticle, date: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Event Venue / Location</label>
                <input
                  type="text"
                  value={editingArticle.eventLocation || ''}
                  onChange={(e) => setEditingArticle({ ...editingArticle, eventLocation: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  placeholder="e.g. Main Campus Playground & Stage"
                />
              </div>

              <div className="md:col-span-3">
                <DeviceFileUpload
                  label="Featured Photograph"
                  fileType="image"
                  value={editingArticle.imageUrl || ''}
                  onChange={(url) => setEditingArticle({ ...editingArticle, imageUrl: url })}
                  onClear={() => setEditingArticle({ ...editingArticle, imageUrl: '' })}
                  helperText="Upload event photo (JPG, PNG, WebP) from device or enter image link"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-slate-700 mb-1">Summary Hook</label>
                <input
                  type="text"
                  value={editingArticle.summary || ''}
                  onChange={(e) => setEditingArticle({ ...editingArticle, summary: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  placeholder="One sentence lead summary shown on card previews"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Story Narrative <span className="text-rose-500">*</span></label>
                <textarea
                  required
                  rows={6}
                  value={editingArticle.content || ''}
                  onChange={(e) => setEditingArticle({ ...editingArticle, content: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingArticle(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-slate-900 text-white font-bold text-xs rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                Save Story
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {news.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs flex flex-col group">
              <div className="h-40 bg-slate-100 relative overflow-hidden">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <Newspaper className="w-8 h-8 opacity-40" />
                  </div>
                )}
                <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded text-white ${item.type === 'event' ? 'bg-purple-600' : 'bg-blue-600'}`}>
                  {item.type === 'event' ? 'EVENT' : 'NEWS'}
                </span>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono">{item.date}</span>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-2 mt-1">{item.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">{item.summary}</p>
                </div>
                <div className="flex items-center justify-end gap-1 pt-3 border-t border-slate-100 mt-3">
                  <button
                    onClick={() => setEditingArticle(item)}
                    className="p-1.5 text-slate-400 hover:text-amber-600 rounded cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteNews(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ----------------------------------------------------
  // 10. PHOTO GALLERY & CAMPUS ARCHIVES
  // ----------------------------------------------------
  const GalleryTab = () => {
    const gallery = website.gallery || [];
    const [editingItem, setEditingItem] = useState<Partial<WebsiteGalleryItem> | null>(null);

    const handleSaveItem = (e: React.FormEvent) => {
      e.preventDefault();
      const imgTarget = editingItem?.imageUrl || editingItem?.url;
      if (!editingItem?.title || !imgTarget) return;

      let updatedList: WebsiteGalleryItem[];
      if (editingItem.id) {
        updatedList = gallery.map(g => g.id === editingItem.id ? {
          ...g,
          ...editingItem,
          url: imgTarget,
          imageUrl: imgTarget,
        } as WebsiteGalleryItem : g);
      } else {
        const newItem: WebsiteGalleryItem = {
          id: `gal_${Date.now()}`,
          title: editingItem.title || '',
          category: (editingItem.category as any) || 'Campus',
          url: imgTarget,
          imageUrl: imgTarget,
          caption: editingItem.caption,
          date: new Date().toISOString().split('T')[0],
        };
        updatedList = [newItem, ...gallery];
      }

      handleSaveWebsite({ ...website, gallery: updatedList }, 'Gallery photograph saved!');
      setEditingItem(null);
    };

    const handleDeleteItem = (id: string) => {
      requestConfirmDelete(
        'Delete Photo',
        'Are you sure you want to permanently delete this photo from the campus gallery archives?',
        () => {
          const updatedList = gallery.filter(g => g.id !== id);
          handleSaveWebsite({ ...website, gallery: updatedList }, 'Photo removed!');
        }
      );
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Photo Gallery & Campus Archives</h3>
            <p className="text-xs text-slate-500">Upload and curate photographs of ceremonies, sports, labs, and celebrations.</p>
          </div>
          <button
            onClick={() => setEditingItem({
              title: '',
              category: 'Campus',
              imageUrl: '',
              url: '',
              caption: '',
            })}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-xs rounded-lg flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Photo
          </button>
        </div>

        {editingItem && (
          <form onSubmit={handleSaveItem} className="bg-white p-6 rounded-xl border-2 border-amber-400 shadow-md space-y-4">
            <h4 className="font-bold text-slate-900 text-sm">
              {editingItem.id ? 'Edit Photo Details' : 'Add New Photo to Gallery'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Photo Title <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={editingItem.title || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  placeholder="e.g. Annual Inter-House Athletics Final"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={editingItem.category || 'Campus'}
                  onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
                >
                  <option value="Campus">Campus Infrastructure</option>
                  <option value="Academic">Academic Classrooms & Labs</option>
                  <option value="Sports">Sports & Athletics</option>
                  <option value="Cultural">Cultural Ceremonies</option>
                  <option value="Events">Annual Events & Awards</option>
                  <option value="Science">Science & Robotics</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <DeviceFileUpload
                  label="Campus Photo / Gallery Image"
                  fileType="image"
                  required
                  value={editingItem.imageUrl || editingItem.url || ''}
                  onChange={(url) => setEditingItem({ ...editingItem, imageUrl: url, url })}
                  onClear={() => setEditingItem({ ...editingItem, imageUrl: '', url: '' })}
                  helperText="Upload event photograph (JPG, PNG, WebP) from device or enter image link"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Caption / Description</label>
                <input
                  type="text"
                  value={editingItem.caption || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, caption: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  placeholder="Brief descriptive caption"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-slate-900 text-white font-bold text-xs rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                Save Photo
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {gallery.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs flex flex-col group">
              <div className="h-36 bg-slate-100 relative overflow-hidden">
                <img src={item.url || item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                <span className="absolute top-2 left-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-950/70 text-white">
                  {item.category}
                </span>
              </div>
              <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs truncate">{item.title}</h4>
                  {item.caption && <p className="text-[11px] text-slate-500 truncate mt-0.5">{item.caption}</p>}
                </div>

                <div className="flex items-center justify-end gap-1 mt-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setEditingItem(item)}
                    className="p-1 text-slate-400 hover:text-amber-600 rounded cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ----------------------------------------------------
  // 11. DOWNLOADS & DOCUMENT REPOSITORY
  // ----------------------------------------------------
  const DownloadsTab = () => {
    const downloads = website.downloads || [];
    const [editingDoc, setEditingDoc] = useState<Partial<WebsiteDownloadItem> | null>(null);

    const handleSaveDoc = (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingDoc?.title || !editingDoc?.fileUrl) return;

      let updatedList: WebsiteDownloadItem[];
      if (editingDoc.id) {
        updatedList = downloads.map(d => d.id === editingDoc.id ? { ...d, ...editingDoc } as WebsiteDownloadItem : d);
      } else {
        const newDoc: WebsiteDownloadItem = {
          id: `dl_${Date.now()}`,
          title: editingDoc.title || '',
          category: editingDoc.category || 'Forms',
          fileUrl: editingDoc.fileUrl || '',
          fileSize: editingDoc.fileSize || 'PDF',
          fileType: editingDoc.fileType || 'PDF',
          description: editingDoc.description || '',
          publishDate: new Date().toISOString().split('T')[0],
          order: downloads.length + 1,
        };
        updatedList = [...downloads, newDoc];
      }

      handleSaveWebsite({ ...website, downloads: updatedList }, 'Downloadable document saved!');
      setEditingDoc(null);
    };

    const handleDeleteDoc = (id: string) => {
      requestConfirmDelete(
        'Delete Download Document',
        'Are you sure you want to remove this downloadable document from the public library?',
        () => {
          const updatedList = downloads.filter(d => d.id !== id);
          handleSaveWebsite({ ...website, downloads: updatedList }, 'Document removed!');
        }
      );
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Official Downloads & Document Library</h3>
            <p className="text-xs text-slate-500">Provide downloadable PDFs for admission forms, syllabus, calendar, and regulations.</p>
          </div>
          <button
            onClick={() => setEditingDoc({
              title: '',
              category: 'Admission Form',
              fileUrl: '',
              fileSize: 'PDF',
              fileType: 'PDF',
              description: '',
            })}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-xs rounded-lg flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Download File
          </button>
        </div>

        {editingDoc && (
          <form onSubmit={handleSaveDoc} className="bg-white p-6 rounded-xl border-2 border-amber-400 shadow-md space-y-4">
            <h4 className="font-bold text-slate-900 text-sm">
              {editingDoc.id ? 'Edit Document' : 'Add New Download Item'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">File Title <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={editingDoc.title || ''}
                  onChange={(e) => setEditingDoc({ ...editingDoc, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  placeholder="e.g. Student Admission Application Form (Session 2026-2027)"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <input
                  type="text"
                  value={editingDoc.category || 'Forms'}
                  onChange={(e) => setEditingDoc({ ...editingDoc, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  placeholder="Forms, Syllabus, Calendar, TC, Rules"
                />
              </div>

              <div className="md:col-span-2">
                <DeviceFileUpload
                  label="Official Document File (PDF / Word / Excel)"
                  fileType="document"
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  required
                  value={editingDoc.fileUrl || ''}
                  fileName={editingDoc.title}
                  fileSize={editingDoc.fileSize}
                  onChange={(url, meta) => {
                    setEditingDoc({
                      ...editingDoc,
                      fileUrl: url,
                      fileSize: meta?.fileSize || editingDoc.fileSize || 'PDF',
                      fileType: meta?.fileType || editingDoc.fileType || 'PDF',
                      title: editingDoc.title || meta?.fileName?.replace(/\.[^/.]+$/, '') || ''
                    });
                  }}
                  onClear={() => setEditingDoc({ ...editingDoc, fileUrl: '' })}
                  helperText="Upload official PDF/DOCX from device or enter web link"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">File Size Tag</label>
                <input
                  type="text"
                  value={editingDoc.fileSize || ''}
                  onChange={(e) => setEditingDoc({ ...editingDoc, fileSize: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  placeholder="e.g. 420 KB"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">File Format</label>
                <input
                  type="text"
                  value={editingDoc.fileType || 'PDF'}
                  onChange={(e) => setEditingDoc({ ...editingDoc, fileType: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  placeholder="PDF"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Brief Description</label>
                <input
                  type="text"
                  value={editingDoc.description || ''}
                  onChange={(e) => setEditingDoc({ ...editingDoc, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingDoc(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-slate-900 text-white font-bold text-xs rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                Save Document
              </button>
            </div>
          </form>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
              <tr>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Format & Size</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {downloads.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{d.title}</div>
                    {d.description && <div className="text-xs text-slate-500">{d.description}</div>}
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-600 font-medium">{d.category}</td>
                  <td className="py-3 px-4 text-xs text-slate-500">{d.fileType} • {d.fileSize}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setEditingDoc(d)}
                      className="p-1.5 text-slate-400 hover:text-amber-600 rounded mr-1 cursor-pointer"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteDoc(d.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // ----------------------------------------------------
  // 12. CUSTOM PAGE & MODULAR SECTION BUILDER
  // (REPAIRS CENTRAL LIBRARY & TRANSPORT SECTIONS RELIABLY)
  // ----------------------------------------------------
  const CustomPagesTab = () => {
    const pages = website.customPages || [];
    const [selectedPage, setSelectedPage] = useState<WebsiteCustomPage | null>(pages[0] || null);
    const [isCreatingPage, setIsCreatingPage] = useState(false);
    const [newPageTitle, setNewPageTitle] = useState('');
    const [newPageSlug, setNewPageSlug] = useState('');

    const handleCreatePage = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newPageTitle.trim() || !newPageSlug.trim()) return;

      const slug = newPageSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
      const newPage: WebsiteCustomPage = {
        id: `page_${Date.now()}`,
        title: newPageTitle,
        slug: slug.startsWith('/') ? slug.substring(1) : slug,
        sections: [
          {
            id: `sec_${Date.now()}_1`,
            type: 'hero',
            title: newPageTitle,
            subtitle: 'Institutional Overview',
            content: 'Welcome to this custom institutional portal section.',
            order: 1,
            isActive: true,
          },
          {
            id: `sec_${Date.now()}_2`,
            type: 'text',
            title: 'Overview and Details',
            content: 'Write your comprehensive details, regulations, or announcement content here.',
            order: 2,
            isActive: true,
          },
        ],
        isPublished: true,
        showInNav: true,
        showInFooter: true,
        updatedAt: new Date().toISOString(),
      };

      const updatedPages = [...pages, newPage];
      handleSaveWebsite({ ...website, customPages: updatedPages }, `Page "${newPageTitle}" created!`);
      setSelectedPage(newPage);
      setIsCreatingPage(false);
      setNewPageTitle('');
      setNewPageSlug('');
    };

    // Re-add Central Library template if deleted
    const handleReaddLibrary = () => {
      const libPage: WebsiteCustomPage = {
        id: `page-library-${Date.now()}`,
        slug: 'library-resources',
        title: 'Central Library & Digital Knowledge Hub',
        subtitle: 'Nurturing Reading Habits, Research, and Lifelong Inquiry',
        metaDescription: 'Explore the central digital library resources, book catalog, reading hours, and digital archives.',
        showInNav: true,
        showInFooter: true,
        navOrder: 1,
        isPublished: true,
        updatedAt: new Date().toISOString().split('T')[0],
        sections: [
          {
            id: `sec-lib-hero-${Date.now()}`,
            type: 'hero',
            heading: 'Central Library & Digital Archives',
            subheading: 'A sanctuary of over 15,000 titles, literary classics, and modern research resources.',
            imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1600&auto=format&fit=crop&q=80',
            buttonText: 'View Library Rules',
            buttonLink: 'rules',
            order: 1,
            isActive: true
          },
          {
            id: `sec-lib-features-${Date.now()}`,
            type: 'features',
            heading: 'Key Library Facilities & Collections',
            subheading: 'Everything students and faculty need for academic depth and intellectual enrichment.',
            items: [
              { title: '15,000+ Printed Titles', description: 'Curated curriculum texts, world literature, historical encyclopedias, and board exam guides.' },
              { title: 'Digital E-Reader Hub', description: 'Terminals providing access to national e-books, journals, and digital periodicals.' },
              { title: 'Quiet Study Sanctuary', description: 'Sound-dampened reading halls accommodating over 120 students concurrently.' },
              { title: 'Automated Barcode Circulation', description: 'Instant lending and return system integrated directly with student ID cards.' }
            ],
            order: 2,
            isActive: true
          },
          {
            id: `sec-lib-text-${Date.now()}`,
            type: 'text',
            heading: 'Library Hours & Borrowing Guidelines',
            content: 'The library remains open Sunday through Thursday from 8:30 AM to 4:00 PM. Students can borrow up to two books at a time for a 14-day duration.\n\nAll students must preserve a peaceful environment, avoid food or drinks in reading halls, and handle books with utmost respect.',
            order: 3,
            isActive: true
          }
        ]
      };
      const updatedPages = [...pages, libPage];
      handleSaveWebsite({ ...website, customPages: updatedPages }, 'Central Library & Digital Knowledge Hub re-added!');
      setSelectedPage(libPage);
    };

    // Re-add Transport template if deleted
    const handleReaddTransport = () => {
      const transPage: WebsiteCustomPage = {
        id: `page-transport-${Date.now()}`,
        slug: 'transport-campus-safety',
        title: 'Transport Services & Campus Safety',
        subtitle: 'Safe, Monitored, and Timely Daily Commutes Across Dhaka',
        metaDescription: 'Learn about school bus routes, GPS tracking, and campus security protocols.',
        showInNav: true,
        showInFooter: true,
        navOrder: 2,
        isPublished: true,
        updatedAt: new Date().toISOString().split('T')[0],
        sections: [
          {
            id: `sec-trans-hero-${Date.now()}`,
            type: 'hero',
            heading: 'Dedicated School Bus Fleet with GPS Tracking',
            subheading: 'Ensuring safe, comfortable, and punctually monitored journeys for our students.',
            imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1600&auto=format&fit=crop&q=80',
            buttonText: 'Contact Transport Office',
            buttonLink: 'contact',
            order: 1,
            isActive: true
          },
          {
            id: `sec-trans-features-${Date.now()}`,
            type: 'features',
            heading: 'Safety Protocols & Route Coverage',
            items: [
              { title: 'Full GPS Live Tracking', description: 'Parents receive real-time location updates and arrival estimates on dedicated channels.' },
              { title: 'Certified Experienced Drivers', description: 'All bus operators undergo background checks, defensive driving tests, and first-aid drills.' },
              { title: 'Female Bus Attendants', description: 'Dedicated staff onboard every bus to assist primary students and maintain discipline.' },
              { title: 'Covering Major Routes', description: 'Routes spanning Dhanmondi, Mirpur, Mohammadpur, Lalmatia, Kalabagan, and Green Road.' }
            ],
            order: 2,
            isActive: true
          }
        ]
      };
      const updatedPages = [...pages, transPage];
      handleSaveWebsite({ ...website, customPages: updatedPages }, 'Transport Services & Campus Safety re-added!');
      setSelectedPage(transPage);
    };

    const handleDeletePage = (id: string) => {
      requestConfirmDelete(
        'Delete Custom Page',
        'Are you sure you want to permanently delete this custom page? It will immediately disappear from the public website, navbar, and footer.',
        () => {
          const updatedPages = pages.filter(p => p.id !== id);
          handleSaveWebsite({ ...website, customPages: updatedPages }, 'Custom page deleted successfully!');
          setSelectedPage(updatedPages[0] || null);
        }
      );
    };

    const handleUpdatePageSettings = (fields: Partial<WebsiteCustomPage>) => {
      if (!selectedPage) return;
      const updatedSelected = { ...selectedPage, ...fields };
      const updatedPages = pages.map(p => p.id === selectedPage.id ? updatedSelected : p);
      handleSaveWebsite({ ...website, customPages: updatedPages }, 'Page settings updated!');
      setSelectedPage(updatedSelected);
    };

    // Add Section to selected page
    const handleAddSection = (type: WebsitePageSection['type']) => {
      if (!selectedPage) return;

      const newSection: WebsitePageSection = {
        id: `sec_${Date.now()}`,
        type,
        title: `New ${type.toUpperCase()} Section`,
        heading: `New ${type.toUpperCase()} Section`,
        subtitle: 'Section Subtitle',
        content: 'Section description and paragraphs go here.',
        order: selectedPage.sections.length + 1,
        isActive: true,
        items: type === 'features' || type === 'faq' || type === 'cards' ? [
          { title: 'Item 1', description: 'Description of item 1' },
          { title: 'Item 2', description: 'Description of item 2' },
        ] : undefined,
      };

      const updatedSelected = {
        ...selectedPage,
        sections: [...selectedPage.sections, newSection],
      };

      const updatedPages = pages.map(p => p.id === selectedPage.id ? updatedSelected : p);
      handleSaveWebsite({ ...website, customPages: updatedPages }, 'Section added to page!');
      setSelectedPage(updatedSelected);
    };

    const handleUpdateSection = (sectionId: string, updatedFields: Partial<WebsitePageSection>) => {
      if (!selectedPage) return;
      const updatedSections = selectedPage.sections.map(s => {
        if (s.id === sectionId) {
          const merged = { ...s, ...updatedFields };
          // Keep title and heading synchronized
          if (updatedFields.title !== undefined) merged.heading = updatedFields.title;
          if (updatedFields.heading !== undefined) merged.title = updatedFields.heading;
          if (updatedFields.subtitle !== undefined) merged.subheading = updatedFields.subtitle;
          if (updatedFields.subheading !== undefined) merged.subtitle = updatedFields.subheading;
          return merged;
        }
        return s;
      });
      const updatedSelected = { ...selectedPage, sections: updatedSections };
      const updatedPages = pages.map(p => p.id === selectedPage.id ? updatedSelected : p);
      handleSaveWebsite({ ...website, customPages: updatedPages }, 'Section updated!');
      setSelectedPage(updatedSelected);
    };

    const handleDeleteSection = (sectionId: string) => {
      requestConfirmDelete(
        'Remove Page Section',
        'Are you sure you want to remove this section from the page?',
        () => {
          if (!selectedPage) return;
          const updatedSections = selectedPage.sections.filter(s => s.id !== sectionId);
          const updatedSelected = { ...selectedPage, sections: updatedSections };
          const updatedPages = pages.map(p => p.id === selectedPage.id ? updatedSelected : p);
          handleSaveWebsite({ ...website, customPages: updatedPages }, 'Section removed!');
          setSelectedPage(updatedSelected);
        }
      );
    };

    const handleAddSectionItem = (sectionId: string) => {
      if (!selectedPage) return;
      const section = selectedPage.sections.find(s => s.id === sectionId);
      if (!section) return;
      const items = section.items || [];
      const updatedItems = [...items, { title: `Feature #${items.length + 1}`, description: 'Feature details and information' }];
      handleUpdateSection(sectionId, { items: updatedItems });
    };

    const handleUpdateSectionItem = (sectionId: string, itemIdx: number, itemFields: Partial<WebsitePageSectionItem>) => {
      if (!selectedPage) return;
      const section = selectedPage.sections.find(s => s.id === sectionId);
      if (!section || !section.items) return;
      const updatedItems = section.items.map((it, idx) => idx === itemIdx ? { ...it, ...itemFields } : it);
      handleUpdateSection(sectionId, { items: updatedItems });
    };

    const handleDeleteSectionItem = (sectionId: string, itemIdx: number) => {
      if (!selectedPage) return;
      const section = selectedPage.sections.find(s => s.id === sectionId);
      if (!section || !section.items) return;
      const updatedItems = section.items.filter((_, idx) => idx !== itemIdx);
      handleUpdateSection(sectionId, { items: updatedItems });
    };

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Custom Page & Modular Section Builder</h3>
            <p className="text-xs text-slate-500">Create new public pages, edit modular sections, or permanently delete custom sections.</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreatingPage(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Create Blank Page
            </button>
          </div>
        </div>

        {/* Quick Template Restore Shortcuts */}
        <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-bold text-blue-900">Modular Page Templates:</span>
            <span className="text-blue-700 ml-2">Need to restore or add the pre-built library or transport modules?</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReaddLibrary}
              className="px-3 py-1.5 bg-white hover:bg-blue-100 text-blue-900 font-bold rounded-lg border border-blue-300 transition cursor-pointer shadow-xs"
            >
              + Add Central Library Hub
            </button>
            <button
              onClick={handleReaddTransport}
              className="px-3 py-1.5 bg-white hover:bg-blue-100 text-blue-900 font-bold rounded-lg border border-blue-300 transition cursor-pointer shadow-xs"
            >
              + Add Transport & Safety
            </button>
          </div>
        </div>

        {isCreatingPage && (
          <form onSubmit={handleCreatePage} className="bg-white p-6 rounded-xl border-2 border-amber-400 shadow-md space-y-4">
            <h4 className="font-bold text-slate-900 text-sm">Create New Custom Web Page</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Page Title <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Science Fair 2026 or Campus Tour"
                  value={newPageTitle}
                  onChange={(e) => {
                    setNewPageTitle(e.target.value);
                    if (!newPageSlug) {
                      setNewPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                    }
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">URL Route Slug <span className="text-rose-500">*</span></label>
                <div className="flex items-center">
                  <span className="px-3 py-2 bg-slate-100 border border-r-0 border-slate-300 rounded-l-lg text-xs text-slate-500 font-mono">
                    /
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="science-fair"
                    value={newPageSlug}
                    onChange={(e) => setNewPageSlug(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-r-lg text-sm font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCreatingPage(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-slate-900 text-white font-bold text-xs rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                Create Page
              </button>
            </div>
          </form>
        )}

        {/* Page selector tab pills */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
          {pages.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPage(p)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                selectedPage?.id === p.id
                  ? 'bg-slate-900 text-amber-400 shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>{p.title}</span>
              <span className="text-[10px] opacity-75 font-mono">/{p.slug}</span>
              {!p.isPublished && (
                <span className="text-[9px] bg-rose-500 text-white px-1 rounded">DRAFT</span>
              )}
            </button>
          ))}
        </div>

        {selectedPage ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xl font-bold text-slate-900">{selectedPage.title}</h4>
                  <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                    selectedPage.isPublished !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {selectedPage.isPublished !== false ? 'Published Online' : 'Unpublished / Draft'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-mono mt-0.5">Route Slug: /{selectedPage.slug}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleUpdatePageSettings({ isPublished: selectedPage.isPublished === false })}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition cursor-pointer ${
                    selectedPage.isPublished !== false
                      ? 'border-slate-300 text-slate-700 hover:bg-slate-100'
                      : 'border-emerald-500 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  {selectedPage.isPublished !== false ? 'Unpublish Page' : 'Publish Page Online'}
                </button>
                <button
                  onClick={() => handleDeletePage(selectedPage.id)}
                  className="px-3.5 py-1.5 text-xs font-bold text-rose-600 border border-rose-200 hover:bg-rose-50 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Custom Page
                </button>
              </div>
            </div>

            {/* Page Metadata Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Page Title</label>
                <input
                  type="text"
                  value={selectedPage.title}
                  onChange={(e) => handleUpdatePageSettings({ title: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">URL Slug</label>
                <input
                  type="text"
                  value={selectedPage.slug}
                  onChange={(e) => handleUpdatePageSettings({ slug: e.target.value.replace(/[^a-z0-9-]/g, '') })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white font-mono"
                />
              </div>
              <div className="flex items-center gap-4 pt-4">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={selectedPage.showInNav !== false}
                    onChange={(e) => handleUpdatePageSettings({ showInNav: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  Show in Navbar
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={selectedPage.showInFooter !== false}
                    onChange={(e) => handleUpdatePageSettings({ showInFooter: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  Show in Footer
                </label>
              </div>
            </div>

            {/* Modular Section list */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Page Sections ({selectedPage.sections.length})
                </h5>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs text-slate-500 font-medium">Add Section:</span>
                  {(['hero', 'text', 'features', 'cards', 'faq', 'cta'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => handleAddSection(type)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded cursor-pointer"
                    >
                      + {type.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {selectedPage.sections.map((sec, idx) => {
                const secTitle = sec.title || sec.heading || '';
                const secSubtitle = sec.subtitle || sec.subheading || '';
                return (
                  <div key={sec.id} className="p-5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded bg-slate-900 text-amber-400">
                          #{idx + 1} {sec.type.toUpperCase()} SECTION
                        </span>
                        <span className="text-xs text-slate-500 font-bold truncate max-w-xs">{secTitle}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDeleteSection(sec.id)}
                          className="px-2.5 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded cursor-pointer transition flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete Section
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Section Title / Heading</label>
                        <input
                          type="text"
                          value={secTitle}
                          onChange={(e) => handleUpdateSection(sec.id, { title: e.target.value, heading: e.target.value })}
                          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Subtitle / Badge Tag</label>
                        <input
                          type="text"
                          value={secSubtitle}
                          onChange={(e) => handleUpdateSection(sec.id, { subtitle: e.target.value, subheading: e.target.value })}
                          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-800"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1">Content / Paragraph</label>
                        <textarea
                          rows={3}
                          value={sec.content || ''}
                          onChange={(e) => handleUpdateSection(sec.id, { content: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-800"
                        />
                      </div>

                      {/* Optional Action Button */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Button Label (Optional)</label>
                        <input
                          type="text"
                          value={sec.buttonText || ''}
                          onChange={(e) => handleUpdateSection(sec.id, { buttonText: e.target.value })}
                          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-800"
                          placeholder="e.g. Apply Now or Learn More"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Button Link Destination</label>
                        <input
                          type="text"
                          value={sec.buttonLink || ''}
                          onChange={(e) => handleUpdateSection(sec.id, { buttonLink: e.target.value })}
                          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 font-mono"
                          placeholder="e.g. admissions or contact"
                        />
                      </div>

                      {/* Section Graphic / Image */}
                      {(sec.type === 'hero' || sec.type === 'cta' || sec.type === 'text') && (
                        <div className="md:col-span-2">
                          <DeviceFileUpload
                            label={sec.type === 'hero' ? 'Hero Background Graphic' : 'Section Featured Graphic / Image'}
                            fileType="image"
                            value={sec.imageUrl || ''}
                            onChange={(url) => handleUpdateSection(sec.id, { imageUrl: url })}
                            onClear={() => handleUpdateSection(sec.id, { imageUrl: '' })}
                            helperText="Upload background or featured graphic (JPG, PNG, WebP) from device or enter image link"
                          />
                        </div>
                      )}

                      {/* Section Items for Features, Cards, FAQ */}
                      {(sec.type === 'features' || sec.type === 'cards' || sec.type === 'faq') && (
                        <div className="md:col-span-2 p-4 bg-white rounded-xl border border-slate-200 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs uppercase text-slate-700">
                              Modular Items / Cards ({sec.items?.length || 0})
                            </span>
                            <button
                              type="button"
                              onClick={() => handleAddSectionItem(sec.id)}
                              className="px-2.5 py-1 bg-blue-600 text-white font-bold text-xs rounded hover:bg-blue-700 cursor-pointer"
                            >
                              + Add Item
                            </button>
                          </div>

                          <div className="space-y-2">
                            {(sec.items || []).map((it, itemIdx) => (
                              <div key={itemIdx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-bold uppercase text-slate-500">Item #{itemIdx + 1}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteSectionItem(sec.id, itemIdx)}
                                    className="text-rose-500 hover:text-rose-700 text-xs"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  <input
                                    type="text"
                                    value={it.title || ''}
                                    onChange={(e) => handleUpdateSectionItem(sec.id, itemIdx, { title: e.target.value })}
                                    className="px-2.5 py-1 border border-slate-300 rounded text-xs bg-white"
                                    placeholder="Item Title"
                                  />
                                  <input
                                    type="text"
                                    value={it.description || ''}
                                    onChange={(e) => handleUpdateSectionItem(sec.id, itemIdx, { description: e.target.value })}
                                    className="px-2.5 py-1 border border-slate-300 rounded text-xs bg-white"
                                    placeholder="Item Description"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500 text-sm">
            No custom pages currently exist. Click &quot;Create Blank Page&quot; or use one of the templates above.
          </div>
        )}
      </div>
    );
  };

  // ----------------------------------------------------
  // 13. WEBSITE INQUIRIES & ADMISSION LEADS
  // ----------------------------------------------------
  const InquiriesTab = () => {
    const contactMessages = website.contactMessages || [];
    const admissionInquiries = website.admissionInquiries || [];
    const [subTab, setSubTab] = useState<'contact' | 'admissions'>('admissions');

    const handleMarkContactStatus = (id: string, status: 'read' | 'replied') => {
      const updatedMessages = contactMessages.map(m => m.id === id ? { ...m, status } : m);
      handleSaveWebsite({ ...website, contactMessages: updatedMessages }, 'Message status updated!');
    };

    const handleDeleteContact = (id: string) => {
      requestConfirmDelete(
        'Delete Contact Message',
        'Are you sure you want to delete this contact message record?',
        () => {
          const updatedMessages = contactMessages.filter(m => m.id !== id);
          handleSaveWebsite({ ...website, contactMessages: updatedMessages }, 'Message removed!');
        }
      );
    };

    const handleMarkInquiryStatus = (id: string, status: 'submitted' | 'reviewed' | 'contacted' | 'admitted' | 'rejected') => {
      const updatedInquiries = admissionInquiries.map(i => i.id === id ? { ...i, status } : i);
      handleSaveWebsite({ ...website, admissionInquiries: updatedInquiries }, 'Admission inquiry status updated!');
    };

    const handleDeleteInquiry = (id: string) => {
      requestConfirmDelete(
        'Delete Admission Application',
        'Are you sure you want to delete this admission application inquiry record?',
        () => {
          const updatedInquiries = admissionInquiries.filter(i => i.id !== id);
          handleSaveWebsite({ ...website, admissionInquiries: updatedInquiries }, 'Inquiry removed!');
        }
      );
    };

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Website Inquiries & Admission Applications</h3>
            <p className="text-xs text-slate-500">Review prospective student applications and public contact form submissions.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSubTab('admissions')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                subTab === 'admissions'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Admission Applications ({admissionInquiries.length})
            </button>
            <button
              onClick={() => setSubTab('contact')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                subTab === 'contact'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Contact Messages ({contactMessages.length})
            </button>
          </div>
        </div>

        {subTab === 'admissions' ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {admissionInquiries.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {admissionInquiries.map((inq) => (
                  <div key={inq.id} className="p-4 hover:bg-slate-50/50 flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{inq.studentName}</span>
                        <span className="text-xs text-slate-500">(Guardian: {inq.guardianName})</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          inq.status === 'admitted'
                            ? 'bg-emerald-100 text-emerald-800'
                            : inq.status === 'reviewed'
                            ? 'bg-blue-100 text-blue-800'
                            : inq.status === 'contacted'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {inq.status.toUpperCase()}
                        </span>
                        <span className="text-xs text-slate-400">
                          {inq.submittedAt || inq.createdAt}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 flex flex-wrap items-center gap-4">
                        <span><Phone className="w-3 h-3 inline mr-1 text-slate-400" />{inq.guardianPhone || inq.phone}</span>
                        {(inq.guardianEmail || inq.email) && <span><Mail className="w-3 h-3 inline mr-1 text-slate-400" />{inq.guardianEmail || inq.email}</span>}
                        <span className="font-semibold text-slate-800">Target Class: {inq.desiredClass || inq.applyingClass}</span>
                        {inq.shiftPreference && <span>Shift: {inq.shiftPreference}</span>}
                        {inq.address && <span>Address: {inq.address}</span>}
                      </div>
                      {inq.notes && (
                        <p className="text-xs text-slate-700 mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          Notes: {inq.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={inq.status}
                        onChange={(e) => handleMarkInquiryStatus(inq.id, e.target.value as any)}
                        className="text-xs border border-slate-300 rounded px-2.5 py-1 font-semibold text-slate-700 bg-white"
                      >
                        <option value="pending">Pending</option>
                        <option value="submitted">Submitted</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="contacted">Contacted</option>
                        <option value="admitted">Admitted</option>
                        <option value="rejected">Rejected</option>
                      </select>
                      <button
                        onClick={() => handleDeleteInquiry(inq.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 cursor-pointer"
                        title="Delete Application"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 text-sm">No online admission inquiries received yet.</div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {contactMessages.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {contactMessages.map((msg) => (
                  <div key={msg.id} className="p-4 hover:bg-slate-50/50 flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{msg.name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          msg.status === 'unread' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {msg.status.toUpperCase()}
                        </span>
                        <span className="text-xs text-slate-400">
                          {msg.createdAt || msg.submittedAt}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 flex items-center gap-4">
                        <span><Mail className="w-3 h-3 inline mr-1 text-slate-400" />{msg.email}</span>
                        {msg.phone && <span><Phone className="w-3 h-3 inline mr-1 text-slate-400" />{msg.phone}</span>}
                        <span className="font-semibold text-slate-700">Subject: {msg.subject}</span>
                      </div>
                      <p className="text-xs text-slate-700 mt-2 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed whitespace-pre-line">
                        {msg.message}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {msg.status === 'unread' ? (
                        <button
                          onClick={() => handleMarkContactStatus(msg.id, 'read')}
                          className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded hover:bg-emerald-100 cursor-pointer"
                        >
                          Mark Read
                        </button>
                      ) : (
                        <button
                          onClick={() => handleMarkContactStatus(msg.id, 'replied')}
                          className="px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100 cursor-pointer"
                        >
                          Mark Replied
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteContact(msg.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 text-sm">No contact messages received yet.</div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-2xl shadow-md border border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold uppercase tracking-wider mb-2">
            Dynamic Public Website CMS
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">Website Management & Content Studio</h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Complete real-time control over logo, branding, banners, teachers, committee, notices, student achievers, custom pages, and inquiries.
          </p>
        </div>

        <button
          onClick={onViewLiveSite}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          <Eye className="w-4 h-4" />
          View Live Website
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Save feedback alert */}
      {saveSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* CMS Navigation Tabs Bar */}
      <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/90 p-1.5 rounded-xl border border-slate-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <LayoutTemplate className="w-3.5 h-3.5 text-amber-600" />
          Overview
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-blue-600" />
          Branding & Logo
        </button>

        <button
          onClick={() => setActiveTab('navigation')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'navigation'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-blue-600" />
          Navigation & Menus ({website.navigation?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('banners')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'banners'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-purple-600" />
          Hero Banners ({website.banners?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('principal')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'principal'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
          Principal Desk
        </button>

        <button
          onClick={() => setActiveTab('about')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'about'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Building2 className="w-3.5 h-3.5 text-cyan-600" />
          About Us ({website.about.facilities?.length || 0} Facilities)
        </button>

        <button
          onClick={() => setActiveTab('faculty')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'faculty'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-indigo-600" />
          Teachers & Staff ({website.faculty?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('committee')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'committee'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          Committee ({website.committee?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('notices')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'notices'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Bell className="w-3.5 h-3.5 text-rose-600" />
          Notices ({website.notices?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('news')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'news'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Newspaper className="w-3.5 h-3.5 text-emerald-600" />
          News & Events ({website.news?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('awards')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'awards'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-amber-600" />
          Student Achievers ({website.awards?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('gallery')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'gallery'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5 text-teal-600" />
          Gallery ({website.gallery?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('downloads')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'downloads'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Download className="w-3.5 h-3.5 text-slate-600" />
          Downloads ({website.downloads?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('pages')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'pages'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <FileCode2 className="w-3.5 h-3.5 text-amber-600" />
          Page Builder ({website.customPages?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('inquiries')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'inquiries'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Inbox className="w-3.5 h-3.5 text-rose-500" />
          Inquiries ({(website.contactMessages?.length || 0) + (website.admissionInquiries?.length || 0)})
        </button>
      </div>

      {/* Main Tab Panels */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Live Website Status</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <div className="text-xl font-black text-slate-900 mt-2">Active & Online</div>
              <p className="text-xs text-slate-500 mt-1">Ready for public visits</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Hero Banners</span>
                <Sliders className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 mt-2">{website.banners?.length || 0}</div>
              <p className="text-xs text-slate-500 mt-1">Carousels on homepage</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Notices</span>
                <Bell className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 mt-2">{website.notices?.length || 0}</div>
              <p className="text-xs text-slate-500 mt-1">Published announcements</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Online Inquiries</span>
                <Inbox className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 mt-2">
                {(website.contactMessages?.length || 0) + (website.admissionInquiries?.length || 0)}
              </div>
              <p className="text-xs text-slate-500 mt-1">Prospective leads received</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 text-base">Quick Action Shortcuts</h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <button
                  onClick={() => setActiveTab('settings')}
                  className="p-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-left font-semibold text-slate-800 border border-slate-200 transition cursor-pointer"
                >
                  🏫 Manage School Logo & Contacts
                </button>
                <button
                  onClick={() => setActiveTab('notices')}
                  className="p-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-left font-semibold text-slate-800 border border-slate-200 transition cursor-pointer"
                >
                  📢 Publish Urgent Exam Notice
                </button>
                <button
                  onClick={() => setActiveTab('banners')}
                  className="p-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-left font-semibold text-slate-800 border border-slate-200 transition cursor-pointer"
                >
                  🖼️ Add Hero Admission Banner
                </button>
                <button
                  onClick={() => setActiveTab('faculty')}
                  className="p-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-left font-semibold text-slate-800 border border-slate-200 transition cursor-pointer"
                >
                  👨‍🏫 Add Teacher or Staff Profile
                </button>
                <button
                  onClick={() => setActiveTab('awards')}
                  className="p-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-left font-semibold text-slate-800 border border-slate-200 transition cursor-pointer"
                >
                  🏆 Add Student Achiever / Award
                </button>
                <button
                  onClick={() => setActiveTab('pages')}
                  className="p-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-left font-semibold text-slate-800 border border-slate-200 transition cursor-pointer"
                >
                  📄 Build Custom Institutional Page
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="font-bold text-slate-900 text-base">Recent Online Inquiries</h3>
              <div className="space-y-2">
                {website.admissionInquiries && website.admissionInquiries.length > 0 ? (
                  website.admissionInquiries.slice(0, 3).map((inq) => (
                    <div key={inq.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex justify-between items-center">
                      <div>
                        <span className="font-bold text-slate-900">{inq.studentName}</span>
                        <span className="text-slate-500 ml-2">Class: {inq.desiredClass || inq.applyingClass}</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                        {inq.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">No admission inquiries logged yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && <SettingsTab />}
      {activeTab === 'navigation' && <NavigationTab />}
      {activeTab === 'banners' && <BannersTab />}
      {activeTab === 'principal' && <PrincipalTab />}
      {activeTab === 'about' && <AboutTab />}
      {activeTab === 'faculty' && <FacultyTab />}
      {activeTab === 'committee' && <CommitteeTab />}
      {activeTab === 'notices' && <NoticesTab />}
      {activeTab === 'news' && <NewsTab />}
      {activeTab === 'awards' && <AwardsTab />}
      {activeTab === 'gallery' && <GalleryTab />}
      {activeTab === 'downloads' && <DownloadsTab />}
      {activeTab === 'pages' && <CustomPagesTab />}
      {activeTab === 'inquiries' && <InquiriesTab />}

      {/* Global in-app deletion confirmation modal (safe in iFrames) */}
      {deleteConfirm?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 text-center mb-2">
                {deleteConfirm.title}
              </h3>
              <p className="text-xs text-slate-600 text-center mb-6 leading-relaxed">
                {deleteConfirm.message}
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const action = deleteConfirm.onConfirm;
                    setDeleteConfirm(null);
                    action();
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 font-bold text-xs text-white shadow-sm transition cursor-pointer"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
