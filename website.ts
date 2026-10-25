export interface WebsiteBanner {
  id: string;
  title: string;
  subtitle: string;
  description?: string;
  tag?: string;
  imageUrl: string;
  buttonText: string;
  buttonLink: string;
  order: number;
  isActive: boolean;
}

export interface WebsitePrincipalMessage {
  title?: string;
  name: string;
  designation: string;
  photoUrl?: string;
  content?: string;
  message?: string;
  quote?: string;
  qualification?: string;
  isPublished?: boolean;
}

export interface WebsiteFacility {
  id: string;
  title: string;
  description: string;
  iconName?: string;
  imageUrl?: string;
  order: number;
}

export interface WebsiteHistoryMilestone {
  year: string;
  title: string;
  description: string;
}

export interface WebsiteAboutSection {
  history: string;
  historyMilestones?: WebsiteHistoryMilestone[];
  milestones?: WebsiteHistoryMilestone[];
  mission: string;
  vision: string;
  objectives?: string[];
  facilities: WebsiteFacility[];
  achievementsSummary?: string;
}

export interface WebsiteFacultyProfile {
  id: string;
  name: string;
  designation: string;
  department: string;
  subject?: string;
  qualification: string;
  photoUrl: string;
  bio?: string;
  email?: string;
  phone?: string;
  order: number;
  isPublished?: boolean;
}

export interface WebsiteCommitteeMember {
  id: string;
  name: string;
  position: string;
  photoUrl: string;
  bio?: string;
  email?: string;
  phone?: string;
  order: number;
  isPublished?: boolean;
}

export interface WebsiteFeaturedAward {
  id: string;
  studentName: string;
  classGrade?: string;
  awardTitle?: string;
  title?: string;
  year: string;
  category?: string;
  description: string;
  photoUrl?: string;
  isPublished?: boolean;
}

export interface WebsiteNotice {
  id: string;
  title: string;
  content: string;
  category: 'Academic' | 'Administrative' | 'Admission' | 'Exam' | 'General' | 'Examination' | 'Holiday' | 'Event' | string;
  publishDate?: string;
  date?: string;
  expiryDate?: string;
  pdfUrl?: string;
  fileUrl?: string;
  isPinned: boolean;
  isImportant?: boolean;
  isPublished?: boolean;
}

export interface WebsiteNewsArticle {
  id: string;
  title: string;
  type?: 'news' | 'event' | string;
  summary?: string;
  content: string;
  imageUrl?: string;
  date: string;
  eventLocation?: string;
  location?: string;
  author?: string;
  isPublished?: boolean;
}

export interface WebsiteGalleryItem {
  id: string;
  url?: string;
  imageUrl?: string;
  title?: string;
  caption?: string;
  category: string;
  order?: number;
  date?: string;
}

export interface WebsiteGalleryAlbum {
  id: string;
  title: string;
  category: string;
  coverUrl: string;
  images: WebsiteGalleryItem[];
  isPublished?: boolean;
}

export interface WebsiteDownloadItem {
  id: string;
  title: string;
  category: string;
  fileUrl: string;
  fileSize?: string;
  fileType?: string;
  description?: string;
  publishDate?: string;
  order?: number;
  isPublished?: boolean;
}

export interface WebsiteContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  submittedAt?: string;
  createdAt?: string;
  status: 'unread' | 'read' | 'replied';
  notes?: string;
}

export interface WebsiteAdmissionInquiry {
  id: string;
  studentName: string;
  gender?: string;
  dateOfBirth?: string;
  applyingClass?: string;
  desiredClass?: string;
  shiftPreference?: string;
  desiredShift?: string;
  desiredGroup?: string;
  guardianName: string;
  guardianPhone?: string;
  phone?: string;
  guardianEmail?: string;
  email?: string;
  address?: string;
  previousSchool?: string;
  submittedAt?: string;
  createdAt?: string;
  message?: string;
  status: 'pending' | 'submitted' | 'reviewed' | 'contacted' | 'admitted' | 'rejected' | string;
  notes?: string;
}

export interface WebsitePageSectionItem {
  title: string;
  description: string;
  icon?: string;
  link?: string;
  imageUrl?: string;
}

