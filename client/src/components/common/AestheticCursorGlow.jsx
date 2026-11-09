import React, { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

/**
 * AestheticCursorGlow
 * High-end ambient neon spotlight that smoothly follows mouse movements across the viewport.
 * Non-intrusive (pointer-events-none), disabled on mobile/touch screens for performance.
 */
export const AestheticCursorGlow = () => {
  const [pos, setPos] = useState({ x: -1000, y: -1000 });
  const [isVisible, setIsVisible] = useState(false);
  const { preset } = useTheme();

  const getGlowColor = () => {
    switch (preset) {
      case 'cyber-aurora':
        return 'rgba(139, 92, 246, 0.10)';
      case 'emerald-matcha':
        return 'rgba(16, 185, 129, 0.10)';
      case 'sunset-ember':
        return 'rgba(255, 94, 98, 0.10)';
      case 'royal-gold':
      default:
        return 'rgba(245, 158, 11, 0.14)';
    }
  };

  useEffect(() => {
    // Only activate on pointer-fine desktop devices
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    let animId;
    let targetX = -1000;
    let targetY = -1000;
    let currentX = -1000;
    let currentY = -1000;

    const onMouseMove = (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!isVisible) setIsVisible(true);
    };

    const onMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);

    const lerp = (a, b, n) => a + (b - a) * n;

    const loop = () => {
      currentX = lerp(currentX, targetX, 0.12);
      currentY = lerp(currentY, targetY, 0.12);
      setPos({ x: Math.round(currentX), y: Math.round(currentY) });
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-500 overflow-hidden"
      style={{ opacity: isVisible ? 1 : 0 }}
      aria-hidden="true"
    >
      <div
        className="absolute w-[500px] h-[500px] rounded-full blur-[100px] pointer-events-none transform -translate-x-1/2 -translate-y-1/2 will-change-transform"
        style={{
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          backgroundColor: getGlowColor(),
        }}
      />
    </div>
  );
};

export default AestheticCursorGlow;
