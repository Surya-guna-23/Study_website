import React from 'react';

const COLORS = {
  Easy: { bg: '#1b3a2a', fg: '#7ee2b8', bd: '#2e6b4d' },
  Medium: { bg: '#3a331b', fg: '#f5d67b', bd: '#8a7526' },
  Hard: { bg: '#3a1f1f', fg: '#f79a9a', bd: '#8a3636' },
};

export default function Difficulty({ level = 'Medium' }) {
  const c = COLORS[level] || COLORS.Medium;
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 12px',
        borderRadius: '999px',
        fontSize: '0.8rem',
        fontWeight: 700,
        letterSpacing: '0.02em',
        color: c.fg,
        background: c.bg,
        border: `1px solid ${c.bd}`,
        verticalAlign: 'middle',
      }}>
      {level}
    </span>
  );
}
