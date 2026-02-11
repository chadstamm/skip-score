import React, { useState, useEffect } from 'react';
import { AssessmentData, MeetingPurpose, MeetingUrgency, RecurrenceFrequency } from '@/lib/types';
import { Users, Coffee, Presentation, Lightbulb, Sparkles, Repeat, AlertTriangle, Zap, Target, ListChecks, PenLine, RotateCcw, Handshake, Link2, Video } from 'lucide-react';
import { useEOS } from '@/contexts/EOSContext';

function detectMeetingPlatform(url: string): 'zoom' | 'teams' | 'meet' | null {
    if (!url) return null;
    const lower = url.toLowerCase();
    if (lower.includes('zoom.us') || lower.includes('zoom.com')) return 'zoom';
    if (lower.includes('teams.microsoft.com') || lower.includes('teams.live.com')) return 'teams';
    if (lower.includes('meet.google.com')) return 'meet';
    return null;
}

const PLATFORM_INFO: Record<string, { name: string; color: string; bg: string }> = {
    zoom: { name: 'Zoom', color: 'text-blue-600', bg: 'bg-blue-500' },
    teams: { name: 'Teams', color: 'text-indigo-600', bg: 'bg-indigo-500' },
    meet: { name: 'Google Meet', color: 'text-emerald-600', bg: 'bg-emerald-500' },
};

interface Step1Props {
    data: Partial<AssessmentData>;
    updateData: (data: Partial<AssessmentData>) => void;
    onNext: () => void;
}

const TEMPLATES = [
    {
        id: 'scratch',
        name: 'From Scratch',
        icon: PenLine,
        color: 'bg-slate-500',
        defaults: {
            title: '',
            purpose: undefined,
            urgency: 'THIS_WEEK' as MeetingUrgency,
            duration: 30,
            interactivity: undefined,
            complexity: undefined,

            hasAgenda: undefined,
        }
    },
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

            hasAgenda: false,
        }
    },
    {
        id: 'retro',
        name: 'Retrospective',
        icon: RotateCcw,
        color: 'bg-indigo-500',
        defaults: {
            title: 'Team Retrospective',
            purpose: 'ALIGN' as MeetingPurpose,
            urgency: 'THIS_WEEK' as MeetingUrgency,
            duration: 60,
            interactivity: 'HIGH' as const,
            complexity: 'MEDIUM' as const,

            hasAgenda: true,
            isRecurring: true,
            recurrenceFrequency: 'BIWEEKLY' as RecurrenceFrequency,
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
    { value: 'DAILY', label: 'Daily', multiplier: 260 },
    { value: 'WEEKLY', label: 'Weekly', multiplier: 52 },
    { value: 'BIWEEKLY', label: 'Bi-weekly', multiplier: 26 },
    { value: 'MONTHLY', label: 'Monthly', multiplier: 12 },
    { value: 'QUARTERLY', label: 'Quarterly', multiplier: 4 },
];

// EOS-specific templates
const EOS_TEMPLATES = [
    {
        id: 'scratch-eos',
        name: 'From Scratch',
        icon: PenLine,
        color: 'bg-neutral-600',
        defaults: {
            title: '',
            purpose: undefined,
            urgency: 'THIS_WEEK' as MeetingUrgency,
            duration: 30,
            interactivity: undefined,
            complexity: undefined,

            hasAgenda: undefined,
        }
    },
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

            hasAgenda: true,
            isRecurring: true,
            recurrenceFrequency: 'QUARTERLY' as RecurrenceFrequency,
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

            hasAgenda: true,
            isRecurring: true,
            recurrenceFrequency: 'WEEKLY' as RecurrenceFrequency,
        }
    },
    {
        id: 'same-page',
        name: 'Same Page',
        icon: Handshake,
        color: 'bg-sky-500',
        defaults: {
            title: 'Same Page Meeting',
            purpose: 'ALIGN' as MeetingPurpose,
            urgency: 'THIS_WEEK' as MeetingUrgency,
            duration: 60,
            interactivity: 'HIGH' as const,
            complexity: 'MEDIUM' as const,

            hasAgenda: true,
        }
    },
];

