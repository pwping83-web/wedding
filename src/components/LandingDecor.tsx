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
