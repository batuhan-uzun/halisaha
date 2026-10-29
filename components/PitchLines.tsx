/** Saha cizgileri; yesil zeminin ustune yari saydam tebesir olarak oturur. */
export function PitchLines({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 260"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className={className}
    >
      <g fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="12" y="12" width="376" height="236" />
        <line x1="200" y1="12" x2="200" y2="248" />
        <circle cx="200" cy="130" r="38" />
        <rect x="12" y="70" width="56" height="120" />
        <rect x="12" y="102" width="20" height="56" />
        <rect x="332" y="70" width="56" height="120" />
        <rect x="368" y="102" width="20" height="56" />
        <path d="M68 104a32 32 0 0 1 0 52" />
        <path d="M332 104a32 32 0 0 0 0 52" />
      </g>
      <g fill="currentColor">
        <circle cx="200" cy="130" r="3" />
        <circle cx="50" cy="130" r="2.5" />
        <circle cx="350" cy="130" r="2.5" />
      </g>
    </svg>
  );
}
