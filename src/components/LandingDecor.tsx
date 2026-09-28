export function LandingFloralTop() {
  return (
    <svg
      className="landing-floral-top"
      viewBox="0 0 360 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M180 18c-8 14-22 22-38 24 16 2 28 10 38 24 10-14 22-22 38-24-16-2-30-10-38-24Z"
        fill="#E8B4B0"
        fillOpacity="0.55"
      />
      <circle cx="180" cy="38" r="10" fill="#D4928C" fillOpacity="0.45" />
      <path
        d="M72 52c6-10 16-16 28-16-6 12-4 24 4 34-10-6-20-10-32-18Z"
        fill="#C9A87C"
        fillOpacity="0.35"
      />
      <path
        d="M288 52c-6-10-16-16-28-16 6 12 4 24-4 34 10-6 20-10 32-18Z"
        fill="#C9A87C"
        fillOpacity="0.35"
      />
      <ellipse cx="48" cy="78" rx="22" ry="12" fill="#B8C9A8" fillOpacity="0.4" transform="rotate(-25 48 78)" />
      <ellipse cx="312" cy="78" rx="22" ry="12" fill="#B8C9A8" fillOpacity="0.4" transform="rotate(25 312 78)" />
      <path
        d="M0 110 Q90 88 180 98 T360 110"
        stroke="#C9A87C"
        strokeOpacity="0.35"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M120 98c8-6 18-8 28-4M212 98c-8-6-18-8-28-4"
        stroke="#D4928C"
        strokeOpacity="0.4"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function LandingFloralCorner({ flip }: { flip?: boolean }) {
  return (
    <svg
      className={`landing-floral-corner${flip ? ' landing-floral-corner--flip' : ''}`}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="38" cy="38" r="14" fill="#E8B4B0" fillOpacity="0.5" />
      <circle cx="52" cy="28" r="9" fill="#D4928C" fillOpacity="0.4" />
      <circle cx="28" cy="52" r="8" fill="#F0C8C4" fillOpacity="0.45" />
      <ellipse cx="70" cy="58" rx="18" ry="9" fill="#B8C9A8" fillOpacity="0.35" transform="rotate(-30 70 58)" />
      <ellipse cx="58" cy="72" rx="14" ry="7" fill="#A8B898" fillOpacity="0.3" transform="rotate(-50 58 72)" />
      <path
        d="M8 95 Q40 70 75 88"
        stroke="#C9A87C"
        strokeOpacity="0.35"
        strokeWidth="1.2"
        fill="none"
      />
    </svg>
  )
}

export function LandingRingsIcon() {
  return (
    <svg
      className="landing-rings-icon"
      viewBox="0 0 80 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="28" cy="20" r="16" stroke="#C9A87C" strokeWidth="2.5" fill="none" />
      <circle cx="52" cy="20" r="16" stroke="#D4928C" strokeWidth="2.5" fill="none" />
      <path d="M36 12 L44 12" stroke="#C9A87C" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function LandingMcLogo() {
  return (
    <svg
      className="landing-mc-logo"
      viewBox="0 0 200 132"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="MC 웨딩 로고"
      role="img"
    >
      <defs>
        <filter id="mcMonogramShadow" x="0" y="0" width="200" height="132" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#1A1A1A" floodOpacity="0.2" />
        </filter>
      </defs>

      <rect
        x="8"
        y="8"
        width="184"
        height="116"
        rx="2"
        fill="#1A1A1A"
        filter="url(#mcMonogramShadow)"
      />

      <g fill="#FFFFFF" fontFamily="Georgia, 'Times New Roman', Times, serif" fontWeight="700">
        <text x="68" y="86" fontSize="56" textAnchor="middle">
          M
        </text>
        <text x="108" y="86" fontSize="56" textAnchor="middle" letterSpacing="-2">
          C
        </text>
      </g>

      <text
        x="100"
        y="108"
        textAnchor="middle"
        fill="#FFFFFF"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="7.5"
        fontWeight="600"
        letterSpacing="2.8"
      >
        ENX WEDDING
      </text>

      <line x1="52" y1="114" x2="78" y2="114" stroke="#FFFFFF" strokeOpacity="0.55" strokeWidth="0.6" />
      <line x1="122" y1="114" x2="148" y2="114" stroke="#FFFFFF" strokeOpacity="0.55" strokeWidth="0.6" />
      <text
        x="100"
        y="122"
        textAnchor="middle"
        fill="#FFFFFF"
        fillOpacity="0.75"
        fontFamily="Inter, Arial, sans-serif"
        fontSize="5.5"
        fontWeight="500"
        letterSpacing="1.6"
      >
        WEDDING MC
      </text>
    </svg>
  )
}
