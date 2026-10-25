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
  AccessRequest,
  MarksheetSettings,
  Shift,
  RoutinePeriod,
  ClassRoutine,
  AcademicGroup
} from '../types';

export const DEFAULT_MARKSHEET_SETTINGS: MarksheetSettings = {
  showLogo: true,
  showSchoolAddress: true,
  showInstituteCode: true,
  showEiin: true,
  showBoardName: true,
  headerTitle: 'Academic Transcript & Mark Sheet',
  headerSubtitle: 'Official Student Evaluation Record',
  themeColor: '#1E3A8A',
  borderStyle: 'formal',
  fontSize: 'normal',
  pageSize: 'A4',
  orientation: 'portrait',
  studentInfoColumns: 2,
  showComponentBreakdown: true,
  showHighestMarks: false,
  showGradePoint: true,
  showResultStatus: true,
  showGradingScaleTable: true,
  footerRemarksText: 'This official academic transcript is computerized and certified by the institution examination authority.',
  showSignatures: true,
  signature1Title: 'Class Teacher',
  signature2Title: 'Exam Controller',
  signature3Title: 'Headmaster / Principal'
};

export const INITIAL_SCHOOL_SETTINGS: SchoolSettings = {
  nameEn: 'Dhaka Ideal Model High School & College',
  eiin: '108245',
  instituteCode: 'DH-4412',
  establishedYear: '1988',
  address: 'Motijheel Commercial Area, Dhaka-1000, Bangladesh',
  phone: '+880 2-9568412, +880 1711-234567',
  email: 'info@dhakaideal.edu.bd',
  website: 'https://dhakaideal.edu.bd',
  logoUrl: '',
  principalName: 'Professor Md. Abdul Karim',
  principalSignatureUrl: '',
  currency: 'BDT (Tk)',
  timezone: 'Asia/Dhaka',
  currentAcademicYear: '2026',
  boardName: 'Board of Intermediate & Secondary Education, Dhaka',
  studentLimit: 500,
  marksheetSettings: DEFAULT_MARKSHEET_SETTINGS
};

export const INITIAL_ACADEMIC_YEARS: AcademicYear[] = [
  { id: '2025', year: '2025', isCurrent: false },
  { id: '2026', year: '2026', isCurrent: true },
  { id: '2027', year: '2027', isCurrent: false }
];

export const INITIAL_CLASSES: ClassLevel[] = [
  { id: 'c6', nameEn: 'Class 6', numericValue: 6, shifts: ['Morning Shift', 'Day Shift'], hasGroups: false },
  { id: 'c7', nameEn: 'Class 7', numericValue: 7, shifts: ['Morning Shift', 'Day Shift'], hasGroups: false },
  { id: 'c8', nameEn: 'Class 8', numericValue: 8, shifts: ['Morning Shift', 'Day Shift'], hasGroups: false },
  { id: 'c9', nameEn: 'Class 9', numericValue: 9, shifts: ['Morning Shift', 'Day Shift'], hasGroups: true },
  { id: 'c10', nameEn: 'Class 10', numericValue: 10, shifts: ['Morning Shift', 'Day Shift'], hasGroups: true }
];

