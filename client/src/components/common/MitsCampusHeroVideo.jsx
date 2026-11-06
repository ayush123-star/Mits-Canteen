import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Camera, Video, Compass, Sparkles } from 'lucide-react';

export const MitsCampusHeroVideo = ({
  videoSrc = '/assets/videos/mits-campus-tour.mp4',
  posterSrc = '/assets/videos/mits-campus-tour-poster.jpg',
  overlayClass = 'bg-gradient-to-t from-[#060B18] via-[#060B18]/70 to-[#060B18]/50',
  children
}) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check user's reduced-motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const listener = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener?.('change', listener);
    return () => mediaQuery.removeEventListener?.('change', listener);
  }, []);

  // Handle video autoplay safely with non-blocking error recovery
  useEffect(() => {
    if (prefersReducedMotion) return;

    const vid = videoRef.current;
    if (!vid) return;

    vid.muted = true;
    const playPromise = vid.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          // Autoplay blocked by browser policy; keep poster visible without crashing
          console.warn('Campus hero video autoplay notice:', err.message);
          setIsPlaying(false);
        });
    }
  }, [prefersReducedMotion]);

  const togglePlayback = () => {
    const vid = videoRef.current;
    if (!vid) return;

    if (vid.paused) {
      vid.play();
      setIsPlaying(true);
    } else {
      vid.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div className="relative w-full overflow-hidden bg-[#060B18]">
      {/* 1. Background Video / Poster Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        {/* Poster image fallback while loading or if reduced motion is preferred */}
        <img
          src={posterSrc}
          alt="MITS Gwalior Campus Heritage Architecture"
          className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ${
            videoLoaded && !videoError && !prefersReducedMotion ? 'opacity-0' : 'opacity-100 scale-105 animate-mits-kenburns-1'
          }`}
          loading="eager"
        />

        {/* Real MITS Campus Drone / Architecture Tour Video */}
        {!prefersReducedMotion && !videoError && (
          <video
            ref={videoRef}
            src={videoSrc}
            poster={posterSrc}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            onLoadedData={() => setVideoLoaded(true)}
            onError={() => {
              console.warn('Hero video failed, falling back to high-res campus photography');
              setVideoError(true);
            }}
            className={`w-full h-full object-cover object-center filter brightness-[0.78] contrast-[1.08] saturate-[1.12] transition-opacity duration-1000 ${
              videoLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* 2. Transparent Dark Overlay for Crisp Text Readability */}
        <div className={`absolute inset-0 ${overlayClass}`} />

        {/* 3. Subtle Warm Ambient Lighting & Glow from MITS Brand Colors (Orange & Dark Navy) */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,107,0,0.18),transparent_70%)]" />
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* 4. Subtle Shimmering Light Sweep Across Video */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="w-[200%] h-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-light-sweep" />
        </div>
      </div>

      {/* 5. Hero Content (Text, Heading, CTAs, Floating Badges) */}
      <div className="relative z-10">{children}</div>

      {/* 6. Subtle Video Status & Pause/Play Control Pill in Bottom Corner */}
      <div className="absolute bottom-5 right-5 z-20 hidden sm:flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-xl border border-white/10 text-white shadow-2xl">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-bold text-slate-200">
            MITS Gwalior Campus Reel
          </span>
          {!videoError && !prefersReducedMotion && (
            <button
              onClick={togglePlayback}
              title={isPlaying ? 'Pause Campus Video' : 'Play Campus Video'}
              className="p-1 rounded-full hover:bg-white/10 text-orange-400 hover:text-white transition-all cursor-pointer ml-1"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MitsCampusHeroVideo;