export default function Step1({ data, updateData }: Step1Props) {
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
    const { eosMode } = useEOS();

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
            <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                    <h2 className={`text-3xl font-bold tracking-tight ${eosMode ? 'text-neutral-100' : 'text-slate-900'}`}>
                        {eosMode ? 'Meeting Check' : 'Meeting Essentials'}
                    </h2>
                    <p className={eosMode ? 'text-neutral-400' : 'text-slate-500'}>
                        {eosMode ? 'Is this meeting necessary? Start here.' : 'Start with a template or build from scratch.'}
                    </p>
                </div>
                <button
                    onClick={() => {
                        const event = new CustomEvent('toggleEOSMode');
                        window.dispatchEvent(event);
                    }}
                    className={`text-xs font-medium whitespace-nowrap px-3 py-1.5 rounded-lg border transition-colors cursor-pointer flex-shrink-0 mt-1 ${
                        eosMode
                            ? 'text-amber-400 border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20'
                            : 'text-teal-600 border-teal-200 bg-teal-50 hover:bg-teal-100'
                    }`}
                >
                    {eosMode ? 'Switch to Standard Mode' : 'Switch to EOS Mode'}
                </button>
            </div>

            {/* Templates */}
            <div className="space-y-3">
                <label className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${eosMode ? 'text-neutral-300' : 'text-slate-700'}`}>
                    {eosMode ? (
                        <>
                            <Zap className="w-4 h-4 text-amber-500" /> EOS Templates
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-4 h-4 text-orange-500" /> Quick Templates
                        </>
                    )}
                </label>
                {eosMode && (
                    <div className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-lg">
                        EOS rhythms are scored on preparedness, not necessity.
                    </div>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 items-stretch">
                    {activeTemplates.map((template) => {
                        const Icon = template.icon;
                        return (
                            <button
                                key={template.id}
                                onClick={() => applyTemplate(template.id)}
                                className={`h-full p-3 rounded-xl border-2 text-center transition-all flex flex-col items-center justify-start cursor-pointer ${
                                    selectedTemplate === template.id
                                        ? eosMode
                                            ? 'border-amber-500 bg-amber-500/10 shadow-sm'
                                            : 'border-score-teal bg-teal-50 shadow-sm'
                                        : eosMode
                                            ? 'border-neutral-700 hover:border-neutral-600 hover:bg-neutral-800'
                                            : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                            >
                                <div className={`w-10 h-10 ${template.color} rounded-xl flex items-center justify-center mb-2 flex-shrink-0`}>
                                    <Icon className="w-5 h-5 text-white" />
                                </div>
                                <div className={`font-semibold text-sm ${eosMode ? 'text-neutral-200' : 'text-slate-800'}`}>{template.name}</div>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="space-y-6">
                <div className="space-y-2">
                    <label className={`text-sm font-bold uppercase tracking-wider ${eosMode ? 'text-neutral-300' : 'text-slate-700'}`}>Meeting Title</label>
                    <input
                        type="text"
                        placeholder="e.g. Q4 Strategy Review"
                        className={`w-full p-4 rounded-xl border-2 focus:outline-none transition-all text-lg font-medium ${
                            eosMode
                                ? 'border-neutral-700 bg-neutral-800 text-neutral-100 placeholder-neutral-500 focus:border-amber-500'
                                : 'border-slate-200 bg-slate-50/50 focus:border-score-teal focus:bg-white'
                        }`}
                        value={data.title}
                        onChange={(e) => {
                            setSelectedTemplate(null);
                            updateData({ title: e.target.value });
                        }}
                    />
                </div>

                {/* Meeting Link */}
                <div className="space-y-2">
                    <label className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${eosMode ? 'text-neutral-300' : 'text-slate-700'}`}>
                        <Link2 className="w-3.5 h-3.5" /> Meeting Link
                        <span className={`font-normal normal-case tracking-normal ${eosMode ? 'text-neutral-500' : 'text-slate-400'}`}>(optional)</span>
                    </label>
                    <div className="relative">
                        <input
                            type="url"
                            placeholder="Paste your Zoom, Teams, or Meet link"
                            className={`w-full p-4 rounded-xl border-2 focus:outline-none transition-all font-medium ${
                                eosMode
                                    ? 'border-neutral-700 bg-neutral-800 text-neutral-100 placeholder-neutral-500 focus:border-amber-500'
                                    : 'border-slate-200 bg-slate-50/50 focus:border-score-teal focus:bg-white'
                            } ${data.meetingPlatform ? 'pr-28' : ''}`}
                            value={data.meetingLink || ''}
                            onChange={(e) => {
                                const link = e.target.value;
                                const platform = detectMeetingPlatform(link);
                                updateData({
                                    meetingLink: link,
                                    meetingPlatform: platform || undefined,
                                });
                            }}
                        />
                        {data.meetingPlatform && (
                            <div className={`absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold text-white ${PLATFORM_INFO[data.meetingPlatform].bg}`}>
                                <div className="w-2 h-2 rounded-full bg-white/40 hidden sm:block" />
                                {PLATFORM_INFO[data.meetingPlatform].name}
                            </div>
                        )}
                    </div>
                    {/* AI Notetaker nudge */}
                    <div className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                        eosMode ? 'bg-neutral-800 border border-neutral-700' : 'bg-slate-50 border border-slate-200'
                    }`}>
                        <Video className={`w-3.5 h-3.5 flex-shrink-0 ${eosMode ? 'text-neutral-500' : 'text-slate-400'}`} />
                        <span className={`text-xs ${eosMode ? 'text-neutral-500' : 'text-slate-400'}`}>
                            Add an AI notetaker
                        </span>
                        <div className="flex gap-2 ml-auto">
                            {[
                                { name: 'Fathom', url: 'https://fathom.video' },
                                { name: 'Fireflies', url: 'https://fireflies.ai/?fpr=chad10' },
                                { name: 'Otter', url: 'https://otter.ai/referrals/VFGFRNBK' },
                            ].map((tool) => (
                                <a
                                    key={tool.name}
                                    href={tool.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`text-xs font-medium transition-colors ${
                                        eosMode
                                            ? 'text-amber-400/70 hover:text-amber-400'
                                            : 'text-score-teal/70 hover:text-score-teal'
                                    }`}
                                >
                                    {tool.name}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className={`text-sm font-bold uppercase tracking-wider ${eosMode ? 'text-neutral-300' : 'text-slate-700'}`}>What's the primary purpose?</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {PURPOSES.map((p) => (
                            <button
                                key={p.value}
                                onClick={() => updateData({ purpose: p.value })}
                                className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                                    data.purpose === p.value
                                        ? eosMode
                                            ? 'border-amber-500 bg-amber-500/10 shadow-sm'
                                            : 'border-score-teal bg-teal-50 shadow-sm'
                                        : eosMode
                                            ? 'border-neutral-700 hover:border-neutral-600'
                                            : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                            >
                                <div className={`font-bold ${eosMode ? 'text-neutral-200' : 'text-slate-800'}`}>{p.label}</div>
                                <div className={`text-xs ${eosMode ? 'text-neutral-500' : 'text-slate-500'}`}>{p.description}</div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className={`text-sm font-bold uppercase tracking-wider ${eosMode ? 'text-neutral-300' : 'text-slate-700'}`}>Urgency</label>
                        <select
                            className={`w-full p-4 rounded-xl border-2 focus:outline-none font-medium ${
                                eosMode
                                    ? 'border-neutral-700 bg-neutral-800 text-neutral-100 focus:border-amber-500'
                                    : 'border-slate-200 bg-slate-50/50 focus:border-score-teal focus:bg-white'
                            }`}
                            value={data.urgency}
                            onChange={(e) => updateData({ urgency: e.target.value as MeetingUrgency })}
                        >
                            {URGENCY.map((u) => (
                                <option key={u.value} value={u.value}>{u.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className={`text-sm font-bold uppercase tracking-wider ${eosMode ? 'text-neutral-300' : 'text-slate-700'}`}>Duration (min)</label>
                        <input
                            type="number"
                            step="15"
                            min="15"
                            className={`w-full p-4 rounded-xl border-2 focus:outline-none font-medium ${
                                eosMode
                                    ? 'border-neutral-700 bg-neutral-800 text-neutral-100 focus:border-amber-500'
                                    : 'border-slate-200 bg-slate-50/50 focus:border-score-teal focus:bg-white'
                            }`}
                            value={data.duration}
                            onChange={(e) => updateData({ duration: parseInt(e.target.value) })}
                        />
                    </div>
                </div>

                {/* Recurring Meeting Toggle */}
                <div className="space-y-3">
                    <div className={`flex items-center justify-between p-4 rounded-xl border-2 ${
                        eosMode ? 'border-neutral-700 bg-neutral-800' : 'border-slate-200 bg-slate-50'
                    }`}>
                        <div className="flex items-center gap-3">
                            <Repeat className={`w-5 h-5 ${eosMode ? 'text-neutral-400' : 'text-slate-500'}`} />
                            <div>
                                <div className={`font-bold ${eosMode ? 'text-neutral-200' : 'text-slate-800'}`}>Recurring Meeting</div>
                                <div className={`text-xs ${eosMode ? 'text-neutral-500' : 'text-slate-500'}`}>Calculate annual time impact</div>
                            </div>
                        </div>
                        <button
                            onClick={() => updateData({ isRecurring: !data.isRecurring, recurrenceFrequency: data.isRecurring ? undefined : 'WEEKLY' })}
                            className={`relative w-14 h-8 rounded-full transition-colors cursor-pointer ${
                                data.isRecurring
                                    ? eosMode ? 'bg-amber-500' : 'bg-score-teal'
                                    : eosMode ? 'bg-neutral-600' : 'bg-slate-300'
                            }`}
                        >
                            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${data.isRecurring ? 'translate-x-7' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    {data.isRecurring && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-3">
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                                {RECURRENCE.map((r) => (
                                    <button
                                        key={r.value}
                                        onClick={() => updateData({ recurrenceFrequency: r.value })}
                                        className={`p-3 rounded-xl border-2 text-center transition-all cursor-pointer ${
                                            data.recurrenceFrequency === r.value
                                                ? eosMode
                                                    ? 'border-amber-500 bg-amber-500/10'
                                                    : 'border-score-teal bg-teal-50'
                                                : eosMode
                                                    ? 'border-neutral-700 hover:border-neutral-600'
                                                    : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className={`font-bold text-sm ${eosMode ? 'text-neutral-200' : 'text-slate-800'}`}>{r.label}</div>
                                        <div className={`text-xs ${eosMode ? 'text-neutral-500' : 'text-slate-500'}`}>{r.multiplier}x/year</div>
                                    </button>
                                ))}
                            </div>

                            {/* Annual Impact Preview */}
                            {data.duration && data.recurrenceFrequency && (
                                <div className={`rounded-xl p-4 ${
                                    eosMode
                                        ? 'bg-amber-500/10 border border-amber-500/20'
                                        : 'bg-orange-50 border border-orange-200'
                                }`}>
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${eosMode ? 'text-amber-500' : 'text-orange-500'}`} />
                                        <div>
                                            <div className={`font-bold text-sm ${eosMode ? 'text-amber-400' : 'text-orange-700'}`}>Annual Time Commitment</div>
                                            <div className={`mt-1 ${eosMode ? 'text-amber-300' : 'text-orange-600'}`}>
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