export const INITIAL_SECTIONS: Section[] = [
  { id: 's-6-a', classId: 'c6', name: 'Section A', roomNo: '101', capacity: 50 },
  { id: 's-6-b', classId: 'c6', name: 'Section B', roomNo: '102', capacity: 50 },
  { id: 's-6-c', classId: 'c6', name: 'Section C', roomNo: '103', capacity: 50 },
  { id: 's-6-d', classId: 'c6', name: 'Section D', roomNo: '104', capacity: 50 },

  { id: 's-7-a', classId: 'c7', name: 'Section A', roomNo: '201', capacity: 50 },
  { id: 's-7-b', classId: 'c7', name: 'Section B', roomNo: '202', capacity: 50 },
  { id: 's-7-c', classId: 'c7', name: 'Section C', roomNo: '203', capacity: 50 },
  { id: 's-7-d', classId: 'c7', name: 'Section D', roomNo: '204', capacity: 50 },

  { id: 's-8-a', classId: 'c8', name: 'Section A', roomNo: '301', capacity: 50 },
  { id: 's-8-b', classId: 'c8', name: 'Section B', roomNo: '302', capacity: 50 },
  { id: 's-8-c', classId: 'c8', name: 'Section C', roomNo: '303', capacity: 50 },
  { id: 's-8-d', classId: 'c8', name: 'Section D', roomNo: '304', capacity: 50 },

  { id: 's-padma-9', classId: 'c9', name: 'Section A (Padma)', roomNo: '401', capacity: 45 },
  { id: 's-meghna-9', classId: 'c9', name: 'Section B (Meghna)', roomNo: '402', capacity: 45 },
  { id: 's-jamuna-9', classId: 'c9', name: 'Section C (Jamuna)', roomNo: '403', capacity: 45 },
  { id: 's-karna-9', classId: 'c9', name: 'Section D (Karnaphuli)', roomNo: '404', capacity: 45 },

  { id: 's-padma-10', classId: 'c10', name: 'Section A (Padma)', roomNo: '501', capacity: 45 },
  { id: 's-jamuna-10', classId: 'c10', name: 'Section B (Jamuna)', roomNo: '502', capacity: 45 },
  { id: 's-meghna-10', classId: 'c10', name: 'Section C (Meghna)', roomNo: '503', capacity: 45 },
  { id: 's-surma-10', classId: 'c10', name: 'Section D (Surma)', roomNo: '504', capacity: 45 }
];

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'sub-ban1',
    code: '101',
    nameEn: 'Bangla 1st Paper',
    classId: 'c10',
    subjectType: 'compulsory',
    fullMarks: 100,
    passMarks: 33,
    active: true,
    teacherName: 'Nasreen Sultana',
    components: [
      { id: 'cmp-ban1-cq', name: 'Creative/CQ', code: 'CQ', maxMarks: 70, passMarks: 23, weight: 1, contributesToFinal: true, ordering: 1 },
      { id: 'cmp-ban1-mcq', name: 'MCQ', code: 'MCQ', maxMarks: 30, passMarks: 10, weight: 1, contributesToFinal: true, ordering: 2 }
    ]
  },
  {
    id: 'sub-ban2',
    code: '102',
    nameEn: 'Bangla 2nd Paper',
    classId: 'c10',
    subjectType: 'compulsory',
    fullMarks: 100,
    passMarks: 33,
    active: true,
    isPaper2: true,
    teacherName: 'Nasreen Sultana',
    components: [
      { id: 'cmp-ban2-cq', name: 'Written/CQ', code: 'CQ', maxMarks: 70, passMarks: 23, weight: 1, contributesToFinal: true, ordering: 1 },
      { id: 'cmp-ban2-mcq', name: 'MCQ', code: 'MCQ', maxMarks: 30, passMarks: 10, weight: 1, contributesToFinal: true, ordering: 2 }
    ]
  },
  {
    id: 'sub-eng1',
    code: '107',
    nameEn: 'English 1st Paper',
    classId: 'c10',
    subjectType: 'compulsory',
    fullMarks: 100,
    passMarks: 33,
    active: true,
    teacherName: 'Mahbubur Rahman',
    components: [
      { id: 'cmp-eng1-cq', name: 'Reading & Writing', code: 'CQ', maxMarks: 100, passMarks: 33, weight: 1, contributesToFinal: true, ordering: 1 }
    ]
  },
  {
    id: 'sub-eng2',
    code: '108',
    nameEn: 'English 2nd Paper',
    classId: 'c10',
    subjectType: 'compulsory',
    fullMarks: 100,
    passMarks: 33,
    active: true,
    isPaper2: true,
    teacherName: 'Mahbubur Rahman',
    components: [
      { id: 'cmp-eng2-cq', name: 'Grammar & Composition', code: 'CQ', maxMarks: 100, passMarks: 33, weight: 1, contributesToFinal: true, ordering: 1 }
    ]
  },
  {
    id: 'sub-gmath',
    code: '109',
    nameEn: 'General Mathematics',
    classId: 'c10',
    subjectType: 'compulsory',
    fullMarks: 100,
    passMarks: 33,
    active: true,
    teacherName: 'Kamal Hossain',
    components: [
      { id: 'cmp-gmath-cq', name: 'Creative/CQ', code: 'CQ', maxMarks: 70, passMarks: 23, weight: 1, contributesToFinal: true, ordering: 1 },
      { id: 'cmp-gmath-mcq', name: 'MCQ', code: 'MCQ', maxMarks: 30, passMarks: 10, weight: 1, contributesToFinal: true, ordering: 2 }
    ]
  },
  {
    id: 'sub-phy',
    code: '136',
    nameEn: 'Physics',
    classId: 'c10',
    subjectType: 'compulsory',
    fullMarks: 100,
    passMarks: 33,
    active: true,
    teacherName: 'Dr. Shamim Ahmed',
    components: [
      { id: 'cmp-phy-cq', name: 'Creative/CQ', code: 'CQ', maxMarks: 50, passMarks: 17, weight: 1, contributesToFinal: true, ordering: 1 },
      { id: 'cmp-phy-mcq', name: 'MCQ', code: 'MCQ', maxMarks: 25, passMarks: 8, weight: 1, contributesToFinal: true, ordering: 2 },
      { id: 'cmp-phy-pr', name: 'Practical', code: 'PR', maxMarks: 25, passMarks: 8, weight: 1, contributesToFinal: true, ordering: 3 }
    ]
  },
  {
    id: 'sub-chem',
    code: '137',
    nameEn: 'Chemistry',
    classId: 'c10',
    subjectType: 'compulsory',
    fullMarks: 100,
    passMarks: 33,
    active: true,
    teacherName: 'Rokeya Begum',
    components: [
      { id: 'cmp-chem-cq', name: 'Creative/CQ', code: 'CQ', maxMarks: 50, passMarks: 17, weight: 1, contributesToFinal: true, ordering: 1 },
      { id: 'cmp-chem-mcq', name: 'MCQ', code: 'MCQ', maxMarks: 25, passMarks: 8, weight: 1, contributesToFinal: true, ordering: 2 },
      { id: 'cmp-chem-pr', name: 'Practical', code: 'PR', maxMarks: 25, passMarks: 8, weight: 1, contributesToFinal: true, ordering: 3 }
    ]
  },
  {
    id: 'sub-bio',
    code: '138',
    nameEn: 'Biology',
    classId: 'c10',
    subjectType: 'compulsory',
    fullMarks: 100,
    passMarks: 33,
    active: true,
    teacherName: 'Farhana Yeasmin',
    components: [
      { id: 'cmp-bio-cq', name: 'Creative/CQ', code: 'CQ', maxMarks: 50, passMarks: 17, weight: 1, contributesToFinal: true, ordering: 1 },
      { id: 'cmp-bio-mcq', name: 'MCQ', code: 'MCQ', maxMarks: 25, passMarks: 8, weight: 1, contributesToFinal: true, ordering: 2 },
      { id: 'cmp-bio-pr', name: 'Practical', code: 'PR', maxMarks: 25, passMarks: 8, weight: 1, contributesToFinal: true, ordering: 3 }
    ]
  },
  {
    id: 'sub-hmath',
    code: '126',
    nameEn: 'Higher Mathematics (4th Subject)',
    classId: 'c10',
    subjectType: 'optional',
    fullMarks: 100,
    passMarks: 33,
    active: true,
    teacherName: 'Kamal Hossain',
    components: [
      { id: 'cmp-hmath-cq', name: 'Creative/CQ', code: 'CQ', maxMarks: 50, passMarks: 17, weight: 1, contributesToFinal: true, ordering: 1 },
      { id: 'cmp-hmath-mcq', name: 'MCQ', code: 'MCQ', maxMarks: 25, passMarks: 8, weight: 1, contributesToFinal: true, ordering: 2 },
      { id: 'cmp-hmath-pr', name: 'Practical', code: 'PR', maxMarks: 25, passMarks: 8, weight: 1, contributesToFinal: true, ordering: 3 }
    ]
  },
  {
    id: 'sub-ict',
    code: '154',
    nameEn: 'Information & Comm. Technology',
    classId: 'c10',
    subjectType: 'compulsory',
    fullMarks: 50,
    passMarks: 17,
    active: true,
    teacherName: 'Tanvir Ahmed',
    components: [
      { id: 'cmp-ict-mcq', name: 'MCQ', code: 'MCQ', maxMarks: 25, passMarks: 8, weight: 1, contributesToFinal: true, ordering: 1 },
      { id: 'cmp-ict-pr', name: 'Practical', code: 'PR', maxMarks: 25, passMarks: 8, weight: 1, contributesToFinal: true, ordering: 2 }
    ]
  }
];

