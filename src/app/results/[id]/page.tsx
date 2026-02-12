'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Logo } from '@/components/Logo';
import { AssessmentData, Recommendation, ReadinessLevel } from '@/lib/types';
import { calculateSavings, calculateActionPlan, calculateScoreBreakdown } from '@/lib/scoring';
import {
    ArrowLeft,
    Copy,
    Share2,
    CheckCircle2,
    AlertCircle,
    Clock,
    LayoutDashboard,
    TrendingUp,
    TrendingDown,
    MessageSquare,
    Mail,
    Video,
    FileText,
    Sparkles,
    ChevronDown,
    ChevronUp,
    Repeat,
    Calendar,
    ListChecks
} from 'lucide-react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { useEOS } from '@/contexts/EOSContext';

const REC_STYLES: Record<Recommendation, { label: string; color: string; bg: string; text: string; description: string }> = {
    SKIP: {
        label: 'SKIP',
        color: '#F97316',
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        description: 'This meeting has low value. Cancel it and use async updates.'
    },
    ASYNC_FIRST: {
        label: 'ASYNC FIRST',
        color: '#0d9488',
        bg: 'bg-teal-50',
        text: 'text-teal-700',
        description: 'Consider a Slack thread or Loom video instead of a live sync.'
    },
    SHORTEN: {
        label: 'SHORTEN',
        color: '#3b82f6',
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        description: 'Keep it tight. 15-20 mins max for this specific topic.'
    },
    PROCEED: {
        label: 'PROCEED',
        color: '#10b981',
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        description: 'This meeting is justified. Ensure everyone is prepared.'
    }
};

