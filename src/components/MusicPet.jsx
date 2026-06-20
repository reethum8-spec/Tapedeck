import React, { useEffect, useState, useRef } from 'react';
import { motion, useSpring, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { useTape } from '../context/TapeContext';
import { useAuth } from '../context/AuthContext';
import { playMeow, playPurr } from '../utils/sfx';
import { Settings2, Volume2, VolumeX, Eye, EyeOff, Pause, Play, Moon } from 'lucide-react';

// ---------------------------------------------------------
// CAT SPRITE COMPONENT
// ---------------------------------------------------------
// ---------------------------------------------------------
// PET SPRITE COMPONENT
// ---------------------------------------------------------
const PetSprite = ({ actionState, dirX, companionType = 'cat' }) => {
  // Animation variants for the limbs
  const bodyVariants = {
    idle: { y: 0, rotate: 0 },
    walk: { y: [0, -2, 0], transition: { repeat: Infinity, duration: 0.4 } },
    run: { y: [0, -4, 0], rotate: [0, -5, 0], transition: { repeat: Infinity, duration: 0.2 } },
    sit: { y: 4, rotate: -15, transition: { duration: 0.5 } },
    sleep: { y: 8, rotate: -20, scaleY: 0.8, transition: { duration: 1 } },
    dance: { y: [0, -4, 0], rotate: [-3, 3, -3], transition: { repeat: Infinity, duration: 0.6 } },
    bob: { y: [0, -2, 0], transition: { repeat: Infinity, duration: 0.8 } },
    'paw-tap': { y: 0 },
  };

  const headVariants = {
    idle: { y: 0, rotate: 0 },
    walk: { y: [0, 1, 0], transition: { repeat: Infinity, duration: 0.4 } },
    run: { y: [0, 2, 0], rotate: [0, 5, 0], transition: { repeat: Infinity, duration: 0.2 } },
    sit: { y: 2, rotate: 10, transition: { duration: 0.5 } },
    sleep: { y: 6, rotate: 20, transition: { duration: 1 } },
    dance: { y: [0, -2, 0], rotate: [-5, 5, -5], transition: { repeat: Infinity, duration: 0.6 } },
    bob: { y: [0, 1, 0], rotate: [0, 2, 0], transition: { repeat: Infinity, duration: 0.8 } },
    'paw-tap': { y: 0 },
  };

  const tailVariants = {
    idle: { rotate: [0, 15, 0], transition: { repeat: Infinity, duration: 2 } },
    walk: { rotate: [0, 30, 0], transition: { repeat: Infinity, duration: 0.4 } },
    run: { rotate: 45 },
    sit: { rotate: 80, transition: { duration: 0.5 } },
    sleep: { rotate: 100, transition: { duration: 1 } },
    dance: { rotate: [-10, 10, -10], transition: { repeat: Infinity, duration: 0.6 } },
    bob: { rotate: [0, 5, 0], transition: { repeat: Infinity, duration: 0.8 } },
    'paw-tap': { rotate: [0, -10, 0], transition: { duration: 0.2 } },
  };

  const legFront1Variants = {
    idle: { rotate: 0, y: 0 },
    walk: { rotate: [-20, 20, -20], transition: { repeat: Infinity, duration: 0.4 } },
    run: { rotate: [-40, 40, -40], y: [0, -2, 0], transition: { repeat: Infinity, duration: 0.2 } },
    sit: { rotate: -15, y: -2 },
    sleep: { rotate: -90, y: -4 },
    dance: { rotate: [-5, 5, -5], y: [0, -2, 0], transition: { repeat: Infinity, duration: 0.6 } },
    bob: { rotate: 0, y: 0 },
    'paw-tap': { rotate: [-30, 0], y: [-5, 0], transition: { duration: 0.2 } },
  };

  const legFront2Variants = {
    idle: { rotate: 0, y: 0 },
    walk: { rotate: [20, -20, 20], transition: { repeat: Infinity, duration: 0.4 } },
    run: { rotate: [40, -40, 40], y: [0, -2, 0], transition: { repeat: Infinity, duration: 0.2 } },
    sit: { rotate: -15, y: -2 },
    sleep: { rotate: -90, y: -4 },
    dance: { rotate: [-5, 5, -5], y: [0, -2, 0], transition: { repeat: Infinity, duration: 0.6 } },
    bob: { rotate: 0, y: 0 },
    'paw-tap': { rotate: [0], y: [0] },
  };

  const legBack1Variants = {
    idle: { rotate: 0, y: 0 },
    walk: { rotate: [20, -20, 20], transition: { repeat: Infinity, duration: 0.4 } },
    run: { rotate: [40, -40, 40], y: [0, -2, 0], transition: { repeat: Infinity, duration: 0.2 } },
    sit: { rotate: 90, y: -4, x: -2 },
    sleep: { rotate: 90, y: -4, x: -2 },
    dance: { rotate: [-5, 5, -5], y: [0, -2, 0], transition: { repeat: Infinity, duration: 0.6 } },
    bob: { rotate: 0, y: 0 },
    'paw-tap': { rotate: 0, y: 0 },
  };

  const legBack2Variants = {
    idle: { rotate: 0, y: 0 },
    walk: { rotate: [-20, 20, -20], transition: { repeat: Infinity, duration: 0.4 } },
    run: { rotate: [-40, 40, -40], y: [0, -2, 0], transition: { repeat: Infinity, duration: 0.2 } },
    sit: { rotate: 90, y: -4, x: -2 },
    sleep: { rotate: 90, y: -4, x: -2 },
    dance: { rotate: [-5, 5, -5], y: [0, -2, 0], transition: { repeat: Infinity, duration: 0.6 } },
    bob: { rotate: 0, y: 0 },
    'paw-tap': { rotate: 0, y: 0 },
  };

  const isSleeping = actionState === 'sleep';

  const renderCat = () => (
    <motion.div className="absolute bottom-0 w-full h-full" animate={actionState} variants={bodyVariants}>
      {/* Tail */}
      <motion.div className="absolute left-[-2px] bottom-[8px] w-2 h-6 bg-pink-200 rounded-full origin-bottom" animate={actionState} variants={tailVariants} />
      {/* Back Legs */}
      <motion.div className="absolute left-[4px] bottom-[-4px] w-1.5 h-4 bg-pink-300 rounded-b-full origin-top" animate={actionState} variants={legBack2Variants} />
      <motion.div className="absolute left-[10px] bottom-[-4px] w-1.5 h-4 bg-pink-200 rounded-b-full origin-top" animate={actionState} variants={legBack1Variants} />
      {/* Body */}
      <div className="absolute left-[4px] bottom-[4px] w-7 h-5 bg-pink-200 rounded-lg shadow-sm" />
      {/* Front Legs */}
      <motion.div className="absolute right-[14px] bottom-[-4px] w-1.5 h-4 bg-pink-300 rounded-b-full origin-top" animate={actionState} variants={legFront2Variants} />
      <motion.div className="absolute right-[8px] bottom-[-4px] w-1.5 h-4 bg-pink-200 rounded-b-full origin-top" animate={actionState} variants={legFront1Variants} />
      {/* Head */}
      <motion.div className="absolute right-[-4px] bottom-[8px] w-6 h-5 bg-pink-200 rounded-md z-10" animate={actionState} variants={headVariants}>
        <div className="absolute -top-1 left-0.5 w-2 h-2 bg-pink-300 rounded-t-sm rotate-[-15deg]" />
        <div className="absolute -top-1 right-0.5 w-2 h-2 bg-pink-300 rounded-t-sm rotate-[15deg]" />
        {isSleeping ? (
          <>
            <div className="absolute top-2 right-1.5 w-1 h-0.5 bg-gray-800 rounded-full" />
            <div className="absolute top-2 right-3.5 w-1 h-0.5 bg-gray-800 rounded-full" />
          </>
        ) : (
          <>
            <div className="absolute top-2 right-1 w-1 h-1 bg-gray-800 rounded-full" />
            <div className="absolute top-2 right-3 w-1 h-1 bg-gray-800 rounded-full" />
          </>
        )}
        <div className="absolute top-3 right-2 w-0.5 h-0.5 bg-pink-400 rounded-full" />
      </motion.div>
    </motion.div>
  );

  const bunnyBodyVariants = {
    ...bodyVariants,
    walk: { y: [0, -8, 0], rotate: [0, 2, 0], transition: { repeat: Infinity, duration: 0.5, ease: "easeInOut" } },
    run: { y: [0, -12, 0], rotate: [0, 5, 0], transition: { repeat: Infinity, duration: 0.3, ease: "easeInOut" } },
  };

  const renderBunny = () => (
    <motion.div className="absolute bottom-0 w-full h-full" animate={actionState} variants={bunnyBodyVariants}>
      {/* Tail (Fluffy ball) */}
      <motion.div className="absolute left-[-2px] bottom-[4px] w-3 h-3 bg-white rounded-full border border-gray-200" animate={actionState} variants={tailVariants} />
      {/* Back Legs */}
      <motion.div className="absolute left-[4px] bottom-[-4px] w-2 h-3 bg-gray-200 rounded-b-full origin-top" animate={actionState} variants={legBack2Variants} />
      <motion.div className="absolute left-[10px] bottom-[-4px] w-2 h-3 bg-white rounded-b-full origin-top" animate={actionState} variants={legBack1Variants} />
      {/* Body */}
      <div className="absolute left-[4px] bottom-[4px] w-6 h-5 bg-white rounded-lg shadow-sm border border-gray-100" />
      {/* Front Legs */}
      <motion.div className="absolute right-[14px] bottom-[-4px] w-1.5 h-3 bg-gray-200 rounded-b-full origin-top" animate={actionState} variants={legFront2Variants} />
      <motion.div className="absolute right-[8px] bottom-[-4px] w-1.5 h-3 bg-white rounded-b-full origin-top" animate={actionState} variants={legFront1Variants} />
      {/* Head */}
      <motion.div className="absolute right-[-4px] bottom-[8px] w-6 h-5 bg-white rounded-md z-10 border border-gray-100" animate={actionState} variants={headVariants}>
        <div className="absolute -top-4 left-0.5 w-1.5 h-5 bg-white border border-gray-200 rounded-t-full rotate-[-10deg]" />
        <div className="absolute -top-4 right-0.5 w-1.5 h-5 bg-white border border-gray-200 rounded-t-full rotate-[10deg]" />
        {isSleeping ? (
          <>
            <div className="absolute top-2 right-1.5 w-1 h-0.5 bg-gray-800 rounded-full" />
            <div className="absolute top-2 right-3.5 w-1 h-0.5 bg-gray-800 rounded-full" />
          </>
        ) : (
          <>
            <div className="absolute top-2 right-1 w-1 h-1 bg-red-400 rounded-full" />
            <div className="absolute top-2 right-3 w-1 h-1 bg-red-400 rounded-full" />
          </>
        )}
        <div className="absolute top-3 right-2 w-1 h-0.5 bg-pink-300 rounded-full" />
      </motion.div>
    </motion.div>
  );

  const renderBuddy = () => (
    <motion.div className="absolute bottom-0 w-full h-full" animate={actionState} variants={bodyVariants}>
      {/* Hover Blob Body */}
      <div className="absolute left-[4px] bottom-[4px] w-7 h-6 bg-brand-accent rounded-t-xl rounded-b-md shadow-[0_0_10px_rgba(93,202,165,0.5)]" />
      {/* Head/Visor */}
      <motion.div className="absolute right-[-2px] bottom-[10px] w-5 h-4 bg-[#2f755e] rounded-md z-10" animate={actionState} variants={headVariants}>
        {/* Visor Screen */}
        <div className="absolute top-0.5 left-0.5 right-0.5 bottom-0.5 bg-[#111] rounded-sm overflow-hidden">
          {isSleeping ? (
            <div className="absolute top-1.5 left-1 w-3 h-0.5 bg-brand-accent rounded-full opacity-50" />
          ) : (
            <div className="absolute top-1 left-0.5 w-4 h-2 bg-brand-accent opacity-80 rounded-sm flex justify-around items-center px-0.5">
              <div className="w-1 h-1 bg-white rounded-full" />
              <div className="w-1 h-1 bg-white rounded-full" />
            </div>
          )}
        </div>
      </motion.div>
      {/* Hover Thrusters / Jets instead of legs */}
      <motion.div className="absolute left-[8px] bottom-0 w-1.5 h-2 bg-yellow-400 rounded-b-full opacity-70" animate={{ height: [4, 8, 4], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 0.3 }} />
      <motion.div className="absolute right-[8px] bottom-0 w-1.5 h-2 bg-yellow-400 rounded-b-full opacity-70" animate={{ height: [6, 10, 6], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 0.3, delay: 0.1 }} />
    </motion.div>
  );

  return (
    <motion.div 
      className="relative w-8 h-8"
      initial={false}
      animate={{ scaleX: dirX }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <AnimatePresence>
        {isSleeping && (
          <motion.div
            initial={{ opacity: 0, y: 0, x: 0 }}
            animate={{ opacity: [0, 1, 0], y: -30, x: [0, 10, 0] }}
            exit={{ opacity: 0 }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute -top-4 right-0 font-pixel text-xs text-brand-accent drop-shadow"
          >
            Z
          </motion.div>
        )}
      </AnimatePresence>
      
      {companionType === 'cat' && renderCat()}
      {companionType === 'bunny' && renderBunny()}
      {companionType === 'buddy' && renderBuddy()}
    </motion.div>
  );
};


// ---------------------------------------------------------
// MAIN MUSIC PET CONTAINER
// ---------------------------------------------------------
export const MusicPet = () => {
  const { isPlaying } = useTape();
  const { user } = useAuth();
  const companionType = user?.companion || 'cat';
  
  // Settings
  const [isVisible, setIsVisible] = useState(true);
  const [isSfxEnabled, setIsSfxEnabled] = useState(user?.companionSettings?.sfxEnabled ?? true);
  const [isPaused, setIsPaused] = useState(false);
  const [isRestMode, setIsRestMode] = useState(false);
  const [speedVal, setSpeedVal] = useState(user?.companionSettings?.animationSpeed ?? 50);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    if (user?.companionSettings) {
      setIsSfxEnabled(user.companionSettings.sfxEnabled ?? true);
      setSpeedVal(user.companionSettings.animationSpeed ?? 50);
    }
  }, [user?.companionSettings]);

  // Pet State
  const [actionState, setActionState] = useState('idle'); // idle, walk, run, sit, sleep, dance, bob, paw-tap
  const [dirX, setDirX] = useState(1); // 1 = right, -1 = left

  // Position
  const posX = useMotionValue(window.innerWidth / 2);
  const posY = useMotionValue(window.innerHeight / 2);
  
  const smoothX = useSpring(posX, { stiffness: speedVal, damping: 20 });
  const smoothY = useSpring(posY, { stiffness: speedVal, damping: 20 });

  const targetPosRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const lastActiveRef = useRef(Date.now());
  const isClickingRef = useRef(false);

  // Global mouse tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      targetPosRef.current = { x: e.clientX, y: e.clientY };
      lastActiveRef.current = Date.now();
    };
    const handleMouseDown = () => {
      isClickingRef.current = true;
      lastActiveRef.current = Date.now();
      if (isSfxEnabled && !isRestMode && Math.random() > 0.5) playMeow(isSfxEnabled);
    };
    const handleMouseUp = () => {
      isClickingRef.current = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isSfxEnabled, isRestMode]);

  // Main Logic Loop
  useEffect(() => {
    let animationFrameId;
    let purrTimer = null;

    const loop = () => {
      if (!isVisible || isPaused) {
        animationFrameId = requestAnimationFrame(loop);
        return;
      }

      const now = Date.now();
      const timeSinceActive = now - lastActiveRef.current;
      
      let nextState = 'idle';
      const curX = smoothX.get();
      const curY = smoothY.get();

      if (isRestMode) {
        nextState = 'sleep';
        // If in rest mode, stay where we are but slowly fall to bottom if not already? Or just sleep where clicked.
      } else if (isClickingRef.current) {
        nextState = 'paw-tap';
      } else if (timeSinceActive > 10000) {
        // Inactive for 10s
        nextState = timeSinceActive > 12000 ? 'sleep' : 'sit';
        
        // Maybe jump to cassette player if it exists
        const playerEl = document.getElementById('cassette-slot'); // Added to Player.jsx
        if (playerEl) {
          const rect = playerEl.getBoundingClientRect();
          posX.set(rect.left + rect.width / 2);
          posY.set(rect.top - 20); // Sit on top of it
        }

      } else {
        // Active tracking
        const target = targetPosRef.current;
        // Offset pet slightly from cursor
        const destX = target.x + 20;
        const destY = target.y + 20;

        posX.set(destX);
        posY.set(destY);

        const dx = destX - curX;
        const dy = destY - curY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 100) {
          nextState = 'run';
        } else if (dist > 10) {
          nextState = 'walk';
        } else {
          // Close to target, check music
          if (isPlaying) {
            nextState = Math.random() > 0.5 ? 'dance' : 'bob';
          } else {
            nextState = 'idle';
          }
        }

        // Update direction
        if (dx > 5) setDirX(1);
        else if (dx < -5) setDirX(-1);
      }

      setActionState(prevState => {
        // Trigger purr when transitioning to sleep
        if (nextState === 'sleep' && prevState !== 'sleep' && isSfxEnabled) {
          playPurr(isSfxEnabled);
        }
        return nextState;
      });

      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => cancelAnimationFrame(animationFrameId);
  }, [isVisible, isPaused, isRestMode, isPlaying, smoothX, smoothY, posX, posY, isSfxEnabled]);

  if (!isVisible) return (
    <motion.button 
      drag
      dragMomentum={false}
      onClick={() => setIsVisible(true)}
      className="fixed bottom-4 right-4 z-[10000] px-4 py-2 bg-black border border-brand-accent/50 rounded-full text-brand-accent hover:bg-brand-accent/10 font-pixel text-[10px] flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(93,202,165,0.2)]"
    >
      <span>CALL PET</span>
      <span className="text-sm">🐱</span>
    </motion.button>
  );

  return (
    <>
      {/* The Pet */}
      <motion.div
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          x: smoothX,
          y: smoothY,
          zIndex: 9998,
          pointerEvents: 'none',
        }}
      >
        <div className="absolute -translate-x-1/2 -translate-y-full pointer-events-auto cursor-pointer" onClick={() => {
            if (!isRestMode) playMeow(isSfxEnabled);
            setShowPanel(true);
        }}>
          <PetSprite actionState={actionState} dirX={dirX} companionType={companionType} />
        </div>
      </motion.div>

      {/* Control Panel */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            drag
            dragMomentum={false}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 right-4 z-[9999] bg-black border border-brand-accent/30 p-4 rounded-xl shadow-2xl w-64 backdrop-blur-md cursor-move"
          >
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#333]">
              <span className="font-pixel text-[10px] text-brand-accent pointer-events-none">PET CONTROL (DRAG)</span>
              <button onClick={() => setShowPanel(false)} className="text-gray-500 hover:text-white cursor-pointer">✕</button>
            </div>

            <div className="space-y-4 font-mono text-xs text-gray-300">
              <div className="flex justify-between items-center">
                <span>FOLLOW MOUSE</span>
                <button 
                  onClick={() => setIsPaused(!isPaused)}
                  className={`p-1.5 rounded ${isPaused ? 'bg-red-500/20 text-red-400' : 'bg-brand-accent/20 text-brand-accent'}`}
                >
                  {isPaused ? <Play size={14} /> : <Pause size={14} />}
                </button>
              </div>

              <div className="flex justify-between items-center">
                <span>REST MODE</span>
                <button 
                  onClick={() => setIsRestMode(!isRestMode)}
                  className={`p-1.5 rounded ${isRestMode ? 'bg-brand-accent/20 text-brand-accent' : 'bg-[#222] text-gray-500'}`}
                >
                  <Moon size={14} />
                </button>
              </div>

              <div className="flex justify-between items-center">
                <span>SFX (8-BIT)</span>
                <button 
                  onClick={() => setIsSfxEnabled(!isSfxEnabled)}
                  className={`p-1.5 rounded ${isSfxEnabled ? 'bg-brand-accent/20 text-brand-accent' : 'bg-[#222] text-gray-500'}`}
                >
                  {isSfxEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                </button>
              </div>

              <div className="flex justify-between items-center">
                <span>HIDE PET</span>
                <button 
                  onClick={() => { setIsVisible(false); setShowPanel(false); }}
                  className="p-1.5 rounded bg-[#222] text-gray-500 hover:bg-brand-accent/20 hover:text-brand-accent"
                >
                  <EyeOff size={14} />
                </button>
              </div>

              <div className="pt-2">
                <div className="flex justify-between mb-1">
                  <span>SPEED</span>
                  <span>{speedVal}</span>
                </div>
                <input 
                  type="range" 
                  min="10" max="200" 
                  value={speedVal} 
                  onChange={(e) => setSpeedVal(Number(e.target.value))}
                  className="w-full accent-brand-accent"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Settings Button when panel is hidden */}
      {!showPanel && (
        <button 
          onClick={() => setShowPanel(true)}
          className="fixed bottom-4 right-4 z-[9999] p-3 bg-black border border-[#333] rounded-full text-gray-500 hover:text-brand-accent hover:border-brand-accent/50 transition-colors shadow-lg"
          title="Pet Controls"
        >
          <Settings2 size={16} />
        </button>
      )}
    </>
  );
};
