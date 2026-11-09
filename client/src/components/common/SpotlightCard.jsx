import React from 'react';

/**
 * SpotlightCard
 * Clean, modern surface card with subtle tactile hover elevation.
 * Flashlight cursor tracking removed for authentic production aesthetics.
 */
export const SpotlightCard = ({
  children,
  className = '',
  spotlightColor,
  onClick,
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden transition-all duration-300 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
