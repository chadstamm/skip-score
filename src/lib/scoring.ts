import { AssessmentData, Recommendation } from './types';

export const calculateScore = (data: AssessmentData): { score: number; recommendation: Recommendation; reasoning: string } => {
    let score = 5.0;

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

    // Async Possible
    score += data.asyncPossible ? -1.5 : 1.0;

    // Has Agenda
    score += data.hasAgenda ? 0.5 : -1.0;

    // Group Size
    const attendeeCount = data.attendees.length;
    if (attendeeCount >= 1 && attendeeCount <= 4) {
        score += 0.5;
    } else if (attendeeCount >= 8) {
        score -= 0.5;
    }

    // No DRI
    const hasDRI = data.attendees.some(a => a.isDRI);
    if (!hasDRI) {
        score -= 0.75;
    }

    // Clamp score between 0 and 10
    score = Math.max(0, Math.min(10, score));

    // Recommendation
    let recommendation: Recommendation = 'PROCEED';
    let reasoning = "This meeting has a clear purpose and the right people. Proceed with a solid agenda.";

    if (score < 3.0) {
        recommendation = 'SKIP';
        reasoning = "This meeting lacks a decision maker and interactivity. Consider an async update instead.";
    } else if (score < 5.0) {
        recommendation = 'ASYNC_FIRST';
        reasoning = "This appears to be an info-sharing session. A memo or video update is often more effective.";
    } else if (score < 7.0) {
        recommendation = 'SHORTEN';
        reasoning = "Good intent, but the attendee list is high for the purpose. Try 15-20 mins max.";
    }

    return { score: parseFloat(score.toFixed(1)), recommendation, reasoning };
};

export const calculateSavings = (data: AssessmentData, score: number, recommendation: Recommendation) => {
    const hourlyRate = 75;
    const hours = data.duration / 60;
    const totalCost = data.attendees.length * hours * hourlyRate;

    let savingsPercent = 0;
    switch (recommendation) {
        case 'SKIP': savingsPercent = 1.0; break;
        case 'ASYNC_FIRST': savingsPercent = 0.8; break;
        case 'SHORTEN': savingsPercent = 0.4; break;
        case 'PROCEED': savingsPercent = 0; break;
    }

    return {
        totalCost,
        savings: totalCost * savingsPercent,
        potentialHoursSaved: hours * data.attendees.length * savingsPercent
    };
};

export const calculateActionPlan = (data: AssessmentData, recommendation: Recommendation): string[] => {
    const actions: string[] = [];

    switch (recommendation) {
        case 'SKIP':
            actions.push('Cancel the calendar invite.');
            actions.push('Send a status update email instead.');
            actions.push('Check in with key stakeholders 1:1 if needed.');
            break;
        case 'ASYNC_FIRST':
            actions.push('Create a Slack thread or channel for this topic.');
            actions.push('Record a <5min Loom/Video update.');
            actions.push('Solicit feedback via document comments.');
            break;
        case 'SHORTEN':
            actions.push('Cut duration by 50% (e.g. 30min -> 15min).');
            actions.push("Remove 'Update' agenda items - send them pre-read.");
            if (data.attendees.length > 3) {
                actions.push('Mark non-essential attendees as Optional.');
            }
            break;
        case 'PROCEED':
            actions.push('Send a detailed agenda 24hrs in advance.');
            actions.push('Assign a note-taker for the session.');
            actions.push('Define the absolute decision required by the end.');
            break;
    }

    return actions;
};
