import {
  SchoolSettings,
  AcademicYear,
  ClassLevel,
  Section,
  Subject,
  GradingPolicy,
  MarkConversionRule,
  Student,
  Teacher,
  Staff,
  Examination,
  StudentMark,
  FeeCategory,
  FeePayment,
  Transaction,
  Notice,
  AuditLog,
  User,
  CalculatedResult,
  AccessRequest,
  Shift,
  ClassRoutine,
  AcademicGroup,
  WebsiteData
} from '../types';
import {
  INITIAL_SCHOOL_SETTINGS,
  INITIAL_ACADEMIC_YEARS,
  INITIAL_CLASSES,
  INITIAL_SECTIONS,
  INITIAL_SUBJECTS,
  INITIAL_GRADING_POLICY,
  INITIAL_CONVERSION_RULES,
  INITIAL_STUDENTS,
  INITIAL_TEACHERS,
  INITIAL_STAFF,
  INITIAL_EXAMINATIONS,
  INITIAL_MARKS,
  INITIAL_FEE_CATEGORIES,
  INITIAL_FEE_PAYMENTS,
  INITIAL_TRANSACTIONS,
  INITIAL_NOTICES,
  INITIAL_AUDIT_LOGS,
  INITIAL_USERS,
  INITIAL_ACCESS_REQUESTS,
  DEFAULT_MARKSHEET_SETTINGS,
  INITIAL_SHIFTS,
  INITIAL_ROUTINES,
  INITIAL_GROUPS
} from '../data/initialData';
import { INITIAL_WEBSITE_DATA, INITIAL_WEBSITE_NAVIGATION } from '../data/initialWebsiteData';
import { calculateAllResults } from './resultEngine';

export interface AppDatabase {
  schoolSettings: SchoolSettings;
  academicYears: AcademicYear[];
  classes: ClassLevel[];
  sections: Section[];
  subjects: Subject[];
  gradingPolicy: GradingPolicy;
  conversionRules: MarkConversionRule[];
  students: Student[];
  teachers: Teacher[];
  staff: Staff[];
  examinations: Examination[];
  marks: StudentMark[];
  results: CalculatedResult[];
  feeCategories: FeeCategory[];
  feePayments: FeePayment[];
  transactions: Transaction[];
  notices: Notice[];
  auditLogs: AuditLog[];
  users: User[];
  accessRequests: AccessRequest[];
  shifts: Shift[];
  routines: ClassRoutine[];
  groups: AcademicGroup[];
  website: WebsiteData;
  currentUser: User | null;
  isAuthenticated: boolean;
}

const STORAGE_KEY = 'ebiddalay_school_db_v3_en';
const SESSION_KEY = 'ebiddalay_session_user_v3';
const TOKEN_KEY = 'ebiddalay_session_token_v3';

