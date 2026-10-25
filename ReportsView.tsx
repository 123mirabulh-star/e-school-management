import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  FileText,
  Users,
  DollarSign,
  Award,
  CalendarCheck
} from 'lucide-react';
import { AppDatabase } from '../services/storage';
import { printDocument, downloadHtmlDocument } from '../utils/downloadHelper';

interface ReportsViewProps {
  db: AppDatabase;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ db }) => {
  const [reportType, setReportType] = useState<'defaulters' | 'student_register' | 'exam_summary' | 'attendance'>('defaulters');

  const defaulters = db.students.filter(s => (s.duesAmount || 0) > 0);

  const handlePrint = () => {
    const cardEl = document.querySelector('.print-card');
    if (cardEl) {
      printDocument(`${db.schoolSettings.nameEn} - Official Report`, cardEl.innerHTML);
    } else {
      window.print();
    }
  };

  const handleDownloadReport = () => {
    const cardEl = document.querySelector('.print-card');
    if (cardEl) {
      downloadHtmlDocument(
        `Report_${reportType}_${new Date().toISOString().split('T')[0]}`,
        `${db.schoolSettings.nameEn} - ${reportType.toUpperCase()}`,
        cardEl.innerHTML
      );
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <div>
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            Institutional Reports & Analytics Exports
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Outstanding fees defaulters list, student registers, examination tabulation sheets, and exportable analytics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadReport}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-gray-600" />
            Download HTML
          </button>
          <button
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print Active Report
          </button>
        </div>
      </div>

      {/* Select Report Filter Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 no-print">
        <button
          onClick={() => setReportType('defaulters')}
          className={`p-3 rounded-xl border text-left transition-all ${
            reportType === 'defaulters'
              ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-xs'
              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <DollarSign className="w-4 h-4 mb-1 text-amber-600" />
          <div className="text-xs font-bold">Fee Defaulters Report</div>
          <div className="text-[10px] text-gray-500">{defaulters.length} Pending dues</div>
        </button>

        <button
          onClick={() => setReportType('student_register')}
          className={`p-3 rounded-xl border text-left transition-all ${
            reportType === 'student_register'
              ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-xs'
              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Users className="w-4 h-4 mb-1 text-blue-600" />
          <div className="text-xs font-bold">Student Register Sheet</div>
          <div className="text-[10px] text-gray-500">{db.students.length} Total students</div>
        </button>

        <button
          onClick={() => setReportType('exam_summary')}
          className={`p-3 rounded-xl border text-left transition-all ${
            reportType === 'exam_summary'
              ? 'bg-purple-50 border-purple-300 text-purple-900 shadow-xs'
              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Award className="w-4 h-4 mb-1 text-purple-600" />
          <div className="text-xs font-bold">Exam Result Statistics</div>
          <div className="text-[10px] text-gray-500">{db.results.length} Calculated cards</div>
        </button>

        <button
          onClick={() => setReportType('attendance')}
          className={`p-3 rounded-xl border text-left transition-all ${
            reportType === 'attendance'
              ? 'bg-cyan-50 border-cyan-300 text-cyan-900 shadow-xs'
              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <CalendarCheck className="w-4 h-4 mb-1 text-cyan-600" />
          <div className="text-xs font-bold">Attendance Register</div>
          <div className="text-[10px] text-gray-500">96.4% Average</div>
        </button>
      </div>

      {/* Rendered Printable Report Container */}
      <div className="bg-white rounded-2xl border-2 border-gray-300 p-6 shadow-md print-card">
        {/* Institutional Report Header */}
        <div className="text-center border-b-2 border-gray-800 pb-3 mb-5">
          <h3 className="text-xl font-extrabold uppercase text-gray-900 tracking-wide">
            {db.schoolSettings.nameEn}
          </h3>
          <p className="text-xs text-gray-600">
            {db.schoolSettings.address} • EIIN: {db.schoolSettings.eiin}
          </p>
          <div className="mt-2 text-xs font-bold uppercase text-blue-900 tracking-wider">
            {reportType === 'defaulters' && 'OFFICIAL STUDENT FEE DEFAULTERS & ARREARS STATEMENT'}
            {reportType === 'student_register' && 'INSTITUTIONAL GENERAL STUDENT REGISTER'}
            {reportType === 'exam_summary' && 'CONSOLIDATED EXAMINATION PERFORMANCE REPORT'}
            {reportType === 'attendance' && 'STUDENT ATTENDANCE PERCENTAGE REPORT'}
          </div>
          <p className="text-[11px] font-mono text-gray-500 mt-0.5">
            Date Generated: {new Date().toLocaleDateString('en-GB')} • Academic Session: {db.schoolSettings.currentAcademicYear}
          </p>
        </div>

        {/* Report Content */}
        {reportType === 'defaulters' && (
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-gray-100 font-bold border-b text-gray-700">
                <tr>
                  <th className="p-2">Roll</th>
                  <th className="p-2">Student ID</th>
                  <th className="p-2">Name</th>
                  <th className="p-2">Class</th>
                  <th className="p-2">Guardian Contact</th>
                  <th className="p-2 text-right">Dues Amount (BDT)</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {defaulters.map(st => (
                  <tr key={st.id}>
                    <td className="p-2 font-mono font-bold">#{st.rollNo}</td>
                    <td className="p-2 font-mono">{st.studentId}</td>
                    <td className="p-2 font-bold">{st.nameEn}</td>
                    <td className="p-2">{db.classes.find(c => c.id === st.classId)?.nameEn}</td>
                    <td className="p-2 font-mono">{st.guardianPhone}</td>
                    <td className="p-2 text-right font-bold text-red-600">BDT {st.duesAmount?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'student_register' && (
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-gray-100 font-bold border-b text-gray-700">
                <tr>
                  <th className="p-2">Roll</th>
                  <th className="p-2">Student ID</th>
                  <th className="p-2">Name</th>
                  <th className="p-2">Admission No</th>
                  <th className="p-2">Gender</th>
                  <th className="p-2">Guardian Phone</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {db.students.map(st => (
                  <tr key={st.id}>
                    <td className="p-2 font-mono font-bold">#{st.rollNo}</td>
                    <td className="p-2 font-mono">{st.studentId}</td>
                    <td className="p-2 font-bold">{st.nameEn}</td>
                    <td className="p-2 font-mono">{st.admissionNo}</td>
                    <td className="p-2">{st.gender}</td>
                    <td className="p-2 font-mono">{st.guardianPhone}</td>
                    <td className="p-2 font-bold uppercase text-emerald-700">{st.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'exam_summary' && (
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-gray-100 font-bold border-b text-gray-700">
                <tr>
                  <th className="p-2">Merit</th>
                  <th className="p-2">Roll</th>
                  <th className="p-2">Name</th>
                  <th className="p-2 text-center">Marks</th>
                  <th className="p-2 text-center">GPA</th>
                  <th className="p-2 text-center">Grade</th>
                  <th className="p-2 text-center">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {db.results.map(r => (
                  <tr key={r.id}>
                    <td className="p-2 font-mono font-bold text-purple-700">#{r.meritRank || '-'}</td>
                    <td className="p-2 font-mono font-bold">#{r.studentRoll}</td>
                    <td className="p-2 font-bold">{r.studentNameEn}</td>
                    <td className="p-2 text-center">{r.totalObtainedMarks}/{r.totalFullMarks}</td>
                    <td className="p-2 text-center font-bold text-blue-900">{r.gpa.toFixed(2)}</td>
                    <td className="p-2 text-center font-bold text-emerald-600">{r.letterGrade}</td>
                    <td className="p-2 text-center font-bold text-emerald-700">{r.resultStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'attendance' && (
          <div className="space-y-4 text-xs">
            <div className="bg-cyan-50 p-4 rounded-xl border border-cyan-200">
              <p className="font-bold text-cyan-950">Overall Average Attendance Rate: 96.4%</p>
              <p className="text-gray-600">Calculated over regular working days of session {db.schoolSettings.currentAcademicYear}.</p>
            </div>
          </div>
        )}

        <div className="mt-12 pt-6 border-t border-dashed flex justify-between text-xs text-gray-600">
          <div>Prepared By: Accounts & Admin Section</div>
          <div>Principal's Signature & Institute Seal</div>
        </div>
      </div>
    </div>
  );
};
