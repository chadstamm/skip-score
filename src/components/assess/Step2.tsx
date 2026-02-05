import React from 'react';
import { AssessmentData, InteractivityLevel, ComplexityLevel } from '@/lib/types';
import { Check, X } from 'lucide-react';
import { useEOS } from '@/contexts/EOSContext';

interface Step2Props {
    data: Partial<AssessmentData>;
    updateData: (data: Partial<AssessmentData>) => void;
    onNext: () => void;
}

export default function Step2({ data, updateData }: Step2Props) {
    const { eosMode } = useEOS();

    const Toggle = ({ value, label, onToggle }: { value: boolean; label: string; onToggle: (v: boolean) => void }) => (
        <button
            onClick={() => onToggle(!value)}
            className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all w-full cursor-pointer ${
                value
                    ? eosMode ? 'border-amber-500 bg-amber-500/10' : 'border-score-teal bg-teal-50'
                    : eosMode ? 'border-neutral-700' : 'border-slate-100'
            }`}
        >
            <span className={`font-bold ${eosMode ? 'text-neutral-200' : 'text-slate-700'}`}>{label}</span>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                value
                    ? eosMode ? 'bg-amber-500 text-black' : 'bg-score-teal text-white'
                    : eosMode ? 'bg-neutral-700 text-neutral-400' : 'bg-slate-100 text-slate-400'
            }`}>
                {value ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
            </div>
        </button>
    );

    const radioClasses = eosMode
        ? 'w-5 h-5 accent-amber-500 appearance-none border-2 border-neutral-600 rounded-full checked:bg-amber-500 checked:border-amber-500'
        : 'w-5 h-5 text-score-teal accent-score-teal appearance-none border-2 border-slate-300 rounded-full checked:bg-score-teal checked:border-score-teal';

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
                <h2 className={`text-3xl font-bold tracking-tight ${eosMode ? 'text-neutral-100' : 'text-slate-900'}`}>
                    {eosMode ? 'Meeting Details' : 'Meeting Structure'}
                </h2>
                <p className={eosMode ? 'text-neutral-400' : 'text-slate-500'}>
                    {eosMode ? 'Does this belong on the Issues List instead?' : 'How will this meeting actually function?'}
                </p>
            </div>

            <div className="space-y-6">
                <div className="space-y-4">
                    <label className={`text-sm font-bold uppercase tracking-wider ${eosMode ? 'text-neutral-300' : 'text-slate-700'}`}>
                        {eosMode ? 'Is there a decision to be made (IDS)?' : 'Does this meeting require a decision?'}
                    </label>
                    <div className="flex flex-wrap gap-4 sm:gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="decisionRequired"
                                checked={data.decisionRequired === true}
                                onChange={() => updateData({ decisionRequired: true })}
                                className={radioClasses}
                            />
                            <span className={`font-medium ${eosMode ? 'text-neutral-200' : 'text-slate-700'}`}>Yes</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="decisionRequired"
                                checked={data.decisionRequired === false}
                                onChange={() => updateData({ decisionRequired: false })}
                                className={radioClasses}
                            />
                            <span className={`font-medium ${eosMode ? 'text-neutral-200' : 'text-slate-700'}`}>No</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="decisionRequired"
                                checked={data.decisionRequired === undefined}
                                onChange={() => updateData({ decisionRequired: undefined })}
                                className={radioClasses}
                            />
                            <span className={`font-medium ${eosMode ? 'text-neutral-500' : 'text-slate-400'}`}>Unknown</span>
                        </label>
                    </div>
                </div>

                <div className="space-y-4">
                    <label className={`text-sm font-bold uppercase tracking-wider ${eosMode ? 'text-neutral-300' : 'text-slate-700'}`}>
                        {eosMode ? 'Could this be an email, Slack, or To-Do?' : 'Could this be handled asynchronously?'}
                    </label>
                    <div className="flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="asyncPossible"
                                checked={data.asyncPossible === true}
                                onChange={() => updateData({ asyncPossible: true })}
                                className={radioClasses}
                            />
                            <span className={`font-medium ${eosMode ? 'text-neutral-200' : 'text-slate-700'}`}>Yes</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="asyncPossible"
                                checked={data.asyncPossible === false}
                                onChange={() => updateData({ asyncPossible: false })}
                                className={radioClasses}
                            />
                            <span className={`font-medium ${eosMode ? 'text-neutral-200' : 'text-slate-700'}`}>No</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="asyncPossible"
                                checked={data.asyncPossible === undefined}
                                onChange={() => updateData({ asyncPossible: undefined })}
                                className={radioClasses}
                            />
                            <span className={`font-medium ${eosMode ? 'text-neutral-500' : 'text-slate-400'}`}>Unknown</span>
                        </label>
                    </div>
                </div>

                <div className="space-y-4">
                    <label className={`text-sm font-bold uppercase tracking-wider ${eosMode ? 'text-neutral-300' : 'text-slate-700'}`}>Interactivity Level</label>
                    <div className={`flex p-1 rounded-xl ${eosMode ? 'bg-neutral-800' : 'bg-slate-100'}`}>
                        {(['LOW', 'MEDIUM', 'HIGH'] as InteractivityLevel[]).map((level) => (
                            <button
                                key={level}
                                onClick={() => updateData({ interactivity: level })}
                                className={`flex-1 py-3 rounded-lg font-bold transition-all cursor-pointer ${
                                    data.interactivity === level
                                        ? eosMode
                                            ? 'bg-neutral-700 shadow-sm text-amber-500'
                                            : 'bg-white shadow-sm text-score-teal'
                                        : eosMode
                                            ? 'text-neutral-500 hover:text-neutral-300'
                                            : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                {level}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <label className={`text-sm font-bold uppercase tracking-wider ${eosMode ? 'text-neutral-300' : 'text-slate-700'}`}>Complexity</label>
                    <div className={`flex p-1 rounded-xl ${eosMode ? 'bg-neutral-800' : 'bg-slate-100'}`}>
                        {(['LOW', 'MEDIUM', 'HIGH'] as ComplexityLevel[]).map((level) => (
                            <button
                                key={level}
                                onClick={() => updateData({ complexity: level })}
                                className={`flex-1 py-3 rounded-lg font-bold transition-all cursor-pointer ${
                                    data.complexity === level
                                        ? eosMode
                                            ? 'bg-neutral-700 shadow-sm text-amber-500'
                                            : 'bg-white shadow-sm text-score-teal'
                                        : eosMode
                                            ? 'text-neutral-500 hover:text-neutral-300'
                                            : 'text-slate-500 hover:text-slate-700'
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