export const INITIAL_GRADING_POLICY: GradingPolicy = {
  id: 'bd-board-standard',
  name: 'Education Board Standard (5.0 Scale)',
  scale: 5.0,
  optionalSubjectDeduction: 2.0,
  mandatoryComponentPassing: true,
  bands: [
    { minPercentage: 80, maxPercentage: 100, letterGrade: 'A+', gradePoint: 5.0, remarks: 'Outstanding' },
    { minPercentage: 70, maxPercentage: 79.99, letterGrade: 'A', gradePoint: 4.0, remarks: 'Excellent' },
    { minPercentage: 60, maxPercentage: 69.99, letterGrade: 'A-', gradePoint: 3.5, remarks: 'Very Good' },
    { minPercentage: 50, maxPercentage: 59.99, letterGrade: 'B', gradePoint: 3.0, remarks: 'Good' },
    { minPercentage: 40, maxPercentage: 49.99, letterGrade: 'C', gradePoint: 2.0, remarks: 'Satisfactory' },
    { minPercentage: 33, maxPercentage: 39.99, letterGrade: 'D', gradePoint: 1.0, remarks: 'Pass' },
    { minPercentage: 0, maxPercentage: 32.99, letterGrade: 'F', gradePoint: 0.0, remarks: 'Fail' }
  ]
};

