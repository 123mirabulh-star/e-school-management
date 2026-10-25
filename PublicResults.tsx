import React, { useState } from 'react';
import { Search, Award, CheckCircle2, XCircle, Download, FileText, AlertCircle, RefreshCw } from 'lucide-react';
import { AppDatabase } from '../../services/storage';
import { CalculatedResult, Student, Examination, ClassLevel, WebsiteDownloadItem } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { t, formatNumber, getLocalizedField } from '../../services/i18n';

interface PublicResultsProps {
  db: AppDatabase;
  onNavigate: (page: string) => void;
}

export const PublicResults: React.FC<PublicResultsProps> = ({ db, onNavigate }) => {
  const { language } = useLanguage();
  const [examId, setExamId] = useState<string>(db.examinations[0]?.id || '');
  const [classId, setClassId] = useState<string>(db.classes[0]?.id || '');
  const [rollOrId, setRollOrId] = useState<string>('');
  const [hasSearched, setHasSearched] = useState(false);
  const [searchResult, setSearchResult] = useState<{
    result: CalculatedResult;
    student: Student;
    exam?: Examination;
    cls?: ClassLevel;
  } | null>(null);

  const website = db.website;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rollOrId.trim()) return;

    setHasSearched(true);
    const query = rollOrId.trim().toLowerCase();

    // Find student matching query by roll or studentId or admissionNo
    const matchedStudent = db.students.find((s: Student) => {
      const matchRoll = s.rollNo !== undefined && String(s.rollNo).toLowerCase() === query;
      const matchId = s.studentId && s.studentId.toLowerCase() === query;
      const matchAdm = s.admissionNo && s.admissionNo.toLowerCase() === query;
      const matchClass = !classId || s.classId === classId;
      return (matchRoll || matchId || matchAdm) && matchClass;
    });

    if (!matchedStudent) {
      setSearchResult(null);
      return;
    }

    // Find result record for student & exam
    const matchedResult = db.results.find((r: CalculatedResult) => 
      r.studentId === matchedStudent.id && (!examId || r.examId === examId)
    );

    const exam = db.examinations.find((ex: Examination) => ex.id === (matchedResult?.examId || examId));
    const cls = db.classes.find((c: ClassLevel) => c.id === matchedStudent.classId);

    if (matchedResult) {
      setSearchResult({
        result: matchedResult,
        student: matchedStudent,
        exam,
        cls,
      });
    } else {
      setSearchResult(null);
    }
  };

  const handleReset = () => {
    setRollOrId('');
    setHasSearched(false);
    setSearchResult(null);
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Header */}
      <div className="bg-slate-900 text-white py-12 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold uppercase tracking-wider mb-3">
            {t('results.badge', language)}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            {t('results.heading', language)}
          </h1>
          <p className="mt-3 text-slate-400 max-w-2xl mx-auto text-sm md:text-base">
            {t('results.subheading', language)}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">
        {/* Search Panel Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-800 text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-amber-400" />
              <h2 className="font-bold text-base md:text-lg">
                {t('results.portal_title', language)}
              </h2>
            </div>
            <span className="text-xs bg-slate-700 text-slate-300 px-2.5 py-1 rounded">
              {language === 'bn' ? 'শিক্ষাবর্ষ ' : 'Academic Session '}
              {formatNumber(website?.settings?.academicSession || 'Current', language)}
            </span>
          </div>

          <form onSubmit={handleSearch} className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  {t('results.exam_label', language)}
                </label>
                <select
                  value={examId}
                  onChange={(e) => setExamId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                >
                  {db.examinations.map((exam: Examination) => (
                    <option key={exam.id} value={exam.id}>
                      {getLocalizedField(exam, 'name', language)} ({formatNumber(exam.academicYear || 'Active', language)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  {t('results.class_label', language)}
                </label>
                <select
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                >
                  <option value="">{language === 'bn' ? 'সকল শ্রেণি' : 'All Classes'}</option>
                  {db.classes.map((c: ClassLevel) => (
                    <option key={c.id} value={c.id}>
                      {language === 'bn' ? `শ্রেণি ${c.nameBn || c.nameEn}` : `Class ${c.nameEn}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  {t('results.roll_label', language)}
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === 'bn' ? 'যেমন: ১০১ অথবা STU-2024-001' : 'e.g. 101 or STU-2024-001'}
                  value={rollOrId}
                  onChange={(e) => setRollOrId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium font-mono"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-slate-400" />
                {language === 'bn'
                  ? 'গোপনীয় নম্বরপত্র সংরক্ষিত। কেবল প্রকাশিত সরকারি ফলাফল প্রদর্শিত হয়।'
                  : 'Confidential marks details are protected. Only verified public transcripts are displayed.'}
              </p>
              <div className="flex items-center gap-3">
                {hasSearched && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    {t('results.reset_btn', language)}
                  </button>
                )}
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-sm rounded-lg shadow-sm transition flex items-center gap-2 cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  {t('results.search_btn', language)}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Search Results Display */}
        {hasSearched && (
          <div>
            {searchResult ? (
              <div className="bg-white rounded-xl shadow-md border-2 border-amber-400/40 overflow-hidden">
                {/* Result Header */}
                <div className="bg-slate-900 text-white px-6 py-5 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs uppercase tracking-wider text-amber-400 font-bold">
                        {language === 'bn' ? 'অফিশিয়াল ফলাফল বিবরণী' : 'Official Transcript Summary'}
                      </span>
                      <h3 className="text-xl font-bold">
                        {getLocalizedField(searchResult.exam, 'name', language) || (language === 'bn' ? 'একাডেমিক পরীক্ষা' : 'Academic Examination')}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {searchResult.result.resultStatus === 'PASSED' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-sm font-bold">
                        <CheckCircle2 className="w-4 h-4" /> {language === 'bn' ? 'উত্তীর্ণ (Passed)' : 'Passed'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30 text-sm font-bold">
                        <XCircle className="w-4 h-4" /> {language === 'bn' ? 'পুনর্বিবেচনা প্রয়োজন' : 'Needs Improvement'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Student Details Grid */}
                <div className="p-6 md:p-8 bg-slate-50/50 border-b border-slate-200">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        {language === 'bn' ? 'শিক্ষার্থীর নাম' : 'Student Name'}
                      </div>
                      <div className="text-sm font-extrabold text-slate-900 mt-1 truncate">
                        {language === 'bn' ? (searchResult.student.nameBn || searchResult.student.nameEn) : searchResult.student.nameEn}
                      </div>
                    </div>

                    <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        {language === 'bn' ? 'শ্রেণি রোল' : 'Class Roll'}
                      </div>
                      <div className="text-sm font-extrabold text-slate-900 mt-1 font-mono">
                        {formatNumber(searchResult.student.rollNo ?? 'N/A', language)}
                      </div>
                    </div>

                    <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        {language === 'bn' ? 'শ্রেণি / গ্রেড' : 'Class / Grade'}
                      </div>
                      <div className="text-sm font-extrabold text-slate-900 mt-1">
                        {language === 'bn' ? (searchResult.cls?.nameBn || searchResult.cls?.nameEn || 'N/A') : (searchResult.cls?.nameEn || 'N/A')}
                      </div>
                    </div>

                    <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        {language === 'bn' ? 'শিফট' : 'Shift'}
                      </div>
                      <div className="text-sm font-extrabold text-slate-900 mt-1">
                        {getLocalizedField(searchResult.student, 'shift', language) || (language === 'bn' ? 'প্রভাতী' : 'Morning')}
                      </div>
                    </div>

                    <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        {language === 'bn' ? 'গ্রুপ / বিভাগ' : 'Academic Group'}
                      </div>
                      <div className="text-sm font-extrabold text-slate-900 mt-1">
                        {getLocalizedField(searchResult.student, 'group', language) || (language === 'bn' ? 'সাধারণ' : 'General')}
                      </div>
                    </div>

                    <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        {language === 'bn' ? 'স্টুডেন্ট আইডি' : 'Student ID'}
                      </div>
                      <div className="text-sm font-extrabold text-slate-900 mt-1 truncate font-mono">
                        {searchResult.student.studentId || searchResult.student.id}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Score Summary Banner */}
                <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 bg-white">
                  <div className="bg-slate-900 text-white rounded-xl p-5 text-center flex flex-col justify-center">
                    <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                      {language === 'bn' ? 'প্রাপ্ত গ্রেড পয়েন্ট (GPA)' : 'Grade Point Average (GPA)'}
                    </span>
                    <span className="text-4xl md:text-5xl font-black text-amber-400 mt-1 font-mono">
                      {formatNumber(
                        typeof searchResult.result.gpa === 'number'
                          ? searchResult.result.gpa.toFixed(2)
                          : searchResult.result.gpa,
                        language
                      )}
                    </span>
                    <span className="text-xs text-slate-400 mt-1">
                      {language === 'bn' ? 'স্কেল: ৫.০০' : 'Scale: 5.00'}
                    </span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-center flex flex-col justify-center">
                    <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
                      {language === 'bn' ? 'লেটার গ্রেড' : 'Letter Grade'}
                    </span>
                    <span className="text-4xl md:text-5xl font-black text-slate-900 mt-1">
                      {searchResult.result.letterGrade || 'A'}
                    </span>
                    <span className="text-xs text-slate-500 mt-1">
                      {language === 'bn' ? 'সামগ্রিক মূল্যায়ন' : 'Overall Assessment'}
                    </span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-center flex flex-col justify-center">
                    <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
                      {language === 'bn' ? 'শ্রেণি মেধা ক্রম' : 'Class Merit Position'}
                    </span>
                    <span className="text-4xl md:text-5xl font-black text-slate-800 mt-1 font-mono">
                      {searchResult.result.meritRank
                        ? `#${formatNumber(searchResult.result.meritRank, language)}`
                        : (language === 'bn' ? 'প্রকাশিত' : 'Published')}
                    </span>
                    <span className="text-xs text-slate-500 mt-1">
                      {language === 'bn' ? 'মেধাক্রম তালিকা' : 'Class Merit List'}
                    </span>
                  </div>
                </div>

                {/* Disclaimer footer */}
                <div className="bg-slate-100 px-6 py-4 text-xs text-slate-600 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                  <span>
                    {language === 'bn'
                      ? 'অফিশিয়াল ফলাফল প্রকাশিত ও যাচাইকৃত।'
                      : `Official results verified on ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}.`}
                  </span>
                  <span className="italic">
                    {language === 'bn'
                      ? 'হলোগ্রামযুক্ত মূল ট্রান্সক্রিপ্ট প্রতিষ্ঠান কার্যালয় থেকে সংগ্রহযোগ্য।'
                      : 'Printed Marksheets with security hologram are issued from the College Office.'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-10 text-center">
                <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 mx-auto flex items-center justify-center mb-4">
                  <XCircle className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  {language === 'bn' ? 'কোনো ফলাফল পাওয়া যায়নি' : 'No Result Found'}
                </h3>
                <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
                  {t('results.not_found', language)}
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  <button
                    onClick={handleReset}
                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition cursor-pointer"
                  >
                    {language === 'bn' ? 'পুনরায় খুঁজুন' : 'Try Another Search'}
                  </button>
                  <button
                    onClick={() => onNavigate('contact')}
                    className="px-5 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg transition cursor-pointer"
                  >
                    {language === 'bn' ? 'যোগাযোগ শাখা' : 'Contact Academic Registrar'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Official Downloads & Forms Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider mb-1">
                {language === 'bn' ? 'অফিশিয়াল ডকুমেন্টস' : 'Official Documents'}
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                {t('results.downloads_title', language)}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {t('results.downloads_desc', language)}
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {formatNumber(
                (website?.downloads || []).filter(item => item.isPublished !== false).length,
                language
              )}{' '}
              {language === 'bn' ? 'টি ফাইল সংযুক্ত' : 'Files Available'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {website?.downloads && website.downloads.filter(item => item.isPublished !== false).length > 0 ? (
              website.downloads
                .filter(item => item.isPublished !== false)
                .map((item: WebsiteDownloadItem) => {
                  const title = getLocalizedField(item, 'title', language);
                  const description = getLocalizedField(item, 'description', language);
                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-lg border border-slate-200 hover:border-amber-400 hover:shadow-sm transition bg-slate-50/50 flex flex-col justify-between"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-600 shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            {item.category} • {item.fileType || 'PDF'}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 mt-0.5 leading-snug">{title}</h4>
                          {description && (
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{description}</p>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-medium">
                          {language === 'bn' ? 'সাইজ:' : 'Size:'} {item.fileSize || 'PDF'}
                        </span>
                        <a
                          href={item.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 transition"
                        >
                          <Download className="w-3.5 h-3.5" />
                          {t('results.download_action', language)}
                        </a>
                      </div>
                    </div>
                  );
                })
            ) : (
              <p className="text-sm text-slate-500 col-span-3">
                {language === 'bn' ? 'বর্তমানে কোনো ডাউনলোড ফাইল নেই।' : 'No downloads available at the moment.'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