export function getSessionToken(): string {
  try {
    return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

export function setSessionAuth(token: string, user: User | null): void {
  try {
    if (user && token) {
      sessionStorage.setItem(SESSION_KEY, user.id);
      sessionStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(SESSION_KEY, user.id);
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      sessionStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {}
}

export function clearSessionAuth(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(TOKEN_KEY);
  } catch {}
}

export function setSessionUser(user: User | null): void {
  try {
    if (user) {
      sessionStorage.setItem(SESSION_KEY, user.id);
      localStorage.setItem(SESSION_KEY, user.id);
    } else {
      sessionStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {}
}

export function getInitialDatabase(): AppDatabase {
  const initialResults = calculateAllResults(
    INITIAL_STUDENTS,
    'exam-hy-2026',
    '2026',
    INITIAL_SUBJECTS,
    INITIAL_MARKS,
    INITIAL_GRADING_POLICY,
    INITIAL_CONVERSION_RULES
  );

  return {
    schoolSettings: INITIAL_SCHOOL_SETTINGS,
    academicYears: INITIAL_ACADEMIC_YEARS,
    classes: INITIAL_CLASSES,
    sections: INITIAL_SECTIONS,
    subjects: INITIAL_SUBJECTS,
    gradingPolicy: INITIAL_GRADING_POLICY,
    conversionRules: INITIAL_CONVERSION_RULES,
    students: INITIAL_STUDENTS,
    teachers: INITIAL_TEACHERS,
    staff: INITIAL_STAFF,
    examinations: INITIAL_EXAMINATIONS,
    marks: INITIAL_MARKS,
    results: initialResults,
    feeCategories: INITIAL_FEE_CATEGORIES,
    feePayments: INITIAL_FEE_PAYMENTS,
    transactions: INITIAL_TRANSACTIONS,
    notices: INITIAL_NOTICES,
    auditLogs: INITIAL_AUDIT_LOGS,
    users: INITIAL_USERS,
    accessRequests: INITIAL_ACCESS_REQUESTS,
    shifts: INITIAL_SHIFTS,
    routines: INITIAL_ROUTINES,
    groups: INITIAL_GROUPS,
    website: INITIAL_WEBSITE_DATA,
    currentUser: null,
    isAuthenticated: false
  };
}

export function getBlankDatabase(currentUser?: User | null): AppDatabase {
  const currentYear = new Date().getFullYear().toString();
  return {
    schoolSettings: {
      nameEn: 'My Institution Name',
      eiin: '',
      instituteCode: '',
      establishedYear: currentYear,
      address: '',
      phone: '',
      email: '',
      website: '',
      logoUrl: '',
      principalName: '',
      principalSignatureUrl: '',
      currency: 'BDT (Tk)',
      timezone: 'Asia/Dhaka',
      currentAcademicYear: currentYear,
      boardName: 'Board of Intermediate & Secondary Education, Dhaka',
      studentLimit: 1000,
      marksheetSettings: DEFAULT_MARKSHEET_SETTINGS
    },
    academicYears: [
      { id: `ay-${currentYear}`, year: currentYear, isCurrent: true }
    ],
    classes: INITIAL_CLASSES,
    sections: INITIAL_SECTIONS,
    subjects: [],
    gradingPolicy: INITIAL_GRADING_POLICY,
    conversionRules: INITIAL_CONVERSION_RULES,
    students: [],
    teachers: [],
    staff: [],
    examinations: [],
    marks: [],
    results: [],
    feeCategories: INITIAL_FEE_CATEGORIES,
    feePayments: [],
    transactions: [],
    notices: [],
    auditLogs: [],
    users: INITIAL_USERS,
    accessRequests: [],
    shifts: INITIAL_SHIFTS,
    routines: [],
    groups: INITIAL_GROUPS,
    website: INITIAL_WEBSITE_DATA,
    currentUser: currentUser || null,
    isAuthenticated: !!currentUser
  };
}

export function classSupportsGroups(cls?: ClassLevel | null): boolean {
  if (!cls) return false;
  if (cls.hasGroups !== undefined) return cls.hasGroups;
  const name = (cls.nameEn || '').toLowerCase().trim();
  const num = cls.numericValue;
  if (num !== undefined && num >= 9) return true;
  if (
    name.includes('9') ||
    name.includes('10') ||
    name.includes('11') ||
    name.includes('12') ||
    name.includes('nine') ||
    name.includes('ten') ||
    name.includes('eleven') ||
    name.includes('twelve') ||
    name.includes('college') ||
    name.includes('hsc') ||
    name.includes('intermediate') ||
    name.includes('degree') ||
    name.includes('xi') ||
    name.includes('xii')
  ) {
    return true;
  }
  return false;
}

export const DESIGNATED_SUPER_ADMIN_ID = '01936988967';

export function enforceSingleSuperAdmin(users: User[]): User[] {
  if (!Array.isArray(users)) return [];
  let foundSuperAdmin = false;

  const result = users.map(u => {
    const isDesignated =
      u.username === DESIGNATED_SUPER_ADMIN_ID ||
      (u.mobileNumber && u.mobileNumber === DESIGNATED_SUPER_ADMIN_ID) ||
      (u.email && (u.email.toLowerCase() === '123mirabulh@gmail.com' || u.email.toLowerCase() === 'mirabul@schoolportal.com'));
    if (isDesignated) {
      foundSuperAdmin = true;
      return {
        ...u,
        username: DESIGNATED_SUPER_ADMIN_ID,
        fullName: u.fullName || 'Md. Mirabul Hossen',
        role: 'Super Admin' as const,
        email: '123mirabulh@gmail.com',
        mobileNumber: DESIGNATED_SUPER_ADMIN_ID,
        isMasterAdmin: true,
        status: 'active' as const
      };
    }

    if (u.role === 'Super Admin') {
      return {
        ...u,
        role: 'School Administrator' as const,
        isMasterAdmin: false
      };
    }
    return u;
  });

  if (!foundSuperAdmin) {
    result.unshift({
      id: 'usr-mirabul',
      username: DESIGNATED_SUPER_ADMIN_ID,
      fullName: 'Md. Mirabul Hossen',
      role: 'Super Admin',
      email: '123mirabulh@gmail.com',
      mobileNumber: DESIGNATED_SUPER_ADMIN_ID,
      instituteName: 'Central Administration & Master Control',
      studentLimit: 10000,
      status: 'active',
      isMasterAdmin: true,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    });
  }

  return result;
}

export function loadDatabase(): AppDatabase {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let base: AppDatabase;
    if (!raw) {
      base = getInitialDatabase();
      base.users = enforceSingleSuperAdmin(base.users);
      saveDatabase(base);
    } else {
      const parsed = JSON.parse(raw);
      base = { ...getInitialDatabase(), ...parsed };

      if (!base.schoolSettings.marksheetSettings) {
        base.schoolSettings.marksheetSettings = DEFAULT_MARKSHEET_SETTINGS;
      }

      base.users = enforceSingleSuperAdmin(base.users || INITIAL_USERS);

      if (!base.shifts || !Array.isArray(base.shifts) || base.shifts.length === 0) {
        base.shifts = INITIAL_SHIFTS;
      }

      if (!base.routines || !Array.isArray(base.routines) || base.routines.length === 0) {
        base.routines = INITIAL_ROUTINES;
      }

      if (!base.groups || !Array.isArray(base.groups) || base.groups.length === 0) {
        base.groups = INITIAL_GROUPS;
      }

      if (!base.website || !base.website.settings) {
        base.website = INITIAL_WEBSITE_DATA;
      } else {
        if (base.website.customPages === undefined) {
          base.website.customPages = INITIAL_WEBSITE_DATA.customPages || [];
        }

        if (base.website.navigation === undefined) {
          base.website.navigation = INITIAL_WEBSITE_NAVIGATION;
        }
      }

      if (base.website) {
        if (!base.website.faculty && base.website.facultyProfiles) {
          base.website.faculty = base.website.facultyProfiles;
        } else if (!base.website.facultyProfiles && base.website.faculty) {
          base.website.facultyProfiles = base.website.faculty;
        }

        if (!base.website.committee && base.website.committeeMembers) {
          base.website.committee = base.website.committeeMembers;
        } else if (!base.website.committeeMembers && base.website.committee) {
          base.website.committeeMembers = base.website.committee;
        }

        if (!base.website.news && base.website.newsArticles) {
          base.website.news = base.website.newsArticles;
        } else if (!base.website.newsArticles && base.website.news) {
          base.website.newsArticles = base.website.news;
        }

        if (!base.website.awards && base.website.featuredAwards) {
          base.website.awards = base.website.featuredAwards;
        } else if (!base.website.featuredAwards && base.website.awards) {
          base.website.featuredAwards = base.website.awards;
        }

        if ((!base.website.gallery || base.website.gallery.length === 0) && base.website.galleryAlbums) {
          base.website.gallery = base.website.galleryAlbums.flatMap(a => a.images || []);
        }

        if (base.website.settings?.logoUrl && !base.schoolSettings?.logoUrl) {
          base.schoolSettings.logoUrl = base.website.settings.logoUrl;
        } else if (base.schoolSettings?.logoUrl && !base.website.settings?.logoUrl) {
          base.website.settings.logoUrl = base.schoolSettings.logoUrl;
        }
      }
    }

    base.currentUser = null;
    base.isAuthenticated = false;

    const savedUserId = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
    const savedToken = sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
    if (savedUserId && savedToken) {
      const found = base.users.find(u => u.id === savedUserId && u.status === 'active');
      if (found) {
        base.currentUser = found;
        base.isAuthenticated = true;
      }
    }

    return base;
  } catch (err) {
    console.error('Error loading database, resetting to initial:', err);
    const initial = getInitialDatabase();
    initial.users = enforceSingleSuperAdmin(initial.users);
    saveDatabase(initial);
    return initial;
  }
}

/**
 * Persists data with QuotaExceeded fallback protection and immediate server backup
 */
export function saveDatabase(db: AppDatabase): void {
  try {
    db.users = enforceSingleSuperAdmin(db.users);

    if (db.website) {
      if (db.website.settings?.logoUrl) {
        if (!db.schoolSettings) {
          db.schoolSettings = INITIAL_SCHOOL_SETTINGS;
        }
        db.schoolSettings.logoUrl = db.website.settings.logoUrl;
      }

      if (db.website.faculty) db.website.facultyProfiles = db.website.faculty;
      if (db.website.facultyProfiles && !db.website.faculty) db.website.faculty = db.website.facultyProfiles;

      if (db.website.committee) db.website.committeeMembers = db.website.committee;
      if (db.website.committeeMembers && !db.website.committee) db.website.committee = db.website.committeeMembers;

      if (db.website.news) db.website.newsArticles = db.website.news;
      if (db.website.newsArticles && !db.website.news) db.website.news = db.website.newsArticles;

      if (db.website.awards) db.website.featuredAwards = db.website.awards;
      if (db.website.featuredAwards && !db.website.awards) db.website.awards = db.website.featuredAwards;
    }

    const toStore = { ...db, currentUser: null, isAuthenticated: false };

    // ১. লোকাল স্টোরেজে সেভ করার চেষ্টা (মেমোরি ফুল থাকলে হ্যান্ডেল করবে)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    } catch (e) {
      console.warn('localStorage limit exceeded, falling back to direct server sync');
    }

    // ২. সার্ভার ফাইলে ডেটা নিশ্চিতভাবে সংরক্ষণ
    const token = getSessionToken();
    fetch('/api/db', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(toStore)
    })
    .then(res => {
      if (!res.ok) {
        console.warn('Server responded with error while saving DB');
      }
    })
    .catch((err) => {
      console.warn('Server sync error:', err);
    });
  } catch (err) {
    console.error('Failed to save database:', err);
  }
}

/**
 * Fetches latest state from server to sync changes made on other devices
 */
export async function syncDatabaseFromServer(): Promise<AppDatabase | null> {
  try {
    const token = getSessionToken();
    const res = await fetch('/api/db', {
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });
    if (!res.ok) return null;
    const serverDb = await res.json();
    if (serverDb && typeof serverDb === 'object' && Array.isArray(serverDb.students)) {
      serverDb.users = enforceSingleSuperAdmin(serverDb.users);
      serverDb.currentUser = null;
      serverDb.isAuthenticated = false;
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(serverDb));
      } catch {}
      
      return serverDb as AppDatabase;
    }
  } catch {
    // Network error ignored
  }
  return null;
}

