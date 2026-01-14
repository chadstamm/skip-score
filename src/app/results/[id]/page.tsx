'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Logo } from '@/components/Logo';
import { AssessmentData, Recommendation } from '@/lib/types';
import { calculateSavings, calculateActionPlan } from '@/lib/scoring';
import {
    ArrowLeft,
    Copy,
    Share2,
    CheckCircle2,
    AlertCircle,
    Clock,
    Banknote,
    LayoutDashboard
} from 'lucide-react';
import Link from 'next/link';

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
    const [activeTab, setActiveTab] = useState<'suggestions' | 'action_plan'>('suggestions');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const history = JSON.parse(localStorage.getItem('skip-score-history') || '[]');
        const assessment = history.find((h: AssessmentData) => h.id === id);
        if (assessment) {
            setData(assessment);
        } else {
            router.push('/');
        }
    }, [id, router]);

    if (!data) return null;

    const savings = calculateSavings(data, data.score || 0, data.recommendation || 'PROCEED');
    const actionPlan = calculateActionPlan(data, data.recommendation || 'PROCEED');
    const style = REC_STYLES[data.recommendation || 'PROCEED'];

    const copyResults = () => {
        const text = `SkipScore Results: ${data.title}\nScore: ${data.score}/10\nRecommendation: ${style.label}\nDescription: ${style.description}`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <main className="min-h-screen p-4 sm:p-8 flex flex-col items-center">
            <div className="max-w-4xl w-full space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <Link href="/assess" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors font-bold">
                        <ArrowLeft className="w-5 h-5" /> New Assessment
                    </Link>
                    <Link href="/"><Logo className="scale-75 origin-right cursor-pointer" variant="white" /></Link>
                </div>

                {/* Main Result Card */}
                <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden">
                    <div className="p-8 sm:p-12 space-y-10">
                        {/* Header / Score */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                            <div className="space-y-4">
                                <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight">
                                    {data.title}
                                </h1>
                                <div className={`inline-flex items-center gap-2 px-6 py-2 rounded-full font-bold ${style.bg} ${style.text}`}>
                                    <AlertCircle className="w-5 h-5" />
                                    {style.label}
                                </div>
                                <p className="text-lg text-slate-600 font-medium max-w-lg">
                                    {data.reasoning || style.description}
                                </p>
                            </div>

                            <div className="relative w-32 h-32 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="58"
                                        stroke="currentColor"
                                        strokeWidth="10"
                                        fill="transparent"
                                        className="text-slate-100"
                                    />
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="58"
                                        stroke="currentColor"
                                        strokeWidth="10"
                                        fill="transparent"
                                        strokeDasharray={364}
                                        strokeDashoffset={364 - (364 * (data.score || 0)) / 10}
                                        strokeLinecap="round"
                                        className="text-score-teal transition-all duration-1000"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-black text-slate-900">{data.score}</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center leading-tight">My<br />SkipScore</span>
                                </div>
                            </div>
                        </div>

                        {/* Savings Hero (Left: Time, Right: Money) */}
                        <div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-slate-50 p-6 rounded-3xl flex items-center gap-4">
                                    <div className="bg-teal-100 p-3 rounded-2xl">
                                        <Clock className="text-score-teal w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-black text-slate-900">{savings.potentialHoursSaved.toFixed(1)} hrs</div>
                                        <div className="text-xs font-bold text-slate-500 uppercase">Time Reclaimable</div>
                                    </div>
                                </div>
                                <div className="bg-slate-50 p-6 rounded-3xl flex items-center gap-4">
                                    <div className="bg-orange-100 p-3 rounded-2xl">
                                        <Banknote className="text-skip-coral w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-black text-slate-900">${savings.savings.toLocaleString()}</div>
                                        <div className="text-xs font-bold text-slate-500 uppercase">Potential Savings</div>
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-slate-400 mt-3 font-medium text-center sm:text-left">* Calculations based on avg. $75/hr per attendee.</p>
                        </div>

                        {/* Tabs */}
                        <div className="space-y-6">
                            <div className="flex border-b border-slate-100 overflow-x-auto">
                                <button
                                    onClick={() => setActiveTab('suggestions')}
                                    className={`px-6 py-4 font-bold text-sm uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'suggestions'
                                        ? 'text-score-teal border-b-2 border-score-teal'
                                        : 'text-slate-400 hover:text-slate-600'
                                        }`}
                                >
                                    Suggestions
                                </button>
                                <button
                                    onClick={() => setActiveTab('action_plan')}
                                    className={`px-6 py-4 font-bold text-sm uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'action_plan'
                                        ? 'text-score-teal border-b-2 border-score-teal'
                                        : 'text-slate-400 hover:text-slate-600'
                                        }`}
                                >
                                    Action Plan
                                </button>
                            </div>

                            <div className="min-h-[200px]">
                                {activeTab === 'suggestions' && (
                                    <div className="space-y-4 animate-in fade-in duration-300">
                                        <p className="text-lg text-slate-600 font-medium leading-relaxed">
                                            {style.description}
                                        </p>
                                        <div className="grid grid-cols-2 gap-4 pt-4">
                                            <div className="p-4 bg-slate-50 rounded-2xl">
                                                <div className="text-xs font-bold text-slate-400 uppercase mb-1">Purpose</div>
                                                <div className="font-bold text-slate-800">{data.purpose.replace('_', ' ')}</div>
                                            </div>
                                            <div className="p-4 bg-slate-50 rounded-2xl">
                                                <div className="text-xs font-bold text-slate-400 uppercase mb-1">Interactivity</div>
                                                <div className="font-bold text-slate-800">{data.interactivity}</div>
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-slate-100">
                                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Score Guide</h3>
                                            <div className="space-y-2">
                                                {[
                                                    { range: '0.0 - 2.9', label: 'SKIP', desc: 'Low value, cancel it', rec: 'SKIP' },
                                                    { range: '3.0 - 4.9', label: 'ASYNC FIRST', desc: 'Use email/Slack', rec: 'ASYNC_FIRST' },
                                                    { range: '5.0 - 6.9', label: 'SHORTEN', desc: 'Too long/large', rec: 'SHORTEN' },
                                                    { range: '7.0 - 10.0', label: 'PROCEED', desc: 'Well planned', rec: 'PROCEED' }
                                                ].map((tier) => {
                                                    const isCurrent = data.recommendation === tier.rec;
                                                    const tierStyle = REC_STYLES[tier.rec as Recommendation];
                                                    return (
                                                        <div key={tier.label} className={`flex items-center justify-between p-3 rounded-xl text-sm transition-all ${isCurrent ? 'bg-slate-900 text-white shadow-lg scale-[1.02] ring-2 ring-offset-2 ring-slate-900' : 'bg-slate-50 text-slate-500'}`}>
                                                            <div className="flex items-center gap-4">
                                                                <span className={`font-mono font-bold w-20 ${isCurrent ? 'text-white' : 'text-slate-400'}`}>{tier.range}</span>
                                                                <span className={`font-bold ${isCurrent ? 'text-white' : tierStyle.text}`}>{tier.label}</span>
                                                            </div>
                                                            <span className={`hidden sm:block ${isCurrent ? 'text-white/80' : 'text-slate-400'}`}>{tier.desc}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'action_plan' && (
                                    <div className="space-y-3 animate-in fade-in duration-300">
                                        {actionPlan.map((item, i) => (
                                            <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                <CheckCircle2 className="w-5 h-5 text-score-teal" />
                                                <span className="font-medium text-slate-700">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="bg-slate-50 p-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={copyResults}
                                className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-100 transition-all shadow-sm"
                            >
                                {copied ? <CheckCircle2 className="w-5 h-5 text-teal-500" /> : <Copy className="w-5 h-5" />}
                                {copied ? 'Copied!' : 'Copy Results'}
                            </button>
                            <button className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-all shadow-sm">
                                <Share2 className="w-5 h-5 text-slate-600" />
                            </button>
                        </div>

                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2 px-6 py-3 bg-skip-coral text-white rounded-xl font-bold hover:bg-orange-600 transition-all shadow-lg"
                        >
                            <LayoutDashboard className="w-5 h-5" /> Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
