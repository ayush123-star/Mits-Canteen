import React from 'react';
import { AestheticHeroBackground } from './AestheticHeroBackground';

/**
 * MitsCampusHeroVideo (Aesthetic Animation Replacement)
 * Completely eliminates background images and video slideshow,
 * replacing them with a unique 60FPS interactive cyber culinary particle & aurora animation.
 */
export const MitsCampusHeroVideo = ({
  overlayClass = 'bg-gradient-to-t from-[#08090D] via-[#08090D]/80 to-transparent',
  children,
}) => {
  return (
    <AestheticHeroBackground overlayClass={overlayClass}>
      {children}
    </AestheticHeroBackground>
  );
};

export default MitsCampusHeroVideo;
