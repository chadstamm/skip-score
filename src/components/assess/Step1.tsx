import React from 'react';
import { AssessmentData, MeetingPurpose, MeetingUrgency } from '@/lib/types';

interface Step1Props {
    data: Partial<AssessmentData>;
    updateData: (data: Partial<AssessmentData>) => void;
    onNext: () => void;
}

const PURPOSES: { value: MeetingPurpose; label: string; description: string }[] = [
    { value: 'INFO_SHARE', label: 'Info Share', description: 'Briefing or status update' },
    { value: 'DECIDE', label: 'Decide', description: 'Need a definitive call' },
    { value: 'BRAINSTORM', label: 'Brainstorm', description: 'Creative problem solving' },
    { value: 'ALIGN', label: 'Align', description: 'Getting everyone on the same page' },
];

const URGENCY: { value: MeetingUrgency; label: string }[] = [
    { value: 'TODAY', label: 'Today' },
    { value: 'THIS_WEEK', label: 'This Week' },
    { value: 'FLEXIBLE', label: 'Flexible / Next Week' },
];

export default function Step1({ data, updateData }: Step1Props) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Meeting Essentials</h2>
                <p className="text-slate-500">Let's start with the basics of what you're planning.</p>
            </div>

            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Meeting Title</label>
                    <input
                        type="text"
                        placeholder="e.g. Q4 Strategy Review"
                        className="w-full p-4 rounded-xl border-2 border-slate-100 focus:border-score-teal focus:outline-none transition-all text-lg font-medium"
                        value={data.title}
                        onChange={(e) => updateData({ title: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">What's the primary purpose?</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {PURPOSES.map((p) => (
                            <button
                                key={p.value}
                                onClick={() => updateData({ purpose: p.value })}
                                className={`p-4 rounded-xl border-2 text-left transition-all ${data.purpose === p.value
                                        ? 'border-score-teal bg-teal-50 shadow-sm'
                                        : 'border-slate-100 hover:border-slate-200'
                                    }`}
                            >
                                <div className="font-bold text-slate-800">{p.label}</div>
                                <div className="text-xs text-slate-500">{p.description}</div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Urgency</label>
                        <select
                            className="w-full p-4 rounded-xl border-2 border-slate-100 focus:border-score-teal focus:outline-none bg-white font-medium"
                            value={data.urgency}
                            onChange={(e) => updateData({ urgency: e.target.value as MeetingUrgency })}
                        >
                            {URGENCY.map((u) => (
                                <option key={u.value} value={u.value}>{u.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Duration (min)</label>
                        <input
                            type="number"
                            step="15"
                            min="15"
                            className="w-full p-4 rounded-xl border-2 border-slate-100 focus:border-score-teal focus:outline-none font-medium"
                            value={data.duration}
                            onChange={(e) => updateData({ duration: parseInt(e.target.value) })}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
