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
      viewBox="0 0 180 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="MC 웨딩 로고"
      role="img"
    >
      <defs>
        <linearGradient id="mcLogoGold" x1="36" y1="30" x2="145" y2="150" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E8CF9E" />
          <stop offset="0.45" stopColor="#B99054" />
          <stop offset="1" stopColor="#F5E1B3" />
        </linearGradient>
        <linearGradient id="mcLogoInk" x1="54" y1="56" x2="132" y2="128" gradientUnits="userSpaceOnUse">
          <stop stopColor="#44413C" />
          <stop offset="1" stopColor="#151515" />
        </linearGradient>
        <filter id="mcLogoShadow" x="0" y="0" width="180" height="180" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="12" stdDeviation="14" floodColor="#B8847E" floodOpacity="0.16" />
        </filter>
      </defs>

      <g filter="url(#mcLogoShadow)">
        <circle cx="90" cy="90" r="70" fill="rgba(255,255,255,0.72)" />
        <circle cx="90" cy="90" r="65" stroke="url(#mcLogoGold)" strokeWidth="1.7" />
        <circle cx="90" cy="90" r="55" stroke="#E8B4B0" strokeWidth="0.8" strokeOpacity="0.45" strokeDasharray="2.5 6" />
      </g>

      <path
        d="M42 103c13-28 31-43 48-43 20 0 25 24 46 24 8 0 15-3 21-10"
        stroke="url(#mcLogoGold)"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.65"
      />
      <path
        d="M50 116c10-9 24-13 39-9 18 5 30 3 43-8"
        stroke="url(#mcLogoGold)"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.5"
      />

      <path
        d="M45 92c8-21 22-35 39-42M40 103c14 0 27-3 39-10M135 50c-6 17-18 31-35 40M143 74c-11 5-23 6-35 3"
        stroke="#8FAA83"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M59 73c-7-2-12-1-17 4M69 60c-5-6-10-8-16-7M121 63c8-2 14-1 19 4M112 77c6 6 12 8 19 7"
        stroke="#8FAA83"
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity="0.5"
      />

      <text
        x="88"
        y="104"
        textAnchor="middle"
        fill="url(#mcLogoInk)"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="58"
        fontStyle="italic"
        letterSpacing="-12"
      >
        MC
      </text>
      <text
        x="90"
        y="123"
        textAnchor="middle"
        fill="#B99054"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="10"
        letterSpacing="2.6"
      >
        WEDDING MC
      </text>
    </svg>
  )
}
