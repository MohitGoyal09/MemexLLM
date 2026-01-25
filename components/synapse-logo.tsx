export function SynapseLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="20" cy="20" r="18" fill="url(#synapse-gradient)" />
      <path
        d="M12 20C12 20 15 14 20 14C25 14 28 20 28 20C28 20 25 26 20 26C15 26 12 20 12 20Z"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="20" cy="20" r="3" fill="white" />
      <path d="M20 8V11M20 29V32M8 20H11M29 20H32" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <defs>
        <linearGradient id="synapse-gradient" x1="0" y1="0" x2="40" y2="40">
          <stop offset="0%" stopColor="oklch(0.72 0.16 70)" />
          <stop offset="100%" stopColor="oklch(0.55 0.15 65)" />
        </linearGradient>
      </defs>
    </svg>
  )
}