export const INITIAL_CONVERSION_RULES: MarkConversionRule[] = [
  {
    id: 'rule-prop-80',
    name: 'Term Exam to 80% Weightage',
    originalFullMarks: 100,
    targetFullMarks: 80,
    formulaType: 'proportional',
    weight: 0.8,
    precision: 2,
    roundingMethod: 'round',
    description: 'Converts 100 marks terminal exam into 80% final marks contribution: Obtained * 80 / 100'
  },
  {
    id: 'rule-ca-20',
    name: 'Continuous Assessment (CA) to 20%',
    originalFullMarks: 100,
    targetFullMarks: 20,
    formulaType: 'proportional',
    weight: 0.2,
    precision: 2,
    roundingMethod: 'round',
    description: 'Continuous Class test + Assignment into 20 marks: Obtained * 20 / 100'
  },
  {
    id: 'rule-half-50',
    name: 'Proportional Half Marks (100 -> 50)',
    originalFullMarks: 100,
    targetFullMarks: 50,
    formulaType: 'proportional',
    weight: 0.5,
    precision: 1,
    roundingMethod: 'round',
    description: 'Half marks conversion (e.g. 80/100 -> 40/50): (Obtained * 50) / 100'
  }
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'std-1',
    studentId: 'STD-2026-1001',
    admissionNo: 'ADM-10821',
    rollNo: 1,
    nameEn: 'Tahmid Hasan',
    dateOfBirth: '2010-04-12',
    gender: 'Male',
    religion: 'Islam',
    bloodGroup: 'B+',
    classId: 'c10',
    sectionId: 's-padma-10',
    academicYear: '2026',
    admissionDate: '2021-01-15',
    guardianName: 'Md. Rafiqul Islam',
    guardianRelation: 'Father',
    guardianPhone: '+880 1712-345678',
    address: 'House 14, Road 5, Dhanmondi, Dhaka',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    optionalSubjectId: 'sub-hmath',
    duesAmount: 0,
    group: 'Science'
  },
  {
    id: 'std-2',
    studentId: 'STD-2026-1002',
    admissionNo: 'ADM-10822',
    rollNo: 2,
    nameEn: 'Nusrat Jahan Mim',
    dateOfBirth: '2010-09-21',
    gender: 'Female',
    religion: 'Islam',
    bloodGroup: 'A+',
    classId: 'c10',
    sectionId: 's-padma-10',
    academicYear: '2026',
    admissionDate: '2021-01-15',
    guardianName: 'Mohammad Faruk Hossain',
    guardianRelation: 'Father',
    guardianPhone: '+880 1819-876543',
    address: 'Flat 4B, Green Road, Dhaka',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    optionalSubjectId: 'sub-hmath',
    duesAmount: 1500,
    group: 'Science'
  },
  {
    id: 'std-3',
    studentId: 'STD-2026-1003',
    admissionNo: 'ADM-10823',
    rollNo: 3,
    nameEn: 'Samiul Karim',
    dateOfBirth: '2010-02-18',
    gender: 'Male',
    religion: 'Islam',
    bloodGroup: 'O+',
    classId: 'c10',
    sectionId: 's-padma-10',
    academicYear: '2026',
    admissionDate: '2021-01-16',
    guardianName: 'Rezaul Karim',
    guardianRelation: 'Father',
    guardianPhone: '+880 1911-223344',
    address: 'Shantinagar Plaza, Dhaka',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    optionalSubjectId: 'sub-hmath',
    duesAmount: 0,
    group: 'Science'
  },
  {
    id: 'std-4',
    studentId: 'STD-2026-1004',
    admissionNo: 'ADM-10824',
    rollNo: 4,
    nameEn: 'Anika Tabassum',
    dateOfBirth: '2010-11-05',
    gender: 'Female',
    religion: 'Islam',
    bloodGroup: 'AB+',
    classId: 'c10',
    sectionId: 's-padma-10',
    academicYear: '2026',
    admissionDate: '2021-01-16',
    guardianName: 'Dr. Shahabuddin Ahmed',
    guardianRelation: 'Father',
    guardianPhone: '+880 1715-667788',
    address: 'Mirpur DOHS, Dhaka',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    optionalSubjectId: 'sub-hmath',
    duesAmount: 3000,
    group: 'Science'
  },
  {
    id: 'std-5',
    studentId: 'STD-2026-1005',
    admissionNo: 'ADM-10825',
    rollNo: 5,
    nameEn: 'Sourav Roy',
    dateOfBirth: '2010-06-30',
    gender: 'Male',
    religion: 'Hinduism',
    bloodGroup: 'B+',
    classId: 'c10',
    sectionId: 's-padma-10',
    academicYear: '2026',
    admissionDate: '2021-01-18',
    guardianName: 'Bikash Chandra Roy',
    guardianRelation: 'Father',
    guardianPhone: '+880 1817-990011',
    address: 'Kakrail, Dhaka',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    optionalSubjectId: 'sub-hmath',
    duesAmount: 0,
    group: 'Science'
  }
];

export const INITIAL_TEACHERS: Teacher[] = [
  {
    id: 'tch-1',
    teacherId: 'TCH-001',
    nameEn: 'Dr. Shamim Ahmed',
    designation: 'Senior Teacher (Physics)',
    department: 'Science',
    phone: '+880 1711-456789',
    email: 'shamim.physics@dhakaideal.edu.bd',
    joinDate: '2012-03-01',
    qualification: 'M.Sc, Ph.D (Physics, DU)',
    status: 'active'
  },
  {
    id: 'tch-2',
    teacherId: 'TCH-002',
    nameEn: 'Nasreen Sultana',
    designation: 'Assistant Headmistress & Senior Bangla Teacher',
    department: 'Bangla',
    phone: '+880 1819-234567',
    email: 'nasreen.bangla@dhakaideal.edu.bd',
    joinDate: '2008-07-15',
    qualification: 'M.A (Bangla, DU), B.Ed',
    status: 'active'
  },
  {
    id: 'tch-3',
    teacherId: 'TCH-003',
    nameEn: 'Kamal Hossain',
    designation: 'Senior Teacher (Mathematics)',
    department: 'Mathematics',
    phone: '+880 1912-345678',
    email: 'kamal.math@dhakaideal.edu.bd',
    joinDate: '2015-01-10',
    qualification: 'M.Sc (Mathematics, JU)',
    status: 'active'
  },
  {
    id: 'tch-4',
    teacherId: 'TCH-004',
    nameEn: 'Mahbubur Rahman',
    designation: 'Lecturer in English',
    department: 'English',
    phone: '+880 1722-998877',
    email: 'mahbub.eng@dhakaideal.edu.bd',
    joinDate: '2018-09-01',
    qualification: 'M.A in English (RU)',
    status: 'active'
  }
];

export const INITIAL_STAFF: Staff[] = [
  {
    id: 'stf-1',
    staffId: 'STF-01',
    nameEn: 'Md. Nurul Islam',
    role: 'Head Clerk / Accountant',
    phone: '+880 1713-112233',
    status: 'active'
  },
  {
    id: 'stf-2',
    staffId: 'STF-02',
    nameEn: 'Abul Kashem',
    role: 'Computer Operator & Data Entry',
    phone: '+880 1814-445566',
    status: 'active'
  }
];

