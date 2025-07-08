import React from 'react';

interface AtomProps {
  color?: string;
  size?: 'small' | 'medium' | 'large';
  text?: string;
  textColor?: string;
}

const sizeMap = {
  small: 24,
  medium: 40,
  large: 64,
};

export const Atom: React.FC<AtomProps> = ({ color = '#7cc6ff', size = 'medium', text = '', textColor = '#333' }) => {
  const loaderSize = sizeMap[size] || sizeMap.medium;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
      <svg
        width={loaderSize}
        height={loaderSize}
        viewBox="0 0 50 50"
        style={{ display: 'block' }}
      >
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeDasharray="31.4 31.4"
          strokeLinecap="round"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 25 25"
            to="360 25 25"
            dur="1s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
      {text && <span style={{ color: textColor, marginTop: 8 }}>{text}</span>}
    </div>
  );
}; 