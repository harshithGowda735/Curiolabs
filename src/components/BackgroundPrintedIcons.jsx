/**
 * BackgroundPrintedIcons — Architectural & Laboratory Letterpress Watermark Stamps.
 * Gives the canvas a bespoke, custom-printed scientific journal / editorial look.
 */
export default function BackgroundPrintedIcons({ variant = 'dark', className = '' }) {
  // If variant is 'light', for dark backgrounds like #754F40 or #221611 (uses cream ink)
  // If variant is 'dark' (default), for warm cream #FAF5EB background (uses espresso ink)
  const isLight = variant === 'light'
  const strokeColor = isLight ? '#FAF5EB' : '#221611'
  const baseOpacity = isLight ? 'opacity-[0.22]' : 'opacity-[0.28]'

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none select-none z-0 ${className}`} aria-hidden="true">
      {/* ── 1. Corner Stamp: Vintage Quantum Atom & Orbitals ── */}
      <svg
        viewBox="0 0 200 200"
        className={`absolute -top-4 -left-6 sm:top-6 sm:left-8 w-36 h-36 sm:w-56 sm:h-56 ${baseOpacity} rotate-12 transition-transform duration-700`}
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
      >
        {/* Nucleus */}
        <circle cx="100" cy="100" r="14" fill={strokeColor} fillOpacity="0.18" />
        <circle cx="100" cy="100" r="6" fill={strokeColor} fillOpacity="0.4" />
        {/* Orbital 1 */}
        <ellipse cx="100" cy="100" rx="76" ry="26" transform="rotate(0 100 100)" strokeDasharray="4 3" />
        {/* Orbital 2 */}
        <ellipse cx="100" cy="100" rx="76" ry="26" transform="rotate(60 100 100)" />
        {/* Orbital 3 */}
        <ellipse cx="100" cy="100" rx="76" ry="26" transform="rotate(120 100 100)" strokeDasharray="3 3" />
        {/* Electrons */}
        <circle cx="176" cy="100" r="5" fill={strokeColor} />
        <circle cx="62" cy="35" r="5" fill={strokeColor} />
        <circle cx="62" cy="165" r="5" fill={strokeColor} />
        <text x="100" y="194" textAnchor="middle" fill={strokeColor} fontSize="8.5" fontFamily="monospace" fontWeight="bold" letterSpacing="2">
          MOD. ATOM 1913
        </text>
      </svg>

      {/* ── 2. Opposite Corner Stamp: Analog Oscilloscope Waveform & Frequency Graticule ── */}
      <svg
        viewBox="0 0 200 140"
        className={`absolute -bottom-6 -right-6 sm:bottom-6 sm:right-10 w-40 h-32 sm:w-56 sm:h-40 ${baseOpacity} -rotate-6 transition-transform duration-700`}
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.8"
      >
        {/* Grid Box */}
        <rect x="20" y="20" width="160" height="90" rx="6" strokeWidth="2" />
        {/* Horizontal Center & Graticules */}
        <line x1="20" y1="65" x2="180" y2="65" strokeDasharray="2 3" />
        <line x1="100" y1="20" x2="100" y2="110" strokeDasharray="2 3" />
        {/* Analog Sine Wave */}
        <path
          d="M 25 65 Q 45 25, 65 65 T 105 65 T 145 65 T 175 65"
          strokeWidth="3"
        />
        <text x="100" y="126" textAnchor="middle" fill={strokeColor} fontSize="7.5" fontFamily="monospace" fontWeight="bold">
          100MHz DSO • 1V/DIV
        </text>
      </svg>
    </div>
  )
}
