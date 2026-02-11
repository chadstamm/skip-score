import { AssessmentData, Recommendation, ProtectedMeetingType, ReadinessLevel } from './types';

export const detectProtectedType = (title: string): ProtectedMeetingType => {
    const t = title?.toLowerCase() || '';
    if (t.includes('l10') || t.includes('level 10') || t.includes('weekly l10')) return 'L10';
    if (t.includes('ids') || t.includes('issues')) return 'IDS';
    if (t.includes('quarterly') || t.includes('annual')) return 'QUARTERLY';
    return null;
};

// EOS agenda template keywords per meeting type
const EOS_AGENDA_KEYWORDS: Record<string, string[]> = {
    L10: ['segue', 'scorecard', 'rock', 'rocks', 'headlines', 'to-do', 'todos', 'ids', 'issues', 'conclude'],
    IDS: ['identify', 'discuss', 'solve', 'issues', 'ids'],
    QUARTERLY: ['review', 'rocks', 'vision', 'goals', 'scorecard', 'issues', 'plan', 'next quarter'],
};

const IDEAL_TEAM_SIZE: Record<string, { min: number; max: number }> = {
    L10: { min: 3, max: 8 },
    IDS: { min: 2, max: 7 },
    QUARTERLY: { min: 4, max: 12 },
};

const IDEAL_DURATION: Record<string, number> = {
    L10: 90,
    IDS: 60,
    QUARTERLY: 480,
};

const IDEAL_FREQUENCY: Record<string, string> = {
    L10: 'WEEKLY',
    QUARTERLY: 'QUARTERLY',
};

export interface PreparednessResult {
    score: number;
    level: ReadinessLevel;
    tips: string[];
    strengths: string[];
}

export const calculatePreparednessScore = (data: AssessmentData, protectedType: NonNullable<ProtectedMeetingType>): PreparednessResult => {
    let score = 5.0; // baseline
    const tips: string[] = [];
    const strengths: string[] = [];

    // 1. Has agenda (+2.0 / -2.0)
    if (data.hasAgenda) {
        score += 2.0;
        strengths.push('Agenda is set — you\'re ready to run it by the book.');
    } else {
        score -= 2.0;
        tips.push('Add an agenda. Every EOS meeting needs a clear structure.');
    }

    // 2. Agenda matches EOS template (+1.5 / -0.5)
    if (data.hasAgenda && data.agendaItems && data.agendaItems.length > 0) {
        const keywords = EOS_AGENDA_KEYWORDS[protectedType] || [];
        const agendaTitles = data.agendaItems.map(a => a.title.toLowerCase()).join(' ');
        const matchCount = keywords.filter(kw => agendaTitles.includes(kw)).length;
        if (matchCount >= 2) {
            score += 1.5;
            strengths.push(`Agenda follows the ${protectedType} template.`);
        } else {
            score -= 0.5;
            tips.push(`Align your agenda with the standard ${protectedType} format (${keywords.slice(0, 3).join(', ')}, etc.).`);
        }
    } else if (data.hasAgenda) {
        // Has agenda checked but no items added — mild penalty
        score -= 0.5;
        tips.push(`Add specific agenda items that follow the ${protectedType} template.`);
    }

    // 3. Right team size (+1.0 / -1.0)
    const teamSize = data.attendees.length;
    const idealSize = IDEAL_TEAM_SIZE[protectedType];
    if (idealSize && teamSize >= idealSize.min && teamSize <= idealSize.max) {
        score += 1.0;
        strengths.push(`Team size (${teamSize}) is right for a ${protectedType}.`);
    } else if (idealSize) {
        score -= 1.0;
        if (teamSize < idealSize.min) {
            tips.push(`Add more attendees. A ${protectedType} works best with ${idealSize.min}-${idealSize.max} people.`);
        } else {
            tips.push(`Too many attendees. A ${protectedType} works best with ${idealSize.min}-${idealSize.max} people.`);
        }
    }

    // 4. DRI/facilitator assigned (+0.5 / -1.0)
    const hasDRI = data.attendees.some(a => a.isDRI);
    if (hasDRI) {
        score += 0.5;
        strengths.push('Facilitator assigned — someone owns the meeting.');
    } else {
        score -= 1.0;
        tips.push('Assign a facilitator. Every EOS meeting needs someone running it.');
    }

    // 5. Correct duration (+1.0 / -0.5)
    const idealDuration = IDEAL_DURATION[protectedType];
    if (idealDuration) {
        const tolerance = protectedType === 'QUARTERLY' ? 120 : 15; // more tolerance for full-day quarterly
        if (Math.abs(data.duration - idealDuration) <= tolerance) {
            score += 1.0;
            strengths.push(`Duration (${data.duration} min) matches the ${protectedType} standard.`);
        } else {
            score -= 0.5;
            tips.push(`Set duration to ${idealDuration} minutes. That's the standard for a ${protectedType}.`);
        }
    }

    // 6. Is recurring (+0.5 / -1.5)
    if (data.isRecurring) {
        score += 0.5;
        strengths.push('Meeting is recurring — consistency builds rhythm.');
    } else {
        score -= 1.5;
        tips.push('Make this recurring. EOS rhythms depend on consistent scheduling.');
    }

    // 7. Correct frequency (+0.5 / -0.5)
    const idealFrequency = IDEAL_FREQUENCY[protectedType];
    if (idealFrequency && data.isRecurring && data.recurrenceFrequency) {
        if (data.recurrenceFrequency === idealFrequency) {
            score += 0.5;
            strengths.push(`Frequency (${data.recurrenceFrequency.toLowerCase()}) is correct for a ${protectedType}.`);
        } else {
            score -= 0.5;
            tips.push(`A ${protectedType} should be ${idealFrequency.toLowerCase()}. Adjust your cadence.`);
        }
    }

    // 8. No optional attendees (+0.5 / -0.5)
    const optionalCount = data.attendees.filter(a => a.isOptional).length;
    if (optionalCount === 0) {
        score += 0.5;
        strengths.push('All attendees are required — full leadership commitment.');
    } else {
        score -= 0.5;
        tips.push('Mark all attendees as required. The full team should be committed.');
    }

    // Clamp 0-10
    score = Math.max(0, Math.min(10, score));
    score = parseFloat(score.toFixed(1));

    // Determine readiness level
    let level: ReadinessLevel;
    if (score < 3.0) level = 'NOT_READY';
    else if (score < 5.0) level = 'NEEDS_WORK';
    else if (score < 7.5) level = 'ALMOST_READY';
    else level = 'FULLY_PREPARED';

    return { score, level, tips, strengths };
};

