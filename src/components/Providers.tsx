'use client';

import { EOSProvider } from '@/contexts/EOSContext';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
    return (
        <EOSProvider>
            {children}
        </EOSProvider>
    );
}
