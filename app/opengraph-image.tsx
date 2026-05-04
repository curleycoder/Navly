import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Navly — Canadian PR Pathway Planner'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0B1F3A',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            fontSize: 22,
            color: '#D62828',
            fontWeight: 800,
            letterSpacing: 6,
            marginBottom: 28,
            textTransform: 'uppercase',
          }}
        >
          NAVLY
        </div>
        <div
          style={{
            fontSize: 62,
            fontWeight: 800,
            color: 'white',
            lineHeight: 1.1,
            marginBottom: 28,
            maxWidth: 820,
          }}
        >
          Your Canadian PR Pathway Planner
        </div>
        <div
          style={{
            fontSize: 26,
            color: '#94a3b8',
            maxWidth: 720,
            lineHeight: 1.5,
          }}
        >
          Estimate your CRS score, track days in Canada, and understand your best path to permanent residence.
        </div>
        <div style={{ marginTop: 52, display: 'flex', gap: 16 }}>
          {['Free pathway screening', 'CRS score estimate', 'Canada days tracker'].map((label) => (
            <div
              key={label}
              style={{
                background: 'rgba(255,255,255,0.1)',
                borderRadius: 10,
                padding: '10px 22px',
                color: 'white',
                fontSize: 18,
                fontWeight: 600,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  )
}
