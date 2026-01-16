import React from 'react';
import { AssessmentData, InteractivityLevel, ComplexityLevel } from '@/lib/types';
import { Check, X } from 'lucide-react';

interface Step2Props {
    data: Partial<AssessmentData>;
    updateData: (data: Partial<AssessmentData>) => void;
    onNext: () => void;
}

export default function Step2({ data, updateData }: Step2Props) {
    const Toggle = ({ value, label, onToggle }: { value: boolean; label: string; onToggle: (v: boolean) => void }) => (
        <button
            onClick={() => onToggle(!value)}
            className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all w-full ${value ? 'border-score-teal bg-teal-50' : 'border-slate-100'
                }`}
        >
            <span className="font-bold text-slate-700">{label}</span>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${value ? 'bg-score-teal text-white' : 'bg-slate-100 text-slate-400'}`}>
                {value ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
            </div>
        </button>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Meeting Structure</h2>
                <p className="text-slate-500">How will this meeting actually function?</p>
            </div>

            <div className="space-y-6">
                <div className="space-y-4">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Does this meeting require a decision?</label>
                    <div className="flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="decisionRequired"
                                checked={data.decisionRequired === true}
                                onChange={() => updateData({ decisionRequired: true })}
                                className="w-5 h-5 text-score-teal accent-score-teal appearance-none border-2 border-slate-300 rounded-full checked:bg-score-teal checked:border-score-teal"
                            />
                            <span className="font-medium text-slate-700">Yes</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="decisionRequired"
                                checked={data.decisionRequired === false}
                                onChange={() => updateData({ decisionRequired: false })}
                                className="w-5 h-5 text-score-teal accent-score-teal appearance-none border-2 border-slate-300 rounded-full checked:bg-score-teal checked:border-score-teal"
                            />
                            <span className="font-medium text-slate-700">No</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="decisionRequired"
                                checked={data.decisionRequired === undefined}
                                onChange={() => updateData({ decisionRequired: undefined })}
                                className="w-5 h-5 text-score-teal accent-score-teal appearance-none border-2 border-slate-300 rounded-full checked:bg-score-teal checked:border-score-teal"
                            />
                            <span className="font-medium text-slate-400">Unknown</span>
                        </label>
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Is there a clear agenda?</label>
                    <div className="flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="hasAgenda"
                                checked={data.hasAgenda === true}
                                onChange={() => updateData({ hasAgenda: true })}
                                className="w-5 h-5 text-score-teal accent-score-teal appearance-none border-2 border-slate-300 rounded-full checked:bg-score-teal checked:border-score-teal"
                            />
                            <span className="font-medium text-slate-700">Yes</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="hasAgenda"
                                checked={data.hasAgenda === false}
                                onChange={() => updateData({ hasAgenda: false })}
                                className="w-5 h-5 text-score-teal accent-score-teal appearance-none border-2 border-slate-300 rounded-full checked:bg-score-teal checked:border-score-teal"
                            />
                            <span className="font-medium text-slate-700">No</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="hasAgenda"
                                checked={data.hasAgenda === undefined}
                                onChange={() => updateData({ hasAgenda: undefined })}
                                className="w-5 h-5 text-score-teal accent-score-teal appearance-none border-2 border-slate-300 rounded-full checked:bg-score-teal checked:border-score-teal"
                            />
                            <span className="font-medium text-slate-400">Unknown</span>
                        </label>
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Could this be handled asynchronously?</label>
                    <div className="flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="asyncPossible"
                                checked={data.asyncPossible === true}
                                onChange={() => updateData({ asyncPossible: true })}
                                className="w-5 h-5 text-score-teal accent-score-teal appearance-none border-2 border-slate-300 rounded-full checked:bg-score-teal checked:border-score-teal"
                            />
                            <span className="font-medium text-slate-700">Yes</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="asyncPossible"
                                checked={data.asyncPossible === false}
                                onChange={() => updateData({ asyncPossible: false })}
                                className="w-5 h-5 text-score-teal accent-score-teal appearance-none border-2 border-slate-300 rounded-full checked:bg-score-teal checked:border-score-teal"
                            />
                            <span className="font-medium text-slate-700">No</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="asyncPossible"
                                checked={data.asyncPossible === undefined}
                                onChange={() => updateData({ asyncPossible: undefined })}
                                className="w-5 h-5 text-score-teal accent-score-teal appearance-none border-2 border-slate-300 rounded-full checked:bg-score-teal checked:border-score-teal"
                            />
                            <span className="font-medium text-slate-400">Unknown</span>
                        </label>
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Interactivity Level</label>
                    <div className="flex p-1 bg-slate-100 rounded-xl">
                        {(['LOW', 'MEDIUM', 'HIGH'] as InteractivityLevel[]).map((level) => (
                            <button
                                key={level}
                                onClick={() => updateData({ interactivity: level })}
                                className={`flex-1 py-3 rounded-lg font-bold transition-all ${data.interactivity === level ? 'bg-white shadow-sm text-score-teal' : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {level}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Complexity</label>
                    <div className="flex p-1 bg-slate-100 rounded-xl">
                        {(['LOW', 'MEDIUM', 'HIGH'] as ComplexityLevel[]).map((level) => (
                            <button
                                key={level}
                                onClick={() => updateData({ complexity: level })}
                                className={`flex-1 py-3 rounded-lg font-bold transition-all ${data.complexity === level ? 'bg-white shadow-sm text-score-teal' : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {level}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
