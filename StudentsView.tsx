import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Download,
  Eye,
  Trash2,
  IdCard,
  Printer,
  X,
  Check,
  Phone,
  AlertCircle,
  Upload,
  Camera,
  FileSpreadsheet,
  CheckCircle2,
  ArrowRight,
  Edit2
} from 'lucide-react';
import { Student } from '../types';
import { AppDatabase, logAuditAction, classSupportsGroups, deleteStudentFromServer } from '../services/storage';
import { downloadCsv, downloadHtmlDocument } from '../utils/downloadHelper';

interface StudentsViewProps {
  db: AppDatabase;
  onUpdateDb: (updated: AppDatabase) => void;
  initialMode?: 'list' | 'admission';
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  db,
  onUpdateDb,
  initialMode = 'list'
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'admission'>(initialMode);

  // Keep activeTab in sync if navigation switches between list and admission
  useEffect(() => {
    if (initialMode) {
      setActiveTab(initialMode);
    }
  }, [initialMode]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [selectedShift, setSelectedShift] = useState<string>('all');

  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [idCardStudent, setIdCardStudent] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Student Deletion state (Task 1)
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [deleteMode, setDeleteMode] = useState<'archive' | 'permanent'>('archive');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeletingLoading, setIsDeletingLoading] = useState(false);
  const [deleteFeedback, setDeleteFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [admissionError, setAdmissionError] = useState('');

  const isMaster = db.currentUser?.isMasterAdmin ?? false;
  const studentLimit = isMaster ? 999999 : (db.currentUser?.studentLimit || 500);
  const isQuotaReached = !isMaster && db.students.filter(s => s.status === 'active').length >= studentLimit;

  const isSecondaryGroupClass = (classId: string): boolean => {
    const cls = db.classes.find(c => c.id === classId);
    return classSupportsGroups(cls);
  };

  // New Student Admission Form state
  const [formData, setFormData] = useState({
    nameEn: '',
    rollNo: 1,
    admissionNo: `ADM-${Math.floor(10000 + Math.random() * 90000)}`,
    dateOfBirth: '2010-01-01',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    religion: 'Islam' as 'Islam' | 'Hinduism' | 'Buddhism' | 'Christianity' | 'Other',
    bloodGroup: 'B+',
    classId: db.classes[0]?.id || 'c6',
    sectionId: db.sections[0]?.id || '',
    shift: (db.shifts?.[0]?.name || 'Morning Shift') as string,
    guardianName: '',
    guardianRelation: 'Father',
    guardianPhone: '+880 17',
    address: 'Dhaka, Bangladesh',
    optionalSubjectId: 'sub-hmath',
    photoUrl: '',
    group: db.groups?.[0]?.name || 'Science'
  });

  const [formSuccess, setFormSuccess] = useState(false);

  // Bulk Excel/CSV Import state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importCsvText, setImportCsvText] = useState('');
  const [parsedImportRows, setParsedImportRows] = useState<Partial<Student>[]>([]);
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        setAdmissionError('Photo size exceeds 3MB limit. Please choose a smaller photo.');
        return;
      }
      setAdmissionError('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredStudents = db.students.filter(student => {
    const matchesSearch =
      student.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.admissionNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNo.toString().includes(searchTerm);

    const matchesClass = selectedClassId === 'all' || student.classId === selectedClassId;
    const matchesStatus = selectedStatus === 'all' || student.status === selectedStatus;
    const matchesGroup = selectedGroup === 'all' || student.group === selectedGroup;
    const matchesShift = selectedShift === 'all' || student.shift === selectedShift;

    return matchesSearch && matchesClass && matchesStatus && matchesGroup && matchesShift;
  });

  const handleAdmissionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdmissionError('');
    if (isQuotaReached) {
      setAdmissionError(`Student limit reached (${db.students.length}/${studentLimit}). Please contact the Super Administrator to upgrade your school quota.`);
      return;
    }

    if (!formData.nameEn.trim()) {
      setAdmissionError('Please enter student full name.');
      return;
    }

    const newStudentId = `STD-${db.schoolSettings.currentAcademicYear}-${Math.floor(1000 + Math.random() * 9000)}`;
    const isSecClass = isSecondaryGroupClass(formData.classId);

    const newStudent: Student = {
      id: `std-${Date.now()}`,
      studentId: newStudentId,
      admissionNo: formData.admissionNo.trim(),
      rollNo: Number(formData.rollNo) || 1,
      nameEn: formData.nameEn.trim(),
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      religion: formData.religion,
      bloodGroup: formData.bloodGroup,
      classId: formData.classId,
      sectionId: formData.sectionId || (db.sections.find(s => s.classId === formData.classId)?.id || ''),
      shift: formData.shift || undefined,
      academicYear: db.schoolSettings.currentAcademicYear,
      admissionDate: new Date().toISOString().split('T')[0],
      guardianName: formData.guardianName.trim(),
      guardianRelation: formData.guardianRelation.trim(),
      guardianPhone: formData.guardianPhone.trim(),
      address: formData.address.trim(),
      photoUrl: formData.photoUrl || '',
      status: 'active',
      optionalSubjectId: formData.optionalSubjectId,
      duesAmount: 0,
      group: isSecClass ? (formData.group || db.groups?.[0]?.name || 'Science') : undefined
    };

    let updatedDb: AppDatabase = {
      ...db,
      students: [newStudent, ...db.students]
    };

    updatedDb = logAuditAction(
      updatedDb,
      'STUDENT_ADMISSION',
      `Admitted student ${newStudent.nameEn} (ID: ${newStudent.studentId}, Roll: ${newStudent.rollNo}) in ${db.classes.find(c => c.id === newStudent.classId)?.nameEn}${newStudent.shift ? ` [Shift: ${newStudent.shift}]` : ''}${newStudent.group ? ` [Group: ${newStudent.group}]` : ''}`
    );

    onUpdateDb(updatedDb);
    setFormSuccess(true);
    setTimeout(() => {
      setFormSuccess(false);
      setActiveTab('list');
      setFormData({
        nameEn: '',
        rollNo: 1,
        admissionNo: `ADM-${Math.floor(10000 + Math.random() * 90000)}`,
        dateOfBirth: '2010-01-01',
        gender: 'Male',
        religion: 'Islam',
        bloodGroup: 'B+',
        classId: db.classes[0]?.id || 'c6',
        sectionId: db.sections[0]?.id || '',
        shift: db.shifts?.[0]?.name || 'Morning Shift',
        guardianName: '',
        guardianRelation: 'Father',
        guardianPhone: '+880 17',
        address: 'Dhaka, Bangladesh',
        optionalSubjectId: 'sub-hmath',
        photoUrl: '',
        group: db.groups?.[0]?.name || 'Science'
      });
    }, 1500);
  };

  const handleSaveEditStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    const isSec = isSecondaryGroupClass(editingStudent.classId);
    const updatedStudent: Student = {
      ...editingStudent,
      nameEn: editingStudent.nameEn.trim(),
      rollNo: Number(editingStudent.rollNo) || 1,
      guardianName: editingStudent.guardianName.trim(),
      guardianPhone: editingStudent.guardianPhone.trim(),
      address: editingStudent.address.trim(),
      shift: editingStudent.shift || undefined,
      group: isSec ? (editingStudent.group || db.groups?.[0]?.name || 'Science') : undefined
    };

    const updatedStudents = db.students.map(s =>
      s.id === updatedStudent.id ? updatedStudent : s
    );

    let updatedDb: AppDatabase = {
      ...db,
      students: updatedStudents
    };

    updatedDb = logAuditAction(
      updatedDb,
      'UPDATE_STUDENT',
      `Updated student profile for ${updatedStudent.nameEn} (ID: ${updatedStudent.studentId}${updatedStudent.shift ? `, Shift: ${updatedStudent.shift}` : ''}${updatedStudent.group ? `, Group: ${updatedStudent.group}` : ''})`
    );

    onUpdateDb(updatedDb);
    setEditingStudent(null);
  };

  const executeStudentDelete = async () => {
    if (!deletingStudent) return;
    setIsDeletingLoading(true);
    setDeleteFeedback(null);
    try {
      const isPermanent = deleteMode === 'permanent';
      const targetId = deletingStudent.id;
      const targetCode = deletingStudent.studentId;

      const res = await deleteStudentFromServer(targetId, {
        force: isPermanent,
        archive: !isPermanent
      });

      if (!res.success) {
        setDeleteFeedback({ type: 'error', message: res.message });
        setIsDeletingLoading(false);
        return;
      }

      // Update in-memory DB state
      let updatedDb: AppDatabase;
      if (isPermanent) {
        updatedDb = {
          ...db,
          students: db.students.filter(s => s.id !== targetId && s.studentId !== targetCode),
          marks: db.marks ? db.marks.filter(m => m.studentId !== targetId && m.studentId !== targetCode) : [],
          feePayments: db.feePayments ? db.feePayments.filter(f => f.studentId !== targetId && f.studentId !== targetCode) : [],
          results: db.results ? db.results.filter(r => r.studentId !== targetId && r.studentId !== targetCode) : []
        };
        if ((db as any).attendance) {
          (updatedDb as any).attendance = (db as any).attendance.filter((a: any) => a.studentId !== targetId && a.studentId !== targetCode);
        }
        if ((db as any).fees) {
          (updatedDb as any).fees = (db as any).fees.filter((f: any) => f.studentId !== targetId && f.studentId !== targetCode);
        }
        updatedDb = logAuditAction(
          updatedDb,
          'STUDENT_DELETED',
          `Permanently deleted student ${deletingStudent.nameEn} (ID: ${deletingStudent.studentId})`
        );
      } else {
        updatedDb = {
          ...db,
          students: db.students.map(s => (s.id === targetId || s.studentId === targetCode ? { ...s, status: 'archived' as const } : s))
        };
        updatedDb = logAuditAction(
          updatedDb,
          'STUDENT_ARCHIVED',
          `Archived student ${deletingStudent.nameEn} (ID: ${deletingStudent.studentId})`
        );
      }

      onUpdateDb(updatedDb);
      setDeleteFeedback({
        type: 'success',
        message: isPermanent
          ? `Student "${deletingStudent.nameEn}" (${deletingStudent.studentId}) was permanently deleted from the directory.`
          : `Student "${deletingStudent.nameEn}" (${deletingStudent.studentId}) was safely archived.`
      });
      setDeletingStudent(null);
      setDeleteConfirmText('');
    } catch (err: any) {
      setDeleteFeedback({ type: 'error', message: err.message || 'Error executing student deletion' });
    } finally {
      setIsDeletingLoading(false);
    }
  };

  const handleExportCsv = () => {
    const headers = ['Student ID', 'Admission No', 'Roll', 'Name', 'Class', 'Guardian', 'Phone', 'Dues BDT'];
    const rows = filteredStudents.map(s => {
      const cls = db.classes.find(c => c.id === s.classId)?.nameEn || '';
      return [
        s.studentId,
        s.admissionNo,
        s.rollNo,
        s.nameEn,
        cls,
        s.guardianName,
        s.guardianPhone,
        s.duesAmount || 0
      ];
    });
    downloadCsv(`Students_Register_${db.schoolSettings.currentAcademicYear}`, headers, rows);
  };

  // Download Sample Student Template CSV
  const handleDownloadTemplateCsv = () => {
    const headers = [
      'Roll',
      'Name',
      'Class Name',
      'Section Name',
      'Gender',
      'Date of Birth',
      'Blood Group',
      'Guardian Name',
      'Guardian Phone',
      'Address',
      'Admission No'
    ];
    const sampleRows = [
      ['1', 'Md. Shakib Al Hasan', 'Class 6', 'Section A', 'Male', '2012-03-15', 'B+', 'Khondokar Hasan', '+880 1711-123456', 'Dhaka', 'ADM-6001'],
      ['2', 'Nusrat Jahan', 'Class 6', 'Section A', 'Female', '2012-07-22', 'A+', 'Rafiqul Islam', '+880 1819-654321', 'Dhaka', 'ADM-6002'],
      ['3', 'Tahmid Rahman', 'Class 7', 'Section B', 'Male', '2011-05-10', 'O+', 'Abdur Rahman', '+880 1912-987654', 'Dhaka', 'ADM-7001']
    ];
    downloadCsv('Student_Import_Template', headers, sampleRows);
  };

  // Process and parse imported CSV/Excel file text
  const handleParseCsvFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError('');
    setImportSuccess('');

    const reader = new FileReader();
    reader.onload = evt => {
      const text = (evt.target?.result as string) || '';
      setImportCsvText(text);

      const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
      if (lines.length < 2) {
        setImportError('File must contain a header row and at least one student data row.');
        return;
      }

      const rows: Partial<Student>[] = [];
      // Skip header row
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map(p => p.trim().replace(/^"|"$/g, ''));
        if (parts.length >= 2 && parts[1]) {
          const roll = parseInt(parts[0]) || i;
          const name = parts[1];
          const className = parts[2] || '';
          const sectionName = parts[3] || 'Section A';
          const gender = (parts[4]?.toLowerCase() === 'female' ? 'Female' : 'Male') as 'Male' | 'Female';
          const dob = parts[5] || '2011-01-01';
          const blood = parts[6] || 'A+';
          const guardian = parts[7] || 'Guardian';
          const phone = parts[8] || '+880 17';
          const addr = parts[9] || 'Dhaka';
          const admNo = parts[10] || `ADM-${Math.floor(10000 + Math.random() * 90000)}`;

          // Find class ID
          const matchedClass = db.classes.find(
            c => c.nameEn.toLowerCase() === className.toLowerCase() ||
                 c.nameEn.toLowerCase().includes(className.toLowerCase())
          ) || db.classes[0];

          // Find section ID
          const matchedSection = db.sections.find(
            s => s.name.toLowerCase() === sectionName.toLowerCase() && s.classId === matchedClass?.id
          ) || db.sections.find(s => s.classId === matchedClass?.id) || db.sections[0];

          rows.push({
            rollNo: roll,
            nameEn: name,
            classId: matchedClass?.id || 'c6',
            sectionId: matchedSection?.id || '',
            gender,
            dateOfBirth: dob,
            bloodGroup: blood,
            guardianName: guardian,
            guardianPhone: phone,
            address: addr,
            admissionNo: admNo,
            photoUrl: '',
            status: 'active',
            duesAmount: 0
          });
        }
      }

      setParsedImportRows(rows);
    };

    reader.readAsText(file);
  };

  // Confirm Import
  const handleConfirmImport = () => {
    if (parsedImportRows.length === 0) {
      setImportError('No valid students to import.');
      return;
    }

    if (!isMaster && db.students.length + parsedImportRows.length > studentLimit) {
      setImportError(`Cannot import ${parsedImportRows.length} students. School quota allows ${studentLimit - db.students.length} more students. Please upgrade quota.`);
      return;
    }

    const newStudents: Student[] = parsedImportRows.map((row, idx) => ({
      id: `std-${Date.now()}-${idx}`,
      studentId: `STD-${db.schoolSettings.currentAcademicYear}-${Math.floor(1000 + Math.random() * 9000)}`,
      admissionNo: row.admissionNo || `ADM-${Date.now()}-${idx}`,
      rollNo: row.rollNo || idx + 1,
      nameEn: row.nameEn || 'Student',
      dateOfBirth: row.dateOfBirth || '2011-01-01',
      gender: row.gender || 'Male',
      religion: 'Islam',
      bloodGroup: row.bloodGroup || 'A+',
      classId: row.classId || db.classes[0]?.id || 'c6',
      sectionId: row.sectionId || db.sections[0]?.id || '',
      academicYear: db.schoolSettings.currentAcademicYear,
      admissionDate: new Date().toISOString().split('T')[0],
      guardianName: row.guardianName || 'Guardian',
      guardianRelation: 'Father',
      guardianPhone: row.guardianPhone || '+880 17',
      address: row.address || 'Dhaka',
      photoUrl: '',
      status: 'active',
      duesAmount: 0
    }));

    const updatedDb = logAuditAction(
      {
        ...db,
        students: [...newStudents, ...db.students]
      },
      'BULK_STUDENT_IMPORT',
      `Imported ${newStudents.length} students via Excel/CSV file upload.`
    );

    onUpdateDb(updatedDb);
    setImportSuccess(`Successfully imported ${newStudents.length} students into the register!`);
    setParsedImportRows([]);
    setTimeout(() => {
      setIsImportModalOpen(false);
      setImportSuccess('');
    }, 1500);
  };

  const handleDownloadIdCardHtml = (st: Student) => {
    const clsName = db.classes.find(c => c.id === st.classId)?.nameEn || 'Class';
    const bodyContent = `
      <div style="max-width: 380px; margin: 0 auto; background: linear-gradient(135deg, #0F172A, #1E3A8A); color: white; padding: 24px; border-radius: 14px; text-align: center; border: 3px solid #60A5FA;">
        <h2 style="margin: 0; font-size: 18px; text-transform: uppercase;">${db.schoolSettings.nameEn}</h2>
        <p style="margin: 4px 0 16px; font-size: 11px; color: #93C5FD;">EIIN: ${db.schoolSettings.eiin} • Official Student Identity</p>
        
        ${st.photoUrl ? `<img src="${st.photoUrl}" style="width: 85px; height: 85px; border-radius: 50%; object-fit: cover; border: 3px solid white; margin-bottom: 12px;" />` : `<div style="width: 85px; height: 85px; border-radius: 50%; background: #3B82F6; color: white; font-size: 28px; font-weight: bold; line-height: 85px; margin: 0 auto 12px; border: 3px solid white;">${st.nameEn.charAt(0)}</div>`}
        
        <h3 style="margin: 0; font-size: 17px; font-weight: bold;">${st.nameEn}</h3>
        <p style="margin: 2px 0 14px; font-size: 12px; color: #BFDBFE;">Roll: #${st.rollNo} • ${clsName}</p>

        <div style="background: rgba(255, 255, 255, 0.1); padding: 10px 14px; border-radius: 8px; text-align: left; font-size: 12px; line-height: 1.6; margin-bottom: 16px;">
          <div><strong>Student ID:</strong> <span style="font-family: monospace;">${st.studentId}</span></div>
          <div><strong>Blood Group:</strong> ${st.bloodGroup}</div>
          <div><strong>Emergency Contact:</strong> <span style="font-family: monospace;">${st.guardianPhone}</span></div>
        </div>

        <div style="display: flex; justify-content: space-between; font-size: 10px; color: #94A3B8; border-top: 1px solid rgba(255, 255, 255, 0.2); padding-top: 8px;">
          <span>Session: ${db.schoolSettings.currentAcademicYear}</span>
          <span style="font-weight: bold; color: white;">Principal's Seal</span>
        </div>
      </div>
    `;

    downloadHtmlDocument(`IDCard_${st.studentId}`, `${st.nameEn} - Student ID Card`, bodyContent);
  };

  return (
    <div className="space-y-5">
      {/* Top Navigation & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs no-print">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'list'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Student Register ({db.students.length} {isMaster ? 'Students' : `/ ${studentLimit}`})</span>
          </button>
          <button
            onClick={() => setActiveTab('admission')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'admission'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>New Admission Form</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Excel Bulk Import Button (Requirement 6) */}
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 border border-emerald-300 cursor-pointer shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Import Excel / CSV</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 border border-gray-300 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-gray-600" />
            <span>Download CSV</span>
          </button>

          {activeTab === 'list' && (
            <button
              onClick={() => setActiveTab('admission')}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Admit Student</span>
            </button>
          )}
        </div>
      </div>

      {isQuotaReached && (
        <div className="bg-amber-50 border border-amber-300 text-amber-900 p-3.5 rounded-xl text-xs flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Student Quota Limit Reached ({db.students.length} of {studentLimit} students).</strong> You cannot register more students without contacting the Super Administrator to upgrade your school quota.
          </span>
        </div>
      )}

      {/* TAB 1: STUDENT DIRECTORY & REGISTER */}
      {activeTab === 'list' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, roll, student ID..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:outline-hidden focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={selectedClassId}
                onChange={e => setSelectedClassId(e.target.value)}
                className="text-xs bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 font-medium text-gray-700"
              >
                <option value="all">All Classes</option>
                {db.classes.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nameEn}
                  </option>
                ))}
              </select>

              <select
                value={selectedGroup}
                onChange={e => setSelectedGroup(e.target.value)}
                className="text-xs bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 font-medium text-gray-700"
              >
                <option value="all">All Groups</option>
                {db.groups.map(grp => (
                  <option key={grp.id} value={grp.name}>
                    {grp.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedShift}
                onChange={e => setSelectedShift(e.target.value)}
                className="text-xs bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 font-medium text-gray-700"
              >
                <option value="all">All Shifts</option>
                {db.shifts.map(sh => (
                  <option key={sh.id} value={sh.name}>
                    {sh.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="text-xs bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 font-medium text-gray-700"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {deleteFeedback && (
            <div className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 border ${
              deleteFeedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-red-50 text-red-800 border-red-300'
            }`}>
              <div className="flex items-center gap-2">
                {deleteFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{deleteFeedback.message}</span>
              </div>
              <button
                onClick={() => setDeleteFeedback(null)}
                className="p-1 hover:bg-black/5 rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-100 text-gray-600 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-3">Roll</th>
                  <th className="py-3 px-3">Student Info</th>
                  <th className="py-3 px-3">Class, Shift & Group</th>
                  <th className="py-3 px-3">Guardian Contact</th>
                  <th className="py-3 px-3">Admission No</th>
                  <th className="py-3 px-3 text-right">Fee Dues</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-400">
                      No student records found. Click "New Admission Form" or "Import Excel / CSV" to add students.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map(student => {
                    const cls = db.classes.find(c => c.id === student.classId);
                    const sec = db.sections.find(s => s.id === student.sectionId);
                    return (
                      <tr key={student.id} className="hover:bg-blue-50/40">
                        <td className="py-3 px-3 font-mono font-bold text-gray-900">
                          #{student.rollNo}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            {student.photoUrl ? (
                              <img
                                src={student.photoUrl}
                                alt={student.nameEn}
                                className="w-8 h-8 rounded-full object-cover border border-gray-200 shrink-0"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center border border-blue-200 text-xs shrink-0">
                                {student.nameEn.charAt(0) || 'S'}
                              </div>
                            )}
                            <div>
                              <div className="font-bold text-gray-900">{student.nameEn}</div>
                              <div className="text-[10px] text-gray-500 font-mono">
                                ID: {student.studentId}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-gray-900">{cls?.nameEn || 'Class'}</div>
                          <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-gray-500">{sec?.name || 'Section A'}</span>
                            {student.shift && (
                              <span className="text-[9px] font-medium bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded border border-slate-200">
                                {student.shift}
                              </span>
                            )}
                            {student.group && (
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                  student.group === 'Science'
                                    ? 'bg-blue-100 text-blue-800'
                                    : student.group === 'Humanities'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {student.group}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="text-gray-900 font-medium">{student.guardianName}</div>
                          <div className="text-[10px] font-mono text-gray-500 flex items-center gap-1">
                            <Phone className="w-2.5 h-2.5 text-gray-400" />
                            {student.guardianPhone}
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono text-gray-600">
                          {student.admissionNo}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold">
                          {(student.duesAmount || 0) > 0 ? (
                            <span className="text-red-600">৳{student.duesAmount}</span>
                          ) : (
                            <span className="text-emerald-600">৳0</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              student.status === 'active'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {student.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setViewingStudent(student)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                              title="View Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingStudent({ ...student })}
                              className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded"
                              title="Edit Student Profile & Group"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setIdCardStudent(student)}
                              className="p-1.5 text-purple-600 hover:bg-purple-50 rounded"
                              title="ID Card"
                            >
                              <IdCard className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setDeletingStudent(student);
                                setDeleteConfirmText('');
                                setDeleteFeedback(null);
                                const hasRecords =
                                  (db.marks?.some(m => m.studentId === student.id || m.studentId === student.studentId)) ||
                                  ((db as any).attendance?.some((a: any) => a.studentId === student.id || a.studentId === student.studentId)) ||
                                  (db.feePayments?.some(f => f.studentId === student.id || f.studentId === student.studentId)) ||
                                  ((db as any).fees?.some((f: any) => f.studentId === student.id || f.studentId === student.studentId)) ||
                                  (db.results?.some(r => r.studentId === student.id || r.studentId === student.studentId));
                                setDeleteMode(hasRecords ? 'archive' : 'permanent');
                              }}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer transition-colors"
                              title="Delete or Archive Student"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: NEW ADMISSION FORM WITH CUSTOM PHOTO UPLOAD (Requirement 5) */}
      {activeTab === 'admission' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs max-w-4xl mx-auto space-y-6">
          <div className="border-b pb-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-600" />
              Student Admission & Registration Form
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Enter academic enrollment, custom photo upload, personal details, and guardian contact for the student.
            </p>
          </div>

          {formSuccess && (
            <div className="mb-4 bg-emerald-50 border border-emerald-300 text-emerald-800 p-3 rounded-lg text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              Student admitted successfully! Redirecting to register...
            </div>
          )}

          {admissionError && (
            <div className="mb-4 bg-red-50 border border-red-300 text-red-800 p-3 rounded-lg text-xs font-bold flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{admissionError}</span>
              </div>
              <button
                type="button"
                onClick={() => setAdmissionError('')}
                className="p-1 hover:bg-black/5 rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <form onSubmit={handleAdmissionSubmit} className="space-y-6 text-xs">
            {/* Step 1: Real Photo Upload & Live Preview (Requirement 5) */}
            <div className="bg-gradient-to-r from-blue-50/60 to-indigo-50/60 p-4 sm:p-5 rounded-2xl border border-blue-200 space-y-3">
              <div className="flex flex-col sm:flex-row items-center gap-5">
                {/* Photo Preview Container */}
                <div className="shrink-0 relative">
                  {formData.photoUrl ? (
                    <img
                      src={formData.photoUrl}
                      alt="Student"
                      className="w-24 h-28 rounded-xl object-cover border-2 border-blue-600 shadow-md bg-white"
                    />
                  ) : (
                    <div className="w-24 h-28 rounded-xl bg-white border-2 border-dashed border-blue-300 flex flex-col items-center justify-center text-blue-500 shadow-inner">
                      <Camera className="w-8 h-8 mb-1" />
                      <span className="text-[10px] font-bold text-center px-1">Upload Photo</span>
                    </div>
                  )}
                </div>

                {/* Upload & Clear Controls */}
                <div className="space-y-2 flex-1 text-center sm:text-left">
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm flex items-center justify-center sm:justify-start gap-1.5">
                      <Camera className="w-4 h-4 text-blue-600" />
                      <span>Student Passport Photo (Optional or Custom)</span>
                    </h4>
                    <p className="text-[11px] text-gray-600 mt-0.5">
                      Select a photo from your computer or device. The photo will be attached to the student's ID Card, Tabulation sheet, and Mark Sheet. If left empty, a clean monogram will be used.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                    <label className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors">
                      <Upload className="w-4 h-4" />
                      <span>Browse Photo From Device</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoUpload}
                      />
                    </label>

                    {formData.photoUrl && (
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, photoUrl: '' }))}
                        className="bg-white border border-red-300 text-red-600 hover:bg-red-50 text-xs font-bold px-3 py-2 rounded-xl transition-colors cursor-pointer"
                      >
                        Remove Photo
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Academic Placement */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
              <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[11px]">
                2. Academic Placement
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Class *
                  </label>
                  <select
                    value={formData.classId}
                    onChange={e => setFormData({ ...formData, classId: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-lg p-2 font-bold"
                  >
                    {db.classes.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Section *
                  </label>
                  <select
                    value={formData.sectionId}
                    onChange={e => setFormData({ ...formData, sectionId: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-lg p-2"
                  >
                    {db.sections
                      .filter(s => s.classId === formData.classId)
                      .map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Shift *
                  </label>
                  <select
                    value={formData.shift}
                    onChange={e => setFormData({ ...formData, shift: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-lg p-2"
                  >
                    {db.shifts.map(sh => (
                      <option key={sh.id} value={sh.name}>
                        {sh.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Roll Number *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.rollNo}
                    onChange={e => setFormData({ ...formData, rollNo: parseInt(e.target.value) || 1 })}
                    className="w-full bg-white border border-gray-300 rounded-lg p-2 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Admission Number
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.admissionNo}
                    onChange={e => setFormData({ ...formData, admissionNo: e.target.value })}
                    className="w-full bg-gray-100 border border-gray-300 rounded-lg p-2 font-mono font-bold"
                  />
                </div>

                {isSecondaryGroupClass(formData.classId) && (
                  <div className="sm:col-span-5 bg-indigo-50/70 border border-indigo-200 rounded-lg p-3">
                    <label className="block font-bold text-indigo-950 mb-1 flex items-center justify-between">
                      <span>Academic Group *</span>
                      <span className="text-[10px] text-indigo-700 font-semibold uppercase">Stream Assignment</span>
                    </label>
                    <select
                      value={formData.group || (db.groups[0]?.name || 'Science')}
                      onChange={e => setFormData({ ...formData, group: e.target.value })}
                      className="w-full bg-white border border-indigo-300 rounded-lg p-2 font-bold text-indigo-900"
                    >
                      {db.groups.map(grp => (
                        <option key={grp.id} value={grp.name}>
                          {grp.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-indigo-700/80 mt-1">
                      Academic groups are loaded dynamically from Group Assignment Settings.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Step 3: Personal Information */}
            <div className="space-y-3">
              <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[11px]">
                3. Student Personal Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Shakib Al Hasan"
                    required
                    value={formData.nameEn}
                    onChange={e => setFormData({ ...formData, nameEn: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.dateOfBirth}
                    onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={e => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full border border-gray-300 rounded-lg p-2"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Blood Group
                  </label>
                  <select
                    value={formData.bloodGroup}
                    onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Step 4: Guardian Information */}
            <div className="space-y-3">
              <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[11px]">
                4. Guardian Information & Contact
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Guardian Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Father/Mother/Guardian"
                    value={formData.guardianName}
                    onChange={e => setFormData({ ...formData, guardianName: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Relationship
                  </label>
                  <input
                    type="text"
                    value={formData.guardianRelation}
                    onChange={e => setFormData({ ...formData, guardianRelation: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Contact Phone *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.guardianPhone}
                    onChange={e => setFormData({ ...formData, guardianPhone: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2 font-mono"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block font-semibold text-gray-700 mb-1">
                    Residential Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isQuotaReached}
                className={`px-6 py-2.5 text-white font-bold rounded-xl shadow-md cursor-pointer ${
                  isQuotaReached ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'
                }`}
              >
                Save & Admit Student
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EXCEL / CSV BULK IMPORT MODAL (Requirement 6) */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  Import Student Data (Excel / CSV)
                </h3>
                <p className="text-xs text-gray-500">
                  Bulk import student profiles, roll numbers, and contacts from an Excel or CSV file.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsImportModalOpen(false);
                  setParsedImportRows([]);
                  setImportError('');
                }}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Template Download Banner */}
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-emerald-900 block">Sample CSV Template</span>
                <span className="text-[11px] text-emerald-700">Download the pre-formatted template with all columns.</span>
              </div>
              <button
                type="button"
                onClick={handleDownloadTemplateCsv}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Template</span>
              </button>
            </div>

            {/* File Upload Input */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-5 text-center bg-gray-50 hover:bg-blue-50/40 transition-colors">
              <input
                type="file"
                accept=".csv,.txt"
                id="student-csv-file"
                className="hidden"
                onChange={handleParseCsvFile}
              />
              <label htmlFor="student-csv-file" className="cursor-pointer space-y-2 block">
                <Upload className="w-8 h-8 text-blue-600 mx-auto" />
                <span className="font-bold text-gray-800 block">
                  Click to select CSV / Excel exported file
                </span>
                <span className="text-[11px] text-gray-500 block">
                  Supports UTF-8 CSV with student names, rolls, and classes
                </span>
              </label>
            </div>

            {importError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{importError}</span>
              </div>
            )}

            {importSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{importSuccess}</span>
              </div>
            )}

            {/* Parsed Preview Table */}
            {parsedImportRows.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-700">
                    Preview Parsed Students ({parsedImportRows.length} records ready):
                  </span>
                  <span className="text-[11px] text-emerald-700 font-bold">
                    Quota Remaining: {isMaster ? 'Unlimited' : studentLimit - db.students.length}
                  </span>
                </div>

                <div className="max-h-48 overflow-y-auto border rounded-xl">
                  <table className="w-full text-[11px] text-left">
                    <thead className="bg-gray-100 text-gray-700 sticky top-0">
                      <tr>
                        <th className="p-2">Roll</th>
                        <th className="p-2">Name</th>
                        <th className="p-2">Class</th>
                        <th className="p-2">Section</th>
                        <th className="p-2">Guardian</th>
                        <th className="p-2">Phone</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {parsedImportRows.map((r, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="p-2 font-mono font-bold">#{r.rollNo}</td>
                          <td className="p-2 font-semibold text-gray-900">{r.nameEn}</td>
                          <td className="p-2">{db.classes.find(c => c.id === r.classId)?.nameEn || 'Class'}</td>
                          <td className="p-2">{db.sections.find(s => s.id === r.sectionId)?.name || 'Section A'}</td>
                          <td className="p-2">{r.guardianName}</td>
                          <td className="p-2 font-mono">{r.guardianPhone}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 border rounded-xl text-gray-700 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={parsedImportRows.length === 0}
                onClick={handleConfirmImport}
                className={`px-5 py-2 rounded-xl text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-xs ${
                  parsedImportRows.length > 0 ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>Confirm & Import ({parsedImportRows.length})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Profile Details Modal */}
      {viewingStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-gray-900">Student Profile</h3>
              <button onClick={() => setViewingStudent(null)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-4 bg-blue-50 p-4 rounded-xl border border-blue-100">
              {viewingStudent.photoUrl ? (
                <img
                  src={viewingStudent.photoUrl}
                  alt={viewingStudent.nameEn}
                  className="w-16 h-16 rounded-xl object-cover border-2 border-blue-500 shadow-md shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-blue-600 text-white font-black text-xl flex items-center justify-center shadow-md shrink-0">
                  {viewingStudent.nameEn.charAt(0) || 'S'}
                </div>
              )}
              <div>
                <h4 className="text-base font-bold text-gray-900">{viewingStudent.nameEn}</h4>
                <p className="text-xs text-blue-700 font-mono font-bold">
                  Roll: #{viewingStudent.rollNo} • ID: {viewingStudent.studentId}
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Admission No: {viewingStudent.admissionNo} • Session: {viewingStudent.academicYear}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-xl">
              <div>
                <span className="text-gray-500 block">Class & Section:</span>
                <strong className="text-gray-900">
                  {db.classes.find(c => c.id === viewingStudent.classId)?.nameEn} •{' '}
                  {db.sections.find(s => s.id === viewingStudent.sectionId)?.name || 'Section A'}
                </strong>
                {viewingStudent.shift && (
                  <span className="block mt-0.5 text-gray-700 font-semibold">
                    Shift: {viewingStudent.shift}
                  </span>
                )}
                {viewingStudent.group && (
                  <span className="block mt-0.5 font-bold text-indigo-700">
                    Group: {viewingStudent.group}
                  </span>
                )}
              </div>
              <div>
                <span className="text-gray-500 block">Blood Group & Gender:</span>
                <strong className="text-gray-900">{viewingStudent.bloodGroup} • {viewingStudent.gender}</strong>
              </div>
              <div>
                <span className="text-gray-500 block">Guardian:</span>
                <strong className="text-gray-900">{viewingStudent.guardianName} ({viewingStudent.guardianRelation})</strong>
              </div>
              <div>
                <span className="text-gray-500 block">Contact Phone:</span>
                <strong className="text-gray-900 font-mono">{viewingStudent.guardianPhone}</strong>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500 block">Address:</span>
                <strong className="text-gray-900">{viewingStudent.address}</strong>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t">
              <button
                onClick={() => setViewingStudent(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ID Card Print Preview Modal */}
      {idCardStudent && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between border-b pb-3 mb-4 no-print">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <IdCard className="w-4 h-4 text-purple-600" />
                Student ID Card Preview
              </h3>
              <button onClick={() => setIdCardStudent(null)} className="p-1 text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-gradient-to-b from-blue-900 to-indigo-950 text-white rounded-xl p-5 border-2 border-blue-400 shadow-lg text-center relative overflow-hidden mb-5">
              <div className="text-sm font-extrabold uppercase tracking-tight">
                {db.schoolSettings.nameEn}
              </div>
              <div className="text-[10px] text-blue-300 font-mono mb-3">
                EIIN: {db.schoolSettings.eiin} • Motijheel, Dhaka
              </div>

              <div className="flex justify-center mb-2">
                {idCardStudent.photoUrl ? (
                  <img
                    src={idCardStudent.photoUrl}
                    alt={idCardStudent.nameEn}
                    className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-md"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-white/20 text-white font-black text-xl flex items-center justify-center border-2 border-white">
                    {idCardStudent.nameEn.charAt(0) || 'S'}
                  </div>
                )}
              </div>

              <h4 className="text-base font-extrabold text-white">
                {idCardStudent.nameEn}
              </h4>

              <div className="bg-white/10 rounded-lg p-2.5 my-3 text-left text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-blue-300">Student ID:</span>
                  <span className="font-mono font-bold">{idCardStudent.studentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-300">Roll:</span>
                  <span className="font-bold">#{idCardStudent.rollNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-300">Class:</span>
                  <span>
                    {db.classes.find(c => c.id === idCardStudent.classId)?.nameEn}
                    {idCardStudent.group ? ` (${idCardStudent.group})` : ''}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-300">Emergency Phone:</span>
                  <span className="font-mono">{idCardStudent.guardianPhone}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-gray-400 border-t border-white/20 pt-2">
                <span>Academic Session: {db.schoolSettings.currentAcademicYear}</span>
                <span className="font-bold text-white">Principal's Signature</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 no-print">
              <button
                onClick={() => handleDownloadIdCardHtml(idCardStudent)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Download ID Card (.html)
              </button>
              <button
                onClick={() => window.print()}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
              <button
                onClick={() => setIdCardStudent(null)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-semibold px-4 py-2 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-indigo-600" />
                Edit Student Profile: {editingStudent.nameEn}
              </h3>
              <button onClick={() => setEditingStudent(null)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditStudent} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block font-semibold text-gray-700 mb-1">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editingStudent.nameEn}
                    onChange={e => setEditingStudent({ ...editingStudent, nameEn: e.target.value })}
                    className="w-full border rounded-lg p-2 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Class</label>
                  <select
                    value={editingStudent.classId}
                    onChange={e => setEditingStudent({ ...editingStudent, classId: e.target.value })}
                    className="w-full border rounded-lg p-2 font-bold"
                  >
                    {db.classes.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.nameEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Section</label>
                  <select
                    value={editingStudent.sectionId}
                    onChange={e => setEditingStudent({ ...editingStudent, sectionId: e.target.value })}
                    className="w-full border rounded-lg p-2"
                  >
                    {db.sections
                      .filter(s => s.classId === editingStudent.classId)
                      .map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Roll Number</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editingStudent.rollNo}
                    onChange={e => setEditingStudent({ ...editingStudent, rollNo: parseInt(e.target.value) || 1 })}
                    className="w-full border rounded-lg p-2 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Status</label>
                  <select
                    value={editingStudent.status}
                    onChange={e => setEditingStudent({ ...editingStudent, status: e.target.value as any })}
                    className="w-full border rounded-lg p-2 capitalize"
                  >
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                    <option value="transferred">Transferred</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Shift</label>
                  <select
                    value={editingStudent.shift || ''}
                    onChange={e => setEditingStudent({ ...editingStudent, shift: e.target.value })}
                    className="w-full border rounded-lg p-2"
                  >
                    <option value="">No Shift Assigned</option>
                    {db.shifts.map(sh => (
                      <option key={sh.id} value={sh.name}>
                        {sh.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Academic Group Selector for classes that support groups */}
                {isSecondaryGroupClass(editingStudent.classId) && (
                  <div className="col-span-2 bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                    <label className="block font-bold text-indigo-950 mb-1 flex items-center justify-between">
                      <span>Academic Group *</span>
                      <span className="text-[10px] text-indigo-700 font-semibold uppercase">Stream</span>
                    </label>
                    <select
                      value={editingStudent.group || (db.groups[0]?.name || 'Science')}
                      onChange={e => setEditingStudent({ ...editingStudent, group: e.target.value })}
                      className="w-full bg-white border border-indigo-300 rounded-lg p-2 font-bold text-indigo-900"
                    >
                      {db.groups.map(grp => (
                        <option key={grp.id} value={grp.name}>
                          {grp.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Guardian Name</label>
                  <input
                    type="text"
                    value={editingStudent.guardianName}
                    onChange={e => setEditingStudent({ ...editingStudent, guardianName: e.target.value })}
                    className="w-full border rounded-lg p-2"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Guardian Phone</label>
                  <input
                    type="text"
                    value={editingStudent.guardianPhone}
                    onChange={e => setEditingStudent({ ...editingStudent, guardianPhone: e.target.value })}
                    className="w-full border rounded-lg p-2 font-mono"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-gray-700 mb-1">Residential Address</label>
                  <input
                    type="text"
                    value={editingStudent.address}
                    onChange={e => setEditingStudent({ ...editingStudent, address: e.target.value })}
                    className="w-full border rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 border rounded-lg text-gray-700 font-semibold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg cursor-pointer shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TASK 1: INTERACTIVE DELETE & ARCHIVE MODAL */}
      {deletingStudent && (() => {
        const targetId = deletingStudent.id;
        const targetCode = deletingStudent.studentId;
        const marksCount = db.marks?.filter(m => m.studentId === targetId || m.studentId === targetCode).length || 0;
        const attendanceCount = ((db as any).attendance?.filter((a: any) => a.studentId === targetId || a.studentId === targetCode).length) || 0;
        const feesCount = (db.feePayments?.filter(f => f.studentId === targetId || f.studentId === targetCode).length || 0) +
                          (((db as any).fees?.filter((f: any) => f.studentId === targetId || f.studentId === targetCode).length) || 0);
        const resultsCount = db.results?.filter(r => r.studentId === targetId || r.studentId === targetCode).length || 0;
        const totalLinked = marksCount + attendanceCount + feesCount + resultsCount;
        const cls = db.classes.find(c => c.id === deletingStudent.classId);
        const sec = db.sections.find(s => s.id === deletingStudent.sectionId);
        const isPermanent = deleteMode === 'permanent';
        const isButtonDisabled = isDeletingLoading || (isPermanent && totalLinked > 0 && deleteConfirmText.trim().toUpperCase() !== 'DELETE');

        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold shrink-0">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">
                      {isPermanent ? 'Permanently Delete Student' : 'Archive Student Record'}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Manage student directory entry and academic history records.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setDeletingStudent(null)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Student Profile Card */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center gap-4">
                {deletingStudent.photoUrl ? (
                  <img
                    src={deletingStudent.photoUrl}
                    alt={deletingStudent.nameEn}
                    className="w-14 h-16 rounded-lg object-cover border border-gray-300 shrink-0"
                  />
                ) : (
                  <div className="w-14 h-16 rounded-lg bg-blue-100 text-blue-700 font-extrabold text-xl flex items-center justify-center shrink-0 border border-blue-200">
                    {deletingStudent.nameEn.charAt(0)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-gray-900 text-sm truncate">{deletingStudent.nameEn}</h4>
                  <div className="text-xs text-gray-600 space-y-0.5 mt-0.5 font-medium">
                    <p>
                      <span className="font-semibold text-gray-700">ID:</span> {deletingStudent.studentId} • <span className="font-semibold text-gray-700">Roll:</span> #{deletingStudent.rollNo}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-700">Class:</span> {cls?.nameEn || deletingStudent.classId} {sec ? `(${sec.name})` : ''}
                    </p>
                    {deletingStudent.guardianName && (
                      <p className="text-[11px] text-gray-500 truncate">
                        Guardian: {deletingStudent.guardianName} ({deletingStudent.guardianPhone})
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Data Relationship Integrity Notice */}
              {totalLinked > 0 ? (
                <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 text-xs space-y-3">
                  <div className="flex items-start gap-2.5 text-amber-900 font-bold">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>Existing Academic & Financial Records Detected</span>
                  </div>
                  <p className="text-amber-800 text-[11px] leading-relaxed">
                    This student has <strong>{totalLinked} associated institutional records</strong>:
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <span className="bg-white/80 px-2 py-1 rounded border border-amber-200 font-medium">
                      Exam Marks: <strong>{marksCount}</strong>
                    </span>
                    <span className="bg-white/80 px-2 py-1 rounded border border-amber-200 font-medium">
                      Attendance Logs: <strong>{attendanceCount}</strong>
                    </span>
                    <span className="bg-white/80 px-2 py-1 rounded border border-amber-200 font-medium">
                      Fee Invoices: <strong>{feesCount}</strong>
                    </span>
                    <span className="bg-white/80 px-2 py-1 rounded border border-amber-200 font-medium">
                      Published Results: <strong>{resultsCount}</strong>
                    </span>
                  </div>

                  {/* Mode Selector */}
                  <div className="pt-2 border-t border-amber-200 space-y-2">
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="deleteMode"
                        checked={deleteMode === 'archive'}
                        onChange={() => setDeleteMode('archive')}
                        className="mt-0.5 text-blue-600"
                      />
                      <div>
                        <span className="font-bold text-gray-900 block">Safe Archival (Recommended)</span>
                        <span className="text-[11px] text-gray-600">
                          Marks the student as Archived. Removes them from active directory rosters and filters, while preserving marksheet transcripts and fee ledger audits.
                        </span>
                      </div>
                    </label>

                    <label className="flex items-start gap-2 cursor-pointer pt-1">
                      <input
                        type="radio"
                        name="deleteMode"
                        checked={deleteMode === 'permanent'}
                        onChange={() => setDeleteMode('permanent')}
                        className="mt-0.5 text-red-600"
                      />
                      <div>
                        <span className="font-bold text-red-700 block">Permanent Deletion (Cascade)</span>
                        <span className="text-[11px] text-red-600">
                          Completely deletes the student and cascades removal of all associated exam marks, attendance, and fee history. Irreversible.
                        </span>
                      </div>
                    </label>
                  </div>

                  {/* Confirmation text input if permanent deletion is chosen for student with records */}
                  {isPermanent && (
                    <div className="pt-2 border-t border-amber-200 space-y-1.5">
                      <label className="block font-bold text-red-700 text-[11px]">
                        To confirm permanent deletion of this student and linked history, please type <span className="font-mono bg-red-100 px-1 py-0.5 rounded text-red-900 font-extrabold">DELETE</span> below:
                      </label>
                      <input
                        type="text"
                        value={deleteConfirmText}
                        onChange={e => setDeleteConfirmText(e.target.value)}
                        placeholder="Type DELETE to confirm"
                        className="w-full bg-white border border-red-300 rounded-lg p-2 text-xs font-mono font-bold text-red-900 focus:outline-hidden focus:ring-2 focus:ring-red-400"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3.5 text-xs text-emerald-800 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Safe to Delete</span>
                  </div>
                  <p className="text-[11px]">
                    This student has no existing academic marks, attendance logs, or fee records. They can be safely deleted permanently without impacting historical records.
                  </p>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setDeletingStudent(null)}
                  disabled={isDeletingLoading}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 text-xs cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={executeStudentDelete}
                  disabled={isButtonDisabled}
                  className={`px-5 py-2 rounded-xl text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer ${
                    isButtonDisabled
                      ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                      : isPermanent
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isDeletingLoading ? (
                    <span>Processing...</span>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>
                        {isPermanent ? 'Confirm Permanent Delete' : 'Confirm Archive Student'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