const READINESS_STYLES: Record<ReadinessLevel, { label: string; color: string; bg: string; text: string }> = {
    NOT_READY: { label: 'NOT READY', color: '#ef4444', bg: 'bg-red-500/20', text: 'text-red-400' },
    NEEDS_WORK: { label: 'NEEDS WORK', color: '#f59e0b', bg: 'bg-amber-500/20', text: 'text-amber-400' },
    ALMOST_READY: { label: 'ALMOST READY', color: '#3b82f6', bg: 'bg-blue-500/20', text: 'text-blue-400' },
    FULLY_PREPARED: { label: 'FULLY PREPARED', color: '#10b981', bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
};

export default function ResultsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { eosMode } = useEOS();
    const [data, setData] = useState<AssessmentData | null>(null);
    const [activeTab, setActiveTab] = useState<'breakdown' | 'suggestions'>('suggestions');
    const [copied, setCopied] = useState(false);
    const [slackCopied, setSlackCopied] = useState(false);
    const [displayScore, setDisplayScore] = useState(0);
    const [expandedReplacement, setExpandedReplacement] = useState<'slack' | 'loom' | 'doc' | null>(null);
    const [replacementCopied, setReplacementCopied] = useState<string | null>(null);
    const [animationComplete, setAnimationComplete] = useState(false);
    const [runSheetCopied, setRunSheetCopied] = useState(false);
    const [activeRunSheet, setActiveRunSheet] = useState<string | null>(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
        const history = JSON.parse(localStorage.getItem('skip-score-history') || '[]');
        const assessment = history.find((h: AssessmentData) => h.id === id);
        if (assessment) {
            setData(assessment);
        } else {
            router.push('/');
        }
    }, [id, router]);

    // Animated score counting
    useEffect(() => {
        if (data && !hasAnimated.current) {
            hasAnimated.current = true;
            const targetScore = data.isProtectedEOS ? (data.readinessScore || 0) : (data.score || 0);
            const duration = 1500;
            const steps = 60;
            const increment = targetScore / steps;
            let current = 0;

            const timer = setInterval(() => {
                current += increment;
                if (current >= targetScore) {
                    setDisplayScore(targetScore);
                    setAnimationComplete(true);
                    clearInterval(timer);

                    // Trigger confetti for well-prepared meetings
                    if (data.isProtectedEOS && data.readinessLevel === 'FULLY_PREPARED') {
                        confetti({
                            particleCount: 100,
                            spread: 70,
                            origin: { y: 0.6 },
                            colors: ['#10b981', '#3b82f6', '#fbbf24', '#8b5cf6']
                        });
                    } else if (!data.isProtectedEOS && data.recommendation === 'PROCEED') {
                        confetti({
                            particleCount: 100,
                            spread: 70,
                            origin: { y: 0.6 },
                            colors: ['#10b981', '#3b82f6', '#fbbf24', '#8b5cf6']
                        });
                    }
                } else {
                    setDisplayScore(parseFloat(current.toFixed(1)));
                }
            }, duration / steps);

            return () => clearInterval(timer);
        }
    }, [data]);

    if (!data) return null;

    const savings = calculateSavings(data, data.score || 0, data.recommendation || 'PROCEED');
    const actionPlan = calculateActionPlan(data, data.recommendation || 'PROCEED', eosMode);
    const scoreBreakdown = calculateScoreBreakdown(data, { eosMode });
    const style = REC_STYLES[data.recommendation || 'PROCEED'];

    const copyResults = () => {
        const text = `SkipScore Results: ${data.title}\nScore: ${data.score}/10\nRecommendation: ${style.label}\n\nSuggestions:\n${actionPlan.map((item, i) => `${i + 1}. ${item}`).join('\n')}`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareToSlack = () => {
        const text = `🎯 *SkipScore Results: ${data.title}*\n\n*Score:* ${data.score}/10\n*Recommendation:* ${style.label}\n\n${style.description}`;
        navigator.clipboard.writeText(text);
        setSlackCopied(true);
        // Open Slack app - user can then paste
        window.open('slack://open', '_self');
        setTimeout(() => setSlackCopied(false), 2000);
    };

    const shareViaEmail = () => {
        const subject = encodeURIComponent(`SkipScore Results: ${data.title}`);
        const body = encodeURIComponent(`SkipScore Results: ${data.title}\n\nScore: ${data.score}/10\nRecommendation: ${style.label}\n\n${style.description}\n\nSuggestions:\n${actionPlan.map((item, i) => `${i + 1}. ${item}`).join('\n')}`);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    };

    // Meeting Replacement Generators
    const attendeeNames = data.attendees.map(a => a.name).join(', ');
    const driName = data.attendees.find(a => a.isDRI)?.name || 'the team';

    const generateSlackMessage = () => {
        const isSkip = data.recommendation === 'SKIP';
        return `Hey team! 👋

I was planning to schedule "${data.title}" but after thinking it through, I believe we can handle this async instead.

${isSkip ? `**What I need from you:**
• Please share your updates/thoughts in this thread
• If you have questions, drop them here and I'll respond
• ${driName} - I'll need your input on any decisions` : `**Here's what we need to cover:**
• [Add your key discussion points here]
• Please review and add your thoughts below

**Timeline:** Let's aim to wrap up discussion by [date]`}

${data.attendees.length > 0 ? `\nTagging: ${attendeeNames}` : ''}

This saves us ${savings.potentialHoursSaved.toFixed(1)} hours of meeting time. Thanks for being async-friendly! 🙌`;
    };

    const generateLoomScript = () => {
        return `📹 LOOM SCRIPT: ${data.title}
${'─'.repeat(40)}

INTRO (30 sec)
"Hey everyone, I'm recording this instead of scheduling a meeting to save us all some time."

CONTEXT (1 min)
"Here's what this is about: [Explain the background of ${data.title}]"
• What led to this
• Why it matters now

MAIN CONTENT (2-3 min)
"Let me walk you through the key points..."

${data.decisionRequired ? `DECISION NEEDED
"We need to decide on [specific decision]. Here are the options:
• Option A: [describe]
• Option B: [describe]
Please comment with your preference by [date]."` : `KEY INFORMATION
"Here's what you need to know:
• Point 1
• Point 2
• Point 3"`}

CALL TO ACTION (30 sec)
"After watching this:
${data.decisionRequired ? '• Comment with your vote/preference' : '• Let me know if you have questions'}
• ${driName}, I'll need your sign-off
• Deadline: [add date]"

WRAP UP
"Thanks for watching! This saved us a ${data.duration || 30}-minute meeting. Drop any questions in the comments."

${'─'.repeat(40)}
Total runtime target: 3-5 minutes`;
    };

    const generateAsyncDoc = () => {
        return `# ${data.title}
## Async Discussion Document

**Owner:** ${driName}
**Participants:** ${attendeeNames || '[Add participants]'}
**Deadline for input:** [Add date]
**Status:** 🟡 Awaiting Input

---

### 📋 Context
[Explain the background and why this matters]

### 🎯 Objective
${data.decisionRequired ? 'We need to make a decision on...' : 'Share information about...'}

### 📝 Key Points
1. [First point]
2. [Second point]
3. [Third point]

${data.decisionRequired ? `### ⚖️ Options to Consider
| Option | Pros | Cons |
|--------|------|------|
| Option A | | |
| Option B | | |
| Option C | | |

### 🗳️ Vote
Please add your name under your preferred option:

**Option A:**
-

**Option B:**
-

**Option C:**
- ` : `### ❓ Questions & Discussion
*Add your questions or comments below with your name:*

---

`}
### ✅ Next Steps
- [ ] All participants review by [date]
- [ ] ${driName} to make final decision
- [ ] Communicate outcome to team

---
*This async doc replaced a ${data.duration || 30}-minute meeting, saving ${savings.potentialHoursSaved.toFixed(1)} hours of team time.*`;
    };

    const copyReplacement = (type: 'slack' | 'loom' | 'doc') => {
        const content = type === 'slack' ? generateSlackMessage() : type === 'loom' ? generateLoomScript() : generateAsyncDoc();
        navigator.clipboard.writeText(content);
        setReplacementCopied(type);
        setTimeout(() => setReplacementCopied(null), 2000);
    };

    // EOS Run Sheet templates
    const EOS_RUN_SHEETS: Record<string, { title: string; duration: string; sections: { name: string; time: string; details: string[] }[] }> = {
        L10: {
            title: 'Level 10 Meeting',
            duration: '90 minutes',
            sections: [
                { name: 'Segue', time: '5 min', details: ['Each person shares one personal and one professional good news item'] },
                { name: 'Scorecard', time: '5 min', details: ['Review weekly metrics', 'Flag any numbers that are off-track', 'Drop off-track items to the Issues List'] },
                { name: 'Rock Review', time: '5 min', details: ['Each Rock owner reports: On Track or Off Track', 'No discussion — off-track Rocks go to the Issues List'] },
                { name: 'Customer & Employee Headlines', time: '5 min', details: ['Share good and bad news about customers and employees', 'Drop any issues to the Issues List'] },
                { name: 'To-Do List', time: '5 min', details: ['Review last week\'s To-Dos', 'Each is either Done or Not Done (drop to Issues List)'] },
                { name: 'IDS (Identify, Discuss, Solve)', time: '60 min', details: ['Prioritize the top 3 issues', 'For each: Identify the real issue, Discuss it, Solve it', 'Create a To-Do with an owner and 7-day deadline', 'Move to the next issue — repeat until time is up'] },
                { name: 'Conclude', time: '5 min', details: ['Recap new To-Dos', 'Rate the meeting 1-10', 'Any cascading messages for the team?'] },
            ],
        },
        IDS: {
            title: 'IDS Session',
            duration: '60 minutes',
            sections: [
                { name: 'List & Prioritize Issues', time: '5 min', details: ['Review the Issues List', 'As a team, pick the top 3 most important issues'] },
                { name: 'IDS: Identify, Discuss, Solve', time: '50 min', details: ['Identify — state the real issue in one sentence', 'Discuss — everyone who can add value weighs in (no tangents)', 'Solve — agree on the solution, assign a To-Do with an owner', 'Repeat for the next issue until time is up'] },
                { name: 'Recap To-Dos', time: '5 min', details: ['Read back all new To-Dos and owners', 'Confirm 7-day deadlines'] },
            ],
        },
        QUARTERLY: {
            title: 'Quarterly Planning Session',
            duration: 'Full day (7-8 hours)',
            sections: [
                { name: 'Segue', time: '15 min', details: ['Each person shares their best personal and professional news from the quarter'] },
                { name: 'Prior Quarter Review', time: '60 min', details: ['Review each Rock: Complete or Incomplete', 'Review the Scorecard for the quarter', 'Discuss what went well and what didn\'t'] },
                { name: 'Review V/TO', time: '60 min', details: ['Review the Vision/Traction Organizer', 'Update 10-Year Target, 3-Year Picture, 1-Year Plan', 'Ensure the whole team is on the same page'] },
                { name: 'Establish Next Quarter Rocks', time: '120 min', details: ['Set 3-7 company Rocks for the quarter', 'Each Rock gets one owner', 'Set individual Rocks for each leadership team member'] },
                { name: 'Tackle Key Issues (IDS)', time: '120 min', details: ['IDS the biggest issues facing the company', 'Focus on strategic, long-term issues (not weekly fires)'] },
                { name: 'Next Steps', time: '30 min', details: ['Confirm all new Rocks and owners', 'Review any cascading messages for the organization', 'Assign any To-Dos that came out of the session'] },
                { name: 'Conclude & Rate', time: '15 min', details: ['Rate the session 1-10', 'Share feedback on what could improve next quarter'] },
            ],
        },
    };

    const generateRunSheet = (type: string) => {
        const sheet = EOS_RUN_SHEETS[type];
        if (!sheet) return '';
        let output = `${sheet.title} — Run Sheet\n`;
        output += `Duration: ${sheet.duration}\n`;
        output += `${'═'.repeat(50)}\n\n`;
        sheet.sections.forEach((section) => {
            output += `▸ ${section.name} (${section.time})\n`;
            section.details.forEach((d) => {
                output += `  • ${d}\n`;
            });
            output += '\n';
        });
        output += `${'═'.repeat(50)}\n`;
        output += `Generated by SkipScore — skipscore.app`;
        return output;
    };

    const copyRunSheet = (type: string) => {
        navigator.clipboard.writeText(generateRunSheet(type));
        setRunSheetCopied(true);
        setTimeout(() => setRunSheetCopied(false), 2000);
    };

    const displayedFinalScore = data.isProtectedEOS ? (data.readinessScore || 0) : (data.score || 0);
    const progressOffset = animationComplete
        ? 452 - (452 * displayedFinalScore) / 10
        : 452 - (452 * displayScore) / 10;

    return (
        <main className="min-h-screen p-4 sm:p-8 flex flex-col items-center">
            <div className="max-w-4xl w-full space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 sm:gap-4">
                        <Link href="/assess" className={`flex items-center gap-1 sm:gap-2 transition-colors font-bold text-sm sm:text-base ${
                            eosMode ? 'text-amber-500/80 hover:text-amber-400' : 'text-white/80 hover:text-white'
                        }`}>
                            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" /> <span className="hidden sm:inline">{eosMode ? 'New Check' : 'New Assessment'}</span><span className="sm:hidden">New</span>
                        </Link>
                        <Link href="/dashboard" className={`flex items-center gap-1 sm:gap-2 transition-colors font-bold text-sm sm:text-base ${
                            eosMode ? 'text-amber-500/80 hover:text-amber-400' : 'text-white/80 hover:text-white'
                        }`}>
                            <LayoutDashboard className="w-4 h-4 sm:w-5 sm:h-5" /> <span className="hidden sm:inline">Dashboard</span>
                        </Link>
                    </div>
                    <Link href="/"><Logo className="scale-50 sm:scale-75 origin-right cursor-pointer" variant="white" /></Link>
                </div>

                {/* Main Result Card */}
                <div className={`rounded-[2.5rem] shadow-2xl overflow-hidden ${
                    eosMode ? 'bg-neutral-900 border border-neutral-800' : 'bg-white'
                }`}>
                    <div className="p-6 sm:p-10 space-y-8">
                        {/* Top Section - 50/50 Split */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                            {/* Left: Title + Badge + Reasoning */}
                            <div className="space-y-4">
                                <div>
                                    <h1 className={`text-3xl sm:text-4xl font-extrabold leading-tight ${
                                        eosMode ? 'text-neutral-100' : 'text-slate-900'
                                    }`}>
                                        {data.title}
                                    </h1>
                                    {data.meetingPlatform && (
                                        <div className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-lg text-xs font-bold ${
                                            eosMode
                                                ? 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                                                : data.meetingPlatform === 'zoom'
                                                    ? 'bg-blue-50 text-blue-600'
                                                    : data.meetingPlatform === 'teams'
                                                        ? 'bg-indigo-50 text-indigo-600'
                                                        : 'bg-emerald-50 text-emerald-600'
                                        }`}>
                                            <Video className="w-3 h-3" />
                                            {data.meetingPlatform === 'zoom' ? 'Zoom' : data.meetingPlatform === 'teams' ? 'Teams' : 'Google Meet'}
                                        </div>
                                    )}
                                </div>
                                {data.isProtectedEOS && data.readinessLevel ? (
                                    <>
                                        <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full font-bold ${
                                            READINESS_STYLES[data.readinessLevel].bg
                                        } ${READINESS_STYLES[data.readinessLevel].text} border border-current/30 ${
                                            animationComplete ? 'animate-in zoom-in duration-300' : 'opacity-0'
                                        }`}>
                                            <AlertCircle className="w-5 h-5" />
                                            {READINESS_STYLES[data.readinessLevel].label}
                                        </div>
                                        <p className={`text-base font-medium leading-relaxed text-neutral-400 ${
                                            animationComplete ? 'animate-in fade-in slide-in-from-bottom-2 duration-500' : 'opacity-0'
                                        }`}>
                                            {data.readinessLevel === 'FULLY_PREPARED'
                                                ? `Your ${data.protectedType} is locked and loaded. Run it by the book.`
                                                : data.readinessLevel === 'ALMOST_READY'
                                                    ? `Close! A few tweaks and your ${data.protectedType} will be dialed in.`
                                                    : data.readinessLevel === 'NEEDS_WORK'
                                                        ? `Your ${data.protectedType} has gaps. Address the items below before meeting.`
                                                        : `This ${data.protectedType} isn't set up right. Fix the basics before you run it.`}
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full font-bold ${
                                            eosMode
                                                ? data.recommendation === 'SKIP' || data.recommendation === 'ASYNC_FIRST'
                                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                                    : data.recommendation === 'PROCEED'
                                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                                : `${style.bg} ${style.text}`
                                        } ${animationComplete ? 'animate-in zoom-in duration-300' : 'opacity-0'}`}>
                                            <AlertCircle className="w-5 h-5" />
                                            {eosMode && data.recommendation === 'SKIP' ? 'ADD TO ISSUES' : style.label}
                                        </div>
                                        <p className={`text-base font-medium leading-relaxed ${
                                            eosMode ? 'text-neutral-400' : 'text-slate-600'
                                        } ${animationComplete ? 'animate-in fade-in slide-in-from-bottom-2 duration-500' : 'opacity-0'}`}>
                                            {eosMode && data.recommendation === 'SKIP'
                                                ? 'This topic belongs on the Issues List, not in a meeting. Add it to your L10.'
                                                : (data.reasoning || style.description)}
                                        </p>
                                    </>
                                )}
                            </div>

                            {/* Right: Score Circle + Guide */}
                            <div className="flex flex-col items-center gap-4">
                                <div className="relative w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center">
                                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                                        <circle
                                            cx="80"
                                            cy="80"
                                            r="72"
                                            stroke="currentColor"
                                            strokeWidth="12"
                                            fill="transparent"
                                            className={eosMode ? 'text-neutral-800' : 'text-slate-100'}
                                        />
                                        <circle
                                            cx="80"
                                            cy="80"
                                            r="72"
                                            stroke="currentColor"
                                            strokeWidth="12"
                                            fill="transparent"
                                            strokeDasharray={452}
                                            strokeDashoffset={progressOffset}
                                            strokeLinecap="round"
                                            className={`transition-all duration-100 ${eosMode ? 'text-amber-500' : 'text-score-teal'}`}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className={`text-5xl font-black tabular-nums ${eosMode ? 'text-neutral-100' : 'text-slate-900'}`}>{displayScore}</span>
                                        <span className={`text-[10px] font-bold uppercase tracking-widest text-center leading-tight ${eosMode ? 'text-neutral-500' : 'text-slate-400'}`}>{data.isProtectedEOS ? 'Readiness' : 'Skip'}<br />Score</span>
                                    </div>
                                </div>

                                {/* Score Guide */}
                                <div className={`w-full max-w-[280px] space-y-1.5 ${animationComplete ? 'animate-in fade-in slide-in-from-bottom-4 duration-500' : 'opacity-0'}`}>
                                    {data.isProtectedEOS ? (
                                        // Readiness tiers for protected EOS meetings
                                        [
                                            { range: '0 - 2.9', label: 'NOT READY', level: 'NOT_READY' as ReadinessLevel },
                                            { range: '3 - 4.9', label: 'NEEDS WORK', level: 'NEEDS_WORK' as ReadinessLevel },
                                            { range: '5 - 7.4', label: 'ALMOST READY', level: 'ALMOST_READY' as ReadinessLevel },
                                            { range: '7.5 - 10', label: 'FULLY PREPARED', level: 'FULLY_PREPARED' as ReadinessLevel }
                                        ].map((tier) => {
                                            const isCurrent = data.readinessLevel === tier.level;
                                            const rStyle = READINESS_STYLES[tier.level];
                                            return (
                                                <div key={tier.label} className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${
                                                    isCurrent
                                                        ? 'bg-amber-500 text-black shadow-md scale-105'
                                                        : 'bg-neutral-800 text-neutral-500'
                                                }`}>
                                                    <span className="font-mono font-bold">{tier.range}</span>
                                                    <span className={`font-bold ${isCurrent ? 'text-black' : rStyle.text}`}>
                                                        {tier.label}
                                                    </span>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        // Standard skip score tiers
                                        [
                                            { range: '0 - 2.9', label: 'SKIP', eosLabel: 'ISSUES LIST', rec: 'SKIP' },
                                            { range: '3 - 4.9', label: 'ASYNC FIRST', eosLabel: 'ASYNC', rec: 'ASYNC_FIRST' },
                                            { range: '5 - 6.9', label: 'SHORTEN', eosLabel: 'SHORTEN', rec: 'SHORTEN' },
                                            { range: '7 - 10', label: 'PROCEED', eosLabel: 'PROCEED', rec: 'PROCEED' }
                                        ].map((tier) => {
                                            const isCurrent = data.recommendation === tier.rec;
                                            const tierStyle = REC_STYLES[tier.rec as Recommendation];
                                            return (
                                                <div key={tier.label} className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${
                                                    isCurrent
                                                        ? eosMode
                                                            ? 'bg-amber-500 text-black shadow-md scale-105'
                                                            : 'bg-slate-900 text-white shadow-md scale-105'
                                                        : eosMode
                                                            ? 'bg-neutral-800 text-neutral-500'
                                                            : 'bg-slate-50 text-slate-400'
                                                }`}>
                                                    <span className="font-mono font-bold">{tier.range}</span>
                                                    <span className={`font-bold ${isCurrent ? (eosMode ? 'text-black' : 'text-white') : tierStyle.text}`}>
                                                        {eosMode ? tier.eosLabel : tier.label}
                                                    </span>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Tabs Section */}
                        <div className="space-y-4">
                            <div className={`flex border-b overflow-x-auto ${eosMode ? 'border-neutral-700' : 'border-slate-200'}`}>
                                <button
                                    onClick={() => setActiveTab('suggestions')}
                                    className={`px-5 py-3 font-bold text-sm uppercase tracking-wider transition-all whitespace-nowrap ${
                                        activeTab === 'suggestions'
                                            ? eosMode
                                                ? 'text-amber-500 border-b-2 border-amber-500'
                                                : 'text-score-teal border-b-2 border-score-teal'
                                            : eosMode
                                                ? 'text-neutral-500 hover:text-neutral-300'
                                                : 'text-slate-400 hover:text-slate-600'
                                    }`}
                                >
                                    {data.isProtectedEOS ? 'Readiness Check' : eosMode ? 'Action Items' : 'Suggestions'}
                                </button>
                                <button
                                    onClick={() => setActiveTab('breakdown')}
                                    className={`px-5 py-3 font-bold text-sm uppercase tracking-wider transition-all whitespace-nowrap ${
                                        activeTab === 'breakdown'
                                            ? eosMode
                                                ? 'text-amber-500 border-b-2 border-amber-500'
                                                : 'text-score-teal border-b-2 border-score-teal'
                                            : eosMode
                                                ? 'text-neutral-500 hover:text-neutral-300'
                                                : 'text-slate-400 hover:text-slate-600'
                                    }`}
                                >
                                    Score Breakdown
                                </button>
                            </div>

                            <div className="min-h-[180px]">
                                {activeTab === 'suggestions' && (
                                    <div className="animate-in fade-in duration-300 space-y-4">
                                        {data.isProtectedEOS ? (
                                            // Readiness check: strengths and tips
                                            <>
                                                {data.readinessStrengths && data.readinessStrengths.length > 0 && (
                                                    <div>
                                                        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-2">
                                                            <TrendingUp className="w-4 h-4" /> What&apos;s Good
                                                        </h4>
                                                        <div className="space-y-2">
                                                            {data.readinessStrengths.map((item, i) => (
                                                                <div key={i} className="flex items-start gap-3 p-4 rounded-2xl border bg-emerald-500/10 border-emerald-500/20">
                                                                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-400" />
                                                                    <span className="font-medium text-neutral-300">{item}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {data.readinessTips && data.readinessTips.length > 0 && (
                                                    <div>
                                                        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-2">
                                                            <TrendingDown className="w-4 h-4" /> What&apos;s Missing
                                                        </h4>
                                                        <div className="space-y-2">
                                                            {data.readinessTips.map((item, i) => (
                                                                <div key={i} className="flex items-start gap-3 p-4 rounded-2xl border bg-amber-500/10 border-amber-500/20">
                                                                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-400" />
                                                                    <span className="font-medium text-neutral-300">{item}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {(!data.readinessTips || data.readinessTips.length === 0) && (!data.readinessStrengths || data.readinessStrengths.length === 0) && (
                                                    <p className="text-neutral-500 italic">No readiness data available.</p>
                                                )}
                                                {(data.readinessLevel === 'NOT_READY' || data.readinessLevel === 'NEEDS_WORK' || data.readinessLevel === 'ALMOST_READY') && (
                                                    <button
                                                        onClick={() => {
                                                            localStorage.setItem('skip-score-edit', JSON.stringify(data));
                                                            router.push('/assess');
                                                        }}
                                                        className="flex items-center justify-center gap-2 w-full py-3 mt-2 rounded-xl font-bold text-sm transition-all bg-amber-500 text-black hover:bg-amber-400"
                                                    >
                                                        <ArrowLeft className="w-4 h-4" /> Adjust & Re-Score
                                                    </button>
                                                )}
                                            </>
                                        ) : (
                                            // Standard action plan
                                            <>
                                                <div className="space-y-2">
                                                    {actionPlan.map((item, i) => (
                                                        <div key={i} className={`flex items-start gap-3 p-4 rounded-2xl border transition-colors ${
                                                            eosMode
                                                                ? 'bg-neutral-800 border-neutral-700 hover:bg-neutral-750'
                                                                : 'bg-slate-50 border-slate-100 hover:bg-slate-100'
                                                        }`}>
                                                            <CheckCircle2 className={`w-5 h-5 flex-shrink-0 mt-0.5 ${eosMode ? 'text-amber-500' : 'text-score-teal'}`} />
                                                            <span className={`font-medium ${eosMode ? 'text-neutral-300' : 'text-slate-700'}`}>{item}</span>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Attendee suggestions for low scores */}
                                                {(data.recommendation === 'SKIP' || data.recommendation === 'ASYNC_FIRST' || data.recommendation === 'SHORTEN') && data.attendees.length > 2 && (
                                                    <div className={`flex items-start gap-3 p-4 rounded-2xl border transition-colors ${
                                                        eosMode
                                                            ? 'bg-neutral-800 border-neutral-700 hover:bg-neutral-750'
                                                            : 'bg-slate-50 border-slate-100 hover:bg-slate-100'
                                                    }`}>
                                                        <CheckCircle2 className={`w-5 h-5 flex-shrink-0 mt-0.5 ${eosMode ? 'text-amber-500' : 'text-score-teal'}`} />
                                                        <div>
                                                            <span className={`font-medium ${eosMode ? 'text-neutral-300' : 'text-slate-700'}`}>
                                                                {eosMode ? 'Reduce the invite list' : 'Consider reducing attendees'}. With {data.attendees.length} people, mark some as optional:
                                                            </span>
                                                            <div className="flex flex-wrap gap-2 mt-2">
                                                                {data.attendees
                                                                    .filter(a => !a.isDRI && !a.isOptional)
                                                                    .slice(0, 3)
                                                                    .map((attendee, i) => (
                                                                        <span key={i} className={`px-3 py-1 rounded-full text-xs font-medium border ${
                                                                            eosMode
                                                                                ? 'bg-neutral-700 text-neutral-300 border-neutral-600'
                                                                                : 'bg-white text-slate-600 border-slate-200'
                                                                        }`}>
                                                                            {attendee.name} → Optional?
                                                                        </span>
                                                                    ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Adjust & Re-Score */}
                                                <button
                                                    onClick={() => {
                                                        localStorage.setItem('skip-score-edit', JSON.stringify(data));
                                                        router.push('/assess');
                                                    }}
                                                    className={`flex items-center justify-center gap-2 w-full py-3 mt-2 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                                                        eosMode
                                                            ? 'bg-amber-500 text-black hover:bg-amber-400'
                                                            : 'bg-slate-900 text-white hover:bg-slate-800'
                                                    }`}
                                                >
                                                    <ArrowLeft className="w-4 h-4" /> Adjust & Re-Score
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'breakdown' && (
                                    <div className="animate-in fade-in duration-300 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* Helping Factors */}
                                        <div className={`rounded-2xl p-5 border ${
                                            eosMode
                                                ? 'bg-emerald-500/10 border-emerald-500/20'
                                                : 'bg-emerald-50 border-emerald-100'
                                        }`}>
                                            <div className="flex items-center gap-2 mb-4">
                                                <TrendingUp className={`w-5 h-5 ${eosMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                                                <h3 className={`font-bold text-sm uppercase tracking-wide ${eosMode ? 'text-emerald-400' : 'text-emerald-700'}`}>Helping Your Score</h3>
                                            </div>
                                            <div className="space-y-2">
                                                {scoreBreakdown.helping.length > 0 ? (
                                                    scoreBreakdown.helping.map((factor, i) => (
                                                        <div key={i} className={`flex items-center justify-between p-2.5 rounded-xl ${
                                                            eosMode ? 'bg-neutral-800' : 'bg-white'
                                                        }`}>
                                                            <div>
                                                                <div className={`font-bold text-sm ${eosMode ? 'text-neutral-200' : 'text-slate-700'}`}>{factor.label}</div>
                                                                <div className={`text-xs ${eosMode ? 'text-neutral-500' : 'text-slate-500'}`}>{factor.description}</div>
                                                            </div>
                                                            <span className={`font-bold text-sm ${eosMode ? 'text-emerald-400' : 'text-emerald-600'}`}>+{factor.impact.toFixed(1)}</span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className={`text-sm italic ${eosMode ? 'text-emerald-400/70' : 'text-emerald-600/70'}`}>No positive factors</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Hurting Factors */}
                                        <div className={`rounded-2xl p-5 border ${
                                            eosMode
                                                ? 'bg-orange-500/10 border-orange-500/20'
                                                : 'bg-orange-50 border-orange-100'
                                        }`}>
                                            <div className="flex items-center gap-2 mb-4">
                                                <TrendingDown className={`w-5 h-5 ${eosMode ? 'text-orange-400' : 'text-orange-600'}`} />
                                                <h3 className={`font-bold text-sm uppercase tracking-wide ${eosMode ? 'text-orange-400' : 'text-orange-700'}`}>Hurting Your Score</h3>
                                            </div>
                                            <div className="space-y-2">
                                                {scoreBreakdown.hurting.length > 0 ? (
                                                    scoreBreakdown.hurting.map((factor, i) => (
                                                        <div key={i} className={`flex items-center justify-between p-2.5 rounded-xl ${
                                                            eosMode ? 'bg-neutral-800' : 'bg-white'
                                                        }`}>
                                                            <div>
                                                                <div className={`font-bold text-sm ${eosMode ? 'text-neutral-200' : 'text-slate-700'}`}>{factor.label}</div>
                                                                <div className={`text-xs ${eosMode ? 'text-neutral-500' : 'text-slate-500'}`}>{factor.description}</div>
                                                            </div>
                                                            <span className={`font-bold text-sm ${eosMode ? 'text-orange-400' : 'text-orange-600'}`}>{factor.impact.toFixed(1)}</span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className={`text-sm italic ${eosMode ? 'text-orange-400/70' : 'text-orange-600/70'}`}>No negative factors</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Bottom: Savings Section */}
                    <div className={`p-6 sm:p-8 border-t ${
                        eosMode ? 'bg-neutral-800 border-neutral-700' : 'bg-slate-50 border-slate-100'
                    }`}>
                        {/* Annual Impact Alert for Recurring Meetings */}
                        {data.isRecurring && (
                            <div className={`rounded-2xl p-4 mb-6 text-white ${
                                eosMode
                                    ? 'bg-gradient-to-r from-amber-600 to-orange-600'
                                    : 'bg-gradient-to-r from-orange-500 to-red-500'
                            }`}>
                                <div className="flex items-center gap-3">
                                    <div className="bg-white/20 p-2 rounded-xl">
                                        <Repeat className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold text-sm uppercase tracking-wide opacity-90">
                                            {data.recurrenceFrequency === 'DAILY' ? 'Daily' : data.recurrenceFrequency === 'WEEKLY' ? 'Weekly' : data.recurrenceFrequency === 'BIWEEKLY' ? 'Bi-weekly' : 'Monthly'} {eosMode ? 'Rhythm' : 'Recurring Meeting'}
                                        </div>
                                        <div className="text-2xl font-black">
                                            {(() => {
                                                const multiplier = data.recurrenceFrequency === 'DAILY' ? 260 : data.recurrenceFrequency === 'WEEKLY' ? 52 : data.recurrenceFrequency === 'BIWEEKLY' ? 26 : 12;
                                                const annualHours = savings.potentialHoursSaved * multiplier;
                                                return `${annualHours.toFixed(0)} hours reclaimable per year`;
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                            {/* Time Savings */}
                            <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-xl ${eosMode ? 'bg-amber-500/20' : 'bg-teal-100'}`}>
                                    <Clock className={`w-5 h-5 ${eosMode ? 'text-amber-500' : 'text-score-teal'}`} />
                                </div>
                                <div>
                                    <div className={`text-xl font-black ${eosMode ? 'text-neutral-100' : 'text-slate-900'}`}>
                                        {savings.potentialHoursSaved > 0
                                            ? `${savings.potentialHoursSaved.toFixed(1)} hrs`
                                            : `${(data.duration / 60 * data.attendees.length).toFixed(1)} hrs`
                                        }
                                    </div>
                                    <div className={`text-[10px] font-bold uppercase ${eosMode ? 'text-neutral-500' : 'text-slate-500'}`}>
                                        {savings.potentialHoursSaved > 0
                                            ? (data.isRecurring ? 'Per Meeting' : 'Reclaimable Time')
                                            : 'Time Investment'
                                        }
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-4 w-full sm:w-auto">
                                <div className="flex flex-col items-start sm:items-end gap-2">
                                    <span className={`text-xs font-bold uppercase tracking-wide ${eosMode ? 'text-neutral-500' : 'text-slate-500'}`}>Share Your Results</span>
                                    <div className="grid grid-cols-3 sm:flex sm:flex-wrap items-center gap-2 w-full sm:w-auto">
                                        <button
                                            onClick={copyResults}
                                            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-3 sm:py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm ${
                                                eosMode
                                                    ? 'bg-neutral-700 border border-neutral-600 text-neutral-200 hover:bg-neutral-600'
                                                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                                            }`}
                                        >
                                            {copied ? <CheckCircle2 className={`w-5 h-5 sm:w-4 sm:h-4 ${eosMode ? 'text-amber-500' : 'text-teal-500'}`} /> : <Copy className="w-5 h-5 sm:w-4 sm:h-4" />}
                                            <span className="text-xs sm:text-sm">{copied ? 'Copied!' : 'Copy'}</span>
                                        </button>
                                        <button
                                            onClick={shareToSlack}
                                            className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-3 sm:py-2.5 bg-[#4A154B] text-white rounded-xl font-bold text-sm hover:bg-[#3a1039] transition-all shadow-sm"
                                        >
                                            {slackCopied ? <CheckCircle2 className="w-5 h-5 sm:w-4 sm:h-4" /> : <MessageSquare className="w-5 h-5 sm:w-4 sm:h-4" />}
                                            <span className="text-xs sm:text-sm">{slackCopied ? 'Copied!' : 'Slack'}</span>
                                        </button>
                                        <button
                                            onClick={shareViaEmail}
                                            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-3 sm:py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm ${
                                                eosMode
                                                    ? 'bg-amber-500 text-black hover:bg-amber-400'
                                                    : 'bg-skip-coral text-white hover:bg-orange-600'
                                            }`}
                                        >
                                            <Mail className="w-5 h-5 sm:w-4 sm:h-4" />
                                            <span className="text-xs sm:text-sm">Email</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Dashboard Link - Mobile Only */}
                                <Link
                                    href="/dashboard"
                                    className={`flex sm:hidden items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm transition-all ${
                                        eosMode
                                            ? 'bg-neutral-700 border border-neutral-600 text-amber-400 hover:bg-neutral-600'
                                            : 'bg-white border border-slate-200 text-score-teal hover:bg-slate-100'
                                    }`}
                                >
                                    <LayoutDashboard className="w-5 h-5" />
                                    View Dashboard
                                </Link>
                            </div>
                        </div>
                        <p className={`text-[10px] mt-3 font-medium ${eosMode ? 'text-neutral-600' : 'text-slate-400'}`}>* Based on {data.attendees.length} attendees x {data.duration} min meeting</p>
                    </div>
                </div>

                {/* Meeting Replacement Generator - Only for SKIP/ASYNC_FIRST, never for protected EOS meetings */}
                {(data.recommendation === 'SKIP' || data.recommendation === 'ASYNC_FIRST') && !data.isProtectedEOS && (
                    <div className={`rounded-[2.5rem] shadow-2xl overflow-hidden ${
                        eosMode ? 'bg-neutral-900 border border-neutral-800' : 'bg-white'
                    }`}>
                        <div className="p-6 sm:p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className={`p-3 rounded-2xl ${
                                    eosMode
                                        ? 'bg-gradient-to-br from-amber-500 to-orange-600'
                                        : 'bg-gradient-to-br from-purple-500 to-indigo-600'
                                }`}>
                                    <Sparkles className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className={`text-xl font-extrabold ${eosMode ? 'text-neutral-100' : 'text-slate-900'}`}>
                                        {eosMode ? 'Async Alternatives' : 'Meeting Replacement Generator'}
                                    </h2>
                                    <p className={`text-sm ${eosMode ? 'text-neutral-400' : 'text-slate-500'}`}>
                                        {eosMode ? 'Use these instead of scheduling a meeting' : 'Ready-to-use templates to replace this meeting'}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {/* Slack Message */}
                                <div className={`border rounded-2xl overflow-hidden ${eosMode ? 'border-neutral-700' : 'border-slate-200'}`}>
                                    <button
                                        onClick={() => setExpandedReplacement(expandedReplacement === 'slack' ? null : 'slack')}
                                        className={`w-full flex items-center justify-between p-4 transition-colors ${
                                            eosMode ? 'hover:bg-neutral-800' : 'hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="bg-[#4A154B] p-2 rounded-xl">
                                                <MessageSquare className="w-5 h-5 text-white" />
                                            </div>
                                            <div className="text-left">
                                                <div className={`font-bold ${eosMode ? 'text-neutral-100' : 'text-slate-900'}`}>Slack Message</div>
                                                <div className={`text-xs ${eosMode ? 'text-neutral-500' : 'text-slate-500'}`}>Ready-to-post async update</div>
                                            </div>
                                        </div>
                                        {expandedReplacement === 'slack'
                                            ? <ChevronUp className={`w-5 h-5 ${eosMode ? 'text-neutral-500' : 'text-slate-400'}`} />
                                            : <ChevronDown className={`w-5 h-5 ${eosMode ? 'text-neutral-500' : 'text-slate-400'}`} />}
                                    </button>
                                    {expandedReplacement === 'slack' && (
                                        <div className={`border-t p-4 ${
                                            eosMode ? 'border-neutral-700 bg-neutral-800' : 'border-slate-200 bg-slate-50'
                                        }`}>
                                            <pre className={`text-sm whitespace-pre-wrap font-sans p-4 rounded-xl border max-h-64 overflow-y-auto ${
                                                eosMode
                                                    ? 'bg-neutral-900 text-neutral-300 border-neutral-700'
                                                    : 'bg-white text-slate-700 border-slate-200'
                                            }`}>
                                                {generateSlackMessage()}
                                            </pre>
                                            <button
                                                onClick={() => copyReplacement('slack')}
                                                className="mt-3 flex items-center gap-2 px-4 py-2 bg-[#4A154B] text-white rounded-xl font-bold text-sm hover:bg-[#3a1039] transition-all"
                                            >
                                                {replacementCopied === 'slack' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                                {replacementCopied === 'slack' ? 'Copied!' : 'Copy to Clipboard'}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Loom Script */}
                                <div className={`border rounded-2xl overflow-hidden ${eosMode ? 'border-neutral-700' : 'border-slate-200'}`}>
                                    <button
                                        onClick={() => setExpandedReplacement(expandedReplacement === 'loom' ? null : 'loom')}
                                        className={`w-full flex items-center justify-between p-4 transition-colors ${
                                            eosMode ? 'hover:bg-neutral-800' : 'hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="bg-[#625DF5] p-2 rounded-xl">
                                                <Video className="w-5 h-5 text-white" />
                                            </div>
                                            <div className="text-left">
                                                <div className={`font-bold ${eosMode ? 'text-neutral-100' : 'text-slate-900'}`}>Loom Script</div>
                                                <div className={`text-xs ${eosMode ? 'text-neutral-500' : 'text-slate-500'}`}>Video recording outline</div>
                                            </div>
                                        </div>
                                        {expandedReplacement === 'loom'
                                            ? <ChevronUp className={`w-5 h-5 ${eosMode ? 'text-neutral-500' : 'text-slate-400'}`} />
                                            : <ChevronDown className={`w-5 h-5 ${eosMode ? 'text-neutral-500' : 'text-slate-400'}`} />}
                                    </button>
                                    {expandedReplacement === 'loom' && (
                                        <div className={`border-t p-4 ${
                                            eosMode ? 'border-neutral-700 bg-neutral-800' : 'border-slate-200 bg-slate-50'
                                        }`}>
                                            <pre className={`text-sm whitespace-pre-wrap font-mono p-4 rounded-xl border max-h-64 overflow-y-auto ${
                                                eosMode
                                                    ? 'bg-neutral-900 text-neutral-300 border-neutral-700'
                                                    : 'bg-white text-slate-700 border-slate-200'
                                            }`}>
                                                {generateLoomScript()}
                                            </pre>
                                            <button
                                                onClick={() => copyReplacement('loom')}
                                                className="mt-3 flex items-center gap-2 px-4 py-2 bg-[#625DF5] text-white rounded-xl font-bold text-sm hover:bg-[#4f4ad4] transition-all"
                                            >
                                                {replacementCopied === 'loom' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                                {replacementCopied === 'loom' ? 'Copied!' : 'Copy to Clipboard'}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Async Doc */}
                                <div className={`border rounded-2xl overflow-hidden ${eosMode ? 'border-neutral-700' : 'border-slate-200'}`}>
                                    <button
                                        onClick={() => setExpandedReplacement(expandedReplacement === 'doc' ? null : 'doc')}
                                        className={`w-full flex items-center justify-between p-4 transition-colors ${
                                            eosMode ? 'hover:bg-neutral-800' : 'hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="bg-emerald-500 p-2 rounded-xl">
                                                <FileText className="w-5 h-5 text-white" />
                                            </div>
                                            <div className="text-left">
                                                <div className={`font-bold ${eosMode ? 'text-neutral-100' : 'text-slate-900'}`}>Async Document</div>
                                                <div className={`text-xs ${eosMode ? 'text-neutral-500' : 'text-slate-500'}`}>Notion/Google Doc template</div>
                                            </div>
                                        </div>
                                        {expandedReplacement === 'doc'
                                            ? <ChevronUp className={`w-5 h-5 ${eosMode ? 'text-neutral-500' : 'text-slate-400'}`} />
                                            : <ChevronDown className={`w-5 h-5 ${eosMode ? 'text-neutral-500' : 'text-slate-400'}`} />}
                                    </button>
                                    {expandedReplacement === 'doc' && (
                                        <div className={`border-t p-4 ${
                                            eosMode ? 'border-neutral-700 bg-neutral-800' : 'border-slate-200 bg-slate-50'
                                        }`}>
                                            <pre className={`text-sm whitespace-pre-wrap font-mono p-4 rounded-xl border max-h-64 overflow-y-auto ${
                                                eosMode
                                                    ? 'bg-neutral-900 text-neutral-300 border-neutral-700'
                                                    : 'bg-white text-slate-700 border-slate-200'
                                            }`}>
                                                {generateAsyncDoc()}
                                            </pre>
                                            <button
                                                onClick={() => copyReplacement('doc')}
                                                className="mt-3 flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition-all"
                                            >
                                                {replacementCopied === 'doc' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                                {replacementCopied === 'doc' ? 'Copied!' : 'Copy to Clipboard'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* EOS Meeting Run Sheet - for protected EOS meetings */}
                {data.isProtectedEOS && data.protectedType && EOS_RUN_SHEETS[data.protectedType] && (
                    <div className="rounded-[2.5rem] shadow-2xl overflow-hidden bg-neutral-900 border border-neutral-800">
                        <div className="p-6 sm:p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600">
                                    <ListChecks className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-extrabold text-neutral-100">
                                        {EOS_RUN_SHEETS[data.protectedType].title} Run Sheet
                                    </h2>
                                    <p className="text-sm text-neutral-400">
                                        Standard EOS agenda — copy and use for your meeting
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {EOS_RUN_SHEETS[data.protectedType].sections.map((section, i) => (
                                    <div key={i} className="rounded-xl border border-neutral-700 overflow-hidden">
                                        <button
                                            onClick={() => setActiveRunSheet(activeRunSheet === section.name ? null : section.name)}
                                            className="w-full flex items-center justify-between p-4 hover:bg-neutral-800 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
                                                    {i + 1}
                                                </span>
                                                <span className="font-bold text-neutral-100">{section.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-mono text-neutral-500">{section.time}</span>
                                                {activeRunSheet === section.name
                                                    ? <ChevronUp className="w-4 h-4 text-neutral-500" />
                                                    : <ChevronDown className="w-4 h-4 text-neutral-500" />
                                                }
                                            </div>
                                        </button>
                                        {activeRunSheet === section.name && (
                                            <div className="px-4 pb-4 pt-0 border-t border-neutral-700">
                                                <ul className="space-y-1.5 mt-3">
                                                    {section.details.map((detail, j) => (
                                                        <li key={j} className="flex items-start gap-2 text-sm text-neutral-400">
                                                            <span className="text-amber-500 mt-0.5">•</span>
                                                            {detail}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => copyRunSheet(data.protectedType!)}
                                className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm transition-all bg-amber-500 text-black hover:bg-amber-400"
                            >
                                {runSheetCopied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                {runSheetCopied ? 'Copied!' : 'Copy Full Run Sheet'}
                            </button>
                        </div>
                    </div>
                )}

                {/* AI Notetaker Recommendation - for meetings that should happen */}
                {(data.recommendation === 'PROCEED' || data.recommendation === 'SHORTEN') && (
                    <div className={`rounded-[2.5rem] shadow-2xl overflow-hidden ${
                        eosMode ? 'bg-neutral-900 border border-neutral-800' : 'bg-white'
                    }`}>
                        <div className="p-6 sm:p-8">
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`p-3 rounded-2xl ${
                                    eosMode
                                        ? 'bg-gradient-to-br from-blue-500 to-cyan-600'
                                        : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                                }`}>
                                    <Video className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className={`text-xl font-extrabold ${eosMode ? 'text-neutral-100' : 'text-slate-900'}`}>
                                        Record & Capture
                                    </h2>
                                    <p className={`text-sm ${eosMode ? 'text-neutral-400' : 'text-slate-500'}`}>
                                        Use an AI notetaker to capture action items and decisions automatically
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {/* AFFILIATE LINKS: Replace these URLs with your affiliate tracking links:
                                    - Fathom: Sign up at fathom.video/affiliates (PartnerStack) → 20% recurring 12mo
                                    - Fireflies: Sign up at fireflies.ai/affiliates → 10-30% recurring 12mo
                                    - Otter.ai: Search "Otter.ai affiliate" on Impact.com → 15-60% per conversion */}
                                {[
                                    {
                                        name: 'Fathom',
                                        desc: 'Free unlimited recording. Auto-captures action items and highlights from Zoom, Teams, and Meet.',
                                        url: 'https://fathom.video',
                                        logo: (
                                            <svg viewBox="0 0 150 150" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M113.08,85.46L26.9,38.39c-7.96-4.64-10.61-13.92-5.96-21.88,4.64-7.29,14.58-9.94,22.54-5.96l86.18,47.07c7.96,4.64,10.61,13.92,5.97,21.88-3.98,7.96-14.58,10.61-22.54,5.97h0Z" fill="#00BEFF"/>
                                                <path d="M73.31,113.96l-45.74-25.19c-7.96-4.64-10.61-13.92-5.97-21.88,4.64-7.29,14.58-9.94,22.54-5.96l45.74,25.19c7.95,4.64,10.6,13.92,5.96,21.88-4.64,7.29-14.58,9.94-22.54,5.96h0Z" fill="#00BEFF"/>
                                                <path d="M19.34,124.73v-49.06c0-9.28,7.29-16.57,16.57-16.57s16.57,7.29,16.57,16.57v49.06c0,9.28-7.29,16.57-16.57,16.57s-16.57-7.29-16.57-16.57h0Z" fill="#00BEFF" opacity="0.5"/>
                                            </svg>
                                        ),
                                        logoBg: 'bg-[#0a1628]',
                                    },
                                    {
                                        name: 'Fireflies',
                                        desc: 'AI-powered transcripts, searchable meeting history, and smart summaries across all platforms.',
                                        url: 'https://fireflies.ai/?fpr=chad10',
                                        logo: (
                                            <svg className="w-5 h-5" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <defs>
                                                    <linearGradient id="ff-g1" x1="25.73" y1="26.42" x2="-18.49" y2="-20.04" gradientUnits="userSpaceOnUse">
                                                        <stop stopColor="#E82A73"/><stop offset="0.3" stopColor="#C5388F"/><stop offset="0.54" stopColor="#9B4AB0"/><stop offset="0.818" stopColor="#6262DE"/><stop offset="0.994" stopColor="#3B73FF"/>
                                                    </linearGradient>
                                                    <linearGradient id="ff-g2" x1="25.88" y1="26.28" x2="-18.34" y2="-20.19" gradientUnits="userSpaceOnUse">
                                                        <stop stopColor="#FF3C82"/><stop offset="0.274" stopColor="#DC4598"/><stop offset="0.492" stopColor="#B251B2"/><stop offset="0.745" stopColor="#7961D7"/><stop offset="0.994" stopColor="#3B73FF"/>
                                                    </linearGradient>
                                                    <linearGradient id="ff-g3" x1="33.23" y1="19.29" x2="18.25" y2="-35.01" gradientUnits="userSpaceOnUse">
                                                        <stop stopColor="#E82A73"/><stop offset="0.3" stopColor="#C5388F"/><stop offset="0.54" stopColor="#9B4AB0"/><stop offset="0.818" stopColor="#6262DE"/><stop offset="0.994" stopColor="#3B73FF"/>
                                                    </linearGradient>
                                                    <linearGradient id="ff-g4" x1="18.48" y1="33.32" x2="-35.16" y2="16.98" gradientUnits="userSpaceOnUse">
                                                        <stop stopColor="#E82A73"/><stop offset="0.3" stopColor="#C5388F"/><stop offset="0.54" stopColor="#9B4AB0"/><stop offset="0.818" stopColor="#6262DE"/><stop offset="0.994" stopColor="#3B73FF"/>
                                                    </linearGradient>
                                                </defs>
                                                <path d="M10.52 0H0V10.44H10.52V0Z" fill="url(#ff-g1)"/>
                                                <path d="M22.98 12.61H12.46V23.05H22.98V12.61Z" fill="url(#ff-g2)"/>
                                                <path d="M22.98 0H12.46V10.44H32V8.95C32 6.58 31.05 4.3 29.36 2.62C27.67 0.94 25.37 0 22.98 0Z" fill="url(#ff-g3)"/>
                                                <path d="M0 12.61V23.05C0 25.42 0.95 27.7 2.64 29.38C4.33 31.06 6.63 32 9.02 32H10.52V12.61H0Z" fill="url(#ff-g4)"/>
                                                <path opacity="0.18" d="M0 0L10.52 10.44H0V0Z" fill="#9B4AB0"/>
                                                <path opacity="0.18" d="M12.46 12.61L22.98 23.05H12.46V12.61Z" fill="#9B4AB0"/>
                                            </svg>
                                        ),
                                        logoBg: 'bg-[#1a1033]',
                                    },
                                    {
                                        name: 'Otter.ai',
                                        desc: 'Real-time transcription and collaboration. Great for teams that need live notes and shared highlights.',
                                        url: 'https://otter.ai/referrals/VFGFRNBK',
                                        logo: (
                                            <svg className="w-5 h-5" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M16 2C8.27 2 2 8.27 2 16s6.27 14 14 14 14-6.27 14-14S23.73 2 16 2zm0 22.4c-4.64 0-8.4-3.76-8.4-8.4S11.36 7.6 16 7.6s8.4 3.76 8.4 8.4-3.76 8.4-8.4 8.4z" fill="#007AFF"/>
                                                <circle cx="12.5" cy="14" r="1.8" fill="#007AFF"/>
                                                <circle cx="19.5" cy="14" r="1.8" fill="#007AFF"/>
                                                <path d="M12.8 18.5c0 0 1.5 2 3.2 2s3.2-2 3.2-2" stroke="#007AFF" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                                            </svg>
                                        ),
                                        logoBg: 'bg-[#e8f4ff]',
                                    },
                                ].map((tool) => (
                                    <a
                                        key={tool.name}
                                        href={tool.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`flex items-center gap-3 p-4 rounded-2xl border transition-all hover:scale-[1.02] cursor-pointer ${
                                            eosMode
                                                ? 'border-neutral-700 hover:border-neutral-600 bg-neutral-800'
                                                : 'border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-white'
                                        }`}
                                    >
                                        <div className={`w-10 h-10 ${tool.logoBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                                            {tool.logo}
                                        </div>
                                        <div className="min-w-0">
                                            <div className={`font-bold text-sm ${eosMode ? 'text-neutral-200' : 'text-slate-800'}`}>{tool.name}</div>
                                            <div className={`text-xs ${eosMode ? 'text-neutral-500' : 'text-slate-500'}`}>{tool.desc}</div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
