import React, { useState } from 'react';
import {
  TrendingDown,
  TrendingUp,
  Plus,
  DollarSign,
  Calendar,
  Filter,
  CheckCircle2,
  X
} from 'lucide-react';
import { Transaction } from '../types';
import { AppDatabase, logAuditAction } from '../services/storage';

interface IncomeExpenseViewProps {
  db: AppDatabase;
  onUpdateDb: (updated: AppDatabase) => void;
}

export const IncomeExpenseView: React.FC<IncomeExpenseViewProps> = ({
  db,
  onUpdateDb
}) => {
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [isAdding, setIsAdding] = useState(false);

  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    category: 'Teacher & Staff Salary',
    amount: 15000,
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'Bank Transfer',
    referenceNo: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
    description: ''
  });

  const totalIncome = db.transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = db.transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

  const filteredTxns = db.transactions.filter(t => filterType === 'all' || t.type === filterType);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTxn: Transaction = {
      id: `txn-${Date.now()}`,
      type: formData.type,
      category: formData.category,
      amount: Number(formData.amount),
      date: formData.date,
      paymentMethod: formData.paymentMethod,
      referenceNo: formData.referenceNo,
      description: formData.description,
      createdBy: db.currentUser ? `${db.currentUser.fullName} (${db.currentUser.role})` : 'Administrator'
    };

    let updatedDb: AppDatabase = {
      ...db,
      transactions: [newTxn, ...db.transactions]
    };

    updatedDb = logAuditAction(
      updatedDb,
      'ADD_TRANSACTION',
      `Recorded ${formData.type} of BDT ${formData.amount} (${formData.category})`
    );

    onUpdateDb(updatedDb);
    setIsAdding(false);
  };

  return (
    <div className="space-y-5">
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-red-600" />
            Income & Expense Accounting Ledger
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Institutional revenue, tuition collections, utility bills, laboratory equipment, and operational overheads.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Transaction
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-2xs">
          <span className="text-xs font-semibold text-gray-500 uppercase">Total Income</span>
          <p className="text-2xl font-extrabold text-emerald-700 mt-1">BDT {totalIncome.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-red-200 shadow-2xs">
          <span className="text-xs font-semibold text-gray-500 uppercase">Total Expenses</span>
          <p className="text-2xl font-extrabold text-red-700 mt-1">BDT {totalExpense.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-2xs">
          <span className="text-xs font-semibold text-gray-500 uppercase">Net Balance</span>
          <p className={`text-2xl font-extrabold mt-1 ${totalIncome >= totalExpense ? 'text-blue-700' : 'text-red-700'}`}>
            BDT {(totalIncome - totalExpense).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="p-3.5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
            Transaction Ledger ({filteredTxns.length})
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 text-xs rounded font-medium ${filterType === 'all' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-200'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('income')}
              className={`px-2.5 py-1 text-xs rounded font-medium ${filterType === 'income' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-200'}`}
            >
              Income
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={`px-2.5 py-1 text-xs rounded font-medium ${filterType === 'expense' ? 'bg-red-600 text-white' : 'text-gray-600 hover:bg-gray-200'}`}
            >
              Expense
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-100 text-gray-600 uppercase font-semibold">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Ref No</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3">Payment Method</th>
                <th className="py-2.5 px-3 text-right">Amount (BDT)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTxns.map(t => (
                <tr key={t.id} className="hover:bg-gray-50/50">
                  <td className="py-2.5 px-3 font-mono text-gray-600">{t.date}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-gray-800">{t.referenceNo}</td>
                  <td className="py-2.5 px-3 font-semibold text-gray-900">{t.category}</td>
                  <td className="py-2.5 px-3 text-gray-600">{t.description}</td>
                  <td className="py-2.5 px-3 text-gray-600">{t.paymentMethod}</td>
                  <td className={`py-2.5 px-3 text-right font-extrabold ${t.type === 'income' ? 'text-emerald-700' : 'text-red-600'}`}>
                    {t.type === 'income' ? '+' : '-'} BDT {t.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-sm font-bold text-gray-900">Record New Transaction</h3>
              <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full border rounded-lg p-2 font-bold"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Amount (BDT) *</label>
                  <input
                    type="number"
                    required
                    value={formData.amount}
                    onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full border rounded-lg p-2 font-bold text-blue-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Category Head *</label>
                <input
                  type="text"
                  required
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border rounded-lg p-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 border rounded-lg text-gray-700">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg">
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
