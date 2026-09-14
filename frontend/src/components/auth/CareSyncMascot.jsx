import React, { useEffect, useState, useRef } from 'react';

/**
 * CareSyncMascot
 * Interactive 3D/SVG Cyber-Clinical Mascot that tracks mouse coordinates,
 * reacts to form inputs (email, password, show password, submit hover),
 * and features gentle idle floating animations with dynamic ground shadow.
 */
const CareSyncMascot = ({
  focusedField = null, // 'email' | 'password' | null
  showPassword = false,
  isHoveringSubmit = false,
  isLoading = false,
}) => {
  const containerRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [targetEye, setTargetEye] = useState({ x: 0, y: 0 });
  const [currentEye, setCurrentEye] = useState({ x: 0, y: 0 });

  // Track mouse coordinates across the window
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Normalized coordinates between -1 and 1
      const rawX = (e.clientX - centerX) / (window.innerWidth / 2);
      const rawY = (e.clientY - centerY) / (window.innerHeight / 2);

      const clampedX = Math.max(-1, Math.min(1, rawX));
      const clampedY = Math.max(-1, Math.min(1, rawY));

      setMousePos({ x: clampedX, y: clampedY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Compute eye/head target based on focused field or mouse position
  useEffect(() => {
    if (focusedField === 'email') {
      // Look down-right towards the email input box
      setTargetEye({ x: 0.7, y: 0.5 });
    } else if (focusedField === 'password') {
      // Look down-right towards password box, or shy down
      setTargetEye({ x: 0.4, y: 0.6 });
    } else if (isHoveringSubmit) {
      // Look forward eagerly
      setTargetEye({ x: 0.2, y: 0.2 });
    } else {
      // Follow mouse
      setTargetEye({ x: mousePos.x, y: mousePos.y });
    }
  }, [focusedField, isHoveringSubmit, mousePos]);

  // Smooth interpolation for eye movement (lerp)
  useEffect(() => {
    let animationFrame;
    const animate = () => {
      setCurrentEye((prev) => ({
        x: prev.x + (targetEye.x - prev.x) * 0.12,
        y: prev.y + (targetEye.y - prev.y) * 0.12,
      }));
      animationFrame = requestAnimationFrame(animate);
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [targetEye]);

  // Derived 3D rotation angles
  const rotY = currentEye.x * 16; // -16deg to +16deg
  const rotX = -currentEye.y * 12; // -12deg to +12deg
  const eyeShiftX = currentEye.x * 10; // -10px to +10px
  const eyeShiftY = currentEye.y * 8; // -8px to +8px

  // Expression states
  const isPrivacyMode = focusedField === 'password' && !showPassword;
  const isPeeking = focusedField === 'password' && showPassword;

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col items-center justify-center select-none py-6"
      style={{ perspective: '1000px' }}
    >
      {/* Floating Mascot Container */}
      <div
        className="relative transition-transform duration-75 ease-out"
        style={{
          transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Soft Ambient Radial Halo behind Bot */}
        <div className="absolute -inset-10 bg-gradient-to-tr from-sky-500/20 via-teal-400/15 to-transparent rounded-full blur-2xl pointer-events-none animate-pulse"></div>

        {/* Mascot SVG Character */}
        <svg
          width="240"
          height="240"
          viewBox="0 0 240 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.5)] animate-float"
        >
          <defs>
            {/* Outer Helmet Gradient */}
            <linearGradient id="helmetGrad" x1="40" y1="30" x2="200" y2="190" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="60%" stopColor="#f1f5f9" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>

            {/* Glowing Visor Gradient */}
            <linearGradient id="visorGrad" x1="60" y1="50" x2="180" y2="150" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#080e1a" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>

            {/* Medical Cyan Glow */}
            <linearGradient id="cyanEyeGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0ea5e9" />
            </linearGradient>

            {/* Active Clinical Scan Wave */}
            <linearGradient id="scanGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>

            {/* Filter for glowing elements */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* ================= ANTENNA ================= */}
          <g
            style={{
              transform: `rotate(${currentEye.x * 6}deg)`,
              transformOrigin: '55px 55px',
              transition: 'transform 0.2s ease-out',
            }}
          >
            {/* Antenna Stem */}
            <path
              d="M 52 50 L 40 32 L 48 24 L 32 10"
              stroke="#ffffff"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Antenna Tip Glow Ball */}
            <circle
              cx="32"
              cy="10"
              r="6.5"
              fill={isLoading ? '#38bdf8' : '#ffffff'}
              className={isLoading ? 'animate-ping' : ''}
              filter="url(#glow)"
            />
            {/* Inner Antenna Dot */}
            <circle cx="32" cy="10" r="3" fill="#38bdf8" />
          </g>

          {/* ================= EARS / SIDE MODULES ================= */}
          {/* Left Ear */}
          <rect
            x="14"
            y="76"
            width="14"
            height="44"
            rx="6"
            fill="url(#helmetGrad)"
            stroke="#ffffff"
            strokeWidth="3"
            filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
          />
          <line x1="21" y1="84" x2="21" y2="112" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />

          {/* Right Ear */}
          <rect
            x="212"
            y="76"
            width="14"
            height="44"
            rx="6"
            fill="url(#helmetGrad)"
            stroke="#ffffff"
            strokeWidth="3"
            filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
          />
          <line x1="219" y1="84" x2="219" y2="112" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />

          {/* ================= OUTER HELMET (OCTAGONAL) ================= */}
          <path
            d="
              M 80,44
              L 160,44
              Q 172,44 180,52
              L 204,78
              Q 210,84 210,94
              L 210,114
              Q 210,124 204,130
              L 180,156
              Q 172,164 160,164
              L 80,164
              Q 68,164 60,156
              L 36,130
              Q 30,124 30,114
              L 30,94
              Q 30,84 36,78
              L 60,52
              Q 68,44 80,44
              Z
            "
            fill="none"
            stroke="url(#helmetGrad)"
            strokeWidth="14"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Helmet Surface Body */}
          <path
            d="
              M 82,48
              L 158,48
              L 202,80
              L 202,118
              L 158,160
              L 82,160
              L 38,118
              L 38,80
              Z
            "
            fill="url(#visorGrad)"
          />

          {/* Inner Visor Shadow/Border Accent */}
          <path
            d="
              M 84,52
              L 156,52
              L 198,82
              L 198,116
              L 156,156
              L 84,156
              L 42,116
              L 42,82
              Z
            "
            fill="none"
            stroke="#1e293b"
            strokeWidth="2.5"
            strokeOpacity="0.8"
          />

          {/* Glass Visor Reflection Sheen */}
          <path
            d="M 68,54 L 140,54 L 60,135 L 50,110 Z"
            fill="white"
            fillOpacity="0.04"
          />

          {/* ================= INTERACTIVE FACE & VISOR ELEMENTS ================= */}
          <g
            style={{
              transform: `translate(${eyeShiftX}px, ${eyeShiftY}px)`,
              transition: 'transform 0.08s ease-out',
            }}
          >
            {/* Normal State Faceplate & Eye slit (from reference image) */}
            {!isPrivacyMode && !isPeeking && (
              <>
                {/* Left Faceplate / Mask Plate (Stylized white plate) */}
                <path
                  d="
                    M 68,80
                    L 104,80
                    Q 112,80 114,88
                    L 114,120
                    Q 112,128 104,130
                    L 76,130
                    Q 66,130 64,120
                    L 64,88
                    Q 64,80 68,80
                    Z
                  "
                  fill="#ffffff"
                  filter="drop-shadow(0 2px 6px rgba(0,0,0,0.4))"
                />

                {/* Left Eye Cutout inside Faceplate */}
                <path
                  d="M 76,96 L 98,96 Q 102,96 102,100 L 102,104 Q 102,108 98,108 L 76,108 Q 72,108 72,104 L 72,100 Q 72,96 76,96 Z"
                  fill={isHoveringSubmit ? '#38bdf8' : '#090e1a'}
                  className="transition-colors duration-200"
                />

                {/* Left Cheek Vent Accent */}
                <path d="M 80,118 L 96,118" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />

                {/* Right Eye: Glowing Stylized Slot / Dot */}
                <g filter="url(#glow)">
                  <rect
                    x="134"
                    y="96"
                    width={isHoveringSubmit ? '24' : '18'}
                    height="12"
                    rx="4"
                    fill={isHoveringSubmit ? '#38bdf8' : '#ffffff'}
                    className="transition-all duration-200"
                  />
                  {/* Glowing Cyan Iris core */}
                  <circle
                    cx={134 + (isHoveringSubmit ? 12 : 9) + eyeShiftX * 0.3}
                    cy={102 + eyeShiftY * 0.3}
                    r="3"
                    fill="#38bdf8"
                  />
                </g>
              </>
            )}

            {/* Privacy Mode (Password focused and hidden: cute closed eyes / shielded) */}
            {isPrivacyMode && (
              <>
                {/* Left Sleepy Curved Eyelid */}
                <path
                  d="M 72,104 Q 88,114 104,104"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  filter="url(#glow)"
                />
                {/* Right Sleepy Curved Eyelid */}
                <path
                  d="M 136,104 Q 152,114 168,104"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  filter="url(#glow)"
                />
                {/* Cute Privacy Shield Icon in Center */}
                <g filter="url(#glow)">
                  <path
                    d="M 120,86 L 126,89 L 126,98 Q 126,103 120,106 Q 114,103 114,98 L 114,89 Z"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2"
                  />
                  <line x1="120" y1="92" x2="120" y2="98" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
                </g>
              </>
            )}

            {/* Peeking Mode (Password visible: one eye peeking curiously!) */}
            {isPeeking && (
              <>
                {/* Left Eye: Big Curious Eye */}
                <g filter="url(#glow)">
                  <ellipse cx="88" cy="102" rx="14" ry="12" fill="#ffffff" />
                  <circle cx={88 + eyeShiftX * 0.4} cy={102 + eyeShiftY * 0.4} r="5" fill="#0284c7" />
                  <circle cx={88 + eyeShiftX * 0.4 + 2} cy={100 + eyeShiftY * 0.4} r="2" fill="#ffffff" />
                </g>
                {/* Right Eye: Curious Wink */}
                <path
                  d="M 136,104 Q 150,96 164,104"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="4"
                  strokeLinecap="round"
                  filter="url(#glow)"
                />
              </>
            )}

            {/* Active Loading Scanner Waveform (When submitting) */}
            {isLoading && (
              <g>
                <line x1="50" y1="104" x2="190" y2="104" stroke="url(#scanGrad)" strokeWidth="4" />
                <circle cx="120" cy="104" r="5" fill="#38bdf8" className="animate-ping" />
              </g>
            )}
          </g>

          {/* CareSync Small Medical Cross on forehead */}
          <g opacity="0.8">
            <rect x="117" y="58" width="6" height="14" rx="2" fill="#38bdf8" filter="url(#glow)" />
            <rect x="113" y="62" width="14" height="6" rx="2" fill="#38bdf8" filter="url(#glow)" />
          </g>
        </svg>
      </div>

      {/* Synchronized Ambient Floor Shadow */}
      <div
        className="w-36 h-5 rounded-full bg-black/70 blur-md mt-3 transition-all duration-300"
        style={{
          transform: `scaleX(${1 - Math.abs(currentEye.y) * 0.15}) scaleY(${1 - Math.abs(currentEye.x) * 0.1})`,
          opacity: 0.85,
        }}
      ></div>

      {/* Floating Status / Interactive Hint Badge */}
      <div className="mt-5 flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-[11px] text-slate-300 font-medium">
        <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
        <span>
          {isPrivacyMode
            ? 'Shield Mode: Password Protected'
            : isPeeking
            ? 'Visibility Enabled'
            : isLoading
            ? 'Authenticating Credentials...'
            : 'CareSync AI Assistant • Interactive'}
        </span>
      </div>
    </div>
  );
};

export default CareSyncMascot;
