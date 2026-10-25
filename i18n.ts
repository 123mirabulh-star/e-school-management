export type Language = 'en' | 'bn';

const LANG_STORAGE_KEY = 'ebiddalay_lang_pref';

export function getStoredLanguage(): Language {
  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (saved === 'bn' || saved === 'en') {
      return saved;
    }
  } catch {
    // Storage access error fallback
  }
  return 'en';
}

export function setStoredLanguage(lang: Language): void {
  try {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch {
    // Storage access error fallback
  }
}

export function toBengaliNumeral(num: number | string): string {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, (d) => bnDigits[Number(d)]);
}

export function formatNumber(val: number | string | undefined | null, lang: Language = 'en'): string {
  if (val === undefined || val === null || val === '') return '';
  if (lang === 'bn') {
    return toBengaliNumeral(val);
  }
  return String(val);
}

/**
 * Resolves a field dynamically based on current language:
 * If language is 'bn' and the object has a non-empty field with 'Bn' suffix, it uses that;
 * otherwise it cleanly falls back to the original field.
 * Never modifies or machine-translates user content.
 */
export function getLocalizedField(obj: any, fieldName: string, lang: Language = 'en'): string {
  if (!obj || typeof obj !== 'object') return '';
  if (lang === 'bn') {
    const bnVal = obj[`${fieldName}Bn`];
    if (bnVal && typeof bnVal === 'string' && bnVal.trim()) {
      return bnVal;
    }
  }
  return obj[fieldName] || '';
}

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Header & Brand
    'nav.home': 'Home',
    'nav.about': 'About Us',
    'nav.about.overview': 'Overview & History',
    'nav.about.principal': 'Message from Principal',
    'nav.about.faculty': 'Teachers & Staff',
    'nav.about.committee': 'Managing Committee',
    'nav.academics': 'Academics',
    'nav.admissions': 'Admissions',
    'nav.results': 'Results & Downloads',
    'nav.notices': 'Notices',
    'nav.news': 'News & Events',
    'nav.gallery': 'Photo Gallery',
    'nav.contact': 'Contact Us',
    'nav.online_admission': 'Online Admission',
    'nav.portal_login': 'Portal Login',
    'nav.admin_dashboard': 'Admin Dashboard',
    'nav.eiin': 'EIIN',
    'nav.est': 'Est.',
    'nav.emergency_notice': 'Notice',

    // Hero & Home Section Headings
    'home.hero.admissions_open': 'Admissions Open',
    'home.hero.apply_now': 'Apply for Admission',
    'home.hero.view_notices': 'View Notice Board',
    'home.stats.students': 'Enrolled Students',
    'home.stats.teachers': 'Experienced Educators',
    'home.stats.pass_rate': 'Board Exam Success',
    'home.stats.established': 'Years of Heritage',
    'home.principal.badge': 'Leadership & Vision',
    'home.principal.heading': 'Secretariat & Principal’s Message',
    'home.principal.read_full': 'Read Full Welcome Message',
    'home.notices.badge': 'Circulars & Bulletins',
    'home.notices.heading': 'Notice Board',
    'home.notices.subheading': 'Important circulars, routine updates, and administrative bulletins.',
    'home.notices.view_all': 'View All Notices',
    'home.notices.download_pdf': 'Download PDF',
    'home.notices.pinned': 'Pinned Circular',
    'home.news.badge': 'Campus Highlights',
    'home.news.heading': 'News & Events',
    'home.news.subheading': 'Discover the vibrant cultural, scientific, and athletic achievements of our students.',
    'home.news.view_all': 'View All News',
    'home.news.read_more': 'Read Full Article',
    'home.gallery.badge': 'Campus Archives',
    'home.gallery.heading': 'Photo Gallery',
    'home.gallery.view_all': 'Explore Gallery',
    'home.gallery.click_to_view': 'Click to view photo',
    'home.awards.badge': 'Excellence & Accolades',
    'home.awards.heading': 'Student Achievements & Awards',
    'home.cta.heading': 'Join Our Vibrant Academic Community',
    'home.cta.subheading': 'Admissions are open for the upcoming academic session. Experience world-class education rooted in ethics and innovation.',
    'home.cta.apply_btn': 'Start Online Application',
    'home.cta.contact_btn': 'Contact Admissions Desk',

    // About Page
    'about.badge': 'About Our Institution',
    'about.heading': 'Legacy of Academic Excellence & Moral Integrity',
    'about.history.title': 'Our Founding History & Heritage',
    'about.mission.title': 'Our Mission',
    'about.vision.title': 'Our Vision',
    'about.milestones.title': 'Historical Milestones',
    'about.facilities.title': 'World-Class Campus Facilities',

    // Principal Page
    'principal.badge': 'From the Principal’s Secretariat',
    'principal.heading': 'Welcome Address & Institutional Vision',
    'principal.credentials': 'Educational Credentials & Leadership',
    'principal.quote_label': 'Visionary Statement',

    // Faculty Page
    'faculty.badge': 'Academic Faculty & Educators',
    'faculty.heading': 'Teachers & Staff Directory',
    'faculty.subheading': 'Meet our passionate, highly qualified educators dedicated to mentoring every student toward academic brilliance.',
    'faculty.search_placeholder': 'Search teacher by name or subject...',
    'faculty.all_departments': 'All Departments',
    'faculty.no_results': 'No faculty members found matching your search.',
    'faculty.qualification': 'Qualification',

    // Committee Page
    'committee.badge': 'Governance & Oversight',
    'committee.heading': 'School Managing Committee',
    'committee.subheading': 'Guiding our institution with principled leadership, strategic vision, and continuous community engagement.',

    // Academics Page
    'academics.badge': 'Academic Structure & Excellence',
    'academics.heading': 'Curriculum, Shifts & Academic System',
    'academics.subheading': 'Structured according to the National Curriculum and Textbook Board (NCTB) with advanced STEM, language, and moral enrichment.',
    'academics.streams_title': 'Classes & Academic Streams Offered',
    'academics.shifts_title': 'Institutional Shifts & Hours',
    'academics.grading_title': 'National Grading Standard (GPA 5.00)',
    'academics.grade_col': 'Grade',
    'academics.marks_col': 'Marks Range',
    'academics.point_col': 'Grade Point',
    'academics.remarks_col': 'Assessment Remarks',

    // Notices Page
    'notices.badge': 'Official Circulars & Bulletins',
    'notices.heading': 'Notice Board',
    'notices.subheading': 'Stay informed with the latest institutional circulars, board exam directives, admission schedules, and school announcements.',
    'notices.search_placeholder': 'Search circulars by keyword...',
    'notices.all_notices': 'All Notices',
    'notices.view_details': 'View Details',
    'notices.published_on': 'Published',
    'notices.attachment': 'Attached Official Document / Circular PDF',
    'notices.download_attachment': 'Download Attachment',
    'notices.close': 'Close',

    // News Page
    'news.badge': 'Media & Chronicles',
    'news.heading': 'School News & Upcoming Events',
    'news.subheading': 'Latest chronicles, science fair highlights, athletic achievements, and cultural celebrations.',
    'news.search_placeholder': 'Search articles or events...',
    'news.location': 'Location',

    // Gallery Page
    'gallery.badge': 'Visual Memories',
    'gallery.heading': 'Photo & Media Gallery',
    'gallery.subheading': 'A glimpse into daily campus life, scientific discoveries, cultural harmonies, and athletic triumphs.',
    'gallery.all_photos': 'All Photos',
    'gallery.empty': 'No gallery images available for this category.',

    // Admissions Page
    'admissions.badge': 'Join Our Institution',
    'admissions.heading': 'Student Admission & Enrollment',
    'admissions.subheading': 'We welcome aspiring scholars to embark on a journey of academic rigor, character development, and future readiness.',
    'admissions.form_title': 'Online Admission Application / Inquiry',
    'admissions.form_desc': 'Fill out this official inquiry form to initiate the enrollment process. Our admissions team will reach out via phone or email.',
    'admissions.student_name': 'Student Full Name *',
    'admissions.dob': 'Date of Birth *',
    'admissions.gender': 'Gender *',
    'admissions.applying_class': 'Applying for Class *',
    'admissions.shift': 'Preferred Shift *',
    'admissions.guardian_name': 'Parent / Guardian Full Name *',
    'admissions.guardian_phone': 'Guardian Mobile Number *',
    'admissions.guardian_email': 'Guardian Email (Optional)',
    'admissions.prev_school': 'Previous School Attended (If applicable)',
    'admissions.address': 'Residential Address *',
    'admissions.submit_btn': 'Submit Online Admission Form',
    'admissions.success_heading': 'Application Submitted Successfully!',
    'admissions.success_message': 'Thank you for your interest. Your inquiry tracking reference is:',

    // Results & Downloads Page
    'results.badge': 'Academic Assessment & Verification',
    'results.heading': 'Public Examination Results & Downloads',
    'results.subheading': 'Search and verify official semester and term examination results published by the institution.',
    'results.portal_title': 'Online Result Verification Portal',
    'results.exam_label': 'Examination *',
    'results.class_label': 'Class / Grade *',
    'results.roll_label': 'Class Roll No. / Student ID *',
    'results.search_btn': 'Search Result',
    'results.reset_btn': 'Reset Form',
    'results.not_found': 'No official result found matching the entered criteria. Please check the roll number and examination.',
    'results.student_details': 'Student Particulars',
    'results.gpa': 'GPA',
    'results.grade': 'Grade',
    'results.marksheet_title': 'Official Mark Sheet',
    'results.print_btn': 'Print Mark Sheet',
    'results.download_btn': 'Download PDF',
    'results.downloads_title': 'Downloads & Academic Forms',
    'results.downloads_desc': 'Download syllabus, academic calendar, admission forms, and fee structures.',
    'results.download_action': 'Download',

    // Contact Page
    'contact.badge': 'Get in Touch',
    'contact.heading': 'Contact & Campus Location',
    'contact.subheading': 'Have inquiries regarding admissions, academics, or institutional policies? We are here to assist you.',
    'contact.address': 'Campus Address',
    'contact.phone': 'Phone Number',
    'contact.email': 'Official Email',
    'contact.hours': 'Office Hours',
    'contact.form_title': 'Send Us a Direct Message',
    'contact.name': 'Your Full Name *',
    'contact.your_email': 'Your Email Address *',
    'contact.your_phone': 'Your Phone Number *',
    'contact.subject': 'Subject of Inquiry *',
    'contact.message': 'Your Message / Inquiry *',
    'contact.send_btn': 'Send Message',
    'contact.success': 'Your message has been sent successfully! Our administrative secretariat will reply promptly.',

    // Footer
    'footer.quick_links': 'Quick Navigation',
    'footer.academic_links': 'Academic & Portals',
    'footer.contact_info': 'Institutional Contact',
    'footer.rights': 'All Rights Reserved.',
    'footer.motto': 'Empowering future leaders through education and moral character.',

    // Custom Pages (Library & Transport)
    'library.badge': 'Knowledge Hub',
    'library.heading': 'Central Library & Digital Archives',
    'library.subheading': 'A sanctuary of over 15,000 printed titles, literary classics, and modern research resources.',
    'library.rules_btn': 'View Library Guidelines',
    'transport.badge': 'Campus Safety & Logistics',
    'transport.heading': 'Transport Services & Campus Safety',
    'transport.subheading': 'Ensuring safe, comfortable, and punctually monitored journeys for our students across Dhaka.',
    'transport.contact_btn': 'Contact Transport Desk',

    // Admin Panel Interface
    'admin.switch_to_website': 'Return to Public Website',
    'admin.session_active': 'Administrator Session Active:',
    'admin.website_cms': 'Website Management CMS',
    'admin.sidebar.dashboard': 'Dashboard',
    'admin.sidebar.website_management': 'Website Management',
    'admin.sidebar.students': 'Students Directory',
    'admin.sidebar.admissions': 'New Admission',
    'admin.sidebar.classes': 'Classes & Sections',
    'admin.sidebar.subjects': 'Dynamic Subjects',
    'admin.sidebar.group_settings': 'Group Settings',
    'admin.sidebar.teachers': 'Teachers',
    'admin.sidebar.staff': 'Office Staff',
    'admin.sidebar.attendance': 'Daily Attendance',
    'admin.sidebar.fee_structure': 'Fee Structure',
    'admin.sidebar.fee_collection': 'Fee Collection',
    'admin.sidebar.payments': 'Payment Records',
    'admin.sidebar.income_expenses': 'Income & Expense',
    'admin.sidebar.examinations': 'Examinations',
    'admin.sidebar.mark_distribution': 'Mark Distribution',
    'admin.sidebar.mark_conversion': 'Mark Conversion',
    'admin.sidebar.marks_entry': 'Marks Entry',
    'admin.sidebar.results': 'Results & Mark Sheets',
    'admin.sidebar.promotion': 'Student Promotion',
    'admin.sidebar.grading_settings': 'Grading Settings',
    'admin.sidebar.class_routine': 'Class Routine',
    'admin.sidebar.notices': 'Notice Board',
    'admin.sidebar.reports': 'Reports & Exports',
    'admin.sidebar.users': 'User Management',
    'admin.sidebar.access_requests': 'License & Access Requests',
    'admin.sidebar.audit_logs': 'System Audit Logs',
    'admin.sidebar.backup_restore': 'Backup & Restore',
    'admin.sidebar.school_settings': 'School Settings',
    'admin.sidebar.code_zip': 'Export Project ZIP',
    'admin.sidebar.logout': 'Sign Out',
    'admin.sidebar.search_placeholder': 'Search navigation...',
    'admin.quick_action': 'Quick Action',
    'admin.fast_nav': 'Fast Navigation',
    'admin.profile_security': 'Profile Photo & Security',
    'admin.manage_access': 'Manage Access Requests',
    'admin.btn.save': 'Save Changes',
    'admin.btn.cancel': 'Cancel',
    'admin.btn.delete': 'Delete',
    'admin.btn.edit': 'Edit',
    'admin.btn.upload': 'Upload File',
    'admin.btn.replace': 'Replace',
    'admin.btn.remove': 'Remove',
    'admin.btn.filter': 'Filter',
    'admin.btn.search': 'Search',
    'admin.btn.refresh': 'Refresh',

    // Nav Groups
    'admin.group.core': 'Core',
    'admin.group.website': 'Public Website & CMS',
    'admin.group.academics': 'Academics & Configuration',
    'admin.group.students': 'Students & Faculty',
    'admin.group.exams': 'Exams & Results',
    'admin.group.finance': 'Finance & Accounts',
    'admin.group.admin': 'Administration & System',

    // Auth Screen
    'auth.portal_title': 'E-Biddalay School Management System',
    'auth.portal_subtitle': 'Administrative Control Center & Secured Academic Database',
    'auth.tab.login': 'Staff & Admin Login',
    'auth.tab.result': 'Student Result Check',
    'auth.tab.register': 'Request Access / Register',
    'auth.tab.status': 'Check Request Status',
    'auth.user_id_label': 'User ID, Mobile Number or Email *',
    'auth.password_label': 'Security Password *',
    'auth.login_btn': 'Authorize & Sign In',
    'auth.return_website': 'Return to Public Website',
    'auth.err_missing': 'Please enter both your User ID and Password.',
    'auth.err_invalid': 'Invalid User ID or Password.',
    'auth.lang_toggle': 'Language:'
  },
  bn: {
    // Header & Brand
    'nav.home': 'হোম',
    'nav.about': 'আমাদের সম্পর্কে',
    'nav.about.overview': 'সংক্ষিপ্ত বিবরণ ও ইতিহাস',
    'nav.about.principal': 'অধ্যক্ষের বাণী',
    'nav.about.faculty': 'শিক্ষক ও কর্মচারী পরিচিতি',
    'nav.about.committee': 'ম্যানেজিং কমিটি',
    'nav.academics': 'শিক্ষা কার্যক্রম',
    'nav.admissions': 'ভর্তি তথ্য',
    'nav.results': 'ফলাফল ও ডাউনলোড',
    'nav.notices': 'নোটিশ বোর্ড',
    'nav.news': 'সংবাদ ও ইভেন্ট',
    'nav.gallery': 'ফটো গ্যালারি',
    'nav.contact': 'যোগাযোগ',
    'nav.online_admission': 'অনলাইন ভর্তি',
    'nav.portal_login': 'পোর্টাল লগইন',
    'nav.admin_dashboard': 'অ্যাডমিন ড্যাশবোর্ড',
    'nav.eiin': 'ইআইআইএন (EIIN)',
    'nav.est': 'স্থাপিত',
    'nav.emergency_notice': 'জরুরি বিজ্ঞপ্তি',

    // Hero & Home Section Headings
    'home.hero.admissions_open': 'ভর্তি চলছে',
    'home.hero.apply_now': 'ভর্তির জন্য আবেদন করুন',
    'home.hero.view_notices': 'নোটিশ বোর্ড দেখুন',
    'home.stats.students': 'অধ্যয়নরত শিক্ষার্থী',
    'home.stats.teachers': 'অভিজ্ঞ শিক্ষক-শিক্ষিকা',
    'home.stats.pass_rate': 'বোর্ড পরীক্ষায় সাফল্য',
    'home.stats.established': 'বছরের গৌরবময় ঐতিহ্য',
    'home.principal.badge': 'নেতৃত্ব ও দর্শন',
    'home.principal.heading': 'অধ্যক্ষ মহোদয়ের বাণী',
    'home.principal.read_full': 'সম্পূর্ণ বার্তা পড়ুন',
    'home.notices.badge': 'সার্কুলার ও বুলেটিন',
    'home.notices.heading': 'নোটিশ বোর্ড',
    'home.notices.subheading': 'সর্বশেষ প্রাতিষ্ঠানিক সার্কুলার, পরীক্ষার সময়সূচি ও জরুরি ঘোষণা।',
    'home.notices.view_all': 'সকল নোটিশ দেখুন',
    'home.notices.download_pdf': 'পিডিএফ ডাউনলোড',
    'home.notices.pinned': 'গুরুত্বপূর্ণ বিজ্ঞপ্তি',
    'home.news.badge': 'ক্যাম্পাস কার্যক্রম',
    'home.news.heading': 'সংবাদ ও ঘটনাবলি',
    'home.news.subheading': 'আমাদের শিক্ষার্থীদের বৈচিত্র্যময় সাংস্কৃতিক, বিজ্ঞান ও ক্রীড়া সাফল্য।',
    'home.news.view_all': 'সকল সংবাদ দেখুন',
    'home.news.read_more': 'বিস্তারিত পড়ুন',
    'home.gallery.badge': 'ক্যাম্পাস অ্যালবাম',
    'home.gallery.heading': 'ফটো গ্যালারি',
    'home.gallery.view_all': 'গ্যালারি ঘুরে দেখুন',
    'home.gallery.click_to_view': 'ছবিটি দেখতে ক্লিক করুন',
    'home.awards.badge': 'কৃতিত্ব ও পুরস্কার',
    'home.awards.heading': 'শিক্ষার্থীদের বিশেষ অর্জন ও পুরস্কার',
    'home.cta.heading': 'আমাদের প্রাণবন্ত শিক্ষা পরিবারে যুক্ত হোন',
    'home.cta.subheading': 'আসন্ন শিক্ষাবর্ষের ভর্তি কার্যক্রম চলছে। আধুনিক বিজ্ঞানভিত্তিক ও নৈতিক শিক্ষার সেরা পরিবেশ।',
    'home.cta.apply_btn': 'অনলাইন আবেদন শুরু করুন',
    'home.cta.contact_btn': 'ভর্তি শাখায় যোগাযোগ',

    // About Page
    'about.badge': 'আমাদের পরিচিতি',
    'about.heading': 'শিক্ষার মানোন্নয়ন ও নৈতিকতার সুদীর্ঘ ইতিহাস',
    'about.history.title': 'আমাদের গৌরবময় ইতিহাস ও ঐতিহ্য',
    'about.mission.title': 'আমাদের লক্ষ্য (Mission)',
    'about.vision.title': 'আমাদের রূপকল্প (Vision)',
    'about.milestones.title': 'ঐতিহাসিক মাইলফলক',
    'about.facilities.title': 'আধুনিক ক্যাম্পাস সুযোগ-সুবিধা',

    // Principal Page
    'principal.badge': 'অধ্যক্ষের কার্যালয়',
    'principal.heading': 'স্বাগত বক্তব্য ও প্রাতিষ্ঠানিক দর্শন',
    'principal.credentials': 'শিক্ষাগত যোগ্যতা ও প্রাতিষ্ঠানিক ভূমিকা',
    'principal.quote_label': 'মূল ভাবধারা',

    // Faculty Page
    'faculty.badge': 'শিক্ষকমণ্ডলী ও কর্মকর্তা',
    'faculty.heading': 'শিক্ষক ও কর্মচারী ডিরেক্টরি',
    'faculty.subheading': 'আমাদের সুযোগ্য ও আন্তরিক শিক্ষকমণ্ডলী শিক্ষার্থীদের মেধা ও চরিত্র গঠনে সদানিবেদিত।',
    'faculty.search_placeholder': 'শিক্ষকের নাম বা বিষয় দিয়ে খুঁজুন...',
    'faculty.all_departments': 'সকল বিভাগ',
    'faculty.no_results': 'আপনার অনুসন্ধানের সাথে মিল পাওয়া যায়নি।',
    'faculty.qualification': 'শিক্ষাগত যোগ্যতা',

    // Committee Page
    'committee.badge': 'পরিচালনা পর্ষদ',
    'committee.heading': 'বিদ্যালয় ম্যানেজিং কমিটি',
    'committee.subheading': 'সুদক্ষ দিকনির্দেশনা ও সার্বিক তত্ত্বাবধানে বিদ্যালয়ের অব্যাহত উন্নয়ন নিশ্চিতকরণ।',

    // Academics Page
    'academics.badge': 'শিক্ষা পরিকাঠামো ও উৎকর্ষ',
    'academics.heading': 'পাঠ্যক্রম, শিফট ও শিক্ষাব্যবস্থা',
    'academics.subheading': 'জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড (NCTB) অনুমোদিত আধুনিক ও গুণগত শিক্ষাদান পদ্ধতি।',
    'academics.streams_title': 'বিদ্যমান শ্রেণি ও বিভাগসমূহ',
    'academics.shifts_title': 'প্রাতিষ্ঠানিক শিফট ও সময়সূচি',
    'academics.grading_title': 'জাতীয় গ্রেডিং পদ্ধতি (জিপিএ ৫.০০)',
    'academics.grade_col': 'গ্রেড',
    'academics.marks_col': 'নম্বর ব্যাপ্তি',
    'academics.point_col': 'গ্রেড পয়েন্ট',
    'academics.remarks_col': 'মূল্যায়ন মন্তব্য',

    // Notices Page
    'notices.badge': 'দাপ্তরিক পরিপত্র ও বিজ্ঞপ্তি',
    'notices.heading': 'নোটিশ বোর্ড',
    'notices.subheading': 'সর্বশেষ প্রাতিষ্ঠানিক সার্কুলার, বোর্ড পরীক্ষার নির্দেশনা ও ভর্তি সংক্রান্ত ঘোষণা।',
    'notices.search_placeholder': 'বিষয় দিয়ে নোটিশ খুঁজুন...',
    'notices.all_notices': 'সকল নোটিশ',
    'notices.view_details': 'বিস্তারিত দেখুন',
    'notices.published_on': 'প্রকাশের তারিখ',
    'notices.attachment': 'সংযুক্ত অফিশিয়াল ডকুমেন্ট / নোটিশ সার্কুলার',
    'notices.download_attachment': 'সংযুক্তি ডাউনলোড করুন',
    'notices.close': 'বন্ধ করুন',

    // News Page
    'news.badge': 'সংবাদ ও দিনপঞ্জি',
    'news.heading': 'বিদ্যালয়ের সংবাদ ও আসন্ন অনুষ্ঠানমালা',
    'news.subheading': 'বিজ্ঞান মেলা, সাংস্কৃতিক উৎসব, ক্রীড়া প্রতিযোগিতা এবং সাম্প্রতিক অর্জনসমূহ।',
    'news.search_placeholder': 'সংবাদ বা ইভেন্ট অনুসন্ধান...',
    'news.location': 'স্থান',

    // Gallery Page
    'gallery.badge': 'স্মৃতির প্রতিচ্ছবি',
    'gallery.heading': 'ফটোগ্রাফি ও মিডিয়া গ্যালারি',
    'gallery.subheading': 'দৈনন্দিন ক্যাম্পাস জীবন, বিজ্ঞান উৎসব, সাংস্কৃতিক আয়োজন ও ক্রীড়া বিজয়ের কিছু মুহূর্ত।',
    'gallery.all_photos': 'সকল ছবি',
    'gallery.empty': 'এই ক্যাটাগরিতে কোনো ছবি পাওয়া যায়নি।',

    // Admissions Page
    'admissions.badge': 'ভর্তি তথ্য ও আবেদন',
    'admissions.heading': 'শিক্ষার্থী ভর্তি ও নিবন্ধন',
    'admissions.subheading': 'মেধা বিকাশ ও ভবিষ্যৎ গড়ার প্রত্যয়ে আমাদের প্রতিষ্ঠানে শিক্ষার্থীদের সাদর আমন্ত্রণ।',
    'admissions.form_title': 'অনলাইন প্রাথমিক ভর্তি তথ্য / আবেদন ফর্ম',
    'admissions.form_desc': 'ভর্তি সংক্রান্ত প্রাথমিক তথ্যের জন্য নিচের ফর্মটি পূরণ করুন। আমাদের ভর্তি শাখা থেকে দ্রুত যোগাযোগ করা হবে।',
    'admissions.student_name': 'শিক্ষার্থীর পূর্ণ নাম *',
    'admissions.dob': 'জন্ম তারিখ *',
    'admissions.gender': 'লিঙ্গ *',
    'admissions.applying_class': 'আবেদিত শ্রেণি *',
    'admissions.shift': 'পছন্দের শিফট *',
    'admissions.guardian_name': 'অভিভাবকের পূর্ণ নাম *',
    'admissions.guardian_phone': 'অভিভাবকের মোবাইল নম্বর *',
    'admissions.guardian_email': 'অভিভাবকের ইমেইল (ঐচ্ছিক)',
    'admissions.prev_school': 'পূর্ববর্তী বিদ্যালয়ের নাম (যদি থাকে)',
    'admissions.address': 'বর্তমান ঠিকানা *',
    'admissions.submit_btn': 'ভর্তি ফর্ম জমা দিন',
    'admissions.success_heading': 'আবেদন সফলভাবে গৃহীত হয়েছে!',
    'admissions.success_message': 'ধন্যবাদ। আপনার আবেদনের ট্র্যাকিং নম্বর:',

    // Results & Downloads Page
    'results.badge': 'একাডেমিক মূল্যায়ন ও যাচাই',
    'results.heading': 'পরীক্ষার ফলাফল ও প্রয়োজনীয় ডাউনলোড',
    'results.subheading': 'বিদ্যালয় কর্তৃক প্রকাশিত অভ্যন্তরীণ ও সেমিস্টার পরীক্ষার ফলাফল যাচাই করুন।',
    'results.portal_title': 'অনলাইন রেজাল্ট ভেরিফিকেশন পোর্টাল',
    'results.exam_label': 'পরীক্ষার নাম *',
    'results.class_label': 'শ্রেণি *',
    'results.roll_label': 'শ্রেণি রোল নম্বর / স্টুডেন্ট আইডি *',
    'results.search_btn': 'ফলাফল অনুসন্ধান',
    'results.reset_btn': 'রিসেট করুন',
    'results.not_found': 'প্রদত্ত তথ্যের সাথে কোনো ফলাফল পাওয়া যায়নি। অনুগ্রহ করে রোল নম্বর ও পরীক্ষার নাম পুনরায় পরীক্ষা করুন।',
    'results.student_details': 'শিক্ষার্থীর বিবরণ',
    'results.gpa': 'প্রাপ্ত জিপিএ',
    'results.grade': 'প্রাপ্ত গ্রেড',
    'results.marksheet_title': 'অফিশিয়াল মার্কশিট / ফলাফল বিবরণী',
    'results.print_btn': 'মার্কশিট প্রিন্ট',
    'results.download_btn': 'পিডিএফ ডাউনলোড',
    'results.downloads_title': 'অফিশিয়াল ডাউনলোড ও আবেদনপত্র',
    'results.downloads_desc': 'সিলেবাস, অ্যাকাডেমিক ক্যালেন্ডার, ভর্তি ফর্ম ও বেতন সংক্রান্ত তালিকা ডাউনলোড করুন।',
    'results.download_action': 'ডাউনলোড',

    // Contact Page
    'contact.badge': 'যোগাযোগ ও অবস্থান',
    'contact.heading': 'যোগাযোগ ও ক্যাম্পাস ঠিকানা',
    'contact.subheading': 'ভর্তি, শিক্ষা কার্যক্রম কিংবা প্রাতিষ্ঠানিক যেকোনো তথ্যের জন্য আমাদের সাথে সরাসরি যোগাযোগ করুন।',
    'contact.address': 'ক্যাম্পাস ঠিকানা',
    'contact.phone': 'ফোন নম্বর',
    'contact.email': 'অফিশিয়াল ইমেইল',
    'contact.hours': 'দাপ্তরিক সময়সূচি',
    'contact.form_title': 'সরাসরি বার্তা পাঠান',
    'contact.name': 'আপনার পূর্ণ নাম *',
    'contact.your_email': 'আপনার ইমেইল ঠিকানা *',
    'contact.your_phone': 'আপনার ফোন নম্বর *',
    'contact.subject': 'বার্তার বিষয় *',
    'contact.message': 'আপনার বার্তা / জিজ্ঞাসা *',
    'contact.send_btn': 'বার্তা পাঠান',
    'contact.success': 'আপনার বার্তাটি সফলভাবে পাঠানো হয়েছে! আমাদের প্রশাসন দ্রুত যোগাযোগ করবে।',

    // Footer
    'footer.quick_links': 'প্রয়োজনীয় লিংক',
    'footer.academic_links': 'শিক্ষা ও পোর্টাল',
    'footer.contact_info': 'যোগাযোগের তথ্য',
    'footer.rights': 'সর্বস্বত্ব সংরক্ষিত।',
    'footer.motto': 'জ্ঞান ও নৈতিকতার সমন্বয়ে গড়ে উঠুক আগামী দিনের নেতৃত্ব।',

    // Custom Pages (Library & Transport)
    'library.badge': 'জ্ঞানকেন্দ্র ও সংগ্রহশালা',
    'library.heading': 'কেন্দ্রীয় পাঠাগার ও ডিজিটাল আর্কাইভ',
    'library.subheading': '১৫,০০০ এর অধিক গ্রন্থ, সাহিত্য সংকলন ও আধুনিক গবেষণা তথ্যে সমৃদ্ধ শিক্ষাকেন্দ্র।',
    'library.rules_btn': 'পাঠাগারের নিয়মাবলী দেখুন',
    'transport.badge': 'নিরাপদ যাতায়াত ব্যবস্থা',
    'transport.heading': 'পরিবহন সেবা ও ক্যাম্পাস নিরাপত্তা',
    'transport.subheading': 'রাজধানীর বিভিন্ন রুটে শিক্ষার্থীদের নিরাপদ, আরামদায়ক ও জিপিএস ট্র্যাকিংযুক্ত পরিবহন সুবিধা।',
    'transport.contact_btn': 'পরিবহন শাখায় যোগাযোগ',

    // Admin Panel Interface
    'admin.switch_to_website': 'পাবলিক ওয়েবসাইটে ফিরুন',
    'admin.session_active': 'অ্যাডমিনিস্ট্রেটর সেশন সক্রিয়:',
    'admin.website_cms': 'ওয়েবসাইট ম্যানেজমেন্ট সিএমএস',
    'admin.sidebar.dashboard': 'ড্যাশবোর্ড',
    'admin.sidebar.website_management': 'ওয়েবসাইট ম্যানেজমেন্ট',
    'admin.sidebar.students': 'শিক্ষার্থী তালিকা',
    'admin.sidebar.admissions': 'নতুন ভর্তি',
    'admin.sidebar.classes': 'শ্রেণি ও সেকশন',
    'admin.sidebar.subjects': 'বিষয় ব্যবস্থাপনা',
    'admin.sidebar.group_settings': 'গ্রুপ ও বিভাগ সেটিংস',
    'admin.sidebar.teachers': 'শিক্ষকমণ্ডলী',
    'admin.sidebar.staff': 'কর্মচারীবৃন্দ',
    'admin.sidebar.attendance': 'দৈনিক উপস্থিতি',
    'admin.sidebar.fee_structure': 'ফি পরিকাঠামো',
    'admin.sidebar.fee_collection': 'ফি আদায়',
    'admin.sidebar.payments': 'পেমেন্ট রেকর্ড',
    'admin.sidebar.income_expenses': 'আয় ও ব্যয় হিসাব',
    'admin.sidebar.examinations': 'পরীক্ষার সময়সূচি',
    'admin.sidebar.mark_distribution': 'নম্বর বণ্টন (CQ/MCQ)',
    'admin.sidebar.mark_conversion': 'নম্বর রূপান্তর',
    'admin.sidebar.marks_entry': 'নম্বর এন্ট্রি',
    'admin.sidebar.results': 'ফলাফল ও মার্কশিট',
    'admin.sidebar.promotion': 'শিক্ষার্থী প্রমোশন',
    'admin.sidebar.grading_settings': 'গ্রেডিং পলিসি',
    'admin.sidebar.class_routine': 'ক্লাস রুটিন',
    'admin.sidebar.notices': 'নোটিশ বোর্ড',
    'admin.sidebar.reports': 'রিপোর্ট ও পরিসংখ্যান',
    'admin.sidebar.users': 'ইউজার ও রোলস',
    'admin.sidebar.access_requests': 'লাইসেন্স ও অ্যাক্সেস রিকোয়েস্ট',
    'admin.sidebar.audit_logs': 'সিস্টেম অডিট লগ',
    'admin.sidebar.backup_restore': 'ব্যাকআপ ও রিস্টোর',
    'admin.sidebar.school_settings': 'প্রতিষ্ঠান সেটিংস',
    'admin.sidebar.code_zip': 'সোর্স কোড জিপ এক্সপোর্ট',
    'admin.sidebar.logout': 'লগ আউট',
    'admin.sidebar.search_placeholder': 'মেনু অনুসন্ধান...',
    'admin.quick_action': 'দ্রুত অ্যাকশন',
    'admin.fast_nav': 'দ্রুত নেভিগেশন',
    'admin.profile_security': 'প্রোফাইল ছবি ও নিরাপত্তা',
    'admin.manage_access': 'অ্যাক্সেস রিকোয়েস্ট পরিচালনা',
    'admin.btn.save': 'সংরক্ষণ করুন',
    'admin.btn.cancel': 'বাতিল',
    'admin.btn.delete': 'মুছে ফেলুন',
    'admin.btn.edit': 'সম্পাদনা',
    'admin.btn.upload': 'ফাইল আপলোড',
    'admin.btn.replace': 'পরিবর্তন',
    'admin.btn.remove': 'সরিয়ে ফেলুন',
    'admin.btn.filter': 'ফিল্টার',
    'admin.btn.search': 'অনুসন্ধান',
    'admin.btn.refresh': 'রিফ্রেশ',

    // Nav Groups
    'admin.group.core': 'কোর মেনু',
    'admin.group.website': 'পাবলিক ওয়েবসাইট ও সিএমএস',
    'admin.group.academics': 'শিক্ষা পরিকাঠামো ও কনফিগারেশন',
    'admin.group.students': 'শিক্ষার্থী ও শিক্ষক',
    'admin.group.exams': 'পরীক্ষা ও ফলাফল',
    'admin.group.finance': 'অর্থ ও হিসাবরক্ষণ',
    'admin.group.admin': 'প্রশাসন ও সিস্টেম',

    // Auth Screen
    'auth.portal_title': 'ই-বিদ্যালয় স্কুল ম্যানেজমেন্ট সিস্টেম',
    'auth.portal_subtitle': 'প্রশাসনিক কন্ট্রোল সেন্টার ও সুরক্ষিত শিক্ষা ডেটাবেজ',
    'auth.tab.login': 'স্টাফ ও অ্যাডমিন লগইন',
    'auth.tab.result': 'শিক্ষার্থীর রেজাল্ট দেখুন',
    'auth.tab.register': 'অ্যাক্সেস রিকোয়েস্ট / নিবন্ধন',
    'auth.tab.status': 'আবেদনের বর্তমান অবস্থা',
    'auth.user_id_label': 'ইউজার আইডি, মোবাইল নম্বর বা ইমেইল *',
    'auth.password_label': 'সিকিউরিটি পাসওয়ার্ড *',
    'auth.login_btn': 'অনুমোদন ও লগইন করুন',
    'auth.return_website': 'পাবলিক ওয়েবসাইটে ফিরুন',
    'auth.err_missing': 'অনুগ্রহ করে ইউজার আইডি এবং পাসওয়ার্ড উভয়ই প্রদান করুন।',
    'auth.err_invalid': 'ভুল ইউজার আইডি অথবা পাসওয়ার্ড।',
    'auth.lang_toggle': 'ভাষা:'
  }
};

export function t(key: string, lang: Language = 'en'): string {
  const dict = translations[lang] || translations.en;
  return dict[key] || translations.en[key] || key;
}

export function getNavTitle(key: string, lang: Language = 'en'): string {
  const navKey = `admin.sidebar.${key}`;
  return t(navKey, lang);
}
