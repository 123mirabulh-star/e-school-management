import {
  Subject,
  Student,
  StudentMark,
  GradingPolicy,
  MarkConversionRule,
  CalculatedResult,
  SubjectResultDetail
} from '../types';

export function calculateGradeAndPoint(
  percentage: number,
  policy: GradingPolicy
): { letterGrade: string; gradePoint: number; remarks: string } {
  for (const band of policy.bands) {
    if (percentage >= band.minPercentage && percentage <= band.maxPercentage) {
      return {
        letterGrade: band.letterGrade,
        gradePoint: band.gradePoint,
        remarks: band.remarks
      };
    }
  }
  // Default to Fail if out of bounds
  return { letterGrade: 'F', gradePoint: 0.0, remarks: 'Fail' };
}

export function applyConversion(
  obtained: number,
  originalMax: number,
  targetMax: number,
  rule?: MarkConversionRule
): number {
  if (!rule) {
    if (originalMax === targetMax) return obtained;
    return (obtained * targetMax) / (originalMax || 1);
  }

  let converted = obtained;
  if (rule.formulaType === 'proportional') {
    converted = (obtained * rule.targetFullMarks) / (rule.originalFullMarks || 1);
  } else if (rule.formulaType === 'weighted') {
    converted = obtained * (rule.weight || 1);
  } else if (rule.formulaType === 'custom' && rule.customFormula) {
    try {
      // Safe predefined mathematical replacement
      // variable "obtained", "original", "target"
      const expr = rule.customFormula
        .replace(/obtained/gi, String(obtained))
        .replace(/original/gi, String(originalMax))
        .replace(/target/gi, String(targetMax));
      
      // Only allow numbers and basic math operators +, -, *, /, (, )
      if (/^[0-9\.\+\-\*\/\(\)\s]+$/.test(expr)) {
        // eslint-disable-next-line no-eval
        converted = Function(`"use strict"; return (${expr})`)();
      }
    } catch {
      converted = (obtained * targetMax) / (originalMax || 1);
    }
  }

  // Precision and Rounding
  const factor = Math.pow(10, rule.precision || 2);
  if (rule.roundingMethod === 'floor') {
    converted = Math.floor(converted * factor) / factor;
  } else if (rule.roundingMethod === 'ceil') {
    converted = Math.ceil(converted * factor) / factor;
  } else {
    converted = Math.round(converted * factor) / factor;
  }

  return Math.min(rule.targetFullMarks, Math.max(0, converted));
}

export function computeStudentSubjectResult(
  subject: Subject,
  studentMark: StudentMark | undefined,
  policy: GradingPolicy,
  isOptionalSubject: boolean,
  conversionRules: MarkConversionRule[] = []
): SubjectResultDetail {
  const scores = studentMark?.componentScores || {};
  const breakdown: SubjectResultDetail['componentBreakdown'] = [];
  let subjectObtained = 0;
  let subjectConverted = 0;
  let hasComponentFailed = false;

  for (const cmp of subject.components) {
    const obtained = scores[cmp.id] ?? 0;
    
    // Check if conversion rule applies
    const rule = conversionRules.find(r => r.subjectId === subject.id || r.componentCode === cmp.code);
    const converted = applyConversion(obtained, cmp.maxMarks, cmp.maxMarks, rule);

    const isPassed = !cmp.passMarks || obtained >= cmp.passMarks;
    if (!isPassed && policy.mandatoryComponentPassing) {
      hasComponentFailed = true;
    }

    if (cmp.contributesToFinal) {
      subjectObtained += obtained;
      subjectConverted += converted;
    }

    breakdown.push({
      componentName: cmp.name,
      code: cmp.code,
      maxMarks: cmp.maxMarks,
      passMarks: cmp.passMarks,
      obtainedMarks: obtained,
      convertedMarks: converted,
      isPassed
    });
  }

  const percentage = subject.fullMarks > 0 ? (subjectConverted / subject.fullMarks) * 100 : 0;
  let { letterGrade, gradePoint } = calculateGradeAndPoint(percentage, policy);

  // If failed individual mandatory component or below passMarks overall
  let isPassed = subjectConverted >= subject.passMarks && !hasComponentFailed;
  if (!isPassed) {
    letterGrade = 'F';
    gradePoint = 0.0;
  }

  // Calculate 4th subject GPA contribution in Bangladesh board system:
  // Points above 2.0 (e.g. 5.0 - 2.0 = 3.0) added to GPA numerator
  let gpaContribution = gradePoint;
  if (isOptionalSubject) {
    const deduction = policy.optionalSubjectDeduction ?? 2.0;
    gpaContribution = Math.max(0, gradePoint - deduction);
  }

  return {
    subjectId: subject.id,
    subjectCode: subject.code,
    subjectNameEn: subject.nameEn,
    isOptional: isOptionalSubject,
    fullMarks: subject.fullMarks,
    passMarks: subject.passMarks,
    componentBreakdown: breakdown,
    totalObtained: subjectObtained,
    totalConverted: subjectConverted,
    letterGrade,
    gradePoint,
    isPassed,
    gpaContribution
  };
}

