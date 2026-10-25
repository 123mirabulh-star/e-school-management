import React, { useState } from 'react';
import {
  Calculator,
  Plus,
  Edit2,
  Trash2,
  Play,
  Save,
  CheckCircle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { MarkConversionRule, ConversionFormulaType } from '../types';
import { AppDatabase, logAuditAction } from '../services/storage';
import { applyConversion } from '../services/resultEngine';

interface MarkConversionViewProps {
  db: AppDatabase;
  onUpdateDb: (updated: AppDatabase) => void;
}

export const MarkConversionView: React.FC<MarkConversionViewProps> = ({
  db,
  onUpdateDb
}) => {
  const [rules, setRules] = useState<MarkConversionRule[]>(db.conversionRules);
  const [editingRule, setEditingRule] = useState<MarkConversionRule | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Live Simulator state
  const [simObtained, setSimObtained] = useState<number>(80);
  const [simOriginalMax, setSimOriginalMax] = useState<number>(100);
  const [simTargetMax, setSimTargetMax] = useState<number>(50);
  const [simRuleId, setSimRuleId] = useState<string>(rules[0]?.id || '');

  // Form state
  const [formData, setFormData] = useState<MarkConversionRule>({
    id: '',
    name: '',
    originalFullMarks: 100,
    targetFullMarks: 50,
    formulaType: 'proportional',
    weight: 1.0,
    precision: 2,
    roundingMethod: 'round',
    customFormula: '',
    description: ''
  });

  const handleOpenCreate = () => {
    setIsCreating(true);
    setEditingRule(null);
    setFormData({
      id: `rule-${Date.now()}`,
      name: '',
      originalFullMarks: 100,
      targetFullMarks: 50,
      formulaType: 'proportional',
      weight: 1.0,
      precision: 2,
      roundingMethod: 'round',
      customFormula: '',
      description: ''
    });
  };

  const handleOpenEdit = (rule: MarkConversionRule) => {
    setEditingRule(rule);
    setIsCreating(false);
    setFormData({ ...rule });
  };

  const handleSaveRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      alert('Please provide a name for this conversion rule.');
      return;
    }

    let updatedRules: MarkConversionRule[];
    if (isCreating) {
      updatedRules = [...rules, formData];
    } else {
      updatedRules = rules.map(r => (r.id === formData.id ? formData : r));
    }

    let updatedDb: AppDatabase = {
      ...db,
      conversionRules: updatedRules
    };

    updatedDb = logAuditAction(
      updatedDb,
      isCreating ? 'CREATE_CONVERSION_RULE' : 'UPDATE_CONVERSION_RULE',
      `${isCreating ? 'Created' : 'Updated'} conversion rule: ${formData.name} (${formData.originalFullMarks} -> ${formData.targetFullMarks})`
    );

    onUpdateDb(updatedDb);
    setRules(updatedRules);
    setIsCreating(false);
    setEditingRule(null);
  };

  const handleDeleteRule = (id: string, name: string) => {
    if (!confirm(`Delete conversion rule "${name}"?`)) return;
    const updated = rules.filter(r => r.id !== id);
    let updatedDb: AppDatabase = { ...db, conversionRules: updated };
    updatedDb = logAuditAction(updatedDb, 'DELETE_CONVERSION_RULE', `Deleted conversion rule ${name}`);
    onUpdateDb(updatedDb);
    setRules(updated);
  };

  // Live simulation calculation
  const selectedSimRule = rules.find(r => r.id === simRuleId);
  const simResult = applyConversion(
    Number(simObtained),
    Number(simOriginalMax),
    Number(simTargetMax),
    selectedSimRule
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-blue-600" />
            Mark Conversion Engine
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Proportional score scaling, continuous assessment formulas, and component weight normalizations.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create Conversion Rule
        </button>
      </div>

      {/* Interactive Simulator Card */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 rounded-2xl shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Play className="w-5 h-5 text-yellow-400" />
            <h4 className="text-sm font-bold tracking-wide">
              Live Interactive Conversion Simulator
            </h4>
          </div>
          <span className="text-[10px] font-mono bg-white/10 text-blue-200 px-2 py-0.5 rounded">
            Mathematical Precision Test
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-gray-300 font-semibold mb-1">
              Test Student Marks Obtained
            </label>
            <input
              type="number"
              value={simObtained}
              onChange={e => setSimObtained(Number(e.target.value))}
              className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-white font-mono font-bold"
            />
          </div>
          <div>
            <label className="block text-gray-300 font-semibold mb-1">
              Original Full Marks
            </label>
            <input
              type="number"
              value={simOriginalMax}
              onChange={e => setSimOriginalMax(Number(e.target.value))}
              className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-white font-mono font-bold"
            />
          </div>
          <div>
            <label className="block text-gray-300 font-semibold mb-1">
              Target Converted Marks
            </label>
            <input
              type="number"
              value={simTargetMax}
              onChange={e => setSimTargetMax(Number(e.target.value))}
              className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-white font-mono font-bold"
            />
          </div>
          <div>
            <label className="block text-gray-300 font-semibold mb-1">
              Applied Formula / Rule
            </label>
            <select
              value={simRuleId}
              onChange={e => setSimRuleId(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-white font-medium"
            >
              {rules.map(r => (
                <option key={r.id} value={r.id} className="text-gray-900">
                  {r.name} ({r.formulaType})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Calculation Output Box */}
        <div className="bg-black/30 border border-white/15 rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-mono text-gray-300">
              Formula: Obtained ({simObtained}) × Target ({selectedSimRule?.targetFullMarks || simTargetMax}) ÷ Original ({selectedSimRule?.originalFullMarks || simOriginalMax})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 font-semibold">Resulting Marks:</span>
            <span className="text-xl font-mono font-extrabold text-yellow-300 bg-yellow-400/20 px-3 py-1 rounded-lg">
              {simResult}
            </span>
            <span className="text-xs text-gray-400">/ {selectedSimRule?.targetFullMarks || simTargetMax}</span>
          </div>
        </div>
      </div>

      {/* Rules List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="p-3.5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
            Configured Conversion Rules ({rules.length})
          </span>
          <span className="text-xs text-gray-500">
            Rules apply automatically during result generation
          </span>
        </div>

        <div className="divide-y divide-gray-100">
          {rules.map(rule => (
            <div key={rule.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/50">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-gray-900">{rule.name}</h4>
                  <span className="text-[10px] font-mono font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded uppercase">
                    {rule.formulaType}
                  </span>
                </div>
                <p className="text-xs text-gray-600">{rule.description}</p>
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-500 font-mono mt-1">
                  <span>Original: {rule.originalFullMarks} Marks</span>
                  <span>•</span>
                  <span>Target: {rule.targetFullMarks} Marks</span>
                  <span>•</span>
                  <span>Rounding: {rule.roundingMethod} (Precision: {rule.precision})</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleOpenEdit(rule)}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                  title="Edit Rule"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteRule(rule.id, rule.name)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                  title="Delete Rule"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add / Edit Rule Modal */}
      {(isCreating || editingRule) && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-sm font-bold text-gray-900">
                {isCreating ? 'Create Conversion Rule' : `Edit: ${formData.name}`}
              </h3>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setEditingRule(null);
                }}
                className="text-gray-400 hover:text-gray-700 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRule} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Rule Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Terminal Exam 100 to 80%"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Original Full Marks
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.originalFullMarks}
                    onChange={e => setFormData({ ...formData, originalFullMarks: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg p-2 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Target Full Marks
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.targetFullMarks}
                    onChange={e => setFormData({ ...formData, targetFullMarks: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg p-2 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Formula Type
                  </label>
                  <select
                    value={formData.formulaType}
                    onChange={e => setFormData({ ...formData, formulaType: e.target.value as ConversionFormulaType })}
                    className="w-full border border-gray-300 rounded-lg p-2"
                  >
                    <option value="proportional">Proportional</option>
                    <option value="weighted">Weighted Multiplier</option>
                    <option value="custom">Safe Custom Formula</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Rounding Method
                  </label>
                  <select
                    value={formData.roundingMethod}
                    onChange={e => setFormData({ ...formData, roundingMethod: e.target.value as any })}
                    className="w-full border border-gray-300 rounded-lg p-2"
                  >
                    <option value="round">Standard Round</option>
                    <option value="floor">Floor (Round Down)</option>
                    <option value="ceil">Ceil (Round Up)</option>
                  </select>
                </div>
              </div>

              {formData.formulaType === 'custom' && (
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Custom Formula (Safe math with "obtained", "original", "target")
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. (obtained * 0.5) + 5"
                    value={formData.customFormula || ''}
                    onChange={e => setFormData({ ...formData, customFormula: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2 font-mono"
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Description / Documentation
                </label>
                <textarea
                  rows={2}
                  placeholder="Explain when and where this conversion rule applies..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingRule(null);
                  }}
                  className="px-4 py-2 border rounded-lg text-gray-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-sm"
                >
                  Save Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
