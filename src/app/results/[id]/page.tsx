'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Logo } from '@/components/Logo';
import { AssessmentData, Recommendation } from '@/lib/types';
import { calculateSavings, calculateActionPlan, calculateScoreBreakdown } from '@/lib/scoring';
import {
    ArrowLeft,
    Copy,
    Share2,
    CheckCircle2,
    AlertCircle,
    Clock,
    Banknote,
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
    Calendar
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
            const targetScore = data.score || 0;
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

                    // Trigger confetti for SKIP or ASYNC_FIRST (saving time!)
                    if (data.recommendation === 'SKIP' || data.recommendation === 'ASYNC_FIRST') {
                        confetti({
                            particleCount: 100,
                            spread: 70,
                            origin: { y: 0.6 },
                            colors: ['#F97316', '#0d9488', '#fbbf24', '#f472b6']
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
    const actionPlan = calculateActionPlan(data, data.recommendation || 'PROCEED');
    const scoreBreakdown = calculateScoreBreakdown(data);
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

    const progressOffset = animationComplete
        ? 452 - (452 * (data.score || 0)) / 10
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
                                <h1 className={`text-3xl sm:text-4xl font-extrabold leading-tight ${
                                    eosMode ? 'text-neutral-100' : 'text-slate-900'
                                }`}>
                                    {data.title}
                                </h1>
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
                            </div>

                            {/* Right: Score Circle + Guide */}
                            <div className="flex flex-col items-center gap-4">
                                <div className="relative w-40 h-40 flex items-center justify-center">
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
                                        <span className={`text-[10px] font-bold uppercase tracking-widest text-center leading-tight ${eosMode ? 'text-neutral-500' : 'text-slate-400'}`}>Skip<br />Score</span>
                                    </div>
                                </div>

                                {/* Score Guide */}
                                <div className={`w-full max-w-[280px] space-y-1.5 ${animationComplete ? 'animate-in fade-in slide-in-from-bottom-4 duration-500' : 'opacity-0'}`}>
                                    {[
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
                                    })}
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
                                    {eosMode ? 'Action Items' : 'Suggestions'}
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
                                                const annualSavings = savings.savings * multiplier;
                                                return `${annualHours.toFixed(0)} hrs & $${annualSavings.toLocaleString()} per year`;
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                            {/* Savings Stats */}
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2.5 rounded-xl ${eosMode ? 'bg-amber-500/20' : 'bg-teal-100'}`}>
                                        <Clock className={`w-5 h-5 ${eosMode ? 'text-amber-500' : 'text-score-teal'}`} />
                                    </div>
                                    <div>
                                        <div className={`text-xl font-black ${eosMode ? 'text-neutral-100' : 'text-slate-900'}`}>{savings.potentialHoursSaved.toFixed(1)} hrs</div>
                                        <div className={`text-[10px] font-bold uppercase ${eosMode ? 'text-neutral-500' : 'text-slate-500'}`}>{data.isRecurring ? 'Per Meeting' : 'Reclaimable'}</div>
                                    </div>
                                </div>
                                <div className={`w-px h-10 ${eosMode ? 'bg-neutral-700' : 'bg-slate-200'}`} />
                                <div className="flex items-center gap-3">
                                    <div className={`p-2.5 rounded-xl ${eosMode ? 'bg-orange-500/20' : 'bg-orange-100'}`}>
                                        <Banknote className={`w-5 h-5 ${eosMode ? 'text-orange-400' : 'text-skip-coral'}`} />
                                    </div>
                                    <div>
                                        <div className={`text-xl font-black ${eosMode ? 'text-neutral-100' : 'text-slate-900'}`}>${savings.savings.toLocaleString()}</div>
                                        <div className={`text-[10px] font-bold uppercase ${eosMode ? 'text-neutral-500' : 'text-slate-500'}`}>{data.isRecurring ? 'Per Meeting' : 'Potential Savings'}</div>
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
                        <p className={`text-[10px] mt-3 font-medium ${eosMode ? 'text-neutral-600' : 'text-slate-400'}`}>* Based on avg. $75/hr per attendee</p>
                    </div>
                </div>

                {/* Meeting Replacement Generator - Only for SKIP/ASYNC_FIRST */}
                {(data.recommendation === 'SKIP' || data.recommendation === 'ASYNC_FIRST') && (
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
            </div>
        </main>
    );
}
