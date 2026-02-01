export function LuminaLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="memex-gradient" x1="4" y1="4" x2="36" y2="36">
          <stop offset="0%" stopColor="oklch(0.78 0.15 75)" />
          <stop offset="50%" stopColor="oklch(0.65 0.17 68)" />
          <stop offset="100%" stopColor="oklch(0.52 0.14 62)" />
        </linearGradient>
      </defs>

      {/* Rounded square background */}
      <rect
        x="2"
        y="2"
        width="36"
        height="36"
        rx="10"
        fill="url(#memex-gradient)"
      />

      {/* Central knowledge hub - the AI core */}
      <circle cx="20" cy="20" r="6" fill="white" />

      {/* Orbiting knowledge nodes - representing connected documents */}
      <circle cx="20" cy="8" r="3" fill="white" fillOpacity="0.9" />
      <circle cx="32" cy="20" r="3" fill="white" fillOpacity="0.9" />
      <circle cx="20" cy="32" r="3" fill="white" fillOpacity="0.9" />
      <circle cx="8" cy="20" r="3" fill="white" fillOpacity="0.9" />

      {/* Connection lines - neural pathways / knowledge flow */}
      <path
        d="M20 11 L20 14 M26 20 L29 20 M20 26 L20 29 M14 20 L11 20"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeOpacity="0.7"
      />

      {/* Inner spark - the insight/synthesis moment */}
      <circle cx="20" cy="20" r="2" fill="url(#memex-gradient)" />
    </svg>
  );
}

// Minimal version optimized for small sizes (favicons, tiny icons)
export function LuminaLogoMini({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="memex-mini-grad" x1="2" y1="2" x2="22" y2="22">
          <stop offset="0%" stopColor="oklch(0.78 0.15 75)" />
          <stop offset="100%" stopColor="oklch(0.52 0.14 62)" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="22" height="22" rx="6" fill="url(#memex-mini-grad)" />
      <circle cx="12" cy="12" r="4" fill="white" />
      <circle cx="12" cy="5" r="2" fill="white" fillOpacity="0.85" />
      <circle cx="19" cy="12" r="2" fill="white" fillOpacity="0.85" />
      <circle cx="12" cy="19" r="2" fill="white" fillOpacity="0.85" />
      <circle cx="5" cy="12" r="2" fill="white" fillOpacity="0.85" />
    </svg>
  );
}

// Animated version for loading states and hero sections
export function LuminaLogoAnimated({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="memex-anim-gradient" x1="4" y1="4" x2="36" y2="36">
          <stop offset="0%" stopColor="oklch(0.78 0.15 75)" />
          <stop offset="50%" stopColor="oklch(0.65 0.17 68)" />
          <stop offset="100%" stopColor="oklch(0.52 0.14 62)" />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect x="2" y="2" width="36" height="36" rx="10" fill="url(#memex-anim-gradient)" />

      {/* Central hub with pulse */}
      <circle cx="20" cy="20" r="6" fill="white">
        <animate
          attributeName="r"
          values="5.5;6.5;5.5"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>

      {/* Orbiting nodes with staggered opacity animation */}
      <circle cx="20" cy="8" r="3" fill="white">
        <animate
          attributeName="fill-opacity"
          values="0.7;1;0.7"
          dur="2s"
          begin="0s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="32" cy="20" r="3" fill="white">
        <animate
          attributeName="fill-opacity"
          values="0.7;1;0.7"
          dur="2s"
          begin="0.5s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="20" cy="32" r="3" fill="white">
        <animate
          attributeName="fill-opacity"
          values="0.7;1;0.7"
          dur="2s"
          begin="1s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="8" cy="20" r="3" fill="white">
        <animate
          attributeName="fill-opacity"
          values="0.7;1;0.7"
          dur="2s"
          begin="1.5s"
          repeatCount="indefinite"
        />
      </circle>

      {/* Connection lines */}
      <path
        d="M20 11 L20 14 M26 20 L29 20 M20 26 L20 29 M14 20 L11 20"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeOpacity="0.7"
      />

      {/* Inner core */}
      <circle cx="20" cy="20" r="2" fill="url(#memex-anim-gradient)" />
    </svg>
  );
}

// Keep SynapseLogo export for backwards compatibility
export { LuminaLogo as SynapseLogo };
