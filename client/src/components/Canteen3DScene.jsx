import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export const Canteen3DScene = () => {
  const containerRef = useRef(null);
  const [activeModel, setActiveModel] = useState('burger'); // 'burger' | 'coffee' | 'token'
  const sceneRef = useRef(null);
  const modelsGroupRef = useRef(null);
  const burgerGroupRef = useRef(null);
  const coffeeGroupRef = useRef(null);
  const tokenGroupRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 450;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(0, 0, 7.8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 2. Cinematic Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff5e6, 2.2);
    sunLight.position.set(5, 8, 5);
    scene.add(sunLight);

    // Golden warm accent light
    const goldenLight = new THREE.PointLight(0xf59e0b, 3.5, 20);
    goldenLight.position.set(-4, 3, 3);
    scene.add(goldenLight);

    // Purple neon rim light
    const purpleLight = new THREE.PointLight(0xa855f7, 3.0, 20);
    purpleLight.position.set(4, -3, -2);
    scene.add(purpleLight);

    // Master Group for All Models
    const masterGroup = new THREE.Group();
    modelsGroupRef.current = masterGroup;
    scene.add(masterGroup);

    // ==========================================
    // MODEL 1: 3D GOURMET CAMPUS BURGER
    // ==========================================
    const burgerGroup = new THREE.Group();
    burgerGroupRef.current = burgerGroup;

    // Top Bun (Hemisphere)
    const topBunGeo = new THREE.SphereGeometry(1.4, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const bunMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.35,
      metalness: 0.05,
    });
    const topBun = new THREE.Mesh(topBunGeo, bunMat);
    topBun.position.y = 0.55;
    burgerGroup.add(topBun);

    // Sesame seeds on top bun
    const seedGeo = new THREE.SphereGeometry(0.04, 8, 8);
    const seedMat = new THREE.MeshStandardMaterial({ color: 0xffedd5, roughness: 0.5 });
    for (let i = 0; i < 22; i++) {
      const seed = new THREE.Mesh(seedGeo, seedMat);
      const phi = Math.random() * Math.PI * 0.35;
      const theta = Math.random() * Math.PI * 2;
      seed.position.x = 1.42 * Math.sin(phi) * Math.cos(theta);
      seed.position.y = 0.55 + 1.42 * Math.cos(phi);
      seed.position.z = 1.42 * Math.sin(phi) * Math.sin(theta);
      seed.scale.set(1, 0.4, 1.8);
      burgerGroup.add(seed);
    }

    // Tomato Slice
    const tomatoGeo = new THREE.CylinderGeometry(1.3, 1.3, 0.16, 32);
    const tomatoMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.2, metalness: 0.1 });
    const tomato = new THREE.Mesh(tomatoGeo, tomatoMat);
    tomato.position.y = 0.42;
    burgerGroup.add(tomato);

    // Cheese Slice (Tilted diamond square)
    const cheeseGeo = new THREE.BoxGeometry(2.0, 0.08, 2.0);
    const cheeseMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.3, metalness: 0.05 });
    const cheese = new THREE.Mesh(cheeseGeo, cheeseMat);
    cheese.position.y = 0.28;
    cheese.rotation.y = Math.PI / 4;
    burgerGroup.add(cheese);

    // Grilled Patty
    const pattyGeo = new THREE.CylinderGeometry(1.42, 1.42, 0.4, 32);
    const pattyMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.7, metalness: 0.1 });
    const patty = new THREE.Mesh(pattyGeo, pattyMat);
    patty.position.y = 0.05;
    burgerGroup.add(patty);

    // Crisp Green Lettuce (Torus wave)
    const lettuceGeo = new THREE.TorusGeometry(1.35, 0.18, 16, 32);
    const lettuceMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.5 });
    const lettuce = new THREE.Mesh(lettuceGeo, lettuceMat);
    lettuce.rotation.x = Math.PI / 2;
    lettuce.position.y = -0.16;
    burgerGroup.add(lettuce);

    // Bottom Bun
    const botBunGeo = new THREE.CylinderGeometry(1.35, 1.25, 0.4, 32);
    const botBunMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.4 });
    const botBun = new THREE.Mesh(botBunGeo, botBunMat);
    botBun.position.y = -0.42;
    burgerGroup.add(botBun);

    masterGroup.add(burgerGroup);

    // ==========================================
    // MODEL 2: 3D STEAMING CAMPUS CHAI / COFFEE
    // ==========================================
    const coffeeGroup = new THREE.Group();
    coffeeGroupRef.current = coffeeGroup;
    coffeeGroup.visible = false;

    // Ceramic Mug
    const mugGeo = new THREE.CylinderGeometry(1.15, 0.95, 2.0, 32);
    const mugMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.2,
      metalness: 0.3,
    });
    const mug = new THREE.Mesh(mugGeo, mugMat);
    coffeeGroup.add(mug);

    // Mug Rim accent (Golden)
    const rimGeo = new THREE.TorusGeometry(1.15, 0.06, 16, 32);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.2 });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 1.0;
    coffeeGroup.add(rim);

    // Coffee Liquid Surface
    const liquidGeo = new THREE.CylinderGeometry(1.1, 1.1, 0.05, 32);
    const liquidMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.1, metalness: 0.2 });
    const liquid = new THREE.Mesh(liquidGeo, liquidMat);
    liquid.position.y = 0.85;
    coffeeGroup.add(liquid);

    // Mug Handle
    const handleGeo = new THREE.TorusGeometry(0.55, 0.1, 16, 32, Math.PI * 1.2);
    const handle = new THREE.Mesh(handleGeo, mugMat);
    handle.position.set(1.1, 0, 0);
    handle.rotation.z = -Math.PI / 8;
    coffeeGroup.add(handle);

    // Saucer Base Plate
    const saucerGeo = new THREE.CylinderGeometry(1.8, 1.4, 0.15, 32);
    const saucerMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.4 });
    const saucer = new THREE.Mesh(saucerGeo, saucerMat);
    saucer.position.y = -1.05;
    coffeeGroup.add(saucer);

    masterGroup.add(coffeeGroup);

    // ==========================================
    // MODEL 3: 3D GOLDEN SMART CANTEEN TOKEN
    // ==========================================
    const tokenGroup = new THREE.Group();
    tokenGroupRef.current = tokenGroup;
    tokenGroup.visible = false;

    // Heavy Golden Coin
    const coinGeo = new THREE.CylinderGeometry(1.6, 1.6, 0.25, 48);
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.92,
      roughness: 0.18,
    });
    const coin = new THREE.Mesh(coinGeo, goldMat);
    coin.rotation.x = Math.PI / 2;
    tokenGroup.add(coin);

    // Coin Outer Ring
    const coinRimGeo = new THREE.TorusGeometry(1.6, 0.08, 16, 48);
    const coinRimMat = new THREE.MeshStandardMaterial({ color: 0xfcd34d, metalness: 0.95, roughness: 0.1 });
    const coinRim = new THREE.Mesh(coinRimGeo, coinRimMat);
    tokenGroup.add(coinRim);

    // Orbiting Neon Ring 1
    const ring1Geo = new THREE.TorusGeometry(2.3, 0.025, 16, 64);
    const ring1Mat = new THREE.MeshStandardMaterial({ color: 0xa855f7, emissive: 0xa855f7, emissiveIntensity: 0.8 });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    tokenGroup.add(ring1);

    // Orbiting Neon Ring 2
    const ring2Geo = new THREE.TorusGeometry(2.6, 0.02, 16, 64);
    const ring2Mat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 0.8 });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = Math.PI / 3;
    tokenGroup.add(ring2);

    masterGroup.add(tokenGroup);

    // ==========================================
    // FLOATING 3D GOLDEN DUST PARTICLES
    // ==========================================
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 12;
      positions[i + 1] = (Math.random() - 0.5) * 12;
      positions[i + 2] = (Math.random() - 0.5) * 8;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xfcd34d,
      size: 0.06,
      transparent: true,
      opacity: 0.7,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // ==========================================
    // INTERACTION & ANIMATION LOOP
    // ==========================================
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseX = x * 0.45;
      mouseY = y * 0.35;

      if (isDragging) {
        const deltaX = e.clientX - prevMousePos.x;
        const deltaY = e.clientY - prevMousePos.y;
        masterGroup.rotation.y += deltaX * 0.01;
        masterGroup.rotation.x += deltaY * 0.01;
        prevMousePos = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseDown = (e) => {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    // Touch support for phones
    const handleTouchMove = (e) => {
      if (e.touches.length > 0 && isDragging) {
        const touch = e.touches[0];
        const deltaX = touch.clientX - prevMousePos.x;
        const deltaY = touch.clientY - prevMousePos.y;
        masterGroup.rotation.y += deltaX * 0.015;
        masterGroup.rotation.x += deltaY * 0.015;
        prevMousePos = { x: touch.clientX, y: touch.clientY };
      }
    };

    const handleTouchStart = (e) => {
      if (e.touches.length > 0) {
        isDragging = true;
        prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleMouseUp);

    // Responsive Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse follow
      if (!isDragging) {
        targetX += (mouseX - targetX) * 0.05;
        targetY += (mouseY - targetY) * 0.05;
        masterGroup.rotation.y += 0.008; // Idle continuous rotation
        masterGroup.rotation.x = targetY;
      }

      // Gentle floating levitation
      masterGroup.position.y = Math.sin(elapsedTime * 1.8) * 0.15;

      // Orbiting Token Rings rotation
      ring1.rotation.z = elapsedTime * 0.8;
      ring1.rotation.y = elapsedTime * 0.5;
      ring2.rotation.z = -elapsedTime * 0.6;
      ring2.rotation.x = elapsedTime * 0.7;

      // Subtle particle float
      particles.rotation.y = elapsedTime * 0.03;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleMouseUp);

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Switch between 3D Models
  const switchModel = (modelType) => {
    setActiveModel(modelType);
    if (burgerGroupRef.current) burgerGroupRef.current.visible = modelType === 'burger';
    if (coffeeGroupRef.current) coffeeGroupRef.current.visible = modelType === 'coffee';
    if (tokenGroupRef.current) tokenGroupRef.current.visible = modelType === 'token';
  };

  return (
    <div className="relative w-full h-[380px] sm:h-[460px] lg:h-[520px] flex items-center justify-center select-none">
      {/* 3D Canvas Canvas Mount Container */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing flex items-center justify-center relative"
        title="Click & Drag to rotate 3D model!"
      />

      {/* Model Selector Interactive Floating Pills (Top/Bottom) */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 p-1 rounded-2xl bg-[#090E1D]/90 border border-amber-500/30 backdrop-blur-xl shadow-xl z-20">
        <button
          type="button"
          onClick={() => switchModel('burger')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeModel === 'burger'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-md font-extrabold scale-105'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <span>🍔</span>
          <span>Burger</span>
        </button>

        <button
          type="button"
          onClick={() => switchModel('coffee')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeModel === 'coffee'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-md font-extrabold scale-105'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <span>☕</span>
          <span>Chai</span>
        </button>

        <button
          type="button"
          onClick={() => switchModel('token')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeModel === 'token'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-md font-extrabold scale-105'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <span>🪙</span>
          <span>Token</span>
        </button>
      </div>

      {/* Hint Badge */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300/80 text-[10px] font-mono tracking-wider pointer-events-none flex items-center gap-1.5 backdrop-blur-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
        <span>Interactive 3D Stage &bull; Drag to Rotate</span>
      </div>
    </div>
  );
};

export default Canteen3DScene;
