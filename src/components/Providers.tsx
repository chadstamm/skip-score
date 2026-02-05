'use client';

import { EOSProvider } from '@/contexts/EOSContext';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
    return (
        <EOSProvider>
            {children}
            <Analytics />
            <SpeedInsights />
        </EOSProvider>
    );
}
