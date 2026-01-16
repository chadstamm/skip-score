'use client';

import React, { useState, useEffect } from 'react';
import { Logo } from '@/components/Logo';
import { AssessmentData } from '@/lib/types';
import { calculateSavings } from '@/lib/scoring';
import {
    Plus,
    Search,
    Trash2,
    ChevronRight,
    TrendingUp,
    Clock,
    Banknote,
    Sparkles,
    RotateCcw,
    Calendar,
    Target,
    MessageCircleQuestion,
    Settings,
    X,
    Zap
} from 'lucide-react';
import Link from 'next/link';
import PostMeetingFeedback from '@/components/PostMeetingFeedback';
import { useEOS } from '@/contexts/EOSContext';

export default function Dashboard() {
    const [history, setHistory] = useState<AssessmentData[]>([]);
    const [search, setSearch] = useState('');
    const [dismissedFeedback, setDismissedFeedback] = useState<string[]>([]);
    const [showSettings, setShowSettings] = useState(false);
    const { eosMode, toggleEosMode } = useEOS();

    useEffect(() => {
        const data = JSON.parse(localStorage.getItem('skip-score-history') || '[]');
        setHistory(data);
        const dismissed = JSON.parse(localStorage.getItem('skip-score-dismissed-feedback') || '[]');
        setDismissedFeedback(dismissed);
    }, []);

    // Get meetings that need feedback (PROCEED meetings from 24+ hours ago without feedback)
    const needsFeedback = history.filter(h => {
        if (h.recommendation !== 'PROCEED' && h.recommendation !== 'SHORTEN') return false;
        if (h.feedbackSubmitted) return false;
        if (dismissedFeedback.includes(h.id)) return false;
        const hoursSince = (Date.now() - new Date(h.createdAt).getTime()) / (1000 * 60 * 60);
        return hoursSince >= 24 && hoursSince < 168; // Between 24 hours and 1 week
    });

    const submitFeedback = (id: string, feedback: { wasNecessary: boolean; couldBeAsync: boolean }) => {
        const updated = history.map(h =>
            h.id === id ? { ...h, feedbackSubmitted: true, wasNecessary: feedback.wasNecessary, couldBeAsync: feedback.couldBeAsync } : h
        );
        setHistory(updated);
        localStorage.setItem('skip-score-history', JSON.stringify(updated));
    };

    const dismissFeedback = (id: string) => {
        const updated = [...dismissedFeedback, id];
        setDismissedFeedback(updated);
        localStorage.setItem('skip-score-dismissed-feedback', JSON.stringify(updated));
    };

    const deleteAssessment = (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        const updated = history.filter(h => h.id !== id);
        setHistory(updated);
        localStorage.setItem('skip-score-history', JSON.stringify(updated));
    };

    const resetAll = () => {
        if (confirm('Are you sure you want to reset all assessments? This cannot be undone.')) {
            setHistory([]);
            localStorage.setItem('skip-score-history', JSON.stringify([]));
        }
    };

    const totals = history.reduce((acc, curr) => {
        const { savings, potentialHoursSaved } = calculateSavings(curr, curr.score || 0, curr.recommendation || 'PROCEED');
        return {
            costSaved: acc.costSaved + savings,
            hoursSaved: acc.hoursSaved + potentialHoursSaved
        };
    }, { costSaved: 0, hoursSaved: 0 });

    // Calculate this week's stats
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const thisWeekAssessments = history.filter(h => new Date(h.createdAt) >= oneWeekAgo);
    const thisWeekSavings = thisWeekAssessments.reduce((acc, curr) => {
        const { savings, potentialHoursSaved } = calculateSavings(curr, curr.score || 0, curr.recommendation || 'PROCEED');
        return {
            costSaved: acc.costSaved + savings,
            hoursSaved: acc.hoursSaved + potentialHoursSaved
        };
    }, { costSaved: 0, hoursSaved: 0 });

    // Recommendation breakdown
    const recCounts = history.reduce((acc, curr) => {
        const rec = curr.recommendation || 'PROCEED';
        acc[rec] = (acc[rec] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const filteredHistory = history.filter(h =>
        h.title.toLowerCase().includes(search.toLowerCase())
    );

    const recColors: Record<string, string> = {
        SKIP: 'bg-orange-500',
        ASYNC_FIRST: 'bg-teal-500',
        SHORTEN: 'bg-blue-500',
        PROCEED: 'bg-emerald-500'
    };

    const recLabels: Record<string, string> = {
        SKIP: 'Skip',
        ASYNC_FIRST: 'Async',
        SHORTEN: 'Shorten',
        PROCEED: 'Proceed'
    };

    return (
        <main className="min-h-screen p-4 sm:p-8 flex flex-col items-center">
            <div className="max-w-6xl w-full space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <Link href="/">
                        <div className={`px-4 py-3 rounded-2xl shadow-lg inline-flex items-center cursor-pointer hover:shadow-xl transition-shadow ${eosMode ? 'bg-neutral-900 border border-neutral-700' : 'bg-white'}`}>
                            <Logo variant={eosMode ? 'white' : undefined} />
                            {eosMode && (
                                <span className="ml-2 px-2 py-0.5 bg-orange-500/20 text-orange-400 text-[10px] font-bold rounded-full uppercase border border-orange-500/30">EOS</span>
                            )}
                        </div>
                    </Link>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className={`p-3 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 ${eosMode ? 'bg-neutral-800 text-neutral-300 border border-neutral-700' : 'bg-white text-slate-600'}`}
                        >
                            <Settings className="w-5 h-5" />
                        </button>
                        <Link
                            href="/assess"
                            className="bg-skip-coral text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-orange-600 transition-all hover:scale-105"
                        >
                            <Plus className="w-5 h-5" /> {eosMode ? 'Score Meeting' : 'New Assessment'}
                        </Link>
                    </div>
                </div>

                {/* Settings Panel */}
                {showSettings && (
                    <div className={`rounded-2xl shadow-xl p-6 animate-in fade-in slide-in-from-top-2 duration-300 ${eosMode ? 'bg-neutral-900 border border-neutral-700' : 'bg-white'}`}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className={`text-xl font-bold ${eosMode ? 'text-white' : 'text-slate-900'}`}>Settings</h3>
                            <button onClick={() => setShowSettings(false)} className={eosMode ? 'text-neutral-400 hover:text-neutral-200' : 'text-slate-400 hover:text-slate-600'}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* EOS Mode Toggle */}
                        <div className={`flex items-center justify-between p-4 rounded-xl border-2 ${eosMode ? 'border-neutral-700 bg-neutral-800' : 'border-slate-100 bg-slate-50'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl ${eosMode ? 'bg-orange-500/20' : 'bg-purple-100'}`}>
                                    <Zap className={`w-5 h-5 ${eosMode ? 'text-orange-400' : 'text-purple-600'}`} />
                                </div>
                                <div>
                                    <div className={`font-bold ${eosMode ? 'text-white' : 'text-slate-800'}`}>EOS / Traction Mode</div>
                                    <div className={`text-xs ${eosMode ? 'text-neutral-400' : 'text-slate-500'}`}>Dark theme with EOS terminology</div>
                                </div>
                            </div>
                            <button
                                onClick={toggleEosMode}
                                className={`relative w-14 h-8 rounded-full transition-colors ${eosMode ? 'bg-orange-500' : 'bg-slate-300'}`}
                            >
                                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${eosMode ? 'translate-x-7' : 'translate-x-1'}`} />
                            </button>
                        </div>

                        {eosMode && (
                            <div className="mt-4 p-4 bg-orange-500/10 rounded-xl border border-orange-500/20">
                                <div className="text-sm text-orange-300">
                                    <strong>EOS Mode enabled!</strong> L10 meetings will automatically score high.
                                    Non-essential meetings will be flagged for the Issues List.
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className={`glass-card p-5 rounded-2xl space-y-1 ${eosMode ? 'bg-neutral-900/90 border border-neutral-700' : ''}`}>
                        <div className={`flex items-center gap-2 mb-1 ${eosMode ? 'text-neutral-400' : 'text-slate-500'}`}>
                            <Banknote className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Total Savings</span>
                        </div>
                        <div className={`text-3xl font-black ${eosMode ? 'text-white' : 'text-slate-800'}`}>${totals.costSaved.toLocaleString()}</div>
                        <div className={`text-xs font-medium flex items-center gap-1 ${eosMode ? 'text-orange-400' : 'text-teal-600'}`}>
                            <TrendingUp className="w-3 h-3" /> All time
                        </div>
                    </div>

                    <div className={`glass-card p-5 rounded-2xl space-y-1 ${eosMode ? 'bg-neutral-900/90 border border-neutral-700' : ''}`}>
                        <div className={`flex items-center gap-2 mb-1 ${eosMode ? 'text-neutral-400' : 'text-slate-500'}`}>
                            <Clock className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Time Reclaimed</span>
                        </div>
                        <div className={`text-3xl font-black ${eosMode ? 'text-white' : 'text-slate-800'}`}>{totals.hoursSaved.toFixed(1)} hrs</div>
                        <div className={`text-xs font-medium ${eosMode ? 'text-neutral-400' : 'text-slate-500'}`}>{history.length} {eosMode ? 'meetings' : 'assessments'}</div>
                    </div>

                    <div className={`p-5 rounded-2xl space-y-1 text-white ${eosMode ? 'bg-gradient-to-br from-orange-600 to-orange-700' : 'glass-card bg-gradient-to-br from-teal-500 to-teal-600'}`}>
                        <div className={`flex items-center gap-2 mb-1 ${eosMode ? 'text-orange-100' : 'text-teal-100'}`}>
                            <Calendar className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">This Week</span>
                        </div>
                        <div className="text-3xl font-black">{thisWeekSavings.hoursSaved.toFixed(1)} hrs</div>
                        <div className={`text-xs font-medium ${eosMode ? 'text-orange-100' : 'text-teal-100'}`}>{thisWeekAssessments.length} meetings scored</div>
                    </div>

                    <div className={`p-5 rounded-2xl space-y-1 text-white ${eosMode ? 'bg-neutral-800 border border-neutral-600' : 'glass-card bg-slate-900'}`}>
                        <div className="flex items-center gap-2 text-slate-400 mb-1">
                            <Sparkles className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Plan</span>
                        </div>
                        <div className="text-2xl font-bold text-skip-coral">{eosMode ? 'EOS Mode' : 'Freemium'}</div>
                        <div className="text-xs font-medium text-slate-400">{eosMode ? 'Traction-optimized' : 'Unlimited assessments'}</div>
                    </div>
                </div>

                {/* Post-Meeting Feedback Section */}
                {needsFeedback.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-slate-600">
                            <MessageCircleQuestion className="w-5 h-5" />
                            <span className="font-bold text-sm">How did these meetings go?</span>
                            <span className="text-xs text-slate-400">Help improve predictions</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {needsFeedback.slice(0, 2).map((assessment) => (
                                <PostMeetingFeedback
                                    key={assessment.id}
                                    assessment={assessment}
                                    onSubmit={(feedback) => submitFeedback(assessment.id, feedback)}
                                    onDismiss={() => dismissFeedback(assessment.id)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Recommendation Breakdown */}
                {history.length > 0 && (
                    <div className={`glass-card p-5 rounded-2xl ${eosMode ? 'bg-neutral-900/90 border border-neutral-700' : ''}`}>
                        <div className={`flex items-center gap-2 mb-4 ${eosMode ? 'text-neutral-400' : 'text-slate-500'}`}>
                            <Target className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-widest">{eosMode ? 'Your Rhythms' : 'Your Meeting Patterns'}</span>
                        </div>
                        <div className={`flex items-center gap-2 h-4 rounded-full overflow-hidden ${eosMode ? 'bg-neutral-700' : 'bg-slate-100'}`}>
                            {Object.entries(recCounts).map(([rec, count]) => (
                                <div
                                    key={rec}
                                    className={`h-full ${recColors[rec]} transition-all`}
                                    style={{ width: `${(count / history.length) * 100}%` }}
                                />
                            ))}
                        </div>
                        <div className="flex items-center justify-between mt-3">
                            {Object.entries(recCounts).map(([rec, count]) => (
                                <div key={rec} className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${recColors[rec]}`} />
                                    <span className={`text-xs font-medium ${eosMode ? 'text-neutral-300' : 'text-slate-600'}`}>
                                        {eosMode && rec === 'SKIP' ? 'Issues List' : recLabels[rec]}: {count} ({Math.round((count / history.length) * 100)}%)
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Content Area */}
                <div className={`rounded-[2rem] shadow-xl overflow-hidden min-h-[400px] ${eosMode ? 'bg-neutral-900 border border-neutral-700' : 'bg-white'}`}>
                    <div className={`p-6 sm:p-8 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${eosMode ? 'border-neutral-700' : 'border-slate-100'}`}>
                        <div className="flex items-center gap-4">
                            <h2 className={`text-2xl font-bold ${eosMode ? 'text-white' : 'text-slate-800'}`}>{eosMode ? 'Meeting History' : 'Past Assessments'}</h2>
                            {history.length > 0 && (
                                <button
                                    onClick={resetAll}
                                    className={`text-xs transition-colors flex items-center gap-1 ${eosMode ? 'text-neutral-500 hover:text-red-400' : 'text-slate-400 hover:text-red-500'}`}
                                >
                                    <RotateCcw className="w-3 h-3" /> Reset
                                </button>
                            )}
                        </div>
                        <div className="relative">
                            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${eosMode ? 'text-neutral-500' : 'text-slate-400'}`} />
                            <input
                                type="text"
                                placeholder="Search meetings..."
                                className={`pl-10 pr-4 py-2 border-none rounded-xl focus:outline-none w-full sm:w-64 transition-all ${eosMode ? 'bg-neutral-800 text-white placeholder-neutral-500 focus:ring-2 focus:ring-orange-500' : 'bg-slate-50 focus:ring-2 focus:ring-score-teal'}`}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="p-4 sm:p-6">
                        {filteredHistory.length === 0 ? (
                            <div className={`flex flex-col items-center justify-center py-16 ${eosMode ? 'text-neutral-500' : 'text-slate-400'}`}>
                                <Search className="w-12 h-12 mb-4 opacity-20" />
                                <p className="font-medium">{history.length === 0 ? (eosMode ? 'No meetings scored yet.' : 'No assessments yet. Score your first meeting!') : 'No meetings found matching your search.'}</p>
                                {history.length === 0 && (
                                    <Link href="/assess" className="mt-4 text-skip-coral font-bold hover:underline">
                                        {eosMode ? 'Score your first meeting →' : 'Start your first assessment →'}
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredHistory.map((item) => (
                                    <Link
                                        key={item.id}
                                        href={`/results/${item.id}`}
                                        className={`flex items-center gap-4 p-4 rounded-2xl transition-all border group ${eosMode ? 'hover:bg-neutral-800 border-transparent hover:border-neutral-600' : 'hover:bg-slate-50 border-transparent hover:border-slate-100'}`}
                                    >
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                                            eosMode
                                                ? item.recommendation === 'SKIP' ? 'bg-orange-500/20 text-orange-400' :
                                                  item.recommendation === 'ASYNC_FIRST' ? 'bg-slate-500/20 text-slate-300' :
                                                  item.recommendation === 'SHORTEN' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'
                                                : item.recommendation === 'SKIP' ? 'bg-orange-100 text-orange-600' :
                                                  item.recommendation === 'ASYNC_FIRST' ? 'bg-teal-100 text-teal-600' :
                                                  item.recommendation === 'SHORTEN' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'
                                            }`}>
                                            {item.score}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className={`font-bold truncate ${eosMode ? 'text-white' : 'text-slate-800'}`}>{item.title}</div>
                                            <div className={`text-xs flex items-center gap-2 ${eosMode ? 'text-neutral-400' : 'text-slate-500'}`}>
                                                <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                                <span>•</span>
                                                <span>{item.attendees.length} people</span>
                                                <span>•</span>
                                                <span className={`font-bold ${eosMode ? 'text-neutral-300' : 'text-slate-700'}`}>
                                                    {eosMode && item.recommendation === 'SKIP' ? 'ISSUES LIST' : item.recommendation?.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={(e) => deleteAssessment(item.id, e)}
                                                className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 transition-colors" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
