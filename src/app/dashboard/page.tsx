'use client';

import React, { useState, useEffect } from 'react';
import { Logo } from '@/components/Logo';
import { AssessmentData, Recommendation } from '@/lib/types';
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
    RotateCcw
} from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
    const [history, setHistory] = useState<AssessmentData[]>([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const data = JSON.parse(localStorage.getItem('skip-score-history') || '[]');
        setHistory(data);
    }, []);

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

    const filteredHistory = history.filter(h =>
        h.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <main className="min-h-screen p-4 sm:p-8 flex flex-col items-center">
            <div className="max-w-6xl w-full space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <Link href="/">
                        <div className="bg-white px-4 py-3 rounded-2xl shadow-lg inline-flex items-center cursor-pointer hover:shadow-xl transition-shadow">
                            <Logo />
                        </div>
                    </Link>
                    <Link
                        href="/assess"
                        className="bg-skip-coral text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-orange-600 transition-all hover:scale-105"
                    >
                        <Plus className="w-5 h-5" /> New Assessment
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass-card p-6 rounded-3xl space-y-2">
                        <div className="flex items-center gap-3 text-slate-500 mb-2">
                            <Banknote className="w-5 h-5" />
                            <span className="text-xs font-bold uppercase tracking-widest">Total Savings</span>
                        </div>
                        <div className="text-4xl font-black text-slate-800">${totals.costSaved.toLocaleString()}</div>
                        <div className="text-sm font-medium text-teal-600 flex items-center gap-1">
                            <TrendingUp className="w-4 h-4" /> Based on $75/hr calculation
                        </div>
                    </div>

                    <div className="glass-card p-6 rounded-3xl space-y-2">
                        <div className="flex items-center gap-3 text-slate-500 mb-2">
                            <Clock className="w-5 h-5" />
                            <span className="text-xs font-bold uppercase tracking-widest">Time Reclaimed</span>
                        </div>
                        <div className="text-4xl font-black text-slate-800">{totals.hoursSaved.toFixed(1)} hrs</div>
                        <div className="text-sm font-medium text-slate-500">Across {history.length} assessments</div>
                    </div>

                    <div className="glass-card p-6 rounded-3xl space-y-2 bg-slate-900 text-white">
                        <div className="flex items-center gap-3 text-slate-400 mb-2">
                            <Sparkles className="w-5 h-5" />
                            <span className="text-xs font-bold uppercase tracking-widest">Active Plan</span>
                        </div>
                        <div className="text-2xl font-bold text-skip-coral">Freemium</div>
                        <button
                            onClick={resetAll}
                            className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
                        >
                            <RotateCcw className="w-3.5 h-3.5" /> Reset all data
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden min-h-[500px]">
                    <div className="p-6 sm:p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h2 className="text-2xl font-bold text-slate-800">Past Assessments</h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search meetings..."
                                className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-score-teal focus:outline-none w-full sm:w-64 transition-all"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="p-4 sm:p-6">
                        {filteredHistory.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                                <Search className="w-12 h-12 mb-4 opacity-20" />
                                <p className="font-medium">No assessments found matching your search.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredHistory.map((item) => (
                                    <Link
                                        key={item.id}
                                        href={`/results/${item.id}`}
                                        className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100 group"
                                    >
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${item.recommendation === 'SKIP' ? 'bg-orange-100 text-orange-600' :
                                            item.recommendation === 'ASYNC_FIRST' ? 'bg-teal-100 text-teal-600' : 'bg-slate-100 text-slate-600'
                                            }`}>
                                            {item.score}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-slate-800 truncate">{item.title}</div>
                                            <div className="text-xs text-slate-500 flex items-center gap-2">
                                                <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                                <span>•</span>
                                                <span>{item.attendees.length} people</span>
                                                <span>•</span>
                                                <span className="font-bold text-slate-700">{item.recommendation?.replace('_', ' ')}</span>
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
