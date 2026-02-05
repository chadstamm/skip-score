import React, { useState, useMemo } from 'react';
import { AssessmentData, AgendaItem, MeetingPurpose } from '@/lib/types';
import { useEOS } from '@/contexts/EOSContext';
import {
    FileText,
    Plus,
    Trash2,
    GripVertical,
    Clock,
    ClipboardCheck,
    SkipForward,
    Copy,
    Download,
    Mail,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    ArrowRight,
} from 'lucide-react';
import { generateAgendaPDF } from '@/lib/agendaPdf';

interface AgendaStepProps {
    data: Partial<AssessmentData>;
    updateData: (data: Partial<AssessmentData>) => void;
    onNext: () => void;
}

// Default sections by purpose (standard mode)
const STANDARD_SECTIONS: Record<MeetingPurpose, { title: string; pct: number }[]> = {
    INFO_SHARE: [
        { title: 'Welcome & Overview', pct: 10 },
        { title: 'Updates / Presentations', pct: 50 },
        { title: 'Key Takeaways', pct: 15 },
        { title: 'Q&A', pct: 15 },
        { title: 'Action Items', pct: 10 },
    ],
    DECIDE: [
        { title: 'Context & Background', pct: 15 },
        { title: 'Options Review', pct: 25 },
        { title: 'Discussion', pct: 30 },
        { title: 'Decision', pct: 20 },
        { title: 'Next Steps & Owners', pct: 10 },
    ],
    BRAINSTORM: [
        { title: 'Problem Statement', pct: 10 },
        { title: 'Ideation / Free Discussion', pct: 45 },
        { title: 'Group & Prioritize', pct: 25 },
        { title: 'Select Top Ideas', pct: 10 },
        { title: 'Action Items', pct: 10 },
    ],
    ALIGN: [
        { title: 'Current State Review', pct: 20 },
        { title: 'Goals & Objectives', pct: 20 },
        { title: 'Discussion & Alignment', pct: 30 },
        { title: 'Commitments', pct: 20 },
        { title: 'Follow-up Plan', pct: 10 },
    ],
};

// EOS templates
const EOS_AGENDAS: Record<string, { title: string; duration: number }[]> = {
    l10: [
        { title: 'Segue (Good News)', duration: 5 },
        { title: 'Scorecard Review', duration: 5 },
        { title: 'Rock Review', duration: 5 },
        { title: 'Customer/Employee Headlines', duration: 5 },
        { title: 'To-Do List Review', duration: 5 },
        { title: 'IDS (Identify, Discuss, Solve)', duration: 60 },
        { title: 'Conclude', duration: 5 },
    ],
    quarterly: [
        { title: 'Prior Quarter Review', duration: 60 },
        { title: 'V/TO Review', duration: 30 },
        { title: 'Rock Setting', duration: 90 },
        { title: 'IDS', duration: 60 },
        { title: 'Next Steps & Action Items', duration: 30 },
    ],
    ids: [
        { title: 'Identify Issues', duration: 10 },
        { title: 'Discuss Top Issue', duration: 30 },
        { title: 'Solve & Document', duration: 15 },
        { title: 'Wrap-up & To-Dos', duration: 5 },
    ],
    default: [
        { title: 'Check-in / Segue', duration: 5 },
        { title: 'Review & Updates', duration: 10 },
        { title: 'Discussion / IDS', duration: 0 }, // will be calculated
        { title: 'Wrap-up & To-Dos', duration: 5 },
    ],
};

function detectEOSType(title: string): string {
    const t = title?.toLowerCase() || '';
    if (t.includes('l10') || t.includes('level 10')) return 'l10';
    if (t.includes('quarterly') || t.includes('annual')) return 'quarterly';
    if (t.includes('ids') || t.includes('issue')) return 'ids';
    return 'default';
}