export const INITIAL_EXAMINATIONS: Examination[] = [
  {
    id: 'exam-1st-2026',
    name: '1st Term / 1st Semester Examination 2026',
    academicYear: '2026',
    classId: 'c10',
    term: '1st_term',
    startDate: '2026-03-15',
    endDate: '2026-03-30',
    status: 'published',
    weightPercentage: 25,
    isPublished: true,
    publishedDate: '2026-04-05'
  },
  {
    id: 'exam-hy-2026',
    name: 'Half-Yearly Examination 2026',
    academicYear: '2026',
    classId: 'c10',
    term: 'half_yearly',
    startDate: '2026-06-10',
    endDate: '2026-06-25',
    status: 'published',
    weightPercentage: 25,
    isPublished: true,
    publishedDate: '2026-07-05'
  },
  {
    id: 'exam-pre-2026',
    name: '2nd Term / Pre-Test Examination 2026',
    academicYear: '2026',
    classId: 'c10',
    term: 'pre_test',
    startDate: '2026-09-10',
    endDate: '2026-09-25',
    status: 'published',
    weightPercentage: 25,
    isPublished: true,
    publishedDate: '2026-10-02'
  },
  {
    id: 'exam-annual-2026',
    name: 'Annual / Final Examination 2026',
    academicYear: '2026',
    classId: 'c10',
    term: 'annual',
    startDate: '2026-11-15',
    endDate: '2026-11-30',
    status: 'marks_entry',
    weightPercentage: 25,
    isPublished: false
  }
];

export const INITIAL_MARKS: StudentMark[] = [
  {
    id: 'mrk-1-ban1',
    examId: 'exam-hy-2026',
    studentId: 'std-1',
    subjectId: 'sub-ban1',
    componentScores: { 'cmp-ban1-cq': 62, 'cmp-ban1-mcq': 26 },
    enteredBy: 'Nasreen Sultana',
    enteredAt: '2026-06-28'
  },
  {
    id: 'mrk-1-ban2',
    examId: 'exam-hy-2026',
    studentId: 'std-1',
    subjectId: 'sub-ban2',
    componentScores: { 'cmp-ban2-cq': 58, 'cmp-ban2-mcq': 27 },
    enteredBy: 'Nasreen Sultana',
    enteredAt: '2026-06-28'
  },
  {
    id: 'mrk-1-eng1',
    examId: 'exam-hy-2026',
    studentId: 'std-1',
    subjectId: 'sub-eng1',
    componentScores: { 'cmp-eng1-cq': 82 },
    enteredBy: 'Mahbubur Rahman',
    enteredAt: '2026-06-29'
  },
  {
    id: 'mrk-1-eng2',
    examId: 'exam-hy-2026',
    studentId: 'std-1',
    subjectId: 'sub-eng2',
    componentScores: { 'cmp-eng2-cq': 84 },
    enteredBy: 'Mahbubur Rahman',
    enteredAt: '2026-06-29'
  },
  {
    id: 'mrk-1-gmath',
    examId: 'exam-hy-2026',
    studentId: 'std-1',
    subjectId: 'sub-gmath',
    componentScores: { 'cmp-gmath-cq': 68, 'cmp-gmath-mcq': 29 },
    enteredBy: 'Kamal Hossain',
    enteredAt: '2026-06-30'
  },
  {
    id: 'mrk-1-phy',
    examId: 'exam-hy-2026',
    studentId: 'std-1',
    subjectId: 'sub-phy',
    componentScores: { 'cmp-phy-cq': 44, 'cmp-phy-mcq': 23, 'cmp-phy-pr': 24 },
    enteredBy: 'Dr. Shamim Ahmed',
    enteredAt: '2026-06-30'
  },
  {
    id: 'mrk-1-chem',
    examId: 'exam-hy-2026',
    studentId: 'std-1',
    subjectId: 'sub-chem',
    componentScores: { 'cmp-chem-cq': 43, 'cmp-chem-mcq': 22, 'cmp-chem-pr': 25 },
    enteredBy: 'Rokeya Begum',
    enteredAt: '2026-06-30'
  },
  {
    id: 'mrk-1-bio',
    examId: 'exam-hy-2026',
    studentId: 'std-1',
    subjectId: 'sub-bio',
    componentScores: { 'cmp-bio-cq': 42, 'cmp-bio-mcq': 21, 'cmp-bio-pr': 24 },
    enteredBy: 'Farhana Yeasmin',
    enteredAt: '2026-06-30'
  },
  {
    id: 'mrk-1-hmath',
    examId: 'exam-hy-2026',
    studentId: 'std-1',
    subjectId: 'sub-hmath',
    componentScores: { 'cmp-hmath-cq': 47, 'cmp-hmath-mcq': 24, 'cmp-hmath-pr': 25 },
    enteredBy: 'Kamal Hossain',
    enteredAt: '2026-06-30'
  },
  {
    id: 'mrk-1-ict',
    examId: 'exam-hy-2026',
    studentId: 'std-1',
    subjectId: 'sub-ict',
    componentScores: { 'cmp-ict-mcq': 23, 'cmp-ict-pr': 24 },
    enteredBy: 'Tanvir Ahmed',
    enteredAt: '2026-06-30'
  },
  {
    id: 'mrk-2-ban1',
    examId: 'exam-hy-2026',
    studentId: 'std-2',
    subjectId: 'sub-ban1',
    componentScores: { 'cmp-ban1-cq': 54, 'cmp-ban1-mcq': 24 },
    enteredBy: 'Nasreen Sultana',
    enteredAt: '2026-06-28'
  },
  {
    id: 'mrk-2-ban2',
    examId: 'exam-hy-2026',
    studentId: 'std-2',
    subjectId: 'sub-ban2',
    componentScores: { 'cmp-ban2-cq': 52, 'cmp-ban2-mcq': 22 },
    enteredBy: 'Nasreen Sultana',
    enteredAt: '2026-06-28'
  },
  {
    id: 'mrk-2-eng1',
    examId: 'exam-hy-2026',
    studentId: 'std-2',
    subjectId: 'sub-eng1',
    componentScores: { 'cmp-eng1-cq': 76 },
    enteredBy: 'Mahbubur Rahman',
    enteredAt: '2026-06-29'
  },
  {
    id: 'mrk-2-eng2',
    examId: 'exam-hy-2026',
    studentId: 'std-2',
    subjectId: 'sub-eng2',
    componentScores: { 'cmp-eng2-cq': 81 },
    enteredBy: 'Mahbubur Rahman',
    enteredAt: '2026-06-29'
  },
  {
    id: 'mrk-2-gmath',
    examId: 'exam-hy-2026',
    studentId: 'std-2',
    subjectId: 'sub-gmath',
    componentScores: { 'cmp-gmath-cq': 59, 'cmp-gmath-mcq': 26 },
    enteredBy: 'Kamal Hossain',
    enteredAt: '2026-06-30'
  },
  {
    id: 'mrk-2-phy',
    examId: 'exam-hy-2026',
    studentId: 'std-2',
    subjectId: 'sub-phy',
    componentScores: { 'cmp-phy-cq': 38, 'cmp-phy-mcq': 20, 'cmp-phy-pr': 23 },
    enteredBy: 'Dr. Shamim Ahmed',
    enteredAt: '2026-06-30'
  },
  {
    id: 'mrk-2-chem',
    examId: 'exam-hy-2026',
    studentId: 'std-2',
    subjectId: 'sub-chem',
    componentScores: { 'cmp-chem-cq': 36, 'cmp-chem-mcq': 19, 'cmp-chem-pr': 23 },
    enteredBy: 'Rokeya Begum',
    enteredAt: '2026-06-30'
  },
  {
    id: 'mrk-2-bio',
    examId: 'exam-hy-2026',
    studentId: 'std-2',
    subjectId: 'sub-bio',
    componentScores: { 'cmp-bio-cq': 39, 'cmp-bio-mcq': 21, 'cmp-bio-pr': 24 },
    enteredBy: 'Farhana Yeasmin',
    enteredAt: '2026-06-30'
  },
  {
    id: 'mrk-2-hmath',
    examId: 'exam-hy-2026',
    studentId: 'std-2',
    subjectId: 'sub-hmath',
    componentScores: { 'cmp-hmath-cq': 41, 'cmp-hmath-mcq': 21, 'cmp-hmath-pr': 24 },
    enteredBy: 'Kamal Hossain',
    enteredAt: '2026-06-30'
  },
  {
    id: 'mrk-2-ict',
    examId: 'exam-hy-2026',
    studentId: 'std-2',
    subjectId: 'sub-ict',
    componentScores: { 'cmp-ict-mcq': 20, 'cmp-ict-pr': 22 },
    enteredBy: 'Tanvir Ahmed',
    enteredAt: '2026-06-30'
  }
];

