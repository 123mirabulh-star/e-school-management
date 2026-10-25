export type UserRole = 
  | 'Super Admin'
  | 'School Administrator'
  | 'Accountant'
  | 'Teacher'
  | 'Office Staff'
  | 'Student'
  | 'Guardian';

export interface User {
  id: string;
  username: string;
  password?: string;
  fullName: string;
  role: UserRole;
  email: string;
  mobileNumber?: string;
  avatar?: string;
  instituteName?: string;
  studentLimit?: number; // Quota limit assigned by Master Admin
  licenseExpiry?: string;
  status: 'active' | 'suspended' | 'pending';
  isMasterAdmin?: boolean;
}

export interface AccessRequest {
  id: string;
  instituteName: string;
  eiin?: string;
  applicantName: string;
  phone: string;
  email: string;
  expectedStudents: number;
  requestedPlan: 'trial' | 'standard' | 'enterprise';
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  notes?: string;
  issuedUsername?: string;
  issuedPassword?: string;
  approvedStudentLimit?: number;
  approvedAt?: string;
  approvedBy?: string;
}

export interface MarksheetSettings {
  showLogo: boolean;
  showSchoolAddress: boolean;
  showInstituteCode: boolean;
  showEiin: boolean;
  showBoardName: boolean;
  headerTitle: string; // e.g. "Academic Transcript & Mark Sheet"
  headerSubtitle: string; // e.g. "Official Student Evaluation Record"
  themeColor: string; // e.g. "#1E3A8A"
  borderStyle: 'formal' | 'modern' | 'classic' | 'minimal';
  fontSize: 'compact' | 'normal' | 'spacious';
  pageSize: 'A4' | 'Letter';
  orientation: 'portrait' | 'landscape';
  studentInfoColumns: 2 | 3;
  showComponentBreakdown: boolean; // Show CQ, MCQ, Practical columns
  showHighestMarks: boolean;
  showGradePoint: boolean;
  showResultStatus: boolean; // PASSED / FAILED badge
  showGradingScaleTable: boolean; // Bangladesh Board Grading Scale on Marksheet
  footerRemarksText: string;
  showSignatures: boolean;
  signature1Title: string; // "Class Teacher"
  signature2Title: string; // "Exam Controller"
  signature3Title: string; // "Headmaster / Principal"
}

export interface SchoolSettings {
  nameEn: string;
  nameBn?: string;
  eiin: string;
  instituteCode: string;
  establishedYear: string;
  address: string;
  addressBn?: string;
  phone: string;
  email: string;
  website: string;
  logoUrl: string;
  principalName: string;
  principalNameBn?: string;
  principalSignatureUrl: string;
  currency: string; // "BDT (Tk)"
  timezone: string; // "Asia/Dhaka"
  currentAcademicYear: string;
  boardName: string; // "Dhaka Education Board"
  studentLimit?: number;
  marksheetSettings?: MarksheetSettings;
}

export interface AcademicYear {
  id: string;
  year: string;
  isCurrent: boolean;
}

export interface ClassLevel {
  id: string;
  nameEn: string;
  nameBn?: string;
  numericValue?: number;
  shifts?: string[];
  hasGroups?: boolean;
}

export interface AcademicGroup {
  id: string;
  name: string;
  nameBn?: string;
  code?: string;
  description?: string;
  active: boolean;
}

export interface Section {
  id: string;
  classId: string;
  name: string; // "Section A", "Section B", "Padma", "Meghna"
  nameBn?: string;
  roomNo?: string;
  capacity: number;
}

export type ComponentTypeCode = 'CQ' | 'MCQ' | 'PR' | 'OR' | 'CT' | 'AS';

export interface AssessmentComponent {
  id: string;
  name: string; // "Creative/CQ", "MCQ", "Practical", "Continuous Assessment"
  code: ComponentTypeCode;
  maxMarks: number;
  passMarks: number;
  weight: number;
  contributesToFinal: boolean;
  ordering: number;
}

export interface Subject {
  id: string;
  code: string;
  nameEn: string;
  nameBn?: string;
  classId: string;
  subjectType: 'compulsory' | 'optional' | 'elective';
  fullMarks: number;
  passMarks: number;
  components: AssessmentComponent[];
  teacherName?: string;
  active: boolean;
  isPaper2?: boolean;
}

export type ConversionFormulaType = 'proportional' | 'weighted' | 'addition' | 'custom';

export interface MarkConversionRule {
  id: string;
  name: string;
  classId?: string;
  subjectId?: string;
  examId?: string;
  componentCode?: string;
  originalFullMarks: number;
  targetFullMarks: number;
  formulaType: ConversionFormulaType;
  weight: number;
  precision: number;
  roundingMethod: 'round' | 'floor' | 'ceil';
  customFormula?: string;
  description: string;
}

export interface Student {
  id: string;
  studentId: string;
  admissionNo: string;
  rollNo: number;
  nameEn: string;
  nameBn?: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  religion: 'Islam' | 'Hinduism' | 'Buddhism' | 'Christianity' | 'Other';
  bloodGroup: string;
  classId: string;
  sectionId: string;
  academicYear: string;
  admissionDate: string;
  guardianName: string;
  guardianRelation: string;
  guardianPhone: string;
  address: string;
  photoUrl: string;
  status: 'active' | 'archived' | 'transferred';
  optionalSubjectId?: string;
  duesAmount?: number;
  group?: string;
  shift?: string;
}