interface ScoringOptions {
    eosMode?: boolean;
}

export const calculateScore = (data: AssessmentData, options: ScoringOptions = {}): { score: number; recommendation: Recommendation; reasoning: string } => {
    const { eosMode = false } = options;
    let score = 5.0;

    // Detect meeting types using shared utility
    const protectedType = detectProtectedType(data.title || '');
    const isL10Like = protectedType === 'L10';
    const isIDSLike = protectedType === 'IDS';
    const isQuarterlyPlanning = protectedType === 'QUARTERLY';
    const is1on1 = data.title?.toLowerCase().includes('1:1') ||
                   data.title?.toLowerCase().includes('1on1') ||
                   data.title?.toLowerCase().includes('one on one');

    // EOS Mode: Protected meeting types get a significant boost
    if (eosMode) {
        if (isL10Like) {
            score += 3.0; // L10s are sacred - almost always PROCEED
        } else if (isIDSLike) {
            score += 2.0; // IDS sessions are important
        } else if (isQuarterlyPlanning) {
            score += 2.5; // Quarterly planning is essential
        } else if (is1on1) {
            score += 1.0; // 1:1s are valuable for people management
        }
    }

    // Purpose
    switch (data.purpose) {
        case 'INFO_SHARE': score -= 1.5; break;
        case 'DECIDE': score += 1.0; break;
        case 'BRAINSTORM': score += 0.5; break;
        case 'ALIGN': score += 0.5; break;
    }

    // Urgency
    switch (data.urgency) {
        case 'TODAY': score += 0.5; break;
        case 'THIS_WEEK': score += 0.25; break;
        case 'FLEXIBLE': score -= 0.5; break;
    }

    // Decision Required
    score += data.decisionRequired ? 1.0 : -0.5;

    // Interactivity
    switch (data.interactivity) {
        case 'HIGH': score += 1.0; break;
        case 'MEDIUM': score += 0.5; break;
        case 'LOW': score -= 1.0; break;
    }

    // Complexity
    switch (data.complexity) {
        case 'HIGH': score += 0.75; break;
        case 'MEDIUM': score += 0.25; break;
        case 'LOW': score -= 0.5; break;
    }

    // Async Possible - only factor in if explicitly set
    if (data.asyncPossible !== undefined) {
        score += data.asyncPossible ? -1.0 : 0.75;
    }

    // Has Agenda
    score += data.hasAgenda ? 0.5 : -1.0;

    // Duration-based scoring (NEW)
    // Short meetings are generally better; long meetings need justification
    const duration = data.duration || 30;
    if (duration <= 15) {
        score += 0.5; // Quick sync - efficient
    } else if (duration <= 30) {
        score += 0.25; // Standard - no penalty
    } else if (duration > 60 && duration <= 90) {
        // Only penalize if not high complexity/interactivity
        if (data.complexity !== 'HIGH' && data.interactivity !== 'HIGH') {
            score -= 0.5;
        }
    } else if (duration > 90) {
        // Long meetings need strong justification
        // Exception: EOS quarterly planning, L10s are exactly 90 min
        if (!isQuarterlyPlanning && !isL10Like) {
            if (data.complexity !== 'HIGH') {
                score -= 0.75;
            }
        }
    }

    // Group Size
    const attendeeCount = data.attendees.length;
    if (attendeeCount >= 1 && attendeeCount <= 4) {
        score += 0.5;
    } else if (attendeeCount >= 5 && attendeeCount <= 7) {
        // No penalty - reasonable size
    } else if (attendeeCount >= 8 && attendeeCount <= 10) {
        score -= 0.25;
    } else if (attendeeCount > 10) {
        score -= 0.75; // Large meetings are usually wasteful
    }

    // No DRI
    const hasDRI = data.attendees.some(a => a.isDRI);
    if (!hasDRI) {
        score -= 0.75;
    }

    // Too many optional attendees is a smell
    const optionalCount = data.attendees.filter(a => a.isOptional).length;
    if (optionalCount > attendeeCount / 2 && attendeeCount > 2) {
        score -= 0.25; // If most people are optional, maybe the meeting is too
    }

    // Clamp score between 0 and 10
    score = Math.max(0, Math.min(10, score));

    // Recommendation
    let recommendation: Recommendation = 'PROCEED';
    let reasoning = "This meeting has a clear purpose and the right people. Proceed with a solid agenda.";

    if (score < 3.0) {
        recommendation = 'SKIP';
        if (eosMode) {
            reasoning = "This doesn't need a meeting. Add it to your Issues List and IDS it in your next L10.";
        } else {
            reasoning = "This meeting lacks a decision maker and interactivity. Consider an async update instead.";
        }
    } else if (score < 5.0) {
        recommendation = 'ASYNC_FIRST';
        if (eosMode) {
            reasoning = "This could be handled async. Save your meeting time for IDS. Try a Slack thread or Loom video.";
        } else {
            reasoning = "This appears to be an info-sharing session. A memo or video update is often more effective.";
        }
    } else if (score < 7.0) {
        recommendation = 'SHORTEN';
        if (eosMode) {
            reasoning = "Good intent, but tighten it up. Keep it focused and time-boxed so it doesn't eat into L10 time.";
        } else {
            reasoning = "Good intent, but the attendee list is high for the purpose. Try 15-20 mins max.";
        }
    } else {
        if (eosMode && (isL10Like || isIDSLike)) {
            reasoning = "This is core to your EOS rhythm. Protect this time and run it by the book.";
        }
    }

    return { score: parseFloat(score.toFixed(1)), recommendation, reasoning };
};

