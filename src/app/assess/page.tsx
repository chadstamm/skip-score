'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { AssessmentData } from '@/lib/types';
import { calculateScore, detectProtectedType, calculatePreparednessScore } from '@/lib/scoring';
import Step1 from '@/components/assess/Step1';
import Step2 from '@/components/assess/Step2';
import AgendaStep from '@/components/assess/AgendaStep';
import Step3 from '@/components/assess/Step3';
import { useEOS } from '@/contexts/EOSContext';

const TOTAL_STEPS = 4;

export default function AssessPage() {
    const router = useRouter();
    const { eosMode } = useEOS();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<Partial<AssessmentData>>({
        title: '',
        purpose: 'INFO_SHARE',
        urgency: 'THIS_WEEK',
        duration: 30,
        interactivity: 'MEDIUM',
        complexity: 'MEDIUM',
        attendees: [],
    });

    // Load pre-filled data from "Adjust & Re-Score"
    useEffect(() => {
        const editData = localStorage.getItem('skip-score-edit');
        if (editData) {
            try {
                const parsed = JSON.parse(editData);
                setFormData({
                    title: parsed.title || '',
                    purpose: parsed.purpose || 'INFO_SHARE',
                    urgency: parsed.urgency || 'THIS_WEEK',
                    duration: parsed.duration || 30,
                    interactivity: parsed.interactivity || 'MEDIUM',
                    complexity: parsed.complexity || 'MEDIUM',
                    decisionRequired: parsed.decisionRequired,
                    asyncPossible: parsed.asyncPossible,
                    hasAgenda: parsed.hasAgenda,
                    attendees: parsed.attendees || [],
                    agendaItems: parsed.agendaItems,
                    isRecurring: parsed.isRecurring,
                    recurrenceFrequency: parsed.recurrenceFrequency,
                    meetingLink: parsed.meetingLink,
                    meetingPlatform: parsed.meetingPlatform,
                });
            } finally {
                localStorage.removeItem('skip-score-edit');
            }
        }
    }, []);

    const updateFormData = (data: Partial<AssessmentData>) => {
        setFormData(prev => ({ ...prev, ...data }));
    };

    const nextStep = () => setStep(s => Math.min(s + 1, TOTAL_STEPS));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    const handleSubmit = () => {
        const id = crypto.randomUUID();
        const fullData: AssessmentData = {
            ...formData,
            title: formData.title?.trim() || '',
            id,
            createdAt: new Date().toISOString(),
            attendees: formData.attendees || [],
        } as AssessmentData;

        const { score, recommendation, reasoning } = calculateScore(fullData, { eosMode });
        fullData.score = score;
        fullData.recommendation = recommendation;
        fullData.reasoning = reasoning;

        // EOS Preparedness: check if this is a protected meeting type
        if (eosMode) {
            const protectedType = detectProtectedType(fullData.title);
            if (protectedType) {
                const prep = calculatePreparednessScore(fullData, protectedType);
                fullData.isProtectedEOS = true;
                fullData.protectedType = protectedType;
                fullData.readinessScore = prep.score;
                fullData.readinessLevel = prep.level;
                fullData.readinessTips = prep.tips;
                fullData.readinessStrengths = prep.strengths;
            }
        }

        // Save to localStorage
        const pastAssessments = JSON.parse(localStorage.getItem('skip-score-history') || '[]');
        localStorage.setItem('skip-score-history', JSON.stringify([fullData, ...pastAssessments]));

        router.push(`/results/${id}`);
    };

    // Step 3 (agenda) handles its own forward navigation, so hide Continue for that step
    const showBottomContinue = step !== 3;

    return (
        <main className="min-h-screen p-4 sm:p-8 flex flex-col items-center">
            <div className="max-w-2xl w-full space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <Link href="/"><Logo className="scale-75 origin-left cursor-pointer" variant="white" /></Link>
                    <div className="flex items-center gap-2">
                        {[1, 2, 3, 4].map((s) => (
                            <div
                                key={s}
                                className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                                    s === step
                                        ? eosMode ? 'bg-amber-500' : 'bg-white'
                                        : s < step
                                            ? eosMode ? 'bg-amber-400' : 'bg-teal-300'
                                            : eosMode ? 'bg-neutral-600' : 'bg-white/30'
                                }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Form Card */}
                <div className={`rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 min-h-[500px] flex flex-col ${
                    eosMode ? 'bg-neutral-900 border border-neutral-800' : 'glass-card'
                }`}>
                    <div className="flex-1">
                        {step === 1 && <Step1 data={formData} updateData={updateFormData} onNext={nextStep} />}
                        {step === 2 && <Step2 data={formData} updateData={updateFormData} onNext={nextStep} />}
                        {step === 3 && <AgendaStep data={formData} updateData={updateFormData} onNext={nextStep} />}
                        {step === 4 && <Step3 data={formData} updateData={updateFormData} onSubmit={handleSubmit} />}
                    </div>

                    {/* Navigation */}
                    <div className={`flex items-center justify-between pt-6 border-t ${
                        eosMode ? 'border-neutral-700' : 'border-slate-100'
                    }`}>
                        {step === 1 ? (
                            <Link
                                href="/dashboard"
                                className={`flex items-center gap-2 px-6 py-2 font-semibold transition-all ${
                                    eosMode
                                        ? 'text-neutral-400 hover:text-neutral-200'
                                        : 'text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                <ArrowLeft className="w-4 h-4" /> Dashboard
                            </Link>
                        ) : (
                            <button
                                onClick={prevStep}
                                className={`flex items-center gap-2 px-6 py-2 font-semibold transition-all ${
                                    eosMode
                                            ? 'text-neutral-400 hover:text-neutral-200'
                                            : 'text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                <ArrowLeft className="w-4 h-4" /> Back
                            </button>
                        )}
                        {step < TOTAL_STEPS && showBottomContinue ? (
                            <button
                                onClick={() => {
                                    if (step === 1) {
                                        if (!formData.title?.trim()) {
                                            window.dispatchEvent(new CustomEvent('showTitleError'));
                                            return;
                                        }
                                        if (!formData.duration || formData.duration < 5 || formData.duration > 480) {
                                            window.dispatchEvent(new CustomEvent('showDurationError'));
                                            return;
                                        }
                                    }
                                    nextStep();
                                }}
                                className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all ${
                                    eosMode
                                        ? 'bg-amber-500 text-black hover:bg-amber-400'
                                        : 'bg-skip-coral text-white hover:bg-orange-600'
                                }`}
                            >
                                Continue <ArrowRight className="w-4 h-4" />
                            </button>
                        ) : step === TOTAL_STEPS ? (
                            <button
                                onClick={handleSubmit}
                                disabled={formData.attendees?.length === 0}
                                className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                                    eosMode
                                        ? 'bg-amber-500 text-black hover:bg-amber-400'
                                        : 'bg-skip-coral text-white hover:bg-orange-600'
                                }`}
                            >
                                {eosMode ? 'Get Verdict' : 'See Results'} <CheckCircle2 className="w-4 h-4" />
                            </button>
                        ) : (
                            // Step 3 (agenda) - forward navigation is handled by the component
                            <div />
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
