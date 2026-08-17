type Props = { size?: number; className?: string; markOnly?: boolean };

/** Marque abstraite ALYM — plans + structure. Pas d'illustration sectorielle. */
export function AlymLogo({ size = 40, className = '', markOnly = false }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label={markOnly ? undefined : 'ALYM'}
      role="img"
    >
      <rect x="2" y="2" width="60" height="60" rx="14" fill="#111419" />
      <rect x="2.75" y="2.75" width="58.5" height="58.5" rx="13.25" stroke="#2A3140" strokeWidth="1.5" />
      <path d="M16 42 L28 18 L36 18 L24 42 Z" fill="#D4AF5A" />
      <path d="M30 42 L42 22 L50 22 L38 42 Z" fill="#EDE9E1" opacity="0.92" />
      <rect x="16" y="46" width="32" height="3" rx="1.5" fill="#B8923A" />
    </svg>
  );
}

export function MylaMark({ className = '' }: { className?: string }) {
  return (
    <span className={`text-[10px] font-medium uppercase tracking-[0.2em] text-mist-400 ${className}`}>
      LA MYLA
    </span>
  );
}