export const INITIAL_FEE_CATEGORIES: FeeCategory[] = [
  { id: 'fc-tuition', nameEn: 'Monthly Tuition Fee', type: 'monthly_tuition', defaultAmount: 1500 },
  { id: 'fc-admission', nameEn: 'Admission Fee', type: 'admission', defaultAmount: 5000 },
  { id: 'fc-exam', nameEn: 'Examination Fee', type: 'examination', defaultAmount: 800 },
  { id: 'fc-session', nameEn: 'Session Charge', type: 'session', defaultAmount: 3500 },
  { id: 'fc-lab', nameEn: 'Science Lab Fee', type: 'lab', defaultAmount: 500 }
];

export const INITIAL_FEE_PAYMENTS: FeePayment[] = [
  {
    id: 'pay-1',
    receiptNo: 'REC-2026-00108',
    studentId: 'std-1',
    feeCategoryId: 'fc-tuition',
    month: 'May 2026',
    amountPaid: 1500,
    discount: 0,
    date: '2026-05-08',
    paymentMethod: 'bKash',
    transactionRef: 'BK9X245108',
    collectedBy: 'Md. Nurul Islam',
    status: 'paid',
    remarks: 'Paid on time'
  },
  {
    id: 'pay-2',
    receiptNo: 'REC-2026-00109',
    studentId: 'std-1',
    feeCategoryId: 'fc-exam',
    month: 'Half-Yearly',
    amountPaid: 800,
    discount: 0,
    date: '2026-05-15',
    paymentMethod: 'Cash',
    collectedBy: 'Md. Nurul Islam',
    status: 'paid'
  },
  {
    id: 'pay-3',
    receiptNo: 'REC-2026-00115',
    studentId: 'std-3',
    feeCategoryId: 'fc-tuition',
    month: 'May 2026',
    amountPaid: 1500,
    discount: 0,
    date: '2026-05-10',
    paymentMethod: 'Nagad',
    transactionRef: 'NG881204',
    collectedBy: 'Md. Nurul Islam',
    status: 'paid'
  },
  {
    id: 'pay-4',
    receiptNo: 'REC-2026-00120',
    studentId: 'std-5',
    feeCategoryId: 'fc-tuition',
    month: 'May 2026',
    amountPaid: 1500,
    discount: 0,
    date: '2026-05-12',
    paymentMethod: 'Cash',
    collectedBy: 'Md. Nurul Islam',
    status: 'paid'
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'txn-1',
    type: 'income',
    category: 'Student Tuition Fees',
    amount: 145000,
    date: '2026-05-15',
    paymentMethod: 'Bank Transfer / Gateway',
    referenceNo: 'TXN-BANK-0515',
    description: 'Consolidated May month tuition fee collection',
    createdBy: 'Md. Nurul Islam'
  },
  {
    id: 'txn-2',
    type: 'income',
    category: 'Exam Fees Collection',
    amount: 72000,
    date: '2026-05-20',
    paymentMethod: 'Cash / bKash',
    referenceNo: 'TXN-EXAM-0520',
    description: 'Half-yearly examination registration fees',
    createdBy: 'Md. Nurul Islam'
  },
  {
    id: 'txn-3',
    type: 'expense',
    category: 'Teacher & Staff Salary',
    amount: 185000,
    date: '2026-05-02',
    paymentMethod: 'Bank Transfer',
    referenceNo: 'SAL-2026-05',
    description: 'Monthly payroll disbursement for faculty and staff',
    createdBy: 'Principal Md. Abdul Karim'
  },
  {
    id: 'txn-4',
    type: 'expense',
    category: 'Utility & Internet Bills',
    amount: 14200,
    date: '2026-05-10',
    paymentMethod: 'Cash',
    referenceNo: 'UTIL-0526',
    description: 'Electricity, water, and dedicated internet bill',
    createdBy: 'Md. Nurul Islam'
  },
  {
    id: 'txn-5',
    type: 'expense',
    category: 'Science Lab Equipment',
    amount: 28500,
    date: '2026-05-18',
    paymentMethod: 'Cheque',
    referenceNo: 'CHQ-778102',
    description: 'Procurement of reagents and microscopes for physics and chemistry labs',
    createdBy: 'Dr. Shamim Ahmed'
  }
];