export const calculateSavings = (data: AssessmentData, score: number, recommendation: Recommendation) => {
    const hours = data.duration / 60;

    let savingsPercent = 0;
    switch (recommendation) {
        case 'SKIP': savingsPercent = 1.0; break;
        case 'ASYNC_FIRST': savingsPercent = 0.8; break;
        case 'SHORTEN': savingsPercent = 0.4; break;
        case 'PROCEED': savingsPercent = 0; break;
    }

    return {
        potentialHoursSaved: hours * data.attendees.length * savingsPercent
    };
};

export interface ScoreFactor {
    label: string;
    impact: number;
    description: string;
}

export const calculateScoreBreakdown = (data: AssessmentData, options: ScoringOptions = {}): { helping: ScoreFactor[]; hurting: ScoreFactor[] } => {
    const { eosMode = false } = options;
    const factors: ScoreFactor[] = [];

    // EOS Mode: Protected meeting detection using shared utility
    const protectedType = detectProtectedType(data.title || '');
    const isL10Like = protectedType === 'L10';
    const isIDSLike = protectedType === 'IDS';
    const isQuarterlyPlanning = protectedType === 'QUARTERLY';
    const is1on1 = data.title?.toLowerCase().includes('1:1') ||
                   data.title?.toLowerCase().includes('1on1');

    if (eosMode) {
        if (isL10Like) {
            factors.push({ label: 'L10 Meeting', impact: 3.0, description: 'Protected EOS rhythm meeting' });
        } else if (isIDSLike) {
            factors.push({ label: 'IDS Session', impact: 2.0, description: 'Issue solving session' });
        } else if (isQuarterlyPlanning) {
            factors.push({ label: 'Quarterly Planning', impact: 2.5, description: 'Essential planning session' });
        } else if (is1on1) {
            factors.push({ label: '1:1 Check-in', impact: 1.0, description: 'People management rhythm' });
        }
    }

    // Purpose
    const purposeLabels: Record<string, string> = {
        'INFO_SHARE': 'Information sharing',
        'DECIDE': 'Decision-making',
        'BRAINSTORM': 'Brainstorming',
        'ALIGN': 'Alignment'
    };
    const purposeImpacts: Record<string, number> = {
        'INFO_SHARE': -1.5,
        'DECIDE': 1.0,
        'BRAINSTORM': 0.5,
        'ALIGN': 0.5
    };
    factors.push({
        label: 'Purpose',
        impact: purposeImpacts[data.purpose],
        description: purposeLabels[data.purpose]
    });

    // Urgency
    const urgencyImpacts: Record<string, number> = { 'TODAY': 0.5, 'THIS_WEEK': 0.25, 'FLEXIBLE': -0.5 };
    const urgencyLabels: Record<string, string> = { 'TODAY': 'Urgent (today)', 'THIS_WEEK': 'This week', 'FLEXIBLE': 'Flexible timing' };
    factors.push({
        label: 'Urgency',
        impact: urgencyImpacts[data.urgency],
        description: urgencyLabels[data.urgency]
    });

    // Decision Required
    factors.push({
        label: 'Decision Required',
        impact: data.decisionRequired ? 1.0 : -0.5,
        description: data.decisionRequired ? 'Yes' : 'No'
    });

    // Interactivity
    const interactivityImpacts: Record<string, number> = { 'HIGH': 1.0, 'MEDIUM': 0.5, 'LOW': -1.0 };
    factors.push({
        label: 'Interactivity',
        impact: interactivityImpacts[data.interactivity],
        description: `${data.interactivity.charAt(0)}${data.interactivity.slice(1).toLowerCase()} interaction needed`
    });

    // Complexity
    const complexityImpacts: Record<string, number> = { 'HIGH': 0.75, 'MEDIUM': 0.25, 'LOW': -0.5 };
    factors.push({
        label: 'Complexity',
        impact: complexityImpacts[data.complexity],
        description: `${data.complexity.charAt(0)}${data.complexity.slice(1).toLowerCase()} complexity topic`
    });

    // Async Possible - only show if explicitly set
    if (data.asyncPossible !== undefined) {
        factors.push({
            label: 'Could Be Async',
            impact: data.asyncPossible ? -1.0 : 0.75,
            description: data.asyncPossible ? 'Yes, could handle async' : 'No, needs live discussion'
        });
    }

    // Has Agenda
    factors.push({
        label: 'Has Agenda',
        impact: data.hasAgenda ? 0.5 : -1.0,
        description: data.hasAgenda ? 'Agenda prepared' : 'No agenda'
    });

    // Duration
    const duration = data.duration || 30;
    let durationImpact = 0;
    let durationDesc = `${duration} min meeting`;
    if (duration <= 15) {
        durationImpact = 0.5;
        durationDesc = 'Quick sync (15 min or less)';
    } else if (duration <= 30) {
        durationImpact = 0.25;
        durationDesc = 'Standard length (30 min)';
    } else if (duration > 60 && duration <= 90) {
        if (data.complexity !== 'HIGH' && data.interactivity !== 'HIGH' && !isL10Like) {
            durationImpact = -0.5;
            durationDesc = 'Long meeting without high complexity';
        }
    } else if (duration > 90 && !isQuarterlyPlanning && !isL10Like) {
        if (data.complexity !== 'HIGH') {
            durationImpact = -0.75;
            durationDesc = 'Very long meeting';
        }
    }
    if (durationImpact !== 0) {
        factors.push({ label: 'Duration', impact: durationImpact, description: durationDesc });
    }

    // Group Size
    const attendeeCount = data.attendees.length;
    let groupImpact = 0;
    let groupDesc = `${attendeeCount} attendees`;
    if (attendeeCount >= 1 && attendeeCount <= 4) {
        groupImpact = 0.5;
        groupDesc = `Small group (${attendeeCount})`;
    } else if (attendeeCount >= 8 && attendeeCount <= 10) {
        groupImpact = -0.25;
        groupDesc = `Large group (${attendeeCount})`;
    } else if (attendeeCount > 10) {
        groupImpact = -0.75;
        groupDesc = `Very large group (${attendeeCount})`;
    }
    if (groupImpact !== 0) {
        factors.push({ label: 'Group Size', impact: groupImpact, description: groupDesc });
    }

    // DRI
    const hasDRI = data.attendees.some(a => a.isDRI);
    if (!hasDRI) {
        factors.push({
            label: 'No DRI',
            impact: -0.75,
            description: 'No decision maker assigned'
        });
    } else {
        factors.push({
            label: 'Has DRI',
            impact: 0,
            description: 'Decision maker assigned'
        });
    }

    // Optional attendee smell
    const optionalCount = data.attendees.filter(a => a.isOptional).length;
    if (optionalCount > attendeeCount / 2 && attendeeCount > 2) {
        factors.push({
            label: 'Many Optional',
            impact: -0.25,
            description: 'Most attendees are optional'
        });
    }

    const helping = factors.filter(f => f.impact > 0).sort((a, b) => b.impact - a.impact);
    const hurting = factors.filter(f => f.impact < 0).sort((a, b) => a.impact - b.impact);

    return { helping, hurting };
};

