import React, { useState } from 'react';
import {
  GraduationCap,
  CheckCircle2,
  Calendar,
  Download,
  Send,
  Phone,
  FileCheck2
} from 'lucide-react';
import { WebsiteData, WebsiteAdmissionInquiry } from '../../types/website';
import { AppDatabase } from '../../services/storage';
import { useLanguage } from '../../context/LanguageContext';
import { t, formatNumber, getLocalizedField } from '../../services/i18n';

interface PublicAdmissionsProps {
  website: WebsiteData;
  db: AppDatabase;
  onUpdateDb: (updated: AppDatabase) => void;
  onNavigate: (page: string) => void;
}

export const PublicAdmissions: React.FC<PublicAdmissionsProps> = ({
  website,
  db,
  onUpdateDb,
  onNavigate
}) => {
  const { language } = useLanguage();
  const { settings, downloads } = website;

  // Form state
  const [formData, setFormData] = useState({
    studentName: '',
    gender: 'Male',
    dateOfBirth: '2015-01-01',
    applyingClass: db.classes[0]?.nameEn || 'Class 6',
    shiftPreference: 'Morning Shift',
    guardianName: '',
    guardianPhone: '+880 17',
    guardianEmail: '',
    address: '',
    previousSchool: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentName.trim() || !formData.guardianPhone.trim()) {
      alert(language === 'bn' ? 'অনুগ্রহ করে শিক্ষার্থীর পূর্ণ নাম এবং অভিভাবকের মোবাইল নম্বর দিন।' : 'Please fill out student full name and guardian phone number.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const newInquiryId = `INQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const newInquiry: WebsiteAdmissionInquiry = {
        id: `inq-${Date.now()}`,
        studentName: formData.studentName.trim(),
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        applyingClass: formData.applyingClass,
        shiftPreference: formData.shiftPreference,
        guardianName: formData.guardianName.trim() || 'Parent/Guardian',
        guardianPhone: formData.guardianPhone.trim(),
        guardianEmail: formData.guardianEmail.trim() || undefined,
        address: formData.address.trim(),
        previousSchool: formData.previousSchool.trim() || undefined,
        submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        status: 'pending'
      };

      const updatedWebsite: WebsiteData = {
        ...website,
        admissionInquiries: [newInquiry, ...(website.admissionInquiries || [])]
      };

      const updatedDb: AppDatabase = {
        ...db,
        website: updatedWebsite
      };

      onUpdateDb(updatedDb);
      setIsSubmitting(false);
      setSubmittedId(newInquiryId);
      setFormData({
        studentName: '',
        gender: 'Male',
        dateOfBirth: '2015-01-01',
        applyingClass: db.classes[0]?.nameEn || 'Class 6',
        shiftPreference: 'Morning Shift',
        guardianName: '',
        guardianPhone: '+880 17',
        guardianEmail: '',
        address: '',
        previousSchool: ''
      });
    }, 600);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
          {t('admissions.badge', language)}
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {t('admissions.heading', language)}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          {t('admissions.subheading', language)}
        </p>
      </div>

      {/* Overview & Key Dates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-sm">
            {language === 'bn' ? 'ভর্তির যোগ্যতা ও শর্তাবলী' : 'Eligibility Criteria'}
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {language === 'bn'
              ? '১ম শ্রেণি থেকে ৯ম শ্রেণিতে সরকারি নীতিমালা অনুযায়ী বয়সসীমা প্রযোজ্য। একাদশ শ্রেণির জন্য এসএসসি পরীক্ষায় ন্যূনতম জিপিএ শর্ত পূরণ করতে হবে।'
              : 'Students applying for Class 1 through Class 9 must fulfill the age criteria set by the Ministry of Education. Class 11 admission follows board GPA qualification in SSC.'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Calendar className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-sm">
            {language === 'bn' ? 'জরুরি সময়সূচি' : 'Important Dates'}
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {language === 'bn' ? (
              <>
                • অনলাইন আবেদন: ১৫ অক্টোবর - ৩০ নভেম্বর<br />
                • মূল্যায়ন ও পরীক্ষা: ১০ ডিসেম্বর<br />
                • ফলাফল ও মেধা তালিকা: ১৮ ডিসেম্বর<br />
                • ভর্তি চূড়ান্তকরণ: ২০ - ২৮ ডিসেম্বর
              </>
            ) : (
              <>
                • Online Application: Oct 15 - Nov 30<br />
                • Written / Oral Evaluation: Dec 10<br />
                • Merit & Waiting List: Dec 18<br />
                • Admission Formalities: Dec 20 - 28
              </>
            )}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-sm">
            {language === 'bn' ? 'প্রয়োজনীয় কাগজপত্র' : 'Required Documents'}
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {language === 'bn' ? (
              <>
                • ডিজিটাল জন্ম নিবন্ধন সনদের ফটোকপি<br />
                • শিক্ষার্থীর ৩ কপি পাসপোর্ট সাইজ ছবি<br />
                • পূর্ববর্তী বিদ্যালয়ের প্রশংসাপত্র ও মার্কশিট<br />
                • পিতা-মাতার জাতীয় পরিচয়পত্রের ফটোকপি
              </>
            ) : (
              <>
                • Photocopy of Birth Registration Certificate<br />
                • 3 recent passport-sized color photographs<br />
                • Previous school Transfer Certificate (TC)<br />
                • Guardian NID photocopies
              </>
            )}
          </p>
        </div>
      </div>

      {/* Main Section: Application Form and Guidelines */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Online Inquiry & Application Form */}
        <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-emerald-600" />
                <span>{t('admissions.form_title', language)}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {t('admissions.form_desc', language)}
              </p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full">
              {language === 'bn' ? 'সেশন ২০২৬-২৭' : 'Session 2026-27'}
            </span>
          </div>

          {submittedId && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 space-y-1">
              <div className="flex items-center gap-2 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>{t('admissions.success_heading', language)}</span>
              </div>
              <p className="text-xs text-emerald-800">
                {t('admissions.success_message', language)} <strong className="font-mono">{formatNumber(submittedId, language)}</strong>
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('admissions.student_name', language)}
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === 'bn' ? 'যেমন: তানভীর হোসেন' : 'e.g. Tanvir Hossain'}
                  value={formData.studentName}
                  onChange={e => setFormData({ ...formData, studentName: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 focus:bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('admissions.gender', language)}
                </label>
                <select
                  value={formData.gender}
                  onChange={e => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 focus:bg-white font-medium"
                >
                  <option value="Male">{language === 'bn' ? 'পুরুষ' : 'Male'}</option>
                  <option value="Female">{language === 'bn' ? 'মহিলা' : 'Female'}</option>
                  <option value="Other">{language === 'bn' ? 'অন্যান্য' : 'Other'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('admissions.dob', language)}
                </label>
                <input
                  type="date"
                  required
                  value={formData.dateOfBirth}
                  onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 focus:bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('admissions.applying_class', language)}
                </label>
                <select
                  value={formData.applyingClass}
                  onChange={e => setFormData({ ...formData, applyingClass: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 focus:bg-white font-medium"
                >
                  {db.classes.map(c => (
                    <option key={c.id} value={c.nameEn}>
                      {language === 'bn' ? (c.nameBn || c.nameEn) : (c.nameEn || c.nameBn)}
                    </option>
                  ))}
                  <option value="Class 11 Science">
                    {language === 'bn' ? 'একাদশ শ্রেণি (বিজ্ঞান শাখা)' : 'Class 11 (Science Section)'}
                  </option>
                  <option value="Class 11 Humanities">
                    {language === 'bn' ? 'একাদশ শ্রেণি (মানবিক শাখা)' : 'Class 11 (Humanities Section)'}
                  </option>
                  <option value="Class 11 Business Studies">
                    {language === 'bn' ? 'একাদশ শ্রেণি (ব্যবসায় শিক্ষা)' : 'Class 11 (Business Studies)'}
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('admissions.shift', language)}
                </label>
                <select
                  value={formData.shiftPreference}
                  onChange={e => setFormData({ ...formData, shiftPreference: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 focus:bg-white font-medium"
                >
                  {db.shifts.map(sh => (
                    <option key={sh.id} value={sh.name}>
                      {getLocalizedField(sh, 'name', language)} ({formatNumber(sh.startTime || '07:30 AM', language)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('admissions.guardian_name', language)}
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === 'bn' ? 'যেমন: মো: মোস্তফা কামাল' : 'e.g. Md. Mostafa Kamal'}
                  value={formData.guardianName}
                  onChange={e => setFormData({ ...formData, guardianName: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 focus:bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('admissions.guardian_phone', language)}
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+880 1711-000000"
                  value={formData.guardianPhone}
                  onChange={e => setFormData({ ...formData, guardianPhone: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 focus:bg-white font-medium font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('admissions.guardian_email', language)}
                </label>
                <input
                  type="email"
                  placeholder="parent@example.com"
                  value={formData.guardianEmail}
                  onChange={e => setFormData({ ...formData, guardianEmail: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 focus:bg-white font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('admissions.prev_school', language)}
              </label>
              <input
                type="text"
                placeholder={language === 'bn' ? 'পূর্ববর্তী বিদ্যালয়ের নাম' : 'e.g. Government Laboratory High School'}
                value={formData.previousSchool}
                onChange={e => setFormData({ ...formData, previousSchool: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 focus:bg-white font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('admissions.address', language)}
              </label>
              <textarea
                rows={2}
                required
                placeholder={language === 'bn' ? 'বাসা, সড়ক, এলাকা, জেলা' : 'House, Road, Area, Dhaka'}
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 focus:bg-white font-medium"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? (language === 'bn' ? 'ফর্ম পাঠানো হচ্ছে...' : 'Submitting Application...')
                    : t('admissions.submit_btn', language)}
                </span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Download Form & Help */}
        <div className="lg:col-span-5 space-y-6">
          {/* Download Box */}
          <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-7 shadow-md space-y-4">
            <span className="bg-blue-500/25 text-blue-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {language === 'bn' ? 'অফলাইন আবেদন' : 'Offline Registration'}
            </span>

            <h3 className="text-lg font-black tracking-tight text-white">
              {language === 'bn' ? 'কাগজের ভর্তি ফরম প্রয়োজন?' : 'Prefer Paper Application Form?'}
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              {language === 'bn'
                ? 'বিদ্যালয়ের অফিশিয়াল ভর্তি ফরম (পিডিএফ) ডাউনলোড করে প্রিন্ট করুন এবং পূরণ করে প্রয়োজনীয় কাগজপত্রসহ বিদ্যালয় কাউন্টারে জমা দিন।'
                : 'Download the official printable Admission Application Form (PDF). Fill it out manually and submit it directly to the school administrative counter along with the required documents.'}
            </p>

            <div className="pt-2">
              <button
                onClick={() => onNavigate('results')}
                className="w-full bg-white text-slate-900 hover:bg-slate-100 font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-blue-600" />
                <span>{language === 'bn' ? 'ডাউনলোড সেকশনে যান' : 'Go to Downloads Section'}</span>
              </button>
            </div>
          </div>

          {/* Admission Contact Help */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-3.5">
            <h4 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2.5 flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-600" />
              <span>{language === 'bn' ? 'ভর্তি তথ্য ও হেল্পডেস্ক' : 'Admission Helpdesk'}</span>
            </h4>

            <div className="text-xs text-slate-600 space-y-2">
              <p>
                {language === 'bn'
                  ? 'ফি, পরিবহন সুবিধা কিংবা ভর্তি পরীক্ষা সংক্রান্ত যেকোনো তথ্যের জন্য আমাদের কাউন্সেলরদের সাথে যোগাযোগ করুন।'
                  : 'Have questions regarding fees, transport coverage, or examination formats? Our admission counselors are available during school hours.'}
              </p>
              <div className="bg-slate-50 p-3 rounded-xl space-y-1 font-mono text-[11px] text-slate-700">
                <div>
                  <strong>{language === 'bn' ? 'সরাসরি হটলাইন:' : 'Direct Hotline:'}</strong> {formatNumber(settings.phone, language)}
                </div>
                <div>
                  <strong>{language === 'bn' ? 'অনুসন্ধান ইমেইল:' : 'Inquiry Email:'}</strong> {settings.email}
                </div>
                <div>
                  <strong>{language === 'bn' ? 'দাপ্তরিক সময়সূচি:' : 'Office Hours:'}</strong> {getLocalizedField(settings, 'openingHours', language)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