export function calculateSingleStudentResult(
  student: Student,
  examId: string,
  academicYear: string,
  subjects: Subject[],
  marks: StudentMark[],
  policy: GradingPolicy,
  conversionRules: MarkConversionRule[] = []
): CalculatedResult {
  const studentMarks = marks.filter(m => m.studentId === student.id && m.examId === examId);
  const markMap = new Map<string, StudentMark>(studentMarks.map(m => [m.subjectId, m]));

  const subjectResults: SubjectResultDetail[] = [];
  let totalObtainedMarks = 0;
  let totalFullMarks = 0;
  let failedSubjectCount = 0;
  let compulsorySubjectsCount = 0;
  let totalGradePoints = 0;
  let optionalContribution = 0;

  for (const subject of subjects) {
    const isOptional = subject.subjectType === 'optional' || student.optionalSubjectId === subject.id;
    const sm = markMap.get(subject.id);
    const subRes = computeStudentSubjectResult(subject, sm, policy, isOptional, conversionRules);
    subjectResults.push(subRes);

    totalObtainedMarks += subRes.totalConverted;
    totalFullMarks += subRes.fullMarks;

    if (!isOptional) {
      compulsorySubjectsCount++;
      totalGradePoints += subRes.gradePoint;
      if (!subRes.isPassed) {
        failedSubjectCount++;
      }
    } else {
      optionalContribution += subRes.gpaContribution;
    }
  }

  let finalGpa = 0;
  let overallStatus: 'PASSED' | 'FAILED' = 'PASSED';
  let overallGrade = 'F';

  if (failedSubjectCount > 0) {
    overallStatus = 'FAILED';
    finalGpa = 0.0;
    overallGrade = 'F';
  } else {
    // Bangladesh Formula: (Sum of Compulsory Subject GPAs + Optional Subject GP above 2.0) / Compulsory Count
    const divisor = Math.max(1, compulsorySubjectsCount);
    const rawGpa = (totalGradePoints + optionalContribution) / divisor;
    finalGpa = Math.min(policy.scale || 5.0, Math.round(rawGpa * 100) / 100);

    // Determine overall letter grade
    if (finalGpa >= 5.0) overallGrade = 'A+';
    else if (finalGpa >= 4.0) overallGrade = 'A';
    else if (finalGpa >= 3.5) overallGrade = 'A-';
    else if (finalGpa >= 3.0) overallGrade = 'B';
    else if (finalGpa >= 2.0) overallGrade = 'C';
    else if (finalGpa >= 1.0) overallGrade = 'D';
    else overallGrade = 'F';
  }

  const percentage = totalFullMarks > 0 ? (totalObtainedMarks / totalFullMarks) * 100 : 0;

  return {
    id: `res-${examId}-${student.id}`,
    examId,
    studentId: student.id,
    studentRoll: student.rollNo,
    studentNameEn: student.nameEn,
    classId: student.classId,
    sectionId: student.sectionId,
    academicYear,
    group: student.group,
    shift: student.shift,
    totalObtainedMarks,
    totalFullMarks,
    percentage: Math.round(percentage * 100) / 100,
    gpa: finalGpa,
    letterGrade: overallGrade,
    resultStatus: overallStatus,
    failedSubjectCount,
    calculatedAt: new Date().toISOString(),
    published: true,
    subjectResults
  };
}

export function calculateAllResults(
  students: Student[],
  examId: string,
  academicYear: string,
  allSubjects: Subject[],
  marks: StudentMark[],
  policy: GradingPolicy,
  conversionRules: MarkConversionRule[] = []
): CalculatedResult[] {
  const results = students.map(student => {
    // Select subjects matching this specific student's class
    const classSubjects = allSubjects.filter(s => s.classId === student.classId && s.active);
    const subjectsToUse = classSubjects.length > 0 ? classSubjects : allSubjects.filter(s => s.active);
    return calculateSingleStudentResult(student, examId, academicYear, subjectsToUse, marks, policy, conversionRules);
  });

  // Calculate Merit Ranks:
  // Sort: PASSED first, then GPA descending, then Total Marks descending
  const sorted = [...results].sort((a, b) => {
    if (a.resultStatus !== b.resultStatus) {
      return a.resultStatus === 'PASSED' ? -1 : 1;
    }
    if (b.gpa !== a.gpa) {
      return b.gpa - a.gpa;
    }
    return b.totalObtainedMarks - a.totalObtainedMarks;
  });

  let rank = 1;
  for (const res of sorted) {
    if (res.resultStatus === 'PASSED') {
      res.meritRank = rank++;
    } else {
      res.meritRank = undefined;
    }
  }

  return sorted;
}
