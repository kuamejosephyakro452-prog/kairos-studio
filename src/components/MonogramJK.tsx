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
  label = 'Monogramme JK — Joseph Kouamé, KAIROS STUDIO',
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
        <linearGradient id={gradId} x1="8" y1="8" x2="72" y2="72" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F0D78C" />
          <stop offset="50%" stopColor="#B8913F" />
          <stop offset="100%" stopColor="#E8C877" />
        </linearGradient>
      </defs>

      {showFrame && (
        <rect
          x="4"
          y="4"
          width="72"
          height="72"
          rx="12"
          stroke={`url(#${gradId})`}
          strokeWidth="1.15"
          strokeOpacity="0.65"
          className={animated ? 'jk-stroke jk-frame' : undefined}
        />
      )}

      {/* Trait vertical et courbe du J */}
      <path
        d="M31 20V47.5C31 54.4 26.6 58.8 20.5 58.8C17.6 58.8 15.2 57.9 13.6 56.6"
        stroke={`url(#${gradId})`}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={animated ? 'jk-stroke jk-j' : undefined}
      />

      {/* Petit empattement supérieur du J */}
      <path
        d="M25.5 20H36.5"
        stroke={`url(#${gradId})`}
        strokeWidth="1.6"
        strokeLinecap="round"
        className={animated ? 'jk-stroke jk-serif' : undefined}
      />

      {/* Hampe et diagonales du K */}
      <path
        d="M44 20V58.5"
        stroke={`url(#${gradId})`}
        strokeWidth="2.4"
        strokeLinecap="round"
        className={animated ? 'jk-stroke jk-k1' : undefined}
      />
      <path
        d="M62.5 20L44 40.5L64 58.5"
        stroke={`url(#${gradId})`}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={animated ? 'jk-stroke jk-k2' : undefined}
      />
    </svg>
  );
};
