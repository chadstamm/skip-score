import React, { useState, useEffect } from 'react';
import { AssessmentData, MeetingPurpose, MeetingUrgency, RecurrenceFrequency } from '@/lib/types';
import { Users, Coffee, Presentation, Lightbulb, Sparkles, Repeat, AlertTriangle, Zap, Target, ListChecks } from 'lucide-react';

interface Step1Props {
    data: Partial<AssessmentData>;
    updateData: (data: Partial<AssessmentData>) => void;
    onNext: () => void;
}

const TEMPLATES = [
    {
        id: 'standup',
        name: 'Daily Standup',
        icon: Coffee,
        color: 'bg-blue-500',
        defaults: {
            title: 'Daily Standup',
            purpose: 'INFO_SHARE' as MeetingPurpose,
            urgency: 'TODAY' as MeetingUrgency,
            duration: 15,
            interactivity: 'LOW' as const,
            complexity: 'LOW' as const,
            asyncPossible: true,
            hasAgenda: true,
        }
    },
    {
        id: '1on1',
        name: '1:1 Meeting',
        icon: Users,
        color: 'bg-teal-500',
        defaults: {
            title: '1:1 Sync',
            purpose: 'ALIGN' as MeetingPurpose,
            urgency: 'THIS_WEEK' as MeetingUrgency,
            duration: 30,
            interactivity: 'HIGH' as const,
            complexity: 'MEDIUM' as const,
            asyncPossible: false,
            hasAgenda: true,
        }
    },
    {
        id: 'allhands',
        name: 'All-Hands',
        icon: Presentation,
        color: 'bg-orange-500',
        defaults: {
            title: 'Team All-Hands',
            purpose: 'INFO_SHARE' as MeetingPurpose,
            urgency: 'THIS_WEEK' as MeetingUrgency,
            duration: 60,
            interactivity: 'LOW' as const,
            complexity: 'LOW' as const,
            asyncPossible: true,
            hasAgenda: true,
        }
    },
    {
        id: 'brainstorm',
        name: 'Brainstorm',
        icon: Lightbulb,
        color: 'bg-purple-500',
        defaults: {
            title: 'Brainstorming Session',
            purpose: 'BRAINSTORM' as MeetingPurpose,
            urgency: 'THIS_WEEK' as MeetingUrgency,
            duration: 45,
            interactivity: 'HIGH' as const,
            complexity: 'HIGH' as const,
            asyncPossible: false,
            hasAgenda: false,
        }
    },
];

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

const RECURRENCE: { value: RecurrenceFrequency; label: string; multiplier: number }[] = [
    { value: 'WEEKLY', label: 'Weekly', multiplier: 52 },
    { value: 'BIWEEKLY', label: 'Bi-weekly', multiplier: 26 },
    { value: 'MONTHLY', label: 'Monthly', multiplier: 12 },
];

// EOS-specific templates
const EOS_TEMPLATES = [
    {
        id: 'l10',
        name: 'L10 Meeting',
        icon: Target,
        color: 'bg-purple-500',
        defaults: {
            title: 'Weekly L10 Meeting',
            purpose: 'DECIDE' as MeetingPurpose,
            urgency: 'THIS_WEEK' as MeetingUrgency,
            duration: 90,
            interactivity: 'HIGH' as const,
            complexity: 'HIGH' as const,
            asyncPossible: false,
            hasAgenda: true,
            isRecurring: true,
            recurrenceFrequency: 'WEEKLY' as RecurrenceFrequency,
        }
    },
    {
        id: 'quarterly',
        name: 'Quarterly Planning',
        icon: Zap,
        color: 'bg-amber-500',
        defaults: {
            title: 'Quarterly Planning Session',
            purpose: 'DECIDE' as MeetingPurpose,
            urgency: 'THIS_WEEK' as MeetingUrgency,
            duration: 480,
            interactivity: 'HIGH' as const,
            complexity: 'HIGH' as const,
            asyncPossible: false,
            hasAgenda: true,
        }
    },
    {
        id: 'ids',
        name: 'IDS Session',
        icon: ListChecks,
        color: 'bg-rose-500',
        defaults: {
            title: 'IDS: Issues Discussion',
            purpose: 'DECIDE' as MeetingPurpose,
            urgency: 'THIS_WEEK' as MeetingUrgency,
            duration: 60,
            interactivity: 'HIGH' as const,
            complexity: 'HIGH' as const,
            asyncPossible: false,
            hasAgenda: true,
            decisionRequired: true,
        }
    },
    {
        id: '1on1-eos',
        name: '1:1 Check-in',
        icon: Users,
        color: 'bg-teal-500',
        defaults: {
            title: '1:1 Check-in',
            purpose: 'ALIGN' as MeetingPurpose,
            urgency: 'THIS_WEEK' as MeetingUrgency,
            duration: 30,
            interactivity: 'HIGH' as const,
            complexity: 'MEDIUM' as const,
            asyncPossible: false,
            hasAgenda: true,
            isRecurring: true,
            recurrenceFrequency: 'WEEKLY' as RecurrenceFrequency,
        }
    },
];

