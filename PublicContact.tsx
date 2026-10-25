import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';
import { WebsiteContactMessage } from '../../types';
import { AppDatabase } from '../../services/storage';
import { useLanguage } from '../../context/LanguageContext';
import { t, formatNumber, getLocalizedField } from '../../services/i18n';

interface PublicContactProps {
  db: AppDatabase;
  onUpdateDb: (updated: AppDatabase) => void;
}

export const PublicContact: React.FC<PublicContactProps> = ({ db, onUpdateDb }) => {
  const { language } = useLanguage();
  const website = db.website;
  const settings = website?.settings;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Admission Inquiry',
    message: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setSubmitting(true);

    const newMessage: WebsiteContactMessage = {
      id: `msg_${Date.now()}`,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      subject: formData.subject || 'General Inquiry',
      message: formData.message,
      status: 'unread',
      createdAt: new Date().toISOString(),
    };

    const updatedWebsite = {
      ...website,
      contactMessages: [newMessage, ...(website.contactMessages || [])],
    };

    const updatedDb: AppDatabase = {
      ...db,
      website: updatedWebsite,
    };

    onUpdateDb(updatedDb);

    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'Admission Inquiry',
        message: '',
      });
    }, 400);
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Header */}
      <div className="bg-slate-900 text-white py-12 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold uppercase tracking-wider mb-3">
            {t('contact.badge', language)}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            {t('contact.heading', language)}
          </h1>
          <p className="mt-3 text-slate-400 max-w-2xl mx-auto text-sm md:text-base">
            {t('contact.subheading', language)}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Contact Details & Info Cards */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                {language === 'bn' ? 'প্রাতিষ্ঠানিক যোগাযোগের তথ্য' : 'Institutional Contact Info'}
              </h2>

              <ul className="space-y-5">
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                      {t('contact.address', language)}
                    </span>
                    <p className="text-sm font-semibold text-slate-800 mt-0.5 leading-relaxed">
                      {getLocalizedField(settings, 'address', language) || (language === 'bn' ? 'কলেজ রোড, মডেল টাউন, সেক্টর-৭, উত্তরা, ঢাকা-১২৩০' : 'College Road, Model Town, Sector-7, Dhaka-1230, Bangladesh')}
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                      {t('contact.phone', language)}
                    </span>
                    <p className="text-sm font-semibold text-slate-800 mt-0.5 font-mono">
                      {formatNumber(settings?.phone || '+880 2-9876543', language)}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {language === 'bn' ? 'ভর্তি হেল্পলাইন:' : 'Admissions Helpline:'} {formatNumber(settings?.admissionHelpline || '+880 1711-000000', language)}
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                      {t('contact.email', language)}
                    </span>
                    <p className="text-sm font-semibold text-slate-800 mt-0.5">
                      {settings?.email || 'info@ebiddalay.edu.bd'}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {language === 'bn' ? 'ভর্তি শাখা:' : 'Admissions:'} {settings?.admissionEmail || 'admissions@ebiddalay.edu.bd'}
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                      {t('contact.hours', language)}
                    </span>
                    <p className="text-sm font-semibold text-slate-800 mt-0.5">
                      {getLocalizedField(settings, 'officeHours', language) || (language === 'bn' ? 'রবিবার - বৃহস্পতিবার: সকাল ৮:০০ - বিকাল ৪:০০' : 'Sunday - Thursday: 8:00 AM - 4:00 PM')}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {language === 'bn' ? 'শুক্রবার ও শনিবার: সাপ্তাহিক ছুটি' : 'Friday & Saturday: Closed (Academic Holidays)'}
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Emergency & Key Contacts Card */}
            <div className="bg-slate-900 text-white rounded-xl p-6 border border-slate-800">
              <h3 className="font-bold text-sm uppercase tracking-wider text-amber-400 mb-3">
                {language === 'bn' ? 'প্রয়োজনীয় বিভাগীয় এক্সটেনশন' : 'Key Department Contacts'}
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between pb-2 border-b border-slate-800">
                  <span className="text-slate-400">
                    {language === 'bn' ? 'অধ্যক্ষের সচিবালয়' : 'Principal Secretariat'}
                  </span>
                  <span className="font-semibold text-slate-200 font-mono">
                    Ext: {formatNumber('101', language)}
                  </span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-800">
                  <span className="text-slate-400">
                    {language === 'bn' ? 'রেজিস্ট্রার ও পরীক্ষা নিয়ন্ত্রণ শাখা' : 'Academic Registrar & Exams'}
                  </span>
                  <span className="font-semibold text-slate-200 font-mono">
                    Ext: {formatNumber('104', language)}
                  </span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-800">
                  <span className="text-slate-400">
                    {language === 'bn' ? 'হিসাব ও বেতন শাখা' : 'Accounts & Fee Section'}
                  </span>
                  <span className="font-semibold text-slate-200 font-mono">
                    Ext: {formatNumber('108', language)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">
                    {language === 'bn' ? 'মেডিক্যাল সেন্টার ও শিক্ষার্থী স্বাস্থ্য' : 'Medical Room & Student Health'}
                  </span>
                  <span className="font-semibold text-slate-200 font-mono">
                    Ext: {formatNumber('112', language)}
                  </span>
                </div>
              </div>
            </div>

            {/* Embedded Location Map Banner */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 overflow-hidden">
              <div className="rounded-lg overflow-hidden border border-slate-200 h-48 bg-slate-100 relative">
                <iframe
                  title="Campus Location Map"
                  src={settings?.mapEmbedUrl || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d116834.00977789427!2d90.34928588523992!3d23.780777744391673!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b8b087026b81%3A0x8fa563bbdd5904c2!2sDhaka%2C%20Bangladesh!5e0!3m2!1sen!2sbd!4v1680000000000!5m2!1sen!2sbd'}
                  className="w-full h-full border-0"
                  loading="lazy"
                ></iframe>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 text-center">
                {language === 'bn'
                  ? 'মেট্রোরেল ও প্রধান যোগাযোগ পথের সন্নিকটে অবস্থিত।'
                  : 'Located near main metro connection with secure campus transport hubs.'}
              </p>
            </div>
          </div>

          {/* Contact Message Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {t('contact.form_title', language)}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {language === 'bn'
                      ? 'আপনার বার্তাটি সরাসরি সংশ্লিষ্ট বিভাগীয় কর্তৃপক্ষের নিকট পৌঁছে দেওয়া হবে।'
                      : 'Your message will be routed directly to the appropriate school authority.'}
                  </p>
                </div>
              </div>

              {submitted ? (
                <div className="p-8 text-center bg-emerald-50 rounded-xl border border-emerald-200">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-emerald-900">
                    {t('contact.success', language)}
                  </h3>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-6 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition cursor-pointer"
                  >
                    {language === 'bn' ? 'আরেকটি বার্তা পাঠান' : 'Send Another Message'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        {t('contact.name', language)}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={language === 'bn' ? 'যেমন: মোহাম্মদ আমিনুল ইসলাম' : 'e.g. Mohammad Aminul Islam'}
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        {t('contact.your_email', language)}
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. guardian@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        {t('contact.your_phone', language)}
                      </label>
                      <input
                        type="tel"
                        placeholder="e.g. 01711-XXXXXX"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        {t('contact.subject', language)}
                      </label>
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="Admission Inquiry">
                          {language === 'bn' ? 'ভর্তি সংক্রান্ত জিজ্ঞাসা' : 'Admission Inquiry'}
                        </option>
                        <option value="Academic Curriculum">
                          {language === 'bn' ? 'পাঠ্যক্রম ও সিলেবাস' : 'Academic Curriculum & Syllabus'}
                        </option>
                        <option value="Examination & Results">
                          {language === 'bn' ? 'পরীক্ষা ও ফলাফল' : 'Examination & Results'}
                        </option>
                        <option value="Fees & Accounts">
                          {language === 'bn' ? 'বেতন ও হিসাব সংক্রান্ত' : 'Fees & Payment Assistance'}
                        </option>
                        <option value="Student Transfer Certificate">
                          {language === 'bn' ? 'ছাড়পত্র / টিসি (TC)' : 'Transfer Certificate (TC)'}
                        </option>
                        <option value="General Feedback">
                          {language === 'bn' ? 'সাধারণ মতামত ও পরামর্শ' : 'General Feedback & Suggestion'}
                        </option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      {t('contact.message', language)}
                    </label>
                    <textarea
                      required
                      rows={5}
                      placeholder={language === 'bn' ? 'আপনার বিস্তারিত বার্তা এখানে লিখুন...' : 'Please enter your detailed inquiry or question here...'}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                    ></textarea>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {language === 'bn'
                        ? 'সকল বার্তা বিদ্যালয়ের সিস্টেমে গোপনীয়তার সাথে সংরক্ষিত হয়।'
                        : 'All inquiries are logged in the school management database securely.'}
                    </p>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-sm rounded-lg shadow-sm transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {submitting ? (
                        <span>{language === 'bn' ? 'পাঠানো হচ্ছে...' : 'Submitting...'}</span>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          {t('contact.send_btn', language)}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
