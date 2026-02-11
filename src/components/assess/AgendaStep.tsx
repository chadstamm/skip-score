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
    ArrowLeft,
    Calendar,
    Bookmark,
    History,
    Save,
} from 'lucide-react';
import { generateAgendaPDF } from '@/lib/agendaPdf';

interface AgendaStepProps {
    data: Partial<AssessmentData>;
    updateData: (data: Partial<AssessmentData>) => void;
    onNext: () => void;
}

interface AgendaTemplate {
    id: string;
    name: string;
    items: { title: string; duration: number; notes?: string }[];
    createdAt: string;
}

const TEMPLATES_KEY = 'skip-score-agenda-templates';

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

// EOS templates — based on the Traction/EOS standard formats
const EOS_AGENDAS: Record<string, { title: string; duration: number }[]> = {
    l10: [
        { title: 'Segue', duration: 5 },
        { title: 'Scorecard', duration: 5 },
        { title: 'Rock Review', duration: 5 },
        { title: 'Customer & Employee Headlines', duration: 5 },
        { title: 'To-Do List', duration: 5 },
        { title: 'IDS', duration: 60 },
        { title: 'Conclude', duration: 5 },
    ],
    quarterly: [
        { title: 'Segue', duration: 15 },
        { title: 'Prior Quarter Review', duration: 60 },
        { title: 'Review V/TO', duration: 60 },
        { title: 'Establish Next Quarter Rocks', duration: 120 },
        { title: 'Tackle Key Issues (IDS)', duration: 120 },
        { title: 'Next Steps', duration: 30 },
        { title: 'Conclude & Rate', duration: 15 },
    ],
    ids: [
        { title: 'List & Prioritize Issues', duration: 5 },
        { title: 'IDS (Identify, Discuss, Solve)', duration: 50 },
        { title: 'Recap To-Dos', duration: 5 },
    ],
    default: [
        { title: 'Segue', duration: 5 },
        { title: 'Review & Updates', duration: 10 },
        { title: 'IDS', duration: 0 }, // will be calculated
        { title: 'Conclude', duration: 5 },
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
    const [mode, setMode] = useState<'choose' | 'templates' | 'past' | 'build' | 'detail' | 'review'>('choose');
    const [items, setItems] = useState<AgendaItem[]>([]);
    const [copied, setCopied] = useState(false);
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
    const [sectionChecks, setSectionChecks] = useState<Record<string, boolean>>({});
    const [showSaveTemplate, setShowSaveTemplate] = useState(false);
    const [templateName, setTemplateName] = useState('');
    const [savedNotice, setSavedNotice] = useState(false);

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

    // --- Template functions ---
    const getSavedTemplates = (): AgendaTemplate[] => {
        try {
            return JSON.parse(localStorage.getItem(TEMPLATES_KEY) || '[]');
        } catch { return []; }
    };

    const saveAsTemplate = () => {
        if (!templateName.trim()) return;
        const template: AgendaTemplate = {
            id: crypto.randomUUID(),
            name: templateName.trim(),
            items: activeItems.map(item => ({
                title: item.title,
                duration: item.duration,
                notes: item.notes,
            })),
            createdAt: new Date().toISOString(),
        };
        const existing = getSavedTemplates();
        localStorage.setItem(TEMPLATES_KEY, JSON.stringify([template, ...existing]));
        setShowSaveTemplate(false);
        setTemplateName('');
        setSavedNotice(true);
        setTimeout(() => setSavedNotice(false), 2000);
    };

    const deleteTemplate = (id: string) => {
        const existing = getSavedTemplates();
        localStorage.setItem(TEMPLATES_KEY, JSON.stringify(existing.filter(t => t.id !== id)));
    };

    const loadTemplate = (template: AgendaTemplate) => {
        const loaded: AgendaItem[] = template.items.map(item => ({
            id: crypto.randomUUID(),
            title: item.title,
            duration: item.duration,
            notes: item.notes,
        }));
        setItems(loaded);
        const checks: Record<string, boolean> = {};
        loaded.forEach(item => { checks[item.id] = true; });
        setSectionChecks(checks);
        setMode('build');
    };

    // --- Past agenda functions ---
    const getPastAgendas = (): AssessmentData[] => {
        try {
            const history: AssessmentData[] = JSON.parse(localStorage.getItem('skip-score-history') || '[]');
            return history.filter(h => h.agendaItems && h.agendaItems.length > 0);
        } catch { return []; }
    };

    const loadPastAgenda = (assessment: AssessmentData) => {
        const loaded: AgendaItem[] = (assessment.agendaItems || []).map(item => ({
            id: crypto.randomUUID(),
            title: item.title,
            duration: item.duration,
            notes: item.notes,
        }));
        setItems(loaded);
        const checks: Record<string, boolean> = {};
        loaded.forEach(item => { checks[item.id] = true; });
        setSectionChecks(checks);
        setMode('build');
    };

    // --- Build helpers ---
    const startBuild = () => {
        const initial: AgendaItem[] = suggestedSections.map(s => ({
            id: crypto.randomUUID(),
            title: s.title,
            duration: 0,
        }));
        setItems(initial);
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
        const active = items.filter(item => sectionChecks[item.id] !== false);
        updateData({ hasAgenda: true, agendaItems: active });
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

    // --- Export helpers ---
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

    const generateICS = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0);
        const end = new Date(tomorrow.getTime() + meetingDuration * 60 * 1000);

        const pad = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

        const description = activeItems.map((item, i) =>
            `${i + 1}. ${item.title} (${item.duration} min)${item.notes ? '\\n   ' + item.notes : ''}`
        ).join('\\n');

        const ics = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//SkipScore//EN',
            'BEGIN:VEVENT',
            `DTSTART:${pad(tomorrow)}`,
            `DTEND:${pad(end)}`,
            `SUMMARY:${data.title || 'Meeting'}`,
            `DESCRIPTION:${description}`,
            'END:VEVENT',
            'END:VCALENDAR',
        ].join('\r\n');

        const blob = new Blob([ics], { type: 'text/calendar' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const safeTitle = (data.title || 'meeting').replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '-').toLowerCase();
        a.download = `${safeTitle}.ics`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const openGoogleCalendar = () => {
        const title = encodeURIComponent(data.title || 'Meeting');
        const description = encodeURIComponent(
            activeItems.map((item, i) =>
                `${i + 1}. ${item.title} (${item.duration} min)${item.notes ? '\n   ' + item.notes : ''}`
            ).join('\n')
        );

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0);
        const end = new Date(tomorrow.getTime() + meetingDuration * 60 * 1000);

        const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
        const dates = `${fmt(tomorrow)}/${fmt(end)}`;

        window.open(
            `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${description}&dates=${dates}`,
            '_blank'
        );
    };

    // ========== TEMPLATES MODE ==========
    if (mode === 'templates') {
        const templates = getSavedTemplates();
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-2">
                    <button
                        onClick={() => setMode('choose')}
                        className={`flex items-center gap-1 text-sm font-bold transition-colors cursor-pointer ${
                            eosMode ? 'text-neutral-400 hover:text-neutral-200' : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <h2 className={`text-3xl font-bold tracking-tight ${eosMode ? 'text-neutral-100' : 'text-slate-900'}`}>
                        Saved Templates
                    </h2>
                    <p className={eosMode ? 'text-neutral-400' : 'text-slate-500'}>
                        Load a previously saved agenda template.
                    </p>
                </div>

                {templates.length === 0 ? (
                    <div className={`text-center py-12 rounded-2xl border-2 border-dashed ${
                        eosMode ? 'border-neutral-700 text-neutral-500' : 'border-slate-200 text-slate-400'
                    }`}>
                        <Bookmark className="w-10 h-10 mx-auto mb-3 opacity-40" />
                        <p className="font-medium">No saved templates yet</p>
                        <p className="text-sm mt-1">Build an agenda and save it as a template to reuse later.</p>
                    </div>
                ) : (
                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 scrollbar-hide">
                        {templates.map(template => (
                            <div
                                key={template.id}
                                className={`group p-4 rounded-2xl border-2 transition-all ${
                                    eosMode
                                        ? 'border-neutral-700 hover:border-amber-500/50 bg-neutral-800 hover:bg-neutral-800/80'
                                        : 'border-slate-100 hover:border-score-teal/50 bg-white hover:bg-teal-50/30'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => loadTemplate(template)}
                                        className="flex-1 text-left cursor-pointer"
                                    >
                                        <div className={`font-bold ${eosMode ? 'text-neutral-100' : 'text-slate-800'}`}>
                                            {template.name}
                                        </div>
                                        <div className={`text-sm mt-0.5 ${eosMode ? 'text-neutral-400' : 'text-slate-500'}`}>
                                            {template.items.length} sections &middot; {template.items.reduce((s, i) => s + i.duration, 0)} min &middot; {new Date(template.createdAt).toLocaleDateString()}
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => {
                                            deleteTemplate(template.id);
                                            // Force re-render by toggling mode
                                            setMode('choose');
                                            setTimeout(() => setMode('templates'), 0);
                                        }}
                                        className={`p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer ${
                                            eosMode
                                                ? 'text-neutral-600 hover:text-red-400 hover:bg-neutral-700'
                                                : 'text-slate-300 hover:text-red-500 hover:bg-red-50'
                                        }`}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // ========== PAST AGENDAS MODE ==========
    if (mode === 'past') {
        const pastAgendas = getPastAgendas();
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-2">
                    <button
                        onClick={() => setMode('choose')}
                        className={`flex items-center gap-1 text-sm font-bold transition-colors cursor-pointer ${
                            eosMode ? 'text-neutral-400 hover:text-neutral-200' : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <h2 className={`text-3xl font-bold tracking-tight ${eosMode ? 'text-neutral-100' : 'text-slate-900'}`}>
                        Reuse Past Agenda
                    </h2>
                    <p className={eosMode ? 'text-neutral-400' : 'text-slate-500'}>
                        Load an agenda from a previous meeting assessment.
                    </p>
                </div>

                {pastAgendas.length === 0 ? (
                    <div className={`text-center py-12 rounded-2xl border-2 border-dashed ${
                        eosMode ? 'border-neutral-700 text-neutral-500' : 'border-slate-200 text-slate-400'
                    }`}>
                        <History className="w-10 h-10 mx-auto mb-3 opacity-40" />
                        <p className="font-medium">No past agendas found</p>
                        <p className="text-sm mt-1">Agendas from previous assessments will appear here.</p>
                    </div>
                ) : (
                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 scrollbar-hide">
                        {pastAgendas.map(assessment => (
                            <button
                                key={assessment.id}
                                onClick={() => loadPastAgenda(assessment)}
                                className={`w-full p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                                    eosMode
                                        ? 'border-neutral-700 hover:border-amber-500/50 bg-neutral-800 hover:bg-neutral-800/80'
                                        : 'border-slate-100 hover:border-score-teal/50 bg-white hover:bg-teal-50/30'
                                }`}
                            >
                                <div className={`font-bold ${eosMode ? 'text-neutral-100' : 'text-slate-800'}`}>
                                    {assessment.title}
                                </div>
                                <div className={`text-sm mt-0.5 ${eosMode ? 'text-neutral-400' : 'text-slate-500'}`}>
                                    {assessment.agendaItems!.length} sections &middot; {assessment.duration} min &middot; {new Date(assessment.createdAt).toLocaleDateString()}
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // ========== CHOOSE MODE ==========
    if (mode === 'choose') {
        const savedTemplates = getSavedTemplates();
        const pastAgendas = getPastAgendas();

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

                    {/* From Saved Template */}
                    {savedTemplates.length > 0 && (
                        <button
                            onClick={() => setMode('templates')}
                            className={`w-full p-5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                                eosMode
                                    ? 'border-neutral-700 hover:border-amber-500/30 hover:bg-neutral-800/50'
                                    : 'border-slate-200 hover:border-score-teal/30 hover:bg-slate-50'
                            }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${eosMode ? 'bg-neutral-700' : 'bg-blue-50'}`}>
                                    <Bookmark className={`w-6 h-6 ${eosMode ? 'text-amber-400' : 'text-blue-500'}`} />
                                </div>
                                <div className="flex-1">
                                    <div className={`font-bold text-lg ${eosMode ? 'text-neutral-200' : 'text-slate-800'}`}>
                                        From Saved Template
                                    </div>
                                    <div className={`text-sm ${eosMode ? 'text-neutral-500' : 'text-slate-500'}`}>
                                        {savedTemplates.length} template{savedTemplates.length !== 1 ? 's' : ''} saved
                                    </div>
                                </div>
                                <ArrowRight className={`w-5 h-5 ${eosMode ? 'text-neutral-600' : 'text-slate-300'}`} />
                            </div>
                        </button>
                    )}

                    {/* Reuse Past Agenda */}
                    {pastAgendas.length > 0 && (
                        <button
                            onClick={() => setMode('past')}
                            className={`w-full p-5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                                eosMode
                                    ? 'border-neutral-700 hover:border-amber-500/30 hover:bg-neutral-800/50'
                                    : 'border-slate-200 hover:border-score-teal/30 hover:bg-slate-50'
                            }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${eosMode ? 'bg-neutral-700' : 'bg-purple-50'}`}>
                                    <History className={`w-6 h-6 ${eosMode ? 'text-amber-400' : 'text-purple-500'}`} />
                                </div>
                                <div className="flex-1">
                                    <div className={`font-bold text-lg ${eosMode ? 'text-neutral-200' : 'text-slate-800'}`}>
                                        Reuse Past Agenda
                                    </div>
                                    <div className={`text-sm ${eosMode ? 'text-neutral-500' : 'text-slate-500'}`}>
                                        {pastAgendas.length} past meeting{pastAgendas.length !== 1 ? 's' : ''} with agendas
                                    </div>
                                </div>
                                <ArrowRight className={`w-5 h-5 ${eosMode ? 'text-neutral-600' : 'text-slate-300'}`} />
                            </div>
                        </button>
                    )}

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

    // ========== BUILD MODE ==========
    if (mode === 'build') {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-2">
                    <button
                        onClick={() => setMode('choose')}
                        className={`flex items-center gap-1 text-sm font-bold transition-colors cursor-pointer ${
                            eosMode ? 'text-neutral-400 hover:text-neutral-200' : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <h2 className={`text-3xl font-bold tracking-tight ${eosMode ? 'text-neutral-100' : 'text-slate-900'}`}>
                        {eosMode ? 'Customize Your Agenda' : 'Structure Your Agenda'}
                    </h2>
                    <p className={eosMode ? 'text-neutral-400' : 'text-slate-500'}>
                        Allocate your {meetingDuration} minutes across the sections below.
                    </p>
                </div>

                {/* Add or Remove Sections Callout */}
                {totalAllocated === 0 && (
                    <div className={`p-4 rounded-xl border-2 border-dashed flex items-center gap-3 ${
                        eosMode
                            ? 'border-amber-500/40 bg-amber-500/5'
                            : 'border-score-teal/40 bg-teal-50/50'
                    }`}>
                        <Clock className={`w-6 h-6 flex-shrink-0 ${eosMode ? 'text-amber-400' : 'text-score-teal'}`} />
                        <div>
                            <div className={`font-bold text-sm ${eosMode ? 'text-amber-400' : 'text-score-teal'}`}>
                                Add or remove sections
                            </div>
                            <div className={`text-xs mt-0.5 ${eosMode ? 'text-neutral-400' : 'text-slate-500'}`}>
                                Check or uncheck to customize your agenda, then set the duration for each section.
                            </div>
                        </div>
                    </div>
                )}

                {/* Time Bar */}
                {totalAllocated > 0 && (
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
                                    {timeRemaining > 0 ? `${timeRemaining} min remaining` : `${Math.abs(timeRemaining)} min over`}
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
                )}

                {/* Agenda Items */}
                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1 scrollbar-hide">
                    {items.map((item) => {
                        const isChecked = sectionChecks[item.id] !== false;
                        return (
                            <div key={item.id} className={`rounded-xl border-2 transition-all ${
                                isChecked
                                    ? eosMode
                                        ? 'border-neutral-700 bg-neutral-800'
                                        : 'border-slate-200 bg-white'
                                    : eosMode
                                        ? 'border-neutral-800 bg-neutral-800/30 opacity-50'
                                        : 'border-slate-200 bg-slate-50/50 opacity-50'
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
                                            onChange={(e) => updateItem(item.id, 'duration', Math.max(0, parseInt(e.target.value) || 0))}
                                            className={`w-12 text-center text-sm font-bold rounded-lg p-1 ${
                                                eosMode
                                                    ? 'bg-neutral-700 text-amber-400 border border-neutral-600'
                                                    : 'bg-slate-50 text-score-teal border border-slate-200'
                                            } focus:outline-none`}
                                            min="0"
                                        />
                                        <span className={`text-xs ${eosMode ? 'text-neutral-500' : 'text-slate-400'}`}>min</span>
                                    </div>

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

                {/* Next: Add Details */}
                <button
                    onClick={() => {
                        // Expand all sections for detail mode
                        const expanded: Record<string, boolean> = {};
                        activeItems.forEach(item => { expanded[item.id] = true; });
                        setExpandedSections(expanded);
                        setMode('detail');
                    }}
                    disabled={activeItems.length === 0}
                    className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 ${
                        eosMode
                            ? 'bg-amber-500 text-black hover:bg-amber-400'
                            : 'bg-skip-coral text-white hover:bg-orange-600'
                    }`}
                >
                    Next: Add Details <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        );
    }

    // ========== DETAIL MODE ==========
    if (mode === 'detail') {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-2">
                    <button
                        onClick={() => setMode('build')}
                        className={`flex items-center gap-1 text-sm font-bold transition-colors cursor-pointer ${
                            eosMode ? 'text-neutral-400 hover:text-neutral-200' : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Structure
                    </button>
                    <h2 className={`text-3xl font-bold tracking-tight ${eosMode ? 'text-neutral-100' : 'text-slate-900'}`}>
                        Add Details
                    </h2>
                    <p className={eosMode ? 'text-neutral-400' : 'text-slate-500'}>
                        Add talking points, notes, or context to each section of your agenda.
                    </p>
                </div>

                {/* Time summary */}
                <div className={`flex items-center gap-2 text-sm font-bold ${eosMode ? 'text-neutral-300' : 'text-slate-700'}`}>
                    <Clock className="w-4 h-4" />
                    {totalAllocated} / {meetingDuration} min allocated
                    {timeRemaining !== 0 && (
                        <span className={`text-xs font-bold ml-auto ${
                            timeRemaining > 0
                                ? eosMode ? 'text-amber-400' : 'text-blue-500'
                                : 'text-red-500'
                        }`}>
                            {timeRemaining > 0 ? `${timeRemaining} min remaining` : `${Math.abs(timeRemaining)} min over`}
                        </span>
                    )}
                </div>

                {/* Section detail cards */}
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 scrollbar-hide">
                    {activeItems.map((item, index) => (
                        <div key={item.id} className={`rounded-xl border-2 overflow-hidden ${
                            eosMode ? 'border-neutral-700 bg-neutral-800' : 'border-slate-200 bg-white'
                        }`}>
                            <div className={`flex items-center gap-3 p-3 ${
                                eosMode ? 'bg-neutral-800' : 'bg-slate-50/50'
                            }`}>
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                                    eosMode
                                        ? 'bg-amber-500/20 text-amber-400'
                                        : 'bg-teal-100 text-score-teal'
                                }`}>
                                    {index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className={`font-bold truncate ${eosMode ? 'text-neutral-200' : 'text-slate-800'}`}>
                                        {item.title}
                                    </div>
                                </div>
                                <span className={`text-xs font-bold flex-shrink-0 ${eosMode ? 'text-amber-400' : 'text-score-teal'}`}>
                                    {item.duration} min
                                </span>
                            </div>
                            <div className={`px-3 pb-3 pt-2 border-t ${eosMode ? 'border-neutral-700' : 'border-slate-100'}`}>
                                <textarea
                                    placeholder="Add talking points, notes, or context..."
                                    value={item.notes || ''}
                                    onChange={(e) => updateItem(item.id, 'notes', e.target.value)}
                                    rows={3}
                                    className={`w-full p-2 text-sm rounded-lg border focus:outline-none resize-none ${
                                        eosMode
                                            ? 'bg-neutral-900 border-neutral-700 text-neutral-300 placeholder-neutral-600 focus:border-amber-500'
                                            : 'bg-slate-50 border-slate-200 text-slate-700 placeholder-slate-400 focus:border-score-teal'
                                    }`}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Next: Review & Export */}
                <button
                    onClick={() => setMode('review')}
                    className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        eosMode
                            ? 'bg-amber-500 text-black hover:bg-amber-400'
                            : 'bg-skip-coral text-white hover:bg-orange-600'
                    }`}
                >
                    Next: Review & Export <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        );
    }

    // ========== REVIEW MODE ==========
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
                <button
                    onClick={() => setMode('detail')}
                    className={`flex items-center gap-1 text-sm font-bold transition-colors cursor-pointer ${
                        eosMode ? 'text-neutral-400 hover:text-neutral-200' : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Details
                </button>
                <h2 className={`text-3xl font-bold tracking-tight ${eosMode ? 'text-neutral-100' : 'text-slate-900'}`}>
                    Your Agenda
                </h2>
                <p className={eosMode ? 'text-neutral-400' : 'text-slate-500'}>
                    Review your finished agenda. Export it or save as a template for next time.
                </p>
            </div>

            {/* Meeting info header */}
            <div className={`p-4 rounded-xl border-2 ${
                eosMode ? 'border-neutral-700 bg-neutral-800' : 'border-slate-200 bg-white'
            }`}>
                <div className={`font-bold text-lg ${eosMode ? 'text-neutral-100' : 'text-slate-900'}`}>
                    {data.title || 'Meeting'}
                </div>
                <div className={`text-sm mt-1 ${eosMode ? 'text-neutral-400' : 'text-slate-500'}`}>
                    {meetingDuration} min &middot; {activeItems.length} sections &middot; {totalAllocated} min allocated
                </div>
            </div>

            {/* Agenda preview */}
            <div className="space-y-1 max-h-[280px] overflow-y-auto pr-1 scrollbar-hide">
                {(() => {
                    let runningTime = 0;
                    return activeItems.map((item, index) => {
                        const startTime = runningTime;
                        runningTime += item.duration;
                        return (
                            <div key={item.id} className={`p-3 rounded-xl ${
                                eosMode ? 'bg-neutral-800' : 'bg-slate-50'
                            }`}>
                                <div className="flex items-center gap-3">
                                    <div className={`text-xs font-mono font-bold flex-shrink-0 w-16 ${
                                        eosMode ? 'text-amber-400/70' : 'text-score-teal/70'
                                    }`}>
                                        {startTime}-{runningTime} min
                                    </div>
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                        eosMode
                                            ? 'bg-amber-500/20 text-amber-400'
                                            : 'bg-teal-100 text-score-teal'
                                    }`}>
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className={`font-bold text-sm ${eosMode ? 'text-neutral-200' : 'text-slate-800'}`}>
                                            {item.title}
                                        </div>
                                        {item.notes && (
                                            <div className={`text-xs mt-0.5 line-clamp-2 ${eosMode ? 'text-neutral-500' : 'text-slate-400'}`}>
                                                {item.notes}
                                            </div>
                                        )}
                                    </div>
                                    <span className={`text-xs font-bold flex-shrink-0 ${eosMode ? 'text-neutral-500' : 'text-slate-400'}`}>
                                        {item.duration} min
                                    </span>
                                </div>
                            </div>
                        );
                    });
                })()}
            </div>

            {/* Save as Template */}
            {showSaveTemplate ? (
                <div className={`flex items-center gap-2 p-3 rounded-xl border ${
                    eosMode ? 'bg-neutral-800 border-neutral-700' : 'bg-slate-50 border-slate-200'
                }`}>
                    <Save className={`w-4 h-4 flex-shrink-0 ${eosMode ? 'text-amber-400' : 'text-score-teal'}`} />
                    <input
                        type="text"
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveAsTemplate()}
                        placeholder="Template name..."
                        className={`flex-1 text-sm bg-transparent border-none focus:outline-none ${
                            eosMode ? 'text-neutral-200 placeholder-neutral-600' : 'text-slate-800 placeholder-slate-400'
                        }`}
                        autoFocus
                    />
                    <button
                        onClick={saveAsTemplate}
                        disabled={!templateName.trim()}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-50 ${
                            eosMode
                                ? 'bg-amber-500 text-black hover:bg-amber-400'
                                : 'bg-score-teal text-white hover:bg-teal-600'
                        }`}
                    >
                        Save
                    </button>
                    <button
                        onClick={() => { setShowSaveTemplate(false); setTemplateName(''); }}
                        className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            eosMode ? 'text-neutral-400 hover:text-neutral-200' : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        Cancel
                    </button>
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowSaveTemplate(true)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            eosMode
                                ? 'text-neutral-400 hover:text-amber-400 hover:bg-neutral-800'
                                : 'text-slate-400 hover:text-score-teal hover:bg-slate-50'
                        }`}
                    >
                        <Bookmark className="w-3.5 h-3.5" />
                        Save as Template
                    </button>
                    {savedNotice && (
                        <span className={`text-xs font-bold flex items-center gap-1 ${eosMode ? 'text-amber-400' : 'text-score-teal'}`}>
                            <CheckCircle2 className="w-3.5 h-3.5" /> Saved!
                        </span>
                    )}
                </div>
            )}

            {/* Export Bar */}
            <div className={`flex items-center gap-2 p-3 rounded-xl border flex-wrap ${
                eosMode ? 'bg-neutral-800 border-neutral-700' : 'bg-slate-50 border-slate-200'
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
                            ? 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
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
                <button
                    onClick={openGoogleCalendar}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        eosMode
                            ? 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                >
                    <Calendar className="w-3.5 h-3.5" />
                    Google Cal
                </button>
                <button
                    onClick={generateICS}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        eosMode
                            ? 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                >
                    <Download className="w-3.5 h-3.5" />
                    .ics
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
