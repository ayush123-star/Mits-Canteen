import React, { useState, useEffect } from 'react';
import { Landmark, Compass, Sparkles } from 'lucide-react';

const MITS_SCENES = [
  {
    id: 'heritage',
    src: '/assets/campus/mits-heritage-building.jpg',
    title: 'MITS Historic Heritage Administrative Building',
    caption: 'Estd. 1957 by Maharaja Jiwaji Rao Scindia • Campus Core',
    tag: 'Sacred Heart of MITS Campus'
  },
  {
    id: 'gate',
    src: '/assets/campus/mits-main-gate.jpg',
    title: 'MITS Iconic Entrance Gate & Arch',
    caption: 'Race Course Road, Gola Ka Mandir, Gwalior',
    tag: 'Main Entrance & Campus Perimeter'
  },
  {
    id: 'academic',
    src: '/assets/campus/mits-academic-block.jpg',
    title: 'MITS Engineering & Tech Lecture Complex',
    caption: 'Departments of CSE, IT, Electrical, Mechanical & Architecture',
    tag: 'Academic Hub'
  },
  {
    id: 'canteen',
    src: '/assets/campus/mits-main-canteen.jpg',
    title: 'MITS Main Canteen & Dining Hall',
    caption: 'Campus Dining Hall & Express Counter • MITS Gwalior',
    tag: 'MITS Main Canteen Counter'
  },
  {
    id: 'library',
    src: '/assets/campus/mits-central-library.jpg',
    title: 'Central Library & Knowledge Resource Center',
    caption: '1,00,000+ volumes, RFID digital research halls',
    tag: 'Central Library'
  },
  {
    id: 'gardens',
    src: '/assets/campus/mits-gardens.jpg',
    title: 'Lush Green Campus Lawns & Scindia Square',
    caption: '44.6 Acres Serene Botanical Landscape',
    tag: 'Campus Gardens'
  }
];

export const MitsCampusBackground = ({
  overlay = 'auth', // 'auth' | 'hero' | 'tv' | 'minimal'
  showBadge = true,
  showControls = true,
  className = ''
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);

  // Smooth cinematic crossfade interval (changes photo smoothly like a documentary / drone reel)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % MITS_SCENES.length);
    }, 8500);
    return () => clearInterval(timer);
  }, []);

  const activeScene = MITS_SCENES[currentIdx];

  // Overlay presets configured so MITS campus images are CLEARLY visible and not pitch-black!
  const getOverlayClasses = () => {
    switch (overlay) {
      case 'hero':
        return 'bg-gradient-to-b from-slate-950/85 via-slate-950/40 to-slate-950/90';
      case 'tv':
        return 'bg-gradient-to-b from-slate-950/85 via-slate-950/65 to-slate-950/90';
      case 'minimal':
        return 'bg-slate-950/30';
      case 'auth':
      default:
        // Clear visibility with gentle top-to-bottom vignette & radial glow
        return 'bg-gradient-to-t from-[#060B18]/80 via-[#060B18]/30 to-[#060B18]/70';
    }
  };

  return (
    <div className={`absolute inset-0 z-0 overflow-hidden pointer-events-none select-none ${className}`}>
      {/* 1. MITS High-Resolution Campus Slideshow with Ken-Burns Camera Motion */}
      {MITS_SCENES.map((scene, index) => {
        const isActive = index === currentIdx;
        const animationClass = index % 2 === 0 ? 'animate-mits-kenburns-1' : 'animate-mits-kenburns-2';

        return (
          <div
            key={scene.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? 'opacity-100 z-1' : 'opacity-0 z-0'
            }`}
          >
            <img
              src={scene.src}
              alt={scene.title}
              className={`w-full h-full object-cover object-center filter brightness-[0.78] contrast-[1.08] saturate-[1.15] scale-105 ${
                isActive ? animationClass : ''
              }`}
            />
          </div>
        );
      })}

      {/* 2. Tuned Cinematic Color Grading Overlay (Ensures Text Readability without Blacking Out Campus) */}
      <div className={`absolute inset-0 ${getOverlayClasses()}`} />

      {/* 3. Subtle Warm Ambient Lighting & Glow from MITS Colors (Orange / Amber / Navy) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(249,115,22,0.18),transparent_75%)]" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-orange-500/15 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl" />

      {/* 4. Subtle Shimmering Light Sweep Across Campus */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="w-[200%] h-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-light-sweep" />
      </div>

      {/* 5. Authentic MITS Live Campus Landmark Badge */}
      {showBadge && (
        <div className="absolute bottom-4 left-4 z-10 pointer-events-auto hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-orange-500/30 text-white shadow-xl">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <div className="text-[11px] leading-tight">
            <span className="font-extrabold text-orange-400">MITS Gwalior:</span>{' '}
            <span className="text-slate-200 font-medium">{activeScene.title}</span>
          </div>
        </div>
      )}

      {/* 6. Campus Scene Switcher Dots (Allows User to Click or View Current Scene) */}
      {showControls && (
        <div className="absolute bottom-4 right-4 z-10 pointer-events-auto hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/10 shadow-xl">
          <Compass className="w-3.5 h-3.5 text-orange-400 mr-1" />
          {MITS_SCENES.map((scene, idx) => (
            <button
              key={scene.id}
              onClick={() => setCurrentIdx(idx)}
              title={scene.title}
              className={`transition-all rounded-full ${
                idx === currentIdx
                  ? 'w-6 h-2 bg-gradient-to-r from-orange-500 to-amber-400'
                  : 'w-2 h-2 bg-white/40 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MitsCampusBackground;