export const calculateActionPlan = (data: AssessmentData, recommendation: Recommendation, eosMode: boolean = false): string[] => {
    const actions: string[] = [];

    switch (recommendation) {
        case 'SKIP':
            if (eosMode) {
                actions.push('Add this topic to your Issues List.');
                actions.push('IDS it in your next L10 meeting.');
                actions.push('If urgent, send a quick Slack update to stakeholders.');
            } else {
                actions.push('Cancel the calendar invite.');
                actions.push('Send a status update email instead.');
                actions.push('Check in with key stakeholders 1:1 if needed.');
            }
            break;
        case 'ASYNC_FIRST':
            if (eosMode) {
                actions.push('Post the update in your team Slack channel.');
                actions.push('Record a quick Loom video if visuals help.');
                actions.push('Reserve meeting time for true IDS discussions.');
            } else {
                actions.push('Create a Slack thread or channel for this topic.');
                actions.push('Record a <5min Loom/Video update.');
                actions.push('Solicit feedback via document comments.');
            }
            break;
        case 'SHORTEN':
            if (eosMode) {
                actions.push('Time-box to 30 min max.');
                actions.push('Cut status updates - send those async.');
                actions.push('Focus only on items that need real-time discussion.');
            } else {
                actions.push('Cut duration by 50% (e.g. 30min -> 15min).');
                actions.push("Remove 'Update' agenda items - send them pre-read.");
            }
            if (data.attendees.length > 3) {
                actions.push('Mark non-essential attendees as Optional.');
            }
            break;
        case 'PROCEED':
            if (eosMode) {
                actions.push('Run it by the book - same time, same agenda.');
                actions.push('Assign a scribe to capture To-Dos and Issues.');
                actions.push('Rate the meeting 1-10 at the end to track quality.');
            } else {
                actions.push('Send a detailed agenda 24hrs in advance.');
                actions.push('Assign a note-taker for the session.');
                actions.push('Define the absolute decision required by the end.');
            }
            break;
    }

    return actions;
};
