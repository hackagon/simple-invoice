interface LogoProps {
  showWordmark?: boolean;
  size?: number;
}

export function Logo({ showWordmark = true, size = 36 }: LogoProps) {
  return (
    <span className="logo">
      <svg
        className="logo__mark"
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="SimpleInvoice logo"
      >
        <defs>
          <linearGradient
            id="si-grad"
            x1="0"
            y1="0"
            x2="40"
            y2="40"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#6366f1" />
            <stop offset="1" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <rect width="40" height="40" rx="11" fill="url(#si-grad)" />
        <rect x="10.5" y="8.5" width="19" height="23" rx="3.5" fill="#fff" />
        <rect x="14" y="13.4" width="12" height="2.3" rx="1.15" fill="#4f46e5" />
        <rect x="14" y="18.2" width="12" height="2.3" rx="1.15" fill="#c7d2fe" />
        <rect x="14" y="23" width="7.5" height="2.3" rx="1.15" fill="#c7d2fe" />
        <circle cx="27" cy="28.5" r="5.5" fill="#22c55e" stroke="#fff" strokeWidth="2" />
        <path
          d="M24.7 28.6l1.5 1.5 2.6-2.8"
          stroke="#fff"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {showWordmark && (
        <span className="logo__word">
          Simple<span className="logo__word-accent">Invoice</span>
        </span>
      )}
    </span>
  );
}
