import React, { useState } from 'react';
import {
  Award,
  Printer,
  Download,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Check,
  Copy,
  X,
  FileSpreadsheet,
  Layers,
  Sliders,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Sparkles,
  Trophy,
  Medal
} from 'lucide-react';
import { CalculatedResult, Student, MarksheetSettings } from '../types';
import { AppDatabase, logAuditAction } from '../services/storage';
import { calculateAllResults } from '../services/resultEngine';
import { downloadHtmlDocument, downloadCsv, printDocument } from '../utils/downloadHelper';
import { MarksheetSettingsModal } from './MarksheetSettingsModal';
import { DEFAULT_MARKSHEET_SETTINGS } from '../data/initialData';

interface ResultsViewProps {
  db: AppDatabase;
  onUpdateDb: (updated: AppDatabase) => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  db,
  onUpdateDb
}) => {
  const [selectedExamId, setSelectedExamId] = useState<string>(db.examinations[0]?.id || 'exam-hy-2026');
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('all');
  const [selectedShift, setSelectedShift] = useState<string>('all');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'tabulation' | 'marksheet' | 'merit'>('tabulation');

  const [viewingResult, setViewingResult] = useState<CalculatedResult | null>(db.results[0] || null);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [downloadMessage, setDownloadMessage] = useState<string | null>(null);
  const [isMarksheetSettingsOpen, setIsMarksheetSettingsOpen] = useState(false);

  const activeExam = db.examinations.find(e => e.id === selectedExamId) || db.examinations[0];
  const mSettings = db.schoolSettings.marksheetSettings || DEFAULT_MARKSHEET_SETTINGS;

  // Filter calculated results for selected exam, class, section, shift, and group
  const examResults = db.results.filter(r => {
    if (r.examId !== selectedExamId) return false;
    if (selectedClassId !== 'all' && r.classId !== selectedClassId) return false;
    if (selectedSectionId !== 'all' && r.sectionId !== selectedSectionId) return false;
    if (selectedShift !== 'all' && r.shift !== selectedShift) return false;
    if (selectedGroup !== 'all' && r.group !== selectedGroup) return false;
    return true;
  });

  // Calculate statistics
  const totalStudents = examResults.length;
  const passedStudents = examResults.filter(r => r.resultStatus === 'PASSED').length;
  const failedStudents = totalStudents - passedStudents;
  const passRate = totalStudents > 0 ? (passedStudents / totalStudents) * 100 : 0;
  const averageGpa = totalStudents > 0
    ? examResults.reduce((acc, r) => acc + r.gpa, 0) / totalStudents
    : 0;

  // Save customized marksheet settings (Requirement 3)
  const handleSaveMarksheetSettings = (newSettings: MarksheetSettings) => {
    const updatedSettings = {
      ...db.schoolSettings,
      marksheetSettings: newSettings
    };
    let updatedDb: AppDatabase = {
      ...db,
      schoolSettings: updatedSettings
    };
    updatedDb = logAuditAction(
      updatedDb,
      'UPDATE_MARKSHEET_SETTINGS',
      'Saved customized marksheet design settings from Result Management view.'
    );
    onUpdateDb(updatedDb);
    setDownloadMessage('Custom marksheet layout updated and saved successfully!');
    setTimeout(() => setDownloadMessage(null), 4000);
  };

  // Generate / Recalculate results (Requirement 2)
  const handleGenerateResults = () => {
    setIsRecalculating(true);
    setTimeout(() => {
      const classStudents = db.students.filter(s => {
        if (s.status !== 'active') return false;
        if (selectedClassId !== 'all' && s.classId !== selectedClassId) return false;
        if (selectedSectionId !== 'all' && s.sectionId !== selectedSectionId) return false;
        if (selectedShift !== 'all' && s.shift !== selectedShift) return false;
        if (selectedGroup !== 'all' && s.group !== selectedGroup) return false;
        return true;
      });

      const subjectsToUse = selectedClassId === 'all'
        ? db.subjects.filter(s => s.active)
        : db.subjects.filter(s => s.classId === selectedClassId && s.active);

      const generated = calculateAllResults(
        classStudents,
        selectedExamId,
        db.schoolSettings.currentAcademicYear,
        subjectsToUse.length > 0 ? subjectsToUse : db.subjects.filter(s => s.active),
        db.marks,
        db.gradingPolicy,
        db.conversionRules
      );

      // Keep results for other exams and other classes
      const otherResults = db.results.filter(r => {
        if (r.examId !== selectedExamId) return true;
        if (selectedClassId !== 'all' && r.classId !== selectedClassId) return true;
        if (selectedSectionId !== 'all' && r.sectionId !== selectedSectionId) return true;
        return false;
      });

      const updatedResults = [...otherResults, ...generated];
      let updatedDb: AppDatabase = { ...db, results: updatedResults };

      updatedDb = logAuditAction(
        updatedDb,
        'GENERATE_RESULTS',
        `Generated examination results for ${activeExam?.name || selectedExamId} (${generated.length} students calculated)`
      );

      onUpdateDb(updatedDb);
      setIsRecalculating(false);
      if (generated.length > 0) {
        setViewingResult(generated[0]);
      }
      setDownloadMessage(`Calculated results for ${generated.length} students. Tabulation, Marksheets & Merit List updated!`);
      setTimeout(() => setDownloadMessage(null), 5000);
    }, 400);
  };

  // Generate Single Marksheet HTML Body using customized MarksheetSettings & Logo (Requirement 1, 3, 4)
  const generateSingleMarksheetBody = (result: CalculatedResult): string => {
    const studentClass = db.classes.find(c => c.id === result.classId)?.nameEn || 'General';
    const studentSection = db.sections.find(s => s.id === result.sectionId)?.name || 'Section A';

    // Logo HTML (Requirement 1 - Graceful fallback without broken image)
    const logoHtml = (mSettings.showLogo && db.schoolSettings.logoUrl)
      ? `<div style="text-align: center; margin-bottom: 8px;">
          <img src="${db.schoolSettings.logoUrl}" alt="School Logo" style="max-height: 65px; max-width: 90px; object-fit: contain;" />
        </div>`
      : '';

    // Institution Info Sub-header
    const subHeaderParts: string[] = [];
    if (mSettings.showEiin && db.schoolSettings.eiin) {
      subHeaderParts.push(`EIIN: ${db.schoolSettings.eiin}`);
    }
    if (mSettings.showInstituteCode && db.schoolSettings.instituteCode) {
      subHeaderParts.push(`Institute Code: ${db.schoolSettings.instituteCode}`);
    }
    if (mSettings.showBoardName && db.schoolSettings.boardName) {
      subHeaderParts.push(db.schoolSettings.boardName);
    }
    const subHeaderHtml = subHeaderParts.length > 0
      ? `<p style="margin: 2px 0 0; font-size: 11.5px; color: #64748B;">${subHeaderParts.join(' | ')}</p>`
      : '';

    // Table rows
    const rowsHtml = result.subjectResults.map(sub => {
      const cqVal = sub.componentBreakdown.find(c => c.code === 'CQ')?.obtainedMarks ?? '-';
      const mcqVal = sub.componentBreakdown.find(c => c.code === 'MCQ')?.obtainedMarks ?? '-';
      const prVal = sub.componentBreakdown.find(c => c.code === 'PR')?.obtainedMarks ?? '-';

      const breakdownCells = mSettings.showComponentBreakdown
        ? `
          <td class="text-center" style="font-family: monospace;">${cqVal}</td>
          <td class="text-center" style="font-family: monospace;">${mcqVal}</td>
          <td class="text-center" style="font-family: monospace;">${prVal}</td>
        `
        : '';

      const gpCell = mSettings.showGradePoint
        ? `<td class="text-center font-bold" style="color: ${mSettings.themeColor};">${sub.gradePoint.toFixed(2)}</td>`
        : '';

      return `
        <tr>
          <td class="text-center font-bold" style="font-family: monospace;">${sub.subjectCode}</td>
          <td>
            <strong>${sub.subjectNameEn}</strong>
            ${sub.isOptional ? ' <span class="badge" style="background:#EDE9FE;color:#5B21B6;font-size:10px;">4th Subject</span>' : ''}
          </td>
          <td class="text-center">${sub.fullMarks}</td>
          ${breakdownCells}
          <td class="text-center font-bold" style="font-size: 13px;">${sub.totalConverted}</td>
          <td class="text-center font-bold" style="color:#15803D;">${sub.letterGrade}</td>
          ${gpCell}
        </tr>
      `;
    }).join('');

    const breakdownHeaders = mSettings.showComponentBreakdown
      ? `
        <th class="text-center" style="width: 50px;">CQ</th>
        <th class="text-center" style="width: 50px;">MCQ</th>
        <th class="text-center" style="width: 50px;">PR</th>
      `
      : '';

    const gpHeader = mSettings.showGradePoint
      ? `<th class="text-center" style="width: 55px;">GP</th>`
      : '';

    // Board Grading Scale Table (if enabled)
    const gradingScaleHtml = mSettings.showGradingScaleTable
      ? `
        <div style="margin-top: 15px; margin-bottom: 20px; font-size: 11px;">
          <div style="font-weight: bold; margin-bottom: 4px; text-transform: uppercase; color: #475569; font-size: 10px; letter-spacing: 0.5px;">
            Secondary Education Board Standard Grading Scale (5.00 Scale)
          </div>
          <table style="width: 100%; border-collapse: collapse; text-align: center; font-size: 11px; margin-top: 4px; margin-bottom: 0;">
            <thead>
              <tr style="background: #F1F5F9; color: #334155;">
                <th style="padding: 4px; border: 1px solid #CBD5E1;">Score Range</th>
                <th style="padding: 4px; border: 1px solid #CBD5E1;">80-100</th>
                <th style="padding: 4px; border: 1px solid #CBD5E1;">70-79</th>
                <th style="padding: 4px; border: 1px solid #CBD5E1;">60-69</th>
                <th style="padding: 4px; border: 1px solid #CBD5E1;">50-59</th>
                <th style="padding: 4px; border: 1px solid #CBD5E1;">40-49</th>
                <th style="padding: 4px; border: 1px solid #CBD5E1;">33-39</th>
                <th style="padding: 4px; border: 1px solid #CBD5E1;">00-32</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 4px; border: 1px solid #CBD5E1; font-weight: bold;">Letter Grade</td>
                <td style="padding: 4px; border: 1px solid #CBD5E1; font-weight: bold; color: #166534;">A+</td>
                <td style="padding: 4px; border: 1px solid #CBD5E1; font-weight: bold; color: #166534;">A</td>
                <td style="padding: 4px; border: 1px solid #CBD5E1; font-weight: bold; color: #166534;">A-</td>
                <td style="padding: 4px; border: 1px solid #CBD5E1; font-weight: bold; color: #166534;">B</td>
                <td style="padding: 4px; border: 1px solid #CBD5E1; font-weight: bold; color: #166534;">C</td>
                <td style="padding: 4px; border: 1px solid #CBD5E1; font-weight: bold; color: #854D0E;">D</td>
                <td style="padding: 4px; border: 1px solid #CBD5E1; font-weight: bold; color: #991B1B;">F</td>
              </tr>
              <tr>
                <td style="padding: 4px; border: 1px solid #CBD5E1; font-weight: bold;">Grade Point</td>
                <td style="padding: 4px; border: 1px solid #CBD5E1; font-weight: bold;">5.00</td>
                <td style="padding: 4px; border: 1px solid #CBD5E1; font-weight: bold;">4.00</td>
                <td style="padding: 4px; border: 1px solid #CBD5E1; font-weight: bold;">3.50</td>
                <td style="padding: 4px; border: 1px solid #CBD5E1; font-weight: bold;">3.00</td>
                <td style="padding: 4px; border: 1px solid #CBD5E1; font-weight: bold;">2.00</td>
                <td style="padding: 4px; border: 1px solid #CBD5E1; font-weight: bold;">1.00</td>
                <td style="padding: 4px; border: 1px solid #CBD5E1; font-weight: bold; color: #991B1B;">0.00</td>
              </tr>
            </tbody>
          </table>
        </div>
      `
      : '';

    // Signatures
    const signaturesHtml = mSettings.showSignatures
      ? `
        <div style="display: flex; justify-content: space-between; margin-top: 45px; padding-top: 15px; font-size: 11.5px; color: #334155;">
          <div style="border-top: 1.5px solid #94A3B8; width: 170px; text-align: center; padding-top: 6px;">
            ${mSettings.signature1Title || 'Class Teacher'}
          </div>
          <div style="border-top: 1.5px solid #94A3B8; width: 170px; text-align: center; padding-top: 6px;">
            ${mSettings.signature2Title || 'Exam Controller'}
          </div>
          <div style="border-top: 1.5px solid #94A3B8; width: 170px; text-align: center; padding-top: 6px;">
            <strong>${mSettings.signature3Title || 'Headmaster / Principal'}</strong>
          </div>
        </div>
      `
      : '';

    return `
      <div style="text-align: center; border-bottom: 2px solid ${mSettings.themeColor || '#1E3A8A'}; padding-bottom: 12px; margin-bottom: 18px;">
        ${logoHtml}
        <h1 style="margin: 0; font-size: 23px; text-transform: uppercase; color: ${mSettings.themeColor || '#1E3A8A'}; font-weight: 900; letter-spacing: 0.5px;">
          ${db.schoolSettings.nameEn}
        </h1>
        ${mSettings.showSchoolAddress && db.schoolSettings.address ? `<p style="margin: 3px 0; font-size: 12.5px; color: #475569;">${db.schoolSettings.address}</p>` : ''}
        ${subHeaderHtml}
        <div style="margin-top: 10px; display: inline-block; background: ${mSettings.themeColor || '#1E3A8A'}; color: white; padding: 4px 18px; border-radius: 20px; font-weight: bold; font-size: 12.5px; text-transform: uppercase; letter-spacing: 1px;">
          ${mSettings.headerTitle || 'Academic Transcript & Mark Sheet'}
        </div>
        ${mSettings.headerSubtitle ? `<div style="font-size: 11px; color: #64748B; margin-top: 3px;">${mSettings.headerSubtitle}</div>` : ''}
        <h3 style="margin: 6px 0 0; font-size: 14.5px; color: #1E293B;">
          ${activeExam.name} - Academic Session ${activeExam.academicYear}
        </h3>
      </div>

      <div style="display: grid; grid-template-columns: ${mSettings.studentInfoColumns === 3 ? '1fr 1fr 1fr' : '1fr 1fr'}; gap: 8px; background: #F8FAFC; padding: 12px 16px; border: 1px solid #E2E8F0; border-radius: 8px; margin-bottom: 16px; font-size: 12.5px;">
        <div>
          <p style="margin: 2px 0;"><strong>Student Name:</strong> ${result.studentNameEn}</p>
          <p style="margin: 2px 0;"><strong>Class & Section:</strong> ${studentClass} (${studentSection})${result.shift ? ` &bull; <strong>Shift:</strong> ${result.shift}` : ''}${result.group ? ` &bull; <strong>Group:</strong> ${result.group}` : ''}</p>
        </div>
        <div>
          <p style="margin: 2px 0;"><strong>Roll Number:</strong> #${result.studentRoll}</p>
          <p style="margin: 2px 0;"><strong>Academic Session:</strong> ${result.academicYear}</p>
        </div>
        ${mSettings.studentInfoColumns === 3 ? `
          <div>
            <p style="margin: 2px 0;"><strong>Student ID:</strong> ${result.studentId}</p>
            <p style="margin: 2px 0;"><strong>Issue Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
        ` : ''}
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
        <thead>
          <tr style="background: ${mSettings.themeColor || '#1E3A8A'}; color: white;">
            <th class="text-center" style="width: 50px;">Code</th>
            <th>Subject Name</th>
            <th class="text-center" style="width: 55px;">Full</th>
            ${breakdownHeaders}
            <th class="text-center" style="width: 65px;">Total</th>
            <th class="text-center" style="width: 50px;">Grade</th>
            ${gpHeader}
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <div style="background: #EFF6FF; border: 2px solid #BFDBFE; border-radius: 8px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <div>
          <p style="margin: 2px 0; font-size: 13.5px;">
            <strong>Total Marks Obtained:</strong> ${result.totalObtainedMarks} / ${result.totalFullMarks} (${result.percentage.toFixed(1)}%)
          </p>
          ${mSettings.showResultStatus ? `
            <p style="margin: 2px 0; font-size: 13.5px;">
              <strong>Result Status:</strong>
              <span class="badge ${result.resultStatus === 'PASSED' ? 'badge-pass' : 'badge-fail'}">${result.resultStatus}</span>
              ${result.meritRank ? ` <strong style="color: #6B21A8;">(Merit Position: #${result.meritRank})</strong>` : ''}
            </p>
          ` : ''}
          <p style="margin: 4px 0 0; font-size: 11px; color: #64748B;">
            * 4th subject GP points above 2.00 have been credited to the GPA numerator according to Education Board rules.
          </p>
        </div>
        <div style="text-align: right; background: white; padding: 8px 16px; border-radius: 8px; border: 1px solid #BFDBFE;">
          <div style="font-size: 10.5px; text-transform: uppercase; font-weight: bold; color: #64748B;">Grade Point Average</div>
          <div style="font-size: 24px; font-weight: 900; color: ${mSettings.themeColor || '#1E3A8A'};">
            ${result.gpa.toFixed(2)} <span style="font-size: 17px; color: #16A34A;">(${result.letterGrade})</span>
          </div>
        </div>
      </div>

      ${gradingScaleHtml}

      ${mSettings.footerRemarksText ? `
        <div style="font-size: 10.5px; color: #64748B; text-align: center; margin-top: 10px; font-style: italic;">
          ${mSettings.footerRemarksText}
        </div>
      ` : ''}

      ${signaturesHtml}
    `;
  };

  // Direct Single Mark Sheet Print (Requirement 4)
  const handlePrintSingleMarksheet = (result: CalculatedResult) => {
    const title = `${result.studentNameEn} - Mark Sheet (${activeExam.name})`;
    const content = generateSingleMarksheetBody(result);
    printDocument(title, content);
  };

  // Direct Single Mark Sheet File Download (Requirement 2 & 4)
  const handleDownloadSingleMarksheet = (result: CalculatedResult) => {
    const filename = `MarkSheet_${result.studentNameEn.replace(/\s+/g, '_')}_Roll_${result.studentRoll}`;
    const bodyContent = generateSingleMarksheetBody(result);
    downloadHtmlDocument(filename, `${result.studentNameEn} - Mark Sheet`, bodyContent);
    setDownloadMessage(`Mark sheet downloaded successfully for ${result.studentNameEn} (#${result.studentRoll}) as A4 document.`);
    setTimeout(() => setDownloadMessage(null), 5000);
  };

  // Print All Marksheets for current class / exam
  const handlePrintAllClassMarksheets = () => {
    if (examResults.length === 0) {
      alert('No calculated results available to print.');
      return;
    }
    const combinedBody = examResults.map((r, idx) => `
      <div style="${idx < examResults.length - 1 ? 'page-break-after: always; padding-bottom: 30px; margin-bottom: 30px; border-bottom: 2px dashed #94A3B8;' : ''}">
        ${generateSingleMarksheetBody(r)}
      </div>
    `).join('');
    printDocument(`All Mark Sheets - ${activeExam.name}`, combinedBody);
  };

  // Download All Class Mark Sheets in One Consolidated HTML Document
  const handleDownloadAllClassMarksheets = () => {
    if (examResults.length === 0) {
      alert('No calculated results available to download.');
      return;
    }

    const combinedBody = examResults.map((r, idx) => `
      <div style="${idx < examResults.length - 1 ? 'page-break-after: always; padding-bottom: 40px; margin-bottom: 40px; border-bottom: 2px dashed #94A3B8;' : ''}">
        ${generateSingleMarksheetBody(r)}
      </div>
    `).join('');

    const filename = `All_MarkSheets_${activeExam.name.replace(/\s+/g, '_')}_${selectedClassId}`;
    downloadHtmlDocument(filename, `All Mark Sheets - ${activeExam.name}`, combinedBody);
    setDownloadMessage(`Consolidated mark sheets for all ${examResults.length} students downloaded successfully!`);
    setTimeout(() => setDownloadMessage(null), 5000);
  };

  // Tabulation Sheet Print (Requirement 4)
  const handlePrintTabulationSheet = () => {
    const logoHtml = (mSettings.showLogo && db.schoolSettings.logoUrl)
      ? `<div style="text-align: center; margin-bottom: 8px;">
          <img src="${db.schoolSettings.logoUrl}" alt="School Logo" style="max-height: 55px; max-width: 80px; object-fit: contain;" />
        </div>`
      : '';

    const content = `
      <div style="text-align: center; margin-bottom: 15px; border-bottom: 2px solid ${mSettings.themeColor || '#1E3A8A'}; padding-bottom: 10px;">
        ${logoHtml}
        <h2 style="margin: 0; font-size: 20px; text-transform: uppercase; color: ${mSettings.themeColor || '#1E3A8A'};">${db.schoolSettings.nameEn}</h2>
        <p style="margin: 2px 0; font-size: 12px; color: #64748B;">${db.schoolSettings.address} | EIIN: ${db.schoolSettings.eiin}</p>
        <div style="margin-top: 6px; font-weight: bold; font-size: 14px; color: #0F172A;">
          OFFICIAL EXAMINATION TABULATION SHEET - ${activeExam.name} (${activeExam.academicYear})
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; font-size: 12px; background: #F8FAFC; padding: 8px 12px; border: 1px solid #CBD5E1; border-radius: 6px; margin-bottom: 12px;">
        <span><strong>Total Students:</strong> ${totalStudents}</span>
        <span><strong>Passed:</strong> <strong style="color: #166534;">${passedStudents}</strong></span>
        <span><strong>Failed:</strong> <strong style="color: #991B1B;">${failedStudents}</strong></span>
        <span><strong>Pass Rate:</strong> ${passRate.toFixed(1)}%</span>
        <span><strong>Average GPA:</strong> ${averageGpa.toFixed(2)}</span>
      </div>

      <table style="width: 100%; border-collapse: collapse; font-size: 11.5px;">
        <thead>
          <tr style="background: #F1F5F9;">
            <th style="padding: 6px; border: 1px solid #CBD5E1; text-align: center;">Merit</th>
            <th style="padding: 6px; border: 1px solid #CBD5E1; text-align: center;">Roll</th>
            <th style="padding: 6px; border: 1px solid #CBD5E1;">Student Name</th>
            <th style="padding: 6px; border: 1px solid #CBD5E1; text-align: center;">Class / Shift / Group</th>
            <th style="padding: 6px; border: 1px solid #CBD5E1; text-align: center;">Total Marks</th>
            <th style="padding: 6px; border: 1px solid #CBD5E1; text-align: center;">%</th>
            <th style="padding: 6px; border: 1px solid #CBD5E1; text-align: center;">GPA (5.0)</th>
            <th style="padding: 6px; border: 1px solid #CBD5E1; text-align: center;">Grade</th>
            <th style="padding: 6px; border: 1px solid #CBD5E1; text-align: center;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${examResults.map(r => `
            <tr>
              <td style="padding: 6px; border: 1px solid #CBD5E1; text-align: center; font-weight: bold; color: #6B21A8;">
                ${r.meritRank ? `#${r.meritRank}` : '-'}
              </td>
              <td style="padding: 6px; border: 1px solid #CBD5E1; text-align: center; font-weight: bold;">
                #${r.studentRoll}
              </td>
              <td style="padding: 6px; border: 1px solid #CBD5E1; font-weight: bold;">
                ${r.studentNameEn}
              </td>
              <td style="padding: 6px; border: 1px solid #CBD5E1; text-align: center;">
                ${db.classes.find(c => c.id === r.classId)?.nameEn || 'General'}${r.shift ? ` • ${r.shift}` : ''}${r.group ? ` (${r.group})` : ''}
              </td>
              <td style="padding: 6px; border: 1px solid #CBD5E1; text-align: center;">
                ${r.totalObtainedMarks} / ${r.totalFullMarks}
              </td>
              <td style="padding: 6px; border: 1px solid #CBD5E1; text-align: center; font-family: monospace;">
                ${r.percentage.toFixed(1)}%
              </td>
              <td style="padding: 6px; border: 1px solid #CBD5E1; text-align: center; font-weight: bold; color: ${mSettings.themeColor || '#1E3A8A'};">
                ${r.gpa.toFixed(2)}
              </td>
              <td style="padding: 6px; border: 1px solid #CBD5E1; text-align: center; font-weight: bold; color: #166534;">
                ${r.letterGrade}
              </td>
              <td style="padding: 6px; border: 1px solid #CBD5E1; text-align: center;">
                <span class="badge ${r.resultStatus === 'PASSED' ? 'badge-pass' : 'badge-fail'}">
                  ${r.resultStatus}
                </span>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      ${mSettings.showSignatures ? `
        <div style="display: flex; justify-content: space-between; margin-top: 45px; padding-top: 15px; font-size: 11px;">
          <div style="border-top: 1px solid #94A3B8; width: 160px; text-align: center; padding-top: 4px;">Tabulator's Signature</div>
          <div style="border-top: 1px solid #94A3B8; width: 160px; text-align: center; padding-top: 4px;">Exam Controller</div>
          <div style="border-top: 1px solid #94A3B8; width: 160px; text-align: center; padding-top: 4px;"><strong>Principal / Headmaster</strong></div>
        </div>
      ` : ''}
    `;

    printDocument(`Tabulation Sheet - ${activeExam.name}`, content);
  };

  // Download Tabulation CSV
  const handleDownloadTabulationCsv = () => {
    const headers = ['Merit', 'Roll', 'Student Name', 'Class', 'Shift', 'Group', 'Total Marks', 'Full Marks', 'Percentage', 'GPA', 'Grade', 'Status'];
    const rows = examResults.map(r => [
      r.meritRank || '-',
      r.studentRoll,
      r.studentNameEn,
      db.classes.find(c => c.id === r.classId)?.nameEn || '',
      r.shift || '-',
      r.group || '-',
      r.totalObtainedMarks,
      r.totalFullMarks,
      `${r.percentage.toFixed(1)}%`,
      r.gpa.toFixed(2),
      r.letterGrade,
      r.resultStatus
    ]);
    downloadCsv(`Tabulation_Sheet_${activeExam.name.replace(/\s+/g, '_')}`, headers, rows);
    setDownloadMessage(`Tabulation sheet CSV downloaded successfully (${rows.length} records)!`);
    setTimeout(() => setDownloadMessage(null), 5000);
  };

  // Merit List Print (Requirement 4)
  const handlePrintMeritList = () => {
    const logoHtml = (mSettings.showLogo && db.schoolSettings.logoUrl)
      ? `<div style="text-align: center; margin-bottom: 8px;">
          <img src="${db.schoolSettings.logoUrl}" alt="School Logo" style="max-height: 55px; max-width: 80px; object-fit: contain;" />
        </div>`
      : '';

    const sortedPassed = examResults
      .filter(r => r.resultStatus === 'PASSED')
      .sort((a, b) => (a.meritRank || 9999) - (b.meritRank || 9999));

    const content = `
      <div style="text-align: center; margin-bottom: 15px; border-bottom: 2px solid ${mSettings.themeColor || '#1E3A8A'}; padding-bottom: 10px;">
        ${logoHtml}
        <h2 style="margin: 0; font-size: 20px; text-transform: uppercase; color: ${mSettings.themeColor || '#1E3A8A'};">${db.schoolSettings.nameEn}</h2>
        <p style="margin: 2px 0; font-size: 12px; color: #64748B;">${db.schoolSettings.address} | EIIN: ${db.schoolSettings.eiin}</p>
        <div style="margin-top: 6px; font-weight: bold; font-size: 14px; color: #0F172A;">
          OFFICIAL EXAMINATION MERIT LIST & TOP PERFORMERS
        </div>
        <div style="font-size: 12px; color: #475569; margin-top: 2px;">
          ${activeExam.name} - Academic Session ${activeExam.academicYear}
        </div>
      </div>

      <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
        <thead>
          <tr style="background: #F1F5F9;">
            <th style="padding: 7px; border: 1px solid #CBD5E1; text-align: center;">Merit Position</th>
            <th style="padding: 7px; border: 1px solid #CBD5E1; text-align: center;">Roll</th>
            <th style="padding: 7px; border: 1px solid #CBD5E1;">Student Name</th>
            <th style="padding: 7px; border: 1px solid #CBD5E1; text-align: center;">Class / Shift / Group</th>
            <th style="padding: 7px; border: 1px solid #CBD5E1; text-align: center;">Total Marks</th>
            <th style="padding: 7px; border: 1px solid #CBD5E1; text-align: center;">%</th>
            <th style="padding: 7px; border: 1px solid #CBD5E1; text-align: center;">GPA</th>
            <th style="padding: 7px; border: 1px solid #CBD5E1; text-align: center;">Grade</th>
          </tr>
        </thead>
        <tbody>
          ${sortedPassed.map(r => `
            <tr>
              <td style="padding: 7px; border: 1px solid #CBD5E1; text-align: center; font-weight: 900; color: #6B21A8; font-size: 13px;">
                #${r.meritRank}
              </td>
              <td style="padding: 7px; border: 1px solid #CBD5E1; text-align: center; font-weight: bold;">
                #${r.studentRoll}
              </td>
              <td style="padding: 7px; border: 1px solid #CBD5E1; font-weight: bold;">
                ${r.studentNameEn}
              </td>
              <td style="padding: 7px; border: 1px solid #CBD5E1; text-align: center;">
                ${db.classes.find(c => c.id === r.classId)?.nameEn || 'General'}${r.shift ? ` • ${r.shift}` : ''}${r.group ? ` (${r.group})` : ''}
              </td>
              <td style="padding: 7px; border: 1px solid #CBD5E1; text-align: center; font-weight: bold;">
                ${r.totalObtainedMarks} / ${r.totalFullMarks}
              </td>
              <td style="padding: 7px; border: 1px solid #CBD5E1; text-align: center; font-family: monospace;">
                ${r.percentage.toFixed(1)}%
              </td>
              <td style="padding: 7px; border: 1px solid #CBD5E1; text-align: center; font-weight: 900; color: ${mSettings.themeColor || '#1E3A8A'}; font-size: 13px;">
                ${r.gpa.toFixed(2)}
              </td>
              <td style="padding: 7px; border: 1px solid #CBD5E1; text-align: center; font-weight: bold; color: #166534;">
                ${r.letterGrade}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      ${mSettings.showSignatures ? `
        <div style="display: flex; justify-content: space-between; margin-top: 50px; padding-top: 15px; font-size: 11px;">
          <div style="border-top: 1px solid #94A3B8; width: 160px; text-align: center; padding-top: 4px;">Committee Member</div>
          <div style="border-top: 1px solid #94A3B8; width: 160px; text-align: center; padding-top: 4px;">Exam Controller</div>
          <div style="border-top: 1px solid #94A3B8; width: 160px; text-align: center; padding-top: 4px;"><strong>Principal / Headmaster</strong></div>
        </div>
      ` : ''}
    `;

    printDocument(`Merit List - ${activeExam.name}`, content);
  };

  // Top performers
  const topPerformers = examResults
    .filter(r => r.resultStatus === 'PASSED' && r.meritRank && r.meritRank <= 3)
    .sort((a, b) => (a.meritRank || 0) - (b.meritRank || 0));

  const sortedMeritAll = [...examResults]
    .filter(r => r.resultStatus === 'PASSED')
    .sort((a, b) => (a.meritRank || 9999) - (b.meritRank || 9999));

  return (
    <div className="space-y-5">
      {/* Download / Save Confirmation Toast */}
      {downloadMessage && (
        <div className="bg-emerald-50 border-2 border-emerald-400 text-emerald-900 p-4 rounded-xl text-xs font-bold flex items-center justify-between shadow-md animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{downloadMessage}</span>
          </div>
          <button
            onClick={() => setDownloadMessage(null)}
            className="text-emerald-700 hover:text-emerald-950 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header Controls Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-3 no-print">
        <div>
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600" />
            <span>Result Management & Mark Sheets</span>
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Board standard 5.0 GPA calculation, official tabulation, printable mark sheets & merit lists.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Exam Selector */}
          <select
            value={selectedExamId}
            onChange={e => setSelectedExamId(e.target.value)}
            className="text-xs font-bold bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-2 text-blue-900"
          >
            {db.examinations.map(e => (
              <option key={e.id} value={e.id}>
                {e.name} ({e.academicYear})
              </option>
            ))}
          </select>

          {/* Class Filter Selector */}
          <select
            value={selectedClassId}
            onChange={e => {
              setSelectedClassId(e.target.value);
              setSelectedSectionId('all');
            }}
            className="text-xs font-bold bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-2 text-gray-800"
          >
            <option value="all">All Classes</option>
            {db.classes.map(c => (
              <option key={c.id} value={c.id}>
                {c.nameEn}
              </option>
            ))}
          </select>

          {/* Section Filter Selector */}
          <select
            value={selectedSectionId}
            onChange={e => setSelectedSectionId(e.target.value)}
            className="text-xs font-bold bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-2 text-gray-800"
          >
            <option value="all">All Sections</option>
            {db.sections
              .filter(s => selectedClassId === 'all' || s.classId === selectedClassId)
              .map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
          </select>

          {/* Shift Filter Selector */}
          <select
            value={selectedShift}
            onChange={e => setSelectedShift(e.target.value)}
            className="text-xs font-bold bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-2 text-gray-800"
          >
            <option value="all">All Shifts</option>
            {db.shifts.map(sh => (
              <option key={sh.id} value={sh.name}>
                {sh.name}
              </option>
            ))}
          </select>

          {/* Group Filter Selector */}
          <select
            value={selectedGroup}
            onChange={e => setSelectedGroup(e.target.value)}
            className="text-xs font-bold bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-2 text-indigo-900"
          >
            <option value="all">All Groups</option>
            {db.groups.map(grp => (
              <option key={grp.id} value={grp.name}>
                {grp.name}
              </option>
            ))}
          </select>

          {/* Recalculate / Generate Results Button */}
          <button
            onClick={handleGenerateResults}
            disabled={isRecalculating}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRecalculating ? 'animate-spin' : ''}`} />
            <span>{isRecalculating ? 'Calculating GPA...' : 'Generate Results'}</span>
          </button>

          {/* Marksheet Design Customizer Trigger (Requirement 3) */}
          <button
            onClick={() => setIsMarksheetSettingsOpen(true)}
            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 shadow-2xs cursor-pointer"
            title="Customize titles, table columns, theme color, signatures, and paper size"
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-600" />
            <span>Marksheet Settings</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 no-print">
        <button
          onClick={() => setActiveTab('tabulation')}
          className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'tabulation'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Tabulation Sheet ({examResults.length})
        </button>
        <button
          onClick={() => setActiveTab('marksheet')}
          className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'marksheet'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Individual Mark Sheet & Download
        </button>
        <button
          onClick={() => setActiveTab('merit')}
          className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'merit'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Merit List & Top Performers
        </button>
      </div>

      {/* TAB 1: TABULATION SHEET */}
      {activeTab === 'tabulation' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden space-y-3">
          {/* Action buttons header */}
          <div className="p-3.5 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-700 block">
                Exam Tabulation Sheet: {activeExam.name}
              </span>
              <span className="text-[11px] text-gray-500">
                {totalStudents} Students Evaluated • {passedStudents} Passed ({passRate.toFixed(1)}%) • Avg GPA: {averageGpa.toFixed(2)}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handlePrintTabulationSheet}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Print Tabulation Sheet in high quality format"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Tabulation Sheet</span>
              </button>
              <button
                onClick={handleDownloadAllClassMarksheets}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Download all mark sheets in one printable document"
              >
                <Download className="w-3.5 h-3.5" />
                <span>All Mark Sheets (.html)</span>
              </button>
              <button
                onClick={handleDownloadTabulationCsv}
                className="bg-white hover:bg-gray-100 text-gray-700 font-bold px-3 py-1.5 rounded-lg border text-xs flex items-center gap-1.5 cursor-pointer"
                title="Export Tabulation data to Excel / CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {examResults.length === 0 ? (
              <div className="p-8 text-center text-gray-500 space-y-2">
                <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
                <p className="font-bold">No results found for the selected exam & class.</p>
                <p className="text-xs">Click the <strong>Generate Results</strong> button above to calculate marks and GPA.</p>
              </div>
            ) : (
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-100 text-gray-700 uppercase font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Merit</th>
                    <th className="py-2.5 px-3">Roll</th>
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3 text-center">Class</th>
                    <th className="py-2.5 px-3 text-center">Total Marks</th>
                    <th className="py-2.5 px-3 text-center">%</th>
                    <th className="py-2.5 px-3 text-center">GPA (5.00)</th>
                    <th className="py-2.5 px-3 text-center">Grade</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-center no-print">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {examResults.map(res => (
                    <tr key={res.id} className="hover:bg-blue-50/40">
                      <td className="py-2.5 px-3 font-mono font-bold text-purple-700">
                        {res.meritRank ? `#${res.meritRank}` : '-'}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-gray-900">
                        #{res.studentRoll}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-gray-900">
                        {res.studentNameEn}
                      </td>
                      <td className="py-2.5 px-3 text-center text-gray-600 font-medium">
                        <div>{db.classes.find(c => c.id === res.classId)?.nameEn || 'General'}</div>
                        {(res.shift || res.group) && (
                          <div className="flex flex-wrap items-center justify-center gap-1 mt-0.5 text-[10px]">
                            {res.shift && (
                              <span className="bg-slate-100 text-slate-700 px-1 rounded border border-slate-200">
                                {res.shift}
                              </span>
                            )}
                            {res.group && (
                              <span className="bg-indigo-50 text-indigo-700 font-semibold px-1 rounded border border-indigo-200">
                                {res.group}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-gray-800">
                        {res.totalObtainedMarks} / {res.totalFullMarks}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono">
                        {res.percentage.toFixed(1)}%
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="font-extrabold text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
                          {res.gpa.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-emerald-600">
                        {res.letterGrade}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            res.resultStatus === 'PASSED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {res.resultStatus}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center no-print">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setViewingResult(res);
                              setActiveTab('marksheet');
                            }}
                            className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                          >
                            View
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={() => handlePrintSingleMarksheet(res)}
                            className="text-xs font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-0.5 cursor-pointer"
                            title="Print Single Mark Sheet"
                          >
                            <Printer className="w-3 h-3" />
                            Print
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={() => handleDownloadSingleMarksheet(res)}
                            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5 cursor-pointer"
                            title="Download Mark Sheet File (.html)"
                          >
                            <Download className="w-3 h-3" />
                            File
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: INDIVIDUAL MARK SHEET */}
      {activeTab === 'marksheet' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border no-print shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-600">Select Student:</span>
              <select
                value={viewingResult?.id || ''}
                onChange={e => {
                  const found = examResults.find(r => r.id === e.target.value);
                  if (found) setViewingResult(found);
                }}
                className="text-xs font-bold bg-gray-50 border border-gray-300 rounded-lg p-2"
              >
                {examResults.map(r => (
                  <option key={r.id} value={r.id}>
                    Roll #{r.studentRoll} - {r.studentNameEn} (GPA: {r.gpa.toFixed(2)})
                  </option>
                ))}
              </select>

              {/* Prev / Next buttons */}
              {examResults.length > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      const idx = examResults.findIndex(r => r.id === viewingResult?.id);
                      if (idx > 0) setViewingResult(examResults[idx - 1]);
                    }}
                    className="p-1.5 border rounded-lg hover:bg-gray-100 text-gray-600 cursor-pointer"
                    title="Previous Student"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      const idx = examResults.findIndex(r => r.id === viewingResult?.id);
                      if (idx < examResults.length - 1) setViewingResult(examResults[idx + 1]);
                    }}
                    className="p-1.5 border rounded-lg hover:bg-gray-100 text-gray-600 cursor-pointer"
                    title="Next Student"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => viewingResult && handlePrintSingleMarksheet(viewingResult)}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save PDF</span>
              </button>

              <button
                onClick={() => viewingResult && handleDownloadSingleMarksheet(viewingResult)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
                title="Download this student's mark sheet document (.html file)"
              >
                <Download className="w-4 h-4" />
                <span>Download Mark Sheet</span>
              </button>

              <button
                onClick={handlePrintAllClassMarksheets}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
                title="Print all mark sheets for this class"
              >
                <Layers className="w-4 h-4" />
                <span>Print All ({examResults.length})</span>
              </button>
            </div>
          </div>

          {/* Mark Sheet Document */}
          {viewingResult ? (
            <div
              className={`bg-white p-8 max-w-4xl mx-auto rounded-2xl shadow-xl print-card text-gray-900 ${
                mSettings.borderStyle === 'formal'
                  ? 'border-4 border-double border-gray-800'
                  : mSettings.borderStyle === 'modern'
                  ? 'border-2 border-blue-600'
                  : mSettings.borderStyle === 'classic'
                  ? 'border-2 border-gray-900'
                  : 'border border-gray-300'
              }`}
            >
              {/* Header */}
              <div className="text-center border-b-2 pb-4 mb-6" style={{ borderColor: mSettings.themeColor || '#1E3A8A' }}>
                {mSettings.showLogo && db.schoolSettings.logoUrl && (
                  <div className="flex justify-center mb-2">
                    <img
                      src={db.schoolSettings.logoUrl}
                      alt="School Logo"
                      className="max-h-16 max-w-24 object-contain"
                      onError={e => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <h2 className="text-2xl font-black uppercase tracking-tight" style={{ color: mSettings.themeColor || '#1E3A8A' }}>
                  {db.schoolSettings.nameEn}
                </h2>
                {mSettings.showSchoolAddress && db.schoolSettings.address && (
                  <p className="text-xs text-gray-600 font-medium">
                    {db.schoolSettings.address}
                  </p>
                )}
                <div className="text-xs font-mono text-gray-500 mt-0.5 flex justify-center gap-2">
                  {mSettings.showEiin && db.schoolSettings.eiin && <span>EIIN: {db.schoolSettings.eiin}</span>}
                  {mSettings.showInstituteCode && db.schoolSettings.instituteCode && <span>• Code: {db.schoolSettings.instituteCode}</span>}
                  {mSettings.showBoardName && db.schoolSettings.boardName && <span>• {db.schoolSettings.boardName}</span>}
                </div>

                <div
                  className="mt-3.5 inline-block text-white px-6 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-xs"
                  style={{ backgroundColor: mSettings.themeColor || '#1E3A8A' }}
                >
                  {mSettings.headerTitle || 'ACADEMIC TRANSCRIPT / MARK SHEET'}
                </div>
                {mSettings.headerSubtitle && (
                  <div className="text-[11px] text-gray-500 mt-1">
                    {mSettings.headerSubtitle}
                  </div>
                )}
                <h3 className="text-sm font-bold text-gray-800 mt-1.5">
                  {activeExam.name} - Academic Session {activeExam.academicYear}
                </h3>
              </div>

              {/* Student info box */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-xs">
                <div className="md:col-span-2 bg-blue-50/50 p-4 rounded-xl border border-blue-200">
                  <div className={`grid gap-2.5 ${mSettings.studentInfoColumns === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                    <div>
                      <span className="font-bold text-gray-500 uppercase text-[10px] block">Student Name</span>
                      <span className="font-bold text-sm text-gray-900">{viewingResult.studentNameEn}</span>
                    </div>
                    <div>
                      <span className="font-bold text-gray-500 uppercase text-[10px] block">Class & Roll</span>
                      <span className="font-bold text-gray-900">
                        {db.classes.find(c => c.id === viewingResult.classId)?.nameEn || 'General'} (Roll: #{viewingResult.studentRoll})
                      </span>
                    </div>
                    <div>
                      <span className="font-bold text-gray-500 uppercase text-[10px] block">Section</span>
                      <span className="font-medium text-gray-800">
                        {db.sections.find(s => s.id === viewingResult.sectionId)?.name || 'Section A'}
                      </span>
                    </div>
                    <div>
                      <span className="font-bold text-gray-500 uppercase text-[10px] block">Academic Session</span>
                      <span className="font-mono font-bold text-blue-900">{viewingResult.academicYear}</span>
                    </div>
                    {mSettings.studentInfoColumns === 3 && (
                      <div>
                        <span className="font-bold text-gray-500 uppercase text-[10px] block">Student ID</span>
                        <span className="font-mono text-gray-700">{viewingResult.studentId}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Optional Mini Grading Scale */}
                {mSettings.showGradingScaleTable && (
                  <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 text-[10px]">
                    <div className="font-bold text-center border-b pb-1 mb-1 text-gray-800 uppercase tracking-wider text-[9px]">
                      Grading Scale (5.0)
                    </div>
                    <table className="w-full text-center">
                      <thead>
                        <tr className="border-b font-bold text-gray-600">
                          <th>Range</th>
                          <th>Grade</th>
                          <th>GP</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        <tr><td>80-100</td><td className="font-bold text-emerald-700">A+</td><td>5.00</td></tr>
                        <tr><td>70-79</td><td className="font-bold">A</td><td>4.00</td></tr>
                        <tr><td>60-69</td><td className="font-bold">A-</td><td>3.50</td></tr>
                        <tr><td>50-59</td><td className="font-bold">B</td><td>3.00</td></tr>
                        <tr><td>40-49</td><td className="font-bold">C</td><td>2.00</td></tr>
                        <tr><td>33-39</td><td className="font-bold">D</td><td>1.00</td></tr>
                        <tr><td>00-32</td><td className="font-bold text-red-600">F</td><td>0.00</td></tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Subject Results Table */}
              <div className="mb-6 overflow-hidden rounded-xl border border-gray-300">
                <table className="w-full text-xs text-left">
                  <thead className="text-white uppercase text-[10px] tracking-wider" style={{ backgroundColor: mSettings.themeColor || '#1E3A8A' }}>
                    <tr>
                      <th className="py-2.5 px-3">Code</th>
                      <th className="py-2.5 px-3">Subject Name</th>
                      <th className="py-2.5 px-3 text-center">Full</th>
                      {mSettings.showComponentBreakdown && (
                        <>
                          <th className="py-2.5 px-3 text-center">CQ</th>
                          <th className="py-2.5 px-3 text-center">MCQ</th>
                          <th className="py-2.5 px-3 text-center">PR</th>
                        </>
                      )}
                      <th className="py-2.5 px-3 text-center">Total</th>
                      <th className="py-2.5 px-3 text-center">Grade</th>
                      {mSettings.showGradePoint && (
                        <th className="py-2.5 px-3 text-center">GP</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {viewingResult.subjectResults.map(sub => {
                      const cqVal = sub.componentBreakdown.find(c => c.code === 'CQ')?.obtainedMarks ?? '-';
                      const mcqVal = sub.componentBreakdown.find(c => c.code === 'MCQ')?.obtainedMarks ?? '-';
                      const prVal = sub.componentBreakdown.find(c => c.code === 'PR')?.obtainedMarks ?? '-';

                      return (
                        <tr key={sub.subjectId} className="hover:bg-gray-50/50">
                          <td className="py-2 px-3 font-mono font-bold text-gray-700">
                            {sub.subjectCode}
                          </td>
                          <td className="py-2 px-3">
                            <span className="font-bold text-gray-900">{sub.subjectNameEn}</span>
                            {sub.isOptional && (
                              <span className="ml-1.5 text-[9px] font-bold bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded">
                                4th Subject
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-center font-medium">{sub.fullMarks}</td>
                          {mSettings.showComponentBreakdown && (
                            <>
                              <td className="py-2 px-3 text-center font-mono">{cqVal}</td>
                              <td className="py-2 px-3 text-center font-mono">{mcqVal}</td>
                              <td className="py-2 px-3 text-center font-mono">{prVal}</td>
                            </>
                          )}
                          <td className="py-2 px-3 text-center font-bold text-gray-900">{sub.totalConverted}</td>
                          <td className="py-2 px-3 text-center font-bold text-emerald-700">{sub.letterGrade}</td>
                          {mSettings.showGradePoint && (
                            <td className="py-2 px-3 text-center font-bold text-blue-900">{sub.gradePoint.toFixed(2)}</td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Summary Bar */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                <div className="space-y-1">
                  <p className="text-xs text-gray-700">
                    Total Marks: <strong className="text-gray-900 text-sm">{viewingResult.totalObtainedMarks}</strong> / {viewingResult.totalFullMarks} ({viewingResult.percentage.toFixed(1)}%)
                  </p>
                  {mSettings.showResultStatus && (
                    <p className="text-xs text-gray-700">
                      Status: <strong className={viewingResult.resultStatus === 'PASSED' ? 'text-emerald-700 font-bold' : 'text-red-700 font-bold'}>{viewingResult.resultStatus}</strong>
                      {viewingResult.meritRank && (
                        <span className="ml-2 font-mono text-purple-700 font-bold">
                          (Merit Rank: #{viewingResult.meritRank})
                        </span>
                      )}
                    </p>
                  )}
                  <p className="text-[11px] text-gray-500">
                    Optional 4th subject GP points above 2.00 have been credited to the GPA total.
                  </p>
                </div>

                <div className="text-center sm:text-right bg-white px-5 py-2.5 rounded-lg border border-blue-200 shadow-xs">
                  <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                    GRADE POINT AVERAGE (GPA)
                  </div>
                  <div className="text-3xl font-black text-blue-900 leading-tight">
                    {viewingResult.gpa.toFixed(2)}
                    <span className="text-xl ml-1 text-emerald-600">
                      ({viewingResult.letterGrade})
                    </span>
                  </div>
                </div>
              </div>

              {/* Computerized note */}
              {mSettings.footerRemarksText && (
                <div className="text-[11px] text-gray-500 text-center italic mb-8">
                  {mSettings.footerRemarksText}
                </div>
              )}

              {/* Signatures */}
              {mSettings.showSignatures && (
                <div className="grid grid-cols-3 text-center text-xs text-gray-700 pt-10 border-t-2 border-dashed border-gray-400">
                  <div>
                    <div className="border-t border-gray-400 pt-1 font-semibold mx-4">
                      {mSettings.signature1Title || "Class Teacher's Signature"}
                    </div>
                  </div>
                  <div>
                    <div className="border-t border-gray-400 pt-1 font-semibold mx-4">
                      {mSettings.signature2Title || 'Exam Controller'}
                    </div>
                  </div>
                  <div>
                    <div className="border-t border-gray-400 pt-1 font-bold text-gray-900 mx-4">
                      {mSettings.signature3Title || "Principal's Signature & Seal"}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-400 bg-white rounded-xl">
              No result selected. Please click on a student from the Tabulation sheet or generate results.
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MERIT LIST & TOP PERFORMERS */}
      {activeTab === 'merit' && (
        <div className="space-y-6">
          {/* Header & Controls */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
            <div>
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Official Merit List & Top Performers: {activeExam.name}</span>
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">
                Rankings determined by PASSED status, GPA descending, followed by total obtained marks.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrintMeritList}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Merit List</span>
              </button>
            </div>
          </div>

          {/* Top 3 Performers Cards */}
          {topPerformers.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {topPerformers.map(top => {
                const isGold = top.meritRank === 1;
                const isSilver = top.meritRank === 2;
                const isBronze = top.meritRank === 3;

                return (
                  <div
                    key={top.id}
                    className={`p-5 rounded-2xl border-2 text-center space-y-2.5 transition-all shadow-sm ${
                      isGold
                        ? 'bg-gradient-to-b from-amber-100 via-amber-50 to-white border-amber-400'
                        : isSilver
                        ? 'bg-gradient-to-b from-slate-100 via-slate-50 to-white border-slate-300'
                        : 'bg-gradient-to-b from-orange-100 via-orange-50 to-white border-orange-300'
                    }`}
                  >
                    <div className="flex justify-center">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl shadow-md ${
                          isGold
                            ? 'bg-amber-400 text-amber-950 ring-4 ring-amber-200'
                            : isSilver
                            ? 'bg-slate-300 text-slate-900 ring-4 ring-slate-100'
                            : 'bg-orange-300 text-orange-950 ring-4 ring-orange-100'
                        }`}
                      >
                        {top.meritRank}
                      </div>
                    </div>

                    <span
                      className={`text-[11px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full inline-block ${
                        isGold
                          ? 'bg-amber-300 text-amber-900'
                          : isSilver
                          ? 'bg-slate-200 text-slate-800'
                          : 'bg-orange-200 text-orange-900'
                      }`}
                    >
                      {isGold ? '🏆 1st Position (Champion)' : isSilver ? '🥈 2nd Position' : '🥉 3rd Position'}
                    </span>

                    <div>
                      <h5 className="font-extrabold text-gray-900 text-base">{top.studentNameEn}</h5>
                      <span className="text-xs text-gray-500 font-mono">Roll: #{top.studentRoll}</span>
                    </div>

                    <div className="pt-2 border-t border-gray-200/80">
                      <div className="text-2xl font-black text-blue-900">
                        {top.gpa.toFixed(2)} <span className="text-base text-emerald-600">({top.letterGrade})</span>
                      </div>
                      <div className="text-xs text-gray-600 font-medium">
                        Total Marks: {top.totalObtainedMarks} / {top.totalFullMarks} ({top.percentage.toFixed(1)}%)
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Full Ranked List Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
            <div className="p-3.5 border-b bg-gray-50 font-bold text-xs text-gray-800 uppercase tracking-wider">
              Complete Examination Rank Sheet ({sortedMeritAll.length} Passed Candidates)
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-100 text-gray-700 uppercase font-semibold">
                  <tr>
                    <th className="py-2.5 px-3 text-center">Rank</th>
                    <th className="py-2.5 px-3 text-center">Roll</th>
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3 text-center">Class</th>
                    <th className="py-2.5 px-3 text-center">Total Marks</th>
                    <th className="py-2.5 px-3 text-center">%</th>
                    <th className="py-2.5 px-3 text-center">GPA</th>
                    <th className="py-2.5 px-3 text-center">Grade</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sortedMeritAll.map(r => (
                    <tr key={r.id} className="hover:bg-blue-50/40">
                      <td className="py-2.5 px-3 text-center font-black text-purple-800 text-sm">
                        #{r.meritRank}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-gray-900">
                        #{r.studentRoll}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-gray-900">
                        {r.studentNameEn}
                      </td>
                      <td className="py-2.5 px-3 text-center text-gray-600">
                        {db.classes.find(c => c.id === r.classId)?.nameEn || 'General'}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-gray-800">
                        {r.totalObtainedMarks} / {r.totalFullMarks}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono">
                        {r.percentage.toFixed(1)}%
                      </td>
                      <td className="py-2.5 px-3 text-center font-extrabold text-blue-900">
                        {r.gpa.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-emerald-600">
                        {r.letterGrade}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-emerald-100 text-emerald-800">
                          PASSED
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Marksheet Design & Layout Settings Modal (Requirement 3) */}
      <MarksheetSettingsModal
        isOpen={isMarksheetSettingsOpen}
        onClose={() => setIsMarksheetSettingsOpen(false)}
        currentSettings={db.schoolSettings.marksheetSettings || DEFAULT_MARKSHEET_SETTINGS}
        schoolSettings={db.schoolSettings}
        onSave={handleSaveMarksheetSettings}
      />
    </div>
  );
};