export const INITIAL_NOTICES: Notice[] = [
  {
    id: 'ntc-1',
    title: 'Half-Yearly Examination 2026 Result Publication Notice',
    contentEn: 'All teachers, guardians, and students are hereby informed that the results of the Half-Yearly Examination 2026 will be officially published on July 5. Academic transcripts will be accessible online and at the administrative counter.',
    publishDate: '2026-06-30',
    targetAudience: 'All',
    priority: 'urgent',
    publishedBy: 'Principal Md. Abdul Karim'
  },
  {
    id: 'ntc-2',
    title: 'Special Extra Classes for Class 10 SSC Candidates',
    contentEn: 'Special revision classes in Mathematics and Physics for Class 10 candidates will commence from July 15. Attendance is compulsory.',
    publishDate: '2026-07-02',
    targetAudience: 'Students',
    priority: 'important',
    publishedBy: 'Academic Coordinator'
  },
  {
    id: 'ntc-3',
    title: 'Submission of 2nd Installment Tuition Fees',
    contentEn: 'All guardians are kindly requested to clear all outstanding tuition and term dues by the 10th of this month through Cash, bKash, or Nagad.',
    publishDate: '2026-07-01',
    targetAudience: 'Guardians',
    priority: 'normal',
    publishedBy: 'Accounts Section'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-07-05 10:30:15',
    user: 'Principal Md. Abdul Karim (Super Admin)',
    action: 'PUBLISH_RESULTS',
    details: 'Officially published Half-Yearly Examination 2026 results for Class 10 (Padma Section)',
    ipAddress: '192.168.1.10'
  },
  {
    id: 'log-2',
    timestamp: '2026-07-04 16:45:00',
    user: 'Kamal Hossain (Teacher)',
    action: 'MARKS_SUBMISSION',
    details: 'Submitted marks for General Mathematics (Class 10, Padma Section)',
    ipAddress: '192.168.1.25'
  },
  {
    id: 'log-3',
    timestamp: '2026-07-02 11:15:30',
    user: 'Md. Nurul Islam (Accountant)',
    action: 'FEE_COLLECTION',
    details: 'Collected tuition fee BDT 1,500 from Student STD-2026-1001 (Receipt: REC-2026-00108)',
    ipAddress: '192.168.1.15'
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-mirabul',
    username: '01936988967',
    password: 'pbkdf2:sha256:100000$554d8f33360e054849b5990b00937409$dd8161ed00f7a51c5d092c835465d34f1b31d8f8526d34e9449fdccccda0b77e8353519846f316f3c2e92e08f9e829dc776fa7b2a575de278e440303afb10bd3',
    fullName: 'Md. Mirabul Hossen',
    role: 'Super Admin',
    email: '123mirabulh@gmail.com',
    mobileNumber: '01936988967',
    instituteName: 'Central Administration & Master Control',
    studentLimit: 10000,
    status: 'active',
    isMasterAdmin: true,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-admin',
    username: 'admin',
    password: 'admin123',
    fullName: 'Professor Md. Abdul Karim',
    role: 'School Administrator',
    email: 'principal@dhakaideal.edu.bd',
    mobileNumber: '+8801711234567',
    instituteName: 'Dhaka Ideal Model High School & College',
    studentLimit: 1000,
    status: 'active',
    isMasterAdmin: false,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-schooladmin',
    username: 'schooladmin',
    password: 'school123',
    fullName: 'Shahadat Hossain',
    role: 'School Administrator',
    email: 'admin@dhakaideal.edu.bd',
    mobileNumber: '+8801819234567',
    instituteName: 'Dhaka Ideal Model High School & College',
    studentLimit: 500,
    status: 'active',
    isMasterAdmin: false
  },
  {
    id: 'usr-accountant',
    username: 'accountant',
    password: 'accounts123',
    fullName: 'Md. Nurul Islam',
    role: 'Accountant',
    email: 'accounts@dhakaideal.edu.bd',
    mobileNumber: '+8801713112233',
    instituteName: 'Dhaka Ideal Model High School & College',
    studentLimit: 500,
    status: 'active',
    isMasterAdmin: false
  },
  {
    id: 'usr-teacher',
    username: 'teacher',
    password: 'teacher123',
    fullName: 'Kamal Hossain',
    role: 'Teacher',
    email: 'kamal.math@dhakaideal.edu.bd',
    mobileNumber: '+8801912345678',
    instituteName: 'Dhaka Ideal Model High School & College',
    studentLimit: 500,
    status: 'active',
    isMasterAdmin: false
  }
];

