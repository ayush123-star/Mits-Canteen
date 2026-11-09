import React from 'react';

/**
 * AestheticHeroBackground
 * High-end dark ambient background for campus hero sections.
 * Clean, subtle gradients and depth without CPU-heavy canvas loops or gimmicky particles.
 */
export const AestheticHeroBackground = ({
  className = '',
  overlayClass = 'bg-[#08090D]',
  children,
}) => {
  return (
    <div className={`relative w-full overflow-hidden bg-[#08090D] ${className}`}>
      {/* Subtle modern ambient background mesh */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[850px] h-[450px] bg-gradient-to-b from-indigo-900/20 via-purple-900/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 -right-40 w-[450px] h-[450px] bg-blue-900/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -left-40 w-[450px] h-[450px] bg-purple-900/10 rounded-full blur-3xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
