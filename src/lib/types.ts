export type MeetingPurpose = 'INFO_SHARE' | 'DECIDE' | 'BRAINSTORM' | 'ALIGN';
export type MeetingUrgency = 'TODAY' | 'THIS_WEEK' | 'FLEXIBLE';
export type InteractivityLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type ComplexityLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type RecurrenceFrequency = 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';

export interface Attendee {
    id: string;
    name: string;
    role: string;
    isDRI: boolean;
    isOptional: boolean;
}

export interface AssessmentData {
    id: string;
    createdAt: string;
    title: string;
    purpose: MeetingPurpose;
    urgency: MeetingUrgency;
    duration: number; // in minutes
    decisionRequired: boolean;
    interactivity: InteractivityLevel;
    complexity: ComplexityLevel;
    asyncPossible: boolean;
    hasAgenda: boolean;
    attendees: Attendee[];
    isRecurring?: boolean;
    recurrenceFrequency?: RecurrenceFrequency;
    score?: number;
    recommendation?: Recommendation;
    reasoning?: string;
    // Post-meeting feedback
    feedbackSubmitted?: boolean;
    wasNecessary?: boolean;
    couldBeAsync?: boolean;
    actualDuration?: number;
}

export type Recommendation = 'SKIP' | 'ASYNC_FIRST' | 'SHORTEN' | 'PROCEED';
