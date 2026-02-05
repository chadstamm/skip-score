import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'SkipScore - Score your meetings before you book them';
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
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
                    <svg viewBox="0 0 24 24" width="80" height="80">
                        <path d="M4 18V6L12 12L4 18Z" fill="#F97316" />
                        <path d="M14 6L21 12L14 18V6Z" fill="#0D9488" />
                    </svg>
                    <div style={{ display: 'flex', fontSize: '72px', fontWeight: 900, letterSpacing: '-0.05em' }}>
                        <span style={{ color: '#0D9488' }}>SKIP</span>
                        <span style={{ color: '#F97316' }}>SCORE</span>
                    </div>
                </div>

                {/* Tagline */}
                <div
                    style={{
                        fontSize: '32px',
                        fontWeight: 600,
                        color: 'rgba(255, 255, 255, 0.8)',
                        textAlign: 'center',
                        maxWidth: '800px',
                        lineHeight: 1.4,
                    }}
                >
                    Score your meetings before you book them.
                </div>

                {/* Sub-tagline */}
                <div
                    style={{
                        fontSize: '22px',
                        fontWeight: 500,
                        color: 'rgba(255, 255, 255, 0.4)',
                        marginTop: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                    }}
                >
                    <span>Build better agendas</span>
                    <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>|</span>
                    <span>Reclaim your time</span>
                </div>

                {/* Platform badges */}
                <div
                    style={{
                        display: 'flex',
                        gap: '24px',
                        marginTop: '48px',
                        alignItems: 'center',
                    }}
                >
                    {['Zoom', 'Teams', 'Google Meet'].map((platform) => (
                        <div
                            key={platform}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 20px',
                                borderRadius: '999px',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: 'rgba(255, 255, 255, 0.5)',
                                fontSize: '16px',
                                fontWeight: 600,
                            }}
                        >
                            {platform}
                        </div>
                    ))}
                </div>

                {/* URL */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: '32px',
                        fontSize: '18px',
                        fontWeight: 600,
                        color: 'rgba(255, 255, 255, 0.3)',
                    }}
                >
                    skipscore.app
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
