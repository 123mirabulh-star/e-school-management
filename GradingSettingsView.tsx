import React, { useState } from 'react';
import {
  Settings2,
  Save,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  Plus,
  Trash2
} from 'lucide-react';
import { AppDatabase, logAuditAction } from '../services/storage';
import { GradingPolicy, GradingBand } from '../types';
import { INITIAL_GRADING_POLICY } from '../data/initialData';

interface GradingSettingsViewProps {
  db: AppDatabase;
  onUpdateDb: (updated: AppDatabase) => void;
}

export const GradingSettingsView: React.FC<GradingSettingsViewProps> = ({
  db,
  onUpdateDb
}) => {
  const [policy, setPolicy] = useState<GradingPolicy>(JSON.parse(JSON.stringify(db.gradingPolicy)));
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleBandChange = (index: number, field: keyof GradingBand, value: any) => {
    const newBands = [...policy.bands];
    newBands[index] = { ...newBands[index], [field]: value };
    setPolicy({ ...policy, bands: newBands });
  };

  const handleSavePolicy = (e: React.FormEvent) => {
    e.preventDefault();
    let updatedDb: AppDatabase = {
      ...db,
      gradingPolicy: policy
    };

    updatedDb = logAuditAction(
      updatedDb,
      'UPDATE_GRADING_POLICY',
      `Updated Grading Scale (${policy.name}, Scale: ${policy.scale}, 4th Subject Deduction: ${policy.optionalSubjectDeduction})`
    );

    onUpdateDb(updatedDb);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleResetDefaults = () => {
    if (confirm('Reset grading policy to Bangladesh Education Board official standard?')) {
      setPolicy(JSON.parse(JSON.stringify(INITIAL_GRADING_POLICY)));
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-purple-600" />
            Grading Policy & Scale Settings
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Secondary & Higher Secondary Education Board 5.0 scale GPA, letter grade intervals, and optional subject rules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 border"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset to Board Standard
          </button>
        </div>
      </div>

      <form onSubmit={handleSavePolicy} className="space-y-5">
        {/* Core Policy Configuration Parameters */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-2xs p-5 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
            Institutional Evaluation Rules
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Grading Policy Name
              </label>
              <input
                type="text"
                value={policy.name}
                onChange={e => setPolicy({ ...policy, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2 font-bold text-blue-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Maximum GPA Scale
              </label>
              <input
                type="number"
                step="0.1"
                value={policy.scale}
                onChange={e => setPolicy({ ...policy, scale: Number(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg p-2 font-bold text-gray-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                4th Subject GP Deduction Base (Standard: 2.0)
              </label>
              <input
                type="number"
                step="0.1"
                value={policy.optionalSubjectDeduction}
                onChange={e => setPolicy({ ...policy, optionalSubjectDeduction: Number(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg p-2 font-bold text-purple-900"
              />
              <span className="text-[10px] text-gray-500 mt-0.5 block">
                Points above this base value are added to the GPA numerator.
              </span>
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-800">
              <input
                type="checkbox"
                checked={policy.mandatoryComponentPassing}
                onChange={e => setPolicy({ ...policy, mandatoryComponentPassing: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span>
                Enforce mandatory separate component passing (CQ and MCQ separate passing requirement)
              </span>
            </label>
          </div>
        </div>

        {/* Grading Bands Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
          <div className="p-3.5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Letter Grade Bands (A+, A, A-, B, C, D, F)
            </span>
            <span className="text-xs text-gray-500">
              Deterministic range matching
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-100 text-gray-700 uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Letter Grade</th>
                  <th className="py-2.5 px-3">Min %</th>
                  <th className="py-2.5 px-3">Max %</th>
                  <th className="py-2.5 px-3 text-center">Grade Point (GP)</th>
                  <th className="py-2.5 px-3">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {policy.bands.map((band, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={band.letterGrade}
                        onChange={e => handleBandChange(idx, 'letterGrade', e.target.value)}
                        className="w-16 border rounded p-1 font-bold text-center"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        value={band.minPercentage}
                        onChange={e => handleBandChange(idx, 'minPercentage', Number(e.target.value))}
                        className="w-20 border rounded p-1 text-center"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        value={band.maxPercentage}
                        onChange={e => handleBandChange(idx, 'maxPercentage', Number(e.target.value))}
                        className="w-20 border rounded p-1 text-center"
                      />
                    </td>
                    <td className="py-2 px-3 text-center">
                      <input
                        type="number"
                        step="0.01"
                        value={band.gradePoint}
                        onChange={e => handleBandChange(idx, 'gradePoint', Number(e.target.value))}
                        className="w-20 border rounded p-1 text-center font-bold text-blue-900"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={band.remarks}
                        onChange={e => handleBandChange(idx, 'remarks', e.target.value)}
                        className="w-full border rounded p-1"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200">
          <div>
            {saveSuccess && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-emerald-300">
                <CheckCircle2 className="w-4 h-4" />
                Grading settings saved! Future calculations will use this policy.
              </span>
            )}
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-6 py-2.5 rounded-lg flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Save Grading Policy
          </button>
        </div>
      </form>
    </div>
  );
};
