import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { TrendingDown, Clock, Banknote, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-24">
      <div className="max-w-4xl w-full space-y-12">
        {/* Header / Logo */}
        <div className="flex justify-center">
          <div className="bg-white p-4 rounded-2xl shadow-xl">
            <Logo />
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center space-y-6 text-white">
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight">
            Should You Have This Meeting?
          </h1>
          <p className="text-xl sm:text-2xl text-teal-50/90 max-w-2xl mx-auto">
            Stop wasting time. Score your meeting before you book it.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-8 rounded-3xl shadow-lg space-y-4 text-center">
            <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
              <Banknote className="text-skip-coral w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-3xl font-bold text-slate-900">$25K+</h3>
              <p className="text-slate-600 font-medium leading-tight">Avg. wasted per manager/yr on ineffective meetings</p>
            </div>
          </div>

          <div className="glass-card p-8 rounded-3xl shadow-lg space-y-4 text-center hover:scale-105 transition-transform duration-300">
            <div className="bg-teal-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
              <TrendingDown className="text-score-teal w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-3xl font-bold text-slate-900">40%</h3>
              <p className="text-slate-600 font-medium leading-tight">Of meetings are skippable or could be handled async</p>
            </div>
          </div>

          <div className="glass-card p-8 rounded-3xl shadow-lg space-y-4 text-center">
            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
              <Clock className="text-blue-600 w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-3xl font-bold text-slate-900">10+ hrs</h3>
              <p className="text-slate-600 font-medium leading-tight">Reclaim focus time with better meeting strategies</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="flex justify-center pt-8">
          <Link
            href="/assess"
            className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white bg-skip-coral rounded-full overflow-hidden shadow-2xl transition-all duration-300 hover:bg-orange-600 hover:scale-105 active:scale-95"
          >
            <span className="relative flex items-center gap-2 text-lg">
              Start Assessment <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
}
