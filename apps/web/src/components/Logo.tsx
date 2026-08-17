type Props = { size?: number; className?: string };

/** Shield + crown + ball — logo ALYM */
export function AlymLogo({ size = 120, className = '' }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="ALYM logo"
    >
      <defs>
        <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffe08a" />
          <stop offset="45%" stopColor="#f2c738" />
          <stop offset="100%" stopColor="#b8860b" />
        </linearGradient>
        <linearGradient id="goldDark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f2c738" />
          <stop offset="100%" stopColor="#8a6508" />
        </linearGradient>
      </defs>
      {/* Shield */}
      <path
        d="M60 8 L100 24 V58 C100 88 78 108 60 114 C42 108 20 88 20 58 V24 Z"
        fill="#0a0c14"
        stroke="url(#gold)"
        strokeWidth="3"
      />
      <path
        d="M60 16 L92 28 V56 C92 80 74 96 60 102 C46 96 28 80 28 56 V28 Z"
        fill="#14161f"
        stroke="url(#goldDark)"
        strokeWidth="1.5"
        opacity="0.9"
      />
      {/* Crown */}
      <path
        d="M40 34 L48 48 L60 36 L72 48 L80 34 L76 52 H44 Z"
        fill="url(#gold)"
      />
      <circle cx="40" cy="32" r="3" fill="#ffe08a" />
      <circle cx="60" cy="28" r="3.5" fill="#ffe08a" />
      <circle cx="80" cy="32" r="3" fill="#ffe08a" />
      {/* Ball */}
      <circle cx="60" cy="72" r="18" fill="url(#gold)" opacity="0.95" />
      <circle cx="60" cy="72" r="18" fill="none" stroke="#0a0c14" strokeWidth="1.5" />
      <path
        d="M60 54 C52 60 48 68 48 72 C48 80 53 88 60 90 C67 88 72 80 72 72 C72 68 68 60 60 54 Z"
        fill="none"
        stroke="#0a0c14"
        strokeWidth="1.2"
      />
      <path d="M45 66 H75" stroke="#0a0c14" strokeWidth="1.2" />
      <path d="M47 80 Q60 86 73 80" stroke="#0a0c14" strokeWidth="1.2" fill="none" />
    </svg>
  );
}

export function MylaMark({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-alym-gold/20 text-alym-gold text-xs font-bold">
        LM
      </span>
      <span className="text-xs tracking-widest text-gray-500 uppercase">
        LA MYLA <span className="text-gray-600">Studios</span>
      </span>
    </div>
  );
}
