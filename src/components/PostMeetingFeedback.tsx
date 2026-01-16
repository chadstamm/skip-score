'use client';

import React, { useState } from 'react';
import { AssessmentData } from '@/lib/types';
import { MessageCircleQuestion, ThumbsUp, ThumbsDown, Clock, X, CheckCircle2 } from 'lucide-react';

interface PostMeetingFeedbackProps {
    assessment: AssessmentData;
    onSubmit: (feedback: { wasNecessary: boolean; couldBeAsync: boolean; actualDuration?: number }) => void;
    onDismiss: () => void;
}

export default function PostMeetingFeedback({ assessment, onSubmit, onDismiss }: PostMeetingFeedbackProps) {
    const [wasNecessary, setWasNecessary] = useState<boolean | null>(null);
    const [couldBeAsync, setCouldBeAsync] = useState<boolean | null>(null);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = () => {
        if (wasNecessary !== null && couldBeAsync !== null) {
            onSubmit({
                wasNecessary,
                couldBeAsync,
            });
            setSubmitted(true);
            setTimeout(() => onDismiss(), 1500);
        }
    };

    if (submitted) {
        return (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 animate-in fade-in duration-300">
                <div className="flex items-center gap-3 text-emerald-700">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-bold">Thanks! Your feedback helps improve predictions.</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-500 p-2 rounded-xl">
                        <MessageCircleQuestion className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <div className="font-bold text-slate-900">How did it go?</div>
                        <div className="text-sm text-slate-600 truncate max-w-[200px]">{assessment.title}</div>
                    </div>
                </div>
                <button onClick={onDismiss} className="text-slate-400 hover:text-slate-600 transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="space-y-4">
                {/* Was it necessary? */}
                <div className="space-y-2">
                    <div className="text-sm font-bold text-slate-700">Was this meeting actually necessary?</div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setWasNecessary(true)}
                            className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                                wasNecessary === true
                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                            }`}
                        >
                            <ThumbsUp className="w-4 h-4" />
                            <span className="font-semibold text-sm">Yes</span>
                        </button>
                        <button
                            onClick={() => setWasNecessary(false)}
                            className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                                wasNecessary === false
                                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                            }`}
                        >
                            <ThumbsDown className="w-4 h-4" />
                            <span className="font-semibold text-sm">No</span>
                        </button>
                    </div>
                </div>

                {/* Could it have been async? */}
                <div className="space-y-2">
                    <div className="text-sm font-bold text-slate-700">Could it have been an email/Slack instead?</div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCouldBeAsync(true)}
                            className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                                couldBeAsync === true
                                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                            }`}
                        >
                            <span className="font-semibold text-sm">Yes, async would work</span>
                        </button>
                        <button
                            onClick={() => setCouldBeAsync(false)}
                            className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                                couldBeAsync === false
                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                            }`}
                        >
                            <span className="font-semibold text-sm">No, needed live sync</span>
                        </button>
                    </div>
                </div>

                {/* Submit */}
                <button
                    onClick={handleSubmit}
                    disabled={wasNecessary === null || couldBeAsync === null}
                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                        wasNecessary !== null && couldBeAsync !== null
                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                >
                    Submit Feedback
                </button>
            </div>
        </div>
    );
}
