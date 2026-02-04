'use client';

import React, { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, Zap, Target, Clock, DollarSign, CheckCircle2 } from 'lucide-react';
import { useEOS } from '@/contexts/EOSContext';

interface OnboardingProps {
    onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
    const { toggleEosMode } = useEOS();
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [selectedMode, setSelectedMode] = useState<'standard' | 'eos' | null>(null);
    const [hourlyRate, setHourlyRate] = useState(75);

    useEffect(() => {
        const hasSeenOnboarding = localStorage.getItem('skip-score-onboarding-complete');
        if (!hasSeenOnboarding) {
            setIsVisible(true);
        }
    }, []);

    const handleNext = () => {
        if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
        } else {
            handleComplete();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleComplete = () => {
        // Apply settings
        if (selectedMode === 'eos') {
            toggleEosMode();
        }
        localStorage.setItem('skip-score-hourly-rate', hourlyRate.toString());
        localStorage.setItem('skip-score-onboarding-complete', 'true');
        setIsVisible(false);
        onComplete();
    };

    const handleSkip = () => {
        localStorage.setItem('skip-score-onboarding-complete', 'true');
        setIsVisible(false);
        onComplete();
    };

    if (!isVisible) return null;

    const renderStep = () => {
        switch (currentStep) {
            case 0:
                return (
                    <>
                        <div className="bg-gradient-to-br from-teal-500 to-teal-600 p-8 text-white text-center">
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Zap className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Welcome to SkipScore!</h2>
                            <p className="text-white/90">Score your meetings before you book them. We help you identify which meetings are worth your time—and which ones aren&apos;t.</p>
                        </div>
                        <div className="p-6">
                            <div className="flex justify-center gap-2 mb-6">
                                {[0, 1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className={`h-2 rounded-full transition-all ${i === currentStep ? 'bg-teal-500 w-6' : 'bg-slate-200 w-2'}`}
                                    />
                                ))}
                            </div>
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={handleSkip}
                                    className="text-slate-400 hover:text-slate-600 font-medium transition-colors"
                                >
                                    Skip
                                </button>
                                <button
                                    onClick={handleNext}
                                    className="bg-teal-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-teal-600 transition-colors"
                                >
                                    Get Started <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </>
                );

            case 1:
                return (
                    <>
                        <div className="p-8">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Target className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">Does your team run on EOS?</h2>
                                <p className="text-slate-600">If you use the Entrepreneurial Operating System (Traction), we&apos;ll optimize SkipScore for your L10 meeting pulse.</p>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={() => setSelectedMode('eos')}
                                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                                        selectedMode === 'eos'
                                            ? 'border-amber-500 bg-amber-50'
                                            : 'border-slate-200 hover:border-slate-300'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                            selectedMode === 'eos' ? 'border-amber-500 bg-amber-500' : 'border-slate-300'
                                        }`}>
                                            {selectedMode === 'eos' && <CheckCircle2 className="w-4 h-4 text-white" />}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900">Yes, we run on Traction/EOS</div>
                                            <div className="text-sm text-slate-500">Enable L10-optimized mode with IDS terminology</div>
                                        </div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setSelectedMode('standard')}
                                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                                        selectedMode === 'standard'
                                            ? 'border-teal-500 bg-teal-50'
                                            : 'border-slate-200 hover:border-slate-300'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                            selectedMode === 'standard' ? 'border-teal-500 bg-teal-500' : 'border-slate-300'
                                        }`}>
                                            {selectedMode === 'standard' && <CheckCircle2 className="w-4 h-4 text-white" />}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900">No, use standard mode</div>
                                            <div className="text-sm text-slate-500">Universal meeting scoring for any team</div>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>
                        <div className="px-6 pb-6">
                            <div className="flex justify-center gap-2 mb-6">
                                {[0, 1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className={`h-2 rounded-full transition-all ${i === currentStep ? 'bg-teal-500 w-6' : 'bg-slate-200 w-2'}`}
                                    />
                                ))}
                            </div>
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={handleBack}
                                    className="text-slate-400 hover:text-slate-600 font-medium transition-colors flex items-center gap-1"
                                >
                                    <ArrowLeft className="w-4 h-4" /> Back
                                </button>
                                <button
                                    onClick={handleNext}
                                    disabled={!selectedMode}
                                    className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors ${
                                        selectedMode
                                            ? 'bg-teal-500 text-white hover:bg-teal-600'
                                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                    }`}
                                >
                                    Continue <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </>
                );

            case 2:
                return (
                    <>
                        <div className="p-8">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <DollarSign className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">Set Your Hourly Rate</h2>
                                <p className="text-slate-600">We&apos;ll calculate the true cost of your meetings based on attendee time.</p>
                            </div>

                            <div className="bg-slate-50 rounded-2xl p-6">
                                <div className="flex items-center justify-center gap-4">
                                    <span className="text-2xl font-bold text-slate-400">$</span>
                                    <input
                                        type="number"
                                        value={hourlyRate}
                                        onChange={(e) => setHourlyRate(parseInt(e.target.value) || 75)}
                                        className="w-32 text-center text-4xl font-black text-slate-900 bg-white border-2 border-slate-200 rounded-xl p-3 focus:border-teal-500 focus:outline-none"
                                    />
                                    <span className="text-xl font-bold text-slate-400">/hr</span>
                                </div>
                                <p className="text-center text-sm text-slate-500 mt-4">Average hourly cost per meeting attendee</p>

                                <div className="flex justify-center gap-2 mt-4">
                                    {[50, 75, 100, 150].map((rate) => (
                                        <button
                                            key={rate}
                                            onClick={() => setHourlyRate(rate)}
                                            className={`px-3 py-1 rounded-lg text-sm font-bold transition-colors ${
                                                hourlyRate === rate
                                                    ? 'bg-teal-500 text-white'
                                                    : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                                            }`}
                                        >
                                            ${rate}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="px-6 pb-6">
                            <div className="flex justify-center gap-2 mb-6">
                                {[0, 1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className={`h-2 rounded-full transition-all ${i === currentStep ? 'bg-teal-500 w-6' : 'bg-slate-200 w-2'}`}
                                    />
                                ))}
                            </div>
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={handleBack}
                                    className="text-slate-400 hover:text-slate-600 font-medium transition-colors flex items-center gap-1"
                                >
                                    <ArrowLeft className="w-4 h-4" /> Back
                                </button>
                                <button
                                    onClick={handleNext}
                                    className="bg-teal-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-teal-600 transition-colors"
                                >
                                    Continue <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </>
                );

            case 3:
                return (
                    <>
                        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-8 text-white text-center">
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Clock className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">You&apos;re All Set!</h2>
                            <p className="text-white/90">Start scoring your meetings. Track your savings over time on the dashboard.</p>
                        </div>
                        <div className="p-6">
                            <div className="bg-slate-50 rounded-2xl p-4 mb-6">
                                <div className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">Your Settings</div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-600">Mode</span>
                                        <span className="font-bold text-slate-900">
                                            {selectedMode === 'eos' ? 'Traction/EOS' : 'Standard'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-600">Hourly Rate</span>
                                        <span className="font-bold text-slate-900">${hourlyRate}/hr</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-center gap-2 mb-6">
                                {[0, 1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className={`h-2 rounded-full transition-all ${i === currentStep ? 'bg-orange-500 w-6' : 'bg-slate-200 w-2'}`}
                                    />
                                ))}
                            </div>
                            <button
                                onClick={handleComplete}
                                className="w-full bg-slate-900 text-white px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
                            >
                                Start Scoring Meetings <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </>
                );

            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300 relative">
                {renderStep()}
                <button
                    onClick={handleSkip}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors z-10"
                    aria-label="Close onboarding"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
}
