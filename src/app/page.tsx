'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { TrendingDown, Clock, Banknote, ArrowRight, CheckCircle2, Zap, Users, BarChart3, Target, Settings, X, RotateCcw, DollarSign } from 'lucide-react';
import Onboarding from '@/components/Onboarding';
import { useEOS } from '@/contexts/EOSContext';

export default function Home() {
  const { eosMode, toggleEosMode } = useEOS();
  const [showSettings, setShowSettings] = useState(false);
  const [hourlyRate, setHourlyRate] = useState(75);

  useEffect(() => {
    const savedRate = localStorage.getItem('skip-score-hourly-rate');
    if (savedRate) setHourlyRate(parseInt(savedRate));
  }, []);

  const updateHourlyRate = (rate: number) => {
    setHourlyRate(rate);
    localStorage.setItem('skip-score-hourly-rate', rate.toString());
  };

  const resetAllData = () => {
    if (confirm('Are you sure you want to reset all data? This will clear all assessments and settings.')) {
      localStorage.removeItem('skip-score-history');
      localStorage.removeItem('skip-score-dismissed-feedback');
      localStorage.removeItem('skip-score-hourly-rate');
      setHourlyRate(75);
      alert('All data has been reset.');
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center p-6 sm:p-12">
      <Onboarding onComplete={() => {}} />
      <div className="max-w-5xl w-full space-y-16">
        {/* Header / Logo + Settings */}
        <div className="flex justify-center pt-8 relative">
          <div className={`p-4 rounded-2xl shadow-xl ${eosMode ? 'bg-neutral-900' : 'bg-white'}`}>
            <Logo />
          </div>
          {/* Settings Button */}
          <div className="absolute right-0 top-8">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-3 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 ${
                eosMode
                  ? 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                  : 'bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20'
              }`}
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className={`rounded-2xl shadow-xl p-6 animate-in fade-in slide-in-from-top-2 duration-300 -mt-8 ${eosMode ? 'bg-neutral-900 border border-neutral-700' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-bold ${eosMode ? 'text-white' : 'text-slate-900'}`}>Settings</h3>
              <button onClick={() => setShowSettings(false)} className={eosMode ? 'text-neutral-400 hover:text-neutral-200' : 'text-slate-400 hover:text-slate-600'}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* EOS Mode Toggle */}
              <div className={`p-4 rounded-xl border-2 ${eosMode ? 'border-neutral-700 bg-neutral-800' : 'border-slate-100 bg-slate-50'}`}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-xl flex-shrink-0 ${eosMode ? 'bg-amber-500/20' : 'bg-purple-100'}`}>
                      <Target className={`w-5 h-5 ${eosMode ? 'text-amber-400' : 'text-purple-600'}`} />
                    </div>
                    <div className="min-w-0">
                      <div className={`font-bold ${eosMode ? 'text-white' : 'text-slate-800'}`}>EOS / Traction Mode</div>
                      <div className={`text-xs ${eosMode ? 'text-neutral-400' : 'text-slate-500'} hidden sm:block`}>Optimized for L10 meetings and EOS terminology</div>
                    </div>
                  </div>
                  <button
                    onClick={toggleEosMode}
                    className={`relative w-14 h-8 rounded-full transition-colors flex-shrink-0 ${eosMode ? 'bg-amber-500' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${eosMode ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>

              {/* Hourly Rate Setting */}
              <div className={`p-4 rounded-xl border-2 ${eosMode ? 'border-neutral-700 bg-neutral-800' : 'border-slate-100 bg-slate-50'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl flex-shrink-0 ${eosMode ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
                      <DollarSign className={`w-5 h-5 ${eosMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    </div>
                    <div>
                      <div className={`font-bold ${eosMode ? 'text-white' : 'text-slate-800'}`}>Default Hourly Rate</div>
                      <div className={`text-xs ${eosMode ? 'text-neutral-400' : 'text-slate-500'} hidden sm:block`}>Used for calculating meeting costs</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-11 sm:ml-0">
                    <span className={eosMode ? 'text-neutral-400' : 'text-slate-500'}>$</span>
                    <input
                      type="number"
                      value={hourlyRate}
                      onChange={(e) => updateHourlyRate(parseInt(e.target.value) || 75)}
                      className={`w-20 p-2 rounded-lg text-center font-bold ${
                        eosMode
                          ? 'bg-neutral-700 text-white border border-neutral-600 focus:border-amber-500'
                          : 'bg-white border border-slate-200 focus:border-teal-500'
                      } focus:outline-none`}
                    />
                    <span className={eosMode ? 'text-neutral-400' : 'text-slate-500'}>/hr</span>
                  </div>
                </div>
              </div>

              {/* Reset Data */}
              <div className={`p-4 rounded-xl border-2 ${eosMode ? 'border-neutral-700 bg-neutral-800' : 'border-slate-100 bg-slate-50'}`}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-xl flex-shrink-0 ${eosMode ? 'bg-red-500/20' : 'bg-red-100'}`}>
                      <RotateCcw className={`w-5 h-5 ${eosMode ? 'text-red-400' : 'text-red-600'}`} />
                    </div>
                    <div className="min-w-0">
                      <div className={`font-bold ${eosMode ? 'text-white' : 'text-slate-800'}`}>Reset All Data</div>
                      <div className={`text-xs ${eosMode ? 'text-neutral-400' : 'text-slate-500'} hidden sm:block`}>Clear all assessments and settings</div>
                    </div>
                  </div>
                  <button
                    onClick={resetAllData}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors flex-shrink-0 ${
                      eosMode
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        : 'bg-red-100 text-red-600 hover:bg-red-200'
                    }`}
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            {eosMode && (
              <div className="mt-4 p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
                <div className="text-sm text-amber-300">
                  <strong>EOS Mode enabled!</strong> L10 meetings will automatically score high.
                  Non-essential meetings will be flagged for the Issues List.
                </div>
              </div>
            )}
          </div>
        )}

        {/* Hero Section */}
        <div className="text-center space-y-6 text-white">
          <h1 className={`text-5xl sm:text-7xl font-extrabold tracking-tight leading-tight ${eosMode ? 'text-amber-500' : ''}`}>
            {eosMode ? (
              <>Protect Your<br />L10 Pulse</>
            ) : (
              <>Should You Have<br />This Meeting?</>
            )}
          </h1>
          <p className={`text-xl sm:text-2xl max-w-2xl mx-auto ${eosMode ? 'text-neutral-300' : 'text-teal-50/90'}`}>
            {eosMode
              ? 'Keep your weekly meeting pulse sacred. Check if that extra meeting belongs on the calendar—or in a quick IDS.'
              : 'Score your meetings before you book them. Determine if they\'re truly needed. Reclaim your time.'}
          </p>
          <p className={`text-sm font-medium uppercase tracking-widest ${eosMode ? 'text-amber-400/80' : 'text-teal-200/80'}`}>
            {eosMode
              ? 'Built for teams running on Traction. Optimized for the EOS meeting pulse.'
              : 'Notetakers capture what was said. We capture whether it should have been said at all.'}
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <Link
              href="/assess"
              className={`group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white rounded-full overflow-hidden shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 ${
                eosMode ? 'bg-amber-500 text-black hover:bg-amber-400' : 'bg-skip-coral hover:bg-orange-600'
              }`}
            >
              <span className="relative flex items-center gap-2 text-lg">
                {eosMode ? 'Check a Meeting' : 'Score a Meeting'} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <Link
              href="/dashboard"
              className={`inline-flex items-center justify-center px-8 py-4 font-bold rounded-full backdrop-blur-sm border transition-all duration-300 hover:scale-105 ${
                eosMode
                  ? 'text-amber-400 bg-neutral-800/50 border-amber-500/30 hover:bg-neutral-800'
                  : 'text-white/90 bg-white/10 border-white/20 hover:bg-white/20'
              }`}
            >
              View Dashboard
            </Link>
          </div>
        </div>

        {/* Problem Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`p-8 rounded-3xl shadow-lg space-y-4 text-center hover:scale-105 transition-transform duration-300 ${
            eosMode ? 'bg-neutral-900 border border-neutral-800' : 'glass-card'
          }`}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto ${eosMode ? 'bg-amber-500/20' : 'bg-orange-100'}`}>
              <Banknote className={`w-7 h-7 ${eosMode ? 'text-amber-500' : 'text-skip-coral'}`} />
            </div>
            <div className="space-y-1">
              <h3 className={`text-4xl font-black ${eosMode ? 'text-neutral-100' : 'text-slate-900'}`}>$25K+</h3>
              <p className={`font-medium leading-tight ${eosMode ? 'text-neutral-400' : 'text-slate-600'}`}>Wasted per manager yearly on bad meetings</p>
              <p className={`text-xs ${eosMode ? 'text-neutral-600' : 'text-slate-400'}`}>Source: Harvard Business Review</p>
            </div>
          </div>

          <div className={`p-8 rounded-3xl shadow-lg space-y-4 text-center hover:scale-105 transition-transform duration-300 ${
            eosMode ? 'bg-neutral-900 border border-neutral-800' : 'glass-card'
          }`}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto ${eosMode ? 'bg-amber-500/20' : 'bg-teal-100'}`}>
              <TrendingDown className={`w-7 h-7 ${eosMode ? 'text-amber-500' : 'text-score-teal'}`} />
            </div>
            <div className="space-y-1">
              <h3 className={`text-4xl font-black ${eosMode ? 'text-neutral-100' : 'text-slate-900'}`}>40%</h3>
              <p className={`font-medium leading-tight ${eosMode ? 'text-neutral-400' : 'text-slate-600'}`}>Of meetings could be an email or Slack</p>
              <p className={`text-xs ${eosMode ? 'text-neutral-600' : 'text-slate-400'}`}>Source: Atlassian Research</p>
            </div>
          </div>

          <div className={`p-8 rounded-3xl shadow-lg space-y-4 text-center hover:scale-105 transition-transform duration-300 ${
            eosMode ? 'bg-neutral-900 border border-neutral-800' : 'glass-card'
          }`}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto ${eosMode ? 'bg-amber-500/20' : 'bg-blue-100'}`}>
              <Clock className={`w-7 h-7 ${eosMode ? 'text-amber-500' : 'text-blue-600'}`} />
            </div>
            <div className="space-y-1">
              <h3 className={`text-4xl font-black ${eosMode ? 'text-neutral-100' : 'text-slate-900'}`}>10+ hrs</h3>
              <p className={`font-medium leading-tight ${eosMode ? 'text-neutral-400' : 'text-slate-600'}`}>You could reclaim weekly with better habits</p>
              <p className={`text-xs ${eosMode ? 'text-neutral-600' : 'text-slate-400'}`}>Source: McKinsey & Company</p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className={`rounded-[2.5rem] p-8 sm:p-12 shadow-2xl ${eosMode ? 'bg-neutral-900 border border-neutral-800' : 'bg-white'}`}>
          <h2 className={`text-3xl font-extrabold text-center mb-10 ${eosMode ? 'text-neutral-100' : 'text-slate-900'}`}>How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto text-white font-black text-2xl shadow-lg ${
                eosMode ? 'bg-gradient-to-br from-amber-500 to-amber-600' : 'bg-gradient-to-br from-teal-500 to-teal-600'
              }`}>1</div>
              <h3 className={`font-bold text-lg ${eosMode ? 'text-neutral-200' : 'text-slate-900'}`}>Describe Your Meeting</h3>
              <p className={eosMode ? 'text-neutral-400' : 'text-slate-600'}>Enter the basics: purpose, attendees, duration, and agenda status.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto text-white font-black text-2xl shadow-lg">2</div>
              <h3 className={`font-bold text-lg ${eosMode ? 'text-neutral-200' : 'text-slate-900'}`}>Get Your Score</h3>
              <p className={eosMode ? 'text-neutral-400' : 'text-slate-600'}>Our algorithm analyzes 10+ factors to calculate your meeting's value.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto text-white font-black text-2xl shadow-lg">3</div>
              <h3 className={`font-bold text-lg ${eosMode ? 'text-neutral-200' : 'text-slate-900'}`}>Take Action</h3>
              <p className={eosMode ? 'text-neutral-400' : 'text-slate-600'}>Skip it, shorten it, or run it better with tailored suggestions.</p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className={`rounded-2xl p-6 border ${eosMode ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white/10 backdrop-blur-sm border-white/20'}`}>
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${eosMode ? 'bg-amber-500/20' : 'bg-teal-500/20'}`}>
                <Zap className={`w-6 h-6 ${eosMode ? 'text-amber-400' : 'text-teal-300'}`} />
              </div>
              <div>
                <h3 className={`font-bold text-lg mb-1 ${eosMode ? 'text-neutral-100' : 'text-white'}`}>Instant Analysis</h3>
                <p className={eosMode ? 'text-neutral-400' : 'text-white/70'}>Get your score in seconds, not minutes. Make decisions fast.</p>
              </div>
            </div>
          </div>
          <div className={`rounded-2xl p-6 border ${eosMode ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white/10 backdrop-blur-sm border-white/20'}`}>
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${eosMode ? 'bg-amber-500/20' : 'bg-orange-500/20'}`}>
                <Users className={`w-6 h-6 ${eosMode ? 'text-amber-400' : 'text-orange-300'}`} />
              </div>
              <div>
                <h3 className={`font-bold text-lg mb-1 ${eosMode ? 'text-neutral-100' : 'text-white'}`}>Attendee Insights</h3>
                <p className={eosMode ? 'text-neutral-400' : 'text-white/70'}>Know who's essential and who's optional for every meeting.</p>
              </div>
            </div>
          </div>
          <div className={`rounded-2xl p-6 border ${eosMode ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white/10 backdrop-blur-sm border-white/20'}`}>
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${eosMode ? 'bg-amber-500/20' : 'bg-blue-500/20'}`}>
                <BarChart3 className={`w-6 h-6 ${eosMode ? 'text-amber-400' : 'text-blue-300'}`} />
              </div>
              <div>
                <h3 className={`font-bold text-lg mb-1 ${eosMode ? 'text-neutral-100' : 'text-white'}`}>Track Your Savings</h3>
                <p className={eosMode ? 'text-neutral-400' : 'text-white/70'}>See how much time and money you're reclaiming over time.</p>
              </div>
            </div>
          </div>
          <div className={`rounded-2xl p-6 border ${eosMode ? 'bg-neutral-900/50 border-neutral-800' : 'bg-white/10 backdrop-blur-sm border-white/20'}`}>
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${eosMode ? 'bg-amber-500/20' : 'bg-emerald-500/20'}`}>
                <CheckCircle2 className={`w-6 h-6 ${eosMode ? 'text-amber-400' : 'text-emerald-300'}`} />
              </div>
              <div>
                <h3 className={`font-bold text-lg mb-1 ${eosMode ? 'text-neutral-100' : 'text-white'}`}>Actionable Suggestions</h3>
                <p className={eosMode ? 'text-neutral-400' : 'text-white/70'}>Not just a score—specific steps to improve every meeting.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center space-y-6 pb-12">
          <h2 className={`text-3xl sm:text-4xl font-extrabold ${eosMode ? 'text-amber-500' : 'text-white'}`}>Ready to reclaim your calendar?</h2>
          <Link
            href="/assess"
            className={`group relative inline-flex items-center justify-center px-10 py-5 font-bold rounded-full overflow-hidden shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 ${
              eosMode ? 'bg-amber-500 text-black hover:bg-amber-400' : 'bg-skip-coral text-white hover:bg-orange-600'
            }`}
          >
            <span className="relative flex items-center gap-2 text-xl">
              Start Your First Assessment <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
}
