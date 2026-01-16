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
    ChevronUp
} from 'lucide-react';
import Link from 'next/link';
import confetti from 'canvas-confetti';

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
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/assess" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors font-bold">
                            <ArrowLeft className="w-5 h-5" /> New Assessment
                        </Link>
                        <Link href="/dashboard" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors font-bold">
                            <LayoutDashboard className="w-5 h-5" /> Dashboard
                        </Link>
                    </div>
                    <Link href="/"><Logo className="scale-75 origin-right cursor-pointer" variant="white" /></Link>
                </div>

                {/* Main Result Card */}
                <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden">
                    <div className="p-6 sm:p-10 space-y-8">
                        {/* Top Section - 50/50 Split */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                            {/* Left: Title + Badge + Reasoning */}
                            <div className="space-y-4">
                                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
                                    {data.title}
                                </h1>
                                <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full font-bold ${style.bg} ${style.text} ${animationComplete ? 'animate-in zoom-in duration-300' : 'opacity-0'}`}>
                                    <AlertCircle className="w-5 h-5" />
                                    {style.label}
                                </div>
                                <p className={`text-base text-slate-600 font-medium leading-relaxed ${animationComplete ? 'animate-in fade-in slide-in-from-bottom-2 duration-500' : 'opacity-0'}`}>
                                    {data.reasoning || style.description}
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
                                            className="text-slate-100"
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
                                            className="text-score-teal transition-all duration-100"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-5xl font-black text-slate-900 tabular-nums">{displayScore}</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center leading-tight">Skip<br />Score</span>
                                    </div>
                                </div>

                                {/* Score Guide */}
                                <div className={`w-full max-w-[280px] space-y-1.5 ${animationComplete ? 'animate-in fade-in slide-in-from-bottom-4 duration-500' : 'opacity-0'}`}>
                                    {[
                                        { range: '0 - 2.9', label: 'SKIP', rec: 'SKIP' },
                                        { range: '3 - 4.9', label: 'ASYNC FIRST', rec: 'ASYNC_FIRST' },
                                        { range: '5 - 6.9', label: 'SHORTEN', rec: 'SHORTEN' },
                                        { range: '7 - 10', label: 'PROCEED', rec: 'PROCEED' }
                                    ].map((tier) => {
                                        const isCurrent = data.recommendation === tier.rec;
                                        const tierStyle = REC_STYLES[tier.rec as Recommendation];
                                        return (
                                            <div key={tier.label} className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${isCurrent ? 'bg-slate-900 text-white shadow-md scale-105' : 'bg-slate-50 text-slate-400'}`}>
                                                <span className="font-mono font-bold">{tier.range}</span>
                                                <span className={`font-bold ${isCurrent ? 'text-white' : tierStyle.text}`}>{tier.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Tabs Section */}
                        <div className="space-y-4">
                            <div className="flex border-b border-slate-200 overflow-x-auto">
                                <button
                                    onClick={() => setActiveTab('suggestions')}
                                    className={`px-5 py-3 font-bold text-sm uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === 'suggestions'
                                        ? 'text-score-teal border-b-2 border-score-teal'
                                        : 'text-slate-400 hover:text-slate-600'
                                        }`}
                                >
                                    Suggestions
                                </button>
                                <button
                                    onClick={() => setActiveTab('breakdown')}
                                    className={`px-5 py-3 font-bold text-sm uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === 'breakdown'
                                        ? 'text-score-teal border-b-2 border-score-teal'
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
                                                <div key={i} className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-colors">
                                                    <CheckCircle2 className="w-5 h-5 text-score-teal flex-shrink-0 mt-0.5" />
                                                    <span className="font-medium text-slate-700">{item}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Attendee suggestions for low scores */}
                                        {(data.recommendation === 'SKIP' || data.recommendation === 'ASYNC_FIRST' || data.recommendation === 'SHORTEN') && data.attendees.length > 2 && (
                                            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <AlertCircle className="w-4 h-4 text-amber-600" />
                                                    <span className="text-sm font-bold text-amber-700">Consider Reducing Attendees</span>
                                                </div>
                                                <p className="text-sm text-amber-700 mb-3">
                                                    With {data.attendees.length} attendees, you could mark some as optional:
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {data.attendees
                                                        .filter(a => !a.isDRI && !a.isOptional)
                                                        .slice(0, 3)
                                                        .map((attendee, i) => (
                                                            <span key={i} className="px-3 py-1 bg-white rounded-full text-xs font-medium text-amber-700 border border-amber-200">
                                                                {attendee.name} → Optional?
                                                            </span>
                                                        ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'breakdown' && (
                                    <div className="animate-in fade-in duration-300 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* Helping Factors */}
                                        <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
                                            <div className="flex items-center gap-2 mb-4">
                                                <TrendingUp className="w-5 h-5 text-emerald-600" />
                                                <h3 className="font-bold text-emerald-700 text-sm uppercase tracking-wide">Helping Your Score</h3>
                                            </div>
                                            <div className="space-y-2">
                                                {scoreBreakdown.helping.length > 0 ? (
                                                    scoreBreakdown.helping.map((factor, i) => (
                                                        <div key={i} className="flex items-center justify-between p-2.5 bg-white rounded-xl">
                                                            <div>
                                                                <div className="font-bold text-slate-700 text-sm">{factor.label}</div>
                                                                <div className="text-xs text-slate-500">{factor.description}</div>
                                                            </div>
                                                            <span className="text-emerald-600 font-bold text-sm">+{factor.impact.toFixed(1)}</span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-sm text-emerald-600/70 italic">No positive factors</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Hurting Factors */}
                                        <div className="bg-orange-50 rounded-2xl p-5 border border-orange-100">
                                            <div className="flex items-center gap-2 mb-4">
                                                <TrendingDown className="w-5 h-5 text-orange-600" />
                                                <h3 className="font-bold text-orange-700 text-sm uppercase tracking-wide">Hurting Your Score</h3>
                                            </div>
                                            <div className="space-y-2">
                                                {scoreBreakdown.hurting.length > 0 ? (
                                                    scoreBreakdown.hurting.map((factor, i) => (
                                                        <div key={i} className="flex items-center justify-between p-2.5 bg-white rounded-xl">
                                                            <div>
                                                                <div className="font-bold text-slate-700 text-sm">{factor.label}</div>
                                                                <div className="text-xs text-slate-500">{factor.description}</div>
                                                            </div>
                                                            <span className="text-orange-600 font-bold text-sm">{factor.impact.toFixed(1)}</span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-sm text-orange-600/70 italic">No negative factors</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Bottom: Savings Section */}
                    <div className="bg-slate-50 p-6 sm:p-8 border-t border-slate-100">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                            {/* Savings Stats */}
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-3">
                                    <div className="bg-teal-100 p-2.5 rounded-xl">
                                        <Clock className="text-score-teal w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-xl font-black text-slate-900">{savings.potentialHoursSaved.toFixed(1)} hrs</div>
                                        <div className="text-[10px] font-bold text-slate-500 uppercase">Reclaimable</div>
                                    </div>
                                </div>
                                <div className="w-px h-10 bg-slate-200" />
                                <div className="flex items-center gap-3">
                                    <div className="bg-orange-100 p-2.5 rounded-xl">
                                        <Banknote className="text-skip-coral w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-xl font-black text-slate-900">${savings.savings.toLocaleString()}</div>
                                        <div className="text-[10px] font-bold text-slate-500 uppercase">Potential Savings</div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col items-end gap-2">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Share Your Results</span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={copyResults}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-sm text-slate-700 hover:bg-slate-100 transition-all shadow-sm"
                                    >
                                        {copied ? <CheckCircle2 className="w-4 h-4 text-teal-500" /> : <Copy className="w-4 h-4" />}
                                        {copied ? 'Copied!' : 'Copy'}
                                    </button>
                                    <button
                                        onClick={shareToSlack}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-[#4A154B] text-white rounded-xl font-bold text-sm hover:bg-[#3a1039] transition-all shadow-sm"
                                    >
                                        {slackCopied ? <CheckCircle2 className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                                        {slackCopied ? 'Copied for Slack!' : 'Slack'}
                                    </button>
                                    <button
                                        onClick={shareViaEmail}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-skip-coral text-white rounded-xl font-bold text-sm hover:bg-orange-600 transition-all shadow-sm"
                                    >
                                        <Mail className="w-4 h-4" /> Email
                                    </button>
                                </div>
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-3 font-medium">* Based on avg. $75/hr per attendee</p>
                    </div>
                </div>

                {/* Meeting Replacement Generator - Only for SKIP/ASYNC_FIRST */}
                {(data.recommendation === 'SKIP' || data.recommendation === 'ASYNC_FIRST') && (
                    <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden">
                        <div className="p-6 sm:p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-3 rounded-2xl">
                                    <Sparkles className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-extrabold text-slate-900">Meeting Replacement Generator</h2>
                                    <p className="text-sm text-slate-500">Ready-to-use templates to replace this meeting</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {/* Slack Message */}
                                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                                    <button
                                        onClick={() => setExpandedReplacement(expandedReplacement === 'slack' ? null : 'slack')}
                                        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="bg-[#4A154B] p-2 rounded-xl">
                                                <MessageSquare className="w-5 h-5 text-white" />
                                            </div>
                                            <div className="text-left">
                                                <div className="font-bold text-slate-900">Slack Message</div>
                                                <div className="text-xs text-slate-500">Ready-to-post async update</div>
                                            </div>
                                        </div>
                                        {expandedReplacement === 'slack' ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                                    </button>
                                    {expandedReplacement === 'slack' && (
                                        <div className="border-t border-slate-200 p-4 bg-slate-50">
                                            <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans bg-white p-4 rounded-xl border border-slate-200 max-h-64 overflow-y-auto">
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
                                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                                    <button
                                        onClick={() => setExpandedReplacement(expandedReplacement === 'loom' ? null : 'loom')}
                                        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="bg-[#625DF5] p-2 rounded-xl">
                                                <Video className="w-5 h-5 text-white" />
                                            </div>
                                            <div className="text-left">
                                                <div className="font-bold text-slate-900">Loom Script</div>
                                                <div className="text-xs text-slate-500">Video recording outline</div>
                                            </div>
                                        </div>
                                        {expandedReplacement === 'loom' ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                                    </button>
                                    {expandedReplacement === 'loom' && (
                                        <div className="border-t border-slate-200 p-4 bg-slate-50">
                                            <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono bg-white p-4 rounded-xl border border-slate-200 max-h-64 overflow-y-auto">
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
                                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                                    <button
                                        onClick={() => setExpandedReplacement(expandedReplacement === 'doc' ? null : 'doc')}
                                        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="bg-emerald-500 p-2 rounded-xl">
                                                <FileText className="w-5 h-5 text-white" />
                                            </div>
                                            <div className="text-left">
                                                <div className="font-bold text-slate-900">Async Document</div>
                                                <div className="text-xs text-slate-500">Notion/Google Doc template</div>
                                            </div>
                                        </div>
                                        {expandedReplacement === 'doc' ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                                    </button>
                                    {expandedReplacement === 'doc' && (
                                        <div className="border-t border-slate-200 p-4 bg-slate-50">
                                            <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono bg-white p-4 rounded-xl border border-slate-200 max-h-64 overflow-y-auto">
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
