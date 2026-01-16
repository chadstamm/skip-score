'use client';

import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { TrendingDown, Clock, Banknote, ArrowRight, CheckCircle2, Zap, Users, BarChart3 } from 'lucide-react';
import Onboarding from '@/components/Onboarding';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center p-6 sm:p-12">
      <Onboarding onComplete={() => {}} />
      <div className="max-w-5xl w-full space-y-16">
        {/* Header / Logo */}
        <div className="flex justify-center pt-8">
          <div className="bg-white p-4 rounded-2xl shadow-xl">
            <Logo />
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center space-y-6 text-white">
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight leading-tight">
            Should You Have<br />This Meeting?
          </h1>
          <p className="text-xl sm:text-2xl text-teal-50/90 max-w-2xl mx-auto">
            Score your meetings before you book them. Skip the waste. Reclaim your time.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <Link
              href="/assess"
              className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white bg-skip-coral rounded-full overflow-hidden shadow-2xl transition-all duration-300 hover:bg-orange-600 hover:scale-105 active:scale-95"
            >
              <span className="relative flex items-center gap-2 text-lg">
                Score a Meeting <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-8 py-4 font-bold text-white/90 bg-white/10 rounded-full backdrop-blur-sm border border-white/20 transition-all duration-300 hover:bg-white/20 hover:scale-105"
            >
              View Dashboard
            </Link>
          </div>
        </div>

        {/* Problem Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-8 rounded-3xl shadow-lg space-y-4 text-center hover:scale-105 transition-transform duration-300">
            <div className="bg-orange-100 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto">
              <Banknote className="text-skip-coral w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-4xl font-black text-slate-900">$25K+</h3>
              <p className="text-slate-600 font-medium leading-tight">Wasted per manager yearly on bad meetings</p>
            </div>
          </div>

          <div className="glass-card p-8 rounded-3xl shadow-lg space-y-4 text-center hover:scale-105 transition-transform duration-300">
            <div className="bg-teal-100 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto">
              <TrendingDown className="text-score-teal w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-4xl font-black text-slate-900">40%</h3>
              <p className="text-slate-600 font-medium leading-tight">Of meetings could be an email or Slack</p>
            </div>
          </div>

          <div className="glass-card p-8 rounded-3xl shadow-lg space-y-4 text-center hover:scale-105 transition-transform duration-300">
            <div className="bg-blue-100 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto">
              <Clock className="text-blue-600 w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-4xl font-black text-slate-900">10+ hrs</h3>
              <p className="text-slate-600 font-medium leading-tight">You could reclaim weekly with better habits</p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 shadow-2xl">
          <h2 className="text-3xl font-extrabold text-slate-900 text-center mb-10">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="bg-gradient-to-br from-teal-500 to-teal-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto text-white font-black text-2xl shadow-lg">1</div>
              <h3 className="font-bold text-slate-900 text-lg">Describe Your Meeting</h3>
              <p className="text-slate-600">Enter the basics: purpose, attendees, duration, and agenda status.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto text-white font-black text-2xl shadow-lg">2</div>
              <h3 className="font-bold text-slate-900 text-lg">Get Your Score</h3>
              <p className="text-slate-600">Our algorithm analyzes 10+ factors to calculate your meeting's value.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto text-white font-black text-2xl shadow-lg">3</div>
              <h3 className="font-bold text-slate-900 text-lg">Take Action</h3>
              <p className="text-slate-600">Skip it, shorten it, or run it better with tailored suggestions.</p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-start gap-4">
              <div className="bg-teal-500/20 p-3 rounded-xl">
                <Zap className="w-6 h-6 text-teal-300" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg mb-1">Instant Analysis</h3>
                <p className="text-white/70">Get your score in seconds, not minutes. Make decisions fast.</p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-start gap-4">
              <div className="bg-orange-500/20 p-3 rounded-xl">
                <Users className="w-6 h-6 text-orange-300" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg mb-1">Attendee Insights</h3>
                <p className="text-white/70">Know who's essential and who's optional for every meeting.</p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-start gap-4">
              <div className="bg-blue-500/20 p-3 rounded-xl">
                <BarChart3 className="w-6 h-6 text-blue-300" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg mb-1">Track Your Savings</h3>
                <p className="text-white/70">See how much time and money you're reclaiming over time.</p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-start gap-4">
              <div className="bg-emerald-500/20 p-3 rounded-xl">
                <CheckCircle2 className="w-6 h-6 text-emerald-300" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg mb-1">Actionable Suggestions</h3>
                <p className="text-white/70">Not just a score—specific steps to improve every meeting.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center space-y-6 pb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Ready to reclaim your calendar?</h2>
          <Link
            href="/assess"
            className="group relative inline-flex items-center justify-center px-10 py-5 font-bold text-white bg-skip-coral rounded-full overflow-hidden shadow-2xl transition-all duration-300 hover:bg-orange-600 hover:scale-105 active:scale-95"
          >
            <span className="relative flex items-center gap-2 text-xl">
              Start Your First Assessment <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
          <p className="text-white/60 text-sm">Free forever. No signup required.</p>
        </div>
      </div>
    </main>
  );
}
