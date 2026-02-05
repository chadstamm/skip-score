import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'SkipScore - Should You Have This Meeting?';
export const size = {
    width: 1200,
    height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #0F172A 0%, #134E4A 50%, #0F172A 100%)',
                    fontFamily: 'system-ui, sans-serif',
                }}
            >
                {/* Logo icon + wordmark */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '48px' }}>
                    <svg viewBox="0 0 24 24" width="100" height="100">
                        <path d="M4 18V6L12 12L4 18Z" fill="#F97316" />
                        <path d="M14 6L21 12L14 18V6Z" fill="#0D9488" />
                    </svg>
                    <div style={{ display: 'flex', fontSize: '88px', fontWeight: 900, letterSpacing: '-0.04em' }}>
                        <span style={{ color: '#0D9488' }}>SKIP</span>
                        <span style={{ color: '#F97316' }}>SCORE</span>
                    </div>
                </div>

                {/* Tagline — big and bold */}
                <div
                    style={{
                        fontSize: '56px',
                        fontWeight: 900,
                        color: 'white',
                        textAlign: 'center',
                        lineHeight: 1.2,
                        letterSpacing: '-0.02em',
                    }}
                >
                    Should You Have This Meeting?
                </div>

                {/* Sub-tagline */}
                <div
                    style={{
                        fontSize: '24px',
                        fontWeight: 600,
                        color: 'rgba(255, 255, 255, 0.45)',
                        marginTop: '28px',
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                    }}
                >
                    Score. Prepare. Reclaim Your Time.
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