export const INITIAL_ACCESS_REQUESTS: AccessRequest[] = [
  {
    id: 'req-101',
    instituteName: 'Chittagong Collegiate High School',
    eiin: '104321',
    applicantName: 'Md. Zahirul Haque',
    phone: '+880 1812-445566',
    email: 'principal@cchs.edu.bd',
    expectedStudents: 750,
    requestedPlan: 'standard',
    status: 'pending',
    submittedAt: '2026-10-18 14:30:00',
    notes: 'Requesting access license for 750 students with full result and fee receipt module.'
  },
  {
    id: 'req-102',
    instituteName: 'Sylhet Government Model College',
    eiin: '106789',
    applicantName: 'Dr. Nasir Uddin',
    phone: '+880 1718-990022',
    email: 'nasir.sylhet@modelcollege.edu.bd',
    expectedStudents: 400,
    requestedPlan: 'trial',
    status: 'pending',
    submittedAt: '2026-10-19 09:15:00',
    notes: 'Trial access request for evaluation before purchasing complete school software.'
  }
];

export const INITIAL_SHIFTS: Shift[] = [
  { id: 'shift-morning', name: 'Morning Shift', startTime: '07:30 AM', endTime: '12:00 PM', active: true },
  { id: 'shift-day', name: 'Day Shift', startTime: '12:30 PM', endTime: '05:00 PM', active: true }
];

export const INITIAL_GROUPS: AcademicGroup[] = [
  { id: 'grp-science', name: 'Science', code: 'SCI', description: 'Science Stream (Physics, Chemistry, Biology, Higher Math)', active: true },
  { id: 'grp-humanities', name: 'Humanities', code: 'HUM', description: 'Humanities & Arts Stream (History, Civics, Geography)', active: true },
  { id: 'grp-business', name: 'Business Studies', code: 'BUS', description: 'Business Studies & Commerce Stream (Accounting, Finance)', active: true }
];

export const INITIAL_ROUTINE_PERIODS: RoutinePeriod[] = [
  { id: 'p1', name: '1st', time: '09:00 - 09:45 AM', startTime: '09:00 AM', endTime: '09:45 AM', ordering: 1 },
  { id: 'p2', name: '2nd', time: '09:45 - 10:30 AM', startTime: '09:45 AM', endTime: '10:30 AM', ordering: 2 },
  { id: 'p3', name: '3rd', time: '10:30 - 11:15 AM', startTime: '10:30 AM', endTime: '11:15 AM', ordering: 3 },
  { id: 'p4', name: '4th', time: '11:15 - 12:00 PM', startTime: '11:15 AM', endTime: '12:00 PM', ordering: 4 },
  { id: 'p-break', name: 'Tiffin Break', time: '12:00 - 12:45 PM', startTime: '12:00 PM', endTime: '12:45 PM', isBreak: true, ordering: 5 },
  { id: 'p5', name: '5th', time: '12:45 - 01:30 PM', startTime: '12:45 PM', endTime: '01:30 PM', ordering: 6 },
  { id: 'p6', name: '6th', time: '01:30 - 02:15 PM', startTime: '01:30 PM', endTime: '02:15 PM', ordering: 7 },
  { id: 'p7', name: '7th', time: '02:15 - 03:00 PM', startTime: '02:15 PM', endTime: '03:00 PM', ordering: 8 }
];

export const INITIAL_ROUTINES: ClassRoutine[] = [
  {
    id: 'routine-c10-morning',
    classId: 'c10',
    shiftId: 'shift-morning',
    academicYear: '2026',
    periods: INITIAL_ROUTINE_PERIODS,
    schedule: {
      Saturday: ['Bangla 1st', 'English 1st', 'General Math', 'Physics', 'Tiffin', 'Chemistry', 'Biology', 'ICT'],
      Sunday: ['English 2nd', 'Bangla 2nd', 'Higher Math', 'General Math', 'Tiffin', 'Physics (PR)', 'Physics (PR)', 'BGS'],
      Monday: ['Bangla 1st', 'Physics', 'Chemistry', 'English 1st', 'Tiffin', 'General Math', 'Religion', 'ICT'],
      Tuesday: ['General Math', 'Chemistry (PR)', 'Chemistry (PR)', 'Bangla 2nd', 'Tiffin', 'English 2nd', 'Biology', 'BGS'],
      Wednesday: ['Higher Math', 'Biology (PR)', 'Biology (PR)', 'Physics', 'Tiffin', 'Chemistry', 'General Math', 'Physical Ed'],
      Thursday: ['Bangla 1st', 'English 1st', 'General Math', 'Class Test / Revision', 'Tiffin', 'Cultural / Sports', 'Weekly Assembly', 'Club Activity']
    }
  }
];

