import React, { useRef } from 'react';
import { motion, useAnimationFrame, useMotionValue } from 'framer-motion';
import { useTape } from '../context/TapeContext';

export const BackgroundVinyl = () => {
  const { isPlaying, currentTape, currentTrackIndex, currentSide, nowPlayingVisible } = useTape();
  const rotation = useMotionValue(0);
  const velocity = useRef(0);

  // Get current track for album art
  const currentTracks = currentTape ? (currentSide === 'A' ? currentTape.sideA : currentTape.sideB) : [];
  const currentTrack = nowPlayingVisible ? currentTracks[currentTrackIndex] : null;

  useAnimationFrame((t, delta) => {
    // Target velocity: ~24 degrees per second (360 / 15s) when playing, 0 when stopped
    const targetVelocity = isPlaying ? 24 : 0;
    
    // Smoothly interpolate current velocity towards target velocity
    const acceleration = isPlaying ? 0.05 : 0.02;
    velocity.current += (targetVelocity - velocity.current) * acceleration;

    // Apply velocity to rotation
    rotation.set(rotation.get() + (velocity.current * (delta / 1000)));
  });

  return (
    <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-[-1]">
      {/* Vinyl Record */}
      <motion.div
        className="absolute -right-32 -bottom-48 w-[800px] h-[800px] md:w-[1000px] md:h-[1000px] opacity-[0.08]"
        style={{
          rotate: rotation,
          borderRadius: '50%',
          background: 'radial-gradient(circle, #111 20%, #000 25%, #1a1a1a 30%, #000 40%, #111 50%, #000 60%, #1a1a1a 70%, #000 80%, #111 90%, #000 100%)',
          boxShadow: 'inset 0 0 100px rgba(93, 202, 165, 0.2), 0 0 50px rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        {/* Vinyl Center Label */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] rounded-full bg-brand-accent/20 border border-brand-accent/10 flex items-center justify-center overflow-hidden">
          {currentTrack && currentTrack.albumArt && (
            <img 
              src={currentTrack.albumArt} 
              alt="Album Art" 
              className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity opacity-40" 
            />
          )}
          <div className="absolute inset-0 bg-brand-accent/20 mix-blend-color" />
          <div className="w-[30px] h-[30px] rounded-full bg-black border-2 border-[#222] shadow-inner relative z-10" />
        </div>

        {/* Soft Neon Reflection */}
        <div className="absolute top-0 left-1/4 w-1/2 h-full bg-gradient-to-r from-transparent via-brand-accent/10 to-transparent transform -skew-x-12 opacity-50 pointer-events-none mix-blend-screen" />
        <div className="absolute top-1/4 left-0 w-full h-1/2 bg-gradient-to-b from-transparent via-white/5 to-transparent transform -skew-y-12 opacity-30 pointer-events-none mix-blend-screen" />
      </motion.div>

      {/* Subtle Dust Particles */}
      {[...Array(15)].map((_, i) => {
        const size = Math.random() * 3 + 1;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white opacity-10"
            style={{
              width: size,
              height: size,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100 - Math.random() * 100],
              x: [0, (Math.random() - 0.5) * 50],
              opacity: [0, 0.2, 0],
            }}
            transition={{
              duration: 10 + Math.random() * 15,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * -20, // Start at different times
            }}
          />
        );
      })}
    </div>
  );
};
