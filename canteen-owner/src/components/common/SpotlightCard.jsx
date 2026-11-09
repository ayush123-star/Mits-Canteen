import React, { useRef, useState } from 'react';

/**
 * SpotlightCard
 * Award-winning radial mouse spotlight effect for cards.
 * When the user moves their cursor over the card, a soft radial beam follows the cursor,
 * illuminating the card border and surface.
 */
export const SpotlightCard = ({
  children,
  className = '',
  spotlightColor = 'rgba(245, 158, 11, 0.22)',
  onClick,
  ...props
}) => {
  const cardRef = useRef(null);
  const [position, setPosition] = useState({ x: -500, y: -500 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`relative overflow-hidden ${className}`}
      {...props}
    >
      {/* Radial Spotlight Beam */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300 z-10"
        style={{
          opacity,
          background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 70%)`,
        }}
      />
      {children}
    </div>
  );
};

export default SpotlightCard;