export async function initializeBlankDatabaseServer(blankDb: AppDatabase, requesterId: string): Promise<boolean> {
  try {
    const token = getSessionToken();
    const res = await fetch('/api/database/initialize-blank', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ requesterId, blankData: blankDb })
    });
    return res.ok;
  } catch (err) {
    console.warn('Backend blank initialization failed, local fallback used:', err);
    return true;
  }
}

export async function updateSuperAdminProfileServer(avatar?: string, fullName?: string, email?: string): Promise<boolean> {
  try {
    const token = getSessionToken();
    const res = await fetch('/api/users/superadmin/profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ userId: DESIGNATED_SUPER_ADMIN_ID, avatar, fullName, email })
    });
    return res.ok;
  } catch {
    return true;
  }
}

export async function updateSuperAdminPasswordServer(currentPassword: string, newPassword: string): Promise<boolean> {
  try {
    const token = getSessionToken();
    const res = await fetch('/api/users/superadmin/password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ userId: DESIGNATED_SUPER_ADMIN_ID, currentPassword, newPassword })
    });
    return res.ok;
  } catch {
    return true;
  }
}

export function logAuditAction(
  db: AppDatabase,
  action: string,
  details: string
): AppDatabase {
  const actorName = db.currentUser
    ? `${db.currentUser.fullName} (${db.currentUser.role})`
    : 'System / Guest';

  const newLog: AuditLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    user: actorName,
    action,
    details,
    ipAddress: '127.0.0.1'
  };

  const updatedLogs = [newLog, ...db.auditLogs].slice(0, 100);
  return { ...db, auditLogs: updatedLogs };
}

export interface DeleteStudentResult {
  success: boolean;
  mode?: 'deleted' | 'archived';
  message: string;
  hasRelatedRecords?: boolean;
  relatedCounts?: {
    marks: number;
    attendance: number;
    fees: number;
    results: number;
  };
}

export async function deleteStudentFromServer(
  studentId: string,
  options?: { force?: boolean; archive?: boolean }
): Promise<DeleteStudentResult> {
  try {
    const token = getSessionToken();
    const query = new URLSearchParams();
    if (options?.force) query.set('force', 'true');
    if (options?.archive) query.set('archive', 'true');

    const res = await fetch(`/api/students/${encodeURIComponent(studentId)}?${query.toString()}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        message: data.error || data.message || 'Failed to delete student',
        hasRelatedRecords: data.hasRelatedRecords,
        relatedCounts: data.relatedCounts
      };
    }

    return {
      success: true,
      mode: data.mode,
      message: data.message
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Network error deleting student'
    };
  }
}
