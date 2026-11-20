import React from 'react';

interface MonogramJKProps {
  className?: string;
  size?: number;
  animated?: boolean;
  showFrame?: boolean;
  label?: string;
}

export const MonogramJK: React.FC<MonogramJKProps> = ({
  className = '',
  size = 44,
  animated = false,
  showFrame = true,
  label = 'JK — Joseph Kouamé, KAIROS STUDIO',
}) => {
  const gradId = React.useId();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label={label}
    >
      <defs>
        <linearGradient id={gradId} x1="6" y1="6" x2="74" y2="74" gradientUnits="userSpaceOnUse">
          <stop offset="0%" style={{ stopColor: 'var(--accent-1)' }} />
          <stop offset="55%" style={{ stopColor: 'var(--accent-2)' }} />
          <stop offset="100%" style={{ stopColor: 'var(--accent-3)' }} />
        </linearGradient>
      </defs>

      {showFrame && (
        <rect
          x="4"
          y="4"
          width="72"
          height="72"
          rx="16"
          stroke={`url(#${gradId})`}
          strokeWidth="1.5"
          strokeOpacity="0.8"
          className={animated ? 'jk-stroke jk-frame' : undefined}
        />
      )}

      {/* Lettre J géométrique sculptée */}
      <path
        d="M31 19V47.5C31 54.6 26.4 59 20.2 59C17.2 59 14.8 58 13.2 56.5"
        stroke={`url(#${gradId})`}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={animated ? 'jk-stroke jk-j' : undefined}
      />
      <path
        d="M25 19H37"
        stroke={`url(#${gradId})`}
        strokeWidth="2.2"
        strokeLinecap="round"
        className={animated ? 'jk-stroke jk-serif' : undefined}
      />

      {/* Lettre K dynamique */}
      <path
        d="M44.5 19V59"
        stroke={`url(#${gradId})`}
        strokeWidth="3"
        strokeLinecap="round"
        className={animated ? 'jk-stroke jk-k1' : undefined}
      />
      <path
        d="M64 19L45 40.2L65 59"
        stroke={`url(#${gradId})`}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={animated ? 'jk-stroke jk-k2' : undefined}
      />
    </svg>
  );
};
