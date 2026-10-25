import React, { useState } from 'react';
import {
  CreditCard,
  DollarSign,
  Plus,
  Printer,
  Search,
  CheckCircle2,
  Receipt,
  Download,
  AlertCircle,
  X
} from 'lucide-react';
import { FeePayment, FeeCategory, Student } from '../types';
import { AppDatabase, logAuditAction } from '../services/storage';
import { downloadHtmlDocument, downloadCsv } from '../utils/downloadHelper';

interface FeesManagementViewProps {
  db: AppDatabase;
  onUpdateDb: (updated: AppDatabase) => void;
}

export const FeesManagementView: React.FC<FeesManagementViewProps> = ({
  db,
  onUpdateDb
}) => {
  const [activeTab, setActiveTab] = useState<'collection' | 'history' | 'structures'>('collection');
  const [searchTerm, setSearchTerm] = useState('');

  const [isCollecting, setIsCollecting] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(db.students[0]?.id || '');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(db.feeCategories[0]?.id || '');
  const [feeMonth, setFeeMonth] = useState<string>('June 2026');
  const [paymentAmount, setPaymentAmount] = useState<number>(1500);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'bKash' | 'Nagad' | 'Bank Transfer'>('bKash');
  const [transactionRef, setTransactionRef] = useState<string>('BK7X8910');

  const [viewingReceipt, setViewingReceipt] = useState<FeePayment | null>(db.feePayments[0] || null);

  const selectedStudent = db.students.find(s => s.id === selectedStudentId);

  const handleCollectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    const receiptNo = `REC-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const newPayment: FeePayment = {
      id: `pay-${Date.now()}`,
      receiptNo,
      studentId: selectedStudent.id,
      feeCategoryId: selectedCategoryId,
      month: feeMonth,
      amountPaid: Number(paymentAmount),
      discount: 0,
      date: new Date().toISOString().split('T')[0],
      paymentMethod,
      transactionRef: transactionRef || undefined,
      collectedBy: `${db.currentUser?.fullName || 'Admin'} (${db.currentUser?.role || 'Staff'})`,
      status: 'paid'
    };

    const updatedStudents = db.students.map(s => {
      if (s.id === selectedStudent.id && s.duesAmount) {
        return {
          ...s,
          duesAmount: Math.max(0, s.duesAmount - Number(paymentAmount))
        };
      }
      return s;
    });

    let updatedDb: AppDatabase = {
      ...db,
      students: updatedStudents,
      feePayments: [newPayment, ...db.feePayments]
    };

    updatedDb = logAuditAction(
      updatedDb,
      'COLLECT_FEE',
      `Collected BDT ${paymentAmount} from ${selectedStudent.nameEn} (Receipt: ${receiptNo})`
    );

    onUpdateDb(updatedDb);
    setIsCollecting(false);
    setViewingReceipt(newPayment);
  };

  const handleDownloadReceiptHtml = (p: FeePayment) => {
    const st = db.students.find(s => s.id === p.studentId);
    const cat = db.feeCategories.find(c => c.id === p.feeCategoryId);

    const bodyContent = `
      <div style="text-align: center; border-bottom: 2px solid #0F172A; padding-bottom: 12px; margin-bottom: 20px;">
        <h1 style="margin: 0; font-size: 22px; text-transform: uppercase;">${db.schoolSettings.nameEn}</h1>
        <p style="margin: 4px 0; font-size: 13px; color: #475569;">${db.schoolSettings.address} | EIIN: ${db.schoolSettings.eiin}</p>
        <div style="margin-top: 10px; display: inline-block; background: #065F46; color: white; padding: 4px 16px; border-radius: 4px; font-weight: bold; font-size: 13px; text-transform: uppercase;">
          Official Money Receipt
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; font-family: monospace; font-size: 13px; margin-bottom: 15px; border-bottom: 1px dashed #CBD5E1; padding-bottom: 10px;">
        <span><strong>Receipt Voucher:</strong> ${p.receiptNo}</span>
        <span><strong>Date:</strong> ${p.date}</span>
      </div>

      <table>
        <tr>
          <td style="width: 35%; background: #F8FAFC;"><strong>Student Name:</strong></td>
          <td><strong>${st?.nameEn || 'N/A'}</strong> (ID: ${st?.studentId || 'N/A'})</td>
        </tr>
        <tr>
          <td style="background: #F8FAFC;"><strong>Roll & Class:</strong></td>
          <td>Roll #${st?.rollNo || '1'} (${db.classes.find(c => c.id === st?.classId)?.nameEn || 'Class 10'})</td>
        </tr>
        <tr>
          <td style="background: #F8FAFC;"><strong>Fee Category / Purpose:</strong></td>
          <td>${cat?.nameEn || 'Tuition Fee'}</td>
        </tr>
        <tr>
          <td style="background: #F8FAFC;"><strong>Billing Month:</strong></td>
          <td>${p.month || 'Current'}</td>
        </tr>
        <tr>
          <td style="background: #F8FAFC;"><strong>Payment Method:</strong></td>
          <td>${p.paymentMethod} ${p.transactionRef ? `(Ref: ${p.transactionRef})` : ''}</td>
        </tr>
        <tr style="font-size: 16px; font-weight: bold; background: #ECFDF5; color: #065F46;">
          <td>Total Paid Amount:</td>
          <td>BDT ${p.amountPaid.toLocaleString()}</td>
        </tr>
      </table>

      <div style="display: flex; justify-content: space-between; margin-top: 40px; font-size: 12px; color: #475569;">
        <div>Collected By: ${p.collectedBy}</div>
        <div style="border-top: 1px solid #94A3B8; width: 180px; text-align: center; padding-top: 5px;"><strong>Authorized Accounts Seal</strong></div>
      </div>
    `;

    downloadHtmlDocument(`Receipt_${p.receiptNo}`, `Receipt ${p.receiptNo}`, bodyContent);
  };

  const handleExportCsv = () => {
    const headers = ['Receipt No', 'Date', 'Student ID', 'Student Name', 'Fee Category', 'Month', 'Payment Method', 'Amount BDT'];
    const rows = db.feePayments.map(p => {
      const st = db.students.find(s => s.id === p.studentId);
      const cat = db.feeCategories.find(c => c.id === p.feeCategoryId);
      return [
        p.receiptNo,
        p.date,
        st?.studentId || '',
        st?.nameEn || '',
        cat?.nameEn || '',
        p.month || '',
        p.paymentMethod,
        p.amountPaid
      ];
    });
    downloadCsv('Fee_Payments_Report', headers, rows);
  };

  const totalCollected = db.feePayments.reduce((acc, p) => acc + p.amountPaid, 0);

  return (
    <div className="space-y-5">
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <div>
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            Fees & Accounts Management
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Collect monthly tuition fees, admission charges, and issue computerized money receipts in BDT.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 border border-gray-300"
          >
            <Download className="w-3.5 h-3.5 text-gray-600" />
            Export Payments CSV
          </button>
          <button
            onClick={() => setIsCollecting(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Collect Fee
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-gray-200 no-print">
        <button
          onClick={() => setActiveTab('collection')}
          className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'collection'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Payment Transactions ({db.feePayments.length})
        </button>
        <button
          onClick={() => setActiveTab('structures')}
          className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'structures'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Fee Structure Rates
        </button>
      </div>

      {activeTab === 'collection' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
          <div className="p-3.5 border-b border-gray-200 bg-gray-50 flex items-center justify-between no-print">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Verified Collection History (Total: BDT {totalCollected.toLocaleString()})
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-100 text-gray-600 uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Receipt No</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Month</th>
                  <th className="py-2.5 px-3">Method</th>
                  <th className="py-2.5 px-3 text-right">Amount (BDT)</th>
                  <th className="py-2.5 px-3 text-center no-print">Receipt Options</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {db.feePayments.map(p => {
                  const st = db.students.find(s => s.id === p.studentId);
                  const cat = db.feeCategories.find(c => c.id === p.feeCategoryId);
                  return (
                    <tr key={p.id} className="hover:bg-emerald-50/40">
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-900">
                        {p.receiptNo}
                      </td>
                      <td className="py-2.5 px-3 text-gray-600 font-mono">
                        {p.date}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-gray-900">{st?.nameEn}</div>
                        <div className="text-[11px] font-mono text-gray-500">Roll #{st?.rollNo}</div>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-gray-700">
                        {cat?.nameEn}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-gray-600">
                        {p.month || '-'}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-[10px] bg-gray-100 border px-1.5 py-0.5 rounded font-semibold text-gray-700">
                          {p.paymentMethod}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-700">
                        BDT {p.amountPaid.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-center no-print">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setViewingReceipt(p)}
                            className="bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold px-2 py-1 rounded text-[11px]"
                          >
                            Preview
                          </button>
                          <button
                            onClick={() => handleDownloadReceiptHtml(p)}
                            className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold px-2 py-1 rounded text-[11px] flex items-center gap-1"
                            title="Download Receipt HTML File"
                          >
                            <Download className="w-3 h-3" />
                            Download
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'structures' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
          <div className="p-3.5 border-b border-gray-200 bg-gray-50">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Configured Fee Heads
            </span>
          </div>
          <div className="divide-y divide-gray-100">
            {db.feeCategories.map(cat => (
              <div key={cat.id} className="p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-900">{cat.nameEn}</h4>
                  <span className="text-[10px] text-gray-400 uppercase">{cat.type.replace('_', ' ')}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-emerald-700">
                    BDT {cat.defaultAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Collect Fee Modal */}
      {isCollecting && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-600" />
                Collect Student Fee
              </h3>
              <button onClick={() => setIsCollecting(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCollectSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Select Student *</label>
                <select
                  value={selectedStudentId}
                  onChange={e => setSelectedStudentId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 font-bold"
                >
                  {db.students.map(s => (
                    <option key={s.id} value={s.id}>
                      Roll #{s.rollNo} - {s.nameEn} [Dues: BDT {s.duesAmount || 0}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Fee Category</label>
                  <select
                    value={selectedCategoryId}
                    onChange={e => setSelectedCategoryId(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2"
                  >
                    {db.feeCategories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.nameEn} (BDT {c.defaultAmount})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Billing Month</label>
                  <input
                    type="text"
                    value={feeMonth}
                    onChange={e => setFeeMonth(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Amount to Collect (BDT) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={paymentAmount}
                    onChange={e => setPaymentAmount(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg p-2 font-extrabold text-blue-900 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as any)}
                    className="w-full border border-gray-300 rounded-lg p-2 font-bold"
                  >
                    <option value="Cash">Cash</option>
                    <option value="bKash">bKash</option>
                    <option value="Nagad">Nagad</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>

              {paymentMethod !== 'Cash' && (
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Transaction Ref / TrxID</label>
                  <input
                    type="text"
                    value={transactionRef}
                    onChange={e => setTransactionRef(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 font-mono"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsCollecting(false)}
                  className="px-4 py-2 border rounded-lg text-gray-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-sm"
                >
                  Collect & Generate Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between border-b pb-3 mb-4 no-print">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-emerald-600" />
                Official Fee Receipt
              </h3>
              <button onClick={() => setViewingReceipt(null)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="border-2 border-emerald-800 rounded-xl p-5 bg-emerald-50/20 text-gray-900 print-card text-xs space-y-3">
              <div className="text-center border-b border-emerald-800 pb-2">
                <h5 className="font-extrabold uppercase tracking-tight text-sm">
                  {db.schoolSettings.nameEn}
                </h5>
                <p className="text-[10px] text-gray-600">
                  {db.schoolSettings.address} • EIIN: {db.schoolSettings.eiin}
                </p>
                <span className="inline-block mt-1 bg-emerald-800 text-white px-3 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                  MONEY RECEIPT
                </span>
              </div>

              <div className="flex justify-between text-[11px] font-mono border-b pb-2">
                <span>Receipt No: <strong className="text-blue-900">{viewingReceipt.receiptNo}</strong></span>
                <span>Date: {viewingReceipt.date}</span>
              </div>

              {(() => {
                const st = db.students.find(s => s.id === viewingReceipt.studentId);
                const cat = db.feeCategories.find(c => c.id === viewingReceipt.feeCategoryId);
                return (
                  <div className="space-y-2 text-xs">
                    <div className="grid grid-cols-2 gap-2 bg-white p-2.5 rounded border border-gray-200">
                      <div>
                        <span className="text-gray-500 text-[10px] block">Student Name:</span>
                        <strong className="text-gray-900">{st?.nameEn}</strong>
                      </div>
                      <div>
                        <span className="text-gray-500 text-[10px] block">Roll & ID:</span>
                        <strong>Roll #{st?.rollNo}</strong>
                        <span className="block font-mono text-[10px] text-gray-500">{st?.studentId}</span>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded p-2 bg-white space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fee Head:</span>
                        <strong className="text-gray-900">{cat?.nameEn}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Billing Period:</span>
                        <span className="font-mono">{viewingReceipt.month || 'Current'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Mode:</span>
                        <span>{viewingReceipt.paymentMethod} {viewingReceipt.transactionRef ? `(${viewingReceipt.transactionRef})` : ''}</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t text-sm font-extrabold text-emerald-800">
                        <span>Total Paid Amount:</span>
                        <span>BDT {viewingReceipt.amountPaid.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex justify-between text-[10px] text-gray-500 pt-6">
                      <div>Collected by: {viewingReceipt.collectedBy}</div>
                      <div className="border-t border-gray-400 pt-1 text-center font-bold">
                        Authorized Accounts Signature
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="flex justify-end gap-2 pt-4 no-print">
              <button
                onClick={() => handleDownloadReceiptHtml(viewingReceipt)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Download Receipt File (.html)
              </button>
              <button
                onClick={() => window.print()}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
              <button
                onClick={() => setViewingReceipt(null)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-semibold px-4 py-2 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