export default function Step1({ data, updateData }: Step1Props) {
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
    const [eosMode, setEosMode] = useState(false);

    useEffect(() => {
        const eos = localStorage.getItem('skip-score-eos-mode') === 'true';
        setEosMode(eos);
    }, []);

    const activeTemplates = eosMode ? EOS_TEMPLATES : TEMPLATES;

    const applyTemplate = (templateId: string) => {
        const template = activeTemplates.find(t => t.id === templateId);
        if (template) {
            setSelectedTemplate(templateId);
            updateData(template.defaults);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Meeting Essentials</h2>
                <p className="text-slate-500">Start with a template or build from scratch.</p>
            </div>

            {/* Templates */}
            <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    {eosMode ? (
                        <>
                            <Zap className="w-4 h-4 text-purple-500" /> EOS Templates
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-4 h-4 text-orange-500" /> Quick Templates
                        </>
                    )}
                </label>
                {eosMode && (
                    <div className="text-xs text-purple-600 bg-purple-50 px-3 py-2 rounded-lg">
                        L10 and IDS meetings are protected. Other meetings may be flagged for the Issues List.
                    </div>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {activeTemplates.map((template) => {
                        const Icon = template.icon;
                        return (
                            <button
                                key={template.id}
                                onClick={() => applyTemplate(template.id)}
                                className={`p-3 rounded-xl border-2 text-center transition-all ${selectedTemplate === template.id
                                    ? eosMode ? 'border-purple-500 bg-purple-50 shadow-sm' : 'border-score-teal bg-teal-50 shadow-sm'
                                    : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                                    }`}
                            >
                                <div className={`w-10 h-10 ${template.color} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                                    <Icon className="w-5 h-5 text-white" />
                                </div>
                                <div className="font-semibold text-slate-800 text-sm">{template.name}</div>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Meeting Title</label>
                    <input
                        type="text"
                        placeholder="e.g. Q4 Strategy Review"
                        className="w-full p-4 rounded-xl border-2 border-slate-100 focus:border-score-teal focus:outline-none transition-all text-lg font-medium"
                        value={data.title}
                        onChange={(e) => {
                            setSelectedTemplate(null);
                            updateData({ title: e.target.value });
                        }}
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

                {/* Recurring Meeting Toggle */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 rounded-xl border-2 border-slate-100 bg-slate-50">
                        <div className="flex items-center gap-3">
                            <Repeat className="w-5 h-5 text-slate-500" />
                            <div>
                                <div className="font-bold text-slate-800">Recurring Meeting</div>
                                <div className="text-xs text-slate-500">Calculate annual time impact</div>
                            </div>
                        </div>
                        <button
                            onClick={() => updateData({ isRecurring: !data.isRecurring, recurrenceFrequency: data.isRecurring ? undefined : 'WEEKLY' })}
                            className={`relative w-14 h-8 rounded-full transition-colors ${data.isRecurring ? 'bg-score-teal' : 'bg-slate-300'}`}
                        >
                            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${data.isRecurring ? 'translate-x-7' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    {data.isRecurring && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-3">
                            <div className="grid grid-cols-3 gap-2">
                                {RECURRENCE.map((r) => (
                                    <button
                                        key={r.value}
                                        onClick={() => updateData({ recurrenceFrequency: r.value })}
                                        className={`p-3 rounded-xl border-2 text-center transition-all ${data.recurrenceFrequency === r.value
                                            ? 'border-score-teal bg-teal-50'
                                            : 'border-slate-100 hover:border-slate-200'
                                            }`}
                                    >
                                        <div className="font-bold text-slate-800 text-sm">{r.label}</div>
                                        <div className="text-xs text-slate-500">{r.multiplier}x/year</div>
                                    </button>
                                ))}
                            </div>

                            {/* Annual Impact Preview */}
                            {data.duration && data.recurrenceFrequency && (
                                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <div className="font-bold text-orange-700 text-sm">Annual Time Commitment</div>
                                            <div className="text-orange-600 mt-1">
                                                {(() => {
                                                    const freq = RECURRENCE.find(r => r.value === data.recurrenceFrequency);
                                                    const annualMinutes = (data.duration || 30) * (freq?.multiplier || 52);
                                                    const annualHours = annualMinutes / 60;
                                                    const attendeeCount = (data.attendees?.length || 1);
                                                    const totalPersonHours = annualHours * attendeeCount;
                                                    return (
                                                        <>
                                                            <span className="text-2xl font-black">{annualHours.toFixed(0)}</span>
                                                            <span className="text-sm"> hours/year</span>
                                                            {attendeeCount > 1 && (
                                                                <span className="text-sm"> ({totalPersonHours.toFixed(0)} person-hours with {attendeeCount} attendees)</span>
                                                            )}
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
