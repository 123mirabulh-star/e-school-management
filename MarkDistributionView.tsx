import React, { useState } from 'react';
import {
  Sliders,
  Check,
  AlertTriangle,
  Plus,
  Trash2,
  Copy,
  BookOpen,
  Save,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { AppDatabase, logAuditAction } from '../services/storage';
import { Subject, AssessmentComponent, ComponentTypeCode } from '../types';

interface MarkDistributionViewProps {
  db: AppDatabase;
  onUpdateDb: (updated: AppDatabase) => void;
}

export const MarkDistributionView: React.FC<MarkDistributionViewProps> = ({
  db,
  onUpdateDb
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(db.classes[0]?.id || 'c10');
  const classSubjects = db.subjects.filter(s => s.classId === selectedClassId);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(classSubjects[0]?.id || '');

  const currentSubject = db.subjects.find(s => s.id === selectedSubjectId) || classSubjects[0];
  const [components, setComponents] = useState<AssessmentComponent[]>(
    currentSubject ? JSON.parse(JSON.stringify(currentSubject.components)) : []
  );
  const [subjectFullMarks, setSubjectFullMarks] = useState<number>(currentSubject?.fullMarks || 100);
  const [subjectPassMarks, setSubjectPassMarks] = useState<number>(currentSubject?.passMarks || 33);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSelectSubject = (subId: string) => {
    setSelectedSubjectId(subId);
    const sub = db.subjects.find(s => s.id === subId);
    if (sub) {
      setComponents(JSON.parse(JSON.stringify(sub.components)));
      setSubjectFullMarks(sub.fullMarks);
      setSubjectPassMarks(sub.passMarks);
      setSavedSuccess(false);
    }
  };

  const handleAddComponent = () => {
    const newCmp: AssessmentComponent = {
      id: `cmp-dist-${Date.now()}`,
      name: 'Class Test / CA',
      code: 'CT',
      maxMarks: 20,
      passMarks: 7,
      weight: 1.0,
      contributesToFinal: true,
      ordering: components.length + 1
    };
    setComponents([...components, newCmp]);
  };

  const handleRemoveComponent = (id: string) => {
    setComponents(components.filter(c => c.id !== id));
  };

  const applyPreset = (presetType: 'standard_100' | 'science_100' | 'split_50_50') => {
    if (presetType === 'standard_100') {
      setSubjectFullMarks(100);
      setSubjectPassMarks(33);
      setComponents([
        { id: `cmp-cq-${Date.now()}`, name: 'Creative/CQ', code: 'CQ', maxMarks: 70, passMarks: 23, weight: 1, contributesToFinal: true, ordering: 1 },
        { id: `cmp-mcq-${Date.now()}`, name: 'MCQ', code: 'MCQ', maxMarks: 30, passMarks: 10, weight: 1, contributesToFinal: true, ordering: 2 }
      ]);
    } else if (presetType === 'science_100') {
      setSubjectFullMarks(100);
      setSubjectPassMarks(33);
      setComponents([
        { id: `cmp-cq-${Date.now()}`, name: 'Written/CQ', code: 'CQ', maxMarks: 50, passMarks: 17, weight: 1, contributesToFinal: true, ordering: 1 },
        { id: `cmp-mcq-${Date.now()}`, name: 'MCQ', code: 'MCQ', maxMarks: 25, passMarks: 8, weight: 1, contributesToFinal: true, ordering: 2 },
        { id: `cmp-pr-${Date.now()}`, name: 'Practical', code: 'PR', maxMarks: 25, passMarks: 8, weight: 1, contributesToFinal: true, ordering: 3 }
      ]);
    } else if (presetType === 'split_50_50') {
      setSubjectFullMarks(100);
      setSubjectPassMarks(33);
      setComponents([
        { id: `cmp-p1-${Date.now()}`, name: 'Paper 1', code: 'CQ', maxMarks: 50, passMarks: 17, weight: 1, contributesToFinal: true, ordering: 1 },
        { id: `cmp-p2-${Date.now()}`, name: 'Paper 2', code: 'CQ', maxMarks: 50, passMarks: 17, weight: 1, contributesToFinal: true, ordering: 2 }
      ]);
    }
  };

  const currentTotal = components.reduce((sum, c) => sum + (c.contributesToFinal ? Number(c.maxMarks || 0) : 0), 0);
  const isValid = currentTotal === Number(subjectFullMarks);

  const handleSaveDistribution = () => {
    if (!currentSubject) return;

    if (!isValid) {
      if (!confirm(`Warning: The sum of component marks (${currentTotal}) does not match Subject Full Marks (${subjectFullMarks}). Update Subject Full Marks to ${currentTotal}?`)) {
        return;
      }
    }

    const finalFullMarks = isValid ? subjectFullMarks : currentTotal;

    const updatedSubjects = db.subjects.map(s => {
      if (s.id === currentSubject.id) {
        return {
          ...s,
          fullMarks: finalFullMarks,
          passMarks: subjectPassMarks,
          components: components
        };
      }
      return s;
    });

    let updatedDb: AppDatabase = {
      ...db,
      subjects: updatedSubjects
    };

    updatedDb = logAuditAction(
      updatedDb,
      'UPDATE_MARK_DISTRIBUTION',
      `Configured mark distribution for ${currentSubject.nameEn} (Components: ${components.map(c => `${c.code}:${c.maxMarks}`).join(', ')}, Total: ${finalFullMarks})`
    );

    onUpdateDb(updatedDb);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-5">
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-600" />
            Mark Distribution Management
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure full marks, pass marks, and component weights for Creative (CQ), MCQ, Practical, and Class Tests.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedClassId}
            onChange={e => {
              setSelectedClassId(e.target.value);
              const firstSub = db.subjects.find(s => s.classId === e.target.value);
              if (firstSub) handleSelectSubject(firstSub.id);
            }}
            className="text-xs font-semibold bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-800"
          >
            {db.classes.map(c => (
              <option key={c.id} value={c.id}>
                {c.nameEn}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-xl border border-gray-200 shadow-2xs p-3">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 px-2">
            Subjects in Selected Class ({classSubjects.length})
          </div>
          <div className="space-y-1">
            {classSubjects.map(sub => {
              const isSelected = (currentSubject?.id === sub.id);
              return (
                <button
                  key={sub.id}
                  onClick={() => handleSelectSubject(sub.id)}
                  className={`w-full text-left p-2.5 rounded-lg text-xs transition-colors flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-bold shadow-xs'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="truncate">{sub.nameEn}</div>
                    <div className="text-[10px] text-gray-400 font-mono">Code: {sub.code}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
                      {sub.fullMarks}M
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          {currentSubject ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-2xs p-5 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded">
                      Code: {currentSubject.code}
                    </span>
                    <h4 className="text-base font-extrabold text-gray-900">
                      {currentSubject.nameEn}
                    </h4>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Type: {currentSubject.subjectType.toUpperCase()}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-gray-500 font-semibold mr-1">Presets:</span>
                  <button
                    type="button"
                    onClick={() => applyPreset('standard_100')}
                    className="text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-800 px-2.5 py-1 rounded border font-semibold cursor-pointer"
                  >
                    CQ 70 + MCQ 30
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('science_100')}
                    className="text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-800 px-2.5 py-1 rounded border font-semibold cursor-pointer"
                  >
                    CQ 50 + MCQ 25 + PR 25
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('split_50_50')}
                    className="text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-800 px-2.5 py-1 rounded border font-semibold cursor-pointer"
                  >
                    P1 50 + P2 50
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Subject Target Full Marks
                  </label>
                  <input
                    type="number"
                    value={subjectFullMarks}
                    onChange={e => setSubjectFullMarks(Number(e.target.value))}
                    className="w-full bg-white border border-gray-300 rounded-lg p-2 text-sm font-bold text-blue-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Subject Pass Marks
                  </label>
                  <input
                    type="number"
                    value={subjectPassMarks}
                    onChange={e => setSubjectPassMarks(Number(e.target.value))}
                    className="w-full bg-white border border-gray-300 rounded-lg p-2 text-sm font-bold text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Sum of Active Components
                  </label>
                  <div className={`p-2 rounded-lg font-bold text-sm border flex items-center justify-between ${
                    isValid ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-red-50 text-red-800 border-red-300'
                  }`}>
                    <span>{currentTotal} Marks</span>
                    <span className="text-xs font-normal">
                      {isValid ? 'Matches Full Marks' : 'Inconsistent Total'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold uppercase text-gray-700 tracking-wider">
                    Assessment Component Breakdown
                  </h5>
                  <button
                    type="button"
                    onClick={handleAddComponent}
                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 border border-indigo-200 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Custom Component Row
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border border-gray-200 rounded-lg overflow-hidden">
                    <thead className="bg-gray-100 text-gray-600 uppercase font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">Component Name</th>
                        <th className="py-2.5 px-3">Code</th>
                        <th className="py-2.5 px-3 text-center">Max Marks</th>
                        <th className="py-2.5 px-3 text-center">Pass Marks</th>
                        <th className="py-2.5 px-3 text-center">Final Contribution?</th>
                        <th className="py-2.5 px-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {components.map((cmp, idx) => (
                        <tr key={cmp.id} className="hover:bg-gray-50">
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={cmp.name}
                              onChange={e => {
                                const copy = [...components];
                                copy[idx].name = e.target.value;
                                setComponents(copy);
                              }}
                              className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <select
                              value={cmp.code}
                              onChange={e => {
                                const copy = [...components];
                                copy[idx].code = e.target.value as ComponentTypeCode;
                                setComponents(copy);
                              }}
                              className="border border-gray-300 rounded px-2 py-1 text-xs font-mono font-bold"
                            >
                              <option value="CQ">CQ (Creative)</option>
                              <option value="MCQ">MCQ</option>
                              <option value="PR">PR (Practical)</option>
                              <option value="CT">CT (Class Test)</option>
                              <option value="OR">OR (Oral)</option>
                              <option value="AS">AS (Assignment)</option>
                            </select>
                          </td>
                          <td className="py-2 px-3 text-center">
                            <input
                              type="number"
                              min="0"
                              value={cmp.maxMarks}
                              onChange={e => {
                                const copy = [...components];
                                copy[idx].maxMarks = Number(e.target.value);
                                setComponents(copy);
                              }}
                              className="w-16 border border-gray-300 rounded px-2 py-1 text-center font-bold text-gray-900"
                            />
                          </td>
                          <td className="py-2 px-3 text-center">
                            <input
                              type="number"
                              min="0"
                              value={cmp.passMarks}
                              onChange={e => {
                                const copy = [...components];
                                copy[idx].passMarks = Number(e.target.value);
                                setComponents(copy);
                              }}
                              className="w-16 border border-gray-300 rounded px-2 py-1 text-center font-semibold text-gray-700"
                            />
                          </td>
                          <td className="py-2 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={cmp.contributesToFinal}
                              onChange={e => {
                                const copy = [...components];
                                copy[idx].contributesToFinal = e.target.checked;
                                setComponents(copy);
                              }}
                              className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                            />
                          </td>
                          <td className="py-2 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveComponent(cmp.id)}
                              className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                              title="Delete component"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-gray-200">
                <div>
                  {savedSuccess && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Mark distribution saved and validated successfully!
                    </span>
                  )}
                  {!isValid && (
                    <span className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      Sum of component marks ({currentTotal}) does not match subject full marks ({subjectFullMarks}).
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveDistribution}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-6 py-2.5 rounded-lg shadow-sm flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Save & Apply Distribution
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
              Select a subject to view and configure its mark distribution.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