export interface Teacher {
  id: string;
  teacherId: string;
  nameEn: string;
  nameBn?: string;
  designation: string;
  department: string;
  phone: string;
  email: string;
  joinDate: string;
  qualification: string;
  status: 'active' | 'on_leave' | 'resigned';
}

export interface Staff {
  id: string;
  staffId: string;
  nameEn: string;
  role: string;
  phone: string;
  status: 'active' | 'resigned';
}

export type ExamStatus = 'draft' | 'marks_entry' | 'submitted' | 'approved' | 'published' | 'archived';

export interface Examination {
  id: string;
  name: string;
  academicYear: string;
  classId: string;
  term: '1st_term' | 'half_yearly' | 'annual' | 'model_test' | 'pre_test' | 'class_test';
  startDate: string;
  endDate: string;
  status: ExamStatus;
  weightPercentage: number;
  isPublished: boolean;
  publishedDate?: string;
}

export interface StudentMark {
  id: string;
  examId: string;
  studentId: string;
  subjectId: string;
  classId?: string;
  academicYear?: string;
  group?: string;
  shift?: string;
  componentScores: Record<string, number>;
  isAbsent?: boolean;
  isExempt?: boolean;
  enteredBy: string;
  enteredAt: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface SubjectResultDetail {
  subjectId: string;
  subjectCode: string;
  subjectNameEn: string;
  isOptional: boolean;
  fullMarks: number;
  passMarks: number;
  componentBreakdown: {
    componentName: string;
    code: string;
    maxMarks: number;
    passMarks: number;
    obtainedMarks: number;
    convertedMarks: number;
    isPassed: boolean;
  }[];
  totalObtained: number;
  totalConverted: number;
  letterGrade: string;
  gradePoint: number;
  isPassed: boolean;
  gpaContribution: number;
}

export interface CalculatedResult {
  id: string;
  examId: string;
  studentId: string;
  studentRoll: number;
  studentNameEn: string;
  classId: string;
  sectionId: string;
  academicYear: string;
  group?: string;
  shift?: string;
  totalObtainedMarks: number;
  totalFullMarks: number;
  percentage: number;
  gpa: number;
  letterGrade: string;
  resultStatus: 'PASSED' | 'FAILED';
  failedSubjectCount: number;
  meritRank?: number;
  calculatedAt: string;
  published: boolean;
  correctionHistory?: {
    date: string;
    reason: string;
    authorizedBy: string;
    previousGpa: number;
    previousGrade: string;
  }[];
  subjectResults: SubjectResultDetail[];
}

export interface GradingBand {
  minPercentage: number;
  maxPercentage: number;
  letterGrade: string;
  gradePoint: number;
  remarks: string;
}

export interface GradingPolicy {
  id: string;
  name: string;
  scale: number;
  bands: GradingBand[];
  optionalSubjectDeduction: number;
  mandatoryComponentPassing: boolean;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  studentId: string;
  classId: string;
  sectionId: string;
  status: 'present' | 'absent' | 'late' | 'leave';
  remarks?: string;
  markedBy: string;
}

export interface FeeCategory {
  id: string;
  nameEn: string;
  type: 'monthly_tuition' | 'admission' | 'examination' | 'session' | 'lab' | 'library' | 'transport' | 'other';
  defaultAmount: number;
}

export interface FeePayment {
  id: string;
  receiptNo: string;
  studentId: string;
  feeCategoryId: string;
  month?: string;
  amountPaid: number;
  discount: number;
  date: string;
  paymentMethod: 'Cash' | 'bKash' | 'Nagad' | 'Bank Transfer' | 'Rocket';
  transactionRef?: string;
  collectedBy: string;
  status: 'paid' | 'partial' | 'reversed';
  remarks?: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: string;
  paymentMethod: string;
  referenceNo: string;
  description: string;
  createdBy: string;
}

export interface Notice {
  id: string;
  title: string;
  titleBn?: string;
  contentEn: string;
  contentBn?: string;
  publishDate: string;
  expiryDate?: string;
  targetAudience: 'All' | 'Students' | 'Teachers' | 'Guardians';
  priority: 'normal' | 'important' | 'urgent';
  publishedBy: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
  ipAddress?: string;
}

export interface Shift {
  id: string;
  name: string; // e.g. "Morning", "Day"
  nameBn?: string;
  startTime?: string;
  endTime?: string;
  active: boolean;
}

export interface RoutinePeriod {
  id: string;
  name: string; // "1st", "2nd", "Tiffin Break"
  time: string; // "09:00 - 09:45 AM"
  startTime?: string;
  endTime?: string;
  isBreak?: boolean;
  ordering: number;
}

export interface RoutineCell {
  periodIndex: number;
  subjectName: string;
  teacherName?: string;
  roomNo?: string;
  isBreak?: boolean;
}

export interface ClassRoutine {
  id: string;
  classId: string;
  shiftId: string;
  sectionId?: string;
  academicYear: string;
  periods: RoutinePeriod[];
  schedule: Record<string, string[]>; // Day -> array of subject strings matching periods
}

export * from './website';

