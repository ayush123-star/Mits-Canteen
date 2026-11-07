import React from 'react';

/**
 * BorderBeam
 * Animated neon light beam that traces around card borders, creating a high-tech glowing edge.
 */
export const BorderBeam = ({
  duration = 6,
  size = 200,
  className = '',
  colorFrom = '#7955E8',
  colorTo = '#526DFF',
}) => {
  return (
    <div
      style={{
        '--size': `${size}px`,
        '--duration': `${duration}s`,
        '--color-from': colorFrom,
        '--color-to': colorTo,
      }}
      className={`pointer-events-none absolute inset-0 rounded-[inherit] [border:1px_solid_transparent] 
        ![mask-clip:padding-box,border-box] 
        ![mask-composite:intersect] 
        [mask:linear-gradient(transparent,transparent),linear-gradient(white,white)] 
        after:absolute after:aspect-square after:w-[calc(var(--size))] 
        after:animate-border-beam after:[animation-duration:var(--duration)] 
        after:[background:linear-gradient(to_left,var(--color-from),var(--color-to),transparent)] 
        after:[offset-anchor:calc(var(--size)/2)_50%] 
        after:[offset-path:rect(0_auto_auto_0_round_calc(var(--size)))] ${className}`}
    />
  );
};