export default function AgendaStep({ data, updateData, onNext }: AgendaStepProps) {
    const { eosMode } = useEOS();
    const [mode, setMode] = useState<'choose' | 'build'>('choose');
    const [items, setItems] = useState<AgendaItem[]>([]);
    const [copied, setCopied] = useState(false);
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
    const [sectionChecks, setSectionChecks] = useState<Record<string, boolean>>({});

    // Detect which sections to suggest
    const suggestedSections = useMemo(() => {
        if (eosMode) {
            const type = detectEOSType(data.title || '');
            const template = EOS_AGENDAS[type];
            return template.map(s => {
                let dur = s.duration;
                // For 'default' template, fill in the discussion time
                if (s.duration === 0 && type === 'default') {
                    dur = Math.max(10, (data.duration || 30) - 20);
                }
                return { title: s.title, duration: dur };
            });
        } else {
            const purpose = data.purpose || 'INFO_SHARE';
            const sections = STANDARD_SECTIONS[purpose];
            return sections.map(s => ({
                title: s.title,
                duration: Math.max(5, Math.round(((data.duration || 30) * s.pct) / 100)),
            }));
        }
    }, [eosMode, data.title, data.purpose, data.duration]);

    const startBuild = () => {
        // Initialize items from suggested sections
        const initial: AgendaItem[] = suggestedSections.map(s => ({
            id: crypto.randomUUID(),
            title: s.title,
            duration: s.duration,
        }));
        setItems(initial);
        // All checked by default
        const checks: Record<string, boolean> = {};
        initial.forEach(item => { checks[item.id] = true; });
        setSectionChecks(checks);
        setMode('build');
    };

    const handleAlreadyHaveOne = () => {
        updateData({ hasAgenda: true, agendaItems: [] });
        onNext();
    };

    const handleSkip = () => {
        updateData({ hasAgenda: false, agendaItems: [] });
        onNext();
    };

    const handleDone = () => {
        const activeItems = items.filter(item => sectionChecks[item.id] !== false);
        updateData({ hasAgenda: true, agendaItems: activeItems });
        onNext();
    };

    const addItem = () => {
        const newItem: AgendaItem = {
            id: crypto.randomUUID(),
            title: 'New Section',
            duration: 5,
        };
        setItems([...items, newItem]);
        setSectionChecks(prev => ({ ...prev, [newItem.id]: true }));
    };

    const removeItem = (id: string) => {
        setItems(items.filter(i => i.id !== id));
        setSectionChecks(prev => {
            const next = { ...prev };
            delete next[id];
            return next;
        });
    };

    const updateItem = (id: string, field: keyof AgendaItem, value: string | number) => {
        setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
    };

    const toggleSection = (id: string) => {
        setSectionChecks(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const toggleExpanded = (id: string) => {
        setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const activeItems = items.filter(item => sectionChecks[item.id] !== false);
    const totalAllocated = activeItems.reduce((sum, item) => sum + item.duration, 0);
    const meetingDuration = data.duration || 30;
    const timeRemaining = meetingDuration - totalAllocated;

    const agendaAsText = () => {
        const lines = [`AGENDA: ${data.title || 'Meeting'}\n`, `Duration: ${meetingDuration} min\n`, '---\n'];
        let runningTime = 0;
        activeItems.forEach(item => {
            lines.push(`${runningTime} - ${runningTime + item.duration} min: ${item.title}`);
            if (item.notes) lines.push(`  Notes: ${item.notes}`);
            runningTime += item.duration;
        });
        return lines.join('\n');
    };

    const copyAgenda = () => {
        navigator.clipboard.writeText(agendaAsText());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const downloadPDF = () => {
        generateAgendaPDF(data.title || 'Meeting', meetingDuration, activeItems);
    };

    const emailAgenda = () => {
        const subject = encodeURIComponent(`Agenda: ${data.title || 'Meeting'}`);
        const body = encodeURIComponent(agendaAsText());
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    };

    // Choose mode - initial screen
    if (mode === 'choose') {
        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-2">
                    <h2 className={`text-3xl font-bold tracking-tight ${eosMode ? 'text-neutral-100' : 'text-slate-900'}`}>
                        {eosMode ? 'Meeting Agenda' : 'Build Your Agenda'}
                    </h2>
                    <p className={eosMode ? 'text-neutral-400' : 'text-slate-500'}>
                        {eosMode
                            ? 'A structured agenda keeps your meeting on track and on time.'
                            : 'Meetings with agendas are more focused and score higher. Create one now or skip.'}
                    </p>
                </div>

                <div className="space-y-3">
                    {/* Build an Agenda */}
                    <button
                        onClick={startBuild}
                        className={`w-full p-5 rounded-2xl border-2 text-left transition-all cursor-pointer group ${
                            eosMode
                                ? 'border-amber-500/50 bg-amber-500/5 hover:bg-amber-500/10'
                                : 'border-score-teal/50 bg-teal-50/50 hover:bg-teal-50'
                        }`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${eosMode ? 'bg-amber-500/20' : 'bg-teal-100'}`}>
                                <FileText className={`w-6 h-6 ${eosMode ? 'text-amber-400' : 'text-score-teal'}`} />
                            </div>
                            <div className="flex-1">
                                <div className={`font-bold text-lg ${eosMode ? 'text-neutral-100' : 'text-slate-900'}`}>
                                    Build an Agenda
                                </div>
                                <div className={`text-sm ${eosMode ? 'text-neutral-400' : 'text-slate-500'}`}>
                                    {eosMode
                                        ? `We'll start with a ${detectEOSType(data.title || '') === 'l10' ? 'L10' : detectEOSType(data.title || '') === 'quarterly' ? 'Quarterly' : detectEOSType(data.title || '') === 'ids' ? 'IDS' : 'standard EOS'} template you can customize`
                                        : `We'll suggest sections based on your ${data.purpose === 'DECIDE' ? 'decision' : data.purpose === 'BRAINSTORM' ? 'brainstorm' : data.purpose === 'ALIGN' ? 'alignment' : 'info sharing'} meeting`}
                                </div>
                            </div>
                        </div>
                    </button>

                    {/* I Already Have One */}
                    <button
                        onClick={handleAlreadyHaveOne}
                        className={`w-full p-5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                            eosMode
                                ? 'border-neutral-700 hover:border-neutral-600 hover:bg-neutral-800/50'
                                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${eosMode ? 'bg-neutral-700' : 'bg-slate-100'}`}>
                                <ClipboardCheck className={`w-6 h-6 ${eosMode ? 'text-neutral-300' : 'text-slate-600'}`} />
                            </div>
                            <div className="flex-1">
                                <div className={`font-bold text-lg ${eosMode ? 'text-neutral-200' : 'text-slate-800'}`}>
                                    I Already Have an Agenda
                                </div>
                                <div className={`text-sm ${eosMode ? 'text-neutral-500' : 'text-slate-500'}`}>
                                    Great! You&apos;re already prepared.
                                </div>
                            </div>
                        </div>
                    </button>

                    {/* Skip */}
                    <button
                        onClick={handleSkip}
                        className={`w-full p-4 rounded-2xl border-2 border-dashed text-center transition-all cursor-pointer ${
                            eosMode
                                ? 'border-neutral-700 text-neutral-500 hover:border-neutral-600 hover:text-neutral-400'
                                : 'border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-500'
                        }`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <SkipForward className="w-4 h-4" />
                            <span className="font-medium">Skip for Now</span>
                        </div>
                    </button>
                </div>
            </div>
        );
    }

    // Build mode - agenda builder
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
                <h2 className={`text-3xl font-bold tracking-tight ${eosMode ? 'text-neutral-100' : 'text-slate-900'}`}>
                    {eosMode ? 'Customize Your Agenda' : 'Your Meeting Agenda'}
                </h2>
                <p className={eosMode ? 'text-neutral-400' : 'text-slate-500'}>
                    Toggle sections on/off and adjust times. Click a section to add notes.
                </p>
            </div>

            {/* Time Bar */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <div className={`flex items-center gap-2 text-sm font-bold ${eosMode ? 'text-neutral-300' : 'text-slate-700'}`}>
                        <Clock className="w-4 h-4" />
                        {totalAllocated} / {meetingDuration} min allocated
                    </div>
                    {timeRemaining !== 0 && (
                        <span className={`text-xs font-bold ${
                            timeRemaining > 0
                                ? eosMode ? 'text-amber-400' : 'text-blue-500'
                                : 'text-red-500'
                        }`}>
                            {timeRemaining > 0 ? `${timeRemaining} min unallocated` : `${Math.abs(timeRemaining)} min over`}
                        </span>
                    )}
                </div>
                <div className={`h-2 rounded-full overflow-hidden ${eosMode ? 'bg-neutral-700' : 'bg-slate-100'}`}>
                    <div
                        className={`h-full rounded-full transition-all ${
                            totalAllocated > meetingDuration
                                ? 'bg-red-500'
                                : totalAllocated === meetingDuration
                                    ? eosMode ? 'bg-amber-500' : 'bg-score-teal'
                                    : eosMode ? 'bg-amber-500/60' : 'bg-teal-300'
                        }`}
                        style={{ width: `${Math.min(100, (totalAllocated / meetingDuration) * 100)}%` }}
                    />
                </div>
            </div>

            {/* Agenda Items */}
            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1 scrollbar-hide">
                {items.map((item) => {
                    const isChecked = sectionChecks[item.id] !== false;
                    const isExpanded = expandedSections[item.id];
                    return (
                        <div key={item.id} className={`rounded-xl border-2 transition-all ${
                            isChecked
                                ? eosMode
                                    ? 'border-neutral-700 bg-neutral-800'
                                    : 'border-slate-100 bg-white'
                                : eosMode
                                    ? 'border-neutral-800 bg-neutral-800/30 opacity-50'
                                    : 'border-slate-100 bg-slate-50/50 opacity-50'
                        }`}>
                            <div className="flex items-center gap-2 p-3">
                                {/* Checkbox */}
                                <button
                                    onClick={() => toggleSection(item.id)}
                                    className="cursor-pointer flex-shrink-0"
                                >
                                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center text-xs transition-all ${
                                        isChecked
                                            ? eosMode
                                                ? 'border-amber-500 bg-amber-500 text-black'
                                                : 'border-score-teal bg-score-teal text-white'
                                            : eosMode
                                                ? 'border-neutral-600'
                                                : 'border-slate-300'
                                    }`}>
                                        {isChecked && '✓'}
                                    </div>
                                </button>

                                {/* Drag handle */}
                                <GripVertical className={`w-4 h-4 flex-shrink-0 ${eosMode ? 'text-neutral-600' : 'text-slate-300'}`} />

                                {/* Title */}
                                <input
                                    type="text"
                                    value={item.title}
                                    onChange={(e) => updateItem(item.id, 'title', e.target.value)}
                                    className={`flex-1 font-medium bg-transparent focus:outline-none min-w-0 ${
                                        eosMode ? 'text-neutral-200' : 'text-slate-800'
                                    }`}
                                />

                                {/* Duration */}
                                <div className="flex items-center gap-1 flex-shrink-0">
                                    <input
                                        type="number"
                                        value={item.duration}
                                        onChange={(e) => updateItem(item.id, 'duration', Math.max(1, parseInt(e.target.value) || 1))}
                                        className={`w-12 text-center text-sm font-bold rounded-lg p-1 ${
                                            eosMode
                                                ? 'bg-neutral-700 text-amber-400 border border-neutral-600'
                                                : 'bg-slate-50 text-score-teal border border-slate-200'
                                        } focus:outline-none`}
                                        min="1"
                                    />
                                    <span className={`text-xs ${eosMode ? 'text-neutral-500' : 'text-slate-400'}`}>min</span>
                                </div>

                                {/* Expand / Notes toggle */}
                                <button
                                    onClick={() => toggleExpanded(item.id)}
                                    className={`p-1 rounded-lg cursor-pointer ${
                                        eosMode ? 'text-neutral-500 hover:text-neutral-300' : 'text-slate-400 hover:text-slate-600'
                                    }`}
                                >
                                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>

                                {/* Remove */}
                                <button
                                    onClick={() => removeItem(item.id)}
                                    className={`p-1 rounded-lg cursor-pointer ${
                                        eosMode
                                            ? 'text-neutral-600 hover:text-red-400'
                                            : 'text-slate-300 hover:text-red-500'
                                    }`}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Notes (expanded) */}
                            {isExpanded && (
                                <div className={`px-3 pb-3 pt-0 border-t ${eosMode ? 'border-neutral-700' : 'border-slate-100'}`}>
                                    <textarea
                                        placeholder="Add notes for this section..."
                                        value={item.notes || ''}
                                        onChange={(e) => updateItem(item.id, 'notes', e.target.value)}
                                        rows={2}
                                        className={`w-full mt-2 p-2 text-sm rounded-lg border focus:outline-none resize-none ${
                                            eosMode
                                                ? 'bg-neutral-900 border-neutral-700 text-neutral-300 placeholder-neutral-600 focus:border-amber-500'
                                                : 'bg-slate-50 border-slate-200 text-slate-700 placeholder-slate-400 focus:border-score-teal'
                                        }`}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Add Section */}
                <button
                    onClick={addItem}
                    className={`w-full p-3 rounded-xl border-2 border-dashed text-center transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        eosMode
                            ? 'border-neutral-700 text-neutral-500 hover:border-neutral-600 hover:text-neutral-400'
                            : 'border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-500'
                    }`}
                >
                    <Plus className="w-4 h-4" />
                    <span className="font-medium text-sm">Add Section</span>
                </button>
            </div>

            {/* Export Bar */}
            <div className={`flex items-center gap-2 p-3 rounded-xl border ${
                eosMode ? 'bg-neutral-800 border-neutral-700' : 'bg-slate-50 border-slate-100'
            }`}>
                <span className={`text-xs font-bold uppercase tracking-wider mr-auto ${eosMode ? 'text-neutral-500' : 'text-slate-400'}`}>
                    Export
                </span>
                <button
                    onClick={copyAgenda}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        eosMode
                            ? 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                >
                    {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                    onClick={downloadPDF}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        eosMode
                            ? 'bg-amber-500 text-black hover:bg-amber-400'
                            : 'bg-skip-coral text-white hover:bg-orange-600'
                    }`}
                >
                    <Download className="w-3.5 h-3.5" />
                    PDF
                </button>
                <button
                    onClick={emailAgenda}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        eosMode
                            ? 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                >
                    <Mail className="w-3.5 h-3.5" />
                    Email
                </button>
            </div>

            {/* Save & Continue */}
            <button
                onClick={handleDone}
                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    eosMode
                        ? 'bg-amber-500 text-black hover:bg-amber-400'
                        : 'bg-skip-coral text-white hover:bg-orange-600'
                }`}
            >
                Save & Continue <ArrowRight className="w-4 h-4" />
            </button>
        </div>
    );
}
