import React, { useRef, useState, useEffect } from 'react';
import { Sparkles, Zap, Flame, Coffee, UtensilsCrossed } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const AestheticHeroBackground = ({
  className = '',
  overlayClass = 'bg-gradient-to-t from-[#0A0804] via-[#0A0804]/85 to-transparent',
  children,
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const { preset } = useTheme();

  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [burstCount, setBurstCount] = useState(0);

  // Theme-aware particle & ambient palette (Default: Imperial 24K Saffron Gold)
  const getThemePalette = () => {
    switch (preset) {
      case 'cyber-aurora':
        return {
          primary: '#8B5CF6',
          secondary: '#D946EF',
          accent: '#06B6D4',
          glow1: 'rgba(139, 92, 246, 0.28)',
          glow2: 'rgba(217, 70, 239, 0.22)',
          glow3: 'rgba(6, 182, 212, 0.18)',
        };
      case 'emerald-matcha':
        return {
          primary: '#059669',
          secondary: '#10B981',
          accent: '#34D399',
          glow1: 'rgba(5, 150, 105, 0.28)',
          glow2: 'rgba(16, 185, 129, 0.22)',
          glow3: 'rgba(52, 211, 153, 0.18)',
        };
      case 'sunset-ember':
        return {
          primary: '#FF4565',
          secondary: '#FF7844',
          accent: '#FFA834',
          glow1: 'rgba(255, 69, 101, 0.32)',
          glow2: 'rgba(255, 120, 68, 0.25)',
          glow3: 'rgba(255, 168, 52, 0.20)',
        };
      case 'royal-gold':
      default:
        return {
          primary: '#D97706',
          secondary: '#F59E0B',
          accent: '#FCD34D',
          glow1: 'rgba(217, 119, 6, 0.36)',
          glow2: 'rgba(245, 158, 11, 0.30)',
          glow3: 'rgba(252, 211, 77, 0.24)',
        };
    }
  };

  const palette = getThemePalette();

  // 60FPS Interactive Cyber Particle & Ember Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    let width = (canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.offsetHeight || window.innerHeight);

    const isMobile = width < 768;
    const particleCount = isMobile ? 32 : 65;
    const connectionDist = isMobile ? 90 : 130;

    const mouse = {
      x: -1000,
      y: -1000,
      radius: isMobile ? 100 : 160,
    };

    class EmberParticle {
      constructor() {
        this.reset(true);
      }

      reset(init = false) {
        this.x = Math.random() * width;
        this.y = init ? Math.random() * height : height + Math.random() * 20;
        this.size = Math.random() * 2.4 + 1.2;
        this.speedY = Math.random() * 0.7 + 0.35; // gentle upward rise like steam/ember
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.alpha = Math.random() * 0.6 + 0.3;
        this.maxAlpha = this.alpha;
        this.fadeSpeed = Math.random() * 0.003 + 0.001;
        this.wobble = Math.random() * Math.PI * 2;
        this.wobbleSpeed = Math.random() * 0.03 + 0.01;
        // Color choice from palette
        const colors = [palette.primary, palette.secondary, palette.accent, '#FFFFFF'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.y -= this.speedY;
        this.wobble += this.wobbleSpeed;
        this.x += this.speedX + Math.sin(this.wobble) * 0.45;

        // Interactive mouse magnetic influence
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius && dist > 0) {
          const force = (1 - dist / mouse.radius) * 1.8;
          this.x += (dx / dist) * force * 1.5;
          this.y += (dy / dist) * force * 1.5;
        }

        // Fade as it nears top
        if (this.y < height * 0.25) {
          this.alpha -= this.fadeSpeed * 2.5;
        }

        if (this.y < -10 || this.alpha <= 0.02 || this.x < -20 || this.x > width + 20) {
          this.reset(false);
        }
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.restore();
      }
    }

    const particles = Array.from({ length: particleCount }, () => new EmberParticle());

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      setMousePos({ x: mouse.x, y: mouse.y });
    };

    const handleTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.touches[0].clientX - rect.left;
        mouse.y = e.touches[0].clientY - rect.top;
        setMousePos({ x: mouse.x, y: mouse.y });
      }
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw glowing constellation connections between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDist) {
            const lineAlpha = (1 - dist / connectionDist) * 0.18;
            ctx.strokeStyle = palette.primary;
            ctx.globalAlpha = lineAlpha;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // 2. Draw & update individual ember particles
      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      // 3. Subtle cursor magnetic halo glow on hover
      if (mouse.x > 0 && mouse.y > 0 && mouse.x < width && mouse.y < height) {
        const radGlow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, mouse.radius * 0.9);
        radGlow.addColorStop(0, palette.glow2);
        radGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = radGlow;
        ctx.globalAlpha = 0.45;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, mouse.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [preset, burstCount]);

  // Trigger interactive particle burst on click
  const triggerBurst = () => {
    setBurstCount((prev) => prev + 1);
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden bg-[#08090D] select-none ${className}`}
    >
      {/* ========================================================
          1. DEEP ATMOSPHERIC AURORA PLASMA BLOOMS (Zero Images)
          ======================================================== */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Glow Orb 1: Primary Sunset Ember / Neon Magenta (Top-Left) */}
        <div
          className="absolute -top-32 -left-32 w-[34rem] h-[34rem] rounded-full blur-[110px] animate-aurora-1 pointer-events-none"
          style={{ backgroundColor: palette.glow1 }}
        />

        {/* Glow Orb 2: Secondary Golden Amber / Electric Cyan (Center-Right) */}
        <div
          className="absolute top-1/4 -right-28 w-[38rem] h-[38rem] rounded-full blur-[130px] animate-aurora-2 pointer-events-none"
          style={{ backgroundColor: palette.glow2 }}
        />

        {/* Glow Orb 3: Subtle Accent Underglow (Bottom-Center) */}
        <div
          className="absolute -bottom-24 left-1/3 w-[30rem] h-[30rem] rounded-full blur-[100px] animate-aurora-1 pointer-events-none"
          style={{ backgroundColor: palette.glow3 }}
        />

        {/* Radial Center Aperture */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.025),transparent_65%)]" />
      </div>

      {/* ========================================================
          2. PERSPECTIVE CYBER GRID HORIZON (Lower Third Depth)
          ======================================================== */}
      <div
        className="absolute bottom-0 left-0 right-0 h-72 pointer-events-none cyber-grid-horizon z-0 [mask-image:linear-gradient(to_top,rgba(0,0,0,0.7)_0%,transparent_100%)] opacity-40"
      />

      {/* ========================================================
          3. HOLOGRAPHIC 3D CULINARY GLYPHS (Pure Vector SVGs)
          ======================================================== */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 hidden sm:block">
        {/* Holographic Glyph 1: Steaming Artisan Coffee Cup (Top Right) */}
        <div className="absolute top-16 right-[12%] animate-float-slow opacity-25 hover:opacity-60 transition-opacity">
          <svg width="72" height="72" viewBox="0 0 64 64" fill="none" className="filter drop-shadow-[0_0_12px_rgba(255,120,68,0.5)]">
            {/* Animated Steam Curls */}
            <path d="M22 14 Q26 8 22 2" stroke={palette.accent} strokeWidth="2" strokeLinecap="round" className="animate-steam-1" />
            <path d="M30 16 Q34 10 30 4" stroke={palette.primary} strokeWidth="2" strokeLinecap="round" className="animate-steam-2" />
            <path d="M38 14 Q42 8 38 2" stroke={palette.secondary} strokeWidth="2" strokeLinecap="round" className="animate-steam-1" />
            {/* Cup Outline */}
            <path d="M14 20 H46 V38 C46 47 38 52 30 52 C22 52 14 47 14 38 Z" stroke={palette.primary} strokeWidth="2.5" />
            {/* Handle */}
            <path d="M46 25 H52 C56 25 56 35 52 35 H46" stroke={palette.secondary} strokeWidth="2.5" strokeLinecap="round" />
            {/* Saucer */}
            <path d="M10 56 H50" stroke={palette.accent} strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>

        {/* Holographic Glyph 2: Cyber Gourmet Burger Wireframe (Bottom Left) */}
        <div className="absolute bottom-28 left-[6%] animate-float-reverse opacity-20 hover:opacity-50 transition-opacity">
          <svg width="84" height="84" viewBox="0 0 64 64" fill="none" className="filter drop-shadow-[0_0_14px_rgba(255,69,101,0.5)]">
            {/* Top Bun */}
            <path d="M12 24 C12 14 20 8 32 8 C44 8 52 14 52 24 Z" stroke={palette.secondary} strokeWidth="2.2" />
            {/* Lettuce Wave */}
            <path d="M10 28 Q16 26 22 28 Q28 30 34 28 Q40 26 46 28 Q50 29 54 28" stroke={palette.accent} strokeWidth="2" strokeLinecap="round" />
            {/* Cheddar Cheese Fold */}
            <path d="M12 33 H52 L42 40 H22 Z" stroke={palette.accent} strokeWidth="2" />
            {/* Patty */}
            <rect x="11" y="41" width="42" height="6" rx="3" stroke={palette.primary} strokeWidth="2.2" />
            {/* Bottom Bun */}
            <path d="M14 50 H50 C50 56 44 58 32 58 C20 58 14 56 14 50 Z" stroke={palette.secondary} strokeWidth="2.2" />
          </svg>
        </div>

        {/* Holographic Glyph 3: Neon Cyber Pizza Slice (Top Left) */}
        <div className="absolute top-24 left-[8%] animate-float-slow opacity-20 hover:opacity-50 transition-opacity">
          <svg width="68" height="68" viewBox="0 0 64 64" fill="none" className="filter drop-shadow-[0_0_12px_rgba(255,168,52,0.5)]">
            {/* Crust */}
            <path d="M12 16 Q32 10 52 16" stroke={palette.accent} strokeWidth="3" strokeLinecap="round" />
            {/* Slice Triangle */}
            <path d="M14 18 L32 54 L50 18" stroke={palette.primary} strokeWidth="2.2" strokeLinejoin="round" />
            {/* Pepperoni & Topping Dots */}
            <circle cx="28" cy="26" r="3.5" stroke={palette.secondary} strokeWidth="1.8" />
            <circle cx="36" cy="34" r="3" stroke={palette.secondary} strokeWidth="1.8" />
            <circle cx="32" cy="44" r="2" fill={palette.accent} />
          </svg>
        </div>

        {/* Twinkling Cosmic Sparkle Accents */}
        <div className="absolute top-1/3 right-[24%] animate-pulse text-amber-300/40 text-lg">✦</div>
        <div className="absolute top-2/3 right-[8%] animate-ping text-purple-400/30 text-xs">✧</div>
        <div className="absolute bottom-1/3 left-[20%] animate-pulse text-orange-400/40 text-base">◈</div>
      </div>

      {/* ========================================================
          4. 60FPS INTERACTIVE CANVAS PARTICLES & EMBERS
          ======================================================== */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-0"
      />

      {/* ========================================================
          5. TOP-TO-BOTTOM LIGHT SWEEP EFFECT
          ======================================================== */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="w-[200%] h-full bg-gradient-to-r from-transparent via-white/[0.035] to-transparent animate-light-sweep" />
      </div>

      {/* ========================================================
          6. VIGNETTE OVERLAY (Text Readability & Contrast)
          ======================================================== */}
      <div className={`absolute inset-0 pointer-events-none z-0 ${overlayClass}`} />

      {/* ========================================================
          7. FOREGROUND HERO CONTENT (Heading, Badges, CTAs)
          ======================================================== */}
      <div className="relative z-10">{children}</div>

      {/* ========================================================
          8. AESTHETIC INTERACTIVE VIBE CONTROLLER PILL (Bottom Right)
          ======================================================== */}
      <div className="absolute bottom-5 right-5 z-20 hidden sm:flex items-center gap-2">
        <button
          type="button"
          onClick={triggerBurst}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#12141D]/90 hover:bg-[#1A1D2B] border border-white/10 text-white shadow-2xl backdrop-blur-xl transition-all active:scale-95 cursor-pointer group"
          title="Click to trigger interactive spark burst!"
        >
          <span className="relative flex h-2 w-2">
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ backgroundColor: palette.primary }}
            />
            <span
              className="relative inline-flex rounded-full h-2 w-2"
              style={{ backgroundColor: palette.primary }}
            />
          </span>
          <span className="text-[11px] font-black tracking-wide text-slate-200 group-hover:text-white flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Interactive Cyber Ambient</span>
            <span className="px-1.5 py-0.2 rounded-md bg-white/10 text-[9px] font-mono text-slate-400">
              60 FPS
            </span>
          </span>
        </button>
      </div>
    </div>
  );
};

export default AestheticHeroBackground;
