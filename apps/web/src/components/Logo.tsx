type Props = { size?: number; className?: string; markOnly?: boolean };

/** Marque ALYM — géométrie sèche, encre + laiton. Pas d’icône football. */
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
      <rect x="1" y="1" width="62" height="62" fill="#141210" stroke="#C4A35A" strokeWidth="1.5" />
      <path d="M14 46 L28 16 H36 L22 46 Z" fill="#C4A35A" />
      <path d="M30 46 L44 20 H52 L38 46 Z" fill="#F2EBE0" />
      <line x1="14" y1="50" x2="50" y2="50" stroke="#C4A35A" strokeWidth="2" />
    </svg>
  );
}

export function MylaMark({ className = '' }: { className?: string }) {
  return (
    <span
      className={`text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--ink-faint)] ${className}`}
    >
      LA MYLA
    </span>
  );
}
