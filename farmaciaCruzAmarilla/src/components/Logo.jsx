export default function Logo({ size = 36, withText = true }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <svg width={size} height={size} viewBox="0 0 64 64" aria-label="Cruz Amarilla">
        <circle cx="32" cy="32" r="30" fill="#1a1a1a" />
        <rect x="26" y="14" width="12" height="36" rx="2" fill="#f5b800" />
        <rect x="14" y="26" width="36" height="12" rx="2" fill="#f5b800" />
      </svg>
      {withText && (
        <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <strong style={{ fontSize: '1.05rem', letterSpacing: '-0.01em' }}>Farmacia</strong>
          <span style={{ fontSize: '0.78rem', color: '#d49b00', fontWeight: 600, letterSpacing: '0.08em' }}>
            CRUZ AMARILLA
          </span>
        </span>
      )}
    </span>
  )
}
