'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface EOSContextType {
    eosMode: boolean;
    toggleEosMode: () => void;
    setEosMode: (value: boolean) => void;
}

const EOSContext = createContext<EOSContextType | undefined>(undefined);

export function EOSProvider({ children }: { children: ReactNode }) {
    const [eosMode, setEosModeState] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('skip-score-eos-mode') === 'true';
        setEosModeState(stored);
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted) {
            // Update body class for global styling
            if (eosMode) {
                document.body.classList.add('eos-mode');
            } else {
                document.body.classList.remove('eos-mode');
            }
        }
    }, [eosMode, mounted]);

    // Listen for custom toggle event from other components
    useEffect(() => {
        const handleToggle = () => {
            setEosModeState(prev => {
                const newValue = !prev;
                localStorage.setItem('skip-score-eos-mode', String(newValue));
                return newValue;
            });
        };
        window.addEventListener('toggleEOSMode', handleToggle);
        return () => window.removeEventListener('toggleEOSMode', handleToggle);
    }, []);

    const toggleEosMode = () => {
        const newValue = !eosMode;
        setEosModeState(newValue);
        localStorage.setItem('skip-score-eos-mode', String(newValue));
    };

    const setEosMode = (value: boolean) => {
        setEosModeState(value);
        localStorage.setItem('skip-score-eos-mode', String(value));
    };

    return (
        <EOSContext.Provider value={{ eosMode, toggleEosMode, setEosMode }}>
            {children}
        </EOSContext.Provider>
    );
}

export function useEOS() {
    const context = useContext(EOSContext);
    if (context === undefined) {
        throw new Error('useEOS must be used within an EOSProvider');
    }
    return context;
}
