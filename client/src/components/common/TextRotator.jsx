import React, { useState, useEffect } from 'react';

/**
 * TextRotator
 * Animated rolling words with glowing gradient effect and 3D flip animation.
 */
export const TextRotator = ({
  words = [
    'Zero Queues ⚡',
    'Instant Pickup ⏱️',
    'Fresh Hot Meals 🍲',
    'Smart Campus Dining 🚀',
    'Pure Veg Cravings 🥗',
  ],
  interval = 2800,
  className = '',
}) => {
  const [index, setIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsFlipping(true);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % words.length);
        setIsFlipping(false);
      }, 350); // half transition duration
    }, interval);

    return () => clearInterval(timer);
  }, [words.length, interval]);

  return (
    <span
      className={`inline-block transition-all duration-500 transform ${
        isFlipping
          ? '-translate-y-4 opacity-0 rotate-x-90'
          : 'translate-y-0 opacity-100 rotate-x-0'
      } ${className}`}
      style={{
        perspective: '1000px',
        display: 'inline-block',
      }}
    >
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 font-black drop-shadow-[0_2px_15px_rgba(121,85,232,0.6)]">
        {words[index]}
      </span>
    </span>
  );
};
