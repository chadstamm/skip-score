'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { TrendingDown, Clock, Banknote, ArrowRight, CheckCircle2, Zap, Users, FileText, Target, Settings, X, RotateCcw } from 'lucide-react';
import Onboarding from '@/components/Onboarding';
import { useEOS } from '@/contexts/EOSContext';

export default function Home() {
  const { eosMode, toggleEosMode } = useEOS();
  const [showSettings, setShowSettings] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const resetAllData = () => {
    if (confirm('Are you sure you want to reset all data? This will clear all assessments and settings.')) {
      localStorage.removeItem('skip-score-history');
      localStorage.removeItem('skip-score-dismissed-feedback');
      localStorage.removeItem('skip-score-agenda-templates');
      localStorage.removeItem('skip-score-contacts');
      alert('All data has been reset.');
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center p-6 sm:p-12">
      <Onboarding onComplete={() => {}} />
      <div className="max-w-5xl w-full space-y-16">
        {/* Header / Logo */}
        <div className="flex items-center justify-between pt-8">
          <div className="w-10" /> {/* Spacer for centering */}
          <div className={`p-4 rounded-2xl shadow-xl ${eosMode ? 'bg-neutral-900' : 'bg-white'}`}>
            <Logo />
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-3 rounded-xl transition-all hover:scale-110 ${
              eosMode
                ? 'bg-neutral-800 text-neutral-400 hover:text-amber-400'
                : 'bg-white/10 text-white/60 hover:text-white'
            }`}
            aria-label="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
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
          <h1 className={`text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight ${eosMode ? 'text-amber-500' : ''}`}>
            {eosMode ? (
              <>Protect Your<br />L10 Pulse</>
            ) : (
              <>Should You Have<br />This Meeting?</>
            )}
          </h1>
          <p className={`text-xl sm:text-2xl max-w-2xl mx-auto ${eosMode ? 'text-neutral-300' : 'text-teal-50/90'}`}>
            {eosMode
              ? 'Keep your weekly meeting pulse sacred. Check if that extra meeting belongs on the calendar—or in a quick IDS.'
              : 'Score your meetings before you book them. Build better agendas. Decide if they\'re truly worth everyone\'s time.'}
          </p>
          <p className={`text-sm font-medium uppercase tracking-widest ${eosMode ? 'text-amber-400/80' : 'text-teal-200/80'}`}>
            {eosMode
              ? 'Score. Prepare. Protect your meeting pulse.'
              : 'Score. Prepare. Reclaim your time.'}
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

          {/* Mode Toggle Callout */}
          {!eosMode ? (
            <button
              onClick={toggleEosMode}
              className="group mt-4 inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-black/40 backdrop-blur-sm border border-white/20 hover:bg-black/60 transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-400" />
                <span className="font-bold text-white">Running on EOS?</span>
              </div>
              <span className="text-teal-200 group-hover:text-white transition-colors">
                Switch to Traction Mode →
              </span>
            </button>
          ) : (
            <button
              onClick={toggleEosMode}
              className="group mt-4 inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-black border border-neutral-700 hover:bg-neutral-900 transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-teal-400" />
                <span className="font-bold text-neutral-200">Switch to Standard Mode</span>
              </div>
            </button>
          )}
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
              <h3 className={`text-4xl font-black ${eosMode ? 'text-neutral-100' : 'text-slate-900'}`}>72%</h3>
              <p className={`font-medium leading-tight ${eosMode ? 'text-neutral-400' : 'text-slate-600'}`}>Of meetings are considered ineffective</p>
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
              <h3 className={`text-4xl font-black ${eosMode ? 'text-neutral-100' : 'text-slate-900'}`}>16 hrs</h3>
              <p className={`font-medium leading-tight ${eosMode ? 'text-neutral-400' : 'text-slate-600'}`}>Spent in meetings weekly by the average worker</p>
              <p className={`text-xs ${eosMode ? 'text-neutral-600' : 'text-slate-400'}`}>Source: McKinsey & Company</p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className={`rounded-[2.5rem] p-8 sm:p-12 shadow-2xl ${eosMode ? 'bg-neutral-900 border border-neutral-800' : 'bg-white'}`}>
          <h2 className={`text-3xl font-extrabold text-center mb-10 ${eosMode ? 'text-neutral-100' : 'text-slate-900'}`}>How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center space-y-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto text-white font-black text-xl shadow-lg ${
                eosMode ? 'bg-gradient-to-br from-amber-500 to-amber-600' : 'bg-gradient-to-br from-teal-500 to-teal-600'
              }`}>1</div>
              <h3 className={`font-bold text-lg ${eosMode ? 'text-neutral-200' : 'text-slate-900'}`}>Describe It</h3>
              <p className={`text-sm ${eosMode ? 'text-neutral-400' : 'text-slate-600'}`}>Enter the basics: purpose, duration, and attendees.</p>
            </div>
            <div className="text-center space-y-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto text-white font-black text-xl shadow-lg ${
                eosMode ? 'bg-gradient-to-br from-amber-500 to-amber-600' : 'bg-gradient-to-br from-orange-500 to-orange-600'
              }`}>2</div>
              <h3 className={`font-bold text-lg ${eosMode ? 'text-neutral-200' : 'text-slate-900'}`}>Build an Agenda</h3>
              <p className={`text-sm ${eosMode ? 'text-neutral-400' : 'text-slate-600'}`}>Create a structured agenda, use a template, or skip if you have one.</p>
            </div>
            <div className="text-center space-y-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto text-white font-black text-xl shadow-lg ${
                eosMode ? 'bg-gradient-to-br from-amber-500 to-amber-600' : 'bg-gradient-to-br from-blue-500 to-blue-600'
              }`}>3</div>
              <h3 className={`font-bold text-lg ${eosMode ? 'text-neutral-200' : 'text-slate-900'}`}>Get Your Score</h3>
              <p className={`text-sm ${eosMode ? 'text-neutral-400' : 'text-slate-600'}`}>Our algorithm analyzes 10+ factors to rate your meeting.</p>
            </div>
            <div className="text-center space-y-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto text-white font-black text-xl shadow-lg ${
                eosMode ? 'bg-gradient-to-br from-amber-500 to-amber-600' : 'bg-gradient-to-br from-purple-500 to-purple-600'
              }`}>4</div>
              <h3 className={`font-bold text-lg ${eosMode ? 'text-neutral-200' : 'text-slate-900'}`}>Take Action</h3>
              <p className={`text-sm ${eosMode ? 'text-neutral-400' : 'text-slate-600'}`}>Skip it, shorten it, or run it better with tailored suggestions.</p>
            </div>
          </div>
        </div>

        {/* Works With */}
        <div className="text-center space-y-4">
          <p className={`text-sm font-bold uppercase tracking-widest ${eosMode ? 'text-neutral-600' : 'text-white/30'}`}>
            Works with your meeting tools
          </p>
          <div className="flex items-center justify-center gap-6 sm:gap-10">
            {[
              { name: 'Zoom', color: eosMode ? 'text-neutral-400' : 'text-white/60' },
              { name: 'Microsoft Teams', color: eosMode ? 'text-neutral-400' : 'text-white/60' },
              { name: 'Google Meet', color: eosMode ? 'text-neutral-400' : 'text-white/60' },
            ].map((platform) => (
              <div key={platform.name} className={`flex items-center gap-2 text-sm sm:text-base font-bold ${platform.color}`}>
                <div className={`w-2 h-2 rounded-full ${eosMode ? 'bg-amber-500/50' : 'bg-white/30'}`} />
                <span className="hidden sm:inline">{platform.name}</span>
                <span className="sm:hidden">{platform.name === 'Microsoft Teams' ? 'Teams' : platform.name === 'Google Meet' ? 'Meet' : platform.name}</span>
              </div>
            ))}
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
                <FileText className={`w-6 h-6 ${eosMode ? 'text-amber-400' : 'text-blue-300'}`} />
              </div>
              <div>
                <h3 className={`font-bold text-lg mb-1 ${eosMode ? 'text-neutral-100' : 'text-white'}`}>Built-in Agenda Builder</h3>
                <p className={eosMode ? 'text-neutral-400' : 'text-white/70'}>Create structured agendas with time blocks. Export as PDF, copy, or email.</p>
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

        {/* Footer */}
        <footer className="border-t border-white/10 pt-6 pb-4 space-y-3">
          <div className="flex items-center justify-between">
            <a
              href="https://buymeacoffee.com/chadn"
              target="_blank"
              rel="noopener noreferrer"
              className={`text-sm font-medium transition-colors cursor-pointer ${
                eosMode ? 'text-neutral-500 hover:text-amber-400' : 'text-white/40 hover:text-white/80'
              }`}
            >
              Donate
            </a>
            <span className={`text-sm ${eosMode ? 'text-neutral-600' : 'text-white/30'}`}>
              &copy; {new Date().getFullYear()} SkipScore
            </span>
            <button
              onClick={() => setShowAbout(true)}
              className={`text-sm font-medium transition-colors cursor-pointer ${
                eosMode ? 'text-neutral-500 hover:text-amber-400' : 'text-white/40 hover:text-white/80'
              }`}
            >
              About
            </button>
          </div>
          <div className="text-center">
            <span className={`text-xs ${eosMode ? 'text-neutral-700' : 'text-white/20'}`}>
              Powered by{' '}
              <a
                href="https://chadstamm.com/"
                target="_blank"
                rel="noopener noreferrer"
                className={`hover:underline transition-colors ${eosMode ? 'hover:text-neutral-500' : 'hover:text-white/40'}`}
              >
                Chad Stamm
              </a>
              {' '}&middot;{' '}
              <a
                href="https://tmcdigitalmedia.com/"
                target="_blank"
                rel="noopener noreferrer"
                className={`hover:underline transition-colors ${eosMode ? 'hover:text-neutral-500' : 'hover:text-white/40'}`}
              >
                TMC Digital Media
              </a>
            </span>
          </div>
        </footer>
      </div>

      {/* About Modal */}
      {showAbout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowAbout(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className={`relative max-w-lg w-full rounded-3xl shadow-2xl p-8 sm:p-10 animate-in fade-in zoom-in-95 duration-300 ${
              eosMode ? 'bg-neutral-900 border border-neutral-700' : 'bg-white'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAbout(false)}
              className={`absolute top-4 right-4 p-2 rounded-xl transition-colors cursor-pointer ${
                eosMode ? 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
              }`}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-5">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                eosMode ? 'bg-amber-500/20 text-amber-400' : 'bg-teal-100 text-score-teal'
              }`}>
                About SkipScore
              </div>

              <h3 className={`text-2xl font-extrabold leading-tight ${eosMode ? 'text-neutral-100' : 'text-slate-900'}`}>
                Because your time is worth protecting.
              </h3>

              <div className={`space-y-4 text-sm leading-relaxed ${eosMode ? 'text-neutral-400' : 'text-slate-600'}`}>
                <p>
                  We&apos;ve all sat through it. That meeting that should have been an email. The one where half the room is checked out, scrolling through their phones, wondering why they&apos;re there. The agenda-less hour that spirals into nothing. The recurring invite nobody questions.
                </p>
                <p>
                  Meetings aren&apos;t inherently bad&mdash;but too many of them are. They fracture focus, drain morale, and steal time from the work that actually moves the needle.
                </p>
                <p className={`font-medium ${eosMode ? 'text-amber-400' : 'text-skip-coral'}`}>
                  SkipScore was born from that frustration.
                </p>
                <p>
                  Before you send that invite, before you accept that meeting, ask: <em>does this deserve everyone&apos;s time?</em>
                </p>
                <p>
                  Score your meetings. Build better agendas. Protect what matters most&mdash;your team&apos;s time, energy, and momentum.
                </p>
              </div>

              <div className={`pt-4 border-t ${eosMode ? 'border-neutral-800' : 'border-slate-100'}`}>
                <p className={`text-xs ${eosMode ? 'text-neutral-600' : 'text-slate-400'}`}>
                  Built by{' '}
                  <a
                    href="https://chadstamm.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`font-medium hover:underline ${eosMode ? 'text-neutral-400' : 'text-slate-600'}`}
                  >
                    Chad Stamm
                  </a>
                  {' '}&middot;{' '}
                  <a
                    href="https://tmcdigitalmedia.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`font-medium hover:underline ${eosMode ? 'text-neutral-400' : 'text-slate-600'}`}
                  >
                    TMC Digital Media
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