export interface WebsitePageSection {
  id: string;
  type: 'text' | 'hero' | 'features' | 'cards' | 'faq' | 'downloads' | 'cta' | string;
  title?: string;
  heading?: string;
  subtitle?: string;
  subheading?: string;
  content?: string;
  imageUrl?: string;
  buttonText?: string;
  buttonLink?: string;
  items?: WebsitePageSectionItem[];
  order: number;
  isActive?: boolean;
}

export interface WebsiteCustomPage {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  metaDescription?: string;
  showInNav?: boolean;
  showInFooter?: boolean;
  navOrder?: number;
  isPublished?: boolean;
  updatedAt: string;
  sections: WebsitePageSection[];
}

export interface WebsiteSettings {
  schoolName: string;
  schoolNameBn?: string;
  shortName?: string;
  shortNameBn?: string;
  motto?: string;
  mottoBn?: string;
  logoUrl?: string;
  faviconUrl?: string;
  address?: string;
  addressBn?: string;
  phone?: string;
  email?: string;
  admissionEmail?: string;
  schoolDescription?: string;
  schoolDescriptionBn?: string;
  establishedYear?: string;
  eiin?: string;
  principalName?: string;
  principalNameBn?: string;
  openingHours?: string;
  officeHours?: string;
  facebook?: string;
  facebookUrl?: string;
  youtube?: string;
  youtubeUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  footerText?: string;
  copyrightText?: string;
  isPublished?: boolean;
  themePrimaryColor?: string;
  themeAccentColor?: string;
  googleMapEmbedUrl?: string;
  mapEmbedUrl?: string;
  showAdmissionBanner?: boolean;
  admissionsOpen?: boolean;
  admissionBannerText?: string;
  emergencyNotice?: string;
  showEmergencyNotice?: boolean;
  academicSession?: string;
  admissionHelpline?: string;
}

export interface WebsiteStatistics {
  totalStudentsManual?: number;
  totalTeachersManual?: number;
  totalStudents?: number;
  totalTeachers?: number;
  totalClassrooms?: number;
  classroomsAndLabs?: number;
  passRatePercentage?: number;
  passRate?: string | number;
  yearsOfExcellence?: number;
  clubsAndActivities?: number;
  useLiveStudentCount?: boolean;
  useLiveTeacherCount?: boolean;
}

export interface WebsiteNavigationDropdownItem {
  id: string;
  labelEn: string;
  labelBn?: string;
  destination: string; // e.g. 'about', 'principal-message', 'faculty', 'committee', or external URL
  isExternal?: boolean;
  externalUrl?: string;
  openInNewTab?: boolean;
  isActive: boolean;
  order: number;
}

export interface WebsiteNavigationItem {
  id: string;
  labelEn: string;
  labelBn?: string;
  destination: string; // e.g. 'home', 'about', 'academics', 'admissions', 'results', 'notices', 'news', 'gallery', 'contact', custom slug, or external url
  isExternal?: boolean;
  externalUrl?: string;
  openInNewTab?: boolean;
  isActive: boolean;
  order: number;
  hasDropdown?: boolean;
  dropdownItems?: WebsiteNavigationDropdownItem[];
  iconName?: string;
}

export interface WebsiteData {
  settings: WebsiteSettings;
  statistics: WebsiteStatistics;
  navigation?: WebsiteNavigationItem[];
  banners: WebsiteBanner[];
  principalMessage: WebsitePrincipalMessage;
  about: WebsiteAboutSection;
  facultyProfiles?: WebsiteFacultyProfile[];
  faculty?: WebsiteFacultyProfile[];
  committeeMembers?: WebsiteCommitteeMember[];
  committee?: WebsiteCommitteeMember[];
  featuredAwards?: WebsiteFeaturedAward[];
  awards?: WebsiteFeaturedAward[];
  notices: WebsiteNotice[];
  newsArticles?: WebsiteNewsArticle[];
  news?: WebsiteNewsArticle[];
  galleryAlbums?: WebsiteGalleryAlbum[];
  gallery?: WebsiteGalleryItem[];
  downloads: WebsiteDownloadItem[];
  customPages: WebsiteCustomPage[];
  contactMessages: WebsiteContactMessage[];
  admissionInquiries: WebsiteAdmissionInquiry[];
}
