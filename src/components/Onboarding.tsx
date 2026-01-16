'use client';

import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Zap, Target, Clock } from 'lucide-react';

interface OnboardingProps {
    onComplete: () => void;
}

const STEPS = [
    {
        icon: Zap,
        title: 'Welcome to SkipScore!',
        description: 'Score your meetings before you book them. We help you identify which meetings are worth your time.',
        color: 'bg-teal-500'
    },
    {
        icon: Target,
        title: 'Get Actionable Insights',
        description: 'Each assessment gives you a score from 0-10, plus specific suggestions to improve your meeting or skip it entirely.',
        color: 'bg-orange-500'
    },
    {
        icon: Clock,
        title: 'Track Your Savings',
        description: 'See how much time and money you reclaim over time. Your dashboard shows trends and patterns.',
        color: 'bg-blue-500'
    }
];

export default function Onboarding({ onComplete }: OnboardingProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if user has seen onboarding
        const hasSeenOnboarding = localStorage.getItem('skip-score-onboarding-complete');
        if (!hasSeenOnboarding) {
            setIsVisible(true);
        }
    }, []);

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleComplete();
        }
    };

    const handleComplete = () => {
        localStorage.setItem('skip-score-onboarding-complete', 'true');
        setIsVisible(false);
        onComplete();
    };

    const handleSkip = () => {
        handleComplete();
    };

    if (!isVisible) return null;

    const step = STEPS[currentStep];
    const Icon = step.icon;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300">
                <div className={`${step.color} p-8 text-white text-center`}>
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">{step.title}</h2>
                    <p className="text-white/90">{step.description}</p>
                </div>

                <div className="p-6">
                    {/* Progress dots */}
                    <div className="flex justify-center gap-2 mb-6">
                        {STEPS.map((_, i) => (
                            <div
                                key={i}
                                className={`w-2 h-2 rounded-full transition-all ${i === currentStep ? 'bg-slate-800 w-6' : 'bg-slate-200'}`}
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
                            className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors"
                        >
                            {currentStep < STEPS.length - 1 ? 'Next' : 'Get Started'}
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <button
                    onClick={handleSkip}
                    className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
}
